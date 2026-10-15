import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, FileText, MessageSquare, Briefcase, Map, FolderKanban,
  ArrowRight, CheckCircle2, Shield, Sparkles, TrendingUp,
  Cpu, Award, Users, ChevronRight, Terminal, BarChart3, Check, Star
} from 'lucide-react';
import { LinkedInIcon } from '../components/common/Icons';

export default function LandingPage() {
  const [previewTab, setPreviewTab] = useState('resume');

  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <div className="sidebar-logo-icon">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              <span className="gradient-text font-black">CC</span> Career Craft
            </span>
          </div>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How it Works</a>
            <a href="#preview" className="landing-nav-link">Live Cockpit</a>
            <a href="#philosophy" className="landing-nav-link">About</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              <span>Get Started Free</span>
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="landing-container text-center relative z-10">
          <div className="badge badge-brand mb-6 inline-flex items-center gap-2 px-4 py-1.5 shadow-sm">
            <span className="pulse-dot" />
            <Sparkles size={15} className="text-brand-400" />
            <span className="font-semibold text-xs tracking-wider uppercase">Next-Gen Career Accelerator</span>
            <span className="bg-brand-500/20 text-brand-300 text-xs px-2 py-0.5 rounded-full font-bold">100% Free</span>
          </div>

          <h1 className="hero-title">
            Build Your Skills.<br />
            Craft Your Career.<br />
            <span className="gradient-text">Crack Your Dream Job.</span>
          </h1>

          <p className="hero-subtitle">
            The comprehensive, AI-engineered career co-pilot built specifically for students and early-career developers. Optimize resumes for ATS algorithms, master technical interviews with STAR feedback, and conquer the hiring funnel.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-xl">
              <span>Launch Your Career Free</span>
              <ArrowRight size={20} className="ml-2" />
            </Link>
            <Link to="/login" className="btn btn-outline btn-xl">
              <span>Sign In to Dashboard</span>
            </Link>
          </div>

          <div className="hero-stats-banner">
            <div className="hero-stat-item">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Free & Open-Source</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <div className="hero-stat-number">&lt; 3s</div>
              <div className="hero-stat-label">Instant ATS Analysis</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <div className="hero-stat-number">STAR</div>
              <div className="hero-stat-label">Interview Coaching</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <div className="hero-stat-number">0 Paid</div>
              <div className="hero-stat-label">No Subscriptions</div>
            </div>
          </div>

          {/* Interactive Hero Showcase Window */}
          <div id="preview" className="hero-preview-window">
            <div className="preview-window-header">
              <div className="window-dots">
                <span className="window-dot red" />
                <span className="window-dot yellow" />
                <span className="window-dot green" />
              </div>
              <div className="preview-tabs">
                <button
                  onClick={() => setPreviewTab('resume')}
                  className={`preview-tab-btn ${previewTab === 'resume' ? 'active' : ''}`}
                >
                  <FileText size={13} className="inline mr-1" />
                  ATS Resume Audit
                </button>
                <button
                  onClick={() => setPreviewTab('interview')}
                  className={`preview-tab-btn ${previewTab === 'interview' ? 'active' : ''}`}
                >
                  <MessageSquare size={13} className="inline mr-1" />
                  STAR Mock Interview
                </button>
                <button
                  onClick={() => setPreviewTab('jobs')}
                  className={`preview-tab-btn ${previewTab === 'jobs' ? 'active' : ''}`}
                >
                  <Briefcase size={13} className="inline mr-1" />
                  JD Match & Gaps
                </button>
              </div>
              <div className="text-xs text-muted font-mono flex items-center gap-1.5 hidden-mobile">
                <Terminal size={12} className="text-brand-400" />
                <span>ai-engine: active</span>
              </div>
            </div>

            <div className="preview-body">
              {previewTab === 'resume' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 text-center">
                    <span className="text-xs uppercase font-semibold text-muted">ATS Health Score</span>
                    <div className="text-4xl font-black text-emerald-400 mt-1">88/100</div>
                    <span className="badge badge-accent mt-2">Ready for Top Tier ATS</span>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div className="p-3 rounded-lg border border-border bg-surface/50">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                        <Sparkles size={12} /> Bullet Revision Engine
                      </div>
                      <div className="text-xs text-muted line-through">
                        &quot;Worked on backend bugs and helped frontend team with schemas.&quot;
                      </div>
                      <div className="text-xs text-emerald-300 font-medium mt-1">
                        &quot;Engineered 14 PostgreSQL migrations and tuned indexing, cutting p99 query latency by 42% across 10k daily sessions.&quot;
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="tag text-brand-300 border-brand-500/30">Python 95%</span>
                      <span className="tag text-brand-300 border-brand-500/30">FastAPI 92%</span>
                      <span className="tag text-brand-300 border-brand-500/30">PostgreSQL 89%</span>
                      <span className="tag text-brand-300 border-brand-500/30">Docker 84%</span>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'interview' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-border bg-surface/60">
                    <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                      System Design & Incident Response
                    </div>
                    <div className="text-sm font-bold text-primary">
                      &quot;Describe a situation where a production deployment caused database locks. What steps did you take?&quot;
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg border border-border bg-surface/40">
                      <div className="text-[11px] text-muted font-semibold">Situation</div>
                      <div className="text-lg font-black text-emerald-400">94%</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-surface/40">
                      <div className="text-[11px] text-muted font-semibold">Task</div>
                      <div className="text-lg font-black text-emerald-400">90%</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-surface/40">
                      <div className="text-[11px] text-muted font-semibold">Action</div>
                      <div className="text-lg font-black text-brand-400">96%</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-surface/40">
                      <div className="text-[11px] text-muted font-semibold">Result</div>
                      <div className="text-lg font-black text-emerald-400">88%</div>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'jobs' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="p-4 rounded-xl border border-border bg-surface/50">
                    <span className="badge badge-brand mb-1">94% Match Fit</span>
                    <div className="font-bold text-sm text-primary">Full-Stack Engineer</div>
                    <div className="text-xs text-muted">Remote • Freshers Eligible</div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-xs text-secondary font-semibold">
                      Matched Skills: Python, React, RESTful APIs, Git
                    </div>
                    <div className="text-xs text-amber-300 font-medium p-2 rounded border border-amber-500/20 bg-amber-500/5">
                      ⚠️ Skill Gap: Docker Containerization • Free Roadmap step ready in 1 click
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 bg-surface">
        <div className="landing-container">
          <div className="section-header text-center mb-16">
            <span className="badge badge-accent mb-3">Complete Toolkit</span>
            <h2 className="text-3xl font-black md:text-4xl">Everything You Need to Get Hired</h2>
            <p className="text-muted max-w-2xl mx-auto mt-4">
              Stop guessing why your applications get rejected. Career Craft gives you the exact tools top candidates use to stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-indigo-500/10 text-brand-500">
                <FileText size={26} />
              </div>
              <h3 className="feature-title">AI Resume Diagnostic & ATS Score</h3>
              <p className="feature-desc">
                Extracts skills, work experience, metrics, and bullet point structure. Evaluates keyword density and gives an objective score out of 100 with actionable bullet revisions.
              </p>
              <div className="feature-tags">
                <span className="tag">PDF & DOCX Support</span>
                <span className="tag">JD Keyword Matching</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={26} />
              </div>
              <h3 className="feature-title">Interactive AI Mock Interviewer</h3>
              <p className="feature-desc">
                Realistic technical and behavioral interview sessions with contextual role-based questions. Receive STAR method breakdown (Situation, Task, Action, Result) for every answer.
              </p>
              <div className="feature-tags">
                <span className="tag">STAR Framework</span>
                <span className="tag">Timed Sessions</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-blue-500/10 text-blue-500">
                <Briefcase size={26} />
              </div>
              <h3 className="feature-title">Curated Jobs & Internship Hub</h3>
              <p className="feature-desc">
                Aggregates real-time remote tech jobs and direct 1-click searches across LinkedIn, Internshala, Indeed, and Naukri with experience filters tailored for freshers.
              </p>
              <div className="feature-tags">
                <span className="tag">Arbeitnow API</span>
                <span className="tag">Saved Jobs Tracker</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-purple-500/10 text-purple-500">
                <Map size={26} />
              </div>
              <h3 className="feature-title">Personalized Skill Roadmaps</h3>
              <p className="feature-desc">
                Generate step-by-step learning paths based on your current resume skillset and target dream role. Highlights gap skills and provides recommended free resources.
              </p>
              <div className="feature-tags">
                <span className="tag">Phase-by-Phase</span>
                <span className="tag">Gap Analysis</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-amber-500/10 text-amber-500">
                <FolderKanban size={26} />
              </div>
              <h3 className="feature-title">Portfolio Project Recommendations</h3>
              <p className="feature-desc">
                Stop building generic to-do apps. Discover high-impact, resume-worthy projects with architectural milestones, tech stack choices, and interview talking points.
              </p>
              <div className="feature-tags">
                <span className="tag">System Design</span>
                <span className="tag">Architecture Guides</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-sky-500/10 text-sky-500">
                <LinkedInIcon size={26} />
              </div>
              <h3 className="feature-title">LinkedIn Profile Optimizer</h3>
              <p className="feature-desc">
                Analyze your headline, About section, and experience bullet points. Generates magnetic headline options and recruiter-friendly keywords to skyrocket profile views.
              </p>
              <div className="feature-tags">
                <span className="tag">Headline Generator</span>
                <span className="tag">Recruiter Hooks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="landing-container">
          <div className="section-header text-center mb-16">
            <span className="badge badge-brand mb-3">The Blueprint</span>
            <h2 className="text-3xl font-black md:text-4xl">From Student to Job-Ready in 4 Steps</h2>
          </div>

          <div className="steps-container grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="step-card">
              <div className="step-number">01</div>
              <h4 className="text-lg font-bold mb-2">Upload Resume</h4>
              <p className="text-muted text-sm">
                Drop your PDF or DOCX file to get an immediate ATS health check and keyword audit.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h4 className="text-lg font-bold mb-2">Match With Job Description</h4>
              <p className="text-muted text-sm">
                Paste any JD to see missing critical skills and tailored bullet improvements.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h4 className="text-lg font-bold mb-2">Drill Mock Interviews</h4>
              <p className="text-muted text-sm">
                Answer realistic questions and learn exactly how to refine your answers with the STAR technique.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <h4 className="text-lg font-bold mb-2">Apply & Track</h4>
              <p className="text-muted text-sm">
                Explore curated opportunities, bookmark top jobs, and track your readiness score as it grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Philosophy Callout */}
      <section id="philosophy" className="py-20 bg-brand-900 text-white relative overflow-hidden">
        <div className="landing-container text-center relative z-10">
          <Award size={40} className="mx-auto mb-4 text-brand-300" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Built by Students, for Students</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
            Commercial career tools charge steep monthly subscriptions. Career Craft was created on the conviction that every student deserves world-class career guidance without paying a single rupee.
          </p>
          <div className="inline-flex gap-4">
            <Link to="/register" className="btn btn-primary btn-lg shadow-lg">
              Start Free Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-12 border-t border-border">
        <div className="landing-container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="sidebar-logo-icon">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">CC — Career Craft</span>
          </div>
          <p className="text-muted text-sm text-center">
            &copy; {new Date().getFullYear()} Career Craft. Build Your Skills. Craft Your Career. Crack Your Dream Job.
          </p>
          <div className="flex gap-4 text-sm text-muted">
            <Link to="/login" className="hover:text-primary">Sign In</Link>
            <Link to="/register" className="hover:text-primary">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
