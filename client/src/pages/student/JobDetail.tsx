import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import type { Job, MatchResult } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ScoreMeter } from "../../components/ui/ScoreMeter";
import { Spinner } from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";
import { formatDate, formatJobType, getJobTypeColor } from "../../lib/utils";

export const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/jobs/${id}`), api.get("/matching/my-matches")])
      .then(([jobRes, matchRes]) => {
        setJob(jobRes.data.data);
        const m = matchRes.data.data.find(
          (r: MatchResult) => r.jobId === parseInt(id!),
        );
        setMatch(m || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post("/applications", { jobId: parseInt(id!), coverLetter });
      setApplied(true);
      addToast("Application submitted successfully!", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to apply", "error");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  if (!job)
    return (
      <div className="text-center text-slate-400 py-12">Job not found</div>
    );

  return (
    <div className="max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                <p className="text-slate-400 mt-1">{job.company.companyName}</p>
              </div>
              <Badge className={getJobTypeColor(job.jobType)}>
                {formatJobType(job.jobType)}
              </Badge>
            </div>
            <div className="flex gap-3 flex-wrap mb-6">
              <Badge className="bg-slate-700 text-slate-300">
                📍 {job.location}
              </Badge>
              {job.minGpa && (
                <Badge className="bg-slate-700 text-slate-300">
                  GPA {job.minGpa}+
                </Badge>
              )}
              {job.deadline && (
                <Badge className="bg-slate-700 text-slate-300">
                  Deadline: {formatDate(job.deadline)}
                </Badge>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed">{job.description}</p>
          </Card>

          {/* Required Skills */}
          {job.requiredSkills.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 bg-dark-900 rounded-lg px-3 py-2"
                  >
                    <span className="text-slate-200 text-sm">
                      {s.skill.name}
                    </span>
                    <Badge className="bg-primary-500/20 text-primary-500 text-xs">
                      {s.requiredLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Apply */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">
              Apply for this Job
            </h2>
            {applied ? (
              <div className="text-center py-6">
                <p className="text-green-400 font-medium">
                  ✓ Application submitted!
                </p>
                <Button
                  variant="ghost"
                  className="mt-3"
                  onClick={() => navigate("/student/applications")}
                >
                  View My Applications
                </Button>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-lg bg-dark-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Write a cover letter (optional)..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <Button
                  className="mt-3 w-full"
                  size="lg"
                  loading={applying}
                  onClick={handleApply}
                >
                  Submit Application
                </Button>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {match && (
            <Card className="text-center">
              <h3 className="text-sm font-medium text-slate-400 mb-4">
                Your Match Score
              </h3>
              <ScoreMeter score={Math.round(match.matchScore)} size="lg" />
              <div className="mt-4 space-y-2">
                {[
                  { label: "Skills", value: match.skillScore, max: 60 },
                  { label: "GPA", value: match.gpaScore, max: 30 },
                  { label: "Profile", value: match.extraScore, max: 10 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-medium">
                      {Math.round(item.value)}/{item.max}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-medium text-slate-400 mb-3">Company</h3>
            <div
              className="cursor-pointer group"
              onClick={() => navigate(`/student/company/${job.company.id}`)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {(job.company as any).logoUrl ? (
                    <img
                      src={(job.company as any).logoUrl}
                      alt={job.company.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-400 font-bold text-sm">
                      {job.company.companyName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                    {job.company.companyName}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {job.company.industry}
                  </p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                📍 {job.company.location}
              </p>
              {job.company.website && (
                <p className="text-primary-400 text-sm mt-1 hover:underline">
                  🔗 Visit website
                </p>
              )}
              <p className="text-xs text-primary-400 mt-2 group-hover:underline">
                View company profile →
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
