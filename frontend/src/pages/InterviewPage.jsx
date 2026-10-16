/**
 * CC — CareerCraft
 * Interview Configuration Page — Configure and launch AI interview sessions.
 * Supports: HR, Technical, Behavioral, Problem-Solving, Project rounds.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI, resumeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MessageSquare, Play, Sparkles, Clock, CheckCircle2,
  AlertCircle, Trash2, ArrowRight, Award, Shield, Target, BookOpen,
  Mic, Video, Briefcase, Code2, Users, Lightbulb, FolderGit2,
  ChevronRight, Star, Zap, BarChart3
} from 'lucide-react';

/* ── Interview Round Types ────────────────────────────────────────────────── */
const INTERVIEW_ROUNDS = [
  {
    id: 'mixed',
    label: 'Full Interview (Mixed)',
    desc: 'Balanced blend of all round types — best for realistic practice',
    icon: <Zap size={18} className="text-brand-400" />,
    tags: ['HR', 'Technical', 'Behavioral'],
    recommended: true,
  },
  {
    id: 'hr',
    label: 'HR Round',
    desc: 'Introduction, motivation, strengths, weaknesses, career goals & communication',
    icon: <Briefcase size={18} className="text-violet-400" />,
    tags: ['Introduction', 'Culture Fit', 'Career Goals'],
  },
  {
    id: 'technical',
    label: 'Technical Round',
    desc: 'Role-specific CS concepts, architecture, coding, and problem-solving questions',
    icon: <Code2 size={18} className="text-cyan-400" />,
    tags: ['Algorithms', 'System Design', 'Debugging'],
  },
  {
    id: 'behavioral',
    label: 'Behavioral & Leadership',
    desc: 'STAR-method scenarios: teamwork, conflict, ownership, leadership challenges',
    icon: <Users size={18} className="text-amber-400" />,
    tags: ['STAR Method', 'Teamwork', 'Leadership'],
  },
  {
    id: 'situational',
    label: 'Problem-Solving Round',
    desc: 'Hypothetical dilemmas, reasoning questions, and domain-specific challenges',
    icon: <Lightbulb size={18} className="text-rose-400" />,
    tags: ['Critical Thinking', 'Decision Making'],
  },
];

/* ── Experience Levels ────────────────────────────────────────────────────── */
const EXPERIENCE_LEVELS = [
  { id: 'fresher', label: 'Fresher', desc: '0–1 years', icon: '🌱' },
  { id: 'junior', label: 'Junior', desc: '1–3 years', icon: '⚡' },
  { id: 'mid', label: 'Mid-Level', desc: '3–6 years', icon: '🎯' },
  { id: 'senior', label: 'Senior', desc: '6+ years', icon: '🏆' },
];

/* ── Score badge color helper ─────────────────────────────────────────────── */
const scoreColor = (s) => {
  if (s >= 80) return 'text-emerald-400';
  if (s >= 60) return 'text-amber-400';
  if (s >= 40) return 'text-orange-400';
  return 'text-rose-400';
};

