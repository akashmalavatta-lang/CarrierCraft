import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck,
  Sparkles, CheckCircle2, AlertCircle, KeyRound, Sparkle
} from 'lucide-react';

import { CareerCraftLogo } from '../../components/common/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('demo@careercraft.io');
    setPassword('Password123!');
    setErrorMessage('');
    toast.success('Loaded demo credentials!');
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
                onClick={handleFillDemo}
                className="btn btn-sm btn-outline text-xs whitespace-nowrap"
              >
                Use Demo
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
    </div>
  );
}
