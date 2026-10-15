import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud, ArrowRight, CheckCircle2, Sparkles,
  TrendingUp, Award, Check, FileText, MessageSquare,
  Briefcase, Map, FolderKanban, ShieldCheck, Zap
} from 'lucide-react';
import { CareerCraftLogo, LinkedInIcon } from '../components/common/Icons';
import AtsScoreGauge from '../components/common/AtsScoreGauge';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('cc_intro_seen');
  });

  // Handle intro splash removal
  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('cc_intro_seen', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  return (
    <div className="landing-page tech-grid-bg text-white min-h-screen">
      {/* ── Initial Intro Entry Animation Overlay ── */}
      {showIntro && (
        <div className="intro-splash-overlay">
          <div className="intro-logo-wrapper">
            <div className="intro-logo-glow" />
            <CareerCraftLogo size={80} showText={false} />
          </div>
          <div className="intro-text-brand flex items-center gap-2">
            <span>CAREER</span>
            <span className="text-[#F59E0B]">CRAFT</span>
          </div>
          <div className="intro-text-tagline">Craft Your Resume. Beat the ATS. Build Your Career.</div>
          <div className="intro-progress-bar">
            <div className="intro-progress-fill" />
          </div>
        </div>
      )}

      {/* ── Top Navigation Bar (Obsidian & Gold) ── */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-logo">
            <CareerCraftLogo size={32} showText={true} />
          </Link>

          <nav className="landing-nav-links">
            <a href="#hero" className="landing-nav-link hover:text-[#FFB800] transition-colors">Home</a>
            <Link to="/resume" className="landing-nav-link hover:text-[#FFB800] transition-colors">Resume Analyzer</Link>
            <a href="#ats-preview" className="landing-nav-link hover:text-[#FFB800] transition-colors">ATS Score</a>
            <a href="#features" className="landing-nav-link hover:text-[#FFB800] transition-colors">Features</a>
            <a href="#about" className="landing-nav-link hover:text-[#FFB800] transition-colors">About</a>
          </nav>

          <div className="landing-nav-actions flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost px-5 py-2 text-sm font-semibold hover:text-[#FFB800]">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary px-6 py-2 text-sm font-extrabold shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Template Top-Left Mockup) ── */}
      <section id="hero" className="landing-hero py-16 md:py-24 relative overflow-hidden">
        <div className="landing-container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141926] border border-[#F59E0B]/30 text-[#FFB800] text-xs font-bold tracking-wide">
                <Sparkles size={14} className="text-[#FFB800]" />
                <span>AI Powered Resume & ATS Analyzer</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Craft Your Resume.<br />
                <span className="text-gold">Beat the ATS.</span><br />
                Build Your Career.
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Upload your resume and get an intelligent ATS analysis with actionable insights to improve your chances of getting noticed.
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  to="/resume"
                  className="btn btn-primary btn-xl text-black font-extrabold shadow-xl inline-flex items-center gap-2 group"
                >
                  <span>Analyze My Resume</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 3 Micro-Features */}
              <div className="pt-6 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-gray-300 font-semibold border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B]/15 text-[#FFB800] flex items-center justify-center text-xs">✦</div>
                  <span>AI Powered Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B]/15 text-[#FFB800] flex items-center justify-center text-xs">✦</div>
                  <span>Detailed Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B]/15 text-[#FFB800] flex items-center justify-center text-xs">✦</div>
                  <span>Better Job Opportunities</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (Layered 3D Resume + Dark ATS Card with 87 Dial) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="hero-mockup-wrapper w-full max-w-md">
                {/* Golden ambient lighting */}
                <div className="hero-ambient-ribbon" />

                {/* Angled White Resume Document */}
                <div className="hero-paper-resume">
                  <div className="resume-paper-header">
                    <div className="resume-paper-avatar" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-300 rounded w-24" />
                      <div className="h-2 bg-slate-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="resume-paper-line w-full" />
                    <div className="resume-paper-line w-11/12" />
                    <div className="resume-paper-line w-4/5" />
                    <div className="resume-paper-line w-full" />
                    <div className="resume-paper-line w-3/4" />
                    <div className="resume-paper-line w-5/6" />
                    <div className="resume-paper-line w-2/3" />
                  </div>
                </div>

                {/* Floating Dark Glass ATS Card with Dial 87 and Checklist */}
                <div className="hero-floating-ats-card">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    ATS Analysis
                  </div>

                  {/* Circular Golden Ring Dial */}
                  <div className="relative w-28 h-28 mx-auto my-2 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="7" />
                      <circle
                        cx="50" cy="50" r="42" fill="none" stroke="url(#atsGoldGradient)" strokeWidth="7"
                        strokeDasharray="264" strokeDashoffset="34" strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-white leading-none">87</span>
                      <span className="text-[10px] font-bold text-gray-400">/100</span>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span>✓</span>
                      <span>Excellent Match</span>
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1.5 text-xs text-gray-200">
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>Skills Match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>Keyword Match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>Formatting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>Education</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Why Choose Career Craft? (Template Bottom-Left Mockup) ── */}
      <section id="features" className="py-20 bg-[#070A11] border-t border-b border-white/5 relative">
        <div className="landing-container max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Why Choose Career Craft?
                </h2>
                <p className="text-gray-400 text-base mt-2">
                  Smart analysis. Better opportunities.
                </p>
              </div>

              {/* 4 Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: ATS Friendly */}
                <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1.5">ATS Friendly</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Get your resume optimized for applicant tracking systems.
                  </p>
                </div>

                {/* Card 2: Detailed Insights */}
                <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1.5">Detailed Insights</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Understand your strengths and areas of improvement.
                  </p>
                </div>

                {/* Card 3: Personalized Suggestions */}
                <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1.5">Personalized Suggestions</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    AI-driven recommendations to boost your score.
                  </p>
                </div>

                {/* Card 4: Career Growth */}
                <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                    <Award size={20} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1.5">Career Growth</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Land more interviews and achieve your dream job.
                  </p>
                </div>
              </div>
            </div>

            {/* Faceted 3D Glowing Crystal Prism Accent */}
            <div className="w-full lg:w-96 flex items-center justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />
                <img
                  src="/images/gold_prism.jpg"
                  alt="Career Craft Geometric Prism"
                  className="w-72 h-72 object-cover rounded-3xl border border-[#F59E0B]/30 shadow-2xl shadow-[#F59E0B]/20 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Fast Upload Area (Template Center-Bottom Mockup) ── */}
      <section id="ats-preview" className="py-20 relative">
        <div className="landing-container max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <CareerCraftLogo size={28} showText={true} />
          </div>

          {/* Golden Dashed Upload Box */}
          <div
            onClick={() => navigate('/resume')}
            className="gold-upload-zone group"
          >
            <div className="gold-cloud-icon-wrap group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Drag & Drop Your Resume Here
            </h3>
            <p className="text-xs text-gray-400 mb-5">or</p>

            <div>
              <Link
                to="/resume"
                className="btn btn-primary px-8 py-2.5 text-sm font-extrabold shadow-lg inline-block"
              >
                Choose File
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-5">
              Supported formats: PDF, DOCX (Max 5MB)
            </p>
          </div>

          {/* 3-Step Breadcrumbs Stepper */}
          <div className="breadcrumb-stepper">
            <div className="stepper-item active">
              <div className="stepper-circle">1</div>
              <span>Upload</span>
            </div>
            <div className="stepper-divider" />
            <div className="stepper-item">
              <div className="stepper-circle">2</div>
              <span>Analyze</span>
            </div>
            <div className="stepper-divider" />
            <div className="stepper-item">
              <div className="stepper-circle">3</div>
              <span>Get Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Turn Your Resume Into Opportunities (Template Bottom-Left) ── */}
      <section className="py-20 bg-[#070A11] border-t border-white/5 relative overflow-hidden">
        <div className="landing-container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-block px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                Your Career. Our Priority.
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Turn Your Resume<br />
                Into Opportunities
              </h2>

              <p className="text-gray-300 text-sm sm:text-base max-w-lg leading-relaxed">
                Join thousands of job seekers who are already building better careers with Career Craft.
              </p>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="btn btn-primary px-8 py-3 text-sm font-extrabold shadow-xl inline-flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Workspace Image with Golden Script Quote */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                <img
                  src="/images/workspace_gold.jpg"
                  alt="Modern Tech Workspace"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8">
                  <div className="text-right ml-auto">
                    <p className="text-2xl sm:text-3xl font-serif italic text-[#FFE071] tracking-wide drop-shadow-md">
                      Better Resume,<br />
                      Bigger Opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comprehensive Tools Showcase ── */}
      <section id="about" className="py-20">
        <div className="landing-container max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-brand mb-2">Built For Ambitious Students</span>
            <h2 className="text-3xl font-black text-white">Full-Stack Career Acceleration</h2>
            <p className="text-sm text-gray-400 mt-2">
              Everything integrated into a single unified cockpit with zero locked features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">STAR Mock Interview Coach</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                AI evaluates your answers across Situation, Task, Action, and Result rubrics with bullet-point feedback for high-stress technical rounds.
              </p>
              <Link to="/interview" className="text-xs font-bold text-[#FFB800] hover:underline flex items-center gap-1">
                <span>Practice Interview</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                <Briefcase size={20} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Remote Tech Job Aggregator</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Aggregates active listings from top job boards with 1-click keyword search and JD match scoring based directly on your resume.
              </p>
              <Link to="/jobs" className="text-xs font-bold text-[#FFB800] hover:underline flex items-center gap-1">
                <span>Explore Jobs</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl hover:border-[#F59E0B]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/12 text-[#FFB800] flex items-center justify-center mb-4">
                <Map size={20} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Skill Gap & Learning Roadmaps</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Pinpoints exact tech gaps between your resume and market demand, generating clear step-by-step milestone learning roadmaps.
              </p>
              <Link to="/roadmap" className="text-xs font-bold text-[#FFB800] hover:underline flex items-center gap-1">
                <span>View Roadmaps</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-white/10 bg-[#05070B]">
        <div className="landing-container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <CareerCraftLogo size={28} showText={true} />
          </div>
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} CAREER CRAFT. All rights reserved. Craft Your Resume. Beat the ATS. Build Your Career.
          </p>
          <div className="flex gap-5 text-xs font-semibold text-gray-400">
            <Link to="/login" className="hover:text-[#FFB800] transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-[#FFB800] transition-colors">Register</Link>
            <Link to="/resume" className="hover:text-[#FFB800] transition-colors">Resume Analyzer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
