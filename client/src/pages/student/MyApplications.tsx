import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import type { Application } from "../../types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { formatDate, getStatusColor } from "../../lib/utils";

export const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/student/applications")
      .then((r) => setApplications(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        <p className="text-slate-400 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <p className="text-slate-400 text-center py-8">
            You have not applied to any jobs yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 hover:border-primary-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">
                      {app.job?.title}
                    </h3>
                    <Badge className={getStatusColor(app.applicationStatus)}>
                      {app.applicationStatus}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    {app.job?.company.companyName}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Applied on {formatDate(app.applicationDate)}
                  </p>
                  {app.coverLetter && (
                    <p className="text-slate-400 text-sm mt-3 pt-3 border-t border-slate-700/50 line-clamp-2">
                      {app.coverLetter}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/student/jobs/${app.jobId}`)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-all"
                >
                  View Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
