// src/pages/Jobs/JobAssessment.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import '../../styles/assessment.css';
import QuestionEditor from './QuestionEditor';
import AssessmentPreview from './AssessmentPreview';

// --- Icons ---
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-1.15.048-2.074.15-2.82.302A2.25 2.25 0 001.396 6.72l.33 1.091A.75.75 0 002.43 8.12l.261-.087c.182-.06.37.036.47.218l.322.568c.084.147.25.23.42.23h10.134c.17 0 .336-.083.42-.23l.322-.567c.1-.182.288-.278.47-.218l.262.087a.75.75 0 00.704-.227l.33-1.091a2.25 2.25 0 00-1.783-2.226c-.746-.152-1.67-.254-2.82-.302V3.75A2.75 2.75 0 0011.25 1h-2.5zM3.28 9.176l.304 1.011c.784.05 1.636.143 2.53.286.09.014.17.04.238.082l.6,3.601A2.25 2.25 0 009.201 16h1.598a2.25 2.25 0 002.249-1.84l.6-3.602a.61.61 0 01.238-.081c.894-.143 1.746-.237 2.53-.286l.304-1.011H3.28z" clipRule="evenodd" /></svg>
);

// A default empty question structure
const newQuestionTemplate = {
  id: crypto.randomUUID(),
  type: 'short-text',
  label: 'New Question',
  validation: { required: false }
};

export default function JobAssessment() {
  const { id: jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // State to track which question is being edited
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get the assessment data from the API
        const data = await api.assessments.getById(jobId);
        
        // If no assessment exists, create a default empty one
        if (!data || !data.structure) {
          setAssessment({
            title: 'New Assessment',
            sections: []
          });
        } else {
          setAssessment(data.structure);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [jobId]);

  // --- Save Function ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.assessments.update(jobId, assessment);
    } catch (err) {
      setError(err.message); // Show save error
    } finally {
      setIsSaving(false);
    }
  };

  // --- State Update Handlers (Immutable) ---
  
  const handleTitleChange = (e) => {
    setAssessment(prev => ({ ...prev, title: e.target.value }));
  };

  const handleAddSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      questions: []
    };
    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };
  
  const handleSectionChange = (sectionId, field, value) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleDeleteSection = (sectionId) => {
    // Also clear editing state if a question from this section was open
    const section = assessment.sections.find(s => s.id === sectionId);
    if (section && section.questions.some(q => q.id === editingQuestionId)) {
      setEditingQuestionId(null);
    }

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const handleAddQuestion = (sectionId) => {
    const newQuestion = { ...newQuestionTemplate, id: crypto.randomUUID() };
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      )
    }));
  };
  
  const handleDeleteQuestion = (sectionId, questionId) => {
    // If we are deleting the question being edited, close the editor
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      )
    }));
  };

  // Callback for when the QuestionEditor is "Done"
  const handleQuestionUpdate = (sectionId, questionId, updatedQuestion) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? updatedQuestion : q
              )
            }
          : s
      )
    }));
  };
  
  // --- Render ---

  if (loading) {
    return <div className="assessment-status">Loading Assessment Builder...</div>;
  }

  if (error) {
    return <div className="assessment-status error">Error: {error}</div>;
  }

  if (!assessment) {
    return <div className="assessment-status">No assessment data found.</div>;
  }

  return (
    <div className="assessment-builder-container">
      
      {/* --- Header --- */}
      <div className="assessment-header">
        <Link to={`/${jobId}`} className="assessment-back-btn">
          &larr; Back to Job Details
        </Link>
        <div className="assessment-header-actions">
          <span className="assessment-job-id">Job ID: {jobId}</span>
          <button 
            className="assessment-save-btn" 
            onClick={handleSave}
            disabled={isSaving || !!editingQuestionId} // Disable save while editing
            title={editingQuestionId ? "Close question editor to save" : ""}
          >
            {isSaving ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </div>

      {/* --- Builder --- */}
      <div className="assessment-builder">
        
        {/* --- Left Side: Editor --- */}
        <div className="assessment-editor">
          <input
            type="text"
            className="assessment-title-input"
            value={assessment.title}
            onChange={handleTitleChange}
            placeholder="Assessment Title"
          />

          {/* Sections */}
          <div className="assessment-sections-list">
            {assessment.sections.map((section) => (
              <div key={section.id} className="assessment-section">
                <div className="assessment-section-header">
                  <input
                    type="text"
                    className="assessment-section-title-input"
                    value={section.title}
                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    placeholder="Section Title"
                  />
                  <button 
                    className="assessment-delete-btn"
                    onClick={() => handleDeleteSection(section.id)}
                    disabled={!!editingQuestionId} // Disable delete while editing
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* --- THIS BLOCK IS NOW CORRECT --- */}
                {/* There is only ONE questions-list div */}
                <div className="assessment-questions-list">
                  {section.questions.map((q) => (
                    // Check if this question is the one being edited
                    editingQuestionId === q.id ? (
                      <QuestionEditor
                        key={q.id}
                        question={q}
                        onChange={(updatedQuestion) => handleQuestionUpdate(section.id, q.id, updatedQuestion)}
                        onClose={() => setEditingQuestionId(null)}
                      />
                    ) : (
                      // This is the "stub" view
                      <div 
                        key={q.id} 
                        className="assessment-question-stub"
                        onClick={() => !editingQuestionId && setEditingQuestionId(q.id)} // Make stub clickable (only if not already editing)
                        style={{ cursor: editingQuestionId ? 'not-allowed' : 'pointer' }}
                      >
                        <span>
                          {q.label} 
                          <span style={{color: '#666', marginLeft: '8px'}}>({q.type})</span>
                          {q.validation?.required && <span style={{color: 'red', marginLeft: '8px'}}>*</span>}
                        </span>
                        <button 
                          className="assessment-delete-btn small"
                          onClick={(e) => {
                            e.stopPropagation(); // Stop click from bubbling up to the div
                            handleDeleteQuestion(section.id, q.id);
                          }}
                          disabled={!!editingQuestionId} // Disable delete while editing
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )
                  ))}
                  <button 
                    className="assessment-add-btn"
                    onClick={() => handleAddQuestion(section.id)}
                    disabled={!!editingQuestionId} // Disable adding while editing
                  >
                    <PlusIcon /> Add Question
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              className="assessment-add-btn wide"
              onClick={handleAddSection}
              disabled={!!editingQuestionId} // Disable adding while editing
            >
              <PlusIcon /> Add Section
            </button>
          </div>
        </div>
        
        {/* --- Right Side: Preview --- */}
        <div className="assessment-preview">
          <h3 className="assessment-preview-title">Live Preview</h3>
          <div className="assessment-preview-content">
            {/* We will build the preview renderer here next */}
            <h4 style={{ margin: 0 }}>{assessment.title}</h4>
            <AssessmentPreview assessment={assessment} />
          </div>
        </div>
      </div>
    </div>
  );
}