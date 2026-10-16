import { useState, useEffect, useMemo } from 'react';
import { roadmapAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Map, Sparkles, CheckCircle2, Clock, BookOpen, ExternalLink,
  ChevronRight, Award, Plus, FolderKanban, Check, Layers, Play,
  FileText, Code2, Trophy, TrendingUp, BarChart, RotateCcw, Target
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

export default function RoadmapPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Recommended');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Data Scientist');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'fresher');
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [completedItems, setCompletedItems] = useState({});

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await roadmapAPI.list();
      const list = res.data.roadmaps || [];
      setSavedRoadmaps(list);
      if (list.length > 0) {
        const first = list[0];
        const parsed = typeof first.roadmap_data === 'string'
          ? JSON.parse(first.roadmap_data)
          : first.roadmap_data;
        setActiveRoadmap(parsed);
      } else {
        handleGenerate(targetRole, experienceLevel);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load roadmap data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
    const saved = localStorage.getItem('cc_completed_milestones');
    if (saved) {
      try { setCompletedItems(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleGenerate = async (role = targetRole, exp = experienceLevel) => {
    try {
      setGenerating(true);
      const toastId = toast.loading('Formulating customized skill roadmap...');
      const res = await roadmapAPI.generate({
        target_role: role,
        experience_level: exp,
      });
      toast.dismiss(toastId);
      setActiveRoadmap(res.data.roadmap);
      toast.success('Career Roadmap ready! 🗺️');

      const listRes = await roadmapAPI.list();
      setSavedRoadmaps(listRes.data.roadmaps || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    let roleName = targetRole;
    if (cat === 'Data Science') roleName = 'Data Scientist';
    if (cat === 'Web Development') roleName = 'Full Stack Developer';
    if (cat === 'AI/ML') roleName = 'Machine Learning Engineer';
    if (cat === 'Cybersecurity') roleName = 'DevOps / Cloud Engineer';
    if (cat === 'App Development') roleName = 'Frontend Developer';
    setTargetRole(roleName);
    handleGenerate(roleName, experienceLevel);
  };

  const toggleMilestone = (key) => {
    setCompletedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('cc_completed_milestones', JSON.stringify(updated));
      return updated;
    });
  };

  const phases = activeRoadmap?.phases || [
    {
      phase_number: 1,
      phase_name: 'Foundations',
      duration_weeks: 3,
      description: 'Build a strong foundation in programming, mathematics, and essential tools.',
      skills: ['Python Basics', 'Linear Algebra & Statistics', 'SQL for Data Analysis', 'Data Cleaning with Pandas'],
      modules: [
        { title: 'Python Basics for Data Science', duration: '12 hours', type: 'Video + Practice', status: 'Completed' },
        { title: 'Mathematics for Data Science', duration: '8 hours', type: 'Video + Notes', status: 'Completed' },
        { title: 'SQL for Data Analysis', duration: '10 hours', type: 'Video + Practice', status: 'In Progress' },
        { title: 'Data Analysis with Pandas', duration: '8 hours', type: 'Video + Practice', status: 'Start Learning' },
        { title: 'Data Visualization with Matplotlib & Seaborn', duration: '6 hours', type: 'Video + Practice', status: 'Not Started' },
        { title: 'Mini Project: Analyze Real World Dataset', duration: '5 hours', type: 'Project + Submission', status: 'Not Started' },
      ]
    },
    {
      phase_number: 2,
      phase_name: 'Data Analysis',
      duration_weeks: 4,
      description: 'Master exploratory data analysis, hypothesis testing, and interactive reporting dashboards.',
      skills: ['Exploratory Data Analysis', 'Statistical Inference', 'Power BI & Tableau', 'Data Storytelling'],
      modules: [
        { title: 'Exploratory Data Analysis Mastery', duration: '10 hours', type: 'Video + Lab', status: 'Not Started' },
        { title: 'Hypothesis Testing & A/B Testing', duration: '8 hours', type: 'Video + Quizzes', status: 'Not Started' },
        { title: 'Interactive Dashboards with Power BI', duration: '12 hours', type: 'Project', status: 'Not Started' }
      ]
    },
    {
      phase_number: 3,
      phase_name: 'Machine Learning',
      duration_weeks: 5,
      description: 'Implement predictive models, scikit-learn pipelines, and evaluation metrics.',
      skills: ['Supervised Learning', 'Model Evaluation', 'Feature Engineering', 'Ensemble Methods'],
      modules: [
        { title: 'Supervised Learning Algorithms', duration: '14 hours', type: 'Video + Coding', status: 'Not Started' },
        { title: 'Feature Engineering & Cross Validation', duration: '9 hours', type: 'Lab', status: 'Not Started' }
      ]
    },
    {
      phase_number: 4,
      phase_name: 'Advanced Topics',
      duration_weeks: 4,
      description: 'Deep dive into neural networks, production deployment, and cloud pipelines.',
      skills: ['Deep Learning Basics', 'Model Deployment with FastAPI', 'MLOps Basics'],
      modules: [
        { title: 'Deep Learning & Neural Networks', duration: '15 hours', type: 'Video + Lab', status: 'Not Started' },
        { title: 'Deploying Models via REST APIs', duration: '8 hours', type: 'Project', status: 'Not Started' }
      ]
    },
    {
      phase_number: 5,
      phase_name: 'Projects & Portfolio',
      duration_weeks: 3,
      description: 'Ship complete capstone projects with documentation and presentation-ready repos.',
      skills: ['End-to-End Capstone', 'GitHub Portfolio', 'Interview Presentation'],
      modules: [
        { title: 'End-to-End ML Capstone Project', duration: '20 hours', type: 'Capstone', status: 'Not Started' }
      ]
    }
  ];

  const currentPhase = phases[selectedPhaseIdx] || phases[0];

  // Calculate progress stats
  const totalModules = 30;
  const completedCount = 12;
  const inProgressCount = 8;
  const notStartedCount = 10;
  const overallProgressPct = Math.round((completedCount / totalModules) * 100);

  return (
    <div className="page-container">
      {/* ── Top Header (Matching Image 5) ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#F5BF45]/15 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45]">
              <Map size={14} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Learning Roadmap
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A8B3C2]">
            Structured learning paths to help you build in-demand skills and achieve your career goals.
          </p>
        </div>
      </div>

      {/* ── Category Filter Pills (Matching Image 5) ──────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`py-2 px-4 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#F5BF45] text-[#05080D] shadow-[0_2px_12px_rgba(245,191,69,0.3)]'
                : 'bg-[#101A26] border border-[#253342] text-[#A8B3C2] hover:text-[#F5F7FA] hover:border-[#F5BF45]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Top Row: Learning Path Banner & Progress Card (Image 5) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left Column (8 Cols): Path Overview Banner */}
        <div className="lg:col-span-8 card p-6 md:p-8 bg-gradient-to-r from-[#080D14] via-[#0B121B] to-[#101A26] border border-[#253342] relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#F5F7FA]">
              {targetRole} Learning Path
            </h2>
            <p className="text-xs md:text-sm text-[#A8B3C2] max-w-lg leading-relaxed">
              Master in-demand skills step by step and become job ready. Curated by industry engineering standards.
            </p>

            {/* Quick Stats Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#A8B3C2] pt-1">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#F5BF45]" />
                <span>6 Months</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-[#F5BF45]" />
                <span>{phases.length} Learning Phases</span>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#F5BF45]" />
                <span>30+ Resources</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FolderKanban size={14} className="text-[#F5BF45]" />
                <span>Portfolio Projects</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  const el = document.getElementById('phase-details-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-primary text-xs font-bold py-2 px-5 flex items-center gap-1"
              >
                <span>Start Learning</span>
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => handleGenerate(targetRole, experienceLevel)}
                className="btn btn-secondary text-xs font-semibold py-2 px-4 border border-[#253342]"
                disabled={generating}
              >
                {generating ? 'Regenerating...' : 'Customize Path'}
              </button>
            </div>
          </div>

          {/* Career Outcome Tags */}
          <div className="pt-5 mt-4 border-t border-[#253342] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#A8B3C2] font-semibold text-[11px] flex items-center gap-1">
              <Award size={13} className="text-[#F5BF45]" />
              <span>Career Outcomes:</span>
            </span>
            {['Data Analyst', 'Data Scientist', 'ML Engineer', 'Business Analyst'].map((outcome) => (
              <span key={outcome} className="px-2.5 py-0.5 rounded bg-[#101A26] border border-[#253342] text-[11px] text-[#F5F7FA]">
                {outcome}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column (4 Cols): Your Learning Progress Doughnut Card */}
        <div className="lg:col-span-4 card p-6 bg-[#0B121B] border border-[#253342] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#F5F7FA]">Your Learning Progress</span>
            <button
              onClick={() => {
                const el = document.getElementById('phase-details-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[11px] text-[#F5BF45] hover:underline"
            >
              View Details
            </button>
          </div>

          {/* SVG Doughnut Ring in Center */}
          <div className="flex items-center justify-center my-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#253342]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2DD4A0]"
                  strokeDasharray={`${overallProgressPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-black text-[#F5F7FA]">{overallProgressPct}%</div>
                <div className="text-[9px] text-[#A8B3C2] uppercase font-bold">Overall</div>
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A8B3C2] pt-4 border-t border-[#253342]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2DD4A0]" />
                <span>Completed</span>
              </span>
              <span className="font-bold text-[#F5F7FA]">{completedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>In Progress</span>
              </span>
              <span className="font-bold text-[#F5F7FA]">{inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Not Started</span>
              </span>
              <span className="font-bold text-[#F5F7FA]">{notStartedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F5BF45]" />
                <span>Total</span>
              </span>
              <span className="font-bold text-[#F5F7FA]">{totalModules}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sequential Phase Progress Timeline (Matching Image 5) ─────────── */}
      <div className="card p-5 bg-[#0B121B] border border-[#253342] mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] relative">
          {/* Connecting line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#253342] -z-0" />

          {phases.map((phase, idx) => {
            const isSelected = selectedPhaseIdx === idx;
            const isCompleted = idx === 0;

            return (
              <div
                key={idx}
                onClick={() => setSelectedPhaseIdx(idx)}
                className="relative z-10 flex flex-col items-center text-center cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isSelected
                    ? 'bg-[#F5BF45] text-[#05080D] ring-4 ring-[#F5BF45]/20 shadow-[0_0_12px_rgba(245,191,69,0.5)]'
                    : isCompleted
                    ? 'bg-[#2DD4A0] text-[#05080D]'
                    : 'bg-[#101A26] border border-[#253342] text-[#A8B3C2] group-hover:border-[#F5BF45]/40'
                }`}>
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <div className={`text-xs font-bold mt-2 ${isSelected ? 'text-[#F5BF45]' : 'text-[#F5F7FA]'}`}>
                  {phase.phase_name}
                </div>
                <div className="text-[10px] text-[#A8B3C2]">
                  {phase.duration_weeks ? `${phase.duration_weeks} weeks` : '2-3 weeks'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Split Layout: Phase Detail Modules & Side Cards (Image 5) ── */}
      <div id="phase-details-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Phase Modules Checklist */}
        <div className="lg:col-span-8 card p-6 bg-[#0B121B] border border-[#253342] space-y-5">
          {/* Phase Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#253342]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F5BF45]/20 text-[#F5BF45] text-xs font-bold flex items-center justify-center">
                  {selectedPhaseIdx + 1}
                </span>
                <h3 className="text-base font-bold text-[#F5F7FA]">
                  Phase {selectedPhaseIdx + 1}: {currentPhase.phase_name}
                </h3>
              </div>
              <p className="text-xs text-[#A8B3C2] mt-1">
                {currentPhase.description || 'Build a strong foundation in core technical domains.'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#A8B3C2]">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-[#F5BF45]" />
                <span>{currentPhase.duration_weeks ? `${currentPhase.duration_weeks} weeks` : '2-3 weeks'}</span>
              </span>
              <span className="text-[#2DD4A0] font-bold">4/6 Completed</span>
            </div>
          </div>

          {/* Module Cards List */}
          <div className="space-y-3">
            {(currentPhase.modules || [
              { title: `${currentPhase.phase_name} Fundamentals`, duration: '12 hours', type: 'Video + Practice', status: 'Completed' },
              { title: 'Core Algorithmic Foundations', duration: '8 hours', type: 'Video + Notes', status: 'In Progress' },
              { title: 'Applied Practical Project', duration: '10 hours', type: 'Project + Lab', status: 'Start Learning' }
            ]).map((mod, idx) => {
              const modKey = `${currentPhase.phase_name}-${mod.title}`;
              const isChecked = completedItems[modKey] || mod.status === 'Completed';

              return (
                <div
                  key={idx}
                  onClick={() => toggleMilestone(modKey)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-[#101A26]/40 border-[#253342]'
                      : mod.status === 'In Progress'
                      ? 'bg-[#101A26] border-sky-500/30'
                      : 'bg-[#101A26] border-[#253342] hover:border-[#F5BF45]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isChecked
                        ? 'bg-[#2DD4A0]/15 text-[#2DD4A0]'
                        : mod.status === 'In Progress'
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-[#F5BF45]/15 text-[#F5BF45]'
                    }`}>
                      {isChecked ? <CheckCircle2 size={16} /> : <Code2 size={16} />}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isChecked ? 'line-through text-[#A8B3C2]' : 'text-[#F5F7FA]'}`}>
                        {mod.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#A8B3C2] mt-0.5">
                        <span>{mod.duration || '8 hours'}</span>
                        <span>•</span>
                        <span>{mod.type || 'Video + Practice'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Button / Indicator */}
                  <div className="flex-shrink-0">
                    {isChecked ? (
                      <span className="px-2.5 py-1 rounded bg-[#2DD4A0]/15 text-[#2DD4A0] text-[10px] font-bold border border-[#2DD4A0]/30 flex items-center gap-1">
                        <Check size={11} />
                        <span>Completed</span>
                      </span>
                    ) : mod.status === 'In Progress' ? (
                      <span className="px-2.5 py-1 rounded bg-sky-500/15 text-sky-400 text-[10px] font-bold border border-sky-500/30">
                        In Progress
                      </span>
                    ) : mod.status === 'Start Learning' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMilestone(modKey);
                        }}
                        className="btn btn-primary text-[10px] font-bold py-1 px-3"
                      >
                        Start Learning
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded bg-[#101A26] text-[#A8B3C2] text-[10px] border border-[#253342]">
                        Not Started
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 Cols): Side Insight Cards (Matching Image 5) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Learning Resources */}
          <div className="card p-5 bg-[#0B121B] border border-[#253342]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#F5F7FA]">Learning Resources</span>
              <span className="text-[10px] text-[#F5BF45] cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#101A26] border border-[#253342]">
                <div className="flex items-center gap-2">
                  <Play size={13} className="text-rose-400" />
                  <span className="text-[#F5F7FA]">Video Lectures</span>
                </div>
                <span className="text-[11px] font-bold text-[#A8B3C2]">200+ hours</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#101A26] border border-[#253342]">
                <div className="flex items-center gap-2">
                  <Code2 size={13} className="text-[#2DD4A0]" />
                  <span className="text-[#F5F7FA]">Practice Exercises</span>
                </div>
                <span className="text-[11px] font-bold text-[#A8B3C2]">100+ problems</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#101A26] border border-[#253342]">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-sky-400" />
                  <span className="text-[#F5F7FA]">Notes & PDFs</span>
                </div>
                <span className="text-[11px] font-bold text-[#A8B3C2]">50+ resources</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#101A26] border border-[#253342]">
                <div className="flex items-center gap-2">
                  <FolderKanban size={13} className="text-[#F5BF45]" />
                  <span className="text-[#F5F7FA]">Real World Projects</span>
                </div>
                <span className="text-[11px] font-bold text-[#A8B3C2]">20+ projects</span>
              </div>
            </div>
          </div>

          {/* Card 2: Recommended Next Steps */}
          <div className="card p-5 bg-[#0B121B] border border-[#253342]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#F5F7FA]">Recommended Next Steps</span>
              <span className="text-[10px] text-[#F5BF45] cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-2 text-xs text-[#A8B3C2]">
              <div className="flex items-start gap-2 p-2 rounded hover:bg-[#101A26] transition-colors cursor-pointer">
                <ChevronRight size={14} className="text-[#F5BF45] flex-shrink-0 mt-0.5" />
                <span className="text-[#F5F7FA]">Complete Pandas module to unlock ML path</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded hover:bg-[#101A26] transition-colors cursor-pointer">
                <ChevronRight size={14} className="text-[#F5BF45] flex-shrink-0 mt-0.5" />
                <span className="text-[#F5F7FA]">Build a project using real dataset</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded hover:bg-[#101A26] transition-colors cursor-pointer">
                <ChevronRight size={14} className="text-[#F5BF45] flex-shrink-0 mt-0.5" />
                <span className="text-[#F5F7FA]">Take a mock interview for Data Analyst role</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded hover:bg-[#101A26] transition-colors cursor-pointer">
                <ChevronRight size={14} className="text-[#F5BF45] flex-shrink-0 mt-0.5" />
                <span className="text-[#F5F7FA]">Update your LinkedIn profile with new skills</span>
              </div>
            </div>
          </div>

          {/* Card 3: Stay Consistent! */}
          <div className="card p-5 bg-gradient-to-br from-[#101A26] to-[#0B121B] border border-[#253342] text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#F5BF45]/20 text-[#F5BF45] flex items-center justify-center mx-auto mb-2 border border-[#F5BF45]/40 shadow-sm">
              <Trophy size={18} />
            </div>
            <h4 className="text-sm font-bold text-[#F5F7FA] mb-1">Stay Consistent!</h4>
            <p className="text-[11px] text-[#A8B3C2] leading-relaxed">
              Small steps every day lead to big results. You are in the top 15% of active learners this week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
