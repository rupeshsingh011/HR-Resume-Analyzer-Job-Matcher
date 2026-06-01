import { Mail, Star, ExternalLink, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import ScoreBar from "./ScoreBar.jsx";

export default function CandidateCard({ candidate }) {
  const topMatch = candidate.matches?.[0];

  return (
    <article className="card group animate-fade-in">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex-1 overflow-hidden">
          <Link 
            to={`/candidates/${candidate._id}`} 
            className="flex items-center gap-2 text-xl font-bold text-text-primary hover:text-primary transition-colors"
          >
            <span className="truncate">{candidate.name}</span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <Mail size={12} />
            <span className="truncate">{candidate.email || "No email captured"}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {candidate.shortlisted && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/10 text-amber shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Star className="fill-amber" size={16} />
            </div>
          )}
          <div className="badge badge-muted">
             {candidate.stage || "New"}
          </div>
        </div>
      </div>

      <div className="mb-5 space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar size={12} />
          <span>{candidate.experienceYears || 0} years experience</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <MapPin size={12} />
          <span className="truncate">{topMatch?.jobTitle || "Unmatched"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <ScoreBar score={topMatch?.score || 0} />
        
        <div className="flex flex-wrap gap-1.5 pt-2">
          {(candidate.skills || []).slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              {skill}
            </span>
          ))}
          {candidate.skills?.length > 3 && (
            <span className="text-[10px] text-text-muted font-bold flex items-center px-1">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
