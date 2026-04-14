import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const studentLinks = [
  { label: "Dashboard", path: "/student/dashboard", emoji: "⊞" },
  { label: "Jobs", path: "/student/jobs", emoji: "🔍" },
  { label: "Applications", path: "/student/applications", emoji: "📋" },
  { label: "Chat", path: "/student/chat", emoji: "💬" },
  { label: "Profile", path: "/student/profile", emoji: "👤" },
];

const hrLinks = [
  { label: "Dashboard", path: "/company/dashboard", emoji: "⊞" },
  { label: "Post Job", path: "/company/jobs/new", emoji: "✚" },
  { label: "Candidates", path: "/company/candidates", emoji: "🔍" },
  { label: "Profile", path: "/company/profile", emoji: "🏢" },
];

export const Sidebar = () => {
  const { isStudent, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = isStudent ? studentLinks : hrLinks;

  const displayName = user
    ? "firstName" in user
      ? `${user.firstName} ${user.lastName}`
      : (user as any).fullName
    : "";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-56 bg-dark-900 border-r border-slate-800/60 hidden lg:flex flex-col">
        <nav className="flex-1 p-3 space-y-0.5 mt-3">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary-500/15 text-primary-400 border border-primary-500/20"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50",
                )}
              >
                <span className="text-base w-5 text-center flex-shrink-0">
                  {link.emoji}
                </span>
                <span className="truncate">{link.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-primary-500/20 border border-primary-500/30 rounded-md flex items-center justify-center">
              <span className="text-primary-400 font-bold text-xs">V</span>
            </div>
            <p className="text-slate-500 text-xs truncate">{displayName}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-xl border-t border-slate-800/60 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 flex-1",
                  active ? "text-primary-400" : "text-slate-500",
                )}
              >
                <span className="text-lg leading-none">{link.emoji}</span>
                <span className="text-xs font-medium truncate">
                  {link.label}
                </span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-primary-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
