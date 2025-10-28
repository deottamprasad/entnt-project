// src/db.js
import Dexie from 'dexie';

export const db = new Dexie('TalentFlowDB');

db.version(1).stores({
  jobs: 'id, title, slug, status, order, *tags',
  candidates: 'id, name, email, stage, jobId',
  candidate_timeline: '++id, candidateId, timestamp, event',
  assessments: 'jobId, structure',
  assessment_responses: '++id, assessmentId, candidateId, submittedAt'
});

db.version(2).stores({
  jobs: 'id, title, description, slug, status, order, *tags'
  // Other tables are carried over automatically
});

db.version(3).stores({
  // This version adds the candidate_notes table
  // All other tables (jobs, candidates, etc.) are
  // automatically carried over from version 2.
  candidate_notes: 'candidateId, content' // Primary key is candidateId
});

console.log("Dexie database schema (src/db.js) initialized.");