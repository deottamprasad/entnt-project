import React, { useState } from 'react';

// --- Icons ---
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-1.15.048-2.074.15-2.82.302A2.25 2.25 0 001.396 6.72l.33 1.091A.75.75 0 002.43 8.12l.261-.087c.182-.06.37.036.47.218l.322.568c.084.147.25.23.42.23h10.134c.17 0 .336-.083.42-.23l.322-.567c.1-.182.288-.278.47-.218l.262.087a.75.75 0 00.704-.227l.33-1.091a2.25 2.25 0 00-1.783-2.226c-.746-.152-1.67-.254-2.82-.302V3.75A2.75 2.75 0 0011.25 1h-2.5zM3.28 9.176l.304 1.011c.784.05 1.636.143 2.53.286.09.014.17.04.238.082l.6,3.601A2.25 2.25 0 009.201 16h1.598a2.25 2.25 0 002.249-1.84l.6-3.602a.61.61 0 01.238-.081c.894-.143 1.746-.237 2.53-.286l.304-1.011H3.28z" clipRule="evenodd" /></svg>
);

const QUESTION_TYPES = [
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text (Textarea)' },
  { value: 'single-choice', label: 'Single Choice (Radio)' },
  { value: 'multi-choice', label: 'Multiple Choice (Checkbox)' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file-upload', label: 'File Upload' },
];

/**
 * Renders an editor for a single question's properties.
 */
export default function QuestionEditor({ question, onChange, onClose }) {
  // Use local state for edits, only commit 'onChange' when closing
  const [localQuestion, setLocalQuestion] = useState(question);

  // --- General Field Handlers ---
  const handleChange = (field, value) => {
    setLocalQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleValidationChange = (field, value) => {
    setLocalQuestion(prev => ({
      ...prev,
      validation: { ...prev.validation, [field]: value }
    }));
  };

  // --- Choice/Option Handlers ---
  const handleOptionChange = (index, value) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const handleAddOption = () => {
    const newOptions = [...(localQuestion.options || []), 'New Option'];
    handleChange('options', newOptions);
  };

  const handleDeleteOption = (index) => {
    const newOptions = (localQuestion.options || []).filter((_, i) => i !== index);
    handleChange('options', newOptions);
  };

  // --- Save/Close ---
  const handleDone = () => {
    onChange(localQuestion); 
    onClose(); 
  };

  const hasOptions = localQuestion.type === 'single-choice' || localQuestion.type === 'multi-choice';
  const hasMaxLength = localQuestion.type === 'short-text' || localQuestion.type === 'long-text';
  const hasNumericRange = localQuestion.type === 'numeric';

  return (
    <div className="question-editor">
      <div className="question-editor-header">
        <h4>Edit Question</h4>
        <button className="assessment-save-btn small" onClick={handleDone}>
          <CheckIcon /> Done
        </button>
      </div>
      
      <div className="question-editor-content">
        {/* --- Main Fields --- */}
        <div className="form-group">
          <label htmlFor={`q-type-${localQuestion.id}`}>Question Type</label>
          <select
            id={`q-type-${localQuestion.id}`}
            value={localQuestion.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {QUESTION_TYPES.map(qt => (
              <option key={qt.value} value={qt.value}>{qt.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`q-label-${localQuestion.id}`}>Question Label / Text</label>
          <input
            type="text"
            id={`q-label-${localQuestion.id}`}
            value={localQuestion.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="e.g., What is your name?"
          />
        </div>

        {/* --- Options Editor (Conditional) --- */}
        {hasOptions && (
          <div className="form-group options-editor">
            <label>Options</label>
            {(localQuestion.options || []).map((opt, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder="Option text"
                />
                <button 
                  className="assessment-delete-btn small"
                  onClick={() => handleDeleteOption(index)}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <button className="assessment-add-btn small" onClick={handleAddOption}>
              <PlusIcon /> Add Option
            </button>
          </div>
        )}

        {/* --- Validation Rules --- */}
        <div className="form-group validation-rules">
          <label>Validation Rules</label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id={`q-required-${localQuestion.id}`}
              checked={!!localQuestion.validation?.required}
              onChange={(e) => handleValidationChange('required', e.target.checked)}
            />
            <label htmlFor={`q-required-${localQuestion.id}`}>Required</label>
          </div>

          {hasMaxLength && (
            <div className="form-group inline">
              <label htmlFor={`q-max-${localQuestion.id}`}>Max Length</label>
              <input
                type="number"
                id={`q-max-${localQuestion.id}`}
                value={localQuestion.validation?.maxLength || ''}
                onChange={(e) => handleValidationChange('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 100"
              />
            </div>
          )}

          {hasNumericRange && (
            <div className="validation-range-group">
              <div className="form-group inline">
                <label htmlFor={`q-min-${localQuestion.id}`}>Min Value</label>
                <input
                  type="number"
                  id={`q-min-${localQuestion.id}`}
                  value={localQuestion.validation?.min || ''}
                  onChange={(e) => handleValidationChange('min', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 1"
                />
              </div>
              <div className="form-group inline">
                <label htmlFor={`q-max-val-${localQuestion.id}`}>Max Value</label>
                <input
                  type="number"
                  id={`q-max-val-${localQuestion.id}`}
                  value={localQuestion.validation?.max || ''}
                  onChange={(e) => handleValidationChange('max', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}