import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewAPI } from '../api';
import toast from 'react-hot-toast';
import {
  MessageSquare, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Clock, Award, Sparkles, Send, Check, RefreshCw, Trophy, Flag
} from 'lucide-react';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active answer state
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Complete session modal / view
  const [completedSummary, setCompletedSummary] = useState(null);
  const [completing, setCompleting] = useState(false);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await interviewAPI.get(id);
      setInterview(res.data.interview);
      const qs = res.data.questions || [];
      setQuestions(qs);

      // Find first unanswered question or default to 0
      const firstUnanswered = qs.findIndex(q => !q.is_answered);
      if (firstUnanswered !== -1) {
        setCurrentIndex(firstUnanswered);
        setCurrentAnswer(qs[firstUnanswered].user_answer || '');
      } else if (qs.length > 0) {
        setCurrentIndex(0);
        setCurrentAnswer(qs[0].user_answer || '');
      }

      if (res.data.interview.status === 'completed') {
        setTimerActive(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interview session');
      navigate('/interview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  // Per-question timer
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // When changing current question, populate answer
  const handleSelectQuestion = (idx) => {
    setCurrentIndex(idx);
    setCurrentAnswer(questions[idx]?.user_answer || '');
    setTimerSeconds(0);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast.error('Please write an answer before submitting');
      return;
    }

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    try {
      setSubmitting(true);
      const res = await interviewAPI.submitAnswer(id, currentQ.id, {
        answer: currentAnswer.trim(),
        time_taken_seconds: timerSeconds,
      });

      toast.success(`Answer scored: ${res.data.evaluation?.score || 0}%`);

      // Update question in local state
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        user_answer: currentAnswer.trim(),
        is_answered: true,
        score: res.data.evaluation?.score,
        feedback: res.data.evaluation?.feedback,
        improved_answer: res.data.evaluation?.improved_answer,
      };
      setQuestions(updatedQuestions);

      // Update answered count
      setInterview(prev => ({
        ...prev,
        answered_questions: res.data.progress?.answered || prev.answered_questions + 1,
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    const unanswered = questions.filter(q => !q.is_answered).length;
    if (unanswered > 0) {
      if (!window.confirm(`You still have ${unanswered} unanswered question(s). Finish interview anyway?`)) {
        return;
      }
    }

    try {
      setCompleting(true);
      const res = await interviewAPI.complete(id);
      setInterview(res.data.interview);
      setCompletedSummary(res.data);
      setTimerActive(false);
      toast.success('Interview completed! Outstanding effort 🎓 +30 XP');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to complete interview');
    } finally {
      setCompleting(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner spinner-lg text-brand-500" />
        <p className="text-muted font-medium">Entering simulation chamber...</p>
      </div>
    );
  }

  const activeQ = questions[currentIndex];
  const isCompleted = interview?.status === 'completed' || completedSummary != null;

  return (
    <div className="page-container">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/interview" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} className="mr-1" />
            <span>All Interviews</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-lg font-bold truncate text-primary">
              {interview?.title || 'Mock Interview Session'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="capitalize">{interview?.difficulty}</span>
              <span>•</span>
              <span className="capitalize">{interview?.interview_type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active timer */}
          {!isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono">
              <Clock size={14} className="text-brand-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          )}

          {/* Complete button */}
          {!isCompleted ? (
            <button
              onClick={handleCompleteInterview}
              className="btn btn-outline btn-sm text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              disabled={completing}
            >
              <Flag size={14} className="mr-1.5" />
              <span>{completing ? 'Scoring...' : 'Finish Interview'}</span>
            </button>
          ) : (
            <span className="badge badge-accent">Session Completed</span>
          )}
        </div>
      </div>

      {/* Completion Summary Modal / Card */}
      {isCompleted && (
        <div className="card p-8 mb-8 border-2 border-brand-500/50 bg-gradient-to-b from-brand-900/30 to-surface">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="badge badge-brand mb-2">
                <Trophy size={14} className="mr-1 text-amber-400" />
                <span>Simulation Complete</span>
              </div>
              <h2 className="text-2xl font-black text-white">Interview Performance Review</h2>
              <p className="text-sm text-slate-300 max-w-xl mt-1">
                {interview?.feedback_summary || 'Your answers have been graded against standard rubric criteria.'}
              </p>
            </div>

            <div className="text-center p-4 rounded-2xl bg-surface border border-border min-w-[140px]">
              <div className="text-xs uppercase font-bold text-muted">Overall Score</div>
              <div className="text-4xl font-black text-brand-400 mt-1">
                {interview?.overall_score != null ? `${interview.overall_score}%` : 'Scored'}
              </div>
              <div className="text-[11px] text-muted mt-1">
                {interview?.answered_questions}/{interview?.total_questions} questions answered
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left = Question Navigator, Right = Active Question & Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Question Navigator */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-3">
              Question Navigator ({questions.length})
            </h3>
            <div className="space-y-1.5">
              {questions.map((q, idx) => {
                const isActive = currentIndex === idx;
                const isAnswered = q.is_answered;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white font-bold shadow-sm'
                        : isAnswered
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-surface text-secondary hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>Q{idx + 1}.</span>
                      <span className="truncate">{q.question_text}</span>
                    </div>
                    {isAnswered ? (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {q.score != null ? `${q.score}%` : '✓'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted">•</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Question Content, Response Area & AI Evaluation */}
        <div className="lg:col-span-3 space-y-6">
          {activeQ && (
            <div className="card p-6">
              {/* Question Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="badge badge-brand capitalize">
                  {activeQ.question_type || 'Interview Question'}
                </span>
                <span className="text-xs text-muted">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-bold text-primary mb-4 leading-relaxed">
                {activeQ.question_text}
              </h2>

              {/* Rubric hints if present */}
              {activeQ.rubric && Object.keys(activeQ.rubric).length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-border text-xs mb-6 text-slate-300">
                  <span className="font-semibold text-brand-300 block mb-1">
                    Evaluation Criteria (What the AI looks for):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted">
                    {Object.entries(activeQ.rubric).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-200 capitalize font-medium">{k}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Input or Static Display if already completed */}
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label" htmlFor="user-answer" style={{ margin: 0 }}>
                      Your Answer (Type or outline your response):
                    </label>
                    <span className="text-[11px] text-muted">
                      Use the STAR method for best scores
                    </span>
                  </div>
                  <textarea
                    id="user-answer"
                    rows={6}
                    className="form-control text-sm"
                    placeholder="Structure your answer with context, specific steps taken, tools utilized, and quantified outcome..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectQuestion(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="btn btn-outline btn-sm"
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    <span>Previous</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner spinner-sm mr-1.5" />
                          Evaluating Answer...
                        </>
                      ) : (
                        <>
                          <Send size={14} className="mr-1.5" />
                          <span>{activeQ.is_answered ? 'Re-evaluate Answer' : 'Submit & Score'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                      disabled={currentIndex === questions.length - 1}
                      className="btn btn-outline btn-sm"
                    >
                      <span>Next</span>
                      <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              </form>

              {/* AI Feedback & Model Answer Card */}
              {activeQ.is_answered && (
                <div className="mt-8 pt-6 border-t border-border space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base flex items-center gap-2 text-primary">
                      <Sparkles size={18} className="text-brand-400" />
                      <span>AI Coaching Feedback</span>
                    </h3>
                    <div className="badge badge-accent text-sm font-bold">
                      Score: {activeQ.score || 0}%
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div className="p-4 rounded-xl bg-surface border border-border text-xs text-slate-300 leading-relaxed">
                    <p className="whitespace-pre-line">{activeQ.feedback}</p>
                  </div>

                  {/* Improved Model Answer */}
                  {activeQ.improved_answer && (
                    <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 text-xs">
                      <div className="font-bold text-brand-300 mb-1 flex items-center gap-1.5">
                        <Award size={15} />
                        <span>Exemplary Model Response:</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-line mt-2">
                        {activeQ.improved_answer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
