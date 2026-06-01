import { BrainCircuit, Zap, ArrowRight, UserPlus, LogIn, Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../api/client.js";

export default function Login() {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else if (mode === "register") {
        await register(form);
        toast({ message: "Account created successfully!", type: "success" });
      } else if (mode === "forgot") {
        await api.post("/auth/forgot-password", { email: form.email });
        toast({ message: "Password reset link sent to your email.", type: "success" });
        setMode("login");
        return;
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSuccess(response) {
    try {
      setLoading(true);
      await googleLogin(response.credential);
      navigate("/");
    } catch (err) {
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        
        {/* Left Side: Branding */}
        <section className="hidden space-y-8 lg:block animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-glow-primary">
              <Zap size={28} className="text-background fill-background" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Smart HR</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-6xl font-extrabold leading-[1.1] tracking-tight text-text-primary">
              Hire with <span className="text-primary underline decoration-primary/30">Precision.</span>
            </h2>
            <p className="max-w-md text-xl text-text-secondary leading-relaxed">
              The industry standard for AI-backed talent acquisition and automated resume intelligence.
            </p>
          </div>

          <div className="grid gap-6 pt-6">
            {[
              { icon: Shield, title: "Identity Vault", desc: "Secure encrypted storage for all HR operations." },
              { icon: BrainCircuit, title: "Neural Matching", desc: "High-precision scoring against job descriptors." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border shadow-inner-glass">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Side: Form */}
        <section className="animate-fade-in flex flex-col justify-center">
          <div className="card w-full max-w-md border-primary/10 shadow-2xl lg:mx-auto bg-surface/50 backdrop-blur-xl p-8">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-text-primary capitalize">
                {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
              </h2>
              <p className="mt-2 text-text-muted text-sm">
                {mode === "login" ? "Enter your credentials to access your workspace." : mode === "register" ? "Join the future of recruitment intelligence." : "Enter your email to receive a recovery link."}
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Full Name</label>
                  <input 
                    required
                    className="field" 
                    placeholder="John Doe"
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input 
                    required
                    type="email"
                    className="field !pl-11" 
                    placeholder="name@company.com"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Password</label>
                    {mode === "login" && (
                      <button type="button" onClick={() => setMode("forgot")} className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-text-muted" size={16} />
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      className="field !pl-11 !pr-11" 
                      placeholder="••••••••"
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
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
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-full h-12 mt-2 text-base shadow-glow-primary"
              >
                {loading ? "Synchronizing..." : (
                  <span className="flex items-center gap-2 font-bold">
                    {mode === "login" ? "Access Workspace" : mode === "register" ? "Create Account" : "Send Reset Link"}
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            {mode === "login" && (
              <div className="mt-6 space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border"></div>
                  <span className="absolute bg-surface px-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Or Connect with</span>
                </div>
                
                <div className="flex justify-center">
                  <GoogleLogin 
                    onSuccess={onGoogleSuccess} 
                    onError={() => setError("Google auth failed")}
                    theme="filled_black"
                    shape="pill"
                    width="100%"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border text-center">
              <button 
                type="button" 
                className="text-sm font-bold text-text-secondary hover:text-primary transition-colors"
                onClick={() => {
                  setError("");
                  setMode(mode === "login" ? "register" : "login");
                }}
              >
                {mode === "login" ? (
                  <span className="flex items-center gap-2"><UserPlus size={16} /> New here? Create an account</span>
                ) : (
                  <span className="flex items-center gap-2"><LogIn size={16} /> Already have an account? Sign in</span>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
