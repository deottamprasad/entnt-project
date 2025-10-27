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
  // JOBS API

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
    const tags = params.get('tags');
      
    const tagList = tags ? tags.split(',') : [];

    // Start with the table and apply the primary sort
    let collection = db.jobs.orderBy('order');

    // Apply filters
    let filteredCollection = collection;
    if (status) {
      filteredCollection = filteredCollection.filter(job => 
        job.status.toLowerCase() === status.toLowerCase()
      );
    }
    if (search) {
      filteredCollection = filteredCollection.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (tagList.length > 0) {
      filteredCollection = filteredCollection.filter(job => 
        tagList.every(tag => job.tags.includes(tag))
      );
    }

    // Get total count *after* all filtering
    const total = await filteredCollection.count();

    // Apply pagination
    const paginatedJobs = await filteredCollection 
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    // Enrich jobs with candidate counts 
    // We do this *after* pagination for better performance.
    const jobsWithCounts = await Promise.all(
      paginatedJobs.map(async (job) => {
        // Find the count of candidates for this specific job
        const candidateCount = await db.candidates
          .where('jobId')
          .equals(job.id)
          .count();
        
        // Return the job object with the new 'candidates' property
        return {
          ...job,
          candidates: candidateCount,
        };
      })
    );

    // Return the enriched jobs
    return HttpResponse.json({ 
      jobs: jobsWithCounts, // <-- Send the enriched array
      total, 
      page, 
      pageSize 
    });
  }),

  http.get('/jobs/titles', async () => {
    await simulateDelay(300); // Faster delay for UI elements
    try {
      const activeJobs = await db.jobs
        .orderBy('title')
        .toArray();
      // Map to a simple { id, title } array
      const titles = activeJobs.map(job => ({ id: job.id, title: job.title }));
      
      return HttpResponse.json(titles);
    } catch (error) {
      return new HttpResponse(JSON.stringify({ message: 'Failed to fetch job titles' }), { status: 500 });
    }
  }),

http.get('/jobs/tags', async () => {
    await simulateDelay();
    try {
      const allJobs = await db.jobs.toArray();
      // Flatten all tag arrays into one array
      const allTags = allJobs.flatMap(job => job.tags);
      // Use a Set to get only unique values, then convert back to array
      const uniqueTags = [...new Set(allTags)];
      
      return HttpResponse.json(uniqueTags);
    } catch (error) {
      return new HttpResponse(JSON.stringify({ message: 'Failed to fetch tags' }), { status: 500 });
    }
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

  // CANDIDATES API (Stubs)

  http.get('/candidates', async () => {
    await simulateDelay();
    
    // Get all jobs and create a title map { jobId: jobTitle }
    const allJobs = await db.jobs.toArray();
    const jobMap = new Map();
    allJobs.forEach(job => {
      jobMap.set(job.id, job.title);
    });

    // Get all candidates
    const candidates = await db.candidates.toArray(); 

    // Enrich candidates with jobTitle
    const enrichedCandidates = candidates.map(candidate => ({
      ...candidate,
      jobTitle: jobMap.get(candidate.jobId) || 'Unknown Job' // Add jobTitle
    }));

    // Return the new enriched list
    return HttpResponse.json({ candidates: enrichedCandidates, total: enrichedCandidates.length });
  }),
  
  http.post('/candidates', async () => {
    await simulateDelay();
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  /**
   * GET /candidates/job/:jobId
   * Fetches all candidates for a specific job.
   */
  http.get('/candidates/job/:jobId', async ({ params }) => {
    await simulateDelay();
    const { jobId } = params;

    if (!jobId) {
      return new HttpResponse(JSON.stringify({ message: 'Job ID is required' }), { status: 400 });
    }

    try {
      // Find all candidates matching the jobId
      const candidates = await db.candidates
        .where('jobId')
        .equals(jobId)
        .toArray();
      
      return HttpResponse.json({ candidates, total: candidates.length });
    } catch (error) {
      return new HttpResponse(JSON.stringify({ message: 'Failed to fetch candidates' }), { status: 500 });
    }
  }),

  /**
   * PATCH /candidates/:id/stage
   * Updates a candidate's stage.
   */
  http.patch('/candidates/:id/stage', async ({ request, params }) => {
    await simulateDelay(300);
    if (simulateWriteError(0.05)) { // 5% chance of failure
      return new HttpResponse(JSON.stringify({ message: 'Server error, please try again.' }), { status: 500 });
    }

    const { id } = params;
    const { stage } = await request.json();

    if (!stage) {
      return new HttpResponse(JSON.stringify({ message: 'Stage is required' }), { status: 400 });
    }

    try {
      await db.candidates.update(id, { stage });
      
      // Also add a timeline event
      await db.candidate_timeline.add({
        candidateId: id,
        timestamp: new Date(),
        event: `Stage moved to ${stage}`
      });
      
      // Return the updated candidate
      const updatedCandidate = await db.candidates.get(id);
      return HttpResponse.json(updatedCandidate);

    } catch (error) {
      return new HttpResponse(JSON.stringify({ message: 'Failed to update candidate' }), { status: 500 });
    }
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

  // ASSESSMENTS API (Stubs)
  
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
    await db.assessment_responses.add({
      assessmentId: params.jobId,
      candidateId: 'mock-candidate-id',
      submittedAt: new Date(),
      responses: {}, 
    });
    return HttpResponse.json({ success: true });
  }),
];

