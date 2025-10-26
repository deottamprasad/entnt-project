import React, { useEffect, useState } from 'react'
import { api } from '../api';

export default function StatCards() {
  const [jobCount,setJobCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  useEffect(() => {
  const fetchJobCount = async () => {
    try {
      const count = await api.jobs.getJobCount();
      setJobCount(count);
    } catch (error) {
      console.error("Failed to fetch job count:", error);
    }
  };
  const fetchCandidateCount = async () => {
    try {
      const count = await api.candidates.getCandidateCount();
      setCandidateCount(count);
    }
    catch (error) {
      console.error("Failed to fetch candidate count:", error);
    }
  }

  fetchJobCount();
  fetchCandidateCount();
}, []);
  return (
  <div className="stat-cards">
    <div className="stat-card">
      <p className="stat-card-title">Active Jobs</p>
      <p className="stat-card-value">{jobCount}</p>
    </div>
    <div className="stat-card">
      <p className="stat-card-title">Total Candidates</p>
      <p className="stat-card-value">{candidateCount}</p>
    </div>
  </div>
  )
}
