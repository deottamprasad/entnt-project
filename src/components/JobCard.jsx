import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DragHandleIcon = () => (
  <svg
    className="job-card-drag-handle"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
  >
    <path
      d="M7 8H7.01M7 12H7.01M7 16H7.01M11 8H11.01M11 12H11.01M11 16H11.01M15 8H15.01M15 12H15.01M15 16H15.01"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function JobCard({ job, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, 
  } = useSortable({ id: job.id });

  // Style for the transform (moving) effect
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardClasses = `job-card ${isDragging ? 'dragging' : ''}`;

  return (
    <div ref={setNodeRef} style={style} className={cardClasses}>
      <div className="job-card-header">
        <div className="job-card-title-group">
          <button
            type="button"
            className="drag-handle-btn"
            {...attributes}
            {...listeners}
          >
            <DragHandleIcon />
          </button>
          <h2 className="job-card-title">{job.title}</h2>
        </div>
        <span className={`job-status-badge ${job.status.toLowerCase()}`}>
          {job.status}
        </span>
      </div>
      <div className="job-card-body">
        <div className="job-tags">
          {job.tags.map((tag) => (
            <span key={tag} className="job-tag">
              #{tag}
            </span>
          ))}
        </div>
        <div className="job-candidate-count">{job.candidates} Candidates</div>
      </div>
      <div className="job-card-footer">
        <Link to={`${job.id}`} className="job-action-btn">
          View
        </Link>
        <button type="button" className="job-action-btn" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  );
}