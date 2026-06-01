import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useMemo } from "react";
import KanbanColumn from "./KanbanColumn.jsx";
import KanbanItem from "./KanbanItem.jsx";

const STAGES = [
  { id: "new", title: "Sourced" },
  { id: "reviewing", title: "Reviewing" },
  { id: "shortlisted", title: "Shortlisted" },
  { id: "interview", title: "Interviewing" },
  { id: "hired", title: "Offered / Hired" },
  { id: "rejected", title: "Rejected" }
];

export default function KanbanBoard({ candidates, onStageChange }) {
  const [activeCandidate, setActiveCandidate] = useState(null);

  const columns = useMemo(() => {
    const cols = {};
    STAGES.forEach(s => cols[s.id] = []);
    candidates.forEach(c => {
      const stage = c.stage || "new";
      if (cols[stage]) cols[stage].push(c);
      else cols["new"].push(c); // fallback
    });
    return cols;
  }, [candidates]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event) {
    const { active } = event;
    const candidate = candidates.find(c => c._id === active.id);
    setActiveCandidate(candidate);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id;
    // Over can be a column (id is stage name) or another item (id is candidate id)
    const overId = over.id;

    const sourceCandidate = candidates.find(c => c._id === candidateId);
    let targetStage = overId;

    if (!STAGES.find(s => s.id === overId)) {
      // It's over a candidate, find that candidate's stage
      const overCandidate = candidates.find(c => c._id === overId);
      if (overCandidate) targetStage = overCandidate.stage || "new";
    }

    if (sourceCandidate && targetStage && sourceCandidate.stage !== targetStage) {
      onStageChange(candidateId, targetStage);
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar h-[calc(100vh-250px)] min-h-[600px]">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {STAGES.map(stage => (
          <KanbanColumn key={stage.id} stage={stage} items={columns[stage.id]} />
        ))}
        <DragOverlay>
          {activeCandidate ? <KanbanItem candidate={activeCandidate} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
