import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import type { Application, MatchResult } from "../../types";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ApplicantModal } from "../../components/company/ApplicantModal";
import { useUiStore } from "../../store/uiStore";
import { formatDate, getStatusColor } from "../../lib/utils";

export const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUiStore();

  const [applicants, setApplicants] = useState<Application[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/applications/job/${jobId}`),
      api.get(`/matching/job/${jobId}`),
    ])
      .then(([appRes, matchRes]) => {
        setApplicants(appRes.data.data);
        setMatches(matchRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (appId: number, status: string) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, applicationStatus: status as any } : a,
        ),
      );
      addToast(`Application ${status.toLowerCase()}`, "success");
    } catch {
      addToast("Failed to update status", "error");
    }
  };

  const getMatch = (studentId: number) =>
    matches.find((m) => m.studentId === studentId) || null;

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Applicants</h1>
          <p className="text-slate-400">
            {applicants.length} applications received
          </p>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-12 text-center">
          <p className="text-slate-400">No applications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => {
            const match = getMatch(app.studentId);
            const score = match ? Math.round(match.matchScore) : null;
            const fullName = `${app.student?.firstName} ${app.student?.lastName}`;

            return (
              <div
                key={app.id}
                className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 hover:border-primary-500/30 transition-all cursor-pointer"
                onClick={() => setSelected(app)}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    name={fullName}
                    avatarUrl={app.student?.profile?.avatarUrl}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{fullName}</h3>
                      <Badge className={getStatusColor(app.applicationStatus)}>
                        {app.applicationStatus}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {app.student?.email}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">
                        GPA: {app.student?.gpa?.toFixed(2) ?? "N/A"} / 4.0
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {app.student?.university?.name}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        Applied {formatDate(app.applicationDate)}
                      </span>
                    </div>
                  </div>

                  {/* Score badge */}
                  {score !== null && (
                    <div
                      className={`text-center px-4 py-2 rounded-xl border ${
                        score >= 75
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : score >= 50
                            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}
                    >
                      <p className="text-2xl font-bold">{score}</p>
                      <p className="text-xs opacity-70">match</p>
                    </div>
                  )}

                  <div className="text-slate-500 text-sm">View →</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applicant Modal */}
      <ApplicantModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        application={selected}
        matchResult={selected ? getMatch(selected.studentId) : null}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
