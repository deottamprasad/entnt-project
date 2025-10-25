/**
 * This is the API client module.
 * React components will import and use these functions
 * to interact with the (mock) backend.
 */

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
    /**
     * GET /jobs
     * Fetches jobs with filters and pagination.
     */
    async getAll({ page = 1, pageSize = 10, status = '', search = '', sort = 'order' }) {
      const params = new URLSearchParams({ page, pageSize, status, search, sort });
      const response = await fetch(`/jobs?${params}`);
      return handleResponse(response);
    },

    /**
     * POST /jobs
     * Creates a new job.
     */
    async create(jobData) {
      const response = await fetch('/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return handleResponse(response);
    },
    
    /**
     * PATCH /jobs/:id
     * Updates an existing job.
     */
    async update(id, updates) {
      const response = await fetch(`/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },
    
    /**
     * PATCH /jobs/:id/reorder
     * Reorders a job.
     */
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
    // Placeholder for Phase 3
  },
  
  // === ASSESSMENTS (Phase 3) ===
  assessments: {
    // Placeholder for Phase 3
  },
};

