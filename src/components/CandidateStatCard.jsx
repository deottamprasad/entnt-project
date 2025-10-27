import React from 'react';

export default function CandidateStatCard({ title, value, icon }) {
  return (
    <div className="stats-card">
        <div className="stats-card-icon">
            {icon}
        </div>
        <div>
            <p className="stats-card-title">{title}</p>
            <p className="stats-card-value">{value}</p>
        </div>
    </div>
  );
}
