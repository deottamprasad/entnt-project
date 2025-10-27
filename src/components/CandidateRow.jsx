import React, { memo } from 'react';
import '../styles/candidates.css';

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

const CandidateRow = memo(({ index, style, data }) => {
  const candidates = Array.isArray(data) ? data : [];
  const candidate = candidates[index] || {
    name: 'Unknown',
    email: '',
    jobTitle: '',
    avatar: null,
    stage: ''
  };

  const initials = getInitials(candidate.name);
  const placeholderUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${initials}`;

  return (
    <div className="list-row" style={style}>
      <div className="list-cell" style={{ width: '40%' }}>
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
      </div>

      <div className="list-cell" style={{ width: '40%' }}>
        <div className="candidate-job-id">{candidate.jobTitle || 'N/A'}</div>
      </div>

      <div className="list-cell" style={{ width: '20%' }}>
        <span className={`stage-badge ${getStageColor(candidate.stage)}`}>
          {candidate.stage || 'Unknown'}
        </span>
      </div>
    </div>
  );
});

export default CandidateRow;
