import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Zap, Mail, Lock, User, Target, Briefcase, ArrowRight,
  CheckCircle2, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles
} from 'lucide-react';
import { CareerCraftLogo } from '../../components/common/Icons';

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
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await loginWithGoogle({
        name: name.trim() || 'Akash Malavatta',
        email: email.trim().toLowerCase() || 'akash.student@gmail.com',
        target_role: targetRole,
        experience_level: experienceLevel,
        linkedin_url: linkedinUrl.trim() || 'https://linkedin.com/in/akash-malavatta'
      });
      toast.success('Signed up with Google Authentication! 🚀');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign Up error:', err);
      toast.error('Google registration failed. Please complete registration below.');
    } finally {
      setLoading(false);
    }
  };

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
        linkedin_url: linkedinUrl.trim(),
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
            <CareerCraftLogo size={36} showText={true} />
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

            {/* Google Authentication 1-Click Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#101A26] hover:bg-[#162232] border border-[#253342] text-xs font-bold text-white transition-all shadow-sm mb-3"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <div className="relative flex py-1 items-center mb-3">
              <div className="flex-grow border-t border-[#253342]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#A8B3C2] uppercase font-semibold">Or fill details</span>
              <div className="flex-grow border-t border-[#253342]"></div>
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

              <div className="form-group">
                <label className="form-label" htmlFor="reg-linkedin">
                  LinkedIn Profile URL (Optional)
                </label>
                <div className="input-icon-wrapper">
                  <div className="input-icon flex items-center justify-center font-bold text-[#F5BF45] text-xs">
                    in
                  </div>
                  <input
                    id="reg-linkedin"
                    type="text"
                    className="form-control with-icon"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
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
