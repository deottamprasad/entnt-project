import React from 'react'
import JobCard from './JobCard';

export default function JobList() {
  const jobs = [
    { id: 1, title: 'Software Engineer', location: 'Remote', status: 'Active', tags: ['React', 'Node.js', 'Remote'], candidates: 54 },
    { id: 2, title: 'Product Manager', location: 'Hybrid', status: 'Active', tags: ['Product', 'Agile'], candidates: 30 },
    { id: 3, title: 'UX Designer', location: 'On-site', status: 'Paused', tags: ['Figma', 'User-Research'], candidates: 12 },
  ];

  return (
    <div className="job-list">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
