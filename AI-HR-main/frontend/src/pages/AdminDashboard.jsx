import { Trash2, Users, Briefcase, FileText, Star, ShieldAlert, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export default function AdminDashboard() {
  const toast = useToast();
  const [hrStats, setHrStats] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadStats() {
    setLoading(true);
    api.get("/admin/hr-stats")
      .then(({ data }) => setHrStats(data.hrStats))
      .catch(() => toast({ message: "Security error: Failed to access admin logs.", type: "error" }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function deleteHR(id, name) {
    if (!window.confirm(`SECURITY WARNING: Permanently expunge HR account "${name}" and all associated intelligence data?`)) return;
    try {
      await api.delete(`/admin/hr/${id}`);
      toast({ message: `Account expunged: ${name}`, type: "success" });
      loadStats();
    } catch {
      toast({ message: "Operation failed.", type: "error" });
    }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header>
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-widest mb-1">
          <ShieldAlert size={16} /> Restricted Access
        </div>
        <h1 className="text-5xl font-black tracking-tight text-text-primary">Admin Control</h1>
        <p className="mt-3 text-text-secondary text-lg">System-wide monitoring of HR activity, data isolation, and user management.</p>
      </header>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-elevated rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {hrStats.map((hr) => (
              <div key={hr._id} className="card group hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {hr.name?.[0]}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-text-primary truncate max-w-[140px]">{hr.name}</h2>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">HR Node</p>
                      </div>
                    </div>
                    <div className="badge badge-primary">ACTIVE</div>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-6 truncate">{hr.email}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox icon={FileText} count={hr.candidateCount} label="Profiles" color="text-primary" />
                    <StatBox icon={Briefcase} count={hr.jobCount} label="Listings" color="text-secondary" />
                    <div className="col-span-2">
                      <StatBox icon={Star} count={hr.shortlistedCount} label="Shortlisted Talent" color="text-accent" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteHR(hr._id, hr.name)}
                  className="btn btn-secondary mt-8 w-full border-rose-500/10 text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={16} /> Expunge Account
                </button>
              </div>
            ))}
          </div>

          {!hrStats.length && (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface/20 py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-elevated border border-border text-text-muted">
                <Users size={40} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">No HR accounts active</h2>
              <p className="mt-2 text-text-secondary">All system nodes are currently idle.</p>
            </div>
          )}
        </>
      )}

      <section className="card border-primary/10 bg-primary/5 flex items-center gap-6 p-6">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-glow-primary">
          <Activity size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-text-primary uppercase tracking-wider text-xs">Global Heartbeat</h3>
          <p className="text-sm text-text-secondary mt-0.5">Platform is healthy. Data isolation protocols are active for all {hrStats.length} HR accounts.</p>
        </div>
      </section>
    </div>
  );
}

function StatBox({ icon: Icon, count, label, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background border border-border p-3 transition-colors hover:border-white/10 group">
      <div className={`shrink-0 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-lg font-black text-text-primary leading-tight">{count}</div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{label}</div>
      </div>
    </div>
  );
}
