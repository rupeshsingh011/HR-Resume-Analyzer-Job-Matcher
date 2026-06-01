export default function ScoreBar({ score = 0 }) {
  const colorClass = score >= 80 
    ? "bg-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
    : score >= 60 
      ? "bg-secondary shadow-[0_0_10px_rgba(56,189,248,0.3)]" 
      : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">AI Relevance</span>
        <span className={`text-xs font-bold ${score >= 80 ? 'text-primary' : score >= 60 ? 'text-secondary' : 'text-rose-400'}`}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
