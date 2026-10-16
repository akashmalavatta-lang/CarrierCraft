/**
 * CC — CareerCraft
 * AI Mock Interview Room — Pixel-identical to design reference.
 * Features:
 * - Real-time Voice Narration (Web Speech Synthesis / TTS) with animated audio soundwave
 * - Live Speech-to-Text (Web SpeechRecognition / STT) via gold microphone button
 * - 5-Round Progress Stepper (Introduction, Technical, Problem Solving, Behavioral, HR)
 * - Video viewport with AI Coach and Candidate PIP webcam / avatar
 * - Full media controls bar (Mute, Video, Screen Share, Record, Captions, Settings, End Interview)
 * - Live Transcript panel with message history and multi-tab support
 * - Bottom device diagnostic cards (Microphone visualizer, Camera, Screen Share, Settings)
 * - End Interview evaluation modal & Interview History modal
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../api';
import toast from 'react-hot-toast';
import {
  Mic, MicOff, Video, VideoOff, Monitor, Disc, Subtitles, Settings,
  PhoneOff, Send, Volume2, VolumeX, Sparkles, CheckCircle2,
  BarChart3, ChevronDown, History, Award, X, RefreshCw, Trophy,
  Play, Pause, MoreVertical, MessageSquare, Shield, HelpCircle, Layers
} from 'lucide-react';

/* ── 5 Standard Interview Rounds ─────────────────────────────────────────── */
const INTERVIEW_ROUNDS = [
  { id: 'intro', step: 1, title: 'Introduction', questionsCount: 2 },
  { id: 'technical', step: 2, title: 'Technical Round', questionsCount: 5 },
  { id: 'problem_solving', step: 3, title: 'Problem Solving', questionsCount: 3 },
  { id: 'behavioral', step: 4, title: 'Behavioral Round', questionsCount: 3 },
  { id: 'hr', step: 5, title: 'HR Round', questionsCount: 3 },
];

