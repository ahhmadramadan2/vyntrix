import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import type { Job } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";

import { formatDate, formatJobType, getJobTypeColor } from "../../lib/utils";
import { useDebounce } from "../../hooks/useDebounce";

export const JobBrowse = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/jobs", { params: { title: debouncedSearch || undefined } })
      .then((r) => setJobs(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Browse Jobs</h1>
        <p className="text-slate-400 mt-1">
          Find opportunities that match your skills
        </p>
      </div>

      <Input
        placeholder="Search jobs by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-400">No jobs found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              onClick={() => navigate(`/student/jobs/${job.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{job.title}</h3>
                  <p className="text-slate-400 text-sm">
                    {job.company.companyName}
                  </p>
                </div>
                <Badge className={getJobTypeColor(job.jobType)}>
                  {formatJobType(job.jobType)}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                {job.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-slate-700 text-slate-300">
                    {job.location}
                  </Badge>
                  {job.minGpa && (
                    <Badge className="bg-slate-700 text-slate-300">
                      GPA {job.minGpa}+
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {formatDate(job.postedDate)}
                </span>
              </div>
              {job.requiredSkills.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-700">
                  {job.requiredSkills.slice(0, 4).map((s) => (
                    <Badge
                      key={s.id}
                      className="bg-primary-500/10 text-primary-500 text-xs"
                    >
                      {s.skill.name}
                    </Badge>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <Badge className="bg-slate-700 text-slate-400 text-xs">
                      +{job.requiredSkills.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
