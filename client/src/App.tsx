import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { ToastContainer } from "./components/ui/ToastContainer";
import { Chat } from "./pages/student/Chat";

import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";

import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentProfile } from "./pages/student/StudentProfile";
import { JobBrowse } from "./pages/student/JobBrowse";
import { JobDetail } from "./pages/student/JobDetail";
import { MyApplications } from "./pages/student/MyApplications";
import { CompanyPublicProfile } from "./pages/student/CompanyPublicProfile";

import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { PostJob } from "./pages/company/PostJob";
import { JobApplicants } from "./pages/company/JobApplicants";
import { CandidateSearch } from "./pages/company/CandidateSearch";
import { CompanyProfile } from "./pages/company/CompanyProfile";

import { NotFound } from "./pages/shared/NotFound";
import { Unauthorized } from "./pages/shared/Unauthorized";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-dark-900">
    <Navbar />
    <Sidebar />
    <main className="pt-16 lg:pl-56">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate
                to={
                  role === "STUDENT"
                    ? "/student/dashboard"
                    : "/company/dashboard"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Student routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <StudentProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <JobBrowse />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/jobs/:id"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <JobDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <MyApplications />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/chat"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <Chat />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/company/:id"
          element={
            <ProtectedRoute role="STUDENT">
              <AppLayout>
                <CompanyPublicProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Company routes */}
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute role="HR">
              <AppLayout>
                <CompanyDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/new"
          element={
            <ProtectedRoute role="HR">
              <AppLayout>
                <PostJob />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:jobId/applicants"
          element={
            <ProtectedRoute role="HR">
              <AppLayout>
                <JobApplicants />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute role="HR">
              <AppLayout>
                <CompanyProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/candidates"
          element={
            <ProtectedRoute role="HR">
              <AppLayout>
                <CandidateSearch />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
