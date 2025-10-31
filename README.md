# 💼 TalentFlow: A Mini Hiring Platform (Front-End)

**TalentFlow** is a high-fidelity, **frontend-only React application** that simulates a modern Applicant Tracking System (ATS) used by HR teams.  
It’s a **backend-less project** that mimics a real REST API experience using **Mock Service Worker (MSW)** and stores all data locally in the browser using **IndexedDB (Dexie.js)**.

This project fulfills a detailed technical assignment with complex modules and advanced features like **drag-and-drop**, **data virtualization**, **optimistic updates**, and **persistent local storage**.

---

## 🧭 Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
   - [Job Management](#1-job-management)
   - [Candidate Pipeline](#2-candidate-pipeline)
   - [Assessment Builder](#3-assessment-builder)
3. [Application Flow & Component Breakdown](#application-flow--component-breakdown)
   - [App & Routing](#app--routing-srcappjs)
   - [Module 1: Jobs Dashboard](#module-1-jobs-dashboard)
   - [Module 2: Job Details](#module-2-job-details)
   - [Module 3: Assessment Builder](#module-3-assessment-builder)
   - [Module 4: Candidates Dashboard](#module-4-candidates-dashboard)
   - [Module 5: Candidate Details](#module-5-candidate-details)
4. [Architecture & Technical Decisions](#architecture--technical-decisions)
   - [Backend-less Architecture](#1-the-backend-less-architecture)
   - [State Management](#2-state-management)
   - [List Virtualization](#3-performance-list-virtualization)
   - [Drag-and-Drop (DND)](#4-drag-and-drop-dnd)
   - [@mention Notes Field](#5-advanced-ui-mention-notes-field)
5. [Key Libraries & Technologies](#key-libraries--technologies)
6. [Project Setup](#project-setup)
   - [Clone and Install](#clone-and-install)
   - [Available Scripts](#available-scripts)
7. [Issues & Technical Challenges](#issues--technical-challenges)
   - [API Simulation Complexity](#api-simulation-complexity)
   - [@mention Caret Logic](#mention-caret-logic)
   - [List Virtualization Complexity](#list-virtualization-complexity)
   - [Kanban Board View State Management](#kanban-board-view-state-management)

---

## 📘 Overview

TalentFlow offers HR professionals an interactive platform to manage **job openings**, **candidates**, and **assessments** within a simulated hiring workflow.

The goal is to demonstrate advanced front-end engineering concepts using **React**, focusing on scalability, UX polish, and efficient state handling without relying on a backend.

---

## 🚀 Core Features

### 1. Job Management

- Add, edit, and delete job postings.
- Display all jobs in a paginated and searchable list.
- Filter jobs by department, status, or creation date.

### 2. Candidate Pipeline

- Manage candidates associated with each job.
- Visualize hiring stages with a **drag-and-drop Kanban board**.
- View, edit, and tag candidates with notes or @mentions.

### 3. Assessment Builder

- Create and manage skill assessments for job roles.
- Build questionnaires dynamically (MCQs, descriptive, etc.).
- Track question categories and difficulty levels.

---

## ⚙️ Application Flow & Component Breakdown

### App & Routing (`src/App.js`)

- Uses **React Router DOM** for structured routing.
- Core routes:
  - `/jobs` → Jobs dashboard
  - `/jobs/:id` → Job details with candidate list
  - `/candidates` → All candidates view
  - `/candidates/:id` → Candidate details
  - `/assessments` → Assessment builder

---

### Module 1: Jobs Dashboard (`src/pages/Jobs/JobsList.js`)

- Displays job cards with metadata (title, department, openings).
- Features pagination, filters, and search.
- Supports “Create New Job” modal for adding entries.

---

### Module 2: Job Details (`src/pages/Jobs/JobDetail.js`)

- Shows job info, description, and active candidate pipeline.
- Integrates the **Candidate List View** inside the details page.
- Allows HRs to move candidates across stages (drag-and-drop).

---

### Module 3: Assessment Builder (`src/pages/Assessments/Builder.js`)

- A form-based tool for building and saving assessments.
- Question types include multiple choice and descriptive.
- Each assessment is tied to a specific job or department.

---

### Module 4: Candidates Dashboard (`src/pages/Candidates/CandidateList.js`)

- Lists all candidates across all jobs.
- Uses **react-virtualized** for fast rendering.
- Provides filters (status, job applied for, experience).

---

### Module 5: Candidate Details (`src/pages/Candidates/CandidateDetail.js`)

- Displays detailed information on a selected candidate.
- Includes Notes Section with `@mention` autocomplete.
- Integrates candidate status and history.

---

## 🧩 Architecture & Technical Decisions

### 1. The Backend-less Architecture

- Built around **Mock Service Worker (MSW)** to intercept API requests.
- Simulates endpoints like `/jobs`, `/candidates`, `/assessments`.
- Stores and retrieves data using **Dexie.js (IndexedDB)**.
- Enables fully offline operation without real backend.

### 2. State Management

- Local state managed using **React Context** + **useReducer**.
- Each module (Jobs, Candidates, Assessments) has its own slice.
- Ensures predictable, modular updates and reactivity.

### 3. Performance: List Virtualization

- Implemented using **react-virtualized List**.
- Efficiently renders thousands of candidates without lag.
- Dynamic row height support for responsive layouts.

### 4. Drag-and-Drop (DND)

- Implemented via **react-beautiful-dnd**.
- Enables rearranging candidates between hiring stages.
- Smooth animations and instant local persistence.

### 5. Advanced UI: `@mention` Notes Field

- Implemented via **react-mentions**.
- Supports @tagging HR team members in candidate notes.
- Styled for consistent look and improved usability.

---

## 🧰 Key Libraries & Technologies

| Category           | Technology                 |
| ------------------ | -------------------------- |
| Frontend Framework | React 18                   |
| Routing            | React Router DOM           |
| State Management   | React Context + useReducer |
| Data Persistence   | Dexie.js (IndexedDB)       |
| Mock Backend       | Mock Service Worker (MSW)  |
| Drag & Drop        | react-beautiful-dnd        |
| Virtualization     | react-virtualized          |
| UI Components      | Tailwind CSS + Shadcn/UI   |
| Autocomplete       | react-mentions             |

---

## 🛠 Project Setup

### Clone and Install

```bash
git clone https://github.com/yourusername/talentflow.git
cd talentflow
npm install
```
