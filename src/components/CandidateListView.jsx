import React, { useContext } from 'react';
import { CandidateContext } from '../pages/Candidates';
import '../styles/candidates.css'; 

//Helper function to generate initials from a name.
const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ')
               .map(n => n[0])
               .join('')
               .substring(0, 2)
               .toUpperCase();
};

//Helper function to map a stage name to a CSS color class.
const getStageColor = (stage) => {
    if (!stage) return 'stage-grey'; 
    const lowerStage = stage.toLowerCase();
    switch (lowerStage) {
        case 'applied':
            return 'stage-blue';
        case 'screen': 
            return 'stage-orange';
        case 'tech':
        case 'interview':
            return 'stage-yellow';
        case 'offer':
            return 'stage-green';
        case 'hired':
            return 'stage-purple';
        case 'rejected':
            return 'stage-red';
        default:
            return 'stage-grey';
    }
};

const CandidateListView = () => {
    const { candidates, loading, error } = useContext(CandidateContext);

    const overflowCellStyle = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 0, 
    };

    const renderTableMessage = (message) => (
        <tr>
            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                {message}
            </td>
        </tr>
    );

    return (
        <div className="list-view-container">
            <table 
              className="list-view-table" 
              style={{ tableLayout: 'fixed', width: '100%' }}
            >
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Candidate</th>
                        <th style={{ width: '40%' }}>Applied for</th>
                        <th style={{ width: '20%' }}>Current Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        renderTableMessage('Loading candidates...')
                    ) : error ? (
                        renderTableMessage(`Error: ${error}`)
                    ) : candidates.length === 0 ? (
                        renderTableMessage('No candidates found.')
                    ) : (
                        candidates.map((candidate) => {
                            
                            const initials = getInitials(candidate.name);
                            const placeholderUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${initials}`;

                            return (
                                <tr key={candidate.id || candidate.email}>
                                    <td style={overflowCellStyle} title={candidate.name}>
                                        <div className="candidate-info">
                                            <div className="candidate-avatar">
                                                <img 
                                                    src={candidate.avatar || placeholderUrl} 
                                                    alt={`${candidate.name} avatar`}
                                                    onError={(e) => e.target.src = placeholderUrl} 
                                                />
                                            </div>
                                            <div className="candidate-meta">
                                                <div className="candidate-name">{candidate.name}</div>
                                                <div className="candidate-email">{candidate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td 
                                      style={overflowCellStyle} 
                                      title={candidate.jobTitle} 
                                    >
                                        <div className="candidate-job-id">
                                          {candidate.jobTitle || 'N/A'} 
                                        </div>
                                    </td>

                                    <td>
                                        <span className={`stage-badge ${getStageColor(candidate.stage)}`}>
                                            {candidate.stage || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CandidateListView;