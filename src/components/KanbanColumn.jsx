import React from 'react';
import { useDroppable } from '@dnd-kit/core'; 
import '../styles/candidates.css'; 

// Accept 'id' (which is the stage name) as a prop
const KanbanColumn = ({ id, title, count, children }) => {
    
    // Set up useDroppable
    const { setNodeRef, isOver } = useDroppable({
        id: id, // The ID for this droppable area (e.g., 'applied', 'screen')
    });

    return (
        <div 
            ref={setNodeRef} 
            // Add visual feedback when dragging over
            className={`kanban-column ${isOver ? 'over' : ''}`}
        >
            <div className="kanban-column-header">
                <span>{title}</span>
                <span className="kanban-column-count">
                    {count}
                </span>
            </div>
            <div className="kanban-column-cards">
                {children}
            </div>
        </div>
    );
};

export default KanbanColumn;