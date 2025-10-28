/**
 * This is the API client module.
 * React components will import and use these functions
 * to interact with the (mock) backend.
 */

import { db } from "./db";

/**
 * A helper to handle all fetch responses.
 * It checks for 'ok' status and throws an error if it's not.
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to parse the error message from the mock response
    const errorData = await response.json().catch(() => ({})); // Handle non-JSON errors
    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
  }
  // return response.json() if there's a body, otherwise return success
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
};

export const api = {
  // === JOBS ===
  jobs: {
    async getAll({ page = 1, pageSize = 10, status = '', search = '', sort = 'order', tags = [] }={}) {
      const params = new URLSearchParams({ page, pageSize, status, search, sort });
      
      if (tags && tags.length > 0) {
        params.append('tags', tags.join(','));
      }

      const response = await fetch(`/jobs?${params}`);
      return handleResponse(response);
    },
    async getById(id) {
      const response = await fetch(`/jobs/${id}`);
      return handleResponse(response);
    },
    getJobCount: async () => {
      try {
        const total = await db.jobs.count(); 
        return total;  
      } catch (err) {
        console.error("Failed to get job count:", err);
        throw err;
      }
    },
    getTitles: async () => {
      try {
        const response = await fetch('/jobs/titles');
        return handleResponse(response);
      } catch (err) {
        console.error("Failed to get job titles:", err);
        throw err;
      }
    },
    getActiveJobCount: async () => {
      try {
        const allJobs = await db.jobs.toArray();
        const activeJobs = allJobs.filter((job)=> {
          return job.status === "active"
        })
        return activeJobs.length;
      } catch (err) {
        console.error("Failed to get active job count:", err);
        throw err;
      }
    },
    getUniqueTags: async () => {
      try {
        const response = await fetch('/jobs/tags');
        return handleResponse(response);
      } catch (err) {
        console.error("Failed to get unique tags:", err);
        throw err;
      }
    },
    async create(jobData) {
      const response = await fetch('/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return handleResponse(response);
    },
    async update(id, updates) {
      const response = await fetch(`/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },
    async reorder({ jobId, fromOrder, toOrder }) {
      const response = await fetch(`/jobs/${jobId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromOrder, toOrder }),
      });
      return handleResponse(response);
    }
  },
  
  // === CANDIDATES (Phase 3) ===
  candidates: {
    getAllCandidates: async () => {
      const response = await fetch('/candidates');
      return handleResponse(response);
    },
    getById: async (candidateId) => {
      if (!candidateId) {
        throw new Error('Candidate ID is required.');
      }
      const response = await fetch(`/candidates/${candidateId}`);
      return handleResponse(response);
    },

    getCandidateCount: async () => {
      try {
        const total = await db.candidates.count(); 
        return total;  
      } catch (err) {
        console.error("Failed to get job count:", err);
        throw err;
      }
    },
    getByJobId: async (jobId) => {
      if (!jobId) {
        throw new Error('Job ID is required to fetch candidates.');
      }
      const response = await fetch(`/candidates/job/${jobId}`);
      return handleResponse(response);
    },

    
    updateStage: async (candidateId, newStage) => {
      if (!candidateId || !newStage) {
        throw new Error('Candidate ID and new stage are required.');
      }
      const response = await fetch(`/candidates/${candidateId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      return handleResponse(response);
    },
    getTimeline: async (candidateId) => {
      if (!candidateId) {
        throw new Error('Candidate ID is required.');
      }
      const response = await fetch(`/candidates/${candidateId}/timeline`);
      return handleResponse(response);
    },
    
    // --- ADD THIS FUNCTION ---
    getNotes: async (candidateId) => {
      if (!candidateId) {
        throw new Error('Candidate ID is required.');
      }
      const response = await fetch(`/candidates/${candidateId}/notes`);
      return handleResponse(response);
    },

    // --- ADD THIS FUNCTION ---
    updateNotes: async (candidateId, content) => {
      if (!candidateId) {
        throw new Error('Candidate ID is required.');
      }
      const response = await fetch(`/candidates/${candidateId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content || '' }),
      });
      return handleResponse(response);
    }
    
  },
  
  // === ASSESSMENTS (Phase 3) ===
  assessments: {
    // Placeholder for Phase 3
  },
};