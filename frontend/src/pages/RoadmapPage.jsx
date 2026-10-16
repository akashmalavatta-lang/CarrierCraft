/**
 * CC — CareerCraft
 * Learning Roadmap Page — Pixel-identical to design reference image.
 * Features:
 * - Category path pills (Recommended, Data Science, Web Dev, AI/ML, Cybersecurity, App Dev, All Paths)
 * - Top hero card: "Data Science Learning Path" with gold 3D chart, duration, phases, resources, career outcomes
 * - Hero banner: Student studying at desk with glowing "Better Skills, Bigger Opportunities" text
 * - 5-Phase Horizontal Stepper: (1) Foundations, (2) Data Analysis, (3) Machine Learning, (4) Advanced Topics, (5) Projects & Portfolio
 * - Phase 1 Foundations modules with interactive status (Completed, In Progress, Start Learning, Not Started)
 * - Right Column: Circular learning progress gauge, Learning resources tiles, Recommended next steps, Stay Consistent banner
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI } from '../api';
import toast from 'react-hot-toast';
import {
  Sparkles, CheckCircle2, Clock, BookOpen, ExternalLink,
  ChevronRight, Award, Plus, Layers, Play, FileText, Code2,
  Trophy, TrendingUp, BarChart3, Database, Check, ChevronDown,
  Target, Briefcase, Compass, Lightbulb, Laptop, ArrowRight, Zap, FolderKanban
} from 'lucide-react';

const CATEGORIES = [
  'Recommended',
  'Data Science',
  'Web Development',
  'AI/ML',
  'Cybersecurity',
  'App Development',
  'All Paths'
];

const PHASES = [
  { step: 1, title: 'Foundations', duration: '2-3 weeks', id: 'foundations' },
  { step: 2, title: 'Data Analysis', duration: '3-4 weeks', id: 'data_analysis' },
  { step: 3, title: 'Machine Learning', duration: '4-6 weeks', id: 'machine_learning' },
  { step: 4, title: 'Advanced Topics', duration: '3-4 weeks', id: 'advanced_topics' },
  { step: 5, title: 'Projects & Portfolio', duration: '2-3 weeks', id: 'portfolio' }
];

const MODULES_DATA = {
  foundations: [
    {
      id: 'm1',
      title: 'Python Basics for Data Science',
      desc: 'Learn Python programming from scratch.',
      duration: '12 hours',
      type: 'Video + Practice',
      status: 'completed',
      icon: '🐍'
    },
    {
      id: 'm2',
      title: 'Mathematics for Data Science',
      desc: 'Linear algebra, statistics, and probability.',
      duration: '8 hours',
      type: 'Video + Notes',
      status: 'completed',
      icon: '📈'
    },
    {
      id: 'm3',
      title: 'SQL for Data Analysis',
      desc: 'Query data and work with databases.',
      duration: '10 hours',
      type: 'Video + Practice',
      status: 'in_progress',
      icon: '🗄️'
    },
    {
      id: 'm4',
      title: 'Data Analysis with Pandas',
      desc: 'Data cleaning, analysis, and visualization.',
      duration: '8 hours',
      type: 'Video + Practice',
      status: 'action',
      icon: '📊'
    },
    {
      id: 'm5',
      title: 'Data Visualization with Matplotlib & Seaborn',
      desc: 'Create meaningful and beautiful visualizations.',
      duration: '6 hours',
      type: 'Video + Practice',
      status: 'not_started',
      icon: '📉'
    },
    {
      id: 'm6',
      title: 'Mini Project: Analyze Real World Dataset',
      desc: 'Apply your knowledge and build a mini project.',
      duration: '5 hours',
      type: 'Project + Submission',
      status: 'not_started',
      icon: '📝'
    }
  ],
  data_analysis: [
    {
      id: 'da1',
      title: 'Exploratory Data Analysis (EDA)',
      desc: 'Master outlier detection, hypothesis testing, and missing data imputation.',
      duration: '10 hours',
      type: 'Video + Lab',
      status: 'not_started',
      icon: '🔍'
    },
    {
      id: 'da2',
      title: 'Feature Engineering & Transformation',
      desc: 'Scale features, encode categorical variables, and engineer interaction features.',
      duration: '8 hours',
      type: 'Lab + Practice',
      status: 'not_started',
      icon: '⚙️'
    }
  ],
  machine_learning: [
    {
      id: 'ml1',
      title: 'Supervised Learning Algorithms',
      desc: 'Regression, Decision Trees, Random Forests, and XGBoost.',
      duration: '16 hours',
      type: 'Video + Code Lab',
      status: 'not_started',
      icon: '🤖'
    },
    {
      id: 'ml2',
      title: 'Unsupervised Learning & Clustering',
      desc: 'K-Means, PCA, Hierarchical Clustering, and anomaly detection.',
      duration: '12 hours',
      type: 'Video + Lab',
      status: 'not_started',
      icon: '🌐'
    }
  ],
  advanced_topics: [
    {
      id: 'at1',
      title: 'Deep Learning with PyTorch',
      desc: 'Neural networks, backpropagation, and CNN architectures.',
      duration: '18 hours',
      type: 'Project + Code',
      status: 'not_started',
      icon: '🧠'
    }
  ],
  portfolio: [
    {
      id: 'pf1',
      title: 'Production ML Pipeline Deployment',
      desc: 'Deploy ML models with FastAPI, Docker, and GitHub Actions.',
      duration: '14 hours',
      type: 'Capstone Project',
      status: 'not_started',
      icon: '🚀'
    }
  ]
};

export default function RoadmapPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Recommended');
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const currentPhase = PHASES[activePhaseIndex];
  const [modules, setModules] = useState(MODULES_DATA.foundations);

  useEffect(() => {
    setModules(MODULES_DATA[currentPhase.id] || MODULES_DATA.foundations);
  }, [activePhaseIndex, currentPhase.id]);

  const toggleModuleStatus = (modId) => {
    setModules(prev => prev.map(m => {
      if (m.id === modId) {
        if (m.status === 'completed') return { ...m, status: 'in_progress' };
        if (m.status === 'in_progress') return { ...m, status: 'action' };
        if (m.status === 'action') return { ...m, status: 'completed' };
        return { ...m, status: 'completed' };
      }
      return m;
    }));
    toast.success('Module progress updated! ✨');
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#05080D] text-[#F5F7FA] p-3 md:p-6 flex flex-col gap-5 font-sans selection:bg-[#F5BF45]/30">

      {/* ── Top Header Section (Matching Reference Design) ────────────────────── */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Learning <span className="text-[#F5BF45]">Roadmap</span>
        </h1>
        <p className="text-xs md:text-sm text-[#A8B3C2] max-w-3xl -mt-1">
          Structured learning paths to help you build in-demand skills and achieve your career goals.
        </p>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  toast.success(`Switched to ${cat} roadmap`);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#F5BF45] text-[#05080D] shadow-lg shadow-[#F5BF45]/20 font-extrabold'
                    : 'bg-[#0B121B] hover:bg-[#101A26] border border-[#253342] text-[#A8B3C2] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Top Hero Cards Grid (Matching Reference Design) ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">

        {/* Hero Card 1: Data Science Learning Path (8/12 on lg) */}
        <div className="lg:col-span-8 rounded-2xl bg-gradient-to-r from-[#0B121B] via-[#0E1622] to-[#121B27] border border-[#253342] p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F5BF45]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              {/* 3D Gold Chart Graphic Box */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5BF45]/20 to-[#D99B22]/10 border border-[#F5BF45]/40 flex items-center justify-center shrink-0 shadow-lg shadow-[#F5BF45]/10">
                <BarChart3 size={32} className="text-[#F5BF45]" />
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                  Data Science Learning Path
                </h2>
                <p className="text-xs text-[#A8B3C2] leading-relaxed mb-3">
                  Master in-demand skills step by step and become job ready.
                </p>

                {/* Info Chips */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8B3C2]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#F5BF45]" /> 6 Months
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target size={13} className="text-[#F5BF45]" /> 5 Learning Phases
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[#F5BF45]" /> 30+ Resources
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-[#F5BF45]" /> Portfolio Projects
                  </span>
                </div>
              </div>
            </div>

            {/* Career Outcomes Right Inset */}
            <div className="sm:border-l sm:border-[#253342] sm:pl-5 text-xs shrink-0">
              <div className="flex items-center gap-1.5 text-white font-bold mb-2">
                <Compass size={14} className="text-[#F5BF45]" />
                <span>Career Outcome</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#A8B3C2]">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F5BF45]">✜</span> Data Analyst
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F5BF45]">✜</span> Data Scientist
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F5BF45]">✜</span> ML Engineer
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F5BF45]">✜</span> Business Analyst
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#253342]/60">
            <button
              onClick={() => toast.success('Starting Learning Path! Module unlocked.')}
              className="px-5 py-2.5 rounded-xl bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] font-bold text-xs flex items-center gap-2 shadow-md shadow-[#F5BF45]/20 transition-all"
            >
              <span>Start Learning</span>
              <ChevronRight size={15} />
            </button>
            <button
              onClick={() => toast('Roadmap customization unlocked for Pro members', { icon: '⚙️' })}
              className="px-4 py-2.5 rounded-xl bg-[#101A26] hover:bg-[#162232] border border-[#253342] text-xs font-semibold text-[#A8B3C2] hover:text-white transition-all"
            >
              Customize Path
            </button>
          </div>
        </div>

        {/* Hero Card 2: Student Studying Graphic Banner (4/12 on lg) */}
        <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-[#253342] bg-[#0B121B] relative shadow-xl min-h-[190px] flex items-center justify-center">
          <img
            src="/images/success_story.jpg"
            alt="Student Learning"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* Glowing Golden Script Overlay */}
          <div className="absolute top-4 right-4 text-right pointer-events-none">
            <div className="text-[#F5BF45] font-serif italic text-base md:text-lg font-bold drop-shadow-[0_2px_8px_rgba(245,191,69,0.8)] leading-tight">
              Better Skills
            </div>
            <div className="text-[#F5BF45] font-serif italic text-base md:text-lg font-bold drop-shadow-[0_2px_8px_rgba(245,191,69,0.8)] leading-tight">
              Bigger Opportunities
            </div>
          </div>
        </div>
      </div>

      {/* ── 5-Phase Horizontal Stepper Bar (Matching Reference Design) ─────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
        {PHASES.map((p, idx) => {
          const isActive = idx === activePhaseIndex;
          const isDone = idx < activePhaseIndex;

          return (
            <button
              key={p.id}
              onClick={() => setActivePhaseIndex(idx)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#D99B22]/30 via-[#F5BF45]/15 to-[#0B121B] border-[#F5BF45] shadow-md shadow-[#F5BF45]/10'
                  : isDone
                  ? 'bg-[#0B121B]/80 border-[#253342] hover:border-[#F5BF45]/40 opacity-90'
                  : 'bg-[#0B121B]/40 border-[#253342]/60 hover:border-[#253342] opacity-70'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#F5BF45] text-[#05080D] shadow-sm'
                    : isDone
                    ? 'bg-[#253342] text-[#F5BF45]'
                    : 'bg-[#101A26] text-[#A8B3C2] border border-[#253342]'
                }`}
              >
                {p.step}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isActive ? 'text-[#F5BF45]' : 'text-white'}`}>
                  {p.title}
                </div>
                <div className="text-[11px] text-[#A8B3C2] truncate">
                  {p.duration}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Content Split: Left Phase Modules + Right Progress/Resources ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">

        {/* ── Left Column: Phase Modules (8/12 on lg) ─────────────────────────── */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0B121B] border border-[#253342] p-4 md:p-5 shadow-xl flex flex-col gap-4">

          {/* Phase Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#253342]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F5BF45]/20 text-[#F5BF45] flex items-center justify-center text-sm font-bold">
                ✜
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">
                  Phase {currentPhase.step}: {currentPhase.title}
                </h3>
                <p className="text-[11px] text-[#A8B3C2]">
                  Build a strong foundation in programming, mathematics, and essential tools.
                </p>
              </div>
            </div>

            {/* Progress Pill & Duration */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#A8B3C2] text-[11px]">
                <Clock size={12} className="text-[#F5BF45]" /> {currentPhase.duration}
              </span>
              <span className="text-[#A8B3C2] text-[11px]">4/6 Completed</span>
              <div className="w-20 bg-[#101A26] rounded-full h-2 overflow-hidden border border-[#253342]">
                <div className="bg-emerald-400 h-full rounded-full w-[66%]" />
              </div>
              <span className="text-emerald-400 font-bold text-xs">66%</span>
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-2.5">
            {modules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => toggleModuleStatus(mod.id)}
                className="p-3.5 rounded-xl bg-[#101A26]/80 hover:bg-[#101A26] border border-[#253342] hover:border-[#F5BF45]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Module Left Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#0B121B] border border-[#253342] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {mod.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-[#F5BF45] transition-colors">
                      {mod.title}
                    </div>
                    <div className="text-[11px] text-[#A8B3C2] truncate">
                      {mod.desc}
                    </div>
                  </div>
                </div>

                {/* Module Right Details & Status Badge */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right text-[11px] hidden sm:block">
                    <div className="font-semibold text-white">{mod.duration}</div>
                    <div className="text-[#A8B3C2]">{mod.type}</div>
                  </div>

                  {/* Status Button / Pill */}
                  {mod.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Check size={12} />
                      <span>Completed</span>
                    </span>
                  )}
                  {mod.status === 'in_progress' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span>In Progress</span>
                    </span>
                  )}
                  {mod.status === 'action' && (
                    <button
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] shadow-md shadow-[#F5BF45]/20 transition-all"
                    >
                      Start Learning
                    </button>
                  )}
                  {mod.status === 'not_started' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#A8B3C2] border border-[#253342]">
                      <span className="w-2 h-2 rounded-full border border-[#A8B3C2]" />
                      <span>Not Started</span>
                    </span>
                  )}

                  <ChevronRight size={15} className="text-[#A8B3C2] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column: Learning Progress, Resources & Consistency (4/12) ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Card 1: Your Learning Progress */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Trophy size={15} className="text-[#F5BF45]" />
                <span>Your Learning Progress</span>
              </div>
              <button
                onClick={() => toast('Progress breakdown: 12 modules completed, 8 in progress')}
                className="text-[11px] font-semibold text-[#F5BF45] hover:underline"
              >
                View Details
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Circular Progress Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#101A26]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#2DD4A0]"
                    strokeDasharray="40, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-xl font-black text-white">40%</div>
                  <div className="text-[8px] text-[#A8B3C2] uppercase">Overall</div>
                </div>
              </div>

              {/* Progress Legend */}
              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#A8B3C2]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed
                  </span>
                  <span className="font-bold text-white">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#A8B3C2]">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> In Progress
                  </span>
                  <span className="font-bold text-white">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#A8B3C2]">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> Not Started
                  </span>
                  <span className="font-bold text-white">10</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#253342]">
                  <span className="flex items-center gap-1.5 text-[#A8B3C2]">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Total Modules
                  </span>
                  <span className="font-bold text-white">30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Learning Resources (4 colored tiles) */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <BookOpen size={15} className="text-[#F5BF45]" />
                <span>Learning Resources</span>
              </div>
              <button
                onClick={() => toast('Displaying 250+ full-stack resources')}
                className="text-[11px] font-semibold text-[#F5BF45] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#101A26] border border-[#253342] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <Play size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">Video Lectures</div>
                  <div className="text-[10px] text-[#A8B3C2]">200+ hours</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#101A26] border border-[#253342] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Code2 size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">Practice</div>
                  <div className="text-[10px] text-[#A8B3C2]">100+ problems</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#101A26] border border-[#253342] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">Notes & PDFs</div>
                  <div className="text-[10px] text-[#A8B3C2]">50+ resources</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#101A26] border border-[#253342] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <FolderKanban size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">Real Projects</div>
                  <div className="text-[10px] text-[#A8B3C2]">20+ projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Recommended Next Steps */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Lightbulb size={15} className="text-[#F5BF45]" />
                <span>Recommended Next Steps</span>
              </div>
              <button
                onClick={() => toast('All recommendations calibrated to your resume skills')}
                className="text-[11px] font-semibold text-[#F5BF45] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-[#A8B3C2]">
              <div className="p-2 rounded-lg bg-[#101A26] hover:bg-[#162232] border border-[#253342] flex items-center justify-between cursor-pointer transition-all">
                <span>Complete Pandas module to unlock ML path</span>
                <ChevronRight size={13} className="text-[#F5BF45]" />
              </div>
              <div className="p-2 rounded-lg bg-[#101A26] hover:bg-[#162232] border border-[#253342] flex items-center justify-between cursor-pointer transition-all">
                <span>Build a project using real dataset</span>
                <ChevronRight size={13} className="text-[#F5BF45]" />
              </div>
              <div className="p-2 rounded-lg bg-[#101A26] hover:bg-[#162232] border border-[#253342] flex items-center justify-between cursor-pointer transition-all">
                <span>Take a mock interview for Data Analyst role</span>
                <ChevronRight size={13} className="text-[#F5BF45]" />
              </div>
              <div className="p-2 rounded-lg bg-[#101A26] hover:bg-[#162232] border border-[#253342] flex items-center justify-between cursor-pointer transition-all">
                <span>Update your LinkedIn profile with new skills</span>
                <ChevronRight size={13} className="text-[#F5BF45]" />
              </div>
            </div>
          </div>

          {/* Card 4: Stay Consistent! Mountain Sunrise Graphic */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121B27] to-[#0B121B] border border-[#253342] relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
              <Trophy size={16} className="text-[#F5BF45]" />
              <span>Stay Consistent!</span>
            </div>
            <p className="text-[11px] text-[#A8B3C2] mb-3">
              Small steps every day lead to big results.
            </p>

            {/* Rising gold bar chart graphic against sunrise */}
            <div className="h-12 flex items-end justify-between px-2 pt-2 bg-[#05080D]/70 rounded-xl border border-[#253342]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 rounded-t bg-gradient-to-t from-[#D99B22] to-[#F5BF45]"
                  style={{ height: `${(i + 1) * 3.5 + 4}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
