import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewAPI } from '../api';
import toast from 'react-hot-toast';
import {
  MessageSquare, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Clock, Award, Sparkles, Send, Check, RefreshCw, Trophy, Flag,
  Volume2, VolumeX, Mic, MicOff, Monitor, MonitorOff, Camera, CameraOff,
  Radio, HelpCircle, ShieldCheck, Play, Pause, ChevronDown, ChevronUp
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

  // Follow-up interaction
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  // ── Speech Synthesis (TTS - Interviewer Voice) ─────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);

  // ── Speech Recognition (STT - Microphone Input) ────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const recognitionRef = useRef(null);

  // ── Media Streams (Camera & Screen Share) ──────────────────────────────────
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const cameraVideoRef = useRef(null);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const screenVideoRef = useRef(null);
  const [showMediaConsent, setShowMediaConsent] = useState(false);

  // Check Web Speech API Support on Mount
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setTtsSupported(false);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttSupported(false);
    }
  }, []);

  // Fetch session data
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

  // Cleanup all media streams and speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream, screenStream]);

  // Read question whenever question index changes (if autoSpeak is enabled)
  useEffect(() => {
    if (autoSpeak && questions[currentIndex]?.question_text && !loading) {
      speakQuestion(questions[currentIndex].question_text);
    }
  }, [currentIndex, loading, autoSpeak]);

  // ── Text-to-Speech Functionality ───────────────────────────────────────────
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // ── Speech-to-Text Functionality ───────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      stopSpeaking(); // stop AI speaking when user wants to talk
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Microphone active — start speaking your response', { id: 'mic-active' });
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setCurrentAnswer(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. You can still type your response manually.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  // ── Camera Practice Mode ───────────────────────────────────────────────────
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      setCameraStream(null);
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        toast.success('Camera preview active (100% private & client-side only)');
      } catch (err) {
        toast.error('Could not access camera. Please allow webcam permissions.');
      }
    }
  };

  // ── Screen Sharing (Consent-based) ─────────────────────────────────────────
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      setShowMediaConsent(true);
    }
  };

  const confirmStartScreenShare = async () => {
    setShowMediaConsent(false);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      // Handle user stopping share from browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setScreenStream(stream);
      setIsScreenSharing(true);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      toast.success('Screen sharing active for mock interview demonstration');
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        toast.error('Failed to initiate screen share: ' + err.message);
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
    toast('Screen sharing stopped', { icon: '⏹️' });
  };

  // Attach streams to video elements when toggled
  useEffect(() => {
    if (isCameraActive && cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  useEffect(() => {
    if (isScreenSharing && screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [isScreenSharing, screenStream]);

  // When changing current question, populate answer & reset timers
  const handleSelectQuestion = (idx) => {
    stopSpeaking();
    stopListening();
    setCurrentIndex(idx);
    setCurrentAnswer(questions[idx]?.user_answer || '');
    setTimerSeconds(0);
    setFollowUpAnswer('');
    setFollowUpSubmitted(false);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    stopListening();

    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer (speak or type) before submitting');
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

      const evalData = res.data.evaluation || {};
      toast.success(`Answer scored: ${evalData.score || 0}%`);

      // Update question in local state
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        user_answer: currentAnswer.trim(),
        is_answered: true,
        score: evalData.score,
        feedback: evalData.feedback,
        improved_answer: evalData.improved_answer,
        follow_up_question: evalData.follow_up_question,
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
    stopSpeaking();
    stopListening();
    const unanswered = questions.filter(q => !q.is_answered).length;
    if (unanswered > 0) {
      if (!window.confirm(`You still have ${unanswered} unanswered question(s). Finish interview session anyway?`)) {
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
        <p className="text-muted font-medium">Entering CareerCraft simulation chamber...</p>
      </div>
    );
  }

  const activeQ = questions[currentIndex];
  const isCompleted = interview?.status === 'completed' || completedSummary != null;

  return (
    <div className="page-container pb-16">
      {/* Consent Modal for Screen Sharing */}
      {showMediaConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card p-6 max-w-md w-full bg-slate-900 border border-brand-500/40 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400">
                <Monitor size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enable Screen Sharing?</h3>
                <p className="text-xs text-slate-400">Mock Interview Practice Mode</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              You are about to share your screen to practice code presentations or architecture diagrams.
              <br /><br />
              <strong className="text-brand-300 flex items-center gap-1.5">
                <ShieldCheck size={16} /> 100% Client-Side Privacy:
              </strong>
              Screen sharing runs strictly inside your local browser tab. No video or screen data is ever recorded, stored, or transmitted to any server.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowMediaConsent(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={confirmStartScreenShare}
              >
                Allow Screen Share
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Action Controls: Voice, Camera, Screen Share & Finish */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active timer */}
          {!isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono">
              <Clock size={14} className="text-brand-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          )}

          {/* Camera Practice Toggle */}
          <button
            onClick={toggleCamera}
            className={`btn btn-sm ${isCameraActive ? 'btn-primary' : 'btn-outline'}`}
            title={isCameraActive ? 'Turn off camera' : 'Turn on webcam self-practice preview'}
          >
            {isCameraActive ? <Camera size={14} className="mr-1.5 text-cyan-300" /> : <CameraOff size={14} className="mr-1.5" />}
            <span className="hidden sm:inline">{isCameraActive ? 'Camera On' : 'Practice Camera'}</span>
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={toggleScreenShare}
            className={`btn btn-sm ${isScreenSharing ? 'btn-orange' : 'btn-outline'}`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen to demonstrate code or slides'}
          >
            {isScreenSharing ? <MonitorOff size={14} className="mr-1.5 text-amber-200" /> : <Monitor size={14} className="mr-1.5" />}
            <span className="hidden sm:inline">{isScreenSharing ? 'Stop Screen' : 'Share Screen'}</span>
          </button>

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

      {/* Floating / Picture-in-Picture Preview Panel for Camera & Screen Share */}
      {(isCameraActive || isScreenSharing) && (
        <div className="mb-6 p-4 rounded-2xl bg-surface border border-border shadow-xl flex flex-wrap gap-4 items-center justify-start animate-fadeIn">
          {isCameraActive && (
            <div className="relative rounded-xl overflow-hidden border-2 border-brand-500/40 bg-black w-60 h-44 shadow-lg">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Webcam Practice</span>
              </div>
              <button
                onClick={toggleCamera}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/90 text-white"
                title="Close camera"
              >
                <CameraOff size={12} />
              </button>
            </div>
          )}

          {isScreenSharing && (
            <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/40 bg-black w-72 h-44 shadow-lg">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Sharing Screen</span>
              </div>
              <button
                onClick={stopScreenShare}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/90 text-white"
                title="Stop sharing"
              >
                <MonitorOff size={12} />
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400 max-w-sm">
            <span className="font-semibold text-slate-200 block mb-0.5">Live Practice Feeds Active</span>
            Check your facial framing, eye contact, and screen slides while answering.
            Nothing leaves your computer.
          </div>
        </div>
      )}

      {/* Completion Summary Card */}
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
                {interview?.feedback_summary || 'Your answers have been graded against standard STAR rubric criteria.'}
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
          <div className="card p-4 sticky top-24">
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
                        ? 'bg-brand-500 text-white font-bold shadow-md ring-1 ring-cyan-400'
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

            {/* Voice Settings box */}
            <div className="mt-6 pt-4 border-t border-border">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Auto-read questions (TTS)</span>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-400"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Question Content, Response Area & AI Evaluation */}
        <div className="lg:col-span-3 space-y-6">
          {activeQ && (
            <div className="card p-6">
              {/* Question Header & TTS Voice Control */}
              <div className="flex justify-between items-center mb-4">
                <span className="badge badge-brand capitalize">
                  {activeQ.question_type || 'Interview Question'}
                </span>

                <div className="flex items-center gap-2">
                  {ttsSupported && (
                    <button
                      type="button"
                      onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(activeQ.question_text)}
                      className={`btn btn-sm ${isSpeaking ? 'btn-primary' : 'btn-outline'}`}
                      title={isSpeaking ? 'Mute AI interviewer' : 'Read question aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX size={14} className="mr-1" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} className="mr-1" />
                          <span>Listen (TTS)</span>
                        </>
                      )}
                    </button>
                  )}
                  <span className="text-xs text-muted ml-2">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>

              {/* Question Text with Live Audio Animation */}
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-primary leading-relaxed pr-8">
                  {activeQ.question_text}
                </h2>
                {isSpeaking && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-cyan-400 animate-pulse">
                    <Radio size={14} className="animate-spin" />
                    <span>AI Interviewer is speaking...</span>
                  </div>
                )}
              </div>

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

              {/* Answer Input: Speech-to-Text & Typed Response */}
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-sm flex items-center gap-2" htmlFor="user-answer" style={{ margin: 0 }}>
                      <span>Your Response:</span>
                      {isListening && (
                        <span className="badge badge-accent bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] animate-pulse">
                          🔴 Transcribing Speech Live...
                        </span>
                      )}
                    </label>

                    {/* Microphone Speech Recognition Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`btn btn-sm ${isListening ? 'btn-orange animate-pulse' : 'btn-outline'}`}
                      title={isListening ? 'Stop recording voice' : 'Start speaking your answer'}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={14} className="mr-1.5" />
                          <span>Stop Mic</span>
                        </>
                      ) : (
                        <>
                          <Mic size={14} className="mr-1.5 text-cyan-400" />
                          <span>Speech-to-Text (Mic)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id="user-answer"
                    rows={6}
                    className="form-control text-sm font-sans"
                    placeholder="Speak using the microphone button or type your structured response (Situation, Task, Action, Metric Result)..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex justify-between text-[11px] text-muted mt-1 px-1">
                    <span>{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
                    <span>Use the STAR method (Situation, Task, Action, Result) for highest scores</span>
                  </div>
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

              {/* AI Feedback, STAR Breakdown & Follow-Up Question Card */}
              {activeQ.is_answered && (
                <div className="mt-8 pt-6 border-t border-border space-y-5 animate-fadeIn">
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

                  {/* Follow-up Question from AI Interviewer */}
                  {activeQ.follow_up_question && (
                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <HelpCircle size={15} />
                          <span>Follow-Up Challenge Question:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakQuestion(activeQ.follow_up_question)}
                          className="btn btn-ghost btn-sm text-[11px] py-0.5 px-2 text-cyan-300"
                        >
                          <Volume2 size={12} className="mr-1" />
                          <span>Listen</span>
                        </button>
                      </div>
                      <p className="text-slate-200 font-medium text-sm">
                        "{activeQ.follow_up_question}"
                      </p>

                      {/* Optional Follow-up answer box */}
                      <div className="pt-2">
                        {!followUpSubmitted ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              className="form-control text-xs"
                              placeholder="Draft your follow-up answer here to reinforce your mastery..."
                              value={followUpAnswer}
                              onChange={(e) => setFollowUpAnswer(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!followUpAnswer.trim()) {
                                  toast.error('Write a brief follow-up response');
                                  return;
                                }
                                setFollowUpSubmitted(true);
                                toast.success('Follow-up recorded! Great quick-thinking practice.');
                              }}
                              className="btn btn-primary btn-sm text-xs"
                            >
                              Save Follow-Up Answer
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            <strong>Your Follow-Up Response:</strong> {followUpAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Improved Model Answer */}
                  {activeQ.improved_answer && (
                    <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 text-xs">
                      <div className="font-bold text-brand-300 mb-1 flex items-center gap-1.5">
                        <Award size={15} />
                        <span>Exemplary STAR Model Response:</span>
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
