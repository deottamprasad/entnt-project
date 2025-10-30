import React, { useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CandidateContext } from '../pages/Candidates';
import '../styles/candidates.css'; 
import { useVirtualizer } from '@tanstack/react-virtual';

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

const CandidateListView = () => {
    const { candidates, loading, error } = useContext(CandidateContext);
    const listContainerRef = useRef(null);

    const rowVirtualizer = useVirtualizer({
      count: candidates.length, 
      getScrollElement: () => listContainerRef.current, 
      estimateSize: () => 72, 
      overscan: 5, 
    });


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
        <div 
          ref={listContainerRef} 
          className="list-view-container" 
          style={{ maxHeight: '600px', overflowY: 'auto' }}
        >
            <table className="list-view-table">
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Candidate</th>
                        <th style={{ width: '40%' }}>Applied For</th>
                        <th style={{ width: '20%' }}>Stage</th>
                    </tr>
                </thead>
                <tbody>
  <tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
    <td colSpan={3} style={{ padding: 0, border: 'none' }}>
      <div
        style={{
          position: 'relative',
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const candidate = candidates[virtualRow.index];
          if (!candidate) return null;
          const initials = getInitials(candidate.name);
          const placeholderUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${initials}`;

          return (
            <div
              key={candidate.id}
              className="virtual-row"
              style={{
                position: 'absolute',
                top: `${virtualRow.start}px`,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
              }}
            >
              <div className="virtual-row-grid">
                <div className="virtual-row-col candidate-col">
                  <Link to={`/mycandidate/${candidate.id}`} className="candidate-info-link">
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        <img
                          src={candidate.avatar || placeholderUrl}
                          alt={`${candidate.name} avatar`}
                          onError={(e) => (e.target.src = placeholderUrl)}
                        />
                      </div>
                      <div className="candidate-meta">
                        <div className="candidate-name">{candidate.name}</div>
                        <div className="candidate-email">{candidate.email}</div>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="virtual-row-col job-col">
                  <div className="candidate-contact-job">{candidate.jobTitle || 'N/A'}</div>
                </div>

                <div className="virtual-row-col stage-col">
                  <span className={`stage-badge ${getStageColor(candidate.stage)}`}>
                    {candidate.stage || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </td>
  </tr>
</tbody>

            </table>
        </div>
    );
};

export default CandidateListView;