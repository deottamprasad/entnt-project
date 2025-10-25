import Dexie from 'dexie';

export const db = new Dexie('TalentFlowDB');

db.version(1).stores({
  jobs: `
    id, 
    title,
    slug,
    status,
    order,
    *tags
  `,
  candidates: `
    id, 
    name,
    email,
    stage,
    jobId
  `,
  candidate_timeline: `
    ++id, 
    candidateId,
    timestamp,
    event
  `,
  assessments: `
    jobId,
    structure
  `,
  assessment_responses: `
    ++id, 
    assessmentId,
    candidateId,
    submittedAt
  `
});

console.log("Dexie database schema (src/db.js) initialized.");