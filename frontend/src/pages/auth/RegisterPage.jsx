import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Zap, Mail, Lock, User, Target, Briefcase, ArrowRight,
  CheckCircle2, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles
} from 'lucide-react';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps / Cloud Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer (iOS/Android)',
  'Product Manager',
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      toast.error('Name required');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address.');
      toast.error('Email required');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      toast.error('Password too short (min 8 chars)');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        target_role: targetRole,
        experience_level: experienceLevel,
      });
      toast.success('Account created! Welcome to Career Craft 🚀');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      let msg = 'Registration failed. Please check your information.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message && err.message.includes('Network Error')) {
        msg = 'Unable to connect to backend server. Please verify network.';
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper tech-grid-bg">
      <div className="auth-glow" />
      <div className="hero-glow-2" />

      <div className="auth-container">
        {/* Left Side: Brand & Benefits */}
        <div className="auth-hero">
          <Link to="/" className="auth-brand" title="Return to home">
            <div className="auth-logo-badge">
              <Zap size={22} className="text-white" />
            </div>
            <span className="auth-logo-title">
              <span className="gradient-text font-black">CC</span> Career Craft
            </span>
          </Link>

          <div className="auth-hero-content">
            <div className="badge badge-brand mb-4 inline-flex items-center gap-2">
              <span className="pulse-dot" />
              <Sparkles size={14} className="text-brand-300" />
              <span>Fast-Track Your Tech Career</span>
            </div>

            <h1 className="auth-hero-heading">
              Launch Your Career <br />
              <span className="gradient-text">With AI Superpowers</span>
            </h1>
            <p className="auth-hero-desc">
              Get comprehensive feedback on your resume, simulate realistic technical and behavioral interviews, and receive personalized learning roadmaps tailored for your target role.
            </p>

            <div className="auth-highlights">
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>Instant ATS resume audit with actionable scoring</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>Live AI mock interviews with STAR answer breakdowns</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>Curated job aggregator & high-impact portfolio ideas</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <ShieldCheck size={16} className="text-brand-400" />
            <span>Zero paid subscriptions. Always 100% free for students.</span>
          </div>
        </div>

        {/* Right Side: Registration Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create Your Account</h2>
              <p>Step into your personalized AI career cockpit in 60 seconds</p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="auth-error-banner">
                <AlertCircle size={18} className="flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="input-icon-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-control with-icon"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address
                </label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-control with-icon"
                    placeholder="alex@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-pass">
                  Password (min 8 characters)
                </label>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control with-icon"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    minLength={8}
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

              <div className="form-row">
                <div className="form-group" style={{ flex: 1.4 }}>
                  <label className="form-label" htmlFor="reg-role">
                    Target Role
                  </label>
                  <div className="input-icon-wrapper">
                    <Target className="input-icon" size={18} />
                    <select
                      id="reg-role"
                      className="form-control with-icon"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="reg-exp">
                    Experience
                  </label>
                  <div className="input-icon-wrapper">
                    <Briefcase className="input-icon" size={18} />
                    <select
                      id="reg-exp"
                      className="form-control with-icon"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                      <option value="fresher">Fresher (0 yrs)</option>
                      <option value="junior">Junior (1-2 yrs)</option>
                      <option value="mid">Mid-level (3-5 yrs)</option>
                      <option value="senior">Senior (5+ yrs)</option>
                    </select>
                  </div>
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
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started Free</span>
                    <ArrowRight size={18} className="ml-1" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <div>
              <Link to="/login" className="btn btn-secondary w-full">
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
