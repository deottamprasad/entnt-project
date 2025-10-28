import React, { createContext, useState, useEffect } from 'react';
import { Outlet, useOutlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import JobList from '../components/JobList';
import JobHeader from '../components/JobHeader';
import Pagination from '../components/Pagination';
import JobModal from '../components/JobModal'; 
import { api } from '../api';
import '../styles/jobs.css';
import '../styles/modal.css'; 
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import JobStatCard from '../components/JobStatCard';

export const JobContext = createContext(null);

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

const PAGE_SIZE = 10;

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // state for modal and re-fetching ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); 
  const [refreshKey, setRefreshKey] = useState(0); 

  // STATE FOR COUNTS  
  const [jobCount, setJobCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const debouncedSearch = useDebounce(searchTitle, 300);

  // Effect for fetching tags
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
  }, [refreshKey]); 

  // Effect: Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, selectedTags]);

  // Fetch data when filters, page, OR refreshKey changes 
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const statusParam =
          statusFilter === 'All' ? '' : statusFilter.toLowerCase();

        const data = await api.jobs.getAll({
          search: debouncedSearch,
          status: statusParam,
          tags: selectedTags,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        setJobs(data.jobs);
        setTotalJobs(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [debouncedSearch, statusFilter, selectedTags, currentPage, refreshKey]); 

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // useEffect TO FETCH COUNTS ---
  useEffect(() => {
    const fetchJobCount = async () => {
      try {
        // Fetch both counts in parallel
        const [jCount, ajCount] = await Promise.all([
          api.jobs.getJobCount(),
          api.jobs.getActiveJobCount()
        ]);
        setJobCount(jCount);
        setActiveCount(ajCount);
      } catch (err) {
        console.error('Failed to fetch stat counts:', err);
      }
    };

    fetchJobCount();
  }, [refreshKey]); 

  // handleDragEnd ---
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
      .then(() => {
        // Trigger re-fetch on success ---
        setRefreshKey((k) => k + 1);
      })
      .catch((err) => {
        console.error('Failed to reorder job:', err);
        setJobs(originalJobs);
      });
  };

  // handler functions
  const handleOpenAddModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null); // Clear editing job on close
  };

  const handleSaveJob = async (jobData) => {
    // This function is passed to the modal
    // It will be called with the form data
    if (editingJob) {
      // Update existing job
      await api.jobs.update(editingJob.id, jobData);
    } else {
      // Create new job
      await api.jobs.create(jobData);
    }
    // Trigger a re-fetch of jobs and tags
    setRefreshKey((k) => k + 1);
  };

  // Define the value to be passed to the context ---
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
    handleOpenAddModal,
    handleOpenEditModal,
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
            <JobStatCard jobCount={jobCount} activeCount={activeCount} />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <JobList />
            </DndContext>

            <Pagination
              currentPage={currentPage}
              totalItems={totalJobs}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      {/*  Render the Modal component --- */}
      <JobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        job={editingJob}
      />
    </JobContext.Provider>
  );
}