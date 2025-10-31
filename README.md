# TalentFlow: A Mini Hiring Platform (Front-End)

**TalentFlow** is a high-fidelity, front-end-only React application built to simulate a modern Applicant Tracking System (ATS) for an HR team. This application is a "backend-less" project; it simulates a full REST API experience using **Mock Service Worker (MSW)** and persists all data locally in the browser's **IndexedDB** via the **Dexie.js** library.

This project fulfills a detailed technical assignment requiring the implementation of three core modules: **Jobs**, **Candidates**, and **Assessments**, with complex features like drag-and-drop, data virtualization, optimistic updates, and client-side persistence.

## Table of Contents

- [Core Features](#core-features "null")

  - [1\. Job Management](#1-job-management "null")

  - [2\. Candidate Pipeline](#2-candidate-pipeline "null")

  - [3\. Assessment Builder](#3-assessment-builder "null")

- [Application Flow & Component Breakdown](#application-flow--component-breakdown "null")

  - [App & Routing](#app--routing "null")

  - [Module 1: Jobs Dashboard (/)](#module-1-jobs-dashboard- "null")

  - [Module 2: Job Details (/:id)](#module-2-job-details-id "null")

  - [Module 3: Assessment Builder (/:id/assessment)](#module-3-assessment-builder-idassessment "null")

  - [Module 4: Candidates Dashboard (/mycandidate)](#module-4-candidates-dashboard-mycandidate "null")

  - [Module 5: Candidate Details (/mycandidate/:candidateId)](#module-5-candidate-details-mycandidatecandidateid "null")

- [Architecture & Technical Decisions](#architecture--technical-decisions "null")

  - [1\. The "Backend-less" Architecture](#1-the-backend-less-architecture "null")

  - [2\. State Management](#2-state-management "null")

  - [3\. Performance: List Virtualization](#3-performance-list-virtualization "null")

  - [4\. Drag-and-Drop (DND)](#4-drag-and-drop-dnd "null")

  - [5\. Advanced UI: @mention Notes Field](#5-advanced-ui-mention-notes-field "null")

- [Key Libraries & Technologies](#key-libraries--technologies "null")

- [Project Setup](#project-setup "null")

- [Available Scripts](#available-scripts "null")

- [Issues & Technical Challenges](#issues--technical-challenges "null")

## Core Features

This application implements three main user flows as specified in the project requirements.

### 1\. Job Management

- **CRUD for Jobs:** Users can create, edit, and view all job postings.

- **Server-Side Simulation:** The jobs list supports server-like pagination and filtering. Data is re-fetched from the mock API (MSW) when filters change, simulating a real server call.

- **Advanced Filtering:** Filter jobs by title (with a 300ms debounce), status (All, Active, Archived), and by dynamically populated tags.

- **Drag-and-Drop Reordering:** Users can reorder the job list via drag-and-drop. This uses an **optimistic update** (UI updates instantly) and sends the new order to the mock API. The API is programmed to fail occasionally to test the UI's **rollback** capability.

- **Archiving:** Jobs can be set to "Active" or "Archived" status through the "Edit" modal.

### 2\. Candidate Pipeline

- **Dual View System:** A toggle allows users to switch between a "List" view and a "Kanban" view.

- **Virtualized List (List View):** A high-performance, virtualized list (using `@tanstack/react-virtual`) renders the 1,000+ seeded candidates smoothly, only mounting DOM nodes for visible items.

- **Client-Side Filtering (List View):** The list view supports client-side filtering by candidate name, email, and stage.

- **Kanban Board (Kanban View):**

  - Loads candidates for a specific, user-selected job pipeline.

  - Allows users to drag-and-drop candidates between stages (e.g., Applied, Screen, Tech, Offer, Hired, Rejected).

  - This action triggers an optimistic UI update and an API call to update the candidate's stage.

- **Candidate Profile Page:** A detailed route (`/mycandidate/:id`) shows all information for a single candidate.

- **Notes with @mentions:** A rich notes field where users can type `@` to get a debounced list of candidate suggestions to tag in their notes.

- **Stage Progress Timeline:** A visual, vertical timeline showing the candidate's history of stage changes, with dates, derived from timeline events.

### 3\. Assessment Builder

- **Dynamic Form Builder:** A per-job route (`/jobs/:id/assessment`) for building custom assessments.

- **Question Types:** Supports adding sections and various questions:

  - Short Text

  - Long Text (Textarea)

  - Single Choice (Radio)

  - Multiple Choice (Checkbox)

  - Numeric

  - File Upload

- **Live Preview:** A side-by-side panel (`AssessmentPreview`) renders an interactive, fillable preview of the form as it's being built.

- **Validation Rules:** The builder allows setting validation rules (e.g., Required, Max Length, Min/Max Value), which are enforced in the live preview.

- **Persistence:** The entire assessment structure (a complex JSON object) is saved to IndexedDB via the mock API.

## Application Flow & Component Breakdown

The application is initialized in **`src/index.js`**, which first starts the MSW worker (`worker.start()`) and runs the database seeder (`seedDatabase()`) _before_ rendering the React app. This ensures the mock API and data are ready on load.

### App & Routing

Routing is handled by `react-router-dom` with two main parent routes, both of which render the global `NavigationBar`. The parent routes render an `<Outlet />` to display nested child routes.

1.  **Jobs:** `path="/"` (renders `<Jobs />`)

    - `path=":id"` (renders `<JobDetails />`)

    - `path=":id/assessment"` (renders `<JobAssessment />`)

2.  **Candidates:** `path="/mycandidate"` (renders `<Candidates />`)

    - `path=":candidateId"` (renders `<CandidateDetail />`)

### Module 1: Jobs Dashboard (`/`)

- **Page (`pages/Jobs.jsx`):** This is the "smart" parent component for this module.

  - **Data Fetching:** Fetches paginated and filtered jobs from `api.jobs.getAll()`. It also fetches stats like `jobCount` and `activeCount`.

  - **State:** Manages all job-related state: `jobs`, `loading`, `error`, `currentPage`, filters (`searchTitle`, `statusFilter`, `selectedTags`), and `isModalOpen`.

  - **Context:** Provides all this state and handlers (like `handleOpenAddModal`) via `JobContext.Provider`.

  - **DND:** Renders the `<DndContext>` and implements the `handleDragEnd` logic for reordering. It performs an optimistic update (`arrayMove`) and then calls `api.jobs.reorder`. On API failure, it reverts the state to the original `jobs` array (rollback).

- **Components:**

  - **`components/JobHeader.jsx`:** Renders the title, search bar, and filter dropdowns.

  - **`components/JobStatCard.jsx`:** A simple presentational component that displays `jobCount` and `activeCount`.

  - **`components/JobList.jsx`:** Consumes `JobContext`. Renders a `<SortableContext>` to enable DND for its children.

  - **`components/JobCard.jsx`:** Uses the `useSortable` hook from `@dnd-kit` to make itself draggable.

  - **`components/JobModal.jsx`:** A modal form for Create/Edit.

  - **`components/Pagination.jsx`:** A presentational component for pagination.

### Module 2: Job Details (`/:id`)

- **Page (`pages/Jobs/JobDetails.jsx`):** Renders inside the `<Outlet />` of `Jobs.jsx`.

  - **Data Fetching:** Uses `useParams` to get the `id` and fetches a single job's data via `api.jobs.getById(id)`.

  - **UI:** Displays the job's title, status, description, and tags. Provides a "Back" button and a link to the Assessment Builder.

### Module 3: Assessment Builder (`/:id/assessment`)

- **Page (`pages/Jobs/JobAssessment.jsx`):** Renders inside the `<Outlet />` of `Jobs.jsx`.

  - **Data Fetching:** Fetches the current assessment structure using `api.assessments.getById(jobId)`.

  - **State:** Manages the entire `assessment` JSON object in state.

  - **Save:** A "Save" button calls `api.assessments.update(jobId, assessment)` to persist the structure.

  - **UI:** Renders the list of sections and questions. Conditionally renders the `QuestionEditor` when a question is clicked.

- **Components:**

  - **`pages/Jobs/QuestionEditor.jsx`:** A detailed form to edit a single question.

  - **`pages/Jobs/AssessmentPreview.jsx`:** Receives the _entire_ `assessment` state object and renders a live, interactive preview of the form, including validation.

### Module 4: Candidates Dashboard (`/mycandidate`)

- **Page (`pages/Candidates.jsx`):** The "smart" parent for this module.

  - **Data Fetching:** Fetches _all 1,000+ candidates_ on mount using `api.candidates.getAllCandidates()`.

  - **State:** Manages the view toggle state (`isList`) and the client-side filter state (`filters`).

  - **Context:** Provides the `filteredCandidates` (a memoized derivation) via `CandidateContext.Provider`.

  - **UI:** Renders `CandidateListForm` and `CandidateListView` OR `CandidateKanbanForm` and `CandidateKanbanView` based on the `isList` toggle.

- **Components:**

  - **`components/CandidateListView.jsx`:** Consumes `CandidateContext`. It uses `useVirtualizer` from `@tanstack/react-virtual` to efficiently render only the visible rows.

  - **`components/CandidateKanbanView.jsx`:** Fetches candidates for a _specific_ `selectedJob` ID. It renders the `<DndContext>` and the `KanbanColumn` components.

  - **`components/KanbanColumn.jsx`:** Uses `useDroppable` to create a drop target for each pipeline stage.

  - **`components/KanbanCard.jsx`:** Uses `useDraggable` to make each candidate card movable.

### Module 5: Candidate Details (`/mycandidate/:candidateId`)

- **Page (`pages/Candidates/CandidateDetail.jsx`):** Renders inside the `<Outlet />` of `Candidates.jsx`.

  - **Data Fetching:** Fetches three separate pieces of data in parallel: candidate details, timeline events, and notes.

  - **UI:** Renders the candidate's header info and two main cards: "Notes" and "Stage Progress."

  - **Notes Feature:**

    - Manages `notes` (saved) and `notesDraft` (editing) in state.

    - When typing `@`, it debounces an API call to fetch suggestions.

    - **Caret Positioning:** It uses a hidden "mirror" `<div>` (`mirrorRef`) to calculate the exact `top` and `left` pixel coordinates of the caret, allowing the suggestion popup to be positioned perfectly.

  - **Timeline Feature:**

    - **`components/StageProgressTracker.jsx`:** A presentational component that maps over the timeline events to render a vertical step tracker.

## Architecture & Technical Decisions

### 1\. The "Backend-less" Architecture

- **Problem:** Simulate a full-stack application (including network latency, API errors, and data persistence) using only front-end technologies.

- **Solution:** A three-layer system:

  1.  **Persistence (IndexedDB via Dexie.js):** `src/db.js` defines the database schema. `src/seeder.js` populates this database with 1,000+ records on first load.

  2.  **API Mocking (MSW):** `src/mocks/handlers.js` defines handlers for every API route (e.g., `http.get('/jobs', ...)`). These handlers _read from and write to the Dexie database_, simulating a real server.

  3.  **API Client (`src/api.js`):** The React application makes standard `fetch` requests via the `api.js` module. This abstraction layer means we could swap in a real API by only changing `api.js` and removing the MSW files.

### 2\. State Management

- **Problem:** Share data and state across components without prop-drilling.

- **Solution:** Use **React Context**.

- **Justification:** The app is well-siloed into "Jobs" and "Candidates." A global library like Redux was unnecessary.

  - `JobContext` (`src/pages/Jobs.jsx`) manages the job list, filters, and modal state.

  - `CandidateContext` (`src/pages/Candidates.jsx`) manages the candidate list and filters.

  - Local component state (`useState`) is used for everything else (e.g., form inputs).

### 3\. Performance: List Virtualization

- **Problem:** Rendering 1,000+ candidates in the "List View" would be extremely slow, creating thousands of DOM nodes.

- **Solution:** Use **`@tanstack/react-virtual`** (`useVirtualizer` hook).

- **Implementation:** The `CandidateListView` component only renders the DOM nodes for the items _currently visible_ in the viewport. This results in blazing-fast scrolling with minimal DOM overhead.

### 4\. Drag-and-Drop (DND)

- **Problem:** Implement two distinct DND patterns: a sortable list (Jobs) and a Kanban board (Candidates).

- **Solution:** Use **`@dnd-kit`**.

- **Implementation:**

  - **Sortable List (Jobs):** `useSortable` hook in `JobCard.jsx` and `<SortableContext>` in `JobList.jsx`.

  - **Kanban (Candidates):** `KanbanCard.jsx` uses `useDraggable`, and `KanbanColumn.jsx` uses `useDroppable`.

  - **Optimistic Updates:** In both cases, the React state is updated _immediately_ on drop, and the API call is made in the background. If the API call fails, the state is reverted, providing the required rollback behavior.

### 5\. Advanced UI: `@mention` Notes Field

- **Problem:** Implement an @mention suggestion popup in a standard `<textarea>`.

- **Solution:** A custom implementation in `CandidateDetail.jsx`.

- **Implementation:**

  1.  On text change, a regex checks for an `@` query.

  2.  It debounces an API call to fetch suggestions.

  3.  **Caret Positioning:** It calculates the caret's pixel position using a hidden "mirror" `<div>` (`mirrorRef`). This div's content is set to the textarea's value up to the caret. A `<span>` is appended, and its `offsetTop` and `offsetLeft` are read to find exactly where the popup should be rendered.

## Key Libraries & Technologies

1.  **Caret Positioning:** It calculates the caret's pixel position using a hidden "mirror" `<div>` (`mirrorRef`). This div's content is set to the textarea's value up to the caret. A `<span>` is appended, and its `offsetTop` and `offsetLeft` are read to find exactly where the popup should be rendered.

## Key Libraries & Technologies

A summary of the key technologies used to build this project:

- **Core (React 19):** Powers the entire component-based UI.

- **Routing (React Router v7):** For client-side routing and nested page layouts.

- **Data Storage (Dexie.js):** A robust wrapper for IndexedDB to store all application data locally.

- **API Mocking (Mock Service Worker):** Intercepts network requests to simulate a real REST API.

- **DND (@dnd-kit):** For all drag-and-drop functionality (job reordering, candidate kanban).

- **Performance (@tanstack/react-virtual):** For "virtualizing" the large 1,000+ candidate list.

- **UI & Forms (react-mentions):** Used for the `@mention` functionality in the candidate notes.

- **Icons (lucide-react):** For modern, lightweight SVG icons.

- **Utilities (lodash):** General-purpose utility functions.

- **Testing (React Testing Library):** For component unit and integration tests.

## Project Setup

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app "null").

1.  **Clone the repository:**

    ```
    git clone <your-repository-url>
    cd entnt-project

    ```

2.  **Install dependencies:**

    ```
    npm install

    ```

3.  **Run the development server:**

    ```
    npm start

    ```

    This will start the React development server and the MSW mock API. Open <http://localhost:3000> to view it in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode. The page will reload when you make changes.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## Issues & Technical Challenges

This section details known issues and complex challenges encountered during development.

1.  **API Simulation Complexity:**

    - **Issue:** The "no backend" constraint meant that complex, stateful database logic had to be simulated in the stateless MSW handlers.

    - **Example:** The job reordering (`PATCH /jobs/:id/reorder`) was the most complex. It required a full transaction script inside the mock handler (`src/mocks/handlers.js`) to get all jobs, find the range of jobs affected by the move, and update their `order` property one by one. This is logic that a real database would handle automatically and atomically.

2.  **`@mention` Caret Logic:**

    - **Issue:** Implementing the `@mention` feature in a plain `<textarea>` is notoriously difficult because the DOM provides no direct API to get the `(x, y)` coordinates of the text caret.

    - **Solution:** The implementation in `src/pages/Candidates/CandidateDetail.jsx` uses a "mirror div" technique. A hidden `<div>` (`mirrorRef`) is styled to be an exact visual replica of the `<textarea>`. Its `textContent` is updated with the textarea's value up to the caret. A `<span>` is appended to this text, and its `offsetTop` and `offsetLeft` are read to find the caret's position. This logic is effective but can be brittle.

3.  **List Virtualization Complexity:**

    - **Issue:** The requirement to virtualize a list of 1000+ candidates introduces complexity. Libraries like `@tanstack/react-virtual` (used here) or `react-window` require either fixed row heights or an `estimateSize` function.

    - **Implementation:** This project uses `estimateSize: () => 72`. This works well because the rows are uniform. If rows had dynamic content, virtualization would become significantly more complex.

4.  **Kanban Board View (State Management):**

    - **Issue:** The "List View" (`CandidateListView`) and "Kanban View" (`CandidateKanbanView`) for candidates have different data needs.

    - **Implementation:** `Candidates.jsx` (the parent) fetches _all 1000+ candidates_ for the list view. When the user switches to Kanban, `CandidateKanbanView.jsx` fetches _only the candidates for that specific job_. This creates two separate "sources of truth" for candidate data.

    - **Challenge:** An update in one view (e.g., dragging a candidate in Kanban) does not automatically update the other. The main list in `Candidates.jsx` would only reflect this change upon a full page reload.

## 8. Authors

- **Deottam Prasad** – M.Tech CSE, IIT (ISM) Dhanbad  
  [GitHub](https://github.com/deottamprasad) | [Email](mailto:deottamprasad@gmail.com)
