import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { formatDate, formatJobType, getJobTypeColor } from "../../lib/utils";

interface JobSkillItem {
  id: number;
  skill: { name: string };
}

interface JobItem {
  id: number;
  title: string;
  jobType: string;
  location: string;
  minGpa?: number;
  postedDate: string;
  requiredSkills: JobSkillItem[];
}

interface PublicCompany {
  id: number;
  companyName: string;
  industry: string;
  location: string;
  website?: string;
  logoUrl?: string;
  email: string;
  jobPostings: JobItem[];
}

export const CompanyPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/company/public/${id}`)
      .then((r) => setCompany(r.data.data))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [id]);

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // 🔹 Not found state
  if (!company) {
    return (
      <div className="text-center py-12 text-slate-400">Company not found</div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        Back
      </Button>

      {/* Company Info */}
      <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-400 text-3xl font-bold">
                {company.companyName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {company.companyName}
            </h1>

            <p className="text-slate-400 mt-1">{company.industry}</p>

            <div className="flex gap-3 mt-3 flex-wrap items-center">
              <span className="text-slate-400 text-sm">{company.location}</span>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-400 text-sm hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Open Positions ({company.jobPostings.length})
        </h2>

        {company.jobPostings.length === 0 ? (
          <Card>
            <p className="text-slate-400 text-center py-6">
              No open positions at this time.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {company.jobPostings.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/student/jobs/${job.id}`)}
                className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{job.title}</h3>

                  <Badge className={getJobTypeColor(job.jobType)}>
                    {formatJobType(job.jobType)}
                  </Badge>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                    {job.location}
                  </Badge>

                  {job.minGpa && (
                    <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                      GPA {job.minGpa}+
                    </Badge>
                  )}

                  <span className="text-xs text-slate-500 self-center">
                    {formatDate(job.postedDate)}
                  </span>
                </div>

                {job.requiredSkills.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-700/30">
                    {job.requiredSkills.slice(0, 4).map((s) => (
                      <Badge
                        key={s.id}
                        className="bg-primary-500/10 text-primary-400 text-xs"
                      >
                        {s.skill.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
