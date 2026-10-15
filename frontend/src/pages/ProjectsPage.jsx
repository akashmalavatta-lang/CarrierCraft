import { useState, useEffect } from 'react';
import { projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FolderKanban, Sparkles, Clock, CheckCircle2, ChevronRight,
  Code2, ExternalLink, Award, Copy, Check, Filter, Layers, Target
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [role, setRole] = useState(user?.target_role || DOMAIN_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState(''); // '' | 'beginner' | 'intermediate' | 'advanced'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const fetchProjects = async (targetRole = role, diff = difficulty) => {
    try {
      setLoading(true);
      const res = await projectsAPI.recommend({
        target_role: targetRole,
        difficulty: diff || undefined,
      });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load portfolio project recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    fetchProjects(newRole, difficulty);
  };

  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
    fetchProjects(role, newDiff);
  };

  const handleCopySpec = (proj, idx) => {
    const text = `PROJECT: ${proj.title}
Difficulty: ${proj.difficulty} (~${proj.estimated_hours}h)
Technologies: ${proj.technologies?.join(', ')}

Description:
${proj.description}

Milestones:
${proj.milestones?.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Resume Impact:
${proj.impact}`;

    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Project architecture copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'beginner') return 'badge badge-accent';
    if (diff === 'intermediate') return 'badge badge-brand';
    return 'badge badge-amber';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">Portfolio Architect</span>
            <span className="text-xs text-muted">High-Impact Standout Projects</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Resume-Worthy Project Ideas
          </h1>
          <p className="text-muted text-sm mt-1">
            Build real software with architectural depth instead of generic to-do apps. Designed to impress interviewers.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">
              Role:
            </span>
            {DOMAIN_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => handleRoleChange(d)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  role === d
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-surface text-secondary hover:bg-slate-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">
              Level:
            </span>
            {[
              { id: '', label: 'All' },
              { id: 'beginner', label: 'Beginner' },
              { id: 'intermediate', label: 'Mid' },
              { id: 'advanced', label: 'Advanced' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => handleDifficultyChange(lvl.id)}
                className={`py-1 px-2.5 rounded-md text-xs font-semibold transition-all ${
                  difficulty === lvl.id
                    ? 'bg-slate-700 text-brand-300 border border-brand-500/30'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="spinner spinner-md mx-auto mb-3" />
          <p className="text-sm text-muted">Curating portfolio blueprints...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <FolderKanban size={48} className="mx-auto mb-3 opacity-30 text-brand-400" />
          <h3 className="text-lg font-bold text-secondary">No Projects Matched</h3>
          <p className="text-xs max-w-sm mx-auto mt-1">
            Try choosing a different role or difficulty filter above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj, idx) => (
            <div key={idx} className="card p-6 flex flex-col justify-between hover-lift">
              <div>
                {/* Header row */}
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-extrabold text-lg text-primary leading-snug">
                    {proj.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={getDifficultyBadge(proj.difficulty)}>
                      {proj.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-brand-400" />
                    <span>~{proj.estimated_hours || 25} hours</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Sparkles size={13} />
                    <span>{proj.skill_match_score || 70}% Skill Fit</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Why it impresses recruiters */}
                {proj.impact && (
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-brand-500/20 text-xs mb-4">
                    <span className="font-semibold text-brand-300 block mb-0.5">
                      Recruiter Appeal & Impact:
                    </span>
                    <p className="text-slate-300 text-[11px]">{proj.impact}</p>
                  </div>
                )}

                {/* Tech Stack */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                    Recommended Tech Stack:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies?.map((tech, tIdx) => (
                      <span key={tIdx} className="badge badge-brand text-[11px]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Milestones */}
                {proj.milestones && proj.milestones.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-border">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
                      Implementation Roadmap:
                    </span>
                    <div className="space-y-1.5">
                      {proj.milestones.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-brand-400 font-mono text-[11px] mt-0.5">0{mIdx + 1}</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
                <span className="text-muted">
                  Deliverables: {proj.deliverables?.join(', ') || 'GitHub Repo, Live Demo'}
                </span>
                <button
                  onClick={() => handleCopySpec(proj, idx)}
                  className="btn btn-outline btn-sm text-brand-400 border-brand-500/30 hover:bg-brand-500/10"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check size={13} className="mr-1 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="mr-1" />
                      <span>Copy Spec</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
