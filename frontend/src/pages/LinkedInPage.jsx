import { useState } from 'react';
import { linkedinAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Sparkles, Copy, Check, ArrowRight, CheckCircle2,
  AlertTriangle, Lightbulb, UserCheck, ShieldAlert, Award
} from 'lucide-react';
import { LinkedInIcon } from '../components/common/Icons';

export default function LinkedInPage() {
  const { user } = useAuth();
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsStr, setSkillsStr] = useState('Python, JavaScript, React, SQL, Git');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Engineer');
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!headline.trim() && !summary.trim()) {
      toast.error('Please enter at least your headline or About summary');
      return;
    }

    try {
      setAnalyzing(true);
      const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const experience = expTitle.trim()
        ? [{ title: expTitle.trim(), description: expDesc.trim() }]
        : [];

      const res = await linkedinAPI.analyze({
        target_role: targetRole.trim(),
        headline: headline.trim(),
        summary: summary.trim(),
        skills,
        experience,
      });

      setResult(res.data);
      toast.success('LinkedIn profile audit completed! 🌟');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to analyze profile');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">Social Recruiter Hook</span>
            <span className="text-xs text-muted">Zero-Scraping • TOS Compliant</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            LinkedIn Profile Optimizer
          </h1>
          <p className="text-muted text-sm mt-1">
            Transform your LinkedIn profile into a recruiter magnet with keyword-rich headlines, storytelling summaries, and visibility hacks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Details */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="font-bold text-base mb-1 flex items-center gap-2 text-primary">
              <LinkedInIcon size={18} className="text-sky-400" />
              <span>Profile Content</span>
            </h2>
            <p className="text-xs text-muted mb-4">
              Paste your current LinkedIn details to get an instant recruiter visibility audit.
            </p>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="li-role">Target Role</label>
                <input
                  id="li-role"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Frontend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="li-headline">Current Headline</label>
                <input
                  id="li-headline"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Student at XYZ University"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="li-summary">About / Summary Section</label>
                <textarea
                  id="li-summary"
                  rows={4}
                  className="form-control text-xs"
                  placeholder="Paste your current LinkedIn About summary..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="li-skills">Skills (Comma-separated)</label>
                <input
                  id="li-skills"
                  type="text"
                  className="form-control"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="li-exp-title">Most Recent Role / Internship</label>
                <input
                  id="li-exp-title"
                  type="text"
                  className="form-control mb-2"
                  placeholder="Job or Internship Title"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                />
                <textarea
                  id="li-exp-desc"
                  rows={2}
                  className="form-control text-xs"
                  placeholder="Brief bullet points or description..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <span className="spinner spinner-sm mr-2" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    <span>Audit & Generate Copy</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Optimization Results */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="card p-12 text-center text-muted">
              <LinkedInIcon size={48} className="mx-auto mb-3 opacity-30 text-sky-400" />
              <h3 className="text-lg font-bold text-secondary">No Profile Analyzed Yet</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                Fill in your current headline and summary on the left to receive AI-powered improvements and recruiter hooks.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="card p-6 bg-gradient-to-r from-slate-900 to-slate-850">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="badge badge-brand mb-1">Recruiter Readiness</span>
                    <h2 className="text-xl font-black text-white">Profile Strength Rating</h2>
                    <p className="text-xs text-muted mt-0.5">
                      Based on keyword searchability, structure, and professional storytelling.
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface border border-border min-w-[100px]">
                    <div className="text-xs uppercase font-bold text-muted">Score</div>
                    <div className="text-3xl font-black text-sky-400 mt-1">
                      {result.overall_score || 0}%
                    </div>
                  </div>
                </div>

                {/* Section breakdown */}
                {result.section_scores && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-border">
                    {Object.entries(result.section_scores).map(([sec, sc]) => (
                      <div key={sec} className="text-center">
                        <span className="text-[11px] text-muted capitalize block">{sec}</span>
                        <span className="text-base font-bold text-primary">{sc}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generated Optimized Headline */}
              {result.optimized_content?.headline && (
                <div className="card p-5 border-l-4 border-l-sky-500">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-sm text-sky-300 flex items-center gap-1.5">
                      <Sparkles size={15} />
                      <span>Recommended Magnetic Headline</span>
                    </h3>
                    <button
                      onClick={() => copyToClipboard(result.optimized_content.headline, 'headline')}
                      className="btn btn-ghost btn-sm text-xs"
                    >
                      {copiedKey === 'headline' ? (
                        <Check size={13} className="text-emerald-400 mr-1" />
                      ) : (
                        <Copy size={13} className="mr-1" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border text-xs font-semibold text-primary">
                    {result.optimized_content.headline}
                  </div>
                </div>
              )}

              {/* Generated Optimized Summary */}
              {result.optimized_content?.summary && (
                <div className="card p-5 border-l-4 border-l-brand-500">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-sm text-brand-300 flex items-center gap-1.5">
                      <Award size={15} />
                      <span>Optimized "About" Section Template</span>
                    </h3>
                    <button
                      onClick={() => copyToClipboard(result.optimized_content.summary, 'summary')}
                      className="btn btn-ghost btn-sm text-xs"
                    >
                      {copiedKey === 'summary' ? (
                        <Check size={13} className="text-emerald-400 mr-1" />
                      ) : (
                        <Copy size={13} className="mr-1" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface border border-border text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {result.optimized_content.summary}
                  </div>
                </div>
              )}

              {/* Actionable Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-sm text-secondary uppercase tracking-wider mb-4">
                    Prioritized Improvements ({result.suggestions.length})
                  </h3>
                  <div className="space-y-3">
                    {result.suggestions.map((sug, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-border bg-surface text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${sug.priority === 'high' ? 'badge-rose' : 'badge-amber'} text-[10px]`}>
                            {sug.priority} priority
                          </span>
                          <span className="font-bold text-primary">{sug.section}: {sug.issue}</span>
                        </div>
                        <p className="text-muted mt-1">{sug.suggestion}</p>
                        {sug.example && (
                          <div className="p-2 rounded bg-slate-900 border border-border text-[11px] text-brand-300 mt-2 font-mono">
                            💡 Example: {sug.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Visibility Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="card p-5 bg-surface/50 border border-border">
                  <h3 className="font-bold text-sm text-amber-400 mb-3 flex items-center gap-2">
                    <Lightbulb size={16} />
                    <span>Pro Recruiter Visibility Hacks</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
