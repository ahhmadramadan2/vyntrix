import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { useUiStore } from "../../store/uiStore";

export const ForgotPassword = () => {
  const { addToast } = useUiStore();
  const [role, setRole] = useState<"STUDENT" | "HR">("STUDENT");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email, role });
      setSent(true);
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to send email", "error");
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
            Forgot Password
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter your email and we will send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="bg-dark-800 rounded-2xl p-8 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">
              Check your email
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              We sent a password reset link to{" "}
              <strong className="text-white">{email}</strong>. It expires in 1
              hour.
            </p>
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-2xl p-8 border border-slate-700/50">
            {/* Role Toggle */}
            <div className="flex bg-dark-900 rounded-xl p-1 mb-6 border border-slate-700/50">
              {(["STUDENT", "HR"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    role === r
                      ? "bg-primary-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r === "STUDENT" ? "Student" : "Company / HR"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
