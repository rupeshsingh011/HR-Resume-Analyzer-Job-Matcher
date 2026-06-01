import { Briefcase, Plus, ToggleLeft, ToggleRight, Info, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const EMPTY_FORM = { title: "", department: "", description: "", requiredSkills: "", preferredEducation: "Bachelor", minExperienceYears: 3 };

export default function Jobs() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("all");

  function load() {
    api.get("/jobs").then(({ data }) => setJobs(data.jobs));
  }

  useEffect(load, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post("/jobs", {
        ...form,
        minExperienceYears: Number(form.minExperienceYears),
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
      });
      setForm(EMPTY_FORM);
      load();
      toast({ message: "Job descriptor published to pipeline.", type: "success" });
    } catch {
      toast({ message: "System error: Failed to create job.", type: "error" });
    }
  }

  async function toggleStatus(job) {
    try {
      const { data } = await api.patch(`/jobs/${job._id}/toggle-status`);
      setJobs(prev => prev.map(j => j._id === job._id ? data.job : j));
      toast({ message: `Listing status: ${data.job.status.toUpperCase()}`, type: "info" });
    } catch {
      toast({ message: "Action failed.", type: "error" });
    }
  }

  const filtered = jobs.filter(j => filter === "all" || j.status === filter);

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h1 className="text-5xl font-black tracking-tight text-text-primary">Positions</h1>
        <p className="mt-3 text-text-secondary text-lg">Define role requirements to synchronize AI matching logic.</p>
      </header>

      <div className="grid gap-10 xl:grid-cols-[400px_1fr]">
        {/* Form Column */}
        <section>
          <form onSubmit={submit} className="card sticky top-24 bg-surface/50 border-primary/10">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="text-primary" size={20} /> Create New Descriptor
            </h2>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Job Identity</label>
                <input className="field" placeholder="e.g. Principal Software Engineer" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Department</label>
                <input className="field" placeholder="e.g. Engineering, Product" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Context & Details</label>
                <textarea className="field min-h-[120px] py-3" placeholder="Describe core responsibilities..." required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Technical Stack (Comma separated)</label>
                <input className="field" placeholder="React, Node.js, AWS" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Experience</label>
                  <input className="field" type="number" min="0" placeholder="Years" value={form.minExperienceYears} onChange={(e) => setForm({ ...form, minExperienceYears: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Education</label>
                  <input className="field" placeholder="e.g. PhD, MS" value={form.preferredEducation} onChange={(e) => setForm({ ...form, preferredEducation: e.target.value })} />
                </div>
              </div>
            </div>
            <button className="btn btn-primary w-full mt-8 h-12 shadow-glow-primary">
              Publish Role
            </button>
          </form>
        </section>

        {/* List Column */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <Layers size={16} /> Active Listings ({jobs.length})
            </div>
            <div className="flex gap-1 rounded-xl bg-surface border border-border p-1 shadow-inner-glass">
              {["all","open","closed"].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition-all ${
                    filter === f 
                      ? "bg-elevated text-primary shadow-sm" 
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface/20 py-24 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-elevated text-text-muted border border-border">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-xl font-bold text-text-primary">No positions matching "{filter}"</h3>
                <p className="mt-2 text-text-muted">Populate your pipeline by creating a job descriptor.</p>
              </div>
            )}
            {filtered.map((job) => (
              <article key={job._id} className="card group hover:scale-[1.01]">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black tracking-tight text-text-primary">{job.title}</h3>
                      <span className={`badge ${job.status === "open" ? "badge-primary" : "badge-muted"}`}>
                        {job.status || "open"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                      <span>{job.department}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{job.minExperienceYears}+ Years Req.</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStatus(job)} 
                    className="btn btn-secondary !rounded-xl text-xs py-2 group-hover:border-primary/20 transition-all"
                  >
                    {job.status === "closed"
                      ? <><ToggleLeft size={18} className="text-text-muted" /> Re-open</>
                      : <><ToggleRight size={18} className="text-primary" /> Close Role</>
                    }
                  </button>
                </div>
                
                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border">
                  <Info size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed text-text-secondary italic">"{job.description}"</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill) => (
                    <span className="badge badge-muted bg-white/5 border-white/5 font-semibold text-[10px] tracking-wide" key={skill}>
                      {skill.toUpperCase()}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
