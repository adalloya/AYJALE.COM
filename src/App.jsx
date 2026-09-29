import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';

// Route-level code splitting: pages load on demand (landing, jobs & job details stay in the main bundle)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CandidateDashboard = lazy(() => import('./pages/candidate/CandidateDashboard'));
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const CompanyAuthPage = lazy(() => import('./pages/company/CompanyAuthPage'));
const JobApplicantsPage = lazy(() => import('./pages/company/JobApplicantsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const PostJobPage = lazy(() => import('./pages/company/PostJobPage'));
const ProfilePage = lazy(() => import('./pages/candidate/ProfilePage'));
const ProfileEditPage = lazy(() => import('./pages/candidate/ProfileEditPage'));
const CompanyProfileEditPage = lazy(() => import('./pages/company/CompanyProfileEditPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CandidateSearchPage = lazy(() => import('./pages/company/CandidateSearchPage'));
const EvaluationCenterPage = lazy(() => import('./pages/candidate/EvaluationCenterPage'));
const TestExecutionPage = lazy(() => import('./pages/candidate/TestExecutionPage'));
const TestRunner = lazy(() => import('./pages/assessment/TestRunner'));
const WhatsNewPage = lazy(() => import('./pages/WhatsNewPage'));
const CompanySolutionsPage = lazy(() => import('./pages/CompanySolutionsPage'));

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
            <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Cargando...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/company/login" element={<CompanyAuthPage />} />
              <Route path="/admin-portal" element={<AdminLoginPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/privacidad" element={<PrivacyPage />} />
              <Route path="/terminos" element={<TermsPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['candidate', 'company', 'admin']}>
                  <DashboardDispatcher />
                </ProtectedRoute>
              } />

              <Route path="/post-job" element={
                <ProtectedRoute allowedRoles={['company', 'admin']}>
                  <PostJobPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/profile/edit" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <ProfileEditPage />
                </ProtectedRoute>
              } />

              <Route path="/job/:id/applicants" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <JobApplicantsPage />
                </ProtectedRoute>
              } />

              <Route path="/company/candidates" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CandidateSearchPage />
                </ProtectedRoute>
              } />

              <Route path="/company/profile" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyProfileEditPage />
                </ProtectedRoute>
              } />

              <Route path="/company/profile/edit" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyProfileEditPage />
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

              <Route path="/evaluation-center" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <EvaluationCenterPage />
                </ProtectedRoute>
              } />

              <Route path="/evaluation-center/test/:testId" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <TestExecutionPage />
                </ProtectedRoute>
              } />

              <Route path="/assessment/test" element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <TestRunner />
                </ProtectedRoute>
              } />

              <Route path="/whats-new" element={<WhatsNewPage />} />
              <Route path="/solutions/companies" element={<CompanySolutionsPage />} />

              {/* Placeholder for other routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </Layout>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
