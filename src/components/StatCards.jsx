// src/components/StatCards.jsx

import React from 'react';
// --- REMOVE: useEffect, useState, and api imports ---

// --- 1. Accept jobCount and candidateCount as props ---
export default function StatCards({ jobCount, candidateCount }) {
  
  // --- 2. REMOVE the entire useEffect hook ---
  // (The useEffect that fetched counts is no longer needed here)

  return (
    <div className="stat-cards">
      <div className="stat-card">
        <p className="stat-card-title">Active Jobs</p>
        {/* 3. These props now come from Jobs.jsx */}
        <p className="stat-card-value">{jobCount}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card-title">Total Candidates</p>
        {/* 3. These props now come from Jobs.jsx */}
        <p className="stat-card-value">{candidateCount}</p>
      </div>
    </div>
  );
}