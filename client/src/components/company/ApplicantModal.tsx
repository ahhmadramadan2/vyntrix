import type { Application, MatchResult } from "../../types";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { getStatusColor } from "../../lib/utils";

interface ApplicantModalProps {
  application: Application | null;
  matchResult?: MatchResult | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (appId: number, status: string) => void;
}

export const ApplicantModal = ({
  application,
  matchResult,
  isOpen,
  onClose,
  onStatusChange,
}: ApplicantModalProps) => {
  if (!application) return null;

  const student = application.student;
  const profile = student?.profile;
  const fullName = `${student?.firstName} ${student?.lastName}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Applicant Profile"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar name={fullName} avatarUrl={profile?.avatarUrl} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{fullName}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{student?.email}</p>
            <p className="text-slate-400 text-sm">
              {student?.university?.name}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge
                className={
                  student?.status === "GRADUATE"
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-blue-500/20 text-blue-400"
                }
              >
                {student?.status}
              </Badge>
              <Badge className={getStatusColor(application.applicationStatus)}>
                {application.applicationStatus}
              </Badge>
            </div>
          </div>

          {/* Match Score */}
          {matchResult && (
            <div className="text-center bg-dark-900 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Match Score</p>
              <p
                className={`text-3xl font-bold ${
                  matchResult.matchScore >= 75
                    ? "text-green-400"
                    : matchResult.matchScore >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {Math.round(matchResult.matchScore)}
              </p>
              <p className="text-xs text-slate-500">/ 100</p>
              <div className="mt-2 space-y-1 text-xs text-left">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Skills</span>
                  <span className="text-white">
                    {Math.round(matchResult.skillScore)}/60
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">GPA</span>
                  <span className="text-white">
                    {Math.round(matchResult.gpaScore)}/30
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Profile</span>
                  <span className="text-white">
                    {Math.round(matchResult.extraScore)}/10
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Academic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-900 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">GPA</p>
            <p className="text-2xl font-bold text-white">
              {student?.gpa?.toFixed(2) ?? "—"}
              <span className="text-sm text-slate-500 font-normal"> / 4.0</span>
            </p>
          </div>
          <div className="bg-dark-900 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Department</p>
            <p className="text-sm font-medium text-white">
              {student?.department}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{student?.degree}</p>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              About
            </p>
            <p className="text-slate-300 text-sm leading-relaxed bg-dark-900 rounded-xl p-4 border border-slate-700/50">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Links */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            Profile Links
          </p>
          <div className="flex gap-3 flex-wrap">
            {profile?.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/20 transition-all"
              >
                💼 LinkedIn Profile
              </a>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700/50 text-slate-500 rounded-xl text-sm">
                💼 No LinkedIn
              </span>
            )}
            {profile?.cvUrl ? (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-all"
              >
                📄 View CV / Resume
              </a>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700/50 text-slate-500 rounded-xl text-sm">
                📄 No CV uploaded
              </span>
            )}
            {profile?.githubUrl ? (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-all"
              >
                🐙 GitHub
              </a>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700/50 text-slate-500 rounded-xl text-sm">
                🐙 No GitHub
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        {student?.skills && student.skills.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 bg-dark-900 rounded-lg px-3 py-1.5 border border-slate-700/50"
                >
                  <span className="text-slate-200 text-sm">{s.skill.name}</span>
                  <Badge className="bg-primary-500/20 text-primary-400 text-xs">
                    {s.proficiencyLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cover Letter */}
        {application.coverLetter && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Cover Letter
            </p>
            <p className="text-slate-300 text-sm leading-relaxed bg-dark-900 rounded-xl p-4 border border-slate-700/50">
              {application.coverLetter}
            </p>
          </div>
        )}

        {/* Actions */}
        {onStatusChange && (
          <div className="flex gap-3 pt-2 border-t border-slate-700/50">
            <button
              onClick={() => {
                onStatusChange(application.id, "ACCEPTED");
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-all"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => {
                onStatusChange(application.id, "REVIEWED");
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-all"
            >
              👁 Mark Reviewed
            </button>
            <button
              onClick={() => {
                onStatusChange(application.id, "REJECTED");
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all"
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
