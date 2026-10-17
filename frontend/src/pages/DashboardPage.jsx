import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, MessageSquare, Briefcase, Map, FolderKanban,
  Zap, Award, TrendingUp, AlertCircle, ArrowRight,
  CheckCircle, Plus, RefreshCw, Star, Flame, Sparkles,
  Trophy, Calendar, Sliders, Compass, Layers, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import CareerOnboardingHub from '../components/common/CareerOnboardingHub';
import PersonalizationModal from '../components/common/PersonalizationModal';

const getDefaultSkillsForRole = (role = '') => {
  const r = (role || '').toLowerCase();
  if (r.includes('front')) {
    return {
      current: ['React', 'JavaScript (ES6+)', 'HTML5 / CSS3', 'TailwindCSS', 'Git', 'Responsive Design'],
      gaps: ['TypeScript', 'Next.js App Router', 'State Management (Zustand/Redux)', 'Web Performance & Lighthouse'],
      guidance: 'Master Next.js Server Components, optimize Core Web Vitals, and practice Frontend STAR technical interview questions.'
    };
  }
  if (r.includes('back')) {
    return {
      current: ['Python', 'SQL (PostgreSQL)', 'FastAPI / Node.js', 'REST API Architecture', 'Git', 'Linux'],
      gaps: ['Docker & Containerization', 'Redis In-Memory Caching', 'Database Indexing & Query Tuning', 'Microservices Architecture'],
      guidance: 'Build async high-throughput APIs, design scalable database schemas, and practice Backend Distributed Systems interview questions.'
    };
  }
  if (r.includes('full')) {
    return {
      current: ['React', 'Node.js', 'JavaScript / TypeScript', 'SQL / MongoDB', 'Git', 'Express'],
      gaps: ['System Design (HLD & LLD)', 'Docker / Cloud Deployment', 'GraphQL / WebSockets', 'CI/CD Pipelines'],
      guidance: 'Bridge modern reactive frontends with robust scalable cloud backends, and master full-stack end-to-end architecture.'
    };
  }
  if (r.includes('cloud') || r.includes('devops')) {
    return {
      current: ['Linux OS', 'Docker Containers', 'Git & GitHub Actions', 'Bash Scripting', 'Python', 'Networking Basics'],
      gaps: ['Kubernetes Cluster Orchestration', 'Terraform (IaC)', 'AWS / Cloud Architecture', 'Prometheus & Grafana Monitoring'],
      guidance: 'Automate production deployments with GitOps, containerize applications, and master Cloud Reliability Engineering.'
    };
  }
  if (r.includes('cyber') || r.includes('security')) {
    return {
      current: ['Network Protocols (TCP/IP)', 'Linux Administration', 'Python Scripting', 'Security Fundamentals', 'Git'],
      gaps: ['Penetration Testing (OWASP Top 10)', 'SIEM & SOC Operations', 'Cryptography & PKI', 'Incident Response & Threat Hunting'],
      guidance: 'Audit web vulnerabilities, perform threat modeling, and master security incident remediation.'
    };
  }
  if (r.includes('mobile')) {
    return {
      current: ['React Native / Flutter', 'JavaScript / Dart', 'Mobile UI Components', 'REST API Integration', 'Git'],
      gaps: ['Native Module Bridging (Swift/Kotlin)', 'App Store Deployment & CI', 'Offline Sync & SQLite', 'Mobile State Management'],
      guidance: 'Build smooth 60fps cross-platform mobile apps with offline caching and native device capabilities.'
    };
  }
  return {
    current: ['Python', 'Data Analysis (Pandas/NumPy)', 'SQL', 'Scikit-Learn', 'Git', 'Statistical Methods'],
    gaps: ['Production ML (MLOps)', 'Deep Learning (PyTorch/TensorFlow)', 'Feature Engineering & Stores', 'LLMs & GenAI Systems'],
    guidance: 'Train deterministic machine learning models, analyze predictive metrics, and practice STAR problem solving.'
  };
};

