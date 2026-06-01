import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanItem from "./KanbanItem.jsx";

export default function KanbanColumn({ stage, items }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col w-[320px] shrink-0">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="font-bold text-text-primary uppercase tracking-widest text-xs flex items-center gap-2">
          {stage.title}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface border border-border text-[10px] text-text-muted">
            {items.length}
          </span>
        </h3>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 rounded-2xl border p-2 transition-colors ${
          isOver ? "bg-primary/5 border-primary/30" : "bg-surface/30 border-border"
        }`}
      >
        <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 min-h-[150px]">
            {items.map(candidate => (
              <KanbanItem key={candidate._id} candidate={candidate} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