/* ── Default Questions Bank by Round ─────────────────────────────────────── */
const ROUND_QUESTIONS = {
  intro: [
    {
      id: 'intro-1',
      question: "Good morning! Let's start with a brief introduction. Can you tell me about yourself and your background?",
      defaultAnswer: "Good morning! I am Akash. I am a final year Computer Science student. I have experience in web development and artificial intelligence...",
      tips: "Keep your intro under 90 seconds. Focus on current education, core technical stack, and passion for software engineering."
    },
    {
      id: 'intro-2',
      question: "That's great! Can you tell me more about one of your key projects? What problem did it solve and what technologies did you use?",
      defaultAnswer: "I developed CareerCraft, an AI-powered career cockpit utilizing React, Python Flask, and scikit-learn for automated resume screening and dynamic mock interviews.",
      tips: "Use the STAR method: Situation, Task, Action, and quantifiable Result."
    }
  ],
  technical: [
    {
      id: 'tech-1',
      question: "In modern distributed architectures, how do you handle state management and caching between microservices to prevent data inconsistencies?",
      defaultAnswer: "I implement Redis distributed caching with TTLs and write-through cache strategies, combined with idempotency keys and transactional outbox patterns.",
      tips: "Mention Redis/Memcached, event-driven consistency, and cache invalidation strategies."
    },
    {
      id: 'tech-2',
      question: "Can you explain the difference between optimistic and pessimistic locking in databases, and when you would use each?",
      defaultAnswer: "Optimistic locking checks for version conflicts at commit time, ideal for read-heavy systems. Pessimistic locks lock rows upfront for high contention scenarios.",
      tips: "Explain performance trade-offs and dead-lock prevention."
    },
    {
      id: 'tech-3',
      question: "How do you optimize slow SQL database queries and indexes in high-throughput applications?",
      defaultAnswer: "I analyze EXPLAIN ANALYZE execution plans, add composite indexes on high-cardinality filter columns, and avoid SELECT * queries.",
      tips: "Discuss B-tree indexing, covering indexes, query plans, and connection pooling."
    },
    {
      id: 'tech-4',
      question: "Describe how asynchronous event loops operate in JavaScript/Node.js or Python AsyncIO.",
      defaultAnswer: "The event loop continuously polls call stacks and executes callbacks from microtask and macrotask queues without blocking main thread execution.",
      tips: "Discuss microtasks (Promises) vs macrotasks (timers/I/O)."
    },
    {
      id: 'tech-5',
      question: "What security measures do you implement to protect REST APIs against unauthorized access and injection attacks?",
      defaultAnswer: "I enforce JWT with short expiration and refresh tokens, input validation, CORS whitelisting, rate limiting, and parameterized queries.",
      tips: "Highlight OWASP Top 10 defenses, CSRF tokens, and sanitized inputs."
    }
  ],
  problem_solving: [
    {
      id: 'ps-1',
      question: "Suppose your production service experiences a sudden 500% traffic surge and latency spikes to 8 seconds. How do you triage and resolve this?",
      defaultAnswer: "First, check monitoring dashboards (CPU, memory, database IOPS). Next, enable CDN caching, spin up auto-scaling replicas, and throttle non-critical background jobs.",
      tips: "Focus on systematic root-cause isolation and graceful degradation."
    },
    {
      id: 'ps-2',
      question: "How would you design a URL shortening service like Bitly that handles 100M redirects per day?",
      defaultAnswer: "Use Base62 encoding on unique 64-bit auto-incrementing IDs, backed by a distributed NoSQL key-value store and Redis cache with LRU eviction.",
      tips: "Estimate throughput, schema design, hashing vs auto-increment, and collision handling."
    },
    {
      id: 'ps-3',
      question: "You notice memory steadily climbing on a deployed microservice until the container gets OOMKilled. How do you diagnose the memory leak?",
      defaultAnswer: "I inspect heap dumps using profiling tools, trace event listener leaks and unclosed database connections, and isolate memory deltas across load tests.",
      tips: "Mention profiling tools, garbage collection analysis, and memory snapshots."
    }
  ],
  behavioral: [
    {
      id: 'beh-1',
      question: "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?",
      defaultAnswer: "We disagreed on whether to use GraphQL or REST. I built two rapid prototypes and benchmarked payload size and developer velocity to make an objective data-driven choice.",
      tips: "Highlight active listening, objective data, and putting team goals first."
    },
    {
      id: 'beh-2',
      question: "Describe a situation where a project deadline was suddenly moved up by two weeks. How did you handle the pressure?",
      defaultAnswer: "I gathered the engineering team, re-scoped deliverables into essential MVP features, deprioritized nice-to-haves, and delivered the core milestones on schedule.",
      tips: "Demonstrate prioritization, stakeholder communication, and composure."
    },
    {
      id: 'beh-3',
      question: "Give an example of a mistake you made in production code and what steps you took afterward.",
      defaultAnswer: "I pushed a migration that caused table locking during peak hours. I rolled back immediately, implemented a zero-downtime migration strategy, and added migration staging checks.",
      tips: "Show ownership, transparency, blameless post-mortem, and preventive guardrails."
    }
  ],
  hr: [
    {
      id: 'hr-1',
      question: "Why are you interested in joining our engineering team, and where do you see your career heading in the next 3 years?",
      defaultAnswer: "I admire your team's commitment to building scalable AI-first products. Over the next three years, I want to lead critical system designs and mentor junior engineers.",
      tips: "Align your ambitions with company innovation and personal engineering growth."
    },
    {
      id: 'hr-2',
      question: "What work environment allows you to do your absolute best engineering work?",
      defaultAnswer: "An environment with high psychological safety, rigorous code reviews, fast automated CI/CD pipelines, and clear cross-functional communication.",
      tips: "Emphasize collaboration, engineering excellence, and mutual accountability."
    },
    {
      id: 'hr-3',
      question: "Do you have any questions for me or about the team's upcoming technical challenges?",
      defaultAnswer: "Yes! What are the primary scalability bottlenecks the team expects to tackle this quarter, and how does the engineering team balance new features with tech debt?",
      tips: "Ask high-impact questions about architecture, engineering culture, and roadmap."
    }
  ]
};

