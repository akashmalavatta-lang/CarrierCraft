import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumePage from './pages/ResumePage';
import InterviewPage from './pages/InterviewPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import JobsPage from './pages/JobsPage';
import RoadmapPage from './pages/RoadmapPage';
import LinkedInPage from './pages/LinkedInPage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';

import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-overlay" style={{ minHeight: '100vh' }}>
      <div className="spinner spinner-lg" />
      <p className="text-muted">Loading CC...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — within app layout */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="interview" element={<InterviewPage />} />
        <Route path="interview/:id" element={<InterviewSessionPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="linkedin" element={<LinkedInPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#ecfdf5' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#fff1f2' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
