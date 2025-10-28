import React, { useState, useEffect } from 'react';
import '../styles/modal.css'; 

// Simple X icon for closing
const XMarkIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
  >
    <path
      d="M6 18L18 6M6 6l12 12"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function JobModal({ isOpen, onClose, onSave, job }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); // Storing tags as a comma-separated string
  const [status, setStatus] = useState('active');

  // State for loading and errors within the modal
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = job != null;
  const modalTitle = isEditing ? 'Edit Job' : 'Add New Job';
  const saveButtonText = isEditing ? 'Save Changes' : 'Create Job';

  // Effect to populate form when `job` (for editing) is passed
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setIsLoading(false);
      setError(null);
      if (isEditing) {
        // We are editing: populate form with job data
        setTitle(job.title);
        setDescription(job.description || ''); // Handle undefined description
        setTags(job.tags.join(', '));
        setStatus(job.status || 'active');
      } else {
        // We are adding: clear form
        setTitle('');
        setDescription('');
        setTags('');
        setStatus('active'); 
      }
    }
  }, [isOpen, job, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Convert tags string back to an array
    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0); // Remove empty strings

    const jobData = {
      title,
      description,
      tags: tagsArray,
      status, // --- UPDATE THIS ---
    };

    try {
      await onSave(jobData); // Call the onSave function passed from Jobs.jsx
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to save job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{modalTitle}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="modal-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="job-title">Job Title</label>
              <input
                type="text"
                id="job-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                required
              />
            </div>
            
            {/* --- ADD THIS ENTIRE BLOCK --- */}
            {isEditing && (
              <div className="form-group">
                <label htmlFor="job-status">Status</label>
                <select
                  id="job-status"
                  className="form-select" // Use a class for <select> if you have one
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
            {/* --- END OF NEW BLOCK --- */}

            <div className="form-group">
              <label htmlFor="job-description">Description</label>
              <textarea
                id="job-description"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter job description..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="job-tags">Tags</label>
              <input
                type="text"
                id="job-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. react, nodejs, typescript"
              />
              <small>Enter tags separated by commas.</small>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn-save"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : saveButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}