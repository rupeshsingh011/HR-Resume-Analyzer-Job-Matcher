import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/candidates", { params: { skill: query } });
        setResults(data.candidates.slice(0, 8));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  function select(candidate) {
    navigate(`/candidates/${candidate._id}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-line bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="text-slate-400">🔍</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-slate-400"
            placeholder="Search candidates by name or skill..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Escape" && onClose()}
          />
          <kbd className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Esc</kbd>
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map(c => (
              <li key={c._id}>
                <button
                  onClick={() => select(c)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                    {c.name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{c.name}</div>
                    <div className="text-xs text-slate-500">{(c.skills || []).slice(0,4).join(" · ")}</div>
                  </div>
                  <span className="ml-auto text-xs text-slate-400">{c.experienceYears}y exp</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query && !loading && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No candidates found for "{query}"</p>
        )}

        <div className="border-t border-line px-4 py-2 text-xs text-slate-400">
          Press <kbd className="rounded bg-slate-100 px-1">↵</kbd> to open · <kbd className="rounded bg-slate-100 px-1">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
