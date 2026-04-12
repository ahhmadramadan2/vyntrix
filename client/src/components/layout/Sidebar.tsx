import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const studentLinks = [
  { label: "Dashboard", path: "/student/dashboard", emoji: "⊞" },
  { label: "Browse Jobs", path: "/student/jobs", emoji: "🔍" },
  { label: "Applications", path: "/student/applications", emoji: "📋" },
  { label: "Chat", path: "/student/chat", emoji: "💬" },
  { label: "Profile", path: "/student/profile", emoji: "👤" },
];

const hrLinks = [
  { label: "Dashboard", path: "/company/dashboard", emoji: "⊞" },
  { label: "Post a Job", path: "/company/jobs/new", emoji: "✚" },
  { label: "Candidates", path: "/company/candidates", emoji: "🔍" },
  { label: "Company Profile", path: "/company/profile", emoji: "🏢" },
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
    <aside className="fixed left-0 top-16 bottom-0 w-56 bg-dark-900 border-r border-slate-800/60 hidden lg:flex flex-col">
      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-0.5 mt-3">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-primary-500/15 text-primary-400 border border-primary-500/20 shadow-sm"
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

      {/* Bottom */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-primary-500/20 border border-primary-500/30 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-primary-400 font-bold text-xs">V</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-xs font-medium truncate">
              {displayName}
            </p>
            <p className="text-slate-700 text-xs">Vyntrix v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
