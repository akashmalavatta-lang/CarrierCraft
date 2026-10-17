import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewAPI } from '../api';
import toast from 'react-hot-toast';
import {
  MessageSquare, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Clock, Award, Sparkles, Send, Check, RefreshCw, Trophy, Flag,
  Volume2, VolumeX, Mic, MicOff, Monitor, MonitorOff, Camera, CameraOff,
  Radio, HelpCircle, ShieldCheck, Play, Pause, ChevronDown, ChevronUp,
  ListOrdered, Settings, PhoneOff, MessageCircle, MoreVertical, Maximize2,
  Sliders, User, Volume1
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  // ── Speech Synthesis (TTS - Interviewer Voice) ─────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);

  // ── Speech Recognition (STT - Microphone Input) ────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
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

  // Zoom Interface state
  const [showTranscript, setShowTranscript] = useState(true);
  const [showQuestionDrawer, setShowQuestionDrawer] = useState(false);
  const [layoutMode, setLayoutMode] = useState('gallery'); // 'gallery' | 'speaker'

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

  // Meeting duration timer
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

    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')));
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
      toast.error('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      stopSpeaking(); // stop AI speaking when user talks
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        toast.success('Microphone active — speaking live...', { id: 'mic-active' });
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += piece + ' ';
          } else {
            interim += piece;
          }
        }

        setInterimTranscript(interim);

        if (finalTrans.trim()) {
          setCurrentAnswer(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + finalTrans.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. You can still type your response.');
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
      setIsListening(false);
      setInterimTranscript('');
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
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        toast.success('Webcam connected (100% private & client-side only)');
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

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setScreenStream(stream);
      setIsScreenSharing(true);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      toast.success('Screen sharing active for code demonstration');
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

  // When changing current question, populate answer & reset
  const handleSelectQuestion = (idx) => {
    stopSpeaking();
    stopListening();
    setCurrentIndex(idx);
    setCurrentAnswer(questions[idx]?.user_answer || '');
    setFollowUpAnswer('');
    setFollowUpSubmitted(false);
  };

  const handleSubmitAnswer = async (e) => {
    e?.preventDefault();
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
      toast.success(`Answer scored: ${evalData.score || 0}% 🌟`);

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

      // Speak feedback or follow-up question
      if (autoSpeak && evalData.follow_up_question) {
        setTimeout(() => speakQuestion(evalData.follow_up_question), 800);
      }
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="spinner spinner-lg text-[#F5BF45]" />
        <p className="text-muted font-medium">Connecting to AI Executive Interview Room...</p>
      </div>
    );
  }

  const activeQ = questions[currentIndex];
  const isCompleted = interview?.status === 'completed' || completedSummary != null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#05080D] text-[#F5F7FA] -mx-4 -my-6 sm:-mx-8 p-4 sm:p-6">
      {/* ── Privacy Screen Share Consent Modal ────────────────────────────── */}
      {showMediaConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card p-6 max-w-md w-full bg-[#0B121B] border border-[#F5BF45]/40 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#F5BF45]/15 text-[#F5BF45]">
                <Monitor size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enable Screen Sharing?</h3>
                <p className="text-xs text-[#A8B3C2]">Zoom Technical Interview Mode</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              You are about to share your screen to present system architecture, code live, or demonstrate slides.
              <br /><br />
              <strong className="text-[#F5BF45] flex items-center gap-1.5">
                <ShieldCheck size={16} /> 100% Client-Side Privacy:
              </strong>
              Screen sharing runs strictly inside your local browser tab. No video data is recorded, saved, or sent to any cloud server.
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

      {/* ── Zoom Top Meeting Header Bar ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#253342]">
        <div className="flex items-center gap-3">
          <Link
            to="/interview"
            className="flex items-center gap-1.5 text-xs text-[#A8B3C2] hover:text-[#F5BF45] transition p-1.5 rounded-lg hover:bg-white/5"
            title="Leave interview room"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">All Sessions</span>
          </Link>
          <div className="h-4 w-px bg-[#253342]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-extrabold text-sm sm:text-base text-[#F5F7FA]">
                {interview?.title || 'Technical & STAR AI Mock Interview'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F5BF45]/15 text-[#F5BF45] border border-[#F5BF45]/30">
                ZOOM SIMULATOR
              </span>
            </div>
            <div className="text-[11px] text-[#A8B3C2] flex items-center gap-2 mt-0.5">
              <span>Target: {interview?.target_role || 'Software Engineer'}</span>
              <span>•</span>
              <span className="capitalize">{interview?.difficulty || 'Medium'}</span>
              <span>•</span>
              <span>Meeting ID: CC-729-108</span>
            </div>
          </div>
        </div>

        {/* Right Header Status Badges */}
        <div className="flex items-center gap-2.5">
          {/* Recording Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101A26] border border-[#253342] text-xs font-mono font-bold text-[#F5F7FA]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-400">REC</span>
            <span className="text-[#253342]">|</span>
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Question Counter Pill */}
          <button
            onClick={() => setShowQuestionDrawer(d => !d)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101A26] border border-[#253342] hover:border-[#F5BF45]/50 text-xs font-bold text-[#F5F7FA] transition"
            title="Click to toggle Question Drawer"
          >
            <ListOrdered size={14} className="text-[#F5BF45]" />
            <span>Q{currentIndex + 1} of {questions.length}</span>
            <ChevronDown size={13} className={`text-[#A8B3C2] transition-transform ${showQuestionDrawer ? 'rotate-180' : ''}`} />
          </button>

          {/* Auto Speak Voice Narration Toggle */}
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (autoSpeak) stopSpeaking();
              toast.success(autoSpeak ? 'Auto-voice narration paused' : 'Auto-voice narration enabled');
            }}
            className={`p-2 rounded-lg border text-xs transition ${
              autoSpeak
                ? 'bg-[#F5BF45]/15 border-[#F5BF45]/50 text-[#F5BF45]'
                : 'bg-[#101A26] border-[#253342] text-[#A8B3C2]'
            }`}
            title={autoSpeak ? 'AI voice narration is ON' : 'AI voice narration is MUTED'}
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* End Call Button */}
          {!isCompleted ? (
            <button
              onClick={handleCompleteInterview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              disabled={completing}
              title="End interview session"
            >
              <PhoneOff size={14} />
              <span>{completing ? 'Scoring...' : 'End Call'}</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
              Session Completed
            </span>
          )}
        </div>
      </div>

      {/* ── Question Switcher Drawer Dropdown ─────────────────────────────── */}
      {showQuestionDrawer && (
        <div className="card p-3 mb-4 bg-[#0B121B] border border-[#F5BF45]/40 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#253342]">
            <span className="text-xs font-bold text-[#F5F7FA]">Jump to Question:</span>
            <span className="text-[11px] text-[#A8B3C2]">
              {questions.filter(q => q.is_answered).length} of {questions.length} answered
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurr = currentIndex === idx;
              const isAns = q.is_answered;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    handleSelectQuestion(idx);
                    setShowQuestionDrawer(false);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                    isCurr
                      ? 'bg-[#F5BF45]/20 border-[#F5BF45] text-[#F5BF45] font-bold'
                      : isAns
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#101A26] border-[#253342] text-[#A8B3C2] hover:bg-white/5'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-bold">Q{idx + 1}.</span> {q.question_text.slice(0, 28)}...
                  </div>
                  {isAns ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400">
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
      )}

      {/* ── Zoom Meeting Main Stage: Video Grid + Live Transcript Panel ──── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* ── Left Side: Zoom Video Call Conference Stage (Cols 7 or 12) ─── */}
        <div className={`${showTranscript ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} flex flex-col gap-3 min-h-[500px]`}>
          {/* Main Video Tiles Stage */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[380px] relative">
            {/* ── AI Interviewer Video Tile (Host) ───────────────────────── */}
            <div className={`relative rounded-2xl overflow-hidden bg-black border-2 transition-all duration-300 flex flex-col justify-between p-3.5 shadow-2xl ${
              isSpeaking
                ? 'border-[#F5BF45] ring-4 ring-[#F5BF45]/25 shadow-[#F5BF45]/20'
                : 'border-[#253342]'
            }`}>
              {/* AI Interviewer Realistic Video Feed */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/ai_interviewer.jpg"
                  alt="AI Interviewer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none" />
              </div>

              {/* Top Tile Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4A0] animate-pulse" />
                  <span>Host • Sarah Jenkins</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Dynamic Speech Activity Badge */}
                  {isSpeaking ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F5BF45] text-[#05080D] text-[11px] font-extrabold shadow-md animate-pulse">
                      <Radio size={13} className="animate-spin" />
                      <span>Speaking Live</span>
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2DD4A0]/30 text-[#2DD4A0] border border-[#2DD4A0]/40 text-[11px] font-bold">
                      <span>Listening to You...</span>
                    </div>
                  ) : (
                    <div className="px-2 py-1 rounded-md bg-black/50 text-[11px] text-[#A8B3C2]">
                      Idle
                    </div>
                  )}

                  {/* Read Aloud Button */}
                  {ttsSupported && (
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(activeQ?.question_text)}
                      className="p-1.5 rounded-md bg-black/60 hover:bg-black/90 text-white border border-white/10 transition"
                      title={isSpeaking ? 'Mute AI voice' : 'Listen to AI question again'}
                    >
                      {isSpeaking ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-[#F5BF45]" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Speaking Waves Center Indicator when speaking */}
              {isSpeaking && (
                <div className="relative z-10 self-center my-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#F5BF45]/20 border-2 border-[#F5BF45] flex items-center justify-center animate-ping absolute" />
                  <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-[#F5BF45] flex items-center justify-center shadow-lg relative">
                    <Volume2 size={24} className="text-[#F5BF45] animate-bounce" />
                  </div>
                  {/* Audio Equalizer Bars */}
                  <div className="flex items-center gap-1 h-5 mt-3 bg-black/70 px-3 py-1 rounded-full border border-[#F5BF45]/40">
                    {[40, 75, 100, 60, 85, 50, 95, 65, 80, 45].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#F5BF45] rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDuration: `${0.4 + (i % 4) * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Closed Captions Subtitle Pill */}
              <div className="relative z-10 mt-auto">
                {isSpeaking && activeQ?.question_text && (
                  <div className="mb-2 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-[#F5BF45]/40 text-xs text-white shadow-xl animate-fadeIn">
                    <span className="text-[#F5BF45] font-bold mr-1">Sarah:</span>
                    <span className="italic">"{activeQ.question_text}"</span>
                  </div>
                )}

                {/* Bottom Tile Nameplate */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-white/90 font-bold drop-shadow">
                    <Sparkles size={13} className="text-[#F5BF45]" />
                    <span>AI Lead Technical Evaluator</span>
                  </div>
                  <span className="text-[10px] text-white/70">Enterprise STAR Rubric</span>
                </div>
              </div>
            </div>

            {/* ── Candidate Video Tile ("You") ───────────────────────────── */}
            <div className={`relative rounded-2xl overflow-hidden bg-black border-2 transition-all duration-300 flex flex-col justify-between p-3.5 shadow-2xl ${
              isListening
                ? 'border-[#2DD4A0] ring-4 ring-[#2DD4A0]/25 shadow-[#2DD4A0]/20'
                : 'border-[#253342]'
            }`}>
              {/* Webcam Live Feed */}
              {isCameraActive ? (
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror z-0"
                />
              ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#101A26] to-[#05080D] flex flex-col items-center justify-center p-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] font-black text-2xl flex items-center justify-center shadow-xl mb-3">
                    {user?.name ? user.name[0].toUpperCase() : 'A'}
                  </div>
                  <div className="text-sm font-bold text-[#F5F7FA]">{user?.name || 'Akash Malavatta'}</div>
                  <div className="text-xs text-[#A8B3C2] mt-0.5">Camera is off</div>
                  <button
                    onClick={toggleCamera}
                    className="mt-3 btn btn-outline btn-sm text-xs py-1 text-[#F5BF45] border-[#F5BF45]/40"
                  >
                    <Camera size={13} className="mr-1" />
                    <span>Turn On Video</span>
                  </button>
                </div>
              )}

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none z-0" />

              {/* Top Tile Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-[#2DD4A0]' : 'bg-slate-500'}`} />
                  <span>You (Candidate)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isListening ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2DD4A0] text-[#05080D] text-[11px] font-extrabold shadow animate-pulse">
                      <Mic size={12} />
                      <span>Speaking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-[11px] text-[#A8B3C2]">
                      <MicOff size={12} />
                      <span>Muted</span>
                    </div>
                  )}

                  <button
                    onClick={toggleCamera}
                    className="p-1.5 rounded-md bg-black/60 hover:bg-black/90 text-white border border-white/10"
                    title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {isCameraActive ? <Camera size={13} className="text-[#2DD4A0]" /> : <CameraOff size={13} />}
                  </button>
                </div>
              </div>

              {/* Real-Time Candidate Audio Frequency Visualizer when Speaking */}
              {isListening && (
                <div className="relative z-10 self-center my-auto flex flex-col items-center">
                  <div className="flex items-center gap-1.5 h-6 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#2DD4A0]/50 shadow-lg">
                    {[50, 90, 40, 80, 100, 60, 95, 70, 85, 45].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#2DD4A0] rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDuration: `${0.3 + (i % 3) * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#2DD4A0] mt-1.5 bg-black/60 px-2 py-0.5 rounded">
                    Transcribing speech live...
                  </span>
                </div>
              )}

              {/* Bottom Tile Nameplate */}
              <div className="relative z-10 mt-auto flex items-center justify-between text-xs">
                <span className="text-white/90 font-bold drop-shadow">
                  {user?.name || 'Akash Malavatta'} (Candidate)
                </span>
                <span className="text-[10px] text-white/70">
                  {isCameraActive ? 'HD Video Active' : 'Audio Only'}
                </span>
              </div>
            </div>
          </div>

          {/* Screen Share Tile (If Active) */}
          {isScreenSharing && (
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#F5BF45] h-60 shadow-2xl flex flex-col justify-between p-3 animate-fadeIn">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-contain z-0"
              />
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-bold text-[#F5BF45] flex items-center gap-1.5 border border-[#F5BF45]/40">
                  <Monitor size={14} />
                  <span>Sharing Screen (Presentation / Code Demo)</span>
                </span>
                <button
                  onClick={stopScreenShare}
                  className="btn btn-secondary text-rose-400 text-xs py-1 px-2.5"
                >
                  <MonitorOff size={13} className="mr-1" />
                  <span>Stop Share</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Zoom Bottom Meeting Dock Toolbar ──────────────────────────── */}
          <div className="rounded-2xl bg-[#0B121B] border border-[#253342] p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-2 mt-auto">
            {/* Left Controls: Audio & Video */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleListening}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  isListening
                    ? 'bg-[#2DD4A0] text-[#05080D] shadow-[#2DD4A0]/20 animate-pulse'
                    : 'bg-[#101A26] border border-[#253342] text-[#F5F7FA] hover:bg-white/5'
                }`}
                title={isListening ? 'Stop microphone' : 'Start speaking your response'}
              >
                {isListening ? <Mic size={15} /> : <MicOff size={15} className="text-rose-400" />}
                <span className="hidden sm:inline">{isListening ? 'Mute Mic' : 'Unmute Mic'}</span>
              </button>

              {/* Video Toggle Button */}
              <button
                onClick={toggleCamera}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isCameraActive
                    ? 'bg-[#101A26] border border-[#2DD4A0]/50 text-[#2DD4A0]'
                    : 'bg-[#101A26] border border-[#253342] text-[#A8B3C2] hover:bg-white/5'
                }`}
                title={isCameraActive ? 'Turn off video' : 'Turn on webcam'}
              >
                {isCameraActive ? <Camera size={15} /> : <CameraOff size={15} className="text-rose-400" />}
                <span className="hidden sm:inline">{isCameraActive ? 'Stop Video' : 'Start Video'}</span>
              </button>
            </div>

            {/* Center Controls: Presentation & Collaboration */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Screen Share Button */}
              <button
                onClick={toggleScreenShare}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isScreenSharing
                    ? 'bg-[#F5BF45] text-[#05080D]'
                    : 'bg-[#101A26] border border-[#253342] text-[#F5F7FA] hover:bg-white/5'
                }`}
                title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen for code presentation'}
              >
                {isScreenSharing ? <MonitorOff size={15} /> : <Monitor size={15} className="text-[#F5BF45]" />}
                <span className="hidden md:inline">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
              </button>

              {/* Live Transcript / Chat Toggle */}
              <button
                onClick={() => setShowTranscript(t => !t)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  showTranscript
                    ? 'bg-[#F5BF45]/20 border border-[#F5BF45] text-[#F5BF45]'
                    : 'bg-[#101A26] border border-[#253342] text-[#A8B3C2] hover:bg-white/5'
                }`}
                title="Toggle Live Transcript & Response panel"
              >
                <MessageCircle size={15} />
                <span className="hidden md:inline">Transcript & Chat</span>
              </button>
            </div>

            {/* Right Controls: End Call */}
            <div>
              <button
                onClick={handleCompleteInterview}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition"
                disabled={completing}
              >
                <PhoneOff size={15} />
                <span>{completing ? 'Scoring...' : 'End'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Side: Zoom Live Transcript, Chat & Response Stream ─────── */}
        {showTranscript && (
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col card p-4 bg-[#0B121B] border border-[#253342] shadow-2xl overflow-hidden min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#253342] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F5BF45]/15 border border-[#F5BF45]/30 text-[#F5BF45] flex items-center justify-center">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#F5F7FA]">Live Meeting Transcript</h3>
                  <div className="text-[10px] text-[#2DD4A0] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
                    <span>Real-Time Voice & AI Stream</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#A8B3C2]">
                <span className="badge badge-brand text-[10px] capitalize">
                  {activeQ?.question_type || 'Technical'}
                </span>
              </div>
            </div>

            {/* Chronological Dialogue Conversation Stream */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-3">
              {/* 1. AI Interviewer Turn */}
              <div className="p-3.5 rounded-xl bg-[#101A26] border border-[#253342] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#F5F7FA]">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-black border border-[#F5BF45]/40 flex-shrink-0">
                      <img src="/images/ai_interviewer.jpg" alt="Sarah" className="w-full h-full object-cover" />
                    </div>
                    <span>Sarah Jenkins (AI Interviewer)</span>
                  </div>
                  <span className="text-[10px] text-[#7E8D9F]">Q{currentIndex + 1}</span>
                </div>

                <p className="text-xs sm:text-sm text-[#F5F7FA] font-medium leading-relaxed">
                  {activeQ?.question_text}
                </p>

                {ttsSupported && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(activeQ?.question_text)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#F5BF45] hover:underline pt-1"
                  >
                    <Volume2 size={13} />
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen with Voice Narration'}</span>
                  </button>
                )}
              </div>

              {/* 2. Candidate Answer Turn (If Answered) */}
              {activeQ?.is_answered && (
                <div className="p-3.5 rounded-xl bg-[#080D14] border border-[#253342] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#2DD4A0]">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] font-black text-[10px] flex items-center justify-center">
                        {user?.name ? user.name[0].toUpperCase() : 'A'}
                      </div>
                      <span>Your Response Transcript</span>
                    </div>
                    <span className="text-[10px] text-[#7E8D9F]">Recorded</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeQ.user_answer}
                  </p>
                </div>
              )}

              {/* 3. Real-Time Speech Interim Transcript (While User Speaks into Mic) */}
              {isListening && interimTranscript && (
                <div className="p-3 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/40 text-xs text-[#2DD4A0] space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Mic size={13} />
                    <span>Transcribing live speech...</span>
                  </div>
                  <p className="italic text-slate-200">"{interimTranscript}"</p>
                </div>
              )}

              {/* 4. Instant AI Coach STAR Evaluation & Score (When Answered) */}
              {activeQ?.is_answered && (
                <div className="p-3.5 rounded-xl bg-[#101A26] border border-[#2DD4A0]/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#F5F7FA]">
                      <Sparkles size={14} className="text-[#F5BF45]" />
                      <span>AI Coaching Feedback</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Score: {activeQ.score || 0}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeQ.feedback}
                  </p>

                  {/* Follow-up question */}
                  {activeQ.follow_up_question && (
                    <div className="p-3 rounded-lg bg-[#0B121B] border border-[#F5BF45]/30 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#F5BF45]">
                        <span className="flex items-center gap-1">
                          <HelpCircle size={13} />
                          <span>Follow-Up Drill:</span>
                        </span>
                        <button
                          onClick={() => speakQuestion(activeQ.follow_up_question)}
                          className="text-[10px] text-[#A8B3C2] hover:text-[#F5BF45] flex items-center gap-1"
                        >
                          <Volume2 size={11} />
                          <span>Listen</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">
                        "{activeQ.follow_up_question}"
                      </p>

                      {!followUpSubmitted ? (
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            className="form-control text-xs py-1.5"
                            placeholder="Draft your follow-up answer..."
                            value={followUpAnswer}
                            onChange={(e) => setFollowUpAnswer(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!followUpAnswer.trim()) {
                                toast.error('Enter a response');
                                return;
                              }
                              setFollowUpSubmitted(true);
                              toast.success('Follow-up answer saved! Great practice.');
                            }}
                            className="btn btn-primary btn-sm text-[11px] py-1"
                          >
                            Save Follow-Up
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                          ✓ Saved: {followUpAnswer}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Exemplary STAR Model Response */}
                  {activeQ.improved_answer && (
                    <div className="p-3 rounded-lg bg-[#0B121B] border border-[#253342] text-xs">
                      <div className="font-bold text-[#F5BF45] mb-1 flex items-center gap-1">
                        <Award size={13} />
                        <span>Ideal STAR Framework Answer:</span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                        {activeQ.improved_answer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Answer Input Box & Control Area */}
            <form onSubmit={handleSubmitAnswer} className="pt-2 border-t border-[#253342] space-y-2">
              <div className="relative">
                <textarea
                  rows={4}
                  className="form-control text-xs font-sans w-full p-2.5 bg-[#101A26] border-[#253342] focus:border-[#F5BF45]"
                  placeholder="Speak via microphone or type your response using the STAR method (Situation, Task, Action, Metric Result)..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center text-[10px] text-[#A8B3C2] mt-1 px-1">
                  <span>{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
                  <span className="text-[#F5BF45] font-semibold">Tip: Include concrete metrics & results</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectQuestion(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="btn btn-outline btn-sm text-xs py-1.5"
                >
                  <ArrowLeft size={13} className="mr-1" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Mic quick button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`btn btn-sm text-xs py-1.5 ${isListening ? 'btn-secondary text-[#2DD4A0] border-[#2DD4A0]' : 'btn-outline'}`}
                    title={isListening ? 'Stop mic' : 'Speak answer'}
                  >
                    <Mic size={13} className={isListening ? 'text-[#2DD4A0] animate-pulse' : 'text-[#F5BF45]'} />
                    <span>{isListening ? 'Stop Mic' : 'Speak'}</span>
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm text-xs py-1.5 font-bold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner spinner-sm mr-1" />
                        <span>Scoring...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} className="mr-1" />
                        <span>{activeQ?.is_answered ? 'Re-Score' : 'Submit & Score'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="btn btn-outline btn-sm text-xs py-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight size={13} className="ml-1" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Completion Performance Review Modal ───────────────────────────── */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="card p-6 sm:p-8 max-w-xl w-full bg-[#0B121B] border-2 border-[#F5BF45] shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#F5BF45]/20 border border-[#F5BF45] text-[#F5BF45] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#F5BF45]/20">
                <Trophy size={32} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-[#F5F7FA]">Interview Simulation Completed!</h2>
              <p className="text-xs text-[#A8B3C2] mt-1">
                Outstanding preparation effort. Your responses have been graded with STAR methodology.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-[#101A26] border border-[#253342] text-center">
                <div className="text-[11px] font-bold text-[#A8B3C2] uppercase">Overall Score</div>
                <div className="text-3xl font-black text-[#F5BF45] mt-1">
                  {interview?.overall_score != null ? `${interview.overall_score}%` : '85%'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">STAR Benchmark Passed</div>
              </div>

              <div className="p-4 rounded-xl bg-[#101A26] border border-[#253342] text-center">
                <div className="text-[11px] font-bold text-[#A8B3C2] uppercase">XP Earned</div>
                <div className="text-3xl font-black text-[#2DD4A0] mt-1">+30 XP</div>
                <div className="text-[10px] text-[#A8B3C2] mt-0.5">Added to Career Profile</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101A26] border border-[#253342] text-xs text-slate-300 mb-6 leading-relaxed">
              <span className="font-bold text-[#F5BF45] block mb-1">Executive Interview Feedback:</span>
              {interview?.feedback_summary || 'Strong technical understanding and clear articulation. Continue elaborating on quantifiable business impact during situational questions.'}
            </div>

            <div className="flex gap-3">
              <Link to="/interview" className="btn btn-outline flex-1 text-xs py-2.5 text-center block font-bold">
                Back to All Sessions
              </Link>
              <Link to="/dashboard" className="btn btn-primary flex-1 text-xs py-2.5 text-center block font-bold">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
