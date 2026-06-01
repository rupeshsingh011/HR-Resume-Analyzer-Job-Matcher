import { BarChart3, BriefcaseBusiness, FileUp, LayoutDashboard, LogOut, Search, Settings, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import CommandPalette from "./CommandPalette.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const baseLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: FileUp },
  { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const links = user?.role === "Admin"
    ? [...baseLinks, { to: "/admin", label: "Admin Panel", icon: Shield }]
    : baseLinks;

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))) {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "u" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName) && !e.ctrlKey && !e.metaKey) {
        navigate("/upload");
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow-primary">
              <Zap size={20} className="text-background fill-background" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-text-primary">Smart HR</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted">AI Recruiting</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary shadow-inner-glass border border-primary/10" 
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`
              }
            >
              <Icon size={18} className="transition-colors" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-elevated/50 px-4 py-2.5 text-sm text-text-muted hover:border-border-hover hover:text-text-secondary transition-all"
          >
            <Search size={16} /> 
            <span>Search...</span>
            <kbd className="ml-auto rounded bg-border px-1.5 py-0.5 text-[10px] font-bold">⌘K</kbd>
          </button>

          <div className="mt-4 rounded-2xl bg-gradient-to-br from-surface to-elevated p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 p-0.5">
                 <div className="h-full w-full rounded-full bg-surface flex items-center justify-center text-primary font-bold">
                   {user?.name?.[0]}
                 </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-semibold">{user?.name}</div>
                <div className="truncate text-[10px] text-text-muted uppercase tracking-wider">{user?.role}</div>
              </div>
              <NavLink to="/settings" className="text-text-muted hover:text-text-primary">
                <Settings size={16} />
              </NavLink>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            <span className="font-bold">Smart HR</span>
          </div>
          <button onClick={() => setPaletteOpen(true)} className="rounded-lg border border-border p-2">
            <Search size={18} />
          </button>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