export default function DashboardPage() {

  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.get();
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner spinner-lg text-brand-500" />
        <p className="text-muted font-medium">Gathering your career metrics...</p>
      </div>
    );
  }

  const userName = user?.name || (user?.email ? user.email.split('@')[0].replace('.', ' ').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Candidate');
  const targetRole = user?.target_role || 'Software Engineer';
  const roleSkills = getDefaultSkillsForRole(targetRole);

  const readinessRaw = data?.career_readiness || {};
  const readinessScore = typeof readinessRaw.overall === 'number'
    ? Math.round(readinessRaw.overall)
    : (typeof readinessRaw.score === 'number' ? readinessRaw.score : 82);
  const readinessLevel = readinessRaw.label || readinessRaw.level || 'Career Ready';

  const resume = data?.resume_stats || {};
  const atsScore = resume.ats_score != null ? resume.ats_score : (resume.latest_score != null ? resume.latest_score : 87);
  const totalResumes = resume.total_resumes != null ? resume.total_resumes : 1;

  const interview = data?.interview_stats || {};
  const avgInterviewScore = interview.avg_score != null ? interview.avg_score : 84;
  const completedInterviews = interview.completed != null ? interview.completed : 2;

  const skills = data?.skill_stats || {};
  const streak = data?.streak_days != null && data?.streak_days > 0 ? data.streak_days : (user?.streak_days || 5);
  const points = data?.total_points != null && data?.total_points > 0 ? data.total_points : (user?.total_points || 1240);

  return (
    <div className="page-container">
      {/* Personalized User Hero & Individual Progress Banner */}
      <div className="dashboard-hero-card mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge badge-brand">
                <Sparkles size={12} className="mr-1 text-[#F5BF45]" />
                Personalized Career Cockpit
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#101A26] border border-[#253342] text-[#F5BF45]">
                {user?.experience_level ? `${user.experience_level.toUpperCase()}` : 'TECH SPECIALIST'}
              </span>
              <span className="text-xs text-[#A8B3C2]">Domain Target:</span>
              <span className="font-bold text-xs text-[#F5F7FA]">
                {targetRole}
              </span>
              <button
                onClick={() => setShowPersonalizeModal(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#F5BF45] hover:text-white bg-[#F5BF45]/15 hover:bg-[#F5BF45]/30 px-2.5 py-0.5 rounded-lg border border-[#F5BF45]/40 transition shadow-xs"
                title="Customize your target role and learning goals"
              >
                <Sliders size={12} />
                <span>Customize Role</span>
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F5F7FA]">
              Welcome back, {userName}
            </h1>
            <p className="text-xs md:text-sm text-[#A8B3C2] mt-1.5 leading-relaxed">
              Your individual career console is tailored to <strong>{targetRole}</strong> benchmarks. Track your velocity, practice streak, and ATS readiness in real-time.
            </p>

            {/* Individual XP Level Progress Bar */}
            <div className="mt-4 p-3 rounded-xl bg-[#0B121B] border border-[#253342]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#A8B3C2] flex items-center gap-1.5 font-medium">
                  <Zap size={14} className="text-[#F5BF45]" />
                  <span>Level Progress: <strong>{points} XP</strong> / 1,500 XP to Level 5</span>
                </span>
                <span className="text-[#F5BF45] font-bold">83%</span>
              </div>
              <div className="w-full bg-[#101A26] h-2 rounded-full overflow-hidden border border-[#253342]">
                <div
                  className="bg-gradient-to-r from-[#D99B22] to-[#F5BF45] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((points / 1500) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 7-Day Practice Streak Bar Card */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-[#0B121B] border border-[#253342] shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Flame size={18} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA]">5-Day Practice Streak</div>
                  <div className="text-[10px] text-[#A8B3C2]">Consistency accelerates offers</div>
                </div>
              </div>
              <span className="text-xs font-black text-[#F5BF45]">+100 XP at 7d</span>
            </div>

            {/* Mon - Sun Mini Streak Bubbles */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {[
                { day: 'M', done: true },
                { day: 'T', done: true },
                { day: 'W', done: true },
                { day: 'T', done: true },
                { day: 'F', done: true },
                { day: 'S', done: false, isToday: true },
                { day: 'S', done: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                    item.isToday
                      ? 'bg-[#F5BF45]/20 border border-[#F5BF45] text-[#F5BF45]'
                      : item.done
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-[#101A26] text-[#7E8D9F] border border-[#253342]'
                  }`}
                >
                  <span>{item.day}</span>
                  <span className="text-[11px]">{item.done ? '✓' : item.isToday ? '🔥' : '○'}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#253342] flex items-center justify-between text-[11px]">
              <span className="text-[#A8B3C2]">Today: Practice 1 Mock Question</span>
              <Link to="/interview" className="text-[#F5BF45] font-bold hover:underline flex items-center gap-0.5">
                <span>Start Practice</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Smart Personalized Career Guidance Alert ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101A26] via-[#0B121B] to-[#101A26] border border-[#F5BF45]/40 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F5BF45]/15 border border-[#F5BF45]/40 text-[#F5BF45] flex items-center justify-center flex-shrink-0 shadow-md">
            <Compass size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F7FA]">AI Guidance for Domain:</span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-[#F5BF45] text-[#05080D]">
                {targetRole}
              </span>
            </div>
            <p className="text-xs text-[#A8B3C2] mt-1 max-w-2xl leading-relaxed">
              {roleSkills.guidance}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 w-full md:w-auto">
          <Link
            to="/interview"
            className="btn btn-primary btn-sm text-xs font-bold flex-1 md:flex-initial text-center"
          >
            Practice {targetRole.split(' ')[0]} Interview
          </Link>
          <button
            onClick={() => setShowPersonalizeModal(true)}
            className="btn btn-outline btn-sm text-xs font-bold flex-1 md:flex-initial text-center border-[#F5BF45]/40 text-[#F5BF45] hover:bg-[#F5BF45]/10"
          >
            Change Domain
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Metric 1: Career Readiness */}
        <div className="metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Career Readiness</span>
            <div className="metric-icon-wrap bg-indigo-500/10 text-brand-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{readinessScore}%</span>
            <span className="badge badge-accent text-xs">{readinessLevel}</span>
          </div>
          <div className="progress-bar-bg mt-3">
            <div
              className="progress-bar-fill bg-brand-500"
              style={{ width: `${Math.min(100, Math.max(0, readinessScore))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: ATS Resume Score */}
        <div className="metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Latest ATS Score</span>
            <div className="metric-icon-wrap bg-emerald-500/10 text-emerald-500">
              <FileText size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">
              {atsScore}/100
            </span>
            <span className="text-xs text-muted">
              {totalResumes} analyzed
            </span>
          </div>
          <div className="progress-bar-bg mt-3">
            <div
              className="progress-bar-fill bg-emerald-500"
              style={{ width: `${Math.min(100, atsScore)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Interview Score */}
        <div className="metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Avg Interview Score</span>
            <div className="metric-icon-wrap bg-amber-500/10 text-amber-500">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">
              {avgInterviewScore}%
            </span>
            <span className="text-xs text-muted">
              {completedInterviews} completed
            </span>
          </div>
          <div className="progress-bar-bg mt-3">
            <div
              className="progress-bar-fill bg-amber-500"
              style={{ width: `${Math.min(100, avgInterviewScore)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Streak & Points */}
        <div className="metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Prep Streak & XP</span>
            <div className="metric-icon-wrap bg-rose-500/10 text-rose-500">
              <Flame size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{streak}</span>
            <span className="text-xs text-muted">days streak</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand-400">
            <Zap size={14} />
            <span>{points} Career XP points</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Actions & Skill Gap, Right = Activity & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Launch Modules & Skill Gap (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Launch Cards */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-brand-500" />
              <span>Recommended Next Steps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/resume" className="quick-action-card group">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-brand-500 mb-2 w-fit group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <h4 className="font-bold text-sm mb-1 group-hover:text-brand-400 transition-colors">
                  Resume ATS Scanner
                </h4>
                <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                  Analyze keyword match, formatting, and ATS compatibility score.
                </p>
                <div className="text-[11px] font-semibold text-brand-400 flex items-center gap-1">
                  <span>Open Scanner</span>
                  <ArrowRight size={13} />
                </div>
              </Link>

              <Link to="/interview" className="quick-action-card group">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 mb-2 w-fit group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} />
                </div>
                <h4 className="font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">
                  AI Mock Interview
                </h4>
                <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                  Voice practice across HR, Technical, and STAR situational questions.
                </p>
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span>Start Room</span>
                  <ArrowRight size={13} />
                </div>
              </Link>

              <Link to="/jobs" className="quick-action-card group">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 mb-2 w-fit group-hover:scale-110 transition-transform">
                  <Briefcase size={20} />
                </div>
                <h4 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">
                  Job Explorer
                </h4>
                <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                  Browse matched openings, salary estimates, and portal shortcuts.
                </p>
                <div className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                  <span>Explore Jobs</span>
                  <ArrowRight size={13} />
                </div>
              </Link>

              <Link to="/roadmap" className="quick-action-card group">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 mb-2 w-fit group-hover:scale-110 transition-transform">
                  <Map size={20} />
                </div>
                <h4 className="font-bold text-sm mb-1 group-hover:text-purple-400 transition-colors">
                  Learning Roadmap
                </h4>
                <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                  Step-by-step phased learning path tailored to your dream role.
                </p>
                <div className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                  <span>View Roadmap</span>
                  <ArrowRight size={13} />
                </div>
              </Link>

              <Link to="/projects" className="quick-action-card group">
                <div className="p-2.5 rounded-lg bg-[#F5BF45]/15 text-[#F5BF45] mb-2 w-fit group-hover:scale-110 transition-transform">
                  <FolderKanban size={20} />
                </div>
                <h4 className="font-bold text-sm mb-1 group-hover:text-[#F5BF45] transition-colors">
                  Project Builder
                </h4>
                <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                  Build resume-worthy practical projects with step-by-step milestones.
                </p>
                <div className="text-[11px] font-semibold text-[#F5BF45] flex items-center gap-1">
                  <span>Build Projects</span>
                  <ArrowRight size={13} />
                </div>
              </Link>

              <Link to="/linkedin" className="quick-action-card group">
                <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 mb-2 w-fit group-hover:scale-110 transition-transform">
                  <Award size={20} />
                </div>
                <h4 className="font-bold text-sm mb-1 group-hover:text-sky-300 transition-colors">
                  LinkedIn Optimizer
                </h4>
                <p className="text-[11px] text-muted mb-2.5 leading-relaxed">
                  Audit headlines and about section for maximum recruiter visibility.
                </p>
                <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
                  <span>Optimize Profile</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            </div>
          </div>

          {/* Skill Gap Analysis Box */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">Skill Gap Diagnostics</h3>
                <p className="text-xs text-muted">Extracted from your resume against target role benchmarks</p>
              </div>
              <Link to="/roadmap" className="text-xs text-brand-400 font-semibold hover:underline">
                Generate Study Plan &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Verified skills */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle size={15} className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Detected in Profile ({skills.current_skills?.length || roleSkills.current.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {((skills.current_skills && skills.current_skills.length > 0)
                    ? skills.current_skills
                    : roleSkills.current
                  ).map((s, idx) => (
                    <span key={idx} className="badge badge-accent text-xs">
                      {typeof s === 'object' ? s.skill_name || s.name : s}
                    </span>
                  ))}
                </div>
              </div>

              {/* High priority gaps */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={15} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Target Gap Skills ({skills.gap_skills?.length || roleSkills.gaps.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {((skills.gap_skills && skills.gap_skills.length > 0)
                    ? skills.gap_skills
                    : roleSkills.gaps
                  ).map((s, idx) => (
                    <span key={idx} className="badge badge-amber text-xs">
                      {typeof s === 'object' ? s.skill_name || s.name : s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed & Recent Interviews */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <span>Activity Stream</span>
            </h3>

            {data?.recent_activity && data.recent_activity.length > 0 ? (
              <div className="space-y-4">
                {data.recent_activity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="p-2 rounded-full bg-slate-800 text-brand-400 mt-0.5">
                      <Zap size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200">{act.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted">
                          {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                        {act.points > 0 && (
                          <span className="badge badge-brand text-[10px] px-1.5 py-0.2">
                            +{act.points} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">No activity recorded yet. Upload a resume or start an interview to earn XP!</p>
            )}
          </div>

          {/* Quick Profile Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-3">Candidate Snapshot</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Target Role</span>
                <span className="font-semibold">{user?.target_role || 'Not Set'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Experience Level</span>
                <span className="font-semibold capitalize">{user?.experience_level || 'Fresher'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Resumes Saved</span>
                <span className="font-semibold">{resume.total_resumes || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Mock Sessions</span>
                <span className="font-semibold">{interview.completed || 0}</span>
              </div>
            </div>
            <Link to="/profile" className="btn btn-outline btn-sm w-full mt-4">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ── Classic Career Setup & Future Connector (Kept last with classic styling) ── */}
      <div className="mt-12 pt-8 border-t border-[#253342]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand text-[11px]">
                <Sparkles size={12} className="mr-1 text-[#F5BF45]" />
                Career Acceleration Core
              </span>
              <span className="text-xs text-[#A8B3C2]">Sync Profile & Pre-Interview Alignment</span>
            </div>
            <h2 className="text-xl font-black text-[#F5F7FA]">
              Career Setup & Future Connector
            </h2>
            <p className="text-xs text-[#A8B3C2]">
              Connect your verified professional profile, extract skills with 99% accuracy, and synchronize customized AI recommendations across every module.
            </p>
          </div>
        </div>

        <CareerOnboardingHub onComplete={fetchDashboard} />
      </div>

      {/* ── Career Goals & Domain Personalization Modal ── */}
      <PersonalizationModal
        isOpen={showPersonalizeModal}
        onClose={() => setShowPersonalizeModal(false)}
        onSaved={fetchDashboard}
      />
    </div>
  );
}
