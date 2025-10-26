import React from 'react';
import { Link } from 'react-router-dom';
// --- DND Imports ---
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// --- End DND Imports ---

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

export default function JobCard({ job }) {
  // --- DND: Use the hook ---
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Useful for styling the dragging item
  } = useSortable({ id: job.id });

  // Style for the transform (moving) effect
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  // --- End DND setup ---

  const cardClasses = `job-card ${isDragging ? 'dragging' : ''}`;

  return (
    // 1. Apply setNodeRef, style, and className to the main wrapper
    <div ref={setNodeRef} style={style} className={cardClasses}>
      <div className="job-card-header">
        <div className="job-card-title-group">
          {/* 2. Apply listeners and attributes to the handle.
            Wrapping in a button is best practice for accessibility.
          */}
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
        <button className="job-action-btn">Edit</button>
      </div>
    </div>
  );
}