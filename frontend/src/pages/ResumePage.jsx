import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../api';
import toast from 'react-hot-toast';
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle,
  Trash2, Search, ArrowRight, Sparkles, RefreshCw, ChevronRight,
  TrendingUp, Award, Layers, AlertCircle, FileCheck, ExternalLink
} from 'lucide-react';

export default function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'experience' | 'matcher'

  // JD Match state
  const [jdTitle, setJdTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jdText, setJdText] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await resumeAPI.list();
      setResumes(res.data.resumes || []);
      if (res.data.resumes?.length > 0) {
        // Fetch full analysis for the most recent resume
        fetchResumeDetails(res.data.resumes[0].id);
      } else {
        setSelectedResume(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumeDetails = async (id) => {
    try {
      const res = await resumeAPI.get(id);
      setSelectedResume(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resume details');
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Dropzone setup
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // File validation
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      toast.error('Only PDF and DOCX files are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const toastId = toast.loading('Extracting & analyzing resume with NLP...');
      const res = await resumeAPI.upload(formData);
      toast.dismiss(toastId);
      toast.success('Resume analyzed successfully! +20 XP');

      // Refresh list and select the new resume
      await fetchResumes();
      if (res.data.resume?.id) {
        await fetchResumeDetails(res.data.resume.id);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to upload and analyze resume');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDeleteResume = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumeAPI.delete(id);
      toast.success('Resume deleted');
      fetchResumes();
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const handleRunMatch = async (e) => {
    e.preventDefault();
    if (!selectedResume) {
      toast.error('Please select or upload a resume first');
      return;
    }
    if (!jdText.trim() || jdText.trim().length < 50) {
      toast.error('Please paste a job description with at least 50 characters');
      return;
    }

    try {
      setMatching(true);
      const res = await resumeAPI.matchJD(selectedResume.id, {
        job_title: jdTitle.trim(),
        company_name: companyName.trim(),
        job_description: jdText.trim(),
      });
      setMatchResult(res.data);
      toast.success(`Match completed: ${res.data.scores?.overall || 0}% fit score!`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Matching failed');
    } finally {
      setMatching(false);
    }
  };

  const analysis = selectedResume?.analysis;
  const scores = analysis?.scores || {};

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">Resume Studio</span>
            <span className="text-xs text-muted">Deterministic ATS & NLP Diagnostics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            AI Resume Analyzer & JD Matcher
          </h1>
          <p className="text-muted text-sm mt-1">
            Upload your resume to uncover ATS bottlenecks, extract quantified skills, and match against job descriptions.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone p-8 rounded-2xl border-2 border-dashed mb-8 text-center transition-all cursor-pointer ${
          isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-border hover:border-brand-400/50 bg-surface'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-full bg-brand-500/10 text-brand-400">
            {uploading ? (
              <div className="spinner spinner-md" />
            ) : (
              <UploadCloud size={32} />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold">
              {uploading ? 'Analyzing your resume...' : 'Drop your resume here, or browse files'}
            </h3>
            <p className="text-xs text-muted mt-1">
              Supports PDF and DOCX files up to 10MB • 100% private & client-bound
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm mt-2" disabled={uploading}>
            Select Resume File
          </button>
        </div>
      </div>

      {/* Main Section: Left = Resume Version Switcher, Right = Deep Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Resumes history */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <h3 className="font-bold text-sm mb-3 text-secondary uppercase tracking-wider">
              Uploaded Resumes ({resumes.length})
            </h3>

            {resumes.length === 0 ? (
              <p className="text-xs text-muted italic">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((r) => {
                  const isSelected = selectedResume?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => fetchResumeDetails(r.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 shadow-sm'
                          : 'border-border hover:border-border-strong bg-surface'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-xs truncate text-primary">
                          {r.original_filename}
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-2 mt-1">
                          <span>v{r.version}</span>
                          <span>•</span>
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteResume(e, r.id)}
                        className="text-muted hover:text-rose-400 p-1 rounded"
                        title="Delete resume"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Analysis Tabs */}
        <div className="lg:col-span-3">
          {!selectedResume ? (
            <div className="card p-12 text-center text-muted">
              <FileCheck size={48} className="mx-auto mb-3 opacity-30 text-brand-400" />
              <h3 className="text-lg font-bold text-secondary">No Resume Selected</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                Upload your resume above or choose from your uploaded list to view full ATS insights.
              </p>
            </div>
          ) : !analysis ? (
            <div className="card p-12 text-center">
              <div className="spinner spinner-md mx-auto mb-3" />
              <p className="text-sm text-muted">Loading in-depth analysis...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Header Card */}
              <div className="card p-6 bg-gradient-to-r from-slate-900 to-slate-850">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="badge badge-brand mb-2">
                      {selectedResume.original_filename}
                    </span>
                    <h2 className="text-xl font-black">Resume Performance Audit</h2>
                    <p className="text-xs text-muted mt-1">
                      Evaluated on ATS compatibility, quantifiable impact, grammar, structure, and keyword density.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* ATS Score Dial */}
                    <div className="text-center p-3 rounded-xl border border-border bg-surface/50 min-w-[100px]">
                      <div className="text-xs uppercase font-semibold text-muted">ATS Score</div>
                      <div className={`text-3xl font-black mt-1 ${getScoreColor(scores.ats).split(' ')[0]}`}>
                        {scores.ats || 0}%
                      </div>
                    </div>

                    {/* Overall Score Dial */}
                    <div className="text-center p-3 rounded-xl border border-border bg-surface/50 min-w-[100px]">
                      <div className="text-xs uppercase font-semibold text-muted">Overall Fit</div>
                      <div className={`text-3xl font-black mt-1 ${getScoreColor(scores.overall).split(' ')[0]}`}>
                        {scores.overall || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-score grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <span className="text-[11px] text-muted block uppercase font-medium">Content</span>
                    <span className="text-lg font-bold text-primary">{scores.content || 0}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-muted block uppercase font-medium">Formatting</span>
                    <span className="text-lg font-bold text-primary">{scores.format || 0}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-muted block uppercase font-medium">Skills</span>
                    <span className="text-lg font-bold text-primary">{scores.skills || 0}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-muted block uppercase font-medium">Experience</span>
                    <span className="text-lg font-bold text-primary">{scores.experience || 0}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-muted block uppercase font-medium">Education</span>
                    <span className="text-lg font-bold text-primary">{scores.education || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-border gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`tab-btn py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                    activeTab === 'overview'
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-muted hover:text-secondary'
                  }`}
                >
                  Actionable Feedback
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`tab-btn py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                    activeTab === 'skills'
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-muted hover:text-secondary'
                  }`}
                >
                  Extracted Skills ({analysis.skills_technical?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('experience')}
                  className={`tab-btn py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
                    activeTab === 'experience'
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-muted hover:text-secondary'
                  }`}
                >
                  Parsed Experience & Projects
                </button>
                <button
                  onClick={() => setActiveTab('matcher')}
                  className={`tab-btn py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'matcher'
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-muted hover:text-secondary'
                  }`}
                >
                  <Search size={15} />
                  <span>Job Description Matcher</span>
                </button>
              </div>

              {/* Tab 1: Actionable Feedback */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* ATS Issues */}
                  {analysis.ats_issues && analysis.ats_issues.length > 0 && (
                    <div className="card p-6 border-l-4 border-l-amber-500">
                      <h3 className="font-bold text-base flex items-center gap-2 text-amber-400 mb-3">
                        <AlertTriangle size={18} />
                        <span>ATS Optimization Alerts ({analysis.ats_issues.length})</span>
                      </h3>
                      <ul className="space-y-2">
                        {analysis.ats_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2 text-slate-300">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>{typeof issue === 'string' ? issue : issue.message || issue.issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths & Weaknesses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="card p-6">
                      <h3 className="font-bold text-base flex items-center gap-2 text-emerald-400 mb-3">
                        <CheckCircle2 size={18} />
                        <span>Identified Strengths</span>
                      </h3>
                      {analysis.strengths && analysis.strengths.length > 0 ? (
                        <ul className="space-y-2">
                          {analysis.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 mt-0.5">✓</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted italic">Add more quantifiable metrics to highlight strengths.</p>
                      )}
                    </div>

                    {/* Weaknesses / Improvements */}
                    <div className="card p-6">
                      <h3 className="font-bold text-base flex items-center gap-2 text-rose-400 mb-3">
                        <XCircle size={18} />
                        <span>Areas for Improvement</span>
                      </h3>
                      {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((weak, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-rose-400 mt-0.5">⚠</span>
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted italic">No major red flags detected!</p>
                      )}
                    </div>
                  </div>

                  {/* Detailed Improvement Suggestions */}
                  {analysis.improvements && analysis.improvements.length > 0 && (
                    <div className="card p-6">
                      <h3 className="font-bold text-base flex items-center gap-2 text-brand-400 mb-4">
                        <Sparkles size={18} />
                        <span>High-Impact Recommendations</span>
                      </h3>
                      <div className="space-y-3">
                        {analysis.improvements.map((imp, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-surface border border-border text-xs">
                            <span className="font-semibold text-primary block mb-1">
                              {typeof imp === 'string' ? imp : imp.title || imp.recommendation}
                            </span>
                            {imp.detail && <p className="text-muted">{imp.detail}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Extracted Skills */}
              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <div className="card p-6">
                    <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>Technical Skills ({analysis.skills_technical?.length || 0})</span>
                    </h3>
                    {analysis.skills_technical && analysis.skills_technical.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills_technical.map((skill, idx) => (
                          <span key={idx} className="badge badge-brand text-xs py-1 px-3">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No technical skills detected in the parsed text.</p>
                    )}
                  </div>

                  <div className="card p-6">
                    <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      <span>Soft Skills & Competencies ({analysis.skills_soft?.length || 0})</span>
                    </h3>
                    {analysis.skills_soft && analysis.skills_soft.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills_soft.map((skill, idx) => (
                          <span key={idx} className="badge badge-amber text-xs py-1 px-3">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No soft skills detected in the parsed text.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Parsed Experience & Projects */}
              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {/* Experience */}
                  <div className="card p-6">
                    <h3 className="font-bold text-base mb-4">Work Experience</h3>
                    {analysis.experience && analysis.experience.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.experience.map((exp, idx) => (
                          <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm text-primary">{exp.role || exp.title || 'Role'}</h4>
                              <span className="text-xs text-muted">{exp.duration || exp.dates || ''}</span>
                            </div>
                            <div className="text-xs text-brand-400 font-medium">{exp.company || ''}</div>
                            {exp.description && (
                              <p className="text-xs text-muted mt-2 whitespace-pre-line">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No distinct work experience section recognized.</p>
                    )}
                  </div>

                  {/* Projects */}
                  <div className="card p-6">
                    <h3 className="font-bold text-base mb-4">Projects</h3>
                    {analysis.projects && analysis.projects.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.projects.map((proj, idx) => (
                          <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <h4 className="font-semibold text-sm text-primary">{proj.title || 'Project'}</h4>
                            {proj.technologies && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Array.isArray(proj.technologies) ? (
                                  proj.technologies.map((t, i) => (
                                    <span key={i} className="badge badge-accent text-[10px]">{t}</span>
                                  ))
                                ) : (
                                  <span className="badge badge-accent text-[10px]">{proj.technologies}</span>
                                )}
                              </div>
                            )}
                            {proj.description && (
                              <p className="text-xs text-muted mt-2">{proj.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No distinct projects section recognized.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: JD Matcher */}
              {activeTab === 'matcher' && (
                <div className="space-y-6">
                  <div className="card p-6">
                    <h3 className="font-bold text-base mb-1">Target Job Description Matcher</h3>
                    <p className="text-xs text-muted mb-4">
                      Paste the requirements of the job you want to apply for. Our matcher calculates keyword overlap and reveals the exact missing skills that will get your resume filtered by ATS.
                    </p>

                    <form onSubmit={handleRunMatch} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label" htmlFor="jd-title">Job Title</label>
                          <input
                            id="jd-title"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Junior Backend Engineer"
                            value={jdTitle}
                            onChange={(e) => setJdTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label" htmlFor="jd-company">Company (Optional)</label>
                          <input
                            id="jd-company"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Swiggy, Google, Flipkart"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label" htmlFor="jd-text">Job Description / Requirements *</label>
                        <textarea
                          id="jd-text"
                          rows={6}
                          className="form-control font-mono text-xs"
                          placeholder="Paste full job posting requirements here..."
                          value={jdText}
                          onChange={(e) => setJdText(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={matching}
                      >
                        {matching ? (
                          <>
                            <span className="spinner spinner-sm mr-2" />
                            Evaluating against JD...
                          </>
                        ) : (
                          <>
                            <Search size={16} className="mr-2" />
                            <span>Calculate ATS Match Score</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Match Results Card */}
                  {matchResult && (
                    <div className="card p-6 border-t-4 border-t-brand-500 animate-fadeIn">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <span className="badge badge-brand mb-1">Match Results</span>
                          <h3 className="text-xl font-bold">
                            {jdTitle || 'Job Role'} Compatibility
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted uppercase font-semibold">Match Score</div>
                          <div className={`text-3xl font-black ${getScoreColor(matchResult.scores?.overall || 0).split(' ')[0]}`}>
                            {matchResult.scores?.overall || 0}%
                          </div>
                        </div>
                      </div>

                      {/* Matched vs Missing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                        {/* Matched */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            <span>Matched Keywords ({matchResult.matched_skills?.length || 0})</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {matchResult.matched_skills?.map((kw, i) => (
                              <span key={i} className="badge badge-accent text-xs">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                            <XCircle size={14} />
                            <span>Missing Critical Keywords ({matchResult.missing_skills?.length || 0})</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {matchResult.missing_skills?.map((kw, i) => (
                              <span key={i} className="badge badge-rose text-xs">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tailored Recommendations */}
                      {matchResult.recommendations && matchResult.recommendations.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <h4 className="font-bold text-sm mb-3 text-secondary">
                            Tailored Bullet & Resume Recommendations:
                          </h4>
                          <ul className="space-y-2">
                            {matchResult.recommendations.map((rec, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-brand-400 mt-0.5">&rarr;</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
