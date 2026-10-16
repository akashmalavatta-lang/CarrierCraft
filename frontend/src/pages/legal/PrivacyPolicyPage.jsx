import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, FileText, Mic, Camera, Database, Eye } from 'lucide-react';
import { CareerCraftLogo } from '../../components/common/Icons';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#05080D] text-slate-200 selection:bg-[#F5BF45] selection:text-black">
      {/* Top Bar */}
      <header className="border-b border-[#152232] bg-[#080D14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CareerCraftLogo size={28} showText={true} />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-[#101A26] border border-[#253342]"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F5BF45]/15 text-[#F5BF45] border border-[#F5BF45]/30 mb-3">
            <Shield size={13} />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Last Updated: October 2026 • Effective Date: October 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye size={18} className="text-[#F5BF45]" />
              <span>1. Overview and Core Commitment</span>
            </h2>
            <p>
              CareerCraft ("we", "our", or "the Platform") is committed to protecting your privacy. This Privacy Policy details how we handle your personal data, resumes, interview recordings, transcripts, and account credentials when you access our career preparation services.
            </p>
            <p className="text-xs text-slate-400">
              We operate under a strict "Zero Hidden Data Brokerage" standard: We never sell, rent, or trade your personal information, resumes, or interview audio to third-party advertising networks.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-[#38BDF8]" />
              <span>2. Information We Collect</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs sm:text-sm">
              <li>
                <strong className="text-white">Account Details:</strong> Name, email address, hashed passwords (salted using bcrypt), target job role, and experience level.
              </li>
              <li>
                <strong className="text-white">Resume Data:</strong> PDF or DOCX documents you upload for ATS scoring. Extracted plain text is parsed for contact information, skill keywords, work history, and education. Original uploaded files are stored securely in isolated application storage.
              </li>
              <li>
                <strong className="text-white">Interview Transcripts & Feedback:</strong> Responses you speak or type during AI Monk Interview sessions, question records, and AI evaluation rubrics.
              </li>
              <li>
                <strong className="text-white">Profile & LinkedIn Optimization:</strong> Manually provided professional summaries, skills, and target career preferences.
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic size={18} className="text-emerald-400" />
              <span>3. Microphone, Camera & Screen Sharing Permissions</span>
            </h2>
            <p>
              The AI Monk Interview feature utilizes browser-based MediaDevices APIs. We adhere strictly to the principle of explicit consent:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong className="text-white">No Secret Access:</strong> Microphone and camera hardware are only accessed after you explicitly click the enable controls in your browser.
              </li>
              <li>
                <strong className="text-white">Local Audio Processing:</strong> Speech recognition runs natively via your browser's Web Speech API or our secure backend transcription service. Raw continuous audio is never recorded without explicit permission.
              </li>
              <li>
                <strong className="text-white">Camera Preview:</strong> Candidate video is rendered locally in your browser preview and is not streamed to third parties.
              </li>
              <li>
                <strong className="text-white">Automatic Track Cleanup:</strong> When an interview ends or you navigate away from the interview room, all active media tracks (audio, video, screen share) are immediately stopped and released.
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock size={18} className="text-[#F5BF45]" />
              <span>4. AI Models & Processing</span>
            </h2>
            <p>
              CareerCraft uses a hybrid architecture:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                Deterministic natural language algorithms (TF-IDF, keyword tokenization, regex extraction) run locally on our application server.
              </li>
              <li>
                Optional generative interview questions and resume insights may be processed via secure AI API endpoints (e.g., Google Gemini). Your data is submitted via encrypted TLS connections solely for real-time inference and is not used to train public foundation models.
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-purple-400" />
              <span>5. Data Retention, Storage & User Rights</span>
            </h2>
            <p>
              Your data is stored in secure relational databases (SQLite for local installations, encrypted PostgreSQL on Render in production).
            </p>
            <p>
              You maintain full ownership of your data. You may request deletion of your account, resumes, and interview transcripts at any time from your Profile settings or by contacting support.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white">6. Contact & Legal Inquiry</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              For any questions regarding this Privacy Policy, your rights, or data protection practices, please contact our support team at:
            </p>
            <div className="p-3 rounded-xl bg-[#080D14] border border-[#152232] text-xs font-mono text-[#F5BF45]">
              support@careercraft.io • Bengaluru, Karnataka, India
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
