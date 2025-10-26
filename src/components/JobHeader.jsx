import React from 'react'

const SearchIcon = () => (
  <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
    <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);


export default function JobHeader() {
  return (
  <div className="jobs-header">
    <h1>Jobs Dashboard</h1>
    <div className="search-filters">
      <div className="search-bar">
        <SearchIcon />
        <input type="text" placeholder="Search by Job Title..." />
      </div>
      <div className="filter-buttons">
        <button type="button" className="filter-btn">
          <span>All</span>
          <ChevronDownIcon />
        </button>
        <button type="button" className="filter-btn">
          <span>Tags</span>
          <ChevronDownIcon />
        </button>
        <button type="button" className="add-job-btn">
          <PlusIcon />
          <span>Add New Job</span>
        </button>
      </div>
    </div>
  </div>
  )
}
