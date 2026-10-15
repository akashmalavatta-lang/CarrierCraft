import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI, resumeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MessageSquare, Play, Sparkles, Clock, CheckCircle2,
  AlertCircle, Trash2, ArrowRight, Award, Shield, Target, BookOpen
} from 'lucide-react';

const INTERVIEW_TYPES = [
  { id: 'mixed', label: 'Mixed (Recommended)', desc: 'Balanced blend of technical concepts and behavioral STAR scenarios' },
  { id: 'technical', label: 'Technical Drill', desc: 'Core computer science, architecture, problem solving, and coding concepts' },
  { id: 'behavioral', label: 'Behavioral & Leadership', desc: 'Teamwork, conflict resolution, ownership, and STAR story questions' },
  { id: 'hr', label: 'HR & Culture Fit', desc: 'Career motivations, strengths, salary expectations, and self-awareness' },
  { id: 'situational', label: 'Situational & Ethics', desc: 'Hypothetical workplace dilemmas and engineering judgment' },
];

export default function InterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Session form
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Engineer');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(6);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [histRes, resRes] = await Promise.all([
        interviewAPI.history(),
        resumeAPI.list(),
      ]);
      setHistory(histRes.data.interviews || []);
      setResumes(resRes.data.resumes || []);
      if (resRes.data.resumes?.length > 0) {
        setSelectedResumeId(resRes.data.resumes[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interview records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error('Please specify a target role');
      return;
    }

    try {
      setStarting(true);
      const toastId = toast.loading('Generating tailored questions & rubric...');
      const res = await interviewAPI.start({
        target_role: targetRole.trim(),
        interview_type: interviewType,
        difficulty,
        num_questions: numQuestions,
        resume_id: selectedResumeId || null,
      });
      toast.dismiss(toastId);
      toast.success('Interview session ready! Let’s crush it 💪');
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
      toast.success('Interview session deleted');
      setHistory(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      toast.error('Failed to delete interview');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-brand">AI Mock Arena</span>
          <span className="text-xs text-muted">STAR Method Coach</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Interactive Mock Interviews
        </h1>
        <p className="text-muted text-sm mt-1">
          Master high-stakes tech & behavioral interviews with realistic simulation, objective scoring, and instant model answer explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Configure & Start */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              <span>Launch a New Practice Session</span>
            </h2>
            <p className="text-xs text-muted mb-6">
              Customize the focus area and difficulty. Questions adapt to your target role and resume background.
            </p>

            <form onSubmit={handleStartInterview} className="space-y-6">
              {/* Target Role & Questions Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="target-role">Target Role</label>
                  <input
                    id="target-role"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Backend Developer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="num-q">Number of Questions</label>
                  <select
                    id="num-q"
                    className="form-control"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                  >
                    <option value={4}>4 Questions (Quick Drill ~ 10 mins)</option>
                    <option value={6}>6 Questions (Standard Round ~ 20 mins)</option>
                    <option value={8}>8 Questions (Full Deep-Dive ~ 30 mins)</option>
                  </select>
                </div>
              </div>

              {/* Difficulty & Resume Personalization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all border ${
                          difficulty === lvl
                            ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                            : 'border-border bg-surface text-muted hover:border-border-strong'
                        }`}
                      >
                        {lvl}
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
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    <option value="">No resume (Standard Role Questions)</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.original_filename} (v{r.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interview Type Selector */}
              <div>
                <label className="form-label mb-2 block">Interview Type & Focus</label>
                <div className="space-y-2">
                  {INTERVIEW_TYPES.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        interviewType === type.id
                          ? 'border-brand-500 bg-brand-500/10 shadow-sm'
                          : 'border-border bg-surface hover:border-border-strong'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-primary">{type.label}</div>
                        <div className="text-xs text-muted mt-0.5">{type.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        interviewType === type.id ? 'border-brand-500 bg-brand-500' : 'border-border'
                      }`}>
                        {interviewType === type.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={starting}
              >
                {starting ? (
                  <>
                    <span className="spinner spinner-sm mr-2" />
                    Assembling Questions...
                  </>
                ) : (
                  <>
                    <Play size={18} className="mr-2 fill-current" />
                    <span>Begin Interview Simulation</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Past History & Tips */}
        <div className="space-y-6">
          {/* STAR Methodology Tips */}
          <div className="card p-5 border-l-4 border-l-brand-500 bg-surface">
            <h3 className="font-bold text-sm mb-2 text-brand-300 flex items-center gap-2">
              <BookOpen size={16} />
              <span>STAR Coaching Framework</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-3">
              Structure behavioral and scenario responses clearly for highest marks:
            </p>
            <div className="space-y-1.5 text-xs">
              <div><strong className="text-slate-200">S — Situation:</strong> <span className="text-muted">Set context and project scope</span></div>
              <div><strong className="text-slate-200">T — Task:</strong> <span className="text-muted">Describe the exact challenge or goal</span></div>
              <div><strong className="text-slate-200">A — Action:</strong> <span className="text-muted">Explain what YOU did (tools, steps)</span></div>
              <div><strong className="text-slate-200">R — Result:</strong> <span className="text-muted">Quantifiable impact, metrics & learnings</span></div>
            </div>
          </div>

          {/* Past Sessions List */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 text-secondary uppercase tracking-wider">
              Previous Sessions ({history.length})
            </h3>

            {loading ? (
              <div className="py-6 text-center">
                <div className="spinner spinner-sm mx-auto mb-2" />
                <span className="text-xs text-muted">Loading history...</span>
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted italic">
                No past interview sessions. Launch your first one above!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {history.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => navigate(`/interview/${sess.id}`)}
                    className="p-3 rounded-lg border border-border bg-surface hover:border-brand-500/50 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs text-primary truncate">
                        {sess.title || `${sess.target_role} Interview`}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted">
                        <span className="capitalize">{sess.difficulty}</span>
                        <span>•</span>
                        <span>{sess.answered_questions || 0}/{sess.total_questions} answered</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sess.overall_score != null ? (
                        <span className="badge badge-accent font-bold text-xs">
                          {sess.overall_score}%
                        </span>
                      ) : (
                        <span className="badge badge-amber text-[10px]">
                          In Progress
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, sess.id)}
                        className="text-muted hover:text-rose-400 p-1"
                        title="Delete session"
                      >
                        <Trash2 size={13} />
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
