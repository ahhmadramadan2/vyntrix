import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import type { Skill } from "../../types";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useUiStore } from "../../store/uiStore";

interface SelectedSkill {
  skillId: number;
  name: string;
  requiredLevel: string;
}

export const PostJob = () => {
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("BEGINNER");

  const [form, setForm] = useState({
    title: "",
    description: "",
    jobType: "FULL_TIME",
    location: "",
    minGpa: "",
    deadline: "",
  });

  useEffect(() => {
    api
      .get("/skills")
      .then((r) => setAllSkills(r.data.data))
      .catch(() => {});
  }, []);

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    const skill = allSkills.find((s) => s.id === parseInt(selectedSkillId));
    if (!skill) return;
    if (selectedSkills.find((s) => s.skillId === skill.id)) return;
    setSelectedSkills((prev) => [
      ...prev,
      { skillId: skill.id, name: skill.name, requiredLevel: selectedLevel },
    ]);
    setSelectedSkillId("");
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/jobs", {
        ...form,
        minGpa: form.minGpa ? parseFloat(form.minGpa) : undefined,
        deadline: form.deadline
          ? new Date(form.deadline).toISOString()
          : undefined,
        skillRequirements: selectedSkills.map((s) => ({
          skillId: s.skillId,
          requiredLevel: s.requiredLevel,
        })),
      });
      addToast("Job posted successfully!", "success");
      navigate("/company/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post job";
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const availableSkills = allSkills.filter(
    (s) => !selectedSkills.find((sel) => sel.skillId === s.id),
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
        <p className="text-slate-400 mt-1">
          Fill in the details to attract the right candidates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Job Details</h2>
          <div className="space-y-4">
            <Input
              label="Job Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Description
              </label>
              <textarea
                className="w-full h-32 px-4 py-3 rounded-lg bg-dark-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Describe the role and responsibilities..."
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Job Type
                </label>
                <select
                  className="px-3 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.jobType}
                  onChange={(e) =>
                    setForm({ ...form, jobType: e.target.value })
                  }
                >
                  {[
                    "FULL_TIME",
                    "PART_TIME",
                    "INTERNSHIP",
                    "CONTRACT",
                    "REMOTE",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Location"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum GPA (optional)"
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={form.minGpa}
                onChange={(e) => setForm({ ...form, minGpa: e.target.value })}
              />
              <Input
                label="Application Deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.length === 0 && (
              <p className="text-slate-400 text-sm">No skills added yet.</p>
            )}
            {selectedSkills.map((s) => (
              <div
                key={s.skillId}
                className="flex items-center gap-1.5 bg-dark-900 rounded-lg px-3 py-1.5"
              >
                <span className="text-slate-200 text-sm">{s.name}</span>
                <Badge className="bg-primary-500/20 text-primary-500 text-xs">
                  {s.requiredLevel}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s.skillId)}
                  className="text-slate-500 hover:text-red-400 ml-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="flex-1 px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
            >
              <option value="">Select a skill...</option>
              {availableSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
            <Button type="button" variant="secondary" onClick={handleAddSkill}>
              Add
            </Button>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Post Job
        </Button>
      </form>
    </div>
  );
};
