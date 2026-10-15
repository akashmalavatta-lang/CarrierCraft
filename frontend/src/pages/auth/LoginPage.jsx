import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back to Career Craft!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Visual background accents */}
      <div className="auth-glow" />

      <div className="auth-container">
        {/* Left Side: Brand & Value Prop */}
        <div className="auth-hero">
          <div className="auth-brand">
            <div className="auth-logo-badge">
              <Zap size={22} className="text-white" />
            </div>
            <span className="auth-logo-title">CC <span>Career Craft</span></span>
          </div>

          <div className="auth-hero-content">
            <div className="badge badge-brand mb-4">
              <Sparkles size={14} className="mr-1 text-brand-300" />
              <span>AI-Powered Career Accelerator</span>
            </div>
            <h1 className="auth-hero-heading">
              Build Your Skills.<br />
              Craft Your Career.<br />
              <span className="gradient-text">Crack Your Dream Job.</span>
            </h1>
            <p className="auth-hero-desc">
              Your free, open-source AI mentor for ATS resume optimization, realistic mock interviews, tailored career roadmaps, and portfolio projects.
            </p>

            <div className="auth-highlights">
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Deterministic ATS Scoring & JD Matcher</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>AI Mock Interview with STAR Framework Feedback</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>100% Free & Open-Source — No Paid APIs</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <ShieldCheck size={16} className="text-slate-400" />
            <span>Secure, private, and student-focused engineering</span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard, analyses, and interview sessions</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    className="form-control with-icon"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                </div>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="password"
                    type="password"
                    className="form-control with-icon"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In to CC</span>
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>New to Career Craft?</span>
            </div>

            <div className="text-center">
              <Link to="/register" className="btn btn-outline w-full">
                Create a Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
