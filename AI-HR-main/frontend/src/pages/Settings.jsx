import { KeyRound, User, Shield, Info, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const { data } = await api.patch("/auth/me", payload);
      setUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
      toast({ message: "Security parameters updated.", type: "success" });
    } catch (err) {
      toast({ message: err.response?.data?.message || "Action failed.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 animate-fade-in">
      <header>
        <h1 className="text-5xl font-black tracking-tight text-text-primary">Settings</h1>
        <p className="mt-3 text-text-secondary text-lg">Configure your professional identity and workspace security.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-1">
        <form onSubmit={saveProfile} className="card bg-surface/50 border-primary/10 space-y-10">
          
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <User size={18} /> Identity Core
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Display Alias</label>
                <input className="field !bg-background" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border">
                <Info size={16} className="text-primary shrink-0" />
                <p className="text-xs text-text-muted font-medium italic">
                  Primary identifier: <span className="text-text-secondary not-italic">{user?.email}</span> (Access control locked)
                </p>
              </div>
            </div>
          </section>

          <div className="h-px bg-border" />

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-widest">
              <KeyRound size={18} /> Security Protocols
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Current Validation</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    className="field !bg-background !pl-11 !pr-11"
                    type={showCurrent ? "text" : "password"}
                    placeholder="Verification"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-3 text-text-muted">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">New Directive</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    className="field !bg-background !pl-11 !pr-11"
                    type={showNew ? "text" : "password"}
                    placeholder="Min 8 chars"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-3 text-text-muted">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
              <Shield size={16} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                Password changes invalidate active sessions on other devices for security purposes.
              </p>
            </div>
          </section>

          <button className="btn btn-primary w-full h-12 shadow-glow-primary" disabled={saving}>
            {saving ? "Updating Systems..." : "Synchronize Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
