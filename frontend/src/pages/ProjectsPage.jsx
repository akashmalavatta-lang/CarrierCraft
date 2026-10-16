import { useState, useEffect, useMemo } from 'react';
import { projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FolderKanban, Sparkles, Clock, CheckCircle2, ChevronRight,
  Code2, ExternalLink, Award, Copy, Check, Filter, Layers, Target,
  Bookmark, BookmarkCheck, Search, RotateCcw, X, Cpu, Laptop, BookOpen,
  ArrowRight, ShieldCheck, Terminal, Compass
} from 'lucide-react';

const CATEGORIES = [
  'All Projects',
  'Data Science',
  'Web Development',
  'AI & ML',
  'Cybersecurity',
  'App Development',
  'IoT & Embedded'
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tech' | 'features' | 'outcomes'
  const [copiedKey, setCopiedKey] = useState(null);

  // AI Project Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRole, setAiRole] = useState(user?.target_role || 'Software Engineer');
  const [aiDifficulty, setAiDifficulty] = useState('intermediate');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [fullProjectModal, setFullProjectModal] = useState(null);

  // Initial load from backend
  const fetchProjects = async (category = selectedCategory) => {
    try {
      setLoading(true);
      // Map category to backend role target
      let roleParam = 'Software Engineer';
      if (category === 'Data Science' || category === 'AI & ML') roleParam = 'Data Scientist';
      if (category === 'Web Development') roleParam = 'Frontend Developer';
      if (category === 'Cybersecurity') roleParam = 'DevOps / Cloud Engineer';

      const res = await projectsAPI.recommend({
        target_role: roleParam,
        difficulty: difficultyFilter !== 'All' ? difficultyFilter.toLowerCase() : undefined,
      });

      const fetched = res.data.projects || [];
      setProjects(fetched);
      if (fetched.length > 0) {
        setSelectedProject(fetched[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load project catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(selectedCategory);
    // Load bookmarked projects from localStorage
    const saved = localStorage.getItem('cc_saved_projects');
    if (saved) {
      try { setSavedProjects(JSON.parse(saved)); } catch {}
    }
  }, [selectedCategory, difficultyFilter]);

  const toggleBookmark = (proj) => {
    const isBookmarked = savedProjects.some(p => p.title === proj.title);
    let updated;
    if (isBookmarked) {
      updated = savedProjects.filter(p => p.title !== proj.title);
      toast.success('Removed from bookmarks');
    } else {
      updated = [...savedProjects, proj];
      toast.success('Saved to project bookmarks!');
    }
    setSavedProjects(updated);
    localStorage.setItem('cc_saved_projects', JSON.stringify(updated));
  };

  const isBookmarked = (proj) => {
    if (!proj) return false;
    return savedProjects.some(p => p.title === proj.title);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All Projects');
    setSearchQuery('');
    setDifficultyFilter('All');
    setTechFilter('All');
    setDurationFilter('All');
  };

  const handleCopySpec = (proj) => {
    const text = `PROJECT SPECIFICATION: ${proj.title}
Difficulty: ${proj.difficulty} (~${proj.estimated_hours || 25} hours)
Technologies: ${proj.technologies?.join(', ')}

Description:
${proj.description}

Milestones:
${proj.milestones?.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Resume Impact:
${proj.impact || 'Demonstrates engineering maturity, production architecture, and problem-solving skills.'}`;

    navigator.clipboard.writeText(text);
    setCopiedKey(proj.title);
    toast.success('Project architecture copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateAiProject = async (e) => {
    e.preventDefault();
    try {
      setAiGenerating(true);
      const res = await projectsAPI.recommend({
        target_role: aiRole,
        difficulty: aiDifficulty,
      });
      const generated = res.data.projects || [];
      if (generated.length > 0) {
        setProjects(prev => [...generated, ...prev]);
        setSelectedProject(generated[0]);
        toast.success(`AI generated ${generated.length} tailored projects! ✨`);
        setShowAiModal(false);
      } else {
        toast.error('No custom project generated for these criteria');
      }
    } catch (err) {
      toast.error('Failed to generate AI project');
    } finally {
      setAiGenerating(false);
    }
  };

  // Client-side search and category filtering
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesTech = p.technologies?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTech) return false;
      }
      return true;
    });
  }, [projects, searchQuery]);

  const currentDisplayProject = selectedProject || filteredProjects[0] || null;

  return (
    <div className="page-container">
      {/* ── Top Header (Matching Image 2) ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#F5BF45]/15 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45]">
              <FolderKanban size={14} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight flex items-center gap-2">
              <span>Project Builder</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5BF45]/15 text-[#F5BF45] border border-[#F5BF45]/30">
                Beta
              </span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A8B3C2]">
            Build real-world projects, step by step. Gain practical skills, create a strong portfolio, and stand out to employers.
          </p>
        </div>
      </div>

      {/* ── Hero Banner (Matching Image 2) ────────────────────────────────── */}
      <div className="card p-6 md:p-8 mb-6 relative overflow-hidden bg-gradient-to-r from-[#080D14] via-[#0B121B] to-[#101A26] border border-[#253342]">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(245,191,69,0.07)_0%,transparent_70%)] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] leading-tight">
              Turn Your Ideas <br className="hidden sm:inline" />
              into <span className="text-[#F5BF45]">Real Projects</span>
            </h2>
            <p className="text-xs md:text-sm text-[#A8B3C2] max-w-lg leading-relaxed">
              Get project ideas, detailed guides, source code, project reports and deployment help. Designed to give you production architectural depth.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('project-grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-primary text-xs font-bold py-2.5 px-5 shadow-lg flex items-center gap-1.5"
              >
                <span>Explore Projects</span>
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setShowAiModal(true)}
                className="btn btn-secondary text-xs font-bold py-2.5 px-5 flex items-center gap-2 border border-[#F5BF45]/40 text-[#F5BF45]"
              >
                <Sparkles size={14} className="text-[#F5BF45]" />
                <span>Create with AI</span>
              </button>
            </div>
          </div>

          {/* Right Hero Column: Tech Stack Book Graphic & Metric Badges */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-end gap-4">
            {/* Tech Stack Book List Display */}
            <div className="w-full sm:w-48 bg-[#0B121B] border border-[#253342] rounded-xl p-3 space-y-1.5 shadow-xl text-center">
              {['Python', 'Machine Learning', 'Web Development', 'IoT & Embedded', 'Data Analysis'].map((tech, i) => (
                <div
                  key={tech}
                  className={`text-[11px] font-semibold py-1 px-2 rounded ${
                    i === 0
                      ? 'bg-[#F5BF45]/20 text-[#F5BF45] border border-[#F5BF45]/30'
                      : 'bg-[#101A26] text-[#A8B3C2]'
                  }`}
                >
                  {tech}
                </div>
              ))}
            </div>

            {/* Quick Metrics Badges */}
            <div className="space-y-2.5 w-full sm:w-auto">
              <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#F5BF45]/15 text-[#F5BF45] flex items-center justify-center font-bold text-xs">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="text-sm font-black text-[#F5F7FA]">12+</div>
                  <div className="text-[10px] text-[#A8B3C2]">Project Categories</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center font-bold text-xs">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="text-sm font-black text-[#F5F7FA]">100+</div>
                  <div className="text-[10px] text-[#A8B3C2]">Step by Step Guides</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs">
                  <Code2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-black text-[#F5F7FA]">Source Code</div>
                  <div className="text-[10px] text-[#A8B3C2]">Available Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills (Matching Image 2) ──────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
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

      {/* ── Search & Filter Controls (Matching Image 2) ───────────────────── */}
      <div className="card p-3.5 bg-[#0B121B] border border-[#253342] mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B3C2]" />
            <input
              type="text"
              className="w-full bg-[#101A26] border border-[#253342] rounded-md py-2 pl-9 pr-3 text-xs text-[#F5F7FA] placeholder-[#7E8D9F] focus:outline-none focus:border-[#F5BF45]"
              placeholder="Search projects by title, description, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
            >
              <option value="All">Difficulty: All</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
            >
              <option value="All">Technology: All</option>
              <option value="Python">Python</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="SQL">SQL</option>
              <option value="Docker">Docker</option>
            </select>

            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
            >
              <option value="All">Duration: All</option>
              <option value="1-2">1 - 2 weeks</option>
              <option value="2-3">2 - 3 weeks</option>
              <option value="3-4">3 - 4 weeks</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="p-2 rounded-md border border-[#253342] bg-[#101A26] text-[#A8B3C2] hover:text-[#F5F7FA] hover:border-[#F5BF45] transition-colors"
              title="Clear Filters"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Projects Grid & Featured Drawer (Image 2) ────────── */}
      <div id="project-grid-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Grid (7 Cols): Project Cards */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="card p-12 text-center">
              <div className="spinner spinner-md mx-auto mb-3" />
              <p className="text-xs text-[#A8B3C2]">Loading practical project architectures...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="card p-8 text-center text-[#A8B3C2]">
              <FolderKanban size={36} className="mx-auto mb-2 opacity-30 text-[#F5BF45]" />
              <h4 className="font-bold text-sm text-[#F5F7FA]">No projects found</h4>
              <p className="text-xs mt-1 mb-3">Try adjusting your search terms or clearing the filters.</p>
              <button onClick={handleClearFilters} className="btn btn-outline btn-sm text-xs">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProjects.map((proj, idx) => {
                const bookmarked = isBookmarked(proj);
                const isSelected = currentDisplayProject?.title === proj.title;

                const tagBadges = ['Featured', 'Trending', 'Popular'];
                const badgeText = tagBadges[idx % tagBadges.length];

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedProject(proj)}
                    className={`card p-4 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#F5BF45] bg-[#101A26] shadow-[0_0_15px_rgba(245,191,69,0.15)]'
                        : 'border-[#253342] bg-[#0B121B] hover:border-[#F5BF45]/50'
                    }`}
                  >
                    <div>
                      {/* Top Row: Badge & Bookmark */}
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          badgeText === 'Featured'
                            ? 'bg-[#F5BF45]/20 text-[#F5BF45] border border-[#F5BF45]/30'
                            : badgeText === 'Trending'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30'
                        }`}>
                          {badgeText}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(proj);
                          }}
                          className={`p-1 rounded transition-colors ${
                            bookmarked ? 'text-[#F5BF45]' : 'text-[#A8B3C2] hover:text-[#F5BF45]'
                          }`}
                          title={bookmarked ? 'Saved' : 'Save Project'}
                        >
                          {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-bold text-sm text-[#F5F7FA] mb-1.5 leading-snug">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-[#A8B3C2] leading-relaxed mb-3 line-clamp-2">
                        {proj.description}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(proj.technologies || ['Python', 'SQL', 'Flask']).slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-[#101A26] border border-[#253342] text-[#A8B3C2]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Duration & Difficulty */}
                    <div className="pt-3 border-t border-[#253342] flex items-center justify-between text-[11px] text-[#A8B3C2]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[#F5BF45]" />
                        <span>{proj.estimated_hours ? `${Math.round(proj.estimated_hours / 10)} weeks` : '2-3 weeks'}</span>
                      </span>
                      <span className="flex items-center gap-1 capitalize font-medium text-[#F5F7FA]">
                        <Compass size={12} className="text-[#2DD4A0]" />
                        <span>{proj.difficulty || 'Intermediate'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Drawer (5 Cols): Selected Project Detail View (Matching Image 2) */}
        <div className="lg:col-span-5">
          {currentDisplayProject ? (
            <div className="card p-6 bg-[#0B121B] border border-[#253342] sticky top-24 space-y-5">
              {/* Header Badge */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5BF45]/20 text-[#F5BF45] border border-[#F5BF45]/30">
                  Featured Project
                </span>
                <button
                  onClick={() => toggleBookmark(currentDisplayProject)}
                  className={`p-1.5 rounded transition-colors ${
                    isBookmarked(currentDisplayProject) ? 'text-[#F5BF45]' : 'text-[#A8B3C2] hover:text-[#F5BF45]'
                  }`}
                  title="Bookmark"
                >
                  {isBookmarked(currentDisplayProject) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>

              {/* Title & Short Summary */}
              <div>
                <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">
                  {currentDisplayProject.title}
                </h3>
                <p className="text-xs text-[#A8B3C2] leading-relaxed">
                  {currentDisplayProject.description}
                </p>
              </div>

              {/* Simulated UI Mockup Preview Frame */}
              <div className="p-4 rounded-lg bg-[#101A26] border border-[#253342] text-center relative overflow-hidden">
                <div className="text-[11px] font-mono text-[#F5BF45] mb-1">
                  &gt; git clone {currentDisplayProject.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.git
                </div>
                <div className="text-[10px] text-[#A8B3C2]">
                  Architecture diagram & source specification ready
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#253342] text-xs">
                {['overview', 'tech', 'features', 'outcomes'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-2 px-2.5 font-semibold capitalize transition-colors relative ${
                      activeTab === t ? 'text-[#F5BF45]' : 'text-[#A8B3C2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {t === 'tech' ? 'Tech Stack' : t}
                    {activeTab === t && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BF45]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-[#A8B3C2] leading-relaxed">
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <p>{currentDisplayProject.description}</p>
                    {currentDisplayProject.impact && (
                      <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342]">
                        <span className="font-bold text-[#F5F7FA] block mb-1">Resume Impact:</span>
                        <span>{currentDisplayProject.impact}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tech' && (
                  <div className="space-y-3">
                    <span className="font-bold text-[#F5F7FA] block">Technologies Used:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentDisplayProject.technologies?.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-[#101A26] border border-[#253342] text-[#F5F7FA]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-2">
                    <span className="font-bold text-[#F5F7FA] block mb-1">Implementation Steps:</span>
                    {currentDisplayProject.milestones?.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-[#2DD4A0] flex-shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'outcomes' && (
                  <div className="space-y-2">
                    <span className="font-bold text-[#F5F7FA] block mb-1">Skills Gained:</span>
                    {currentDisplayProject.skills_gained?.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Award size={13} className="text-[#F5BF45] flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#253342] text-center">
                <div className="p-2 rounded bg-[#101A26]">
                  <div className="text-[10px] text-[#A8B3C2]">Duration</div>
                  <div className="text-xs font-bold text-[#F5F7FA]">3-4 weeks</div>
                </div>
                <div className="p-2 rounded bg-[#101A26]">
                  <div className="text-[10px] text-[#A8B3C2]">Difficulty</div>
                  <div className="text-xs font-bold text-[#F5F7FA] capitalize">{currentDisplayProject.difficulty || 'Mid'}</div>
                </div>
                <div className="p-2 rounded bg-[#101A26]">
                  <div className="text-[10px] text-[#A8B3C2]">Modules</div>
                  <div className="text-xs font-bold text-[#F5F7FA]">5 Steps</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setFullProjectModal(currentDisplayProject)}
                  className="btn btn-primary flex-1 text-xs font-bold py-2.5"
                >
                  View Full Project &gt;
                </button>
                <button
                  onClick={() => handleCopySpec(currentDisplayProject)}
                  className="btn btn-secondary text-xs py-2.5 px-3 flex items-center gap-1.5"
                  title="Copy architecture specification"
                >
                  {copiedKey === currentDisplayProject.title ? <Check size={14} className="text-[#2DD4A0]" /> : <Copy size={14} />}
                  <span>{copiedKey === currentDisplayProject.title ? 'Copied' : 'Spec'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-[#A8B3C2]">
              <p className="text-xs">Select any project to inspect its architecture, deliverables, and milestones.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Full Project Detail Modal ─────────────────────────────────────── */}
      {fullProjectModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-2xl w-full border border-[#253342] shadow-2xl relative bg-[#0B121B] max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setFullProjectModal(null)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5BF45]/20 text-[#F5BF45]">
                Full Architecture Plan
              </span>
              <span className="text-xs text-[#A8B3C2]">
                ~{fullProjectModal.estimated_hours || 30} estimated hours
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#F5F7FA] mb-2">
              {fullProjectModal.title}
            </h3>
            <p className="text-xs text-[#A8B3C2] leading-relaxed mb-4">
              {fullProjectModal.description}
            </p>

            {/* Milestones Checklist */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2.5">
                Implementation Milestones:
              </h4>
              <div className="space-y-2">
                {fullProjectModal.milestones?.map((m, i) => (
                  <div key={i} className="p-2.5 rounded bg-[#101A26] border border-[#253342] flex items-start gap-2.5 text-xs text-[#F5F7FA]">
                    <span className="w-5 h-5 rounded-full bg-[#F5BF45]/20 text-[#F5BF45] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2">
                Expected Deliverables:
              </h4>
              <div className="flex flex-wrap gap-2">
                {(fullProjectModal.deliverables || ['GitHub repo with README', 'Live deployment URL', 'Architecture diagram']).map((d, i) => (
                  <span key={i} className="px-3 py-1 rounded bg-[#101A26] border border-[#253342] text-xs text-[#2DD4A0] flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    <span>{d}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#253342]">
              <button
                onClick={() => handleCopySpec(fullProjectModal)}
                className="btn btn-outline text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>Copy Architecture Spec</span>
              </button>
              <button
                onClick={() => setFullProjectModal(null)}
                className="btn btn-primary text-xs font-bold py-2 px-5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Project Generator Modal (Matching Prompt Spec) ─────────────── */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full border border-[#F5BF45]/40 shadow-2xl relative bg-[#0B121B]">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#F5BF45]/15 border border-[#F5BF45]/30 flex items-center justify-center text-[#F5BF45]">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F7FA]">AI Project Generator</h3>
                <p className="text-xs text-[#A8B3C2]">Formulate custom architecture projects for your target role</p>
              </div>
            </div>

            <form onSubmit={handleGenerateAiProject} className="space-y-4 text-xs">
              <div>
                <label className="form-label block text-[#A8B3C2] mb-1">Target Engineering Role</label>
                <input
                  type="text"
                  className="w-full bg-[#101A26] border border-[#253342] rounded-md p-2 text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                  value={aiRole}
                  onChange={(e) => setAiRole(e.target.value)}
                  placeholder="e.g. Data Scientist, DevOps, Frontend Engineer"
                  required
                />
              </div>

              <div>
                <label className="form-label block text-[#A8B3C2] mb-1">Skill & Experience Level</label>
                <select
                  className="w-full bg-[#101A26] border border-[#253342] rounded-md p-2 text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                >
                  <option value="beginner">Beginner (Foundations & APIs)</option>
                  <option value="intermediate">Intermediate (Full Stack & Microservices)</option>
                  <option value="advanced">Advanced (Distributed Systems & Scale)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342] text-[11px] text-[#A8B3C2]">
                Our recommendation engine formulates realistic milestone breakdowns, technology stacks, and resume impact bullets.
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
                disabled={aiGenerating}
              >
                {aiGenerating ? (
                  <>
                    <div className="spinner spinner-sm" />
                    <span>Synthesizing Architecture...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Tailored Project Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
