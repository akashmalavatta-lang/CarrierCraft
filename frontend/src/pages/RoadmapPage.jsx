import { useState, useEffect } from 'react';
import { roadmapAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Map, Sparkles, CheckCircle2, Clock, BookOpen, ExternalLink,
  ChevronRight, Award, Plus, FolderKanban, Check, Layers
} from 'lucide-react';

const COMMON_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps / Cloud Engineer',
];

export default function RoadmapPage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState(user?.target_role || COMMON_ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'fresher');
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completedItems, setCompletedItems] = useState({});

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await roadmapAPI.list();
      const list = res.data.roadmaps || [];
      setSavedRoadmaps(list);
      if (list.length > 0) {
        // Parse the first saved roadmap
        const first = list[0];
        const parsed = typeof first.roadmap_data === 'string'
          ? JSON.parse(first.roadmap_data)
          : first.roadmap_data;
        setActiveRoadmap(parsed);
      } else {
        // Auto-generate initial roadmap
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
    // Load checked milestones from localStorage
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

      // Refresh list
      const listRes = await roadmapAPI.list();
      setSavedRoadmaps(listRes.data.roadmaps || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = (key) => {
    setCompletedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('cc_completed_milestones', JSON.stringify(updated));
      return updated;
    });
  };

  const phases = activeRoadmap?.phases || [];
  const totalWeeks = phases.reduce((acc, p) => acc + (p.duration_weeks || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">Curriculum Architecture</span>
            <span className="text-xs text-muted">Free Verified Open-Source Resources</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Personalized Learning Roadmap
          </h1>
          <p className="text-muted text-sm mt-1">
            Bridge the gap between your current technical skillset and your dream role with phased milestones.
          </p>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="form-label" htmlFor="role-select">Target Dream Role</label>
            <select
              id="role-select"
              className="form-control"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              {COMMON_ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="exp-select">Experience Level</label>
            <select
              id="exp-select"
              className="form-control"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="fresher">Fresher (Student / 0 yrs)</option>
              <option value="junior">Junior (1-2 yrs)</option>
              <option value="mid">Mid-level (3-5 yrs)</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => handleGenerate(targetRole, experienceLevel)}
              className="btn btn-primary w-full"
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner spinner-sm mr-2" />
                  Building Path...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  <span>Generate Custom Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="spinner spinner-md mx-auto mb-3" />
          <p className="text-sm text-muted">Loading learning trajectory...</p>
        </div>
      ) : !activeRoadmap ? (
        <div className="card p-12 text-center text-muted">
          <Map size={48} className="mx-auto mb-3 opacity-30 text-brand-400" />
          <h3 className="text-lg font-bold text-secondary">No Roadmap Generated Yet</h3>
          <p className="text-xs max-w-sm mx-auto mt-1">
            Choose your target role above and click 'Generate Custom Plan'.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Banner */}
          <div className="card p-6 bg-gradient-to-r from-slate-900 to-slate-850">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="badge badge-brand mb-2">
                  Target: {activeRoadmap.title || targetRole}
                </span>
                <h2 className="text-xl font-black text-white">
                  {phases.length}-Phase Accelerated Career Trajectory
                </h2>
                <p className="text-xs text-muted mt-1 max-w-xl">
                  {activeRoadmap.description || 'Step-by-step masterplan from foundations to full-stack mastery.'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center p-3 rounded-xl bg-surface border border-border min-w-[100px]">
                  <div className="text-xs uppercase font-bold text-muted">Estimated Time</div>
                  <div className="text-2xl font-black text-brand-400 mt-1">
                    ~{totalWeeks} wks
                  </div>
                </div>

                <div className="text-center p-3 rounded-xl bg-surface border border-border min-w-[100px]">
                  <div className="text-xs uppercase font-bold text-muted">Total Phases</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {phases.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phased Timeline Cards */}
          <div className="space-y-6">
            {phases.map((phase, pIdx) => {
              const milestoneKey = `milestone_${targetRole}_p${pIdx}`;
              const isChecked = !!completedItems[milestoneKey];

              return (
                <div key={pIdx} className="card p-6 border-l-4 border-l-brand-500 relative">
                  {/* Phase Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center">
                        {pIdx + 1}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-lg text-primary">
                          {phase.name}
                        </h3>
                        <span className="text-xs text-muted">
                          Phase {phase.phase || pIdx + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted bg-surface px-2.5 py-1 rounded-md border border-border">
                        <Clock size={13} className="text-brand-400" />
                        <span>{phase.duration_weeks} weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                      Core Skills to Master:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills?.map((skill, sIdx) => (
                        <span key={sIdx} className="badge badge-brand text-xs py-1 px-3">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Free Verified Resources */}
                  {phase.resources && phase.resources.length > 0 && (
                    <div className="mb-5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                        Curated Free Resources:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {phase.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl border border-border bg-surface/50 hover:border-brand-500/50 hover:bg-surface transition-all flex justify-between items-center group text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-primary group-hover:text-brand-300 truncate">
                                {res.title}
                              </div>
                              <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                                <span className="capitalize">{res.platform || 'Web'}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-medium">100% Free</span>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-muted group-hover:text-brand-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Portfolio Projects */}
                  {phase.projects && phase.projects.length > 0 && (
                    <div className="mb-5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2 flex items-center gap-1.5">
                        <FolderKanban size={14} />
                        <span>Recommended Practice Builds:</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {phase.projects.map((proj, prIdx) => (
                          <div key={prIdx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                            🛠️ {proj}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestone Checkpoint */}
                  {phase.milestone && (
                    <div
                      onClick={() => toggleMilestone(milestoneKey)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-border bg-surface hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border'
                        }`}>
                          {isChecked && <Check size={13} />}
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                            Phase Milestone:
                          </span>
                          <span className={`text-sm ${isChecked ? 'line-through text-muted' : 'font-semibold text-primary'}`}>
                            {phase.milestone}
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-muted'
                      }`}>
                        {isChecked ? 'Completed!' : 'Mark Done'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
