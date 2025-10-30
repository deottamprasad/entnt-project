// src/components/CandidateListView.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CandidateContext } from '../pages/Candidates';
import '../styles/candidates.css'; 

// --- Helper Functions (moved from CandidateRow.jsx) ---
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ')
             .map(n => n[0] || '')
             .join('')
             .substring(0, 2)
             .toUpperCase();
};

const getStageColor = (stage) => {
  if (!stage) return 'stage-grey';
  const s = String(stage).toLowerCase();
  switch (s) {
    case 'applied': return 'stage-blue';
    case 'screen': return 'stage-orange';
    case 'tech':
    case 'interview': return 'stage-yellow';
    case 'offer': return 'stage-green';
    case 'hired': return 'stage-purple';
    case 'rejected': return 'stage-red';
    default: return 'stage-grey';
  }
};
// --------------------------------------------------

const CandidateListView = () => {
    const { candidates, loading, error } = useContext(CandidateContext);

    // Use a different class for table-based loading/error
    if (loading) {
        return <div className="table-message">Loading candidates...</div>;
    }
    if (error) {
        return <div className="table-message error">Error: {error}</div>;
    }
    if (!candidates || candidates.length === 0) {
        return <div className="table-message">No candidates found.</div>;
    }

    return (
        <div className="list-view-container">
            <table className="list-view-table">
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Candidate</th>
                        <th style={{ width: '40%' }}>Applied For</th>
                        <th style={{ width: '20%' }}>Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(candidate => {
                        const initials = getInitials(candidate.name);
                        const placeholderUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${initials}`;
                        
                        return (
                            <tr key={candidate.id}>
                                <td>
                                    <Link to={`/mycandidate/${candidate.id}`} className="candidate-info-link">
                                        <div className="candidate-info">
                                            <div className="candidate-avatar">
                                                <img
                                                    src={candidate.avatar || placeholderUrl}
                                                    alt={`${candidate.name} avatar`}
                                                    onError={(e) => (e.targe.src = placeholderUrl)}
                                                />
                                            </div>
                                            <div className="candidate-meta">
                                                <div className="candidate-name">{candidate.name}</div>
                                                <div className="candidate-email">{candidate.email}</div>
                                            </div>
                                        </div>
                                    </Link>
                                </td>
                                <td>
                                    <div className="candidate-contact-job">{candidate.jobTitle || 'N/A'}</div>
                                </td>
                                <td>
                                    <span className={`stage-badge ${getStageColor(candidate.stage)}`}>
                                        {candidate.stage || 'Unknown'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CandidateListView;