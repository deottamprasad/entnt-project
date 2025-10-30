import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import '../../styles/candidates.css'; 
import StageProgressTracker from '../../components/StageProgressTracker';

// Helper functions 
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

// --- List of styles to copy from textarea to mirror div ---
const MIRROR_STYLES = [
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing',
  'lineHeight', 'textAlign', 'textTransform', 'wordSpacing',
  'width', 'boxSizing'
];

export default function CandidateDetail() {
  const { candidateId } = useParams(); 
  
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

  // --- State for Mentions ---
  const [mentionPopupVisible, setMentionPopupVisible] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionLoading, setMentionLoading] = useState(false);
  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0 }); // <-- NEW

  // --- Refs ---
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null); // <-- NEW
  const debounceTimeoutRef = useRef(null);

  // --- Data Fetching Effect ---
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

  // --- Mention Data Fetcher ---
  const fetchMentionSuggestions = useCallback((query) => {
    setMentionLoading(true);
    api.candidates.getAllCandidates({ search: query })
      .then(data => {
        setMentionSuggestions(data.candidates);
      })
      .catch(err => {
        console.error("Failed to fetch mention suggestions:", err);
        setMentionSuggestions([]);
      })
      .finally(() => {
        setMentionLoading(false);
      });
  }, []); 

  // Function to get Caret Coordinates ---
  const getCaretCoordinates = () => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    
    // Get computed styles from textarea
    const computedStyle = window.getComputedStyle(textarea);
    
    // Copy all critical styles to the mirror
    MIRROR_STYLES.forEach(prop => {
      mirror.style[prop] = computedStyle[prop];
    });

    // Get text before the cursor
    const textUpToCaret = textarea.value.substring(0, textarea.selectionStart);
    mirror.textContent = textUpToCaret;

    // Create a span to measure
    const span = document.createElement('span');
    // We use a non-breaking space to ensure the span has height
    span.innerHTML = '&nbsp;';
    mirror.appendChild(span);
    
    // Get line height to position popup *below* the line
    const lineHeight = parseInt(computedStyle.lineHeight, 10) || parseInt(computedStyle.fontSize, 10) * 1.2;

    // Calculate position
    // span.offsetTop is the top of the *current line*
    // textarea.scrollTop is how much the user has scrolled *inside* the textarea
    // We add lineHeight to put the popup *below* the current line
    const top = span.offsetTop - textarea.scrollTop + lineHeight;
    
    // span.offsetLeft is the left position of the caret
    // textarea.scrollLeft is how much the user has scrolled *horizontally*
    const left = span.offsetLeft - textarea.scrollLeft;

    setCaretPosition({ top, left });
  };

  // --- Notes Change Handler (with Mention Logic) ---
  const handleNotesChange = (e) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setNotesDraft(text);

    const textBeforeCursor = text.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionPopupVisible(true);
      setMentionLoading(true);

      // --- NEW: Calculate caret position ---
      // We must do this *after* state has updated the mirror's text
      requestAnimationFrame(getCaretCoordinates);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchMentionSuggestions(query);
      }, 300);

    } else {
      setMentionPopupVisible(false);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    }
  };
  
  // --- Mention Click Handler ---
  const handleSuggestionClick = (suggestion) => {
    const text = notesDraft;
    const cursor = textareaRef.current.selectionStart;
    
    const textBeforeCursor = text.substring(0, cursor);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (!match) return; 

    const startIndex = match.index; 
    const textAfterCursor = text.substring(cursor);
    const suggestionText = `@${suggestion.name} `;
    
    const newText = text.substring(0, startIndex) + suggestionText + textAfterCursor;
    
    setNotesDraft(newText);
    setMentionPopupVisible(false);
    setMentionSuggestions([]);
    
    requestAnimationFrame(() => {
      const newCursorPos = startIndex + suggestionText.length;
      textareaRef.current.focus();
      textareaRef.current.selectionStart = newCursorPos;
      textareaRef.current.selectionEnd = newCursorPos;
    });
  };

  // --- Notes Save/Cancel Handlers ---
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await api.candidates.updateNotes(candidateId, notesDraft);
      setNotes(notesDraft);
      setIsEditingNotes(false);
    } catch (err) {
      alert(`Failed to save notes: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotesDraft(notes); 
    setIsEditingNotes(false);
  };

  // --- Render Logic ---
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
      <Link to="/mycandidate" className="back-link"> 
        <ArrowLeft size={16} /> Back to All Candidates
      </Link>

      {/* --- Candidate Header --- */}
      <div className="detail-header">
        {/* ... (header JSX unchanged) ... */}
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
              
              <div className="notes-editor-wrapper">
                {/* --- Hidden Mirror Div --- */}
                <div ref={mirrorRef} className="notes-editor-mirror"></div>
              
                <textarea
                  ref={textareaRef}
                  rows="10"
                  className="form-textarea"
                  value={notesDraft}
                  onChange={handleNotesChange}
                  onScroll={getCaretCoordinates} 
                  onClick={handleNotesChange} 
                  onKeyUp={(e) => { 
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      handleNotesChange(e);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setMentionPopupVisible(false), 200);
                  }}
                  placeholder="Add internal notes... Type @ to mention a candidate."
                />
                
                {mentionPopupVisible && (
                  <div 
                    className="mentions-popup"
                    style={{
                      top: `${caretPosition.top}px`,
                      left: `${caretPosition.left}px`
                    }}
                  >
                    {mentionLoading ? (
                      <div className="popup-message">Searching...</div>
                    ) : mentionSuggestions.length > 0 ? (
                      <ul>
                        {mentionSuggestions.map(suggestion => (
                          <li
                            key={suggestion.id}
                            onMouseDown={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="popup-message">
                        No candidates found for "{mentionQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

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