import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, FileText, MessageSquare, Briefcase, Map, FolderKanban,
  ArrowRight, CheckCircle2, Shield, Sparkles, TrendingUp,
  Cpu, Award, Users, ChevronRight, ChevronLeft, Terminal,
  BarChart3, Check, Star, PlayCircle
} from 'lucide-react';
import { LinkedInIcon } from '../components/common/Icons';

const SLIDES = [
  {
    id: 1,
    image: '/images/interview_coach.jpg',
    badge: 'AI Mock Interview Coach',
    title: 'Simulate Real Technical & Behavioral Rounds',
    desc: 'Receive immediate STAR rubric evaluations (Situation, Task, Action, Result) with personalized bullet corrections for every response.',
    ctaPrimary: 'Start Interview Practice Free',
    ctaPrimaryLink: '/register',
    ctaSecondary: 'Inspect Rubric Demo',
    ctaSecondaryLink: '#preview',
  },
  {
    id: 2,
    image: '/images/resume_audit.jpg',
    badge: 'Deterministic ATS Scanner',
    title: 'Beat Screening Algorithms With 90%+ Match',
    desc: 'Deep-dive keyword density, missing critical sections, quantified metrics, and grammar bottlenecks verified against actual job descriptions.',
    ctaPrimary: 'Upload Resume Now',
    ctaPrimaryLink: '/register',
    ctaSecondary: 'View Sample Audit',
    ctaSecondaryLink: '#preview',
  },
  {
    id: 3,
    image: '/images/success_story.jpg',
    badge: '100% Free For Students & Freshers',
    title: 'From Campus Candidate To Hired Professional',
    desc: 'No expensive paywalls or locked features. CareerCraft equips you with real-time job aggregators, project roadmaps, and LinkedIn optimizations.',
    ctaPrimary: 'Create Free Account',
    ctaPrimaryLink: '/register',
    ctaSecondary: 'Explore Roadmaps',
    ctaSecondaryLink: '/login',
  },
];

