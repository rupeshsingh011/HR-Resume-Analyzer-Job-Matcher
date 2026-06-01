import { Download, RefreshCcw, Star, Trash2, Mail, Phone, Briefcase, GraduationCap, Award, BookOpen, MessageSquare, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import ResumePreview from "../components/ResumePreview.jsx";
import ScoreBar from "../components/ScoreBar.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");

  function load() {
    setLoading(true);
    api.get(`/candidates/${id}`)
      .then(({ data }) => setCandidate(data.candidate))
      .catch(() => toast({ message: "System error: Failed to fetch candidate profile.", type: "error" }))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "s" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName) && !e.ctrlKey && !e.metaKey && candidate) {
        shortlist();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [candidate]);

  async function shortlist() {
    try {
      const { data } = await api.patch(`/candidates/${id}/shortlist`, { shortlisted: !candidate.shortlisted });
      setCandidate(data.candidate);
      toast({ message: data.candidate.shortlisted ? "Candidate pinned to shortlist." : "Candidate removed from shortlist.", type: "success" });
    } catch {
      toast({ message: "Action failed.", type: "error" });
    }
  }

  async function rematch() {
    try {
      toast({ message: "Re-analyzing profile...", type: "info" });
      const { data } = await api.post(`/candidates/${id}/rematch`);
      setCandidate(data.candidate);
      toast({ message: "AI Re-analysis complete.", type: "success" });
    } catch {
      toast({ message: "Analysis failed.", type: "error" });
    }
  }

  async function downloadReport() {
    try {
      const { data } = await api.get(`/candidates/${id}/report`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${candidate.name.replace(/\s+/g, "_")}_report.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ message: "Analysis report downloaded.", type: "success" });
    } catch {
      toast({ message: "Download failed.", type: "error" });
    }
  }

  async function deleteCandidate() {
    if (!window.confirm("Confirm permanent deletion of this candidate profile?")) return;
    try {
      await api.delete(`/candidates/${id}`);
      toast({ message: "Profile expunged.", type: "success" });
      navigate("/");
    } catch {
      toast({ message: "Deletion failed.", type: "error" });
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const { data } = await api.post(`/candidates/${id}/notes`, { text: noteText });
      setCandidate(prev => ({ ...prev, notes: data.notes }));
      setNoteText("");
      toast({ message: "Private note recorded.", type: "success" });
    } catch {
      toast({ message: "Note failed.", type: "error" });
    }
  }

  async function removeNote(noteId) {
    try {
      const { data } = await api.delete(`/candidates/${id}/notes/${noteId}`);
      setCandidate(prev => ({ ...prev, notes: data.notes }));
    } catch {
      toast({ message: "Action failed.", type: "error" });
    }
  }

  async function changeStage(stage) {
    try {
      const { data } = await api.patch(`/candidates/${id}/stage`, { stage });
      setCandidate(prev => ({ ...prev, stage: data.candidate.stage }));
      toast({ message: `Hiring workflow updated: ${stage.toUpperCase()}`, type: "success" });
    } catch {
      toast({ message: "Workflow update failed.", type: "error" });
    }
  }

  if (loading) return <CandidateSkeleton />;
  if (!candidate) return <div className="p-20 text-center text-text-muted font-bold text-xl">Candidate not found.</div>;
  const topMatch = candidate.matches?.[0];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Profile Section */}
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex gap-6 items-center">
           <div className="h-24 w-24 rounded-3xl bg-elevated border border-border flex items-center justify-center text-primary text-4xl font-black shadow-2xl rotate-3">
             {candidate.name?.[0]}
           </div>
           <div>
             <h1 className="text-5xl font-black tracking-tight text-text-primary">{candidate.name}</h1>
             <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-secondary font-medium">
               <span className="flex items-center gap-1.5"><Mail size={16} className="text-primary" /> {candidate.email || "N/A"}</span>
               <span className="flex items-center gap-1.5"><Phone size={16} className="text-primary" /> {candidate.phone || "N/A"}</span>
               <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-primary" /> {candidate.experienceYears || 0} Years Exp</span>
             </div>
           </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary border-rose-500/20 text-rose-400 hover:bg-rose-500/10" onClick={deleteCandidate}>
            <Trash2 size={18} /> Delete
          </button>
          <button className="btn btn-secondary" onClick={rematch}>
            <RefreshCcw size={18} /> Analyze
          </button>
          <button className={`btn ${candidate.shortlisted ? 'btn-primary' : 'btn-secondary'}`} onClick={shortlist}>
            <Star size={18} className={candidate.shortlisted ? 'fill-background' : ''} />
            {candidate.shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Main Content Column */}
        <div className="space-y-8">
          <StagePipeline current={candidate.stage || "new"} onChange={changeStage} />

          <section className="card bg-primary/5 border-primary/10">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-4">
              <MessageSquare size={16} /> AI Intelligence Summary
            </div>
            <p className="text-lg leading-relaxed text-text-secondary">
              {candidate.analysis?.summary}
            </p>
          </section>

          <ResumePreview
            candidateId={id}
            candidateName={candidate.name}
            resumeFile={candidate.resumeFile}
            resumeText={candidate.resumeText}
          />

          <div className="grid gap-8 md:grid-cols-2">
             <SectionCard title="Skills & Proficiencies" icon={Award} items={candidate.skills} />
             <SectionCard title="Experience Timeline" icon={Briefcase} items={candidate.workExperience} />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
             <SectionCard title="Educational Background" icon={GraduationCap} items={candidate.education} />
             <SectionCard title="Notable Projects" icon={BookOpen} items={candidate.projects} />
          </div>

          <section className="card">
            <h3 className="text-xl font-bold text-text-primary mb-6">Private Hiring Notes</h3>
            <form onSubmit={addNote} className="flex gap-3 mb-8">
              <input
                className="field !bg-background"
                placeholder="Log a private interview thought or feedback..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <button className="btn btn-primary" disabled={!noteText.trim()}>Add</button>
            </form>
            <div className="space-y-3">
              {(candidate.notes || []).length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-text-muted text-sm italic">
                  No private notes recorded for this candidate.
                </div>
              ) : (
                candidate.notes.map(note => (
                  <div key={note._id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-background border border-border group">
                    <p className="text-sm text-text-secondary leading-relaxed">{note.text}</p>
                    <button onClick={() => removeNote(note._id)} className="text-text-muted hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <aside className="space-y-8">
           <div className="card border-primary/20 bg-gradient-to-br from-surface to-elevated">
              <h3 className="text-xl font-bold text-text-primary mb-6">Match Intelligence</h3>
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Top Alignment</div>
                <div className="text-lg font-extrabold text-primary">{topMatch?.jobTitle || "Waiting for job match..."}</div>
              </div>
              <ScoreBar score={topMatch?.score || 0} />
              <div className="mt-6 text-sm leading-relaxed text-text-secondary bg-background/50 rounded-xl p-4 border border-border">
                {topMatch?.reasoning}
              </div>
              <button className="btn btn-secondary w-full mt-6" onClick={downloadReport}>
                <Download size={18} /> Export Analysis Report
              </button>
           </div>

           <div className="card">
              <h3 className="text-lg font-bold text-text-primary mb-4">Missing Proficiencies</h3>
              <div className="flex flex-wrap gap-2">
                {(topMatch?.missingSkills || candidate.analysis?.skillGaps || []).map((skill) => (
                  <span key={skill} className="badge bg-rose-500/10 text-rose-400 border-rose-500/20">{skill}</span>
                ))}
              </div>
           </div>

           <div className="card">
              <h3 className="text-lg font-bold text-text-primary mb-4">Suggested Interview Focus</h3>
              <ul className="space-y-4">
                {(candidate.analysis?.interviewQuestions || []).map((q, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-3 italic">
                    <span className="text-primary font-black not-italic">{i+1}.</span>
                    "{q}"
                  </li>
                ))}
              </ul>
           </div>
        </aside>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, items = [] }) {
  if (!items.length) return null;
  return (
    <section className="card">
      <div className="flex items-center gap-2 font-bold text-text-primary mb-4">
        <Icon size={18} className="text-primary" />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span className="badge badge-muted py-1.5 px-3" key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function CandidateSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="flex gap-6 items-center">
        <div className="h-24 w-24 rounded-3xl bg-elevated" />
        <div className="space-y-3">
          <div className="h-10 w-64 bg-elevated rounded-xl" />
          <div className="h-4 w-96 bg-elevated rounded-lg" />
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="h-32 w-full bg-elevated rounded-2xl" />
          <div className="h-80 w-full bg-elevated rounded-2xl" />
          <div className="h-64 w-full bg-elevated rounded-2xl" />
        </div>
        <div className="h-96 w-full bg-elevated rounded-2xl" />
      </div>
    </div>
  );
}

const STAGES = [
  { key: "new",         label: "New",         color: "border-text-muted text-text-muted" },
  { key: "reviewing",   label: "Reviewing",   color: "border-secondary text-secondary" },
  { key: "shortlisted", label: "Shortlisted", color: "border-accent text-accent" },
  { key: "interview",   label: "Interview",   color: "border-amber text-amber" },
  { key: "hired",       label: "Hired",       color: "border-primary text-primary" },
  { key: "rejected",    label: "Rejected",    color: "border-rose-500 text-rose-400" },
];

function StagePipeline({ current, onChange }) {
  return (
    <div className="card bg-background/30">
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Workflow Progression</p>
      <div className="flex flex-wrap gap-3">
        {STAGES.map(({ key, label, color }) => {
          const isActive = current === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 border-2 ${
                isActive
                  ? `${color} bg-white/5 scale-105 shadow-lg`
                  : "bg-transparent border-border text-text-muted hover:border-border-hover hover:text-text-secondary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
