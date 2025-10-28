import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import '../../styles/jobs.css'; 

// --- Icons ---
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const PencilSquareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918a4 4 0 01-1.343 1.03l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0110 6H4.75A.25.25 0 004.5 6.25v10a.25.25 0 00.25.25h10a.25.25 0 00.25-.25V10a.75.75 0 011.5 0v5.25A1.75 1.75 0 0114.75 17H4.75A1.75 1.75 0 013 15.25V5.75z" />
  </svg>
);

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobData = await api.jobs.getById(id);
        setJob(jobData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return <div className="job-details-status">Loading job details...</div>;
  }

  if (error) {
    return <div className="job-details-status error">Error: {error}</div>;
  }

  if (!job) {
    return <div className="job-details-status">Job not found.</div>;
  }

  return (
    <div className="job-details-container">
      {/* --- 1. HEADER --- */}
      <div className="job-details-header">
        <button onClick={() => navigate('/')} className="job-details-back-btn">
          <ChevronLeftIcon />
          Back to Jobs
        </button>
        <Link to="assessment" className="job-details-action-btn">
          <PencilSquareIcon />
          Build Assessment
        </Link>
      </div>

      {/* --- 2. CONTENT --- */}
      <div className="job-details-content">
        
        {/* -- Main Content Area -- */}
        <div className="job-details-main">
          <div className="job-details-title-section">
            <h1 className="job-details-title">{job.title}</h1>
            <span className={`job-status-badge ${job.status.toLowerCase()}`}>
              {job.status}
            </span>
          </div>

          <div className="job-details-section">
            <h2>Description</h2>
            {job.description ? (
              <p className="job-details-description">{job.description}</p>
            ) : (
              <p className="job-details-description-placeholder">
                No description has been added for this job.
              </p>
            )}
          </div>
        </div>

        {/* -- Sidebar Info Area -- */}
        <div className="job-details-sidebar">
          <div className="job-details-section info-box">
            <h2>Info</h2>
            <ul className="job-details-info-list">
              <li>
                <strong>Slug</strong>
                <span>{job.slug}</span>
              </li>
              <li>
                <strong>Job ID</strong>
                <span>{job.id}</span>
              </li>
            </ul>
          </div>
          
          <div className="job-details-section info-box">
            <h2>Tags</h2>
            <div className="job-tags">
              {job.tags && job.tags.length > 0 ? (
                job.tags.map((tag) => (
                  <span key={tag} className="job-tag">
                    #{tag}
                  </span>
                ))
              ) : (
                <span>No tags</span>
              )}
            </div>
          </div>
        </div>   
      </div>
    </div>
  );
}