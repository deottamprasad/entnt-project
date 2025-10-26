import React, { useState, useRef, useEffect, useContext } from 'react'; // Import useContext
import { JobContext } from '../pages/Jobs';
import '../styles/jobs.css'

// ... (Icon components remain the same) ...
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

const XMarkIcon = () => ( // <-- ADDED: Icon for clearing tags
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);


// --- NEW: Tags Dropdown Component ---
const TagsFilterDropdown = () => {
  const { allTags, selectedTags, setSelectedTags } = useContext(JobContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle toggling a tag
  const handleTagToggle = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) // Remove tag
        : [...prevTags, tag] // Add tag
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const buttonText = selectedTags.length > 0 
    ? `Tags (${selectedTags.length})` 
    : 'Tags';

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button 
        type="button" 
        className="filter-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{buttonText}</span>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <ul className="filter-dropdown-menu tags-menu">
          {allTags.length === 0 && <li className="no-tags">No tags found</li>}
          {allTags.map(tag => (
            <li key={tag} onClick={() => handleTagToggle(tag)}>
              <input 
                type="checkbox" 
                readOnly
                checked={selectedTags.includes(tag)} 
              />
              <span>{tag}</span>
            </li>
          ))}
          {selectedTags.length > 0 && (
             <li className="clear-tags" onClick={() => setSelectedTags([])}>
                <XMarkIcon /> Clear All
             </li>
          )}
        </ul>
      )}
    </div>
  );
};

// --- NEW: Status Dropdown Component (Refactored from main component) ---
const StatusFilterDropdown = () => {
  const { statusFilter, setStatusFilter } = useContext(JobContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button 
        type="button" 
        className="filter-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{statusFilter}</span> 
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <ul className="filter-dropdown-menu">
          <li onClick={() => handleStatusSelect('All')}>All</li>
          <li onClick={() => handleStatusSelect('Active')}>Active</li>
          <li onClick={() => handleStatusSelect('Archived')}>Archived</li>
        </ul>
      )}
    </div>
  );
};


export default function JobHeader() {
  const { searchTitle, setSearchTitle } = useContext(JobContext);

  const handleSearchTitleChange = (e) => {
    setSearchTitle(e.target.value);
  }

  return (
  <div className="jobs-header">
    <h1>Jobs Dashboard</h1>
    <div className="search-filters">
      <div className="search-bar">
        <SearchIcon />
        <input 
          type="text" 
          value={searchTitle} 
          onChange={handleSearchTitleChange} 
          placeholder="Search by Job Title..." 
        />
      </div>
      <div className="filter-buttons">
        
        <StatusFilterDropdown /> {/* <-- Use Status Dropdown Component */}
        
        <TagsFilterDropdown /> {/* <-- Use Tags Dropdown Component */}
        
        <button type="button" className="add-job-btn">
          <PlusIcon />
          <span>Add New Job</span>
        </button>
      </div>
    </div>
  </div>
  )
}
