import { CheckCircle2, Clock, FileUp, XCircle, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export default function UploadResume() {
  const navigate = useNavigate();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState([]); 
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setFileStatuses(selected.map(f => ({ name: f.name, status: "waiting" })));
  }

  async function submit(event) {
    event.preventDefault();
    if (!files.length) return;
    setUploading(true);

    setFileStatuses(files.map(f => ({ name: f.name, status: "processing" })));

    const form = new FormData();
    for (const file of files) form.append("resumes", file);

    try {
      const { data } = await api.post("/candidates/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFileStatuses(files.map(f => ({ name: f.name, status: "done" })));
      toast({ message: `Intelligence core processed ${data.candidates.length} profiles.`, type: "success" });
      setTimeout(() => {
        if (data.candidates.length === 1) navigate(`/candidates/${data.candidates[0]._id}`);
        else navigate("/");
      }, 1500);
    } catch (err) {
      setFileStatuses(files.map(f => ({ name: f.name, status: "error" })));
      const message = err?.response?.data?.message || "Analysis engine encountered an error.";
      toast({ message, type: "error" });
    } finally {
      setUploading(false);
    }
  }

  const statusIcon = (status) => {
    if (status === "waiting")    return <Clock size={16} className="text-text-muted" />;
    if (status === "processing") return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
    if (status === "done")       return <CheckCircle2 size={16} className="text-primary shadow-glow-primary" />;
    if (status === "error")      return <XCircle size={16} className="text-rose-500" />;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-fade-in">
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
           <Zap size={32} className="fill-primary/20" />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-text-primary">Ingest Intelligence</h1>
        <p className="mt-4 text-text-secondary text-lg">Our neural engine parses raw resumes into structured hiring insights with high-precision scoring.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
         <section className="card bg-surface/50 border-primary/10 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-text-primary mb-4">Upload Directives</h3>
            <ul className="space-y-4">
              {[
                { icon: ShieldCheck, title: "Secure Processing", desc: "Enterprise-grade encryption for all PII data." },
                { icon: Zap, title: "Neural Analysis", desc: "Deep extraction of skills and career progression." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-xl bg-background border border-border">
                  <item.icon size={20} className="text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-text-primary">{item.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
         </section>

         <form onSubmit={submit} className="card shadow-2xl border-primary/5">
            <label className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-8 text-center transition-all duration-300 ${uploading ? "border-border bg-background/50 cursor-not-allowed" : "border-border bg-background/30 hover:border-primary/50 hover:bg-primary/5"}`}>
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated border border-border transition-transform group-hover:scale-110 group-hover:rotate-3 ${uploading ? 'animate-pulse' : ''}`}>
                <FileUp className={uploading ? "text-text-muted" : "text-primary"} size={28} />
              </div>
              <span className="text-lg font-bold text-text-primary">
                {files.length ? `${files.length} Packages Ready` : "Drop Resume Files"}
              </span>
              <span className="mt-2 text-xs font-medium text-text-muted uppercase tracking-widest">
                PDF / DOCX · MULTI-BATCH ENCOURAGED
              </span>
              <input className="hidden" type="file" multiple accept=".pdf,.docx" disabled={uploading} onChange={handleFileChange} />
            </label>

            {fileStatuses.length > 0 && (
              <div className="mt-6 space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {fileStatuses.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border animate-fade-in">
                    <span className="truncate text-xs font-semibold text-text-secondary max-w-[200px]">{f.name}</span>
                    <span className={`flex items-center gap-2 px-2 py-1 rounded-lg bg-surface text-[10px] font-bold uppercase tracking-tighter ${f.status === 'done' ? 'text-primary' : 'text-text-muted'}`}>
                      {statusIcon(f.status)}
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary w-full mt-8 h-14 text-lg shadow-glow-primary group" disabled={!files.length || uploading}>
              {uploading ? "Analyzing Core Data..." : (
                <span className="flex items-center gap-2">
                   Execute Intelligence Parse
                   <Zap size={18} className="fill-background group-hover:animate-pulse" />
                </span>
              )}
            </button>
         </form>
      </div>
    </div>
  );
}
