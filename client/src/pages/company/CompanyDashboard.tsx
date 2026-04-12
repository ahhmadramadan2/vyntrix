import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import type { Job } from "../../types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";
import { formatDate, getJobTypeColor, formatJobType } from "../../lib/utils";

export const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchJobs = () =>
    api.get("/company/jobs").then((r) => setJobs(r.data.data));

  useEffect(() => {
    fetchJobs()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Close this job posting?")) return;
    setDeletingId(jobId);
    try {
      await api.delete(`/company/jobs/${jobId}`);
      await fetchJobs();
      addToast("Job closed successfully", "success");
    } catch {
      addToast("Failed to close job", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Company Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your job postings</p>
        </div>
        <Button onClick={() => navigate("/company/jobs/new")}>
          + Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Posted</p>
          <p className="text-3xl font-bold text-white mt-1">{jobs.length}</p>
        </div>
        <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Open Positions</p>
          <p className="text-3xl font-bold text-primary-500 mt-1">
            {jobs.filter((j) => j.status === "OPEN").length}
          </p>
        </div>
        <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Closed Positions</p>
          <p className="text-3xl font-bold text-white mt-1">
            {jobs.filter((j) => j.status === "CLOSED").length}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Your Job Postings
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-12 text-center">
            <p className="text-slate-400">No jobs posted yet.</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/company/jobs/new")}
            >
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <Badge
                        className={
                          job.status === "OPEN"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-700/50 text-slate-400"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <Badge className={getJobTypeColor(job.jobType)}>
                        {formatJobType(job.jobType)}
                      </Badge>
                      <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                        {job.location}
                      </Badge>
                      <span className="text-slate-500 text-xs self-center">
                        Posted {formatDate(job.postedDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        navigate(`/company/jobs/${job.id}/applicants`)
                      }
                    >
                      Applicants
                    </Button>
                    {job.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={deletingId === job.id}
                        onClick={(e) => handleDelete(job.id, e)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
