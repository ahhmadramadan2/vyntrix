import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../ui/Avatar";
import { NotificationBell } from "../ui/NotificationBell";
import api from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchResult {
  type: "job" | "student" | "company";
  id: number;
  title: string;
  subtitle: string;
}

export const Navbar = () => {
  const { user, role, clearAuth, isStudent } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 350);

  const displayName = user
    ? "firstName" in user
      ? `${user.firstName} ${user.lastName}`
      : (user as any).fullName
    : "";

  const avatarUrl =
    user && "profile" in user ? (user as any).profile?.avatarUrl : undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setShowDrop(false);
      return;
    }
    setSearching(true);

    const searches: Promise<any>[] = [
      api
        .get(`/jobs?title=${debouncedQuery}`)
        .catch(() => ({ data: { data: [] } })),
    ];

    if (isStudent) {
      searches.push(
        api
          .get(`/chat/search?q=${debouncedQuery}`)
          .catch(() => ({ data: { data: [] } })),
      );
    }

    Promise.all(searches)
      .then(([jobsRes, studentsRes]) => {
        const items: SearchResult[] = [];
        jobsRes.data.data?.slice(0, 4).forEach((j: any) => {
          items.push({
            type: "job",
            id: j.id,
            title: j.title,
            subtitle: j.company?.companyName + " · " + j.location,
          });
        });
        studentsRes?.data.data?.slice(0, 3).forEach((s: any) => {
          items.push({
            type: "student",
            id: s.id,
            title: `${s.firstName} ${s.lastName}`,
            subtitle: s.department,
          });
        });
        setResults(items);
        setShowDrop(true);
      })
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const handleResultClick = (result: SearchResult) => {
    setQuery("");
    setShowDrop(false);
    if (result.type === "job") {
      navigate(
        isStudent
          ? `/student/jobs/${result.id}`
          : `/company/jobs/${result.id}/applicants`,
      );
    } else if (result.type === "student") {
      navigate("/student/chat");
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl border-b border-slate-800/60 h-16">
      <div className="flex items-center h-full px-3 sm:px-4 gap-2 sm:gap-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          onClick={() =>
            navigate(isStudent ? "/student/dashboard" : "/company/dashboard")
          }
        >
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            Vyntrix
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder={
                isStudent
                  ? "Search jobs, students..."
                  : "Search jobs, candidates..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowDrop(true)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-800 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm transition-all"
            />
          </div>

          {showDrop && results.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-dark-800 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleResultClick(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/30 transition-all text-left border-b border-slate-700/20 last:border-0"
                >
                  <span className="text-lg flex-shrink-0">
                    {r.type === "job"
                      ? "💼"
                      : r.type === "student"
                        ? "🎓"
                        : "🏢"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {r.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <NotificationBell />

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() =>
              navigate(isStudent ? "/student/profile" : "/company/profile")
            }
          >
            <Avatar name={displayName} avatarUrl={avatarUrl} size="sm" />
            <div className="hidden md:block text-right">
              <p className="text-xs font-medium text-slate-200 leading-none">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {role === "STUDENT" ? "Student" : "HR"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all border border-slate-700/50 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
