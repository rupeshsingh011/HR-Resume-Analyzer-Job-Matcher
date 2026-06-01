import { ChevronLeft, ChevronRight, Download, FileUp, Search, SlidersHorizontal, Filter, Plus, LayoutGrid, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import CandidateCard from "../components/CandidateCard.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import { useToast } from "../context/ToastContext.jsx";

const SORT_OPTIONS = [
  { label: "Recent Uploads",    value: "-createdAt" },
  { label: "Oldest First",    value: "createdAt" },
  { label: "Highest AI Score",   value: "-matches.score" },
  { label: "Seniority", value: "-experienceYears" },
  { label: "Name (A–Z)",      value: "name" },
];

export default function Dashboard() {
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skill: "", minExperience: "", minScore: "" });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState("kanban"); // "list" | "kanban"

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedFilters(filters); setPage(1); }, 300);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => { setPage(1); }, [sort]);

  useEffect(() => {
    setLoading(true);
    const params = {
      ...Object.fromEntries(Object.entries(debouncedFilters).filter(([, v]) => v)),
      sort, page
    };
    api.get("/candidates", { params })
      .then(({ data }) => {
        setCandidates(data.candidates);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch(() => toast({ message: "System error: Failed to fetch candidates.", type: "error" }))
      .finally(() => setLoading(false));
  }, [debouncedFilters, sort, page]);

  function exportCSV() {
    if (!candidates.length) return;
    const header = ["Name", "Email", "Phone", "Experience", "Skills", "Top Match", "Score", "Shortlisted"];
    const rows = candidates.map(c => {
      const topMatch = c.matches?.[0];
      return [
        `"${c.name}"`, `"${c.email || ""}"`, `"${c.phone || ""}"`,
        c.experienceYears || 0, `"${(c.skills || []).join(", ")}"`,
        `"${topMatch?.jobTitle || "None"}"`, topMatch?.score || 0,
        c.shortlisted ? "Yes" : "No"
      ].join(",");
    });
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "candidates_export.csv"; link.click();
    URL.revokeObjectURL(url);
    toast({ message: "CSV Export complete.", type: "success" });
  }

  function handleStageChange(candidateId, newStage) {
    setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, stage: newStage } : c));
    api.patch(`/candidates/${candidateId}/stage`, { stage: newStage })
      .then(() => toast({ message: "Pipeline updated.", type: "success" }))
      .catch(() => {
        toast({ message: "Failed to update stage. Reverting.", type: "error" });
        setDebouncedFilters({ ...debouncedFilters }); // trigger refresh to revert
      });
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Pipeline
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-text-primary">Candidates</h1>
          <p className="mt-3 text-text-secondary max-w-xl text-lg">
            {loading ? "Synchronizing with cloud..." : `Showing ${candidates.length} of ${total} active candidate profiles.`}
          </p>
        </div>
        <div className="flex gap-3">
           <button className="btn btn-secondary" onClick={exportCSV} disabled={!candidates.length}>
            <Download size={16} /> Export
          </button>
          <Link to="/upload" className="btn btn-primary">
            <Plus size={18} /> New Resume
          </Link>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface/30 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 text-text-muted">
          <Filter size={18} />
          <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
        </div>
        <div className="h-8 w-px bg-border hidden md:block" />
        
        <div className="flex-1 flex flex-wrap gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
            <input 
              className="field !bg-transparent pl-10" 
              placeholder="Search skills (e.g. React, Node)" 
              value={filters.skill} 
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })} 
            />
          </div>
          <input 
            className="field !bg-transparent w-28" 
            type="number" 
            placeholder="Min Exp" 
            value={filters.minExperience} 
            onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })} 
          />
          <div className="relative w-32">
            <SlidersHorizontal className="absolute left-3 top-2.5 text-text-muted" size={16} />
            <input 
              className="field !bg-transparent pl-10" 
              type="number" 
              placeholder="AI Score" 
              value={filters.minScore} 
              onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-background p-1 border border-border">
          <button 
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-surface text-primary" : "text-text-muted hover:text-text-primary"}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <LayoutList size={16} />
          </button>
          <button 
            className={`p-2 rounded-lg transition-colors ${viewMode === "kanban" ? "bg-surface text-primary" : "text-text-muted hover:text-text-primary"}`}
            onClick={() => setViewMode("kanban")}
            title="Kanban Board"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />
        
        <select 
          className="field !bg-transparent w-44 cursor-pointer" 
          value={sort} 
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card h-64 flex flex-col gap-4">
              <div className="skeleton h-8 w-1/2" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton flex-1 w-full" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-16" />
                <div className="skeleton h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : candidates.length ? (
        viewMode === "kanban" ? (
          <KanbanBoard candidates={candidates} onStageChange={handleStageChange} />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))}
            </div>
            {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 pt-10">
              <button 
                className="btn btn-secondary disabled:opacity-20" 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-bold tracking-widest text-text-secondary uppercase">
                Page <span className="text-primary">{page}</span> of {totalPages}
              </div>
              <button 
                className="btn btn-secondary disabled:opacity-20" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )) : (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface/20 py-32 text-center animate-fade-in">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-elevated text-text-muted rotate-3 shadow-xl border border-border">
            <FileUp size={48} />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">No candidates discovered</h2>
          <p className="mt-3 max-w-md text-text-secondary text-lg">
            Our AI is waiting for input. Upload resumes to see the magic happen or adjust your filters.
          </p>
          <Link to="/upload" className="btn btn-primary mt-10 scale-125">
            Initialize Upload
          </Link>
        </div>
      )}
    </div>
  );
}
