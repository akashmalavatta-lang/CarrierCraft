import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Target, Briefcase, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        target_role: targetRole,
        experience_level: experienceLevel,
      });
      toast.success('Account created! Welcome to Career Craft 🚀');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check your information.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glow" />

      <div className="auth-container">
        {/* Left Side: Brand & Benefits */}
        <div className="auth-hero">
          <div className="auth-brand">
            <div className="auth-logo-badge">
              <Zap size={22} className="text-white" />
            </div>
            <span className="auth-logo-title">CC <span>Career Craft</span></span>
          </div>

          <div className="auth-hero-content">
            <h1 className="auth-hero-heading">
              Launch Your Tech Career <br />
              <span className="gradient-text">With AI Superpowers</span>
            </h1>
            <p className="auth-hero-desc">
              Get comprehensive feedback on your resume, simulate realistic technical and behavioral interviews, and receive personalized learning paths crafted for your target role.
            </p>

            <div className="auth-highlights">
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Instant ATS resume audit with actionable scoring</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Live AI mock interviews with answer breakdowns</span>
              </div>
              <div className="auth-highlight-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Free portfolio project ideas & job aggregator</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <ShieldCheck size={16} className="text-slate-400" />
            <span>Zero paid subscriptions. Always free for students.</span>
          </div>
        </div>

        {/* Right Side: Registration Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create Your Account</h2>
              <p>Step into your personalized AI career cockpit in 60 seconds</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div className="input-icon-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-control with-icon"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-control with-icon"
                    placeholder="alex@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-pass">Password</label>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="reg-pass"
                    type="password"
                    className="form-control with-icon"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1.4 }}>
                  <label className="form-label" htmlFor="reg-role">Target Role</label>
                  <div className="input-icon-wrapper">
                    <Target className="input-icon" size={18} />
                    <select
                      id="reg-role"
                      className="form-control with-icon"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="reg-exp">Experience</label>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>Get Started Free</span>
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already registered?</span>
            </div>

            <div className="text-center">
              <Link to="/login" className="btn btn-outline w-full">
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
