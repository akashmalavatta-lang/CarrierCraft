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
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';

import './index.css';

import React, { Component } from 'react';

// Error Boundary to prevent white/blank screens on uncaught errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareerCraft Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05080D] flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-[#F5BF45]/15 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45] font-black text-xl mb-4">
            CC
          </div>
          <h2 className="text-2xl font-black text-[#F5F7FA] mb-2">View Recovered</h2>
          <p className="text-sm text-[#A8B3C2] max-w-md mb-6">
            A temporary component error occurred. Click below to refresh the cockpit view.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="btn btn-primary px-6 py-2.5 font-bold shadow-lg"
          >
            Reload Cockpit
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />


      {/* Protected — within app layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/interview/:id" element={<InterviewSessionPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/linkedin" element={<LinkedInPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
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
