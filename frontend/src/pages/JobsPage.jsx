import { useState, useEffect } from 'react';
import { jobsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, Bookmark, BookmarkCheck, ExternalLink,
  MapPin, Building, Globe, Sparkles, Filter, Trash2
} from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState(user?.target_role || 'Software Engineer');
  const [location, setLocation] = useState('Remote');
  const [jobs, setJobs] = useState([]);
  const [searchLinks, setSearchLinks] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'saved'
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const fetchJobs = async (searchQuery = query, searchLoc = location) => {
    try {
      setLoading(true);
      const res = await jobsAPI.search({ q: searchQuery, location: searchLoc });
      setJobs(res.data.jobs || []);
      setSearchLinks(res.data.search_links || []);
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
    e.preventDefault();
    fetchJobs(query, location);
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
        source: job.source || 'Arbeitnow',
      });
      toast.success('Job saved to your tracker!');
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
    return savedJobs.some(s => s.url === job.url || (s.job_title === job.title && s.company === (job.company_name || job.company)));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">Job Intelligence</span>
            <span className="text-xs text-muted">Free Aggregator & Portal Launcher</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Job & Internship Opportunities
          </h1>
          <p className="text-muted text-sm mt-1">
            Discover real remote tech jobs and trigger 1-click tailored queries on LinkedIn, Internshala, Indeed, and Naukri.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-surface p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('explore')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'explore' ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-secondary'
            }`}
          >
            Explore Jobs
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved' ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-secondary'
            }`}
          >
            <span>Saved Jobs</span>
            <span className="bg-slate-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {savedJobs.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'explore' ? (
        <div className="space-y-8">
          {/* Search Box */}
          <div className="card p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="form-label" htmlFor="job-q">Job Title / Skill</label>
                <div className="input-icon-wrapper">
                  <Search className="input-icon" size={16} />
                  <input
                    id="job-q"
                    type="text"
                    className="form-control with-icon"
                    placeholder="e.g. React Developer, Data Analyst"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label" htmlFor="job-loc">Location</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" size={16} />
                  <input
                    id="job-loc"
                    type="text"
                    className="form-control with-icon"
                    placeholder="e.g. Remote, India, Bengaluru"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner spinner-sm" />
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick 1-Click Search Portal Launchers */}
          {searchLinks.length > 0 && (
            <div className="card p-5 bg-gradient-to-r from-slate-900 to-slate-850">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={18} className="text-brand-400" />
                <h3 className="text-sm font-bold text-white">
                  1-Click Direct Portal Search (Targeted for Freshers)
                </h3>
              </div>
              <p className="text-xs text-muted mb-4">
                Launch pre-filtered searches for "{query}" directly in your favorite job boards:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {searchLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-border bg-surface/70 hover:border-brand-400 hover:bg-surface text-center transition-all group"
                  >
                    <div className="font-semibold text-xs text-primary group-hover:text-brand-300 truncate">
                      {link.portal_name || link.name}
                    </div>
                    <div className="text-[10px] text-muted flex items-center justify-center gap-1 mt-1">
                      <span>Search &rarr;</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Job Listings Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">
              Live Verified Opportunities ({jobs.length})
            </h3>

            {loading ? (
              <div className="card p-12 text-center">
                <div className="spinner spinner-md mx-auto mb-3" />
                <p className="text-sm text-muted">Scanning public job APIs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="card p-12 text-center text-muted">
                <Briefcase size={40} className="mx-auto mb-3 opacity-30 text-brand-400" />
                <h4 className="font-bold text-base text-secondary">No direct API jobs found</h4>
                <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
                  Use the 1-click portal links above to browse thousands of openings on LinkedIn, Internshala, and Naukri.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job, idx) => {
                  const saved = isSaved(job);
                  return (
                    <div key={idx} className="card p-5 hover-lift flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-bold text-base text-primary leading-snug">
                            {job.title}
                          </h4>
                          <button
                            onClick={() => !saved && handleSaveJob(job)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              saved ? 'text-emerald-400' : 'text-muted hover:text-brand-400'
                            }`}
                            title={saved ? 'Saved' : 'Save Job'}
                          >
                            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-3">
                          <div className="flex items-center gap-1 font-medium text-secondary">
                            <Building size={13} />
                            <span>{job.company_name || job.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={13} />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                        </div>

                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {job.tags.slice(0, 4).map((tag, i) => (
                              <span key={i} className="badge badge-accent text-[10px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                        <span className="text-muted">Source: {job.source || 'Arbeitnow'}</span>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm text-brand-400 border-brand-500/30 hover:bg-brand-500/10"
                        >
                          <span>Apply</span>
                          <ExternalLink size={13} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Jobs Tab */
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">
            Your Bookmarked Opportunities ({savedJobs.length})
          </h3>

          {savedJobs.length === 0 ? (
            <div className="card p-12 text-center text-muted">
              <Bookmark size={40} className="mx-auto mb-3 opacity-30 text-brand-400" />
              <h4 className="font-bold text-base text-secondary">No saved jobs yet</h4>
              <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
                Bookmark interesting job postings while exploring to track them here.
              </p>
              <button onClick={() => setActiveTab('explore')} className="btn btn-outline btn-sm">
                Explore Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map((job) => (
                <div key={job.id} className="card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-bold text-base text-primary">
                        {job.job_title}
                      </h4>
                      <button
                        onClick={() => handleUnsaveJob(job.id)}
                        className="text-muted hover:text-rose-400 p-1"
                        title="Remove from saved"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted mb-3">
                      <span className="font-medium text-secondary">{job.company}</span>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-muted">Saved on {new Date(job.created_at).toLocaleDateString()}</span>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <span>View & Apply</span>
                      <ExternalLink size={13} className="ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
