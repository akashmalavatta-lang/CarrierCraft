import React, { useState, useEffect } from 'react';
import { linkedinAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Sparkles, Copy, Check, ExternalLink, Edit3, Eye, MoreHorizontal,
  MapPin, Link as LinkIcon, Camera, CheckCircle2, GraduationCap,
  TrendingUp, Search, Users, UserPlus, Target, FileText,
  FolderGit2, Trophy, Settings, Plus, X, ChevronDown, CheckCircle
} from 'lucide-react';
import { LinkedInIcon } from '../components/common/Icons';

function GithubIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}


export default function LinkedInPage() {
  const { user } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('Profile Overview');

  // Profile data (defaulted from screenshot reference or authenticated user)
  const [profile, setProfile] = useState({
    name: user?.name || 'Akash Malavatta',
    role: 'B.Tech AI & Data Science Student | Python | Data Analysis | Building Projects | Open to Opportunities',
    college: 'University Visvesvaraya College of Engineering',
    github: 'github.com/akash-m',
    location: 'Bengaluru, Karnataka, India',
    linkedinUrl: 'www.linkedin.com/in/akash-malavatta',
    targetRole: user?.target_role || 'AI / Data Science Engineer',
    aboutCurrent: 'I am a B.Tech AI & Data Science student at University Visvesvaraya College of Engineering, passionate about solving real-world problems using data and artificial intelligence. I have hands-on experience in Python, machine learning, data analysis, and building practical projects. I am eager to learn, collaborate, and contribute to innovative solutions.',
    aboutAi: 'Aspiring AI & Data Science Engineer at UVCE with proven hands-on expertise in Python, predictive modeling, and scalable data analytics. Experienced in developing real-world machine learning pipelines and end-to-end applications. Passionate about solving high-impact engineering challenges and open to engineering internships or junior data scientist roles.',
    selectedHeadlineIdx: 0,
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'React', 'Git']
  });

  // UI state
  const [aboutTab, setAboutTab] = useState('ai'); // 'current' | 'ai'
  const [copiedKey, setCopiedKey] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [analyzing, setAnalyzing] = useState(false);
  const [apiResult, setApiResult] = useState(null);

  // Suggested Headlines
  const headlineSuggestions = [
    {
      id: 0,
      text: 'AI & Data Science Student | Python | Machine Learning | Building Real-world Projects | Open to Opportunities',
      badge: 'High Impact'
    },
    {
      id: 1,
      text: 'Aspiring Data Scientist | B.Tech AI & DS | Python | Data Analysis | Problem Solver',
      badge: 'Recruiter SEO'
    },
    {
      id: 2,
      text: 'Student Developer | AI/ML | Data Analysis | Creating Impact Through Technology',
      badge: 'Growth Focus'
    }
  ];

  // Recommended skills list with state tracking
  const [recommendedSkills, setRecommendedSkills] = useState([
    { name: 'Python', demand: 'High Demand', demandColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', added: true },
    { name: 'Machine Learning', demand: 'High Demand', demandColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', added: true },
    { name: 'Data Analysis', demand: 'High Demand', demandColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', added: true },
    { name: 'SQL', demand: 'Medium', demandColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30', added: true },
    { name: 'Power BI', demand: 'Medium', demandColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30', added: false },
    { name: 'Deep Learning', demand: 'Medium', demandColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30', added: false },
  ]);

  // Breakdown metrics
  const categoryBreakdown = [
    { label: 'Profile Photo', score: 90, color: '#2DD4A0' },
    { label: 'Headline', score: 80, color: '#2DD4A0' },
    { label: 'About Section', score: 75, color: '#F5BF45' },
    { label: 'Experience', score: 85, color: '#2DD4A0' },
    { label: 'Skills', score: 70, color: '#F5BF45' },
    { label: 'Projects', score: 78, color: '#2DD4A0' },
    { label: 'Achievements', score: 60, color: '#EF4444' },
    { label: 'Networking', score: 90, color: '#2DD4A0' },
  ];

  // Copy helper
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run backend LinkedIn analysis
  const runLiveAudit = async () => {
    try {
      setAnalyzing(true);
      const res = await linkedinAPI.analyze({
        target_role: profile.targetRole,
        headline: profile.role,
        summary: aboutTab === 'ai' ? profile.aboutAi : profile.aboutCurrent,
        skills: profile.skills,
        experience: [{ title: 'AI & Data Science Projects', description: 'Built machine learning pipelines and deep learning web applications.' }]
      });
      setApiResult(res.data);
      toast.success('Live profile audit synced with AI engine!');
    } catch (err) {
      console.warn('Backend sync note:', err.message);
      // gracefully keep default UI active
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUseHeadline = (idx, text) => {
    setProfile(prev => ({
      ...prev,
      selectedHeadlineIdx: idx,
      role: text
    }));
    toast.success('Headline applied to profile preview!');
  };

  const handleApplyAbout = () => {
    const textToApply = aboutTab === 'ai' ? profile.aboutAi : profile.aboutCurrent;
    setProfile(prev => ({ ...prev, aboutCurrent: textToApply }));
    toast.success('Optimized About section applied to profile!');
  };

  const toggleSkill = (skillName) => {
    setRecommendedSkills(prev => prev.map(s => {
      if (s.name === skillName) {
        const nextState = !s.added;
        if (nextState) {
          toast.success(`Added ${skillName} to profile skills!`);
          setProfile(p => ({ ...p, skills: [...new Set([...p.skills, skillName])] }));
        } else {
          toast.success(`Removed ${skillName} from profile skills.`);
          setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== skillName) }));
        }
        return { ...s, added: nextState };
      }
      return s;
    }));
  };

  const tabs = [
    { name: 'Profile Overview', icon: Target },
    { name: 'AI Suggestions', icon: Sparkles },
    { name: 'Headline & Bio', icon: FileText },
    { name: 'Experience', icon: FolderGit2 },
    { name: 'Skills', icon: Settings },
    { name: 'Projects', icon: FolderGit2 },
    { name: 'Achievements', icon: Trophy },
    { name: 'About', icon: Sparkles }
  ];

  return (
    <div className="page-container max-w-[1440px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              in
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>LinkedIn Optimizer</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F5BF45]/15 text-[#F5BF45] border border-[#F5BF45]/30">
                Beta
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Optimize your LinkedIn profile to get noticed by recruiters and unlock better career opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runLiveAudit}
            disabled={analyzing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101A26] hover:bg-[#152232] text-slate-200 border border-[#253342] flex items-center gap-2 transition"
          >
            <Sparkles size={14} className={analyzing ? 'animate-spin text-[#F5BF45]' : 'text-[#F5BF45]'} />
            <span>{analyzing ? 'Analyzing...' : 'Refresh AI Audit'}</span>
          </button>
          <a
            href={`https://${profile.linkedinUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B121B] hover:bg-[#101A26] text-white border border-[#253342] flex items-center gap-2 transition shadow-sm"
          >
            <span>View Public Profile</span>
            <ExternalLink size={13} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* Navigation Tabs Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 border-b border-[#152232]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#F5BF45] text-[#05080D] shadow-md shadow-[#F5BF45]/20 font-bold'
                  : 'bg-[#0B121B] text-slate-400 hover:text-white hover:bg-[#101A26] border border-[#152232]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#05080D]' : 'text-slate-400'} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Row 1: Profile Preview Card + Profile Strength Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: LinkedIn Profile Card (approx 7 cols) */}
        <div className="lg:col-span-7 bg-[#0B121B] border border-[#152232] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            {/* Banner with dark city lights and golden quote */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
              <img
                src="/images/linkedin_cover.jpg"
                alt="LinkedIn Banner"
                className="w-full h-full object-cover object-center brightness-75 contrast-125"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B121B] via-transparent to-black/40" />

              {/* Watermark Quote */}
              <div className="absolute right-6 top-8 text-right max-w-xs pointer-events-none">
                <span className="text-[#F5BF45] font-serif italic text-base sm:text-lg drop-shadow-md font-medium tracking-wide">
                  Building Skills for a Better Tomorrow
                </span>
              </div>

              {/* Edit Cover button */}
              <button
                onClick={() => toast('Cover customization: Upload custom banner in settings.', { icon: '📷' })}
                className="absolute top-4 right-4 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-slate-200 text-[11px] font-medium border border-white/10 flex items-center gap-1.5 transition"
              >
                <Camera size={13} />
                <span>Edit Cover</span>
              </button>

              {/* LinkedIn Blue Tag in Top Left */}
              <div className="absolute top-4 left-4 w-7 h-7 rounded-md bg-[#0A66C2] flex items-center justify-center text-white font-bold text-sm shadow">
                in
              </div>
            </div>

            {/* Profile Content Details */}
            <div className="px-6 pb-6 pt-0 relative">
              {/* Profile Avatar */}
              <div className="relative -mt-16 sm:-mt-20 mb-3 inline-block">
                <img
                  src="/images/akash_avatar.jpg"
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#0B121B] shadow-2xl bg-slate-800"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
                  }}
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-1.5 rounded-full bg-[#101A26] border border-[#253342] text-slate-300 hover:text-white shadow"
                  title="Edit Avatar"
                >
                  <Edit3 size={13} />
                </button>
              </div>

              {/* Name and Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {profile.name}
                    </h2>
                    <CheckCircle2 size={18} className="text-[#0A66C2] fill-[#0A66C2] text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed max-w-xl">
                    {profile.role}
                  </p>

                  {/* Location & Contact */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-2.5">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-500" />
                      <span>{profile.location}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => toast('Contact Info: akash@careercraft.io | Bengaluru', { icon: '📬' })}
                      className="text-[#38BDF8] hover:underline"
                    >
                      Contact info
                    </button>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <LinkIcon size={12} className="text-slate-500" />
                      <span>{profile.linkedinUrl}</span>
                    </span>
                  </div>
                </div>

                {/* College & GitHub Badges */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="p-2 rounded-xl bg-[#080D14] border border-[#152232] flex items-center gap-2.5 min-w-[210px]">
                    <div className="w-8 h-8 rounded-lg bg-[#101A26] border border-[#253342] flex items-center justify-center text-[#F5BF45]">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {profile.college}
                      </div>
                      <div className="text-[10px] text-slate-400">B.Tech Engineering</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#080D14] border border-[#152232] flex items-center gap-2.5 min-w-[210px]">
                    <div className="w-8 h-8 rounded-lg bg-[#101A26] border border-[#253342] flex items-center justify-center text-slate-200">
                      <GithubIcon size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight">
                        GitHub Profile
                      </div>
                      <div className="text-[10px] text-slate-400">{profile.github}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#152232]">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0A66C2] hover:bg-[#004182] text-white flex items-center gap-2 transition shadow-sm"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#101A26] hover:bg-[#152232] text-slate-200 border border-[#253342] flex items-center gap-2 transition"
                >
                  <Eye size={14} />
                  <span>Preview Profile</span>
                </button>
                <button
                  onClick={() => copyToClipboard(`https://${profile.linkedinUrl}`, 'share')}
                  className="p-2 rounded-xl bg-[#101A26] hover:bg-[#152232] text-slate-300 border border-[#253342] transition"
                  title="More actions"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Profile Strength Score (approx 5 cols) */}
        <div className="lg:col-span-5 bg-[#0B121B] border border-[#152232] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#F5BF45]" />
                <h3 className="font-extrabold text-base text-white">Profile Strength Score</h3>
              </div>
              <button
                onClick={() => setIsSuggestionsModalOpen(true)}
                className="text-xs text-[#F5BF45] hover:underline font-semibold"
              >
                View All Suggestions
              </button>
            </div>

            {/* Circular Gauge and Evaluation */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-[#080D14] border border-[#152232] mb-6">
              {/* Circular Meter SVG */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    className="text-[#152232]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Foreground arc (82%) */}
                  <path
                    className="text-[#2DD4A0]"
                    strokeDasharray="82, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white leading-none">82</span>
                  <span className="text-[10px] text-slate-400 font-bold">/100</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-[#2DD4A0] flex items-center gap-1.5">
                  <CheckCircle size={15} />
                  <span>Good Profile</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  You're on the right track! Follow the suggestions to make your profile stronger.
                </p>
                <button
                  onClick={() => setIsSuggestionsModalOpen(true)}
                  className="mt-2.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#F5BF45]/10 text-[#F5BF45] border border-[#F5BF45]/30 hover:bg-[#F5BF45]/20 transition"
                >
                  View All Suggestions
                </button>
              </div>
            </div>

            {/* 8 Category Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}</span>
                    </span>
                    <span className="font-bold text-white text-[11px]">{item.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#101A26] rounded-full overflow-hidden border border-[#152232]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.score}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Key Improvements (4 Action Cards) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#F5BF45]">💡</span>
          <h3 className="font-bold text-base text-white">Key Improvements</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Headline */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#152232] shadow-sm hover:border-[#253342] transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <Target size={18} />
              </div>
              <h4 className="font-bold text-sm text-white">Improve Headline</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Include your key skills and target role.
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('headline-suggestions-box');
                el?.scrollIntoView({ behavior: 'smooth' });
                toast.success('Generated top 3 high-impact headlines!');
              }}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] transition shadow-sm"
            >
              Optimize with AI
            </button>
          </div>

          {/* Card 2: About */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#152232] shadow-sm hover:border-[#253342] transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
                <FileText size={18} />
              </div>
              <h4 className="font-bold text-sm text-white">Enhance About Section</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Add your career goals, interests and key skills.
              </p>
            </div>
            <button
              onClick={() => {
                setAboutTab('ai');
                const el = document.getElementById('about-optimizer-box');
                el?.scrollIntoView({ behavior: 'smooth' });
                toast.success('Loaded AI-optimized About summary!');
              }}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] transition shadow-sm"
            >
              Get AI Suggestions
            </button>
          </div>

          {/* Card 3: Projects */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#152232] shadow-sm hover:border-[#253342] transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                <FolderGit2 size={18} />
              </div>
              <h4 className="font-bold text-sm text-white">Add Projects</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Showcase 2-3 real-world projects with metrics.
              </p>
            </div>
            <button
              onClick={() => toast('Projects Section: Connect CareerCraft Project Builder to showcase code repositories.', { icon: '🚀' })}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] transition shadow-sm"
            >
              Generate Section
            </button>
          </div>

          {/* Card 4: Achievements */}
          <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#152232] shadow-sm hover:border-[#253342] transition flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#F5BF45] mb-3">
                <Trophy size={18} />
              </div>
              <h4 className="font-bold text-sm text-white">Add Achievements</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Include certifications, hackathons or awards.
              </p>
            </div>
            <button
              onClick={() => toast('Achievements: Add AWS / Coursera certificates or hackathon wins to boost visibility.', { icon: '🏆' })}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] transition shadow-sm"
            >
              View Examples
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Headline Suggestions + About Optimizer + Views & Skills (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Headline Suggestions (approx 4 cols) */}
        <div id="headline-suggestions-box" className="lg:col-span-4 bg-[#0B121B] border border-[#152232] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LinkedInIcon size={16} className="text-[#0A66C2]" />
                <h3 className="font-bold text-sm text-white">Headline Suggestions</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-[#101A26] px-2 py-0.5 rounded border border-[#253342]">
                3/5
              </span>
            </div>

            {/* Current Headline */}
            <div className="p-3 rounded-xl bg-[#080D14] border border-[#152232] mb-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Current Headline</span>
                <Edit3 size={12} className="cursor-pointer text-slate-400 hover:text-white" onClick={() => setIsEditModalOpen(true)} />
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {profile.role}
              </p>
            </div>

            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              AI Suggested Headlines
            </div>

            {/* List of 3 Suggestions */}
            <div className="space-y-3">
              {headlineSuggestions.map((item) => {
                const isSelected = profile.selectedHeadlineIdx === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleUseHeadline(item.id, item.text)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F5BF45]/5 border-[#F5BF45]/40 shadow-sm'
                        : 'bg-[#080D14] border-[#152232] hover:border-[#253342]'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#F5BF45] bg-[#F5BF45]' : 'border-slate-500'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#05080D]" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseHeadline(item.id, item.text);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#F5BF45] text-[#05080D]'
                          : 'bg-[#101A26] text-slate-300 hover:text-white border border-[#253342]'
                      }`}
                    >
                      Use
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 2: About Section Optimizer (approx 5 cols) */}
        <div id="about-optimizer-box" className="lg:col-span-5 bg-[#0B121B] border border-[#152232] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#F5BF45]" />
                <h3 className="font-bold text-sm text-white">About Section Optimizer</h3>
              </div>
              <button
                onClick={() => copyToClipboard(aboutTab === 'ai' ? profile.aboutAi : profile.aboutCurrent, 'about')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1 rounded bg-[#101A26] border border-[#253342]"
                title="Copy to clipboard"
              >
                {copiedKey === 'about' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Tabs: Current vs AI Optimized */}
            <div className="flex rounded-xl bg-[#080D14] p-1 border border-[#152232] mb-3">
              <button
                onClick={() => setAboutTab('current')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  aboutTab === 'current'
                    ? 'bg-[#101A26] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setAboutTab('ai')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  aboutTab === 'ai'
                    ? 'bg-[#F5BF45] text-[#05080D] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={12} />
                <span>AI Optimized</span>
              </button>
            </div>

            {/* Text Preview */}
            <div className="p-3.5 rounded-xl bg-[#080D14] border border-[#152232] text-xs text-slate-300 leading-relaxed min-h-[160px] max-h-[220px] overflow-y-auto">
              {aboutTab === 'ai' ? profile.aboutAi : profile.aboutCurrent}
            </div>
          </div>

          <button
            onClick={handleApplyAbout}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] transition shadow-md shadow-[#F5BF45]/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} />
            <span>Apply to Profile</span>
          </button>
        </div>

        {/* Col 3: Views Analytics + Skill Recommendations (approx 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Views Card */}
          <div className="bg-[#0B121B] border border-[#152232] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Eye size={14} className="text-[#F5BF45]" />
                <span>Profile Views</span>
              </div>
              <div className="relative inline-block text-[11px] text-slate-400 bg-[#080D14] px-2 py-0.5 rounded border border-[#152232]">
                <span>{timeRange}</span>
              </div>
            </div>

            {/* Large Count with mini bar-chart */}
            <div className="flex items-end justify-between my-2">
              <div>
                <div className="text-2xl font-black text-white leading-none">245</div>
                <div className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp size={12} />
                  <span>42%</span>
                </div>
              </div>

              {/* Gold vertical bars micro-chart */}
              <div className="flex items-end gap-1 h-8">
                {[30, 45, 60, 40, 75, 90, 100].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-t bg-[#F5BF45]"
                    style={{ height: `${h}%`, opacity: 0.4 + (i * 0.1) }}
                  />
                ))}
              </div>
            </div>

            {/* 3 Metrics breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#152232] text-center">
              <div>
                <div className="text-[10px] text-slate-400">Recruiter Searches</div>
                <div className="text-xs font-extrabold text-white mt-0.5">18</div>
                <div className="text-[9px] text-emerald-400 font-semibold">↑ 50%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Interactions</div>
                <div className="text-xs font-extrabold text-white mt-0.5">62</div>
                <div className="text-[9px] text-emerald-400 font-semibold">↑ 36%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Connections</div>
                <div className="text-xs font-extrabold text-white mt-0.5">12</div>
                <div className="text-[9px] text-emerald-400 font-semibold">↑ 20%</div>
              </div>
            </div>
          </div>

          {/* Skill Recommendations Card */}
          <div className="bg-[#0B121B] border border-[#152232] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Settings size={14} className="text-[#F5BF45]" />
                <span>Skill Recommendations</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[11px] font-bold text-[#F5BF45] hover:underline"
              >
                + Add Skills
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {recommendedSkills.map((sk) => (
                <div
                  key={sk.name}
                  className="p-2 rounded-xl bg-[#080D14] border border-[#152232] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-medium text-slate-200 truncate">{sk.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${sk.demandColor}`}>
                      {sk.demand}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSkill(sk.name)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex-shrink-0 ${
                      sk.added
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#101A26] hover:bg-[#152232] text-slate-300 border border-[#253342]'
                    }`}
                  >
                    {sk.added ? 'Added ✓' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B121B] border border-[#253342] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#101A26]"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Edit3 size={18} className="text-[#F5BF45]" />
              <span>Edit Profile Details</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D14] border border-[#152232] text-white text-xs focus:border-[#F5BF45] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Headline</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D14] border border-[#152232] text-white text-xs focus:border-[#F5BF45] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">College / University</label>
                <input
                  type="text"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D14] border border-[#152232] text-white text-xs focus:border-[#F5BF45] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D14] border border-[#152232] text-white text-xs focus:border-[#F5BF45] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Current About Summary</label>
                <textarea
                  rows={4}
                  value={profile.aboutCurrent}
                  onChange={(e) => setProfile({ ...profile, aboutCurrent: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D14] border border-[#152232] text-white text-xs focus:border-[#F5BF45] outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#101A26] text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  toast.success('Profile changes saved successfully!');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F5BF45] text-[#05080D] hover:bg-[#D99B22]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Modal */}
      {isSuggestionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B121B] border border-[#253342] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsSuggestionsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#101A26]"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-[#F5BF45]" />
              <span>All Profile Recommendations</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Complete these optimizations to achieve a 95+ Recruiter Magnet Score.
            </p>

            <div className="space-y-3">
              {[
                { title: 'Headline Keyword Density', desc: 'Add 2 more in-demand frameworks (e.g. PyTorch, Docker) to increase recruiter search appearances by 28%.', priority: 'High', color: 'text-emerald-400 bg-emerald-500/10' },
                { title: 'Quantified Project Impact', desc: 'State accuracy metrics or speedups in your projects (e.g. "achieved 94.2% test accuracy on 50k samples").', priority: 'High', color: 'text-emerald-400 bg-emerald-500/10' },
                { title: 'Add Recommendations', desc: 'Request 2 recommendations from your college professors or project mentors to boost social proof.', priority: 'Medium', color: 'text-amber-400 bg-amber-500/10' },
                { title: 'LinkedIn Creator Mode', desc: 'Turn on Creator Mode to feature your open-source repositories and AI newsletter posts.', priority: 'Low', color: 'text-sky-400 bg-sky-500/10' },
              ].map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#080D14] border border-[#152232]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{rec.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rec.color}`}>{rec.priority} Priority</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsSuggestionsModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F5BF45] text-[#05080D]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Profile Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B121B] border border-[#253342] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#101A26]"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Eye size={18} className="text-[#38BDF8]" />
              <span>Public Profile Preview</span>
            </h3>

            <div className="rounded-xl border border-[#152232] bg-[#080D14] p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src="/images/akash_avatar.jpg"
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#F5BF45]"
                />
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{profile.name}</span>
                    <CheckCircle2 size={16} className="text-[#0A66C2]" />
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">{profile.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{profile.location} • {profile.college}</p>
                </div>
              </div>

              <div className="border-t border-[#152232] pt-3">
                <span className="text-xs font-bold text-[#F5BF45] uppercase tracking-wider block mb-1">About</span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {aboutTab === 'ai' ? profile.aboutAi : profile.aboutCurrent}
                </p>
              </div>

              <div className="border-t border-[#152232] pt-3">
                <span className="text-xs font-bold text-[#F5BF45] uppercase tracking-wider block mb-2">Featured Skills</span>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-[#101A26] border border-[#253342] text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F5BF45] text-[#05080D]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
