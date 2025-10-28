import React from 'react';
import "../styles/candidates.css"

// Accept 'filters' and 'setFilters' as props
export default function CandidateListForm({ filters, setFilters }) {

    // This single handler works for all text and select inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

  return (
    <div className="list-filter-form">
        <div className="list-filter-grid">
            <div>
                <label htmlFor="filter-name" className="form-label">Name</label>
                <input 
                    type="text" 
                    name="name" 
                    id="filter-name" 
                    className="form-input" 
                    placeholder="e.g., Jane Doe"
                    value={filters.name} 
                    onChange={handleChange} 
                />
            </div>
            <div>
                <label htmlFor="filter-email" className="form-label">Email</label>
                <input 
                    type="email" 
                    name="email"
                    id="filter-email" 
                    className="form-input" 
                    placeholder="e.g., jane@example.com"
                    value={filters.email} 
                    onChange={handleChange} 
                />
            </div>
            <div>
                <label htmlFor="filter-stage" className="form-label">Stage</label>
                <select 
                    id="filter-stage" 
                    name="stage"
                    className="form-select"
                    value={filters.stage} 
                    onChange={handleChange}
                >
                    {/* Options with "All Stages" */}
                    <option value="">All Stages</option>
                    <option value="applied">Applied</option>
                    <option value="screen">Screen</option>
                    <option value="tech">Tech</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>
    </div>
  );
}
