import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ArrowLeft, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { CareerCraftLogo } from '../../components/common/Icons';

export default function TermsPage() {
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
            <FileCheck size={13} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms and Conditions of Use
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Last Updated: October 2026 • Version 1.0
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-[#F5BF45]" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p>
              By accessing or using CareerCraft ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to all terms, do not access or use the application.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle size={18} className="text-[#38BDF8]" />
              <span>2. Nature of AI Advice and Educational Disclaimer</span>
            </h2>
            <p>
              CareerCraft provides AI-assisted resume feedback, mock interview practice, ATS compatibility scoring, and roadmap guidance. You understand and acknowledge:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <strong>No Hiring Guarantee:</strong> The platform is an educational training tool. We do not guarantee employment, job interviews, or hiring outcomes with any third-party employer.
              </li>
              <li>
                <strong>Independent Verification:</strong> AI recommendations, scoring rubrics, and salary benchmarks are advisory. You remain solely responsible for the accuracy of facts and qualifications represented in your resume.
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              <span>3. User Conduct and Account Security</span>
            </h2>
            <p>When using CareerCraft, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
              <li>Upload malicious code, macros, or exploit payloads disguised as PDF or DOCX files.</li>
              <li>Attempt to reverse-engineer, decompile, or overload the application or AI inference APIs.</li>
              <li>Misrepresent your identity or share login credentials with unauthorized third parties.</li>
              <li>Violate the terms of service of third-party platforms when utilizing job search or LinkedIn optimization tools.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white">4. Intellectual Property</h2>
            <p>
              All software, algorithms, user interfaces, branding, and proprietary assets are the intellectual property of CareerCraft. You retain all ownership rights in the content, resumes, and projects that you submit to the platform.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0B121B] border border-[#152232] space-y-3">
            <h2 className="text-lg font-bold text-white">5. Governing Law and Support</h2>
            <p className="text-xs sm:text-sm">
              These Terms shall be governed by and construed in accordance with applicable laws. Inquiries or notices regarding these terms should be addressed to:
            </p>
            <div className="p-3 rounded-xl bg-[#080D14] border border-[#152232] text-xs font-mono text-[#F5BF45]">
              support@careercraft.io • Legal Department
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
