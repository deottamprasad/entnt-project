import React from 'react';

// Accept jobCount and candidateCount as props 
export default function JobStatCard({ jobCount, activeCount }) {
  
  return (
    <div className="stat-cards">
      <div className="stat-card">
        <p className="stat-card-title">Total Jobs</p>
        {/* These props now come from Jobs.jsx */}
        <p className="stat-card-value">{jobCount}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card-title">Active Jobs</p>
        {/* These props now come from Jobs.jsx */}
        <p className="stat-card-value">{activeCount}</p>
      </div>
    </div>
  );
}