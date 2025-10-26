import React from 'react'
import { useParams, Link, Outlet, useOutlet } from 'react-router-dom';

export default function JobDetails() {
  const { id } = useParams();
  
  const outlet = useOutlet();

  return (
    <div>
      {outlet ? (
        <Outlet />
      ) : (
        
        <>
          <h2>Job Details Page</h2>
          <p>Showing details for Job ID: <strong>{id}</strong></p>
          <Link 
            to="assessment" 
            className="job-action-btn" 
            style={{ display: 'inline-block', margin: '10px 0', padding: '8px 12px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
          >
            Build Assessment
          </Link>
        </>
      )}
    </div>
  )
}
