import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ScoreMeter } from "../../components/ui/ScoreMeter";
import { Spinner } from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import type { MatchResult } from "../../types";
import { formatJobType, getJobTypeColor } from "../../lib/utils";

export const StudentDashboard = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/matching/my-matches")
      .then((r) => setMatches(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topMatches = matches.slice(0, 6);
  const avgScore = matches.length
    ? Math.round(
        matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length,
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {student?.firstName}! 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Here's your job matching overview
          </p>
        </div>
        <Button onClick={() => navigate("/student/jobs")}>
          Browse All Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-slate-400 text-sm">Total Matches</p>
          <p className="text-3xl font-bold text-white mt-1">{matches.length}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-primary-500 mt-1">{avgScore}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Your GPA</p>
          <p className="text-3xl font-bold text-white mt-1">
            {student?.gpa?.toFixed(2) || "—"}
          </p>
        </Card>
      </div>

      {/* Top Matches */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Your Top Matches
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : topMatches.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-400">No matches yet.</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/student/profile")}
            >
              Complete your profile to get matches
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {topMatches.map((match) => (
              <Card
                key={match.id}
                onClick={() => navigate(`/student/jobs/${match.jobId}`)}
                className="flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {match.job?.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {match.job?.company.companyName}
                    </p>
                  </div>
                  <ScoreMeter score={Math.round(match.matchScore)} size="sm" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getJobTypeColor(match.job?.jobType || "")}>
                    {formatJobType(match.job?.jobType || "")}
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-300">
                    {match.job?.location}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-dark-900 rounded-lg p-2">
                    <p className="text-slate-500">Skills</p>
                    <p className="text-white font-medium">
                      {Math.round(match.skillScore)}
                    </p>
                  </div>
                  <div className="bg-dark-900 rounded-lg p-2">
                    <p className="text-slate-500">GPA</p>
                    <p className="text-white font-medium">
                      {Math.round(match.gpaScore)}
                    </p>
                  </div>
                  <div className="bg-dark-900 rounded-lg p-2">
                    <p className="text-slate-500">Extra</p>
                    <p className="text-white font-medium">
                      {Math.round(match.extraScore)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
