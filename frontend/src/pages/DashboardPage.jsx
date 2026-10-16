import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, MessageSquare, Briefcase, Map, FolderKanban,
  Zap, Award, TrendingUp, AlertCircle, ArrowRight,
  CheckCircle, Plus, RefreshCw, Star, Flame, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import CareerOnboardingHub from '../components/common/CareerOnboardingHub';

export default function DashboardPage() {

  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const readiness = data?.career_readiness || { score: 0, level: 'Getting Started' };
  const resume = data?.resume_stats || {};
  const interview = data?.interview_stats || {};
  const skills = data?.skill_stats || {};
  const streak = data?.streak_days || 0;
  const points = data?.total_points || 0;

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="dashboard-hero-card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand">
                <Sparkles size={12} className="mr-1 text-brand-300" />
                AI Career Cockpit
              </span>
              <span className="text-xs text-muted">Role Target:</span>
              <span className="font-semibold text-xs text-brand-400">
                {user?.target_role || 'Software Engineer'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#F5F7FA]">
              Welcome back, {user?.name || 'Akash'}
            </h1>
            <p className="text-xs md:text-sm text-[#A8B3C2] mt-1">
              Your career progress, learning activity, and next steps in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="btn btn-outline btn-sm"
              title="Refresh metrics"
            >
              <RefreshCw size={15} />
            </button>
            <Link to="/resume" className="btn btn-primary btn-sm">
              <Plus size={16} className="mr-1" />
              <span>Analyze Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Career Stack Setup & Feature Connector ── */}
      <CareerOnboardingHub onComplete={fetchDashboard} />

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
            <span className="text-3xl font-black">{readiness.score}%</span>
            <span className="badge badge-accent text-xs">{readiness.level}</span>
          </div>
          <div className="progress-bar-bg mt-3">
            <div
              className="progress-bar-fill bg-brand-500"
              style={{ width: `${Math.min(100, readiness.score)}%` }}
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
              {resume.ats_score != null ? `${resume.ats_score}/100` : '—'}
            </span>
            <span className="text-xs text-muted">
              {resume.total_resumes ? `${resume.total_resumes} uploaded` : 'None uploaded'}
            </span>
          </div>
          <div className="progress-bar-bg mt-3">
            <div
              className="progress-bar-fill bg-emerald-500"
              style={{ width: `${resume.ats_score || 0}%` }}
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
              {interview.avg_score != null ? `${interview.avg_score}%` : '—'}
            </span>
            <span className="text-xs text-muted">
              {interview.completed || 0} completed
            </span>
          </div>
          <div className="progress-bar-bg mt-3">
            <div
              className="progress-bar-fill bg-amber-500"
              style={{ width: `${interview.avg_score || 0}%` }}
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
                    Detected in Resume ({skills.current_skills_count || 0})
                  </span>
                </div>
                {skills.current_skills && skills.current_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.current_skills.map((s, idx) => (
                      <span key={idx} className="badge badge-accent text-xs">
                        {s.skill_name || s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic">
                    Upload a resume to automatically extract your technical skills.
                  </p>
                )}
              </div>

              {/* High priority gaps */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={15} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Target Gap Skills ({skills.gap_skills_count || 0})
                  </span>
                </div>
                {skills.gap_skills && skills.gap_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.gap_skills.map((s, idx) => (
                      <span key={idx} className="badge badge-amber text-xs">
                        {s.skill_name || s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic">
                    No critical gaps identified! Great job matching your target profile.
                  </p>
                )}
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
    </div>
  );
}
