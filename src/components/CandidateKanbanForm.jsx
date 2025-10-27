import React, { useState, useEffect } from 'react';
import { api } from '../api'; 

const CandidateKanbanForm = ({ onPipelineLoad }) => {
    const [selectedJob, setSelectedJob] = useState("");
    
    // Add state for job list, loading, and errors ---
    const [jobList, setJobList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add useEffect to fetch job titles on mount ---
    useEffect(() => {
        const fetchJobTitles = async () => {
            try {
                setLoading(true);
                setError(null);
                const titles = await api.jobs.getTitles();
                setJobList(titles);
            } catch (err) {
                setError(err.message || "Failed to load jobs");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobTitles();
    }, []); 

    const handleLoadClick = () => {
        if (selectedJob) {
            onPipelineLoad(selectedJob);
        } else {
            console.log('Please select a job first.');
        }
    };

    return (
        <div className="kanban-form">
            <div className="kanban-form-grow">
                <label htmlFor="job-selector" className="form-label">Select Job Pipeline</label>
                <select 
                    id="job-selector" 
                    name="job-selector" 
                    className="form-select"
                    value={selectedJob}
                    onChange={(e) => {
                        setSelectedJob(e.target.value);
                        onPipelineLoad(null); // Reset pipeline on change
                    }}
                    disabled={loading || error} //  Disable while loading or on error
                >
                    {/*  Render options dynamically --- */}
                    <option value="">-- Select a Job --</option>
                    {loading && <option disabled>Loading jobs...</option>}
                    {error && <option disabled>Error: {error}</option>}
                    {!loading && !error && jobList.map(job => (
                        <option key={job.id} value={job.id}>
                            {job.title}
                        </option>
                    ))}
                    
                </select>
            </div>
            <button 
                type="button" 
                id="load-pipeline-btn" 
                className="btn-primary"
                onClick={handleLoadClick}
                disabled={!selectedJob} // Disable if no job is selected
            >
                Load Pipeline
            </button>
        </div>
    );
};

export default CandidateKanbanForm;