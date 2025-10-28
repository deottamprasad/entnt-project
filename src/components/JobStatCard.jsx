import React from 'react';

export default function JobStatCard({ jobCount, activeCount }) {
  
  return (
    <div className="stat-cards">
      <div className="stat-card">
        <p className="stat-card-title">Total Jobs</p>
        <p className="stat-card-value">{jobCount}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card-title">Active Jobs</p>
        <p className="stat-card-value">{activeCount}</p>
      </div>
    </div>
  );
}