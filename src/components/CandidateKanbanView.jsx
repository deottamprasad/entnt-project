import React, { useState, useEffect, useMemo } from 'react';
import { 
    DndContext, 
    PointerSensor, 
    KeyboardSensor, 
    useSensor, 
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import { api } from '../api';
import KanbanColumn from './KanbanColumn.jsx';
import KanbanCard from './KanbanCard.jsx';
import '../styles/candidates.css'; 

// Define the order of columns based on your stages
const KANBAN_STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const CandidateKanbanView = ({ selectedJob }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Add state for the actively dragged card
    const [activeCard, setActiveCard] = useState(null);

    // Fetch candidates when the selectedJob prop changes (unchanged)
    useEffect(() => {
        if (!selectedJob) {
            setCandidates([]);
            return;
        }

        const fetchCandidates = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.candidates.getByJobId(selectedJob);
                setCandidates(data.candidates);
            } catch (err) {
                setError(err.message || 'Failed to load candidates');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [selectedJob]);

    // Organize candidates into columns 
    const organizedCandidates = useMemo(() => {
        const columns = {};
        KANBAN_STAGES.forEach(stage => {
            columns[stage] = [];
        });

        candidates.forEach(candidate => {
            const stage = (candidate.stage || 'applied').toLowerCase();
            if (columns[stage]) {
                columns[stage].push(candidate);
            }
        });

        return columns;
    }, [candidates]);

    // 3. Set up sensors 
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
              distance: 10, // Require 10px mouse movement to start drag
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Handle Drag Start
    function handleDragStart(event) {
        // Store the active card's data
        setActiveCard(event.active.data.current);
    }

    // Handle Drag End
    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveCard(null); // Clear active card

        if (!over) {
            return; // Dropped outside a column
        }

        const candidate = active.data.current; // The card being dragged
        const newStage = over.id.toString(); // The ID of the column it was dropped on
        const oldStage = candidate.stage.toLowerCase();

        if (newStage === oldStage) {
            return; // Dropped in the same column
        }

        // --- Optimistic Update ---
        const originalCandidates = [...candidates];
        
        // Update local state immediately
        setCandidates(prevCandidates => {
            return prevCandidates.map(c => {
                if (c.id === candidate.id) {
                    return { ...c, stage: newStage };
                }
                return c;
            });
        });

        // Make the API call
        api.candidates.updateStage(candidate.id, newStage)
            .then(updatedCandidate => {
                // Success! Update state with the confirmed data from server
                setCandidates(prev => prev.map(c => 
                    c.id === updatedCandidate.id ? updatedCandidate : c
                ));
            })
            .catch(err => {
                // On error, revert to the original state
                console.error("Failed to update candidate stage:", err);
                setError("Failed to move candidate. Please try again.");
                setCandidates(originalCandidates);
            });
    }

    // Render loading, error, or the board 
    if (loading) {
        return <div className="kanban-status">Loading candidates...</div>;
    }

    if (error) {
        return <div className="kanban-status error" style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (candidates.length === 0 && !loading) {
        return <div className="kanban-status">No candidates found for this job.</div>;
    }

    return (
        <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board-container">
                <div className="kanban-board">
                    {KANBAN_STAGES.map(stage => (
                        <KanbanColumn 
                            key={stage}
                            id={stage} // Pass the stage name as the droppable ID
                            title={stage.charAt(0).toUpperCase() + stage.slice(1)}
                            count={organizedCandidates[stage].length}
                        >
                            {organizedCandidates[stage].map(candidate => (
                                <KanbanCard 
                                    key={candidate.id} 
                                    candidate={candidate} 
                                />
                            ))}
                        </KanbanColumn>
                    ))}
                </div>
            </div>

            {/* Add DragOverlay for a smooth dragging animation */}
            <DragOverlay>
                {activeCard ? (
                    <KanbanCard candidate={activeCard} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CandidateKanbanView;