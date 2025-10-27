// src/components/JobList.jsx

import React, { useContext } from 'react';
import JobCard from './JobCard';
import { JobContext } from '../pages/Jobs';
// --- DND Imports ---
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
// --- End DND Imports ---

export default function JobList() {
  // 1. Consume the context, including the edit handler
  const { jobs, loading, error, handleOpenEditModal } = useContext(JobContext);

  // 2. Loading and error states
  if (loading) {
    return <div className="job-list-status">Loading jobs...</div>;
  }

  if (error) {
    return <div className="job-list-status error">Error: {error}</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="job-list-status">No jobs found.</div>;
  }

  // 3. Render the list inside a SortableContext
  return (
    <SortableContext
      items={jobs.map((j) => j.id)} // Pass an array of IDs
      strategy={verticalListSortingStrategy}
    >
      <div className="job-list">
        {jobs.map((job) => (
          // 4. Pass the onEdit prop to JobCard
          <JobCard
            key={job.id}
            job={job}
            onEdit={() => handleOpenEditModal(job)}
          />
        ))}
      </div>
    </SortableContext>
  );
}