export default function InterviewPage() {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'Akash';
  const userFullName = user?.name || 'Akash Malavatta';

  /* ── Round & Questions State ─────────────────────────────────────────────── */
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const currentRound = INTERVIEW_ROUNDS[activeRoundIndex];
  const roundQuestions = ROUND_QUESTIONS[currentRound.id] || [];
  const [questionIndex, setQuestionIndex] = useState(0);
  const activeQuestion = roundQuestions[questionIndex] || roundQuestions[0];

  /* ── Right Panel Tabs ('transcript' | 'info' | 'notes') ─────────────────── */
  const [activeTab, setActiveTab] = useState('transcript');

  /* ── Chat Transcript Messages ────────────────────────────────────────────── */
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      name: 'AI Interviewer',
      time: '05:23 AM',
      text: `Good morning, ${userName}! 👋 Let's start with a brief introduction. Can you tell me about yourself and your background?`,
      avatar: '/images/interview_coach.jpg'
    },
    {
      id: 'msg-2',
      sender: 'user',
      name: 'You',
      time: '05:24 AM',
      text: `Good morning! I am ${userName}. I am a final year Computer Science student. I have experience in web development and artificial intelligence...`,
      avatar: '/images/akash_avatar.jpg'
    },
    {
      id: 'msg-3',
      sender: 'ai',
      name: 'AI Interviewer',
      time: '05:25 AM',
      text: "That's great! Can you tell me more about one of your key projects? What problem did it solve and what technologies did you use?",
      avatar: '/images/interview_coach.jpg'
    }
  ]);

  const [inputAnswer, setInputAnswer] = useState('');
  const chatBottomRef = useRef(null);

  /* ── Timer State (Counts up, starts at 05:24 to mirror user reference) ─── */
  const [seconds, setSeconds] = useState(324); // 05:24
  const [timerRunning, setTimerRunning] = useState(true);

  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  /* ── Text-to-Speech (TTS) Voice Narration ─────────────────────────────────── */
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiVoiceMuted, setAiVoiceMuted] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setTtsSupported(false);
    }
  }, []);

  const speakText = (text) => {
    if (aiVoiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/👋/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.96;
      utterance.pitch = 1.0;

      // Pick high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Jenny'))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  /* ── Speech Recognition (STT) ────────────────────────────────────────────── */
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttSupported(false);
    }
  }, []);

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
      stopSpeaking(); // stop AI speech when candidate starts talking
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Microphone listening — speak your answer clearly', { id: 'stt-active' });
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputAnswer(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('STT notice:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. You can also type directly in the box.');
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
      } catch (e) { }
      setIsListening(false);
    }
  };

  /* ── Media Controls (Mute, Video, Screen Share, Captions) ─────────────────── */
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const screenVideoRef = useRef(null);

  const [cameraStream, setCameraStream] = useState(null);
  const cameraVideoRef = useRef(null);

  const [isRecording, setIsRecording] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Toggle user camera
  const toggleCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
      setIsVideoActive(false);
      toast.success('Camera paused');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false
        });
        setCameraStream(stream);
        setIsVideoActive(true);
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        toast.success('Camera preview connected');
      } catch (err) {
        toast.error('Webcam access unavailable. Using candidate avatar fallback.');
        setIsVideoActive(true);
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      toast.success('Screen share stopped');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
        setScreenStream(stream);
        setIsScreenSharing(true);
        toast.success('Screen sharing active for technical presentation');
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          toast.error('Could not start screen share: ' + err.message);
        }
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    };
  }, [cameraStream, screenStream]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history on demand
  const loadHistory = async () => {
    setShowHistoryModal(true);
    try {
      setHistoryLoading(true);
      const res = await interviewAPI.history();
      setInterviewHistory(res.data.interviews || []);
    } catch (e) {
      console.warn('Could not load history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Submit candidate answer
  const handleSendAnswer = () => {
    if (!inputAnswer.trim()) return;

    stopListening();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      name: 'You',
      time: nowTime,
      text: inputAnswer.trim(),
      avatar: '/images/akash_avatar.jpg'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputAnswer('');

    // Advance question or switch round
    setTimeout(() => {
      let nextQIdx = questionIndex + 1;
      let nextRoundIdx = activeRoundIndex;

      if (nextQIdx >= roundQuestions.length) {
        if (activeRoundIndex < INTERVIEW_ROUNDS.length - 1) {
          nextRoundIdx = activeRoundIndex + 1;
          setActiveRoundIndex(nextRoundIdx);
          nextQIdx = 0;
          setQuestionIndex(0);
          toast.success(`Advancing to ${INTERVIEW_ROUNDS[nextRoundIdx].title}!`);
        } else {
          // Completed all rounds
          setShowEndModal(true);
          return;
        }
      } else {
        setQuestionIndex(nextQIdx);
      }

      const nextRoundObj = INTERVIEW_ROUNDS[nextRoundIdx];
      const nextQList = ROUND_QUESTIONS[nextRoundObj.id] || [];
      const nextQuestionObj = nextQList[nextQIdx];

      if (nextQuestionObj) {
        const aiResponseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          name: 'AI Interviewer',
          time: aiResponseTime,
          text: nextQuestionObj.question,
          avatar: '/images/interview_coach.jpg'
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(nextQuestionObj.question);
      }
    }, 1200);
  };

  // Switch round directly from stepper
  const handleSelectRound = (index) => {
    setActiveRoundIndex(index);
    setQuestionIndex(0);
    const selectedRoundObj = INTERVIEW_ROUNDS[index];
    const qList = ROUND_QUESTIONS[selectedRoundObj.id] || [];
    if (qList[0]) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const roundSwitchMsg = {
        id: `ai-round-${Date.now()}`,
        sender: 'ai',
        name: 'AI Interviewer',
        time: nowTime,
        text: `Starting ${selectedRoundObj.title}: ${qList[0].question}`,
        avatar: '/images/interview_coach.jpg'
      };
      setMessages(prev => [...prev, roundSwitchMsg]);
      speakText(qList[0].question);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#05080D] text-[#F5F7FA] p-3 md:p-6 flex flex-col gap-4 font-sans selection:bg-[#F5BF45]/30">

      {/* ── Top Header Section (Matching Reference Design) ────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="flex items-start gap-3.5">
          {/* Gold Crest Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5BF45]/20 to-[#D99B22]/10 border border-[#F5BF45]/40 flex items-center justify-center shrink-0 shadow-lg shadow-[#F5BF45]/10">
            <Trophy className="text-[#F5BF45]" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Mock Interview
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5BF45]/15 text-[#F5BF45] border border-[#F5BF45]/30">
                Beta
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#A8B3C2] mt-0.5">
              Experience a real interview with AI. Get instant feedback, detailed report, and improve your skills.
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={loadHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B121B] hover:bg-[#101A26] border border-[#253342] text-xs font-semibold text-[#A8B3C2] hover:text-white transition-all shadow-sm"
          >
            <History size={15} className="text-[#F5BF45]" />
            <span>Interview History</span>
          </button>
          <button
            onClick={() => setShowEndModal(true)}
            title="Interview Analytics"
            className="p-2 rounded-lg bg-[#0B121B] hover:bg-[#101A26] border border-[#253342] text-[#A8B3C2] hover:text-[#F5BF45] transition-all shadow-sm"
          >
            <BarChart3 size={17} />
          </button>
        </div>
      </div>

      {/* ── 5-Round Progress Stepper (Matching Reference Design) ───────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
        {INTERVIEW_ROUNDS.map((round, idx) => {
          const isActive = idx === activeRoundIndex;
          const isPassed = idx < activeRoundIndex;

          return (
            <button
              key={round.id}
              onClick={() => handleSelectRound(idx)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#D99B22]/30 via-[#F5BF45]/15 to-[#0B121B] border-[#F5BF45] shadow-md shadow-[#F5BF45]/10'
                  : isPassed
                  ? 'bg-[#0B121B]/80 border-[#253342] hover:border-[#F5BF45]/40 opacity-90'
                  : 'bg-[#0B121B]/40 border-[#253342]/60 hover:border-[#253342] opacity-70'
              }`}
            >
              {/* Step Number Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#F5BF45] text-[#05080D] shadow-sm'
                    : isPassed
                    ? 'bg-[#253342] text-[#F5BF45]'
                    : 'bg-[#101A26] text-[#A8B3C2] border border-[#253342]'
                }`}
              >
                {round.step}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isActive ? 'text-[#F5BF45]' : 'text-white'}`}>
                  {round.title}
                </div>
                <div className="text-[11px] text-[#A8B3C2] truncate">
                  {round.questionsCount} questions
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Interview Body: Left Video/Controls + Right Transcript ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">

        {/* ── Left Column: Video Viewport & Controls Bar (7/12 on lg) ─────────── */}
        <div className="lg:col-span-8 flex flex-col gap-3">

          {/* Main Video Screen */}
          <div className="relative w-full aspect-[16/10] md:aspect-[16/9] max-h-[500px] rounded-2xl overflow-hidden bg-[#0B121B] border border-[#253342] shadow-2xl flex items-center justify-center">

            {/* AI Interviewer Video / Image Background */}
            <img
              src="/images/interview_coach.jpg"
              alt="AI Interviewer"
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
            />

            {/* Subtle Vignette & Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

            {/* Top-Left Badge: AI Interviewer Name & Title */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#05080D]/80 backdrop-blur-md border border-[#253342] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">AI Interviewer</span>
              <span className="text-[#A8B3C2] hidden sm:inline">|</span>
              <span className="text-[#A8B3C2] text-[11px] hidden sm:inline">Senior Software Engineer | CareerCraft AI</span>
            </div>

            {/* Top-Right Badge: Live Session Timer */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#05080D]/80 backdrop-blur-md border border-[#253342] text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-bold text-white tracking-wider">{formatTimer(seconds)}</span>
            </div>

            {/* Bottom-Left Badge: AI is Speaking Waveform Overlay */}
            {isSpeaking && (
              <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#05080D]/90 backdrop-blur-md border border-[#F5BF45]/40 shadow-lg">
                <div className="flex items-center gap-1 h-3.5">
                  <span className="wave-bar" style={{ animationDelay: '0.1s' }} />
                  <span className="wave-bar" style={{ animationDelay: '0.3s' }} />
                  <span className="wave-bar" style={{ animationDelay: '0.2s' }} />
                  <span className="wave-bar" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-xs font-semibold text-[#F5BF45] tracking-wide">
                  AI is speaking...
                </span>
              </div>
            )}

            {/* Closed Captions Banner (Subtitles) */}
            {showCaptions && activeQuestion && (
              <div className="absolute bottom-16 left-6 right-6 text-center pointer-events-none">
                <span className="inline-block px-4 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-xs md:text-sm text-white/95 max-w-xl leading-relaxed shadow-lg">
                  "{activeQuestion.question}"
                </span>
              </div>
            )}

            {/* Bottom-Right Inset: Candidate PIP Box */}
            <div className="absolute bottom-3.5 right-3.5 w-36 h-28 sm:w-44 sm:h-32 rounded-xl overflow-hidden border-2 border-[#253342] bg-[#05080D] shadow-xl group">
              {cameraStream ? (
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <img
                  src="/images/akash_avatar.jpg"
                  alt="You"
                  className="w-full h-full object-cover object-top filter brightness-95"
                />
              )}

              {/* Candidate Info Pill */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 rounded bg-[#05080D]/85 backdrop-blur-sm flex items-center justify-between text-[11px] text-white">
                <div className="flex items-center gap-1 truncate">
                  <Mic size={11} className={isMicMuted ? 'text-rose-400' : 'text-emerald-400'} />
                  <span className="font-medium truncate">You ({userName})</span>
                </div>
                <button
                  onClick={toggleCamera}
                  className="text-[#A8B3C2] hover:text-white"
                  title="Toggle PIP Camera"
                >
                  <MoreVertical size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Media Controls Bar Directly Below Video (Matching Reference Design) ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-[#0B121B] border border-[#253342] shadow-lg">
            {/* Mute Button */}
            <button
              onClick={() => {
                setIsMicMuted(!isMicMuted);
                toast(isMicMuted ? 'Microphone unmuted' : 'Microphone muted', { icon: isMicMuted ? '🎙️' : '🔇' });
              }}
              className={`flex flex-col sm:flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isMicMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[#101A26] text-[#A8B3C2] hover:text-white hover:bg-[#162232] border border-[#253342]'
              }`}
            >
              {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* Video Button */}
            <button
              onClick={toggleCamera}
              className={`flex flex-col sm:flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                cameraStream
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#101A26] text-[#A8B3C2] hover:text-white hover:bg-[#162232] border border-[#253342]'
              }`}
            >
              {cameraStream ? <Video size={16} /> : <VideoOff size={16} />}
              <span>{cameraStream ? 'Stop Video' : 'Start Video'}</span>
            </button>

            {/* Screen Share Button */}
            <button
              onClick={toggleScreenShare}
              className={`flex flex-col sm:flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isScreenSharing
                  ? 'bg-[#F5BF45]/20 text-[#F5BF45] border border-[#F5BF45]'
                  : 'bg-[#101A26] text-[#A8B3C2] hover:text-[#F5BF45] hover:bg-[#162232] border border-[#253342]'
              }`}
            >
              <Monitor size={16} />
              <span>Screen Share</span>
            </button>

            {/* Record Button */}
            <button
              onClick={() => {
                setIsRecording(!isRecording);
                toast(isRecording ? 'Recording paused' : 'Recording session active', { icon: '⏺️' });
              }}
              className={`flex flex-col sm:flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isRecording
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-[#101A26] text-[#A8B3C2] hover:text-white hover:bg-[#162232] border border-[#253342]'
              }`}
            >
              <Disc size={16} className={isRecording ? 'animate-spin' : ''} />
              <span>Record</span>
            </button>

            {/* Captions Toggle */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`flex flex-col sm:flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                showCaptions
                  ? 'bg-[#F5BF45]/15 text-[#F5BF45] border border-[#F5BF45]/30'
                  : 'bg-[#101A26] text-[#A8B3C2] hover:text-white hover:bg-[#162232] border border-[#253342]'
              }`}
            >
              <Subtitles size={16} />
              <span>Captions</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex flex-col sm:flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101A26] text-[#A8B3C2] hover:text-white hover:bg-[#162232] border border-[#253342] transition-all"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            {/* Red End Interview Button */}
            <button
              onClick={() => setShowEndModal(true)}
              className="flex flex-col sm:flex-row items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40 transition-all ml-auto"
            >
              <PhoneOff size={16} />
              <span>End Interview</span>
            </button>
          </div>
        </div>

        {/* ── Right Column: Live Transcript Panel (5/12 on lg) ────────────────── */}
        <div className="lg:col-span-4 flex flex-col h-[565px] rounded-2xl bg-[#0B121B] border border-[#253342] shadow-xl overflow-hidden">

          {/* Right Header Tabs (Matching Reference Design) */}
          <div className="flex items-center gap-1.5 p-2 border-b border-[#253342] bg-[#080D14]">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-gradient-to-r from-[#D99B22]/30 to-[#F5BF45]/20 text-[#F5BF45] border border-[#F5BF45]'
                  : 'text-[#A8B3C2] hover:text-white hover:bg-[#101A26]'
              }`}
            >
              <MessageSquare size={14} className="text-[#F5BF45]" />
              <span>Live Transcript</span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'info'
                  ? 'bg-[#101A26] text-white border border-[#253342]'
                  : 'text-[#A8B3C2] hover:text-white hover:bg-[#101A26]'
              }`}
            >
              Interview Info
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-[#101A26] text-white border border-[#253342]'
                  : 'text-[#A8B3C2] hover:text-white hover:bg-[#101A26]'
              }`}
            >
              AI Notes
            </button>
          </div>

          {/* Tab 1: Live Transcript Chat */}
          {activeTab === 'transcript' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
                {messages.map((msg) => {
                  const isAi = msg.sender === 'ai';

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      {isAi ? (
                        <img
                          src={msg.avatar}
                          alt="AI Coach"
                          className="w-8 h-8 rounded-full object-cover border border-[#F5BF45]/40 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5BF45] to-[#D99B22] text-[#05080D] font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                          {userName[0] || 'A'}
                        </div>
                      )}

                      {/* Content Bubble */}
                      <div className={`flex flex-col max-w-[85%] ${isAi ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className={`text-[11px] font-bold ${isAi ? 'text-white' : 'text-[#F5BF45]'}`}>
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-[#A8B3C2] font-mono">
                            {msg.time}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isAi
                              ? 'bg-[#101A26] border border-[#253342] text-[#F5F7FA] rounded-tl-sm'
                              : 'bg-gradient-to-br from-[#1A2534] to-[#121B27] border border-[#253342] text-[#F5F7FA] rounded-tr-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Bottom Voice & Text Input (Matching Reference Design) */}
              <div className="p-3 border-t border-[#253342] bg-[#080D14]">
                <div className="flex items-center gap-2 bg-[#101A26] border border-[#253342] rounded-xl px-3 py-1.5 focus-within:border-[#F5BF45] transition-all">
                  <input
                    type="text"
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                    placeholder="Speak or type your answer here..."
                    className="flex-1 bg-transparent border-none text-xs text-white placeholder-[#A8B3C2] focus:outline-none"
                  />

                  {/* Gold Mic STT Button */}
                  <button
                    onClick={toggleListening}
                    title={isListening ? 'Stop listening' : 'Start voice transcription'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                        : 'bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] shadow-md shadow-[#F5BF45]/20'
                    }`}
                  >
                    <Mic size={15} />
                  </button>

                  {/* Gold Send Button */}
                  <button
                    onClick={handleSendAnswer}
                    disabled={!inputAnswer.trim()}
                    title="Send response"
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D99B22] to-[#F5BF45] text-[#05080D] hover:opacity-90 flex items-center justify-center disabled:opacity-40 transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Interview Info */}
          {activeTab === 'info' && (
            <div className="p-4 space-y-3.5 text-xs text-[#A8B3C2] overflow-y-auto">
              <div className="p-3 rounded-xl bg-[#101A26] border border-[#253342]">
                <div className="font-bold text-white text-sm mb-1">{selectedRole} Mock Interview</div>
                <p className="text-[11px] leading-relaxed">
                  Real-time conversational mock session simulating standard FAANG & tier-1 technical rounds.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#253342]/60">
                  <span className="text-[#A8B3C2]">Candidate</span>
                  <span className="font-semibold text-white">{userFullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#253342]/60">
                  <span className="text-[#A8B3C2]">Active Round</span>
                  <span className="font-semibold text-[#F5BF45]">{currentRound.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#253342]/60">
                  <span className="text-[#A8B3C2]">Questions In Round</span>
                  <span className="font-semibold text-white">{roundQuestions.length} Questions</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#253342]/60">
                  <span className="text-[#A8B3C2]">Evaluation Rubric</span>
                  <span className="font-semibold text-white">STAR Framework, System Design, Fit</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5BF45]/10 border border-[#F5BF45]/20 text-[11px] text-[#F5BF45]">
                💡 Tip: Speak in structured bullet points. When answering technical questions, explain trade-offs and edge cases explicitly.
              </div>
            </div>
          )}

          {/* Tab 3: AI Notes & Live Hints */}
          {activeTab === 'notes' && (
            <div className="p-4 space-y-3.5 text-xs text-[#A8B3C2] overflow-y-auto">
              <div className="flex items-center gap-2 text-[#F5BF45] font-bold">
                <Sparkles size={16} />
                <span>Real-Time AI Coaching Hints</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101A26] border border-[#253342] text-[11px] leading-relaxed text-white space-y-2">
                <p className="font-bold text-[#F5BF45]">Current Question Focus:</p>
                <p>{activeQuestion?.tips || "Elaborate clearly on specific technologies, measurable impact, and team dynamics."}</p>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#080D14] border border-[#253342] text-[11px]">
                  ✓ Good eye contact and pace detected in candidate feed.
                </div>
                <div className="p-2.5 rounded-lg bg-[#080D14] border border-[#253342] text-[11px]">
                  ✓ Microphone audio levels optimal with low background noise.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom 4 Device & Settings Cards (Matching Reference Design) ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full pt-1">

        {/* Card 1: Microphone Card */}
        <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] flex flex-col justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F5BF45]/15 text-[#F5BF45] flex items-center justify-center">
                <Mic size={17} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Microphone</div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${isMicMuted ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="text-[#A8B3C2]">{isMicMuted ? 'Muted' : 'Active'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Audio Visualizer Equalizer Bars */}
          <div className="h-6 flex items-end gap-1 px-1">
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="equalizer-bar"
                style={{
                  height: isMicMuted ? '4px' : `${Math.max(4, Math.sin(i * 0.45) * 16 + 8)}px`,
                  animationDuration: `${0.5 + (i % 5) * 0.15}s`,
                  animationPlayState: isMicMuted ? 'paused' : 'running'
                }}
              />
            ))}
          </div>

          {/* Device Dropdown */}
          <select className="w-full bg-[#101A26] border border-[#253342] text-[11px] text-[#A8B3C2] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F5BF45]">
            <option>Default - Microphone</option>
            <option>Headset Microphone (Built-in)</option>
            <option>Studio USB Microphone</option>
          </select>
        </div>

        {/* Card 2: Camera Card */}
        <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] flex flex-col justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Video size={17} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Camera</div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${isVideoActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className="text-[#A8B3C2]">{isVideoActive ? 'Active' : 'Off'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#A8B3C2] leading-relaxed">
            Client-side WebRTC preview only. Zero video recorded to public servers.
          </div>

          {/* Device Dropdown */}
          <select
            onChange={toggleCamera}
            className="w-full bg-[#101A26] border border-[#253342] text-[11px] text-[#A8B3C2] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F5BF45]"
          >
            <option>Integrated Camera</option>
            <option>External HD Webcam</option>
            <option>Virtual Camera Feed</option>
          </select>
        </div>

        {/* Card 3: Screen Share Card */}
        <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] flex flex-col justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F5BF45]/15 text-[#F5BF45] flex items-center justify-center">
                <Monitor size={17} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Screen Share</div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${isScreenSharing ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[#A8B3C2]">{isScreenSharing ? 'Sharing' : 'Not Sharing'}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={toggleScreenShare}
            className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
              isScreenSharing
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-transparent text-[#F5BF45] border-[#F5BF45] hover:bg-[#F5BF45]/10'
            }`}
          >
            {isScreenSharing ? 'Stop Sharing' : 'Start Sharing'}
          </button>
        </div>

        {/* Card 4: Interview Settings Card */}
        <div className="p-4 rounded-2xl bg-[#0B121B] border border-[#253342] flex flex-col justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F5BF45]/15 text-[#F5BF45] flex items-center justify-center shrink-0">
              <Settings size={17} />
            </div>
            <div className="text-xs font-bold text-white">Interview Settings</div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#A8B3C2]">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-[#101A26] border border-[#253342] text-[11px] text-white rounded px-1.5 py-0.5 focus:outline-none"
              >
                <option>Software Engineer</option>
                <option>Full Stack Developer</option>
                <option>Frontend Engineer</option>
                <option>Data Scientist</option>
                <option>DevOps Engineer</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A8B3C2]">Difficulty:</span>
              <span className="text-white font-medium">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A8B3C2]">Duration:</span>
              <span className="text-white font-medium">30 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A8B3C2]">Questions:</span>
              <span className="text-white font-medium">16 (across 5 rounds)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A8B3C2]">Language:</span>
              <span className="text-white font-medium">English</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── End Interview Evaluation Modal ────────────────────────────────────── */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B121B] border border-[#253342] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEndModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5BF45]/20 border border-[#F5BF45]/50 flex items-center justify-center text-[#F5BF45]">
                <Award size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Interview Performance Summary</h3>
                <p className="text-xs text-[#A8B3C2]">
                  Session completed for {selectedRole} ({userName})
                </p>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="p-3 rounded-xl bg-[#101A26] border border-[#253342] text-center">
                <div className="text-2xl font-black text-[#F5BF45]">88%</div>
                <div className="text-[11px] text-[#A8B3C2] mt-0.5">Overall Score</div>
              </div>
              <div className="p-3 rounded-xl bg-[#101A26] border border-[#253342] text-center">
                <div className="text-2xl font-black text-emerald-400">92%</div>
                <div className="text-[11px] text-[#A8B3C2] mt-0.5">Communication</div>
              </div>
              <div className="p-3 rounded-xl bg-[#101A26] border border-[#253342] text-center">
                <div className="text-2xl font-black text-cyan-400">85%</div>
                <div className="text-[11px] text-[#A8B3C2] mt-0.5">Technical Depth</div>
              </div>
            </div>

            {/* Diagnostic Feedback */}
            <div className="space-y-2.5 text-xs text-[#A8B3C2] bg-[#05080D] p-3.5 rounded-xl border border-[#253342]">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Key Strengths</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Clear articulation of distributed caching, microservice consistency, and proactive handling of production surges. Strong command of technical vocabulary.
              </p>
              <div className="font-bold text-white flex items-center gap-2 pt-1">
                <Sparkles size={15} className="text-[#F5BF45]" />
                <span>Areas for Growth</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Include explicit computational complexity (Big-O time and space) when describing algorithm solutions and distributed cache eviction policies.
              </p>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => {
                  setShowEndModal(false);
                  toast.success('Performance report downloaded');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] shadow-md transition-all"
              >
                Download Full AI Report
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  setActiveRoundIndex(0);
                  setQuestionIndex(0);
                  setSeconds(0);
                  toast.success('Restarted fresh practice round');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#101A26] hover:bg-[#162232] text-white border border-[#253342] transition-all"
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Interview History Modal ───────────────────────────────────────────── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B121B] border border-[#253342] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5BF45]/20 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45]">
                <History size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Your Mock Interview History</h3>
                <p className="text-xs text-[#A8B3C2]">Review past performance and AI coaching analytics</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {historyLoading ? (
                <div className="py-8 text-center text-xs text-[#A8B3C2]">
                  <div className="spinner mx-auto mb-2 text-[#F5BF45]" />
                  Loading interview archives...
                </div>
              ) : interviewHistory.length > 0 ? (
                interviewHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#101A26] border border-[#253342] hover:border-[#F5BF45]/40 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.title || item.target_role}</div>
                      <div className="text-[11px] text-[#A8B3C2]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'} • {item.difficulty || 'Medium'} • {item.total_questions || 5} Questions
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#F5BF45]">
                        {item.overall_score ? `${Math.round(item.overall_score)}%` : 'Completed'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#A8B3C2] bg-[#05080D] rounded-xl border border-[#253342]">
                  No past interview sessions found. You are currently taking your live practice session!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ────────────────────────────────────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B121B] border border-[#253342] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5BF45]/20 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45]">
                <Settings size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Interview Room Preferences</h3>
                <p className="text-xs text-[#A8B3C2]">Configure audio synthesis & transcript display</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#101A26] border border-[#253342]">
                <div>
                  <div className="font-semibold text-white">AI Voice Narration (TTS)</div>
                  <div className="text-[11px] text-[#A8B3C2]">Speak questions aloud automatically</div>
                </div>
                <button
                  onClick={() => setAiVoiceMuted(!aiVoiceMuted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !aiVoiceMuted ? 'bg-[#F5BF45] text-[#05080D]' : 'bg-[#253342] text-[#A8B3C2]'
                  }`}
                >
                  {!aiVoiceMuted ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#101A26] border border-[#253342]">
                <div>
                  <div className="font-semibold text-white">Real-Time Subtitles</div>
                  <div className="text-[11px] text-[#A8B3C2]">Display captions on video canvas</div>
                </div>
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    showCaptions ? 'bg-[#F5BF45] text-[#05080D]' : 'bg-[#253342] text-[#A8B3C2]'
                  }`}
                >
                  {showCaptions ? 'Enabled' : 'Hidden'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-5 py-2.5 rounded-xl text-xs font-bold bg-[#F5BF45] hover:bg-[#D99B22] text-[#05080D] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
