import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import type { University } from "../../types";

export const Register = () => {
  const [role, setRole] = useState<"STUDENT" | "HR">("STUDENT");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    universityId: "",
    department: "",
    degree: "",
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    industry: "",
    location: "",
    companyEmail: "",
    hrFullName: "",
    hrEmail: "",
    password: "",
  });

  useEffect(() => {
    api
      .get("/auth/universities")
      .then((r) => setUniversities(r.data.data))
      .catch(() => {});
  }, []);

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-dark-900 border border-slate-700/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/student/register", {
        ...studentForm,
        universityId: parseInt(studentForm.universityId),
      });
      setAuth(data.data.student, data.data.token, "STUDENT");
      addToast("Account created!", "success");
      navigate("/student/dashboard");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/company/register", companyForm);
      setAuth(data.data.hrUser, data.data.token, "HR");
      addToast("Company registered!", "success");
      navigate("/company/dashboard");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500 rounded-full opacity-[0.04] blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl mb-5 shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create account
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Join Vyntrix and find your perfect match
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-6 border border-slate-700/50">
          {(["STUDENT", "HR"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === r
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r === "STUDENT" ? "🎓 Student" : "🏢 Company / HR"}
            </button>
          ))}
        </div>

        {/* Student Form */}
        {role === "STUDENT" && (
          <form
            onSubmit={handleStudentRegister}
            className="bg-dark-800 rounded-2xl p-8 border border-slate-700/50 shadow-2xl space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  className={inputClass}
                  placeholder="Name"
                  required
                  value={studentForm.firstName}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  className={inputClass}
                  placeholder="Surname"
                  required
                  value={studentForm.lastName}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="email address"
                required
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                className={inputClass}
                type="password"
                placeholder="••••••••••"
                required
                value={studentForm.password}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>University</label>
              <select
                className={inputClass}
                required
                value={studentForm.universityId}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    universityId: e.target.value,
                  })
                }
              >
                <option value="">Select your university</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input
                className={inputClass}
                placeholder="e.g. Computer Science"
                required
                value={studentForm.department}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, department: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Degree</label>
              <input
                className={inputClass}
                placeholder="e.g. B.Sc. Computer Science"
                required
                value={studentForm.degree}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, degree: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all shadow-lg shadow-primary-500/25 disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account..." : "Create Student Account"}
            </button>
          </form>
        )}

        {/* Company Form */}
        {role === "HR" && (
          <form
            onSubmit={handleCompanyRegister}
            className="bg-dark-800 rounded-2xl p-8 border border-slate-700/50 shadow-2xl space-y-4"
          >
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                className={inputClass}
                placeholder="Full name"
                required
                value={companyForm.companyName}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    companyName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <input
                className={inputClass}
                placeholder="e.g. Software Development"
                required
                value={companyForm.industry}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, industry: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                className={inputClass}
                placeholder="Beirut, Lebanon"
                required
                value={companyForm.location}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Company Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="hr@company.com"
                required
                value={companyForm.companyEmail}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    companyEmail: e.target.value,
                  })
                }
              />
            </div>
            <div className="border-t border-slate-700/50 pt-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-4">
                Your HR Account
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}> Name</label>
                  <input
                    className={inputClass}
                    placeholder="Full name"
                    required
                    value={companyForm.hrFullName}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        hrFullName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Your Email</label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={companyForm.hrEmail}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        hrEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="••••••••••"
                    required
                    value={companyForm.password}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-all shadow-lg shadow-primary-500/25 disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account..." : "Create Company Account"}
            </button>
          </form>
        )}

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
