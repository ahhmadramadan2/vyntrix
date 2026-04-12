import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../lib/axios";
import { useUiStore } from "../../store/uiStore";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token");
  const role = searchParams.get("role") as "STUDENT" | "HR";

  useEffect(() => {
    if (!token || !role) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
        role,
      });
      setDone(true);
      addToast("Password reset successfully!", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      addToast(
        err.response?.data?.message || "Failed to reset password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500 rounded-full opacity-[0.04] blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl mb-5 shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter your new password below
          </p>
        </div>

        <div className="bg-dark-800 rounded-2xl p-8 border border-slate-700/50">
          {error ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Link
                to="/forgot-password"
                className="text-primary-400 hover:underline text-sm"
              >
                Request a new reset link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-white font-semibold">
                Password reset successfully!
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
