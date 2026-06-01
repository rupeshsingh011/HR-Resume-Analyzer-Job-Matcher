import { Lock, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) return setError("Invalid reset link.");
    
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast({ message: "Password reset successful! You can now log in.", type: "success" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="card w-full max-w-md border-primary/10 shadow-2xl bg-surface/50 backdrop-blur-xl p-8 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">New Password</h2>
          <p className="mt-2 text-text-muted text-sm">Secure your account with a new access key.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-text-muted" size={16} />
              <input 
                required
                type={showPassword ? "text" : "password"}
                className="field !pl-11 !pr-11" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !token}
            className="btn btn-primary w-full h-12 text-base shadow-glow-primary"
          >
            {loading ? "Updating..." : (
              <span className="flex items-center gap-2 font-bold">
                Update Password
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
