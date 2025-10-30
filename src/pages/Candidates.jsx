import React, { createContext, useEffect, useState, useMemo } from 'react';
import NavigationBar from '../components/NavigationBar';
import { List, LayoutGrid, Users, UserPlus } from 'lucide-react';
import CandidateListForm from '../components/CandidateListForm';
import CandidateListView from '../components/CandidateListView';
import CandidateKanbanForm from '../components/CandidateKanbanForm';
import CandidateKanbanView from '../components/CandidateKanbanView';
import { Outlet, useOutlet } from 'react-router-dom';

import '../styles/candidates.css';
import { api } from '../api';
import CandidateStatCard from '../components/CandidateStatCard';

export const CandidateContext = createContext(null);

export default function Candidates() {
    const [isList, setIsList] = useState(true);
    const [loadedPipeline, setLoadedPipeline] = useState(null);
    const outlet = useOutlet();
    const [candidateCount, setCandidateCount] = useState(0);
    
    const [allCandidates, setAllCandidates] = useState([]);
    
    // loading and error states ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        stage: ''
    });

    const handlePipelineLoad = (jobId) => {
        setLoadedPipeline(jobId);
    };

    useEffect(()=> {
      const fetchData = async () => {
        try {
          // Set loading and clear previous errors
          setLoading(true);
          setError(null);

          const [candidateData, cCount] = await Promise.all([
            api.candidates.getAllCandidates(), // This data is now enriched
            api.candidates.getCandidateCount()
          ]);

          setAllCandidates(candidateData.candidates); // Already contains .jobTitle
          setCandidateCount(cCount);

        } catch (err) {
          console.error('Failed to fetch data:', err);
          // Set error state
          setError(err.message || 'Failed to fetch candidate data');
        } finally {
          // Set loading to false
          setLoading(false);
        }
      };
      
      fetchData();
    },[]); 

    const filteredCandidates = useMemo(() => {
        return allCandidates.filter(candidate => {
            const nameMatch = filters.name
                ? candidate.name.toLowerCase().includes(filters.name.toLowerCase())
                : true;

            const emailMatch = filters.email
                ? candidate.email.toLowerCase().includes(filters.email.toLowerCase())
                : true;

            const stageMatch = filters.stage
                ? candidate.stage?.toLowerCase() === filters.stage
                : true;

            return nameMatch && emailMatch && stageMatch;
        });
    }, [allCandidates, filters]);

    // Pass loading and error via context ---
    const contextValue = {
      candidates: filteredCandidates,
      loading: loading,
      error: error
    };

    const totalCandidateCount = allCandidates.length;

    return (
        <CandidateContext.Provider value={contextValue} >
        <div className="page-container">
            <NavigationBar />
            
            <main className="main-content">
              {outlet ? (
                <Outlet />
              ) : (
                <>
                <div className="content-wrapper">
                    
                    <div className="dashboard-header">
                        <h1>
                            Candidates Dashboard
                        </h1>
                        <div className="toolbar">
                            <div className="view-toggle">
                                <button 
                                    type="button" 
                                    onClick={() => setIsList(true)}
                                    className={`view-toggle-btn ${isList ? 'active' : ''}`}
                                >
                                    <List width={16} height={16} style={{ marginRight: '0.5rem' }} />
                                    List
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsList(false)}
                                    className={`view-toggle-btn ${!isList ? 'active' : ''}`}
                                >
                                    <LayoutGrid width={16} height={16} style={{ marginRight: '0.5rem' }} />
                                    Kanban
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <CandidateStatCard
                            title="Total Candidates" 
                            value={totalCandidateCount} 
                            icon={<Users width={24} height={24} />} 
                        />
                        <CandidateStatCard 
                            title="Newly Applied (7 days)" 
                            value="45" 
                            icon={<UserPlus width={24} height={24} />} 
                        />
                    </div>

                    <div className="main-dashboard-content">
                        {isList ? (
                            <>
                                <CandidateListForm 
                                    filters={filters} 
                                    setFilters={setFilters} 
                                />
                                <CandidateListView />
                            </>
                        ) : (
                            <>
                                <CandidateKanbanForm onPipelineLoad={handlePipelineLoad} />
                                {loadedPipeline && <CandidateKanbanView selectedJob={loadedPipeline} />}
                            </>
                        )}
                    </div>

                </div>
                </>)}
            </main>
        </div>
        </CandidateContext.Provider>
    );
}