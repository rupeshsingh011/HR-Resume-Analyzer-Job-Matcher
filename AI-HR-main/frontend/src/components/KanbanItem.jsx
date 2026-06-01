import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import ScoreBar from "./ScoreBar.jsx";

export default function KanbanItem({ candidate, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const topMatch = candidate.matches?.[0];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`card p-4 flex flex-col gap-3 group relative bg-surface hover:border-primary/30 transition-colors ${isOverlay ? "shadow-2xl border-primary/50 rotate-2 scale-105" : "shadow-md cursor-grab active:cursor-grabbing"}`}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 text-text-muted hover:text-primary cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </button>
        
        <div className="flex-1 overflow-hidden">
          <Link to={`/candidates/${candidate._id}`} className="font-bold text-sm text-text-primary hover:text-primary truncate block pr-6">
            {candidate.name}
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
            <MapPin size={10} />
            <span className="truncate">{topMatch?.jobTitle || "Unmatched"}</span>
          </div>
        </div>
        
        {candidate.shortlisted && (
          <div className="absolute right-3 top-3 text-amber">
            <Star size={14} className="fill-amber" />
          </div>
        )}
      </div>

      <div className="pl-6 space-y-2">
        <ScoreBar score={topMatch?.score || 0} />
        
        <div className="flex flex-wrap gap-1">
          {(candidate.skills || []).slice(0, 2).map((skill) => (
            <span key={skill} className="rounded bg-background border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
              {skill}
            </span>
          ))}
          {candidate.skills?.length > 2 && (
            <span className="text-[9px] text-text-muted font-bold flex items-center">
              +{candidate.skills.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
