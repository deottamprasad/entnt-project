// src/pages/Jobs.jsx

import React, { createContext, useState, useEffect } from 'react';
import { Outlet, useOutlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import StatCards from '../components/StatCards';
import JobList from '../components/JobList';
import JobHeader from '../components/JobHeader';
import Pagination from '../components/Pagination'; // <-- 1. Import Pagination
import { api } from '../api';
import '../styles/jobs.css';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const JobContext = createContext(null);

// ... (useDebounce hook remains the same) ...
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const PAGE_SIZE = 10; // <-- 2. Define Page Size

export default function Jobs() {
  const outlet = useOutlet();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [searchTitle, setSearchTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // --- 3. Add pagination state ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  // --- End pagination state ---

  const debouncedSearch = useDebounce(searchTitle, 300);

  // Effect for fetching tags (remains the same)
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await api.jobs.getUniqueTags();
        setAllTags(tags);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    fetchTags();
  }, []);

  // --- 4. NEW Effect: Reset page to 1 when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, selectedTags]);
  // --- End new effect ---

  // --- 5. MODIFIED Effect: Fetch data when filters OR page changes ---
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const statusParam =
          statusFilter === 'All' ? '' : statusFilter.toLowerCase();

        // Pass pagination params to the API
        const data = await api.jobs.getAll({
          search: debouncedSearch,
          status: statusParam,
          tags: selectedTags,
          page: currentPage, // <-- Pass current page
          pageSize: PAGE_SIZE, // <-- Pass page size
        });

        setJobs(data.jobs);
        setTotalJobs(data.total); // <-- Store total jobs count
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [debouncedSearch, statusFilter, selectedTags, currentPage]); // <-- Add currentPage

  // ... (sensors and handleDragEnd remain the same) ...
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return; 
    }
    const oldIndex = jobs.findIndex((j) => j.id === active.id);
    const newIndex = jobs.findIndex((j) => j.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    const originalJobs = [...jobs]; 
    const optimisticJobs = arrayMove(jobs, oldIndex, newIndex);
    setJobs(optimisticJobs);
    
    const movedJob = originalJobs[oldIndex];
    const targetJob = originalJobs[newIndex];
    
    api.jobs
      .reorder({
        jobId: movedJob.id,
        fromOrder: movedJob.order,
        toOrder: targetJob.order,
      })
      .catch((err) => {
        console.error('Failed to reorder job:', err);
        setJobs(originalJobs);
      });
  };


  // 6. Define the value to be passed to the context
  const contextValue = {
    jobs,
    loading,
    error,
    searchTitle,
    setSearchTitle,
    statusFilter,
    setStatusFilter,
    allTags,
    selectedTags,
    setSelectedTags,
  };

  return (
    <JobContext.Provider value={contextValue}>
      <NavigationBar />
      <main className="jobs-page-main">
        {outlet ? (
          <Outlet />
        ) : (
          <>
            <JobHeader />
            <StatCards />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <JobList />
            </DndContext>
            
            {/* --- 7. Render the Pagination component --- */}
            <Pagination
              currentPage={currentPage}
              totalItems={totalJobs}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
            {/* --- End Pagination --- */}

          </>
        )}
      </main>
    </JobContext.Provider>
  );
}