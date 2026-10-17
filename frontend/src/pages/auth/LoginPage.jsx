import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck,
  Sparkles, CheckCircle2, AlertCircle, KeyRound, Sparkle
} from 'lucide-react';

import { CareerCraftLogo } from '../../components/common/Icons';
import GoogleAuthModal from '../../components/common/GoogleAuthModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    setShowGoogleModal(true);
  };

  const handleConfirmGoogleAuth = async (googleUser) => {
    try {
      setLoading(true);
      await loginWithGoogle({
        name: googleUser.name,
        email: googleUser.email,
        target_role: googleUser.target_role || 'Software Engineer',
      });
      toast.success(`Welcome, ${googleUser.name}! Signed in with Google 🚀`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Auth error:', err);
      toast.error('Google sign in failed. Please use email or 1-Click Demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('demo@careercraft.io');
    setPassword('Password123!');
    setErrorMessage('');
    try {
      setLoading(true);
      await login('demo@careercraft.io', 'Password123!');
      toast.success('Signed in as Demo User 🚀');
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      toast.error('Demo login failed. You can sign in or register a new account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      toast.error('Missing email or password');
      return;
    }

    try {
      setLoading(true);
      await login(trimmedEmail, password);
      toast.success('Welcome back to Career Craft! 🚀');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Invalid email or password. Please verify your credentials.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message && err.message.includes('Network Error')) {
        msg = 'Unable to reach backend API. Please verify server status.';
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper tech-grid-bg">
      {/* Background glow accents */}
      <div className="auth-glow" />
      <div className="hero-glow-2" />

      <div className="auth-container">
        {/* Left Side: Brand & Value Prop */}
        <div className="auth-hero">
          <Link to="/" className="auth-brand" title="Return to home">
            <CareerCraftLogo size={36} showText={true} />
          </Link>


          <div className="auth-hero-content">
            <div className="badge badge-brand mb-4 inline-flex items-center gap-2">
              <span className="pulse-dot" />
              <Sparkles size={14} className="text-brand-300" />
              <span>AI Career Accelerator</span>
            </div>

            <h1 className="auth-hero-heading">
              Build Your Skills.<br />
              Craft Your Career.<br />
              <span className="gradient-text">Crack Your Dream Job.</span>
            </h1>

            <p className="auth-hero-desc">
              Your free, open-source AI career co-pilot. Optimize your resume for ATS algorithms, master technical interviews with STAR feedback, and track tailored opportunities.
            </p>

            <div className="auth-highlights">
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>Deterministic ATS Scoring & Job Description Matcher</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>AI Mock Interview with STAR Framework Coaching</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>100% Free & Open-Source — No Paid Subscriptions</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <ShieldCheck size={16} className="text-brand-400" />
            <span>Secure session authentication • 100% Student-first engineering</span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your AI career cockpit to continue your progress</p>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#101A26] hover:bg-[#162232] border border-[#253342] text-xs font-bold text-white transition-all shadow-sm mb-3"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Credentials Pill */}
            <div className="demo-account-box">
              <div className="flex items-center gap-2 min-w-0">
                <KeyRound size={16} className="text-brand-400 flex-shrink-0" />
                <div className="text-xs truncate">
                  <div className="font-semibold text-primary">Testing out the app?</div>
                  <div className="text-muted text-[11px]">demo@careercraft.io</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="btn btn-sm btn-outline text-xs whitespace-nowrap"
                disabled={loading}
              >
                1-Click Demo Sign In
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="auth-error-banner">
                <AlertCircle size={18} className="flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    className="form-control with-icon"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" htmlFor="password" style={{ margin: 0 }}>
                    Password
                  </label>
                </div>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control with-icon"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-icon-right-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm mr-2" />
                    <span>Signing into Career Craft...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} className="ml-1" />
                  </>
                )}
              </button>

              {/* Instant 1-Click Demo Access */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await login('demo@careercraft.io', 'Password123!');
                    toast.success('Signed in as Akash Malavatta (Demo Account) 🚀');
                    navigate('/dashboard');
                  } catch {
                    toast.error('Could not authenticate demo user');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="btn btn-secondary w-full mt-3 flex items-center justify-center gap-2 border-[#F5BF45]/40 text-[#F5BF45] hover:bg-[#F5BF45]/10 font-bold"
              >
                <Zap size={16} className="text-[#F5BF45]" />
                <span>Instant 1-Click Demo Login</span>
              </button>
            </form>

            <div className="auth-divider">
              <span>New to Career Craft?</span>
            </div>

            <div>
              <Link to="/register" className="btn btn-secondary w-full">
                Create Free Student Account
              </Link>
            </div>

          </div>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onConfirm={handleConfirmGoogleAuth}
        initialEmail={email}
      />
    </div>
  );
}
