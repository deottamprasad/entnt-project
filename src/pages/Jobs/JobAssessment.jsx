import React from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link

export default function JobAssessment() {
  const { id } = useParams();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
      <Link 
        to=".." 
        style={{ 
          display: 'inline-block', 
          marginBottom: '20px', 
          padding: '6px 10px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '4px' 
        }}
      >
        &larr; Back to Job Details
      </Link>

      <h3>Assessment Builder</h3>
      <p>Building assessment for Job ID: <strong>{id}</strong></p>
      {/* Add your assessment building UI here */}
    </div>
  );
}

