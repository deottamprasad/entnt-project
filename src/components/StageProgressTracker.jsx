
// All possible stages
const ALL_STAGES = [
  { id: 'applied', label: 'Application' },
  { id: 'screen', label: 'Screen' },
  { id: 'tech', label: 'Technical Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
];

const REJECTED_STAGE = { 
  id: 'rejected', 
  label: 'Rejected',
};

// Helper to format the date
const formatEventDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const StageProgressTracker = ({ currentStage, timeline }) => {
  // Find the index of the current stage
  const currentStageIndex = ALL_STAGES.findIndex(s => s.id === currentStage);
  const isRejected = currentStage === 'rejected';

  // Create a map of events for easy lookup
  // We use a Map to ensure we get the *first* (oldest) event for each stage if duplicates exist
  const eventMap = new Map();
  // Sort timeline ASCENDING (oldest first) to get correct dates
  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  for (const event of sortedTimeline) {
    if (event.event.startsWith('stage:')) {
      const stageId = event.event.split(':')[1];
      if (!eventMap.has(stageId)) { // Only add the first (oldest) event
        eventMap.set(stageId, formatEventDate(event.timestamp));
      }
    }
  }

  const getStatus = (index) => {
    if (isRejected) return 'inactive';
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="stage-tracker-vertical">
      
      {/* --- Main Progress List --- */}
      <ul className="stage-list">
        {ALL_STAGES.map((stage, index) => {
          const status = getStatus(index);
          const eventDate = eventMap.get(stage.id);

          return (
            <li 
              key={stage.id} 
              className={`stage-item ${status}`}
            >
              <div className="stage-dot"></div>
              <div className="stage-content">
                <div className="stage-label">{stage.label}</div>
                {(status === 'completed' || status === 'current') && eventDate && (
                  <div className="stage-date">{eventDate}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* --- Rejected Status (shown separately) --- */}
      <ul className="stage-list rejected-list">
        <li className={`stage-item ${isRejected ? 'current rejected' : 'pending'}`}>
          <div className="stage-dot"></div>
          <div className="stage-content">
            <div className="stage-label">{REJECTED_STAGE.label}</div>
            {isRejected && eventMap.has('rejected') && (
              <div className="stage-date">{eventMap.get('rejected')}</div>
            )}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default StageProgressTracker;