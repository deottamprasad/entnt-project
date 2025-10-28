import { db } from './db.js';

// --- Mock Data Arrays ---

const MOCK_FIRST_NAMES = [
  'Aisha', 'Ben', 'Cara', 'David', 'Elena', 'Finn', 'Gia', 'Hiro', 'Ines', 'Juan',
  'Kira', 'Leo', 'Mia', 'Niko', 'Olivia', 'Pavi', 'Quinn', 'Ravi', 'Sara', 'Tom'
];
const MOCK_LAST_NAMES = [
  'Chen', 'Smith', 'Rodriguez', 'Kumar', 'Al-Jamil', 'Goldstein', 'Dubois', 'Lee',
  'Walker', 'Kim', 'O\'Brien', 'Patel', 'Garcia', 'Jones', 'Yamamoto', 'Singh'
];
const MOCK_JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'UX/UI Designer', 'Data Scientist',
  'Marketing Lead', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Engineer', 'QA Tester', 'Product Owner', 'Scrum Master'
];
const MOCK_TAGS = [
  'React', 'Node.js', 'Python', 'Go', 'AWS', 'Remote', 'Full-time', 'Contract',
  'JavaScript', 'TypeScript', 'SQL', 'NoSQL', 'Figma', 'AI/ML'
];
const CANDIDATE_STAGES = [
  'applied', 'screen', 'tech', 'offer', 'hired', 'rejected'
];

const MOCK_DESCRIPTIONS = [
  `We are seeking a passionate ${getRandomItem(MOCK_JOB_TITLES)} to join our dynamic team.
  
Key Responsibilities:
- Design and implement scalable, high-performance applications.
- Collaborate with cross-functional teams to define and ship new features.
- Write clean, maintainable, and well-tested code.

Qualifications:
- 3+ years of experience in a similar role.
- Proficiency in ${getRandomItem(MOCK_TAGS)} and ${getRandomItem(MOCK_TAGS)}.
- Strong problem-solving skills.`,
  
  `This is a fantastic opportunity for a mid-level developer looking to take the next step in their career.
You will be responsible for the entire product lifecycle, from concept to deployment.

We value teamwork, innovation, and a commitment to quality.`,
  
  `Join our fast-growing startup! We're looking for a self-starter who is comfortable in a fast-paced environment.
This role is 100% remote.

Requirements:
- Proven experience with ${getRandomItem(MOCK_TAGS)}.
- Excellent communication skills.
- A portfolio of past projects is highly desirable.`
];

// --- Helper Functions ---

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function createSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing dashes
}

// --- Seeder Function ---

/**
 * Seeds the database with mock data.
 * Checks if data already exists to prevent re-seeding.
 */

