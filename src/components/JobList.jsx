import React, { useContext } from 'react';
import JobCard from './JobCard';
import { JobContext } from '../pages/Jobs';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';


export default function JobList() {
  const { jobs, loading, error, handleOpenEditModal } = useContext(JobContext);

  //  Loading and error states
  if (loading) {
    return <div className="job-list-status">Loading jobs...</div>;
  }

  if (error) {
    return <div className="job-list-status error">Error: {error}</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="job-list-status">No jobs found.</div>;
  }

  // Render the list inside a SortableContext
  return (
    <SortableContext
      items={jobs.map((j) => j.id)} 
      strategy={verticalListSortingStrategy}
    >
      <div className="job-list">
        {jobs.map((job) => (
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