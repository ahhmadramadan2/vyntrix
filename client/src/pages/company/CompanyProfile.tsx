import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY;

interface CompanyData {
  id: number;
  companyName: string;
  industry: string;
  location: string;
  website?: string;
  email: string;
  logoUrl?: string;
}

export const CompanyProfile = () => {
  const { addToast } = useUiStore();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    location: "",
    website: "",
    logoUrl: "",
  });

  const fetchCompany = () =>
    api.get("/company/profile").then((r) => {
      const c = r.data.data;
      setCompany(c);
      setForm({
        companyName: c.companyName || "",
        industry: c.industry || "",
        location: c.location || "",
        website: c.website || "",
        logoUrl: c.logoUrl || "",
      });
    });

  useEffect(() => {
    fetchCompany()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newFullName: "",
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
      if (securityForm.newFullName)
        payload.newFullName = securityForm.newFullName;

      await api.put("/auth/company/credentials", payload);
      addToast("Credentials updated successfully!", "success");
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        newEmail: "",
        newFullName: "",
      });
    } catch (err: any) {
      addToast(
        err.response?.data?.message || "Failed to update credentials",
        "error",
      );
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (!data.success) throw new Error("Upload failed");
      const logoUrl = data.data.url;
      await api.put("/company/profile", { ...form, logoUrl });
      await fetchCompany();
      addToast("Logo updated!", "success");
    } catch {
      addToast("Failed to upload logo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/company/profile", form);
      addToast("Company profile updated!", "success");
    } catch {
      addToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Company Profile</h1>
        <p className="text-slate-400 mt-1">Manage your company information</p>
      </div>

      <div className="bg-dark-800 border border-primary-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-400 text-3xl font-bold">
                {form.companyName.charAt(0).toUpperCase() || "C"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {form.companyName || "Your Company"}
            </h2>
            <p className="text-slate-400 text-sm">{form.industry}</p>
            <p className="text-slate-500 text-sm">{form.location}</p>
            <label className="cursor-pointer mt-3 inline-block">
              <div className="px-3 py-1.5 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-medium hover:bg-primary-500/30 transition-all">
                {uploading ? "Uploading..." : "Upload Logo"}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-5">
          Company Information
        </h2>
        <div className="space-y-4">
          <Input
            label="Company Name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <Input
            label="Industry"
            placeholder="e.g. Software Development"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <Input
            label="Location"
            placeholder="e.g. Beirut, Lebanon"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Input
            label="Website"
            placeholder="https://yourcompany.com"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <Button loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">
          Account Details
        </h2>
        <div className="bg-dark-900 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">Company Email</p>
          <p className="text-slate-200 font-medium">{company?.email || "—"}</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-white mb-2">
          Security Settings
        </h2>
        <p className="text-slate-500 text-sm mb-5">
          Update your name, email, or password.
        </p>
        <div className="space-y-4">
          <Input
            label="New Full Name"
            placeholder="Leave blank to keep current"
            value={securityForm.newFullName}
            onChange={(e) =>
              setSecurityForm({ ...securityForm, newFullName: e.target.value })
            }
          />
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