export default function LandingPage() {
  const [previewTab, setPreviewTab] = useState('resume');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('cc_intro_seen');
  });

  // Handle intro splash removal
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('cc_intro_seen', 'true');
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Carousel autoplay
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="landing-page">
      {/* ── Initial Intro Entry Animation Overlay ── */}
      {showIntro && (
        <div className="intro-splash-overlay">
          <div className="intro-logo-wrapper">
            <div className="intro-logo-glow" />
            <img src="/logo.png" alt="CareerCraft Logo" className="intro-logo-img" />
          </div>
          <div className="intro-text-brand">CareerCraft</div>
          <div className="intro-text-tagline">Build Your Skills. Craft Your Career.</div>
          <div className="intro-progress-bar">
            <div className="intro-progress-fill" />
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-logo">
            <img src="/logo.png" alt="CareerCraft Official Logo" className="brand-logo-img" />
            <span className="font-extrabold text-xl tracking-tight text-brand-navy">
              Career<span className="text-brand-blue">Craft</span>
            </span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#carousel-showcase" className="landing-nav-link">Showcase</a>
            <a href="#how-it-works" className="landing-nav-link">How it Works</a>
            <a href="#preview" className="landing-nav-link">Live Cockpit</a>
            <a href="#philosophy" className="landing-nav-link">Philosophy</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost font-semibold">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary font-bold">
              <span>Get Started Free</span>
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        <div className="landing-container text-center relative z-10">
          <div className="badge badge-brand mb-6 inline-flex items-center gap-2 px-4 py-1.5 shadow-sm">
            <span className="pulse-dot" />
            <Sparkles size={15} className="text-brand-blue" />
            <span className="font-bold text-xs tracking-wider uppercase text-brand-navy">Next-Gen Career Accelerator</span>
            <span className="badge badge-orange font-bold text-xs">100% Free For Students</span>
          </div>

          <h1 className="hero-title">
            Build Your Skills.<br />
            Craft Your Career.<br />
            <span className="gradient-text">Crack Your Dream Job.</span>
          </h1>

          <p className="hero-subtitle">
            The comprehensive, AI-engineered career co-pilot built specifically for students and early-career job seekers. Optimize resumes for ATS algorithms, master technical interviews with STAR feedback, and conquer the hiring funnel.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-xl">
              <span>Launch Your Career Free</span>
              <ArrowRight size={20} className="ml-2" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-xl">
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

          {/* ── Stock Photo Interactive Carousel Feature ── */}
          <div id="carousel-showcase" className="hero-carousel-container">
            {SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`hero-carousel-slide ${isActive ? 'active' : ''}`}
                  style={{ display: isActive ? 'flex' : 'none' }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="carousel-bg-image"
                  />
                  <div className="carousel-gradient-overlay" />
                  <div className="carousel-content">
                    <span className="carousel-badge">
                      <Sparkles size={14} className="mr-1 text-brand-cyan" />
                      {slide.badge}
                    </span>
                    <h2 className="carousel-title">{slide.title}</h2>
                    <p className="carousel-desc">{slide.desc}</p>
                    <div className="carousel-actions">
                      <Link to={slide.ctaPrimaryLink} className="btn btn-primary btn-lg font-bold">
                        <span>{slide.ctaPrimary}</span>
                        <ArrowRight size={18} className="ml-1" />
                      </Link>
                      <a href={slide.ctaSecondaryLink} className="btn btn-secondary btn-lg font-semibold">
                        <span>{slide.ctaSecondary}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="carousel-nav-btn prev"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextSlide}
              className="carousel-nav-btn next"
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>

            {/* Slide Dots */}
            <div className="carousel-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`carousel-dot ${i === currentSlide ? 'active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── Interactive Hero Showcase Window ── */}
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
                <Terminal size={12} className="text-brand-blue" />
                <span>ai-engine: active</span>
              </div>
            </div>

            <div className="preview-body">
              {previewTab === 'resume' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-50 text-center">
                    <span className="text-xs uppercase font-bold text-muted">ATS Health Score</span>
                    <div className="text-4xl font-black text-brand-blue mt-1">92/100</div>
                    <span className="badge badge-accent mt-2">Ready for Top Tier ATS</span>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div className="p-3.5 rounded-lg border border-border bg-white shadow-xs">
                      <div className="text-xs font-bold text-brand-orange flex items-center gap-1 mb-1">
                        <Sparkles size={13} /> STAR Bullet Revision Engine
                      </div>
                      <div className="text-xs text-muted line-through">
                        &quot;Worked on backend bugs and helped frontend team with schemas.&quot;
                      </div>
                      <div className="text-xs text-brand-navy font-semibold mt-1">
                        &quot;Architected 14 PostgreSQL migrations and tuned indexing, cutting p99 query latency by 42% across 10k daily sessions.&quot;
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="tag text-brand-navy font-bold">Python 95%</span>
                      <span className="tag text-brand-navy font-bold">FastAPI 92%</span>
                      <span className="tag text-brand-navy font-bold">PostgreSQL 89%</span>
                      <span className="tag text-brand-navy font-bold">Docker 84%</span>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'interview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-white shadow-xs">
                    <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
                      System Design & Incident Response
                    </div>
                    <div className="text-base font-bold text-brand-navy">
                      &quot;Describe a situation where a production deployment caused database locks. What steps did you take?&quot;
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-lg border border-border bg-brand-50">
                      <div className="text-[11px] text-muted font-bold">Situation</div>
                      <div className="text-xl font-black text-brand-blue">94%</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-brand-50">
                      <div className="text-[11px] text-muted font-bold">Task</div>
                      <div className="text-xl font-black text-brand-blue">90%</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-brand-50">
                      <div className="text-[11px] text-muted font-bold">Action</div>
                      <div className="text-xl font-black text-brand-purple">96%</div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-brand-50">
                      <div className="text-[11px] text-muted font-bold">Result</div>
                      <div className="text-xl font-black text-brand-orange">88%</div>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'jobs' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="p-4 rounded-xl border border-border bg-brand-50 text-left">
                    <span className="badge badge-brand mb-1">94% Match Fit</span>
                    <div className="font-bold text-base text-brand-navy">Full-Stack Engineer</div>
                    <div className="text-xs text-muted">Remote • Freshers Eligible</div>
                  </div>
                  <div className="md:col-span-2 space-y-2 text-left">
                    <div className="text-xs text-brand-navy font-bold">
                      Matched Skills: Python, React, RESTful APIs, Git, Docker
                    </div>
                    <div className="text-xs text-amber-800 font-semibold p-2.5 rounded-lg border border-amber-200 bg-amber-50">
                      ⚠️ Skill Gap: Docker Containerization • Free Roadmap step ready in 1 click
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase Grid ── */}
      <section id="features" className="py-24 bg-white">
        <div className="landing-container">
          <div className="section-header text-center mb-16">
            <span className="badge badge-brand mb-3">Complete Toolkit</span>
            <h2 className="text-3xl font-black md:text-4xl text-brand-navy">Everything You Need to Get Hired</h2>
            <p className="text-muted max-w-2xl mx-auto mt-4 text-base font-medium">
              Stop guessing why your applications get rejected. CareerCraft gives you the exact tools top candidates use to stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-indigo-500/10 text-brand-blue">
                <FileText size={26} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">AI Resume Diagnostic & ATS Score</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                Extracts skills, work experience, metrics, and bullet point structure. Evaluates keyword density and gives an objective score out of 100 with actionable bullet revisions.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="tag">PDF & DOCX Support</span>
                <span className="tag">JD Keyword Matching</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={26} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">Interactive AI Mock Interviewer</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                Realistic technical and behavioral interview sessions with contextual role-based questions. Receive STAR method breakdown (Situation, Task, Action, Result) for every answer.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="tag">STAR Framework</span>
                <span className="tag">Timed Sessions</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-blue-500/10 text-brand-cyan">
                <Briefcase size={26} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">Curated Jobs & Internship Hub</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                Aggregates real-time remote tech jobs and direct 1-click searches across LinkedIn, Internshala, Indeed, and Naukri with experience filters tailored for freshers.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="tag">Arbeitnow API</span>
                <span className="tag">Saved Jobs Tracker</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-purple-500/10 text-brand-purple">
                <Map size={26} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">Personalized Skill Roadmaps</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                Generate step-by-step learning paths based on your current resume skillset and target dream role. Highlights gap skills and provides recommended free resources.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="tag">Phase-by-Phase</span>
                <span className="tag">Gap Analysis</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-amber-500/10 text-brand-orange">
                <FolderKanban size={26} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">Portfolio Project Recommendations</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                Stop building generic to-do apps. Discover high-impact, resume-worthy projects with architectural milestones, tech stack choices, and interview talking points.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="tag">System Design</span>
                <span className="tag">Architecture Guides</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card feature-card hover-lift">
              <div className="feature-icon bg-blue-500/10 text-brand-blue">
                <LinkedInIcon size={26} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">LinkedIn Profile Optimizer</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                Analyze your headline, About section, and experience bullet points. Generates magnetic headline options and recruiter-friendly keywords to skyrocket profile views.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="tag">Headline Generator</span>
                <span className="tag">Recruiter Hooks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-24 bg-primary">
        <div className="landing-container">
          <div className="section-header text-center mb-16">
            <span className="badge badge-brand mb-3">The Blueprint</span>
            <h2 className="text-3xl font-black md:text-4xl text-brand-navy">From Student to Job-Ready in 4 Steps</h2>
          </div>

          <div className="steps-container grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="step-card">
              <div className="step-number">01</div>
              <h4 className="text-lg font-bold mb-2 text-brand-navy">Upload Resume</h4>
              <p className="text-secondary text-sm">
                Drop your PDF or DOCX file to get an immediate ATS health check and keyword audit.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h4 className="text-lg font-bold mb-2 text-brand-navy">Match With Job Description</h4>
              <p className="text-secondary text-sm">
                Paste any JD to see missing critical skills and tailored bullet improvements.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h4 className="text-lg font-bold mb-2 text-brand-navy">Drill Mock Interviews</h4>
              <p className="text-secondary text-sm">
                Answer realistic questions and learn exactly how to refine your answers with the STAR technique.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <h4 className="text-lg font-bold mb-2 text-brand-navy">Apply & Track</h4>
              <p className="text-secondary text-sm">
                Explore curated opportunities, bookmark top jobs, and track your readiness score as it grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Student Philosophy Callout ── */}
      <section id="philosophy" className="py-20 bg-brand-navy text-white relative overflow-hidden">
        <div className="landing-container text-center relative z-10">
          <Award size={44} className="mx-auto mb-4 text-brand-cyan" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Built by Students, for Students</h2>
          <p className="text-slate-200 max-w-2xl mx-auto mb-8 text-lg">
            Commercial career tools charge steep monthly subscriptions. CareerCraft was created on the conviction that every student deserves world-class career guidance without paying a single rupee.
          </p>
          <div className="inline-flex gap-4">
            <Link to="/register" className="btn btn-orange btn-lg shadow-lg font-bold">
              Start Free Today
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer py-12 border-t border-border bg-white">
        <div className="landing-container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CareerCraft Logo" className="brand-logo-img" style={{ width: 36, height: 36 }} />
            <span className="font-bold text-lg text-brand-navy">CareerCraft</span>
          </div>
          <p className="text-muted text-sm text-center">
            &copy; {new Date().getFullYear()} CareerCraft. Build Your Skills. Craft Your Career. Crack Your Dream Job.
          </p>
          <div className="flex gap-4 text-sm font-semibold text-secondary">
            <Link to="/login" className="hover:text-brand-blue">Sign In</Link>
            <Link to="/register" className="hover:text-brand-blue">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
