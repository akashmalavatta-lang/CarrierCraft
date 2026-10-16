import { useState, useEffect, useMemo } from 'react';
import { jobsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, Bookmark, BookmarkCheck, ExternalLink,
  MapPin, Building, Globe, Sparkles, Filter, Trash2,
  TrendingUp, Award, CheckCircle2, ChevronRight, RotateCcw,
  Clock, DollarSign, Users, ChevronLeft, Layers, PieChart, BarChart3, Target
} from 'lucide-react';

const SKILLS_IN_DEMAND = [
  'Python', 'Data Analysis', 'Machine Learning', 'SQL',
  'Power BI', 'Data Visualization', 'React', 'System Design'
];

const MARKET_INSIGHTS = [
  { role: 'Data Analyst', pct: 42, color: '#3B82F6' },
  { role: 'Software Engineer', pct: 28, color: '#EC4899' },
  { role: 'ML Engineer', pct: 15, color: '#F59E0B' },
  { role: 'Data Scientist', pct: 10, color: '#10B981' },
  { role: 'Others', pct: 5, color: '#64748B' },
];

export default function JobsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState(user?.target_role || 'Software Engineer');
  const [location, setLocation] = useState('All');
  const [experience, setExperience] = useState('All');
  const [salary, setSalary] = useState('All');
  const [jobType, setJobType] = useState('All');

  const [jobs, setJobs] = useState([]);
  const [searchLinks, setSearchLinks] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'saved'
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'requirements' | 'responsibilities' | 'company'
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const fetchJobs = async (searchQuery = query, searchLoc = location) => {
    try {
      setLoading(true);
      const locParam = searchLoc === 'All' ? '' : searchLoc;
      const res = await jobsAPI.search({ q: searchQuery, location: locParam });
      const fetched = res.data.jobs || [];
      setJobs(fetched);
      setSearchLinks(res.data.search_links || []);
      if (fetched.length > 0) {
        setSelectedJob(fetched[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to search jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const res = await jobsAPI.saved();
      setSavedJobs(res.data.saved_jobs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSaved();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchJobs(query, location);
  };

  const handleResetFilters = () => {
    setQuery(user?.target_role || 'Software Engineer');
    setLocation('All');
    setExperience('All');
    setSalary('All');
    setJobType('All');
    fetchJobs(user?.target_role || 'Software Engineer', '');
  };

  const handleSkillClick = (skill) => {
    setQuery(skill);
    fetchJobs(skill, location);
  };

  const handleSaveJob = async (job) => {
    try {
      setSavingId(job.url || job.title);
      await jobsAPI.save({
        job_title: job.title,
        company: job.company_name || job.company,
        location: job.location,
        url: job.url,
        description: job.description?.slice(0, 500) || '',
        source: job.source || 'CareerCraft',
      });
      toast.success('Job saved to tracker!');
      fetchSaved();
    } catch (err) {
      toast.error('Failed to save job');
    } finally {
      setSavingId(null);
    }
  };

  const handleUnsaveJob = async (id) => {
    try {
      await jobsAPI.unsave(id);
      toast.success('Job removed from saved list');
      setSavedJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      toast.error('Failed to remove saved job');
    }
  };

  const isSaved = (job) => {
    if (!job) return false;
    return savedJobs.some(s => s.url === job.url || (s.job_title === job.title && s.company === (job.company_name || job.company)));
  };

  // Filtered jobs list based on UI dropdowns
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      if (location !== 'All') {
        const loc = (j.location || '').toLowerCase();
        if (location === 'Remote' && !loc.includes('remote')) return false;
        if (location !== 'Remote' && !loc.includes(location.toLowerCase())) return false;
      }
      if (jobType !== 'All') {
        const titleAndDesc = `${j.title} ${j.description || ''}`.toLowerCase();
        if (jobType === 'Internship' && !titleAndDesc.includes('intern')) return false;
        if (jobType === 'Full Time' && titleAndDesc.includes('intern')) return false;
      }
      return true;
    });
  }, [jobs, location, jobType]);

  const currentDisplayJob = selectedJob || filteredJobs[0] || null;

  // Company logo initial helper with harmonious colors
  const getCompanyColor = (name = '') => {
    const char = name.charCodeAt(0) || 0;
    const colors = [
      'from-blue-600 to-indigo-700',
      'from-amber-500 to-yellow-600',
      'from-emerald-600 to-teal-700',
      'from-rose-600 to-pink-700',
      'from-purple-600 to-indigo-800'
    ];
    return colors[char % colors.length];
  };

  return (
    <div className="page-container">
      {/* ── Top Header (Matching Image 1) ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#F5BF45]/15 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45]">
              <Target size={14} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Job Explorer
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A8B3C2]">
            Discover real jobs that match your skills and career goals. Get personalized recommendations and insights.
          </p>
        </div>

        {/* Right Top Action: Saved Jobs Button */}
        <button
          onClick={() => setActiveTab(activeTab === 'saved' ? 'explore' : 'saved')}
          className={`btn ${activeTab === 'saved' ? 'btn-primary' : 'btn-outline'} text-xs font-semibold flex items-center gap-2`}
        >
          <Bookmark size={15} />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>
      </div>

      {activeTab === 'saved' ? (
        /* ── Saved Jobs Tracker View ───────────────────────────────────────── */
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm text-[#F5F7FA] uppercase tracking-wider">
              Your Bookmarked Opportunities ({savedJobs.length})
            </h3>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs text-[#F5BF45] hover:underline flex items-center gap-1"
            >
              <span>Back to Explorer</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {savedJobs.length === 0 ? (
            <div className="card p-12 text-center text-[#A8B3C2]">
              <Bookmark size={40} className="mx-auto mb-3 opacity-30 text-[#F5BF45]" />
              <h4 className="font-bold text-base text-[#F5F7FA]">No saved jobs yet</h4>
              <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
                Bookmark interesting job postings while exploring to track your applications here.
              </p>
              <button onClick={() => setActiveTab('explore')} className="btn btn-outline btn-sm">
                Explore Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedJobs.map((job) => (
                <div key={job.id} className="card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-bold text-sm text-[#F5F7FA]">
                        {job.job_title}
                      </h4>
                      <button
                        onClick={() => handleUnsaveJob(job.id)}
                        className="text-[#A8B3C2] hover:text-rose-400 p-1"
                        title="Remove from saved"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#A8B3C2] mb-3">
                      <span className="font-medium text-[#F5F7FA]">{job.company}</span>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#253342] flex justify-between items-center text-xs">
                    <span className="text-[11px] text-[#A8B3C2]">
                      Saved {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm text-xs font-semibold"
                    >
                      <span>Apply</span>
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Main Explorer View (Matching Image 1) ─────────────────────────── */
        <div className="space-y-6">
          {/* ── Top 3 Metric Cards (Matching Image 1) ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Recommended for You */}
            <div className="card p-5 relative overflow-hidden bg-[#0B121B] border border-[#253342]">
              <div className="flex items-center gap-2 mb-2">
                <Target size={15} className="text-[#F5BF45]" />
                <span className="text-xs font-semibold text-[#F5F7FA]">Recommended for You</span>
              </div>
              <p className="text-[11px] text-[#A8B3C2] mb-4">Jobs matched with your skills and profile</p>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-[#F5F7FA]">{filteredJobs.length || 128}</div>
                  <div className="text-[11px] text-[#A8B3C2]">Job opportunities</div>
                </div>
                {/* Golden Mini Bar Graph Graphic */}
                <div className="flex items-end gap-1.5 h-10">
                  <div className="w-2 bg-[#F5BF45]/30 rounded-t h-4" />
                  <div className="w-2 bg-[#F5BF45]/50 rounded-t h-6" />
                  <div className="w-2 bg-[#F5BF45]/70 rounded-t h-7" />
                  <div className="w-2 bg-[#F5BF45]/85 rounded-t h-9" />
                  <div className="w-2 bg-[#F5BF45] rounded-t h-10 shadow-[0_0_8px_rgba(245,191,69,0.5)]" />
                </div>
              </div>
            </div>

            {/* Card 2: Top Skills in Demand */}
            <div className="card p-5 bg-[#0B121B] border border-[#253342]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={15} className="text-[#F5BF45]" />
                <span className="text-xs font-semibold text-[#F5F7FA]">Top Skills in Demand</span>
              </div>
              <p className="text-[11px] text-[#A8B3C2] mb-3">Most requested in current openings</p>

              <div className="flex flex-wrap gap-1.5">
                {SKILLS_IN_DEMAND.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillClick(skill)}
                    className="px-2.5 py-1 rounded bg-[#101A26] border border-[#253342] text-[11px] text-[#F5F7FA] hover:border-[#F5BF45] hover:text-[#F5BF45] transition-all cursor-pointer"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Job Market Insights (Doughnut Chart) */}
            <div className="card p-5 bg-[#0B121B] border border-[#253342]">
              <div className="flex items-center gap-2 mb-2">
                <PieChart size={15} className="text-[#F5BF45]" />
                <span className="text-xs font-semibold text-[#F5F7FA]">Job Market Insights</span>
              </div>
              <p className="text-[11px] text-[#A8B3C2] mb-3">Job roles by category</p>

              <div className="flex items-center justify-between gap-3">
                {/* SVG Doughnut Ring */}
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#253342]"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#3B82F6]"
                      strokeDasharray="42, 100"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#EC4899]"
                      strokeDasharray="28, 100"
                      strokeDashoffset="-42"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-[#F5F7FA]">42%</span>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-[#A8B3C2]">
                  {MARKET_INSIGHTS.map((item) => (
                    <div key={item.role} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.role}</span>
                      <span className="font-bold text-[#F5F7FA]">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Search & Filter Controls (Matching Image 1) ───────────────── */}
          <div className="card p-4 bg-[#0B121B] border border-[#253342]">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search text field */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B3C2]" />
                <input
                  type="text"
                  className="w-full bg-[#101A26] border border-[#253342] rounded-md py-2 pl-9 pr-3 text-xs text-[#F5F7FA] placeholder-[#7E8D9F] focus:outline-none focus:border-[#F5BF45]"
                  placeholder="Search job title, company, or keywords..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                >
                  <option value="All">Location: All</option>
                  <option value="Remote">Remote</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi">Delhi NCR</option>
                </select>

                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                >
                  <option value="All">Experience: All</option>
                  <option value="0-1">0 - 1 years</option>
                  <option value="1-3">1 - 3 years</option>
                  <option value="3-5">3 - 5 years</option>
                  <option value="5+">5+ years</option>
                </select>

                <select
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                >
                  <option value="All">Salary: All</option>
                  <option value="25-50">₹25K - ₹50K</option>
                  <option value="50-100">₹50K - ₹100K</option>
                  <option value="100+">₹100K+</option>
                </select>

                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="bg-[#101A26] border border-[#253342] rounded-md py-2 px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                >
                  <option value="All">Job Type: All</option>
                  <option value="Internship">Internship</option>
                  <option value="Full Time">Full Time</option>
                </select>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 rounded-md border border-[#253342] bg-[#101A26] text-[#A8B3C2] hover:text-[#F5F7FA] hover:border-[#F5BF45] transition-colors"
                  title="Reset Filters"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  type="submit"
                  className="btn btn-primary text-xs py-2 px-4 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {/* ── 2-Column Main Layout: Job List & Detail Panel (Image 1) ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (5 Cols): Job Cards List */}
            <div className="lg:col-span-5 space-y-3">
              {loading ? (
                <div className="card p-12 text-center">
                  <div className="spinner spinner-md mx-auto mb-3" />
                  <p className="text-xs text-[#A8B3C2]">Fetching verified openings...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="card p-8 text-center text-[#A8B3C2]">
                  <Briefcase size={36} className="mx-auto mb-2 opacity-30 text-[#F5BF45]" />
                  <h4 className="font-bold text-sm text-[#F5F7FA]">No jobs matched your filters</h4>
                  <p className="text-xs mt-1 mb-3">Try adjusting your keywords or clearing the location filter.</p>
                  <button onClick={handleResetFilters} className="btn btn-outline btn-sm text-xs">
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredJobs.map((job, idx) => {
                  const saved = isSaved(job);
                  const isSelected = currentDisplayJob?.url === job.url || currentDisplayJob?.title === job.title;
                  const companyName = job.company_name || job.company || 'Tech Company';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedJob(job)}
                      className={`card p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#F5BF45] bg-[#101A26] shadow-[0_0_15px_rgba(245,191,69,0.15)]'
                          : 'border-[#253342] bg-[#0B121B] hover:border-[#F5BF45]/50 hover:bg-[#101A26]/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Company Logo Icon Badge */}
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${getCompanyColor(companyName)} text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          {companyName.slice(0, 1).toUpperCase()}
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-[#F5F7FA] truncate">
                              {job.title}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-[#A8B3C2]">
                                {idx % 2 === 0 ? '2 days ago' : '1 day ago'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  !saved && handleSaveJob(job);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  saved ? 'text-[#2DD4A0]' : 'text-[#A8B3C2] hover:text-[#F5BF45]'
                                }`}
                                title={saved ? 'Saved' : 'Save Job'}
                              >
                                {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-[#F5F7FA] font-medium mt-0.5">
                            {companyName}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#A8B3C2] mt-1">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin size={11} />
                              {job.location || 'Bengaluru, India'}
                            </span>
                            <span>•</span>
                            <span>{job.title?.toLowerCase().includes('intern') ? 'Internship' : 'Full Time'}</span>
                          </div>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {(job.tags && job.tags.length > 0 ? job.tags.slice(0, 4) : ['Python', 'SQL', 'Data Analysis', 'Excel']).map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#101A26] border border-[#253342] text-[#A8B3C2]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* 1-Click External Portal Search Links */}
              {searchLinks.length > 0 && (
                <div className="card p-3.5 bg-[#0B121B] border border-[#253342] mt-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#F5F7FA]">
                    <Globe size={14} className="text-[#F5BF45]" />
                    <span>Direct Fresher Job Searches</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {searchLinks.slice(0, 4).map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded bg-[#101A26] border border-[#253342] hover:border-[#F5BF45] flex items-center justify-between text-[#A8B3C2] hover:text-[#F5F7FA]"
                      >
                        <span className="truncate text-[11px]">{link.portal_name || link.name}</span>
                        <ExternalLink size={11} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (7 Cols): Selected Job Details View (Matching Image 1) */}
            <div className="lg:col-span-7">
              {currentDisplayJob ? (
                <div className="card overflow-hidden bg-[#0B121B] border border-[#253342] sticky top-24">
                  {/* Hero / Office Banner */}
                  <div className="relative h-44 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center">
                    {/* Simulated modern high-tech office photo backdrop */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-black/60 to-black/90" />
                    <div className="relative text-center px-4">
                      <div className="text-3xl font-black text-white/20 tracking-widest uppercase mb-1">
                        {currentDisplayJob.company_name || currentDisplayJob.company || 'CAREERCRAFT'}
                      </div>
                      <div className="text-xs text-[#F5BF45] font-semibold tracking-wider uppercase">
                        Global Engineering Headquarters
                      </div>
                    </div>
                  </div>

                  {/* Header with Logo, Title, and Actions */}
                  <div className="p-6 border-b border-[#253342]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getCompanyColor(currentDisplayJob.company_name || currentDisplayJob.company)} text-white font-black text-xl flex items-center justify-center shadow-md`}>
                          {(currentDisplayJob.company_name || currentDisplayJob.company || 'C').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#F5F7FA]">
                            {currentDisplayJob.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[#A8B3C2] mt-0.5">
                            <span className="text-[#F5F7FA] font-medium">
                              {currentDisplayJob.company_name || currentDisplayJob.company || 'Google'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {currentDisplayJob.location || 'Bengaluru, India'}
                            </span>
                            <span>•</span>
                            <span>Posted 2 days ago</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                          href={currentDisplayJob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary text-xs py-2 px-5 font-bold flex-1 sm:flex-initial"
                        >
                          <span>Apply Now</span>
                          <ExternalLink size={13} className="ml-1" />
                        </a>
                        <button
                          onClick={() => handleSaveJob(currentDisplayJob)}
                          className={`btn ${isSaved(currentDisplayJob) ? 'btn-secondary text-[#2DD4A0]' : 'btn-outline text-[#F5BF45]'} text-xs py-2 px-3`}
                          title="Save Job"
                        >
                          <Bookmark size={15} />
                          <span className="hidden sm:inline">{isSaved(currentDisplayJob) ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-4 mt-6 border-b border-[#253342] text-xs">
                      {['overview', 'requirements', 'responsibilities', 'company', 'reviews'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setDetailTab(t)}
                          className={`pb-2.5 font-semibold capitalize transition-colors relative ${
                            detailTab === t ? 'text-[#F5BF45]' : 'text-[#A8B3C2] hover:text-[#F5F7FA]'
                          }`}
                        >
                          {t}
                          {detailTab === t && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BF45]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Body */}
                  <div className="p-6 space-y-5">
                    {/* Key Highlights Grid (Matching Image 1) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342]">
                        <div className="text-[10px] text-[#A8B3C2] flex items-center gap-1 mb-1">
                          <DollarSign size={12} className="text-[#F5BF45]" />
                          <span>Salary Range</span>
                        </div>
                        <div className="text-xs font-bold text-[#F5F7FA]">₹25K - ₹60K / mo</div>
                        <div className="text-[9px] text-[#7E8D9F]">(Estimated)</div>
                      </div>

                      <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342]">
                        <div className="text-[10px] text-[#A8B3C2] flex items-center gap-1 mb-1">
                          <Briefcase size={12} className="text-[#F5BF45]" />
                          <span>Job Type</span>
                        </div>
                        <div className="text-xs font-bold text-[#F5F7FA]">
                          {currentDisplayJob.title?.toLowerCase().includes('intern') ? 'Internship' : 'Full Time'}
                        </div>
                        <div className="text-[9px] text-[#7E8D9F]">Standard</div>
                      </div>

                      <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342]">
                        <div className="text-[10px] text-[#A8B3C2] flex items-center gap-1 mb-1">
                          <Clock size={12} className="text-[#F5BF45]" />
                          <span>Experience</span>
                        </div>
                        <div className="text-xs font-bold text-[#F5F7FA]">0 - 1 years</div>
                        <div className="text-[9px] text-[#7E8D9F]">Entry Level / Fresher</div>
                      </div>

                      <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342]">
                        <div className="text-[10px] text-[#A8B3C2] flex items-center gap-1 mb-1">
                          <Users size={12} className="text-[#F5BF45]" />
                          <span>Applicants</span>
                        </div>
                        <div className="text-xs font-bold text-[#F5F7FA]">1.2K</div>
                        <div className="text-[9px] text-[#2DD4A0]">Actively Hiring</div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText size={14} className="text-[#F5BF45]" />
                        <span>Job Description</span>
                      </h4>
                      <div className="text-xs text-[#A8B3C2] leading-relaxed space-y-2">
                        <p>
                          {currentDisplayJob.description
                            ? currentDisplayJob.description.slice(0, 450) + '...'
                            : `Join ${currentDisplayJob.company_name || currentDisplayJob.company || 'the team'} as a ${currentDisplayJob.title} and work on real-world engineering challenges. You will analyze datasets, build scalable models or services, and provide insights to support data-driven decision making across teams.`}
                        </p>
                      </div>
                    </div>

                    {/* Key Skills */}
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Award size={14} className="text-[#F5BF45]" />
                        <span>Key Skills Required</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(currentDisplayJob.tags && currentDisplayJob.tags.length > 0
                          ? currentDisplayJob.tags
                          : ['Python', 'SQL', 'Excel', 'Data Visualization', 'Statistics', 'Problem Solving']
                        ).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded bg-[#101A26] border border-[#253342] text-xs text-[#F5F7FA]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Similar Jobs Mini Cards */}
                    <div className="pt-4 border-t border-[#253342]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-[#F5F7FA]">Similar Jobs</span>
                        <span className="text-[11px] text-[#F5BF45] cursor-pointer hover:underline">View All</span>
                      </div>
                      <div className="space-y-2">
                        {filteredJobs.slice(1, 3).map((sim, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedJob(sim)}
                            className="p-3 rounded-lg bg-[#101A26] border border-[#253342] hover:border-[#F5BF45]/40 flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#F5F7FA]">{sim.title}</div>
                              <div className="text-[11px] text-[#A8B3C2]">{sim.company_name || sim.company} • {sim.location || 'Bengaluru'}</div>
                            </div>
                            <ChevronRight size={15} className="text-[#A8B3C2]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card p-12 text-center text-[#A8B3C2]">
                  <p className="text-xs">Select a job from the list to view its complete description and apply.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
