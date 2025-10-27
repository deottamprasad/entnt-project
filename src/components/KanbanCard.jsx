import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import '../styles/candidates.css'; 

// Helper to get initials 
const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ')
               .map(n => n[0])
               .join('')
               .substring(0, 2)
               .toUpperCase();
};

const KanbanCard = memo(({ candidate }) => {
    
    //  Set up useDraggable
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: candidate.id, // Unique ID for this draggable
        data: candidate,  // Passed the full candidate object as data
    });

    // 3. Define style for transform (while dragging)
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const initials = getInitials(candidate.name);
    const placeholderUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${initials}`;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes}
            // Add dragging class for visual feedback
            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
        >
            <div className="kanban-card-header">
                <span className="kanban-card-name">{candidate.name}</span>
                <img 
                    className="kanban-card-avatar"
                    src={candidate.avatar || placeholderUrl} 
                    alt={`${candidate.name} avatar`}
                    onError={(e) => e.target.src = placeholderUrl} 
                />
            </div>
            <p className="kanban-card-desc">{candidate.email}</p>
        </div>
    );
});

export default KanbanCard;