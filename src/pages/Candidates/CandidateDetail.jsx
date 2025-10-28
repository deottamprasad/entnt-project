// In CandidateDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import '../../styles/candidates.css'; // Re-use existing styles
import StageProgressTracker from '../../components/StageProgressTracker';

// Helper functions (copied from CandidateListView for consistency)
const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ')
               .map(n => n[0])
               .join('')
               .substring(0, 2)
               .toUpperCase();
};

const getStageColor = (stage) => {
    if (!stage) return 'stage-grey'; 
    const lowerStage = stage.toLowerCase();
    switch (lowerStage) {
        case 'applied': return 'stage-blue';
        case 'screen': return 'stage-orange';
        case 'tech': case 'interview': return 'stage-yellow';
        case 'offer': return 'stage-green';
        case 'hired': return 'stage-purple';
        case 'rejected': return 'stage-red';
        default: return 'stage-grey';
    }
};

export default function CandidateDetail() {
  const { candidateId } = useParams(); // Use 'id' to match your App.js route
  
  // State for data
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!candidateId) return;
      
      setLoading(true);
      setError(null);
      try {
        const [candidateData, timelineData, notesData] = await Promise.all([
          api.candidates.getById(candidateId),
          api.candidates.getTimeline(candidateId),
          api.candidates.getNotes(candidateId)
        ]);

        setCandidate(candidateData);
        setTimeline(timelineData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Sort descending
        setNotes(notesData.content);
        setNotesDraft(notesData.content);

      } catch (err) {
        console.error("Failed to fetch candidate details:", err);
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await api.candidates.updateNotes(candidateId, notesDraft);
      setNotes(notesDraft); // Commit the draft
      setIsEditingNotes(false);
    } catch (err) {
      alert(`Failed to save notes: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotesDraft(notes); // Revert changes
    setIsEditingNotes(false);
  };

  if (loading) {
    return <div className="detail-container"><p>Loading candidate...</p></div>;
  }

  if (error) {
    return <div className="detail-container"><p>Error: {error}</p></div>;
  }

  if (!candidate) {
    return <div className="detail-container"><p>Candidate not found.</p></div>;
  }

  const initials = getInitials(candidate.name);
  const placeholderUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${initials}`;

  return (
    <div className="detail-container">
      <Link to="/mycandidate" className="back-link"> {/* <-- UPDATED LINK */}
        <ArrowLeft size={16} /> Back to All Candidates
      </Link>

      {/* --- Candidate Header --- */}
      <div className="detail-header">
        <img 
          src={candidate.avatar || placeholderUrl} 
          alt={`${candidate.name} avatar`}
          className="detail-avatar"
          onError={(e) => e.target.src = placeholderUrl} 
        />
        <div className="detail-header-meta">
          <h1>{candidate.name}</h1>
          <p>{candidate.email}</p>
          <div className="detail-header-tags">
            <span>Applied for: <strong>{candidate.jobTitle}</strong></span>
            <span className={`stage-badge ${getStageColor(candidate.stage)}`}>
              {candidate.stage || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* --- Main Content (Notes & Timeline) --- */}
      <div className="detail-grid">
        {/* --- Notes Section --- */}
        <div className="detail-card">
          <div className="detail-card-header">
            <h2>Notes</h2>
            {!isEditingNotes ? (
              <button 
                className="btn btn-icon" 
                onClick={() => setIsEditingNotes(true)}
                title="Edit Notes"
              >
                <Edit size={16} /> Edit
              </button>
            ) : (
              <div className="btn-group">
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                >
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          <div className="detail-card-body">
            {isEditingNotes ? (
              <textarea
                className="form-textarea"
                rows="10"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add internal notes for this candidate..."
              />
            ) : (
              <div className="notes-display">
                {notes ? (
                  <pre>{notes}</pre>
                ) : (
                  <p className="notes-placeholder">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- Timeline Section --- */}
        <div className="detail-card">
          <div className="detail-card-header">
            <h2>Stage Progress</h2>
          </div>
          <div className="detail-card-body">
            <StageProgressTracker
              currentStage={candidate.stage}
              timeline={timeline}
            />
          </div>
        </div>
      </div>
    </div>
  );
}