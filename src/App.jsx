import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AuthPage from './pages/AuthPage';
import JobsPage from './pages/JobsPage';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyAuthPage from './pages/company/CompanyAuthPage';
import JobApplicantsPage from './pages/company/JobApplicantsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import PostJobPage from './pages/company/PostJobPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ProfilePage from './pages/candidate/ProfilePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import OnboardingPage from './pages/OnboardingPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]">Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'candidate') return <CandidateDashboard />;
  if (user.role === 'company') return <CompanyDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/company/login" element={<CompanyAuthPage />} />
              <Route path="/admin-portal" element={<AdminLoginPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/privacidad" element={<PrivacyPage />} />
              <Route path="/terminos" element={<TermsPage />} />

              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['candidate', 'company', 'admin']}>
                  <DashboardDispatcher />
                </ProtectedRoute>
              } />

              <Route path="/post-job" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <PostJobPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/job/:id/applicants" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <JobApplicantsPage />
                </ProtectedRoute>
              } />

              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/jobs/:id" element={<JobDetailsPage />} />

              <Route path="/onboarding" element={
                <ProtectedRoute allowedRoles={['candidate', 'company']}>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* Placeholder for other routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
