import React, { useState, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

// --- Kanban Card ---
const KanbanCard = ({ application, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: application.id, data: { ...application } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const profile = application.user || application.profiles || {};
    const matchScore = application.match_score || 85; // Mock if missing

    // Status Badge Helper
    const getStatusInfo = (status) => {
        const map = {
            'applied': { label: 'Postulado', color: 'bg-blue-100 text-blue-700' },
            'reviewing': { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700' },
            'interviewing': { label: 'Entrevista', color: 'bg-purple-100 text-purple-700' },
            'offer': { label: 'Oferta', color: 'bg-orange-100 text-orange-700' },
            'hired': { label: 'Contratado', color: 'bg-green-100 text-green-700' },
            'rejected': { label: 'Descartado', color: 'bg-red-100 text-red-700' }
        };
        return map[status] || map['applied'];
    };

    const statusInfo = getStatusInfo(application.status);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 cursor-grab active:cursor-grabbing touch-none ${isOverlay ? 'shadow-2xl rotate-2 scale-105' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                    {profile.photo ? (
                        <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                            {profile.name?.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{profile.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{profile.title || 'Candidato'}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                        <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                            {matchScore}% Match
                        </div>
                        <div className={`${statusInfo.color} text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center`}>
                            {statusInfo.label}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Kanban Column ---
const KanbanColumn = ({ id, title, applications, colorHeader, colorBorder }) => {
    const { setNodeRef } = useSortable({ id });

    return (
        <div className={`flex flex-col h-full min-w-[280px] w-[calc(100vw-3rem)] md:w-auto md:min-w-0 bg-slate-50 rounded-2xl border-t-4 ${colorBorder} border-x border-b border-slate-200/60 flex-shrink-0 snap-center`}>
            <div className={`p-4 border-b border-slate-100 flex justify-between items-center rounded-t-xl ${colorHeader}`}>
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{title}</h3>
                <span className="bg-white/50 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {applications.length}
                </span>
            </div>
            <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                <SortableContext items={applications.map(app => app.id)} strategy={verticalListSortingStrategy}>
                    {applications.map((app) => (
                        <KanbanCard key={app.id} application={app} />
                    ))}
                </SortableContext>
                {applications.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                        Arrastra aquí
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Board ---
const KanbanBoard = ({ applications, onStatusChange }) => {
    const [activeId, setActiveId] = useState(null);

    // Define columns/stages with colors
    const stages = useMemo(() => [
        { id: 'applied', title: 'Postulado', colorHeader: 'bg-blue-50', colorBorder: 'border-blue-400' },
        { id: 'interviewing', title: 'Entrevista', colorHeader: 'bg-purple-50', colorBorder: 'border-purple-400' },
        { id: 'offer', title: 'Oferta', colorHeader: 'bg-orange-50', colorBorder: 'border-orange-400' },
        { id: 'hired', title: 'Contratado', colorHeader: 'bg-green-50', colorBorder: 'border-green-400' }
    ], []);

    // Group applications by status
    const columns = useMemo(() => {
        const cols = {};
        stages.forEach(stage => cols[stage.id] = []);
        applications.forEach(app => {
            // Map backend status to column keys if needed, or assume they match
            const status = app.status || 'applied';
            if (cols[status]) {
                cols[status].push(app);
            } else {
                // Fallback for unknown status or 'reviewed' -> 'applied' bucket?
                if (status === 'reviewed') cols['applied'].push(app);
            }
        });
        return cols;
    }, [applications, stages]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 }
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeApp = applications.find(app => app.id === active.id);
        if (!activeApp) return;

        // Find target status
        let newStatus = over.id;

        // Check if dropped over a column directly
        const isOverColumn = stages.some(stage => stage.id === newStatus);

        if (!isOverColumn) {
            // If not over a column, it must be over another card
            const overApp = applications.find(app => app.id === over.id);
            if (overApp) {
                newStatus = overApp.status;
                if (newStatus === 'reviewed') newStatus = 'applied';
            } else {
                return;
            }
        }

        // Final validation that newStatus is a valid stage
        if (stages.some(s => s.id === newStatus) && activeApp.status !== newStatus) {
            console.log(`Moving application ${activeApp.id} from ${activeApp.status} to ${newStatus}`);
            onStatusChange(activeApp.id, newStatus);
        }
    };

    const activeApplication = useMemo(() =>
        applications.find(app => app.id === activeId),
        [activeId, applications]);

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Mobile: Horizontal Scroll / Desktop: Grid */}
            <div className="w-full max-w-[100vw] flex md:grid md:grid-cols-4 h-[calc(100vh-250px)] overflow-x-auto md:overflow-visible gap-4 pb-4 px-4 snap-x snap-mandatory scroll-smooth">
                {stages.map((stage) => (
                    <KanbanColumn
                        key={stage.id}
                        id={stage.id}
                        title={stage.title}
                        colorHeader={stage.colorHeader}
                        colorBorder={stage.colorBorder}
                        applications={columns[stage.id]}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId && activeApplication ? (
                    <KanbanCard application={activeApplication} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
