import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Student, Skill } from "../../types";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export const StudentProfile = () => {
  const { addToast } = useUiStore();
  const [profile, setProfile] = useState<Student | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("BEGINNER");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    techStack: "",
    projectUrl: "",
  });

  const fetchProfile = () =>
    api.get("/student/profile").then((r) => setProfile(r.data.data));

  useEffect(() => {
    Promise.all([fetchProfile(), api.get("/skills")])
      .then(([, skillsRes]) => setAllSkills(skillsRes.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newFirstName: "",
    newLastName: "",
  });
  const [savingSecurity, setSavingSecurity] = useState(false);
  const handleSecuritySave = async () => {
    if (!securityForm.currentPassword) {
      addToast("Current password is required", "error");
      return;
    }
    setSavingSecurity(true);
    try {
      const payload: any = {
        currentPassword: securityForm.currentPassword,
      };
      if (securityForm.newPassword)
        payload.newPassword = securityForm.newPassword;
      if (securityForm.newEmail) payload.newEmail = securityForm.newEmail;
      if (securityForm.newFirstName)
        payload.newFirstName = securityForm.newFirstName;
      if (securityForm.newLastName)
        payload.newLastName = securityForm.newLastName;

      await api.put("/auth/student/credentials", payload);
      addToast("Credentials updated successfully!", "success");
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        newEmail: "",
        newFirstName: "",
        newLastName: "",
      });
      await fetchProfile();
    } catch (err: any) {
      addToast(
        err.response?.data?.message || "Failed to update credentials",
        "error",
      );
    } finally {
      setSavingSecurity(false);
    }
  };
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image must be under 5MB", "error");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error("Upload failed");
      await api.put("/student/profile/extended", { avatarUrl: data.data.url });
      await fetchProfile();
      addToast("Profile picture updated!", "success");
    } catch {
      addToast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put("/student/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department,
        degree: profile.degree,
        gpa: profile.gpa,
      });
      await api.put("/student/profile/extended", {
        cvUrl: profile.profile?.cvUrl,
        linkedinUrl: profile.profile?.linkedinUrl,
        githubUrl: profile.profile?.githubUrl,
        bio: profile.profile?.bio,
      });
      addToast("Profile updated successfully!", "success");
    } catch {
      addToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    try {
      await api.post("/student/skills", {
        skillId: parseInt(selectedSkillId),
        proficiencyLevel: selectedLevel,
      });
      await fetchProfile();
      addToast("Skill added!", "success");
      setSelectedSkillId("");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to add skill", "error");
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await api.delete(`/student/skills/${skillId}`);
      await fetchProfile();
      addToast("Skill removed", "info");
    } catch {
      addToast("Failed to remove skill", "error");
    }
  };

  const handleAddProject = async () => {
    if (!projectForm.title.trim()) return;
    try {
      await api.post("/student/projects", projectForm);
      await fetchProfile();
      addToast("Project added!", "success");
      setShowProjectForm(false);
      setProjectForm({
        title: "",
        description: "",
        techStack: "",
        projectUrl: "",
      });
    } catch {
      addToast("Failed to add project", "error");
    }
  };

  const handleRemoveProject = async (projectId: number) => {
    try {
      await api.delete(`/student/projects/${projectId}`);
      await fetchProfile();
      addToast("Project removed", "info");
    } catch {
      addToast("Failed to remove project", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const existingSkillIds = profile.skills?.map((s) => s.skillId) || [];
  const availableSkills = allSkills.filter(
    (s) => !existingSkillIds.includes(s.id),
  );
  const selectClass =
    "px-3 py-2 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm";

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">
          Profile Picture
        </h2>
        <div className="flex items-center gap-6">
          <Avatar
            name={fullName}
            avatarUrl={profile.profile?.avatarUrl}
            size="xl"
          />
          <div>
            <label className="cursor-pointer">
              <div className="px-4 py-2 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-all inline-flex items-center gap-2">
                {uploading ? "Uploading..." : "Upload Photo"}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
            <p className="text-slate-500 text-xs mt-2">
              JPG, PNG or GIF — max 5MB
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={profile.firstName}
            onChange={(e) =>
              setProfile({ ...profile, firstName: e.target.value })
            }
          />
          <Input
            label="Last Name"
            value={profile.lastName}
            onChange={(e) =>
              setProfile({ ...profile, lastName: e.target.value })
            }
          />
          <Input
            label="Department"
            value={profile.department}
            onChange={(e) =>
              setProfile({ ...profile, department: e.target.value })
            }
          />
          <Input
            label="Degree"
            value={profile.degree}
            onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
          />
          <div>
            <Input
              label="GPA (out of 4.0)"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={profile.gpa || ""}
              onChange={(e) =>
                setProfile({ ...profile, gpa: parseFloat(e.target.value) })
              }
            />
            <p className="text-xs text-slate-500 mt-1">
              Current:{" "}
              <span className="text-white font-medium">
                {profile.gpa?.toFixed(2) ?? "—"} / 4.0
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Profile Links</h2>
        <div className="space-y-4">
          <Input
            label="CV / Resume URL"
            placeholder="https://drive.google.com/..."
            value={profile.profile?.cvUrl || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                profile: { ...profile.profile!, cvUrl: e.target.value },
              })
            }
          />
          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/..."
            value={profile.profile?.linkedinUrl || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                profile: { ...profile.profile!, linkedinUrl: e.target.value },
              })
            }
          />
          <Input
            label="GitHub URL"
            placeholder="https://github.com/..."
            value={profile.profile?.githubUrl || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                profile: { ...profile.profile!, githubUrl: e.target.value },
              })
            }
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Bio</label>
            <textarea
              className="w-full h-24 px-4 py-3 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none text-sm"
              placeholder="Tell employers about yourself..."
              value={profile.profile?.bio || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  profile: { ...profile.profile!, bio: e.target.value },
                })
              }
            />
          </div>
        </div>
        <Button className="mt-4" loading={saving} onClick={handleSaveProfile}>
          Save Profile
        </Button>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">My Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills?.length === 0 && (
            <p className="text-slate-400 text-sm">No skills added yet.</p>
          )}
          {profile.skills?.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 bg-dark-900 rounded-xl px-3 py-1.5 border border-slate-700/50"
            >
              <span className="text-slate-200 text-sm">{s.skill.name}</span>
              <Badge className="bg-primary-500/20 text-primary-400 text-xs">
                {s.proficiencyLevel}
              </Badge>
              <button
                onClick={() => handleRemoveSkill(s.skillId)}
                className="text-slate-500 hover:text-red-400 ml-1 text-xs transition-colors"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className={`flex-1 ${selectClass}`}
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
            className={selectClass}
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </select>
          <Button onClick={handleAddSkill} disabled={!selectedSkillId}>
            Add
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">My Projects</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowProjectForm(!showProjectForm)}
          >
            {showProjectForm ? "Cancel" : "+ Add Project"}
          </Button>
        </div>

        {showProjectForm && (
          <div className="bg-dark-900 rounded-xl p-4 border border-primary-500/20 mb-4 space-y-3">
            <Input
              label="Project Title"
              placeholder="e.g. Vyntrix Job Platform"
              value={projectForm.title}
              onChange={(e) =>
                setProjectForm({ ...projectForm, title: e.target.value })
              }
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Description
              </label>
              <textarea
                className="w-full h-20 px-4 py-3 rounded-xl bg-dark-800 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none text-sm"
                placeholder="What does this project do?"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <Input
              label="Tech Stack"
              placeholder="e.g. React, Node.js, PostgreSQL"
              value={projectForm.techStack}
              onChange={(e) =>
                setProjectForm({ ...projectForm, techStack: e.target.value })
              }
            />
            <Input
              label="Project Link"
              placeholder="https://github.com/..."
              value={projectForm.projectUrl}
              onChange={(e) =>
                setProjectForm({ ...projectForm, projectUrl: e.target.value })
              }
            />
            <Button
              onClick={handleAddProject}
              disabled={!projectForm.title.trim()}
            >
              Add Project
            </Button>
          </div>
        )}

        {profile.projects?.length === 0 && !showProjectForm && (
          <p className="text-slate-400 text-sm">No projects added yet.</p>
        )}

        <div className="space-y-3">
          {profile.projects?.map((p) => (
            <div
              key={p.id}
              className="bg-dark-900 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-white">{p.title}</p>
                  {p.description && (
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  {p.techStack && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.techStack.split(",").map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-lg text-xs"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.projectUrl && (
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary-400 text-xs hover:underline mt-2"
                    >
                      View project
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveProject(p.id)}
                  className="text-slate-600 hover:text-red-400 text-xs transition-colors flex-shrink-0 mt-0.5"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-white mb-2">
          Security Settings
        </h2>
        <p className="text-slate-500 text-sm mb-5">
          Username can only be changed once every 3 weeks.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New First Name"
              placeholder="Leave blank to keep current"
              value={securityForm.newFirstName}
              onChange={(e) =>
                setSecurityForm({
                  ...securityForm,
                  newFirstName: e.target.value,
                })
              }
            />
            <Input
              label="New Last Name"
              placeholder="Leave blank to keep current"
              value={securityForm.newLastName}
              onChange={(e) =>
                setSecurityForm({
                  ...securityForm,
                  newLastName: e.target.value,
                })
              }
            />
          </div>
          <Input
            label="New Email"
            type="email"
            placeholder="Leave blank to keep current"
            value={securityForm.newEmail}
            onChange={(e) =>
              setSecurityForm({ ...securityForm, newEmail: e.target.value })
            }
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Leave blank to keep current"
            value={securityForm.newPassword}
            onChange={(e) =>
              setSecurityForm({ ...securityForm, newPassword: e.target.value })
            }
          />
          <div className="border-t border-slate-700/50 pt-4">
            <Input
              label="Current Password (required to save changes)"
              type="password"
              placeholder="Enter your current password"
              value={securityForm.currentPassword}
              onChange={(e) =>
                setSecurityForm({
                  ...securityForm,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>
        </div>
        <Button
          className="mt-4"
          loading={savingSecurity}
          onClick={handleSecuritySave}
          disabled={!securityForm.currentPassword}
        >
          Save Security Changes
        </Button>
      </Card>
    </div>
  );
};
