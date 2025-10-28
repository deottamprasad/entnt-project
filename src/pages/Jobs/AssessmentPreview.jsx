import React, { useState } from 'react';

function validate(question, value) {
  const { validation } = question;
  if (!validation) return null;

  // 1. Check "required"
  if (validation.required) {
    const isEmpty = 
      value === null || 
      value === undefined || 
      value === '' || 
      (Array.isArray(value) && value.length === 0);
    
    if (isEmpty) {
      return 'This field is required.';
    }
  }

  // 2. Check "maxLength" for text types 
  if (validation.maxLength && (typeof value === 'string' || value instanceof String)) {
    if (value.length > validation.maxLength) {
      return `Must be ${validation.maxLength} characters or less.`;
    }
  }
  
  // 3. Check "numeric" range 
  if (question.type === 'numeric' && (value !== null && value !== '')) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Must be a valid number.';
    }
    
    const hasMin = validation.min !== null && validation.min !== undefined;
    const hasMax = validation.max !== null && validation.max !== undefined;

    if (hasMin && num < validation.min) { 
      return `Value must be ${validation.min} or more.`;
    }
    if (hasMax && num > validation.max) { 
      return `Value must be ${validation.max} or less.`;
    }
  }
  
  return null; 
}


/**
 * Renders a single interactive preview question.
 */
function RenderPreviewQuestion({ question, response, error, onResponseChange }) {
  const { label, type, options, validation } = question;
  const isRequired = validation?.required;

  // Special handler for multi-choice (checkboxes)
  const handleMultiChoiceChange = (optionValue, isChecked) => {
    const currentValues = Array.isArray(response) ? response : [];
    let newValues;
    if (isChecked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter(v => v !== optionValue);
    }
    onResponseChange(question.id, newValues);
  };

  return (
    <div className="preview-question">
      <label className="preview-label" htmlFor={`prev-${question.id}`}>
        {label}
        {isRequired && <span className="preview-required">*</span>}
      </label>
      
      {(() => {
        switch (type) {
          case 'short-text':
            return (
              <input 
                type="text" 
                id={`prev-${question.id}`}
                placeholder={validation?.maxLength ? `Max ${validation.maxLength} chars` : 'Short answer'} 
                value={response || ''}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
              />
            );
          case 'long-text':
            return (
              <textarea 
                id={`prev-${question.id}`}
                placeholder={validation?.maxLength ? `Max ${validation.maxLength} chars` : 'Long answer'}
                value={response || ''}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
              />
            );
          case 'numeric':
            return (
              <input 
                type="number"
                id={`prev-${question.id}`}
                placeholder={`Number ${validation?.min ? `(${validation.min}` : ''}${validation?.max ? ` - ${validation.max})` : '...'}`} 
                value={response || ''}
                onChange={(e) => onResponseChange(question.id, e.target.value)}
              />
            );
          case 'file-upload':
            return <input type="file" id={`prev-${question.id}`} />;
          case 'single-choice':
            return (
              <div className="preview-options">
                {(options || []).map((opt, i) => (
                  <div key={i} className="preview-option">
                    <input 
                      type="radio" 
                      id={`prev-${question.id}-${i}`} 
                      name={`prev-${question.id}`}
                      value={opt}
                      checked={response === opt}
                      onChange={(e) => onResponseChange(question.id, e.target.value)}
                    />
                    <label htmlFor={`prev-${question.id}-${i}`}>{opt}</label>
                  </div>
                ))}
              </div>
            );
          case 'multi-choice':
            return (
              <div className="preview-options">
                {(options || []).map((opt, i) => (
                  <div key={i} className="preview-option">
                    <input 
                      type="checkbox" 
                      id={`prev-${question.id}-${i}`} 
                      value={opt}
                      checked={Array.isArray(response) && response.includes(opt)}
                      onChange={(e) => handleMultiChoiceChange(opt, e.target.checked)}
                    />
                    <label htmlFor={`prev-${question.id}-${i}`}>{opt}</label>
                  </div>
                ))}
              </div>
            );
          default:
            return <p><em>Unknown question type: {type}</em></p>;
        }
      })()}
      
      {/* Display validation error */}
      {error && <div className="preview-error">{error}</div>}
    </div>
  );
}

/**
 * Renders the entire assessment as a fillable, validating form.
 */
export default function AssessmentPreview({ assessment }) {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});

  // Finds the question, updates state, and runs validation
  const handleResponseChange = (questionId, value) => {
    // Find the question object to get its validation rules
    let question = null;
    for (const section of assessment.sections) {
      question = section.questions.find(q => q.id === questionId);
      if (question) break;
    }
    if (!question) return;

    // Update response state
    setResponses(prev => ({ ...prev, [questionId]: value }));

    // Validate and update error state
    const errorMsg = validate(question, value);
    setErrors(prev => ({ ...prev, [questionId]: errorMsg }));
  };

  if (!assessment) {
    return (
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Start building your assessment to see the preview.
      </p>
    );
  }

  return (
    <div className="preview-form">
      <h1 className="preview-title">{assessment.title}</h1>
      
      {assessment.sections.map(section => (
        <div key={section.id} className="preview-section">
          <h2 className="preview-section-title">{section.title}</h2>
          
          {section.questions.map(question => (
            <RenderPreviewQuestion 
              key={question.id} 
              question={question}
              response={responses[question.id]}
              error={errors[question.id]}
              onResponseChange={handleResponseChange}
            />
          ))}

          {section.questions.length === 0 && (
            <p className="preview-placeholder">This section has no questions yet.</p>
          )}
        </div>
      ))}

      {assessment.sections.length === 0 && (
        <p className="preview-placeholder">This assessment has no sections yet.</p>
      )}
    </div>
  );
}