export default function InterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  /* ── Form state ── */
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Engineer');
  const [roundType, setRoundType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(6);
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'junior');
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [histRes, resRes] = await Promise.all([
        interviewAPI.history(),
        resumeAPI.list(),
      ]);
      setHistory(histRes.data.interviews || []);
      const resumeList = resRes.data.resumes || [];
      setResumes(resumeList);
      if (resumeList.length > 0) setSelectedResumeId(resumeList[0].id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interview records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) { toast.error('Please specify a target role'); return; }

    try {
      setStarting(true);
      const toastId = toast.loading('Generating questions & evaluation rubric…');
      const res = await interviewAPI.start({
        target_role: targetRole.trim(),
        interview_type: roundType,
        difficulty,
        num_questions: numQuestions,
        resume_id: selectedResumeId || null,
      });
      toast.dismiss(toastId);
      toast.success('Interview room ready! Let\'s crush it 💪');
      navigate(`/interview/${res.data.interview.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to start interview session');
    } finally {
      setStarting(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this interview session?')) return;
    try {
      await interviewAPI.delete(id);
      toast.success('Session deleted');
      setHistory(prev => prev.filter(i => i.id !== id));
    } catch {
      toast.error('Failed to delete session');
    }
  };

  /* ── Estimated duration ── */
  const estMinutes = numQuestions * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3);

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="badge badge-brand">AI Interview Room</span>
          <span className="text-xs text-muted">Powered by Voice + AI Coaching</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          AI Mock Interview
        </h1>
        <p className="text-muted text-sm mt-1 max-w-2xl">
          Practice realistic job interviews with a professional AI interviewer. 
          Voice-driven Q&A, live transcription, instant feedback, and detailed coaching reports.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { icon: <Mic size={13} />, label: 'Voice Input (STT)' },
            { icon: <MessageSquare size={13} />, label: 'Live Transcript' },
            { icon: <Video size={13} />, label: 'Camera Preview' },
            { icon: <BarChart3 size={13} />, label: 'Performance Report' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Configuration Form ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              Configure Interview Session
            </h2>
            <p className="text-xs text-muted mb-6">
              Select your target role, round type, and preferences. The AI interviewer will adapt questions to your profile.
            </p>

            <form onSubmit={handleStartInterview} className="space-y-6">
              {/* Target Role + Number of Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="target-role">Target Role *</label>
                  <input
                    id="target-role"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Full Stack Developer"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="num-q">Number of Questions</label>
                  <select
                    id="num-q"
                    className="form-control"
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                  >
                    <option value={4}>4 Questions — Quick Drill (~{4 * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3)} min)</option>
                    <option value={6}>6 Questions — Standard Round (~{6 * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3)} min)</option>
                    <option value={8}>8 Questions — Full Deep-Dive (~{8 * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3)} min)</option>
                    <option value={10}>10 Questions — Comprehensive (~{10 * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3)} min)</option>
                  </select>
                </div>
              </div>

              {/* Difficulty + Experience Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'easy', label: 'Easy', color: 'emerald' },
                      { id: 'medium', label: 'Medium', color: 'amber' },
                      { id: 'hard', label: 'Hard', color: 'rose' },
                    ].map(lvl => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDifficulty(lvl.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                          difficulty === lvl.id
                            ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                            : 'border-border bg-surface text-muted hover:border-border-strong'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="resume-select">Personalize with Resume</label>
                  <select
                    id="resume-select"
                    className="form-control"
                    value={selectedResumeId}
                    onChange={e => setSelectedResumeId(e.target.value)}
                  >
                    <option value="">No resume (Role-based questions)</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.original_filename} (v{r.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="form-label mb-2 block">Experience Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXPERIENCE_LEVELS.map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        experienceLevel === lvl.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-border bg-surface hover:border-border-strong'
                      }`}
                    >
                      <div className="text-xl mb-1">{lvl.icon}</div>
                      <div className={`text-xs font-bold ${experienceLevel === lvl.id ? 'text-brand-300' : 'text-secondary'}`}>
                        {lvl.label}
                      </div>
                      <div className="text-[10px] text-muted">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Round Type */}
              <div>
                <label className="form-label mb-2 block">Interview Round Type</label>
                <div className="space-y-2">
                  {INTERVIEW_ROUNDS.map(round => (
                    <div
                      key={round.id}
                      onClick={() => setRoundType(round.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        roundType === round.id
                          ? 'border-brand-500 bg-brand-500/10 shadow-sm'
                          : 'border-border bg-surface hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${roundType === round.id ? 'bg-brand-500/20' : 'bg-surface'}`}>
                            {round.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-primary">{round.label}</span>
                              {round.recommended && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                  style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted mt-0.5">{round.desc}</div>
                            <div className="flex gap-1 mt-1.5">
                              {round.tags.map(t => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          roundType === round.id ? 'border-brand-500 bg-brand-500' : 'border-border'
                        }`}>
                          {roundType === round.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice + privacy note */}
              <div className="p-3.5 rounded-xl text-xs"
                style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Mic size={12} /> Voice Interview Mode
                </div>
                <p className="text-slate-400 leading-relaxed">
                  The AI interviewer speaks questions using your browser's built-in Text-to-Speech.
                  Your answers are recorded via the browser's Speech Recognition API (requires Chrome or Edge).
                  <strong className="text-slate-300"> Chrome may send audio to Google's servers for processing</strong> — not to CareerCraft.
                  You can always type your answers instead.
                  Camera and screen data never leave your device.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={starting}
              >
                {starting ? (
                  <><span className="spinner spinner-sm mr-2" />Preparing Interview Room…</>
                ) : (
                  <>
                    <Play size={16} className="mr-2 fill-current" />
                    Enter Interview Room — ~{estMinutes} min session
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Tips + History ── */}
        <div className="space-y-6">
          {/* STAR Framework */}
          <div className="card p-5" style={{ borderLeft: '3px solid var(--brand-500)' }}>
            <h3 className="font-bold text-sm mb-2 text-brand-300 flex items-center gap-2">
              <BookOpen size={15} /> STAR Coaching Method
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-3">
              Structure all behavioral answers for highest scores:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { letter: 'S', label: 'Situation', desc: 'Set the context & project scope' },
                { letter: 'T', label: 'Task', desc: 'Describe the specific challenge' },
                { letter: 'A', label: 'Action', desc: 'Explain exactly what YOU did' },
                { letter: 'R', label: 'Result', desc: 'Quantify the impact & learnings' },
              ].map(s => (
                <div key={s.letter} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                    {s.letter}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-200">{s.label}: </span>
                    <span className="text-muted">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to expect */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 text-slate-300 flex items-center gap-2">
              <Target size={14} /> What to Expect
            </h3>
            <div className="space-y-2 text-xs text-muted">
              {[
                '🤖 AI interviewer speaks each question (requires Chrome/Edge for voice)',
                '🎤 Answer by speaking or typing — voice fallback always available',
                '📊 Instant score & detailed feedback per answer',
                '❓ AI asks relevant follow-up questions based on your response',
                '📋 Live transcript with editable entries',
                '📷 Optional camera preview (100% local, never recorded)',
                '📱 Works on desktop, tablet & mobile',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">{item.split(' ')[0]}</span>
                  <span>{item.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Sessions */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>Previous Sessions ({history.length})</span>
              {history.length > 0 && (
                <span className="text-xs text-brand-400 font-normal">
                  Best: {Math.max(...history.filter(h => h.overall_score != null).map(h => h.overall_score), 0)}%
                </span>
              )}
            </h3>

            {loading ? (
              <div className="py-6 text-center">
                <div className="spinner spinner-sm mx-auto mb-2" />
                <span className="text-xs text-muted">Loading history…</span>
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted italic">No past sessions yet. Launch your first one!</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {history.map(sess => (
                  <div
                    key={sess.id}
                    onClick={() => navigate(`/interview/${sess.id}`)}
                    className="p-3 rounded-xl border border-border bg-surface hover:border-brand-500/50 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-primary truncate">
                        {sess.title || `${sess.target_role} Interview`}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted">
                        <span className="capitalize">{sess.difficulty}</span>
                        <span>·</span>
                        <span>{sess.answered_questions || 0}/{sess.total_questions} answered</span>
                        {sess.overall_score != null && (
                          <>
                            <span>·</span>
                            <span className={`font-bold ${scoreColor(sess.overall_score)}`}>
                              {Math.round(sess.overall_score)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sess.overall_score != null ? (
                        <span className="badge badge-accent font-bold text-xs">
                          {Math.round(sess.overall_score)}%
                        </span>
                      ) : (
                        <span className="badge badge-amber text-[10px]">In Progress</span>
                      )}
                      <ChevronRight size={12} className="text-muted group-hover:text-brand-400 transition-colors" />
                      <button
                        onClick={e => handleDelete(e, sess.id)}
                        className="p-1 rounded text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
