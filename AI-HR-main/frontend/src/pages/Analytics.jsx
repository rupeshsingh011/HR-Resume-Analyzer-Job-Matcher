import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts";
import { api } from "../api/client.js";
import { TrendingUp, Users, Star, Target, Zap } from "lucide-react";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setAnalytics(data));
  }, []);

  if (!analytics) return <AnalyticsSkeleton />;

  const distribution = Object.entries(analytics.distribution).map(([name, value]) => ({ name, value }));
  const COLORS = ["#10b981", "#38bdf8", "#8b5cf6", "#f59e0b", "#f43f5e"];

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
          <TrendingUp size={16} /> Performance Insights
        </div>
        <h1 className="text-5xl font-black tracking-tight text-text-primary">Analytics</h1>
        <p className="mt-3 text-text-secondary text-lg">Statistical breakdown of your talent pipeline and AI matching precision.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard icon={Users} label="Total Pipeline" value={analytics.total} sub="Candidate profiles" color="text-primary" />
        <MetricCard icon={Star} label="Shortlisted" value={analytics.shortlisted} sub="High potential" color="text-secondary" />
        <MetricCard icon={Target} label="Precision" value={`${analytics.averageScore}%`} sub="Avg. match score" color="text-accent" />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <ChartContainer title="Skill Market Distribution" sub="Most frequently occurring proficiencies in your database">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analytics.commonSkills} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e222d" vertical={false} />
              <XAxis dataKey="skill" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f1117", borderColor: "#1e222d", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#f8fafc" }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Pipeline Health" sub="Stage distribution across the recruitment workflow">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie 
                data={distribution} 
                dataKey="value" 
                nameKey="name" 
                innerRadius={80} 
                outerRadius={110} 
                paddingAngle={5}
                stroke="none"
              >
                {distribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f1117", borderColor: "#1e222d", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ color: "#f8fafc" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {distribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      <section className="card bg-primary/5 border-primary/10 flex items-center justify-between p-8">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Intelligence Core Status</h3>
          <p className="text-text-secondary mt-1">AI Matcher is currently operating at peak precision with neural parsing enabled.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-background shadow-glow-primary animate-pulse">
          <Zap size={24} className="fill-background" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card group hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${color}`}>
          <Icon size={20} />
        </div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Live Data</div>
      </div>
      <div className="text-sm font-semibold text-text-secondary">{label}</div>
      <div className="mt-1 text-4xl font-black text-text-primary tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-text-muted font-medium">{sub}</div>
    </div>
  );
}

function ChartContainer({ title, sub, children }) {
  return (
    <section className="card">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
        <p className="text-xs text-text-muted mt-1 font-medium">{sub}</p>
      </div>
      {children}
    </section>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-20 w-1/2 bg-elevated rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-elevated rounded-2xl" />)}
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <div className="h-96 bg-elevated rounded-2xl" />
        <div className="h-96 bg-elevated rounded-2xl" />
      </div>
    </div>
  );
}
