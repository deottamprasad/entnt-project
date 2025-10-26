import React from 'react'
import { Link } from 'react-router-dom';

const DragHandleIcon = () => (
  <svg className="job-card-drag-handle" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
    <path d="M7 8H7.01M7 12H7.01M7 16H7.01M11 8H11.01M11 12H11.01M11 16H11.01M15 8H15.01M15 12H15.01M15 16H15.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function JobCard({ job }) {
  return (
  <div className="job-card">
    <div className="job-card-header">
      <div className="job-card-title-group">
        <DragHandleIcon />
        <h2 className="job-card-title">{job.title} ({job.location})</h2>
      </div>
      <span className={`job-status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
    </div>
    <div className="job-card-body">
      <div className="job-tags">
        {job.tags.map(tag => (
          <span key={tag} className="job-tag">#{tag}</span>
        ))}
      </div>
      <div className="job-candidate-count">
        {job.candidates} Candidates
      </div>
    </div>
    <div className="job-card-footer">
      <Link to={`${job.id}`} className="job-action-btn">View</Link>
      <button className="job-action-btn">Edit</button>
      <button className="job-action-btn">Archive</button>
    </div>
  </div>
  )
}