export async function seedDatabase() {
  try {
    /// --- FIX 1: Use a reliable check ---
    // Get the very first job in the database, if one exists.
    const anyFirstJob = await db.jobs.limit(1).first();

    // Check if a job exists AND it has the 'description' field.
    // This correctly identifies a new, seeded database.
    if (anyFirstJob && anyFirstJob.description !== undefined) {
      console.log('Database (src/seeder.js) is already seeded.');
      return; // Stop. The database is correctly seeded.
    }

    // If we are here, we MUST re-seed.
    // Either the DB is empty (anyFirstJob is undefined)
    // or the schema is old (anyFirstJob exists, but description is undefined).

    if (anyFirstJob) {
      console.log('Old schema detected. Clearing ALL tables for re-seeding...');
    } else {
      console.log('Database (src/seeder.js) is empty. Seeding data...');
    }

    // --- FIX 2: Clear ALL tables ---
    // This ensures we start fresh and don't duplicate candidates.
    await Promise.all([
      db.jobs.clear(),
      db.candidates.clear(), // <-- This is the crucial fix for the count
      db.candidate_timeline.clear(),
      db.assessments.clear(),
      db.assessment_responses.clear(),
      db.candidate_notes.clear(),
    ]);


    // 1. Generate Jobs
    const jobs = [];
    for (let i = 0; i < 25; i++) {
      const title = `${getRandomItem(MOCK_JOB_TITLES)}`;
      const uniqueTitle = `${title} #${i + 1}`;
      jobs.push({
        id: crypto.randomUUID(),
        title: uniqueTitle,
        slug: createSlug(uniqueTitle),
        description: getRandomItem(MOCK_DESCRIPTIONS), // <-- ADD THIS LINE
        status: Math.random() > 0.3 ? 'active' : 'archived',
        tags: getRandomSubset(MOCK_TAGS, Math.ceil(Math.random() * 4)),
        order: i
      });
    }

    await db.jobs.bulkAdd(jobs);
    console.log('Seeded 25 jobs.');

    // 2. Generate Candidates
    const candidates = [];
    for (let i = 0; i < 1000; i++) {
      const firstName = getRandomItem(MOCK_FIRST_NAMES);
      const lastName = getRandomItem(MOCK_LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      candidates.push({
        id: crypto.randomUUID(),
        name: name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        stage: getRandomItem(CANDIDATE_STAGES),
        jobId: getRandomItem(jobs).id // Assign to a random job
      });
    }
    await db.candidates.bulkAdd(candidates);
    console.log('Seeded 1000 candidates.');

    // 3. Generate Assessments
    const assessments = [
      {
        jobId: jobs[0].id,
        structure: {
          title: `Assessment for ${jobs[0].title}`,
          sections: [
            {
              id: 's1',
              title: 'Basic JavaScript',
              questions: [
                { id: 'q1', type: 'single-choice', label: 'What is `typeof null`?', options: ['"object"', '"null"', '"undefined"'], validation: { required: true } },
                { id: 'q2', type: 'multi-choice', label: 'Which are valid ways to declare a variable?', options: ['var', 'let', 'const', 'def'], validation: { required: true } },
                { id: 'q3', type: 'short-text', label: 'What does CSS stand for?', validation: { required: true, maxLength: 50 } },
              ]
            }
          ]
        }
      },
      {
        jobId: jobs[1].id,
        structure: {
          title: `Assessment for ${jobs[1].title}`,
          sections: [
            {
              id: 's1',
              title: 'Product Philosophy',
              questions: [
                { id: 'q1', type: 'single-choice', label: 'Do you agree that "Done is better than perfect"?', options: ['Yes', 'No', 'It depends'], validation: { required: true } },
                { id: 'q2', type: 'long-text', label: 'Describe a product you love and why.', validation: { required: true } },
                { id: 'q3', type: 'short-text', label: 'What is your favorite metric?', dependsOn: { questionId: 'q1', value: 'Yes' } },
              ]
            }
          ]
        }
      },
      {
        jobId: jobs[2].id,
        structure: {
          title: `Assessment for ${jobs[2].title}`,
          sections: [
            {
              id: 's1',
              title: 'Scenario',
              questions: [
                { id: 'q1', type: 'numeric', label: 'How many years of React experience do you have?', validation: { required: true, min: 0, max: 20 } },
                { id: 'q2', type: 'file-upload', label: 'Please upload your resume.' },
              ]
            }
          ]
        }
      }
    ];
    await db.assessments.bulkAdd(assessments);
    console.log('Seeded 3 assessments.');
    
    /// In seeder.js

    // 4. Generate Timeline Events
    console.log('Seeding timeline events...');
    const timelineEvents = [];
    
    // Define the stage order
    const STAGE_ORDER = ['applied', 'screen', 'tech', 'offer', 'hired'];

    for(const candidate of candidates) {
        if (candidate.stage === 'rejected') {
            // Special case for rejected
            timelineEvents.push({
                candidateId: candidate.id,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
                event: `stage:applied` // Simple, clear event
            });
            timelineEvents.push({
                candidateId: candidate.id,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
                event: `stage:rejected` // Simple, clear event
            });
        } else {
            // Loop through the happy path
            const currentStageIndex = STAGE_ORDER.indexOf(candidate.stage);
            if (currentStageIndex === -1) continue; // Skip if stage isn't in our defined order

            for (let i = 0; i <= currentStageIndex; i++) {
                const stage = STAGE_ORDER[i];
                // 1 day ago, 4 days ago, 7 days ago...
                const daysAgo = (currentStageIndex - i) * 3 + 1; 
                const eventTimestamp = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo);

                timelineEvents.push({
                    candidateId: candidate.id,
                    timestamp: eventTimestamp,
                    event: `stage:${stage}` // e.g., "stage:applied", "stage:screen"
                });
            }
        }
    }
    
    await db.candidate_timeline.bulkAdd(timelineEvents);
    console.log(`Seeded ${timelineEvents.length} timeline events.`);


    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

