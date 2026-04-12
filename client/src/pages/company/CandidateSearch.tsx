import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Student, Skill } from "../../types";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Modal } from "../../components/ui/Modal";

export const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [minGpa, setMinGpa] = useState("");
  const [status, setStatus] = useState("");
  const [skillId, setSkillId] = useState("");

  useEffect(() => {
    api
      .get("/skills")
      .then((r) => setAllSkills(r.data.data))
      .catch(() => {});
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (minGpa) params.minGpa = minGpa;
      if (status) params.status = status;
      if (skillId) params.skillIds = skillId;
      const { data } = await api.get("/company/candidates", { params });
      setCandidates(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "px-3 py-2 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search Candidates</h1>
        <p className="text-slate-400 mt-1">
          Find students that match your requirements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">
              Min GPA
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              placeholder="e.g. 3.0"
              className="px-3 py-2 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm w-28"
              value={minGpa}
              onChange={(e) => setMinGpa(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Status</label>
            <select
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="STUDENT">Current Students</option>
              <option value="GRADUATE">Graduates</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Skill</label>
            <select
              className={selectClass}
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
            >
              <option value="">Any Skill</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {candidates.map((c) => {
            const fullName = `${c.firstName} ${c.lastName}`;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className="bg-dark-800 border border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    name={fullName}
                    avatarUrl={c.profile?.avatarUrl}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {fullName}
                    </h3>
                    <p className="text-slate-400 text-xs truncate">{c.email}</p>
                    <p className="text-slate-500 text-xs">
                      {c.university?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    className={
                      c.status === "GRADUATE"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }
                  >
                    {c.status}
                  </Badge>
                  {c.gpa && (
                    <span className="text-sm font-semibold text-white">
                      {c.gpa.toFixed(2)}
                      <span className="text-xs text-slate-500 font-normal">
                        {" "}
                        / 4.0
                      </span>
                    </span>
                  )}
                </div>
                {c.skills && c.skills.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {c.skills.slice(0, 3).map((s) => (
                      <Badge
                        key={s.id}
                        className="bg-primary-500/10 text-primary-400 text-xs"
                      >
                        {s.skill.name}
                      </Badge>
                    ))}
                    {c.skills.length > 3 && (
                      <Badge className="bg-slate-700/50 text-slate-400 text-xs">
                        +{c.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          size="lg"
          title="Candidate Profile"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar
                name={`${selected.firstName} ${selected.lastName}`}
                avatarUrl={selected.profile?.avatarUrl}
                size="xl"
              />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-slate-400 text-sm">{selected.email}</p>
                <p className="text-slate-400 text-sm">
                  {selected.university?.name}
                </p>
                <Badge
                  className={`mt-2 ${
                    selected.status === "GRADUATE"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {selected.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">GPA</p>
                <p className="text-2xl font-bold text-white">
                  {selected.gpa?.toFixed(2) ?? "—"}
                  <span className="text-sm text-slate-500 font-normal">
                    {" "}
                    / 4.0
                  </span>
                </p>
              </div>
              <div className="bg-dark-900 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Degree</p>
                <p className="text-sm font-medium text-white">
                  {selected.degree}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selected.department}
                </p>
              </div>
            </div>

            {selected.profile?.bio && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  About
                </p>
                <p className="text-slate-300 text-sm leading-relaxed bg-dark-900 rounded-xl p-4 border border-slate-700/50">
                  {selected.profile.bio}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                Profile Links
              </p>
              <div className="flex gap-3 flex-wrap">
                {selected.profile?.linkedinUrl ? (
                  <a
                    href={selected.profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/20 transition-all"
                  >
                    💼 LinkedIn
                  </a>
                ) : (
                  <span className="text-slate-500 text-sm px-4 py-2 bg-slate-800 rounded-xl border border-slate-700/50">
                    💼 No LinkedIn
                  </span>
                )}

                {selected.profile?.cvUrl ? (
                  <a
                    href={selected.profile.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-all"
                  >
                    📄 View CV
                  </a>
                ) : (
                  <span className="text-slate-500 text-sm px-4 py-2 bg-slate-800 rounded-xl border border-slate-700/50">
                    📄 No CV
                  </span>
                )}

                {selected.profile?.githubUrl ? (
                  <a
                    href={selected.profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-all"
                  >
                    🐙 GitHub
                  </a>
                ) : (
                  <span className="text-slate-500 text-sm px-4 py-2 bg-slate-800 rounded-xl border border-slate-700/50">
                    🐙 No GitHub
                  </span>
                )}
              </div>
            </div>

            {selected.skills && selected.skills.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-1.5 bg-dark-900 rounded-lg px-3 py-1.5 border border-slate-700/50"
                    >
                      <span className="text-slate-200 text-sm">
                        {s.skill.name}
                      </span>
                      <Badge className="bg-primary-500/20 text-primary-400 text-xs">
                        {s.proficiencyLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
