import { http, HttpResponse } from 'msw';
import { db } from '../db.js';

// --- Helper Functions ---

/**
 * Simulates a network delay.
 * @param {number} [ms=500] - Milliseconds to delay.
 */
const simulateDelay = (ms = Math.random() * (1200 - 200) + 200) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulates a random write error (5-10% failure rate as per spec).
 * @param {number} [failureRate=0.07] - The chance of failure (e.g., 0.07 = 7%).
 */
const simulateWriteError = (failureRate = 0.07) => {
  return Math.random() < failureRate;
};

// --- API Handlers ---

export const handlers = [
  // =============================================
  // JOBS API
  // =============================================

  /**
   * GET /jobs
   * Supports pagination, filtering (status, search), and sorting (by order).
   */
  http.get('/jobs', async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const params = url.searchParams;

    // Get query params
    const page = parseInt(params.get('page') || '1', 10);
    const pageSize = parseInt(params.get('pageSize') || '10', 10);
    const status = params.get('status');
    const search = params.get('search');
    
    // Start with a query, sorted by the 'order' field
    let collection = db.jobs.orderBy('order');

    // Apply filters
    if (status) {
      collection = collection.where('status').equals(status);
    }
    if (search) {
      collection = collection.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Get total count *after* filtering
    const total = await collection.count();

    // Apply pagination
    const jobs = await collection
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return HttpResponse.json({ jobs, total, page, pageSize });
  }),

  /**
   * GET /jobs/:id
   * Gets a single job by its ID.
   */
  http.get('/jobs/:id', async ({ params }) => {
    await simulateDelay();
    const { id } = params;
    const job = await db.jobs.get(id);

    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  /**
   * POST /jobs
   * Creates a new job.
   */
  http.post('/jobs', async ({ request }) => {
    await simulateDelay();
    if (simulateWriteError()) {
      return new HttpResponse(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }

    const newJobData = await request.json();
    
    // Find the highest 'order' value to append the new job
    const allJobs = await db.jobs.toArray();
    const maxOrder = allJobs.reduce((max, j) => Math.max(max, j.order), 0);

    const job = {
      ...newJobData,
      id: crypto.randomUUID(),
      status: 'active',
      order: maxOrder + 1, // Add to the end of the list
    };

    await db.jobs.add(job);
    return HttpResponse.json(job, { status: 201 });
  }),
  
  /**
   * PATCH /jobs/:id
   * Updates a job (e.g., title, tags, or status for archiving).
   */
  http.patch('/jobs/:id', async ({ request, params }) => {
    await simulateDelay();
    if (simulateWriteError()) {
      return new HttpResponse(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }

    const { id } = params;
    const updates = await request.json();
    
    await db.jobs.update(id, updates);
    return HttpResponse.json({ success: true, id, ...updates });
  }),

  /**
   * PATCH /jobs/:id/reorder
   * Handles drag-and-drop reordering.
   */
  http.patch('/jobs/:id/reorder', async ({ request, params }) => {
    await simulateDelay();
    // This endpoint is required to fail occasionally
    if (simulateWriteError(0.1)) {
      return new HttpResponse(JSON.stringify({ message: 'Failed to reorder' }), { status: 500 });
    }

    const { id } = params;
    const { fromOrder, toOrder } = await request.json();

    if (fromOrder === toOrder) {
      return HttpResponse.json({ success: true });
    }

    try {
      // Use a Dexie transaction to ensure data integrity
      await db.transaction('rw', db.jobs, async () => {
        if (fromOrder < toOrder) {
          // Moving DOWN: Decrement order of items between fromOrder and toOrder
          await db.jobs
            .where('order')
            .between(fromOrder + 1, toOrder, true, true)
            .modify(job => { job.order--; });
        } else {
          // Moving UP: Increment order of items between toOrder and fromOrder
          await db.jobs
            .where('order')
            .between(toOrder, fromOrder - 1, true, true)
            .modify(job => { job.order++; });
        }
        
        // Finally, update the moved job's order
        await db.jobs.update(id, { order: toOrder });
      });
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error('Reorder transaction failed:', error);
      return new HttpResponse(JSON.stringify({ message: 'Reorder failed' }), { status: 500 });
    }
  }),

  // =============================================
  // CANDIDATES API (Stubs)
  // =============================================

  http.get('/candidates', async () => {
    await simulateDelay();
    const candidates = await db.candidates.limit(50).toArray(); // Return first 50
    return HttpResponse.json({ candidates, total: 1000 });
  }),
  
  http.post('/candidates', async () => {
    await simulateDelay();
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  http.patch('/candidates/:id', async ({ params }) => {
    await simulateDelay();
    // Simulate logging a timeline event when stage changes
    const { id } = params;
    await db.candidate_timeline.add({
      candidateId: id,
      timestamp: new Date(),
      event: 'Stage updated (mock event)'
    });
    return HttpResponse.json({ success: true });
  }),
  
  http.get('/candidates/:id/timeline', async ({ params }) => {
    await simulateDelay();
    const { id } = params;
    const events = await db.candidate_timeline.where('candidateId').equals(id).toArray();
    return HttpResponse.json(events);
  }),

  // =============================================
  // ASSESSMENTS API (Stubs)
  // =============================================
  
  http.get('/assessments/:jobId', async ({ params }) => {
    await simulateDelay();
    const { jobId } = params;
    const assessment = await db.assessments.get(jobId);
    return HttpResponse.json(assessment || { jobId, structure: null });
  }),

  http.put('/assessments/:jobId', async ({ request, params }) => {
    await simulateDelay();
    if (simulateWriteError()) {
      return new HttpResponse(null, { status: 500 });
    }
    const { jobId } = params;
    const { structure } = await request.json();
    await db.assessments.put({ jobId, structure });
    return HttpResponse.json({ success: true });
  }),

  http.post('/assessments/:jobId/submit', async ({ params }) => {
    await simulateDelay();
    if (simulateWriteError()) {
      return new HttpResponse(null, { status: 500 });
    }
    // In a real app, you'd get candidateId from auth
    await db.assessment_responses.add({
      assessmentId: params.jobId,
      candidateId: 'mock-candidate-id',
      submittedAt: new Date(),
      responses: {}, // Mock responses
    });
    return HttpResponse.json({ success: true });
  }),
];

