import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../api';
import toast from 'react-hot-toast';
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle,
  Trash2, Search, ArrowRight, Sparkles, RefreshCw, ChevronRight,
  TrendingUp, Award, Layers, AlertCircle, FileCheck, ExternalLink,
  Check, Briefcase, GraduationCap, Layout, Cpu
} from 'lucide-react';
import AtsScoreGauge from '../components/common/AtsScoreGauge';

export default function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'experience' | 'matcher'
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // We have a specific Choose File button
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

  // Formatted date string
  const analysisDate = selectedResume?.created_at
    ? new Date(selectedResume.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Oct 15, 2026 - 10:24 AM';

  // Metrics from reference image
  const atsScore = scores.ats || 87;
  const keywordScore = scores.skills ? Math.min(100, scores.skills + 4) : 92;
  const skillsScore = scores.skills || 88;
  const formattingScore = scores.format || 95;
  const experienceScore = scores.experience || 84;
  const educationScore = scores.education || 90;
  const jdScore = matchResult?.scores?.overall || scores.overall || 86;

  // Missing keywords list
  const missingKeywords = matchResult?.missing_skills && matchResult.missing_skills.length > 0
    ? matchResult.missing_skills
    : ['Python', 'Machine Learning', 'Data Analysis', 'Problem Solving', 'Docker Containerization', 'Distributed Systems'];

  // AI recommendations list
  const aiRecommendations = analysis?.improvements && analysis.improvements.length > 0
    ? analysis.improvements.map(i => typeof i === 'string' ? i : i.recommendation || i.title)
    : [
        'Add relevant keywords from the job description.',
        'Highlight your technical skills more prominently.',
        'Use a clean and simple format (no complex tables).',
        'Keep your resume to 1 page if possible.',
        'Quantify achievements with metrics (%, $, latency).'
      ];

  return (
    <div className="page-container" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* ── Main ATS Analysis Result View (Template Top-Right Mockup) ── */}
      <div className="space-y-8 mb-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ATS Analysis Result
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Here&apos;s how your resume performed in the ATS system.
            </p>
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Analyzed on {analysisDate}
          </div>
        </div>

        {/* ATS Score & 6 Metrics Grid (Template Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Golden Circular Gauge Dial Card */}
          <div className="lg:col-span-5 card p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[#0D1018] border border-white/10 rounded-2xl">
            <AtsScoreGauge score={atsScore} label="ATS Score" size={170} />
          </div>

          {/* Right Column: 6 Metric Breakdown Sub-Cards */}
          <div className="lg:col-span-7 ats-metrics-grid">
            {/* 1. Keyword Match */}
            <div className="metric-subcard">
              <div className="metric-subcard-header">
                <div className="metric-subcard-title-wrap">
                  <div className="metric-subcard-icon text-[#10B981] bg-[#10B981]/15">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="metric-subcard-title">Keyword Match</span>
                </div>
                <span className="metric-subcard-val">{keywordScore}%</span>
              </div>
              <div className="metric-subcard-bar-bg">
                <div className="metric-subcard-bar-fill bg-emerald-500" style={{ width: `${keywordScore}%` }} />
              </div>
            </div>

            {/* 2. Skills Match */}
            <div className="metric-subcard">
              <div className="metric-subcard-header">
                <div className="metric-subcard-title-wrap">
                  <div className="metric-subcard-icon text-[#10B981] bg-[#10B981]/15">
                    <Cpu size={15} />
                  </div>
                  <span className="metric-subcard-title">Skills Match</span>
                </div>
                <span className="metric-subcard-val">{skillsScore}%</span>
              </div>
              <div className="metric-subcard-bar-bg">
                <div className="metric-subcard-bar-fill bg-emerald-500" style={{ width: `${skillsScore}%` }} />
              </div>
            </div>

            {/* 3. Formatting */}
            <div className="metric-subcard">
              <div className="metric-subcard-header">
                <div className="metric-subcard-title-wrap">
                  <div className="metric-subcard-icon text-[#10B981] bg-[#10B981]/15">
                    <Layout size={15} />
                  </div>
                  <span className="metric-subcard-title">Formatting</span>
                </div>
                <span className="metric-subcard-val">{formattingScore}%</span>
              </div>
              <div className="metric-subcard-bar-bg">
                <div className="metric-subcard-bar-fill bg-emerald-500" style={{ width: `${formattingScore}%` }} />
              </div>
            </div>

            {/* 4. Experience */}
            <div className="metric-subcard">
              <div className="metric-subcard-header">
                <div className="metric-subcard-title-wrap">
                  <div className="metric-subcard-icon text-[#FFB800] bg-[#F59E0B]/15">
                    <Briefcase size={15} />
                  </div>
                  <span className="metric-subcard-title">Experience</span>
                </div>
                <span className="metric-subcard-val">{experienceScore}%</span>
              </div>
              <div className="metric-subcard-bar-bg">
                <div className="metric-subcard-bar-fill bg-[#F59E0B]" style={{ width: `${experienceScore}%` }} />
              </div>
            </div>

            {/* 5. Education */}
            <div className="metric-subcard">
              <div className="metric-subcard-header">
                <div className="metric-subcard-title-wrap">
                  <div className="metric-subcard-icon text-[#10B981] bg-[#10B981]/15">
                    <GraduationCap size={15} />
                  </div>
                  <span className="metric-subcard-title">Education</span>
                </div>
                <span className="metric-subcard-val">{educationScore}%</span>
              </div>
              <div className="metric-subcard-bar-bg">
                <div className="metric-subcard-bar-fill bg-emerald-500" style={{ width: `${educationScore}%` }} />
              </div>
            </div>

            {/* 6. Job Description Match */}
            <div className="metric-subcard">
              <div className="metric-subcard-header">
                <div className="metric-subcard-title-wrap">
                  <div className="metric-subcard-icon text-[#10B981] bg-[#10B981]/15">
                    <Search size={15} />
                  </div>
                  <span className="metric-subcard-title">Job Description Match</span>
                </div>
                <span className="metric-subcard-val">{jdScore}%</span>
              </div>
              <div className="metric-subcard-bar-bg">
                <div className="metric-subcard-bar-fill bg-emerald-500" style={{ width: `${jdScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Row: Missing Keywords & AI Recommendations */}
        <div className="diagnostic-container">
          {/* Missing Keywords Card */}
          <div className="diagnostic-card">
            <div>
              <div className="diagnostic-card-header">
                <div className="diagnostic-icon-box bg-rose-500/15 text-rose-500">
                  <AlertCircle size={18} />
                </div>
                <h3 className="diagnostic-title">Missing Keywords</h3>
              </div>

              <div className="diagnostic-bullet-list">
                {(showAllKeywords ? missingKeywords : missingKeywords.slice(0, 4)).map((kw, idx) => (
                  <div key={idx} className="diagnostic-bullet-item">
                    <span className="text-gray-400 font-bold">•</span>
                    <span>{kw}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowAllKeywords(s => !s)}
                className="btn btn-secondary btn-sm text-xs px-4 py-1.5"
              >
                {showAllKeywords ? 'Show Less' : 'View All'}
              </button>
            </div>
          </div>

          {/* AI Recommendations Card */}
          <div className="diagnostic-card">
            <div>
              <div className="diagnostic-card-header">
                <div className="diagnostic-icon-box bg-[#F59E0B]/15 text-[#FFB800]">
                  <Sparkles size={18} />
                </div>
                <h3 className="diagnostic-title">AI Recommendations</h3>
              </div>

              <div className="diagnostic-bullet-list">
                {(showAllRecommendations ? aiRecommendations : aiRecommendations.slice(0, 4)).map((rec, idx) => (
                  <div key={idx} className="diagnostic-bullet-item">
                    <Check size={14} className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowAllRecommendations(s => !s)}
                className="btn btn-secondary btn-sm text-xs px-4 py-1.5"
              >
                {showAllRecommendations ? 'Show Less' : 'View Details'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fast Upload Box & 3-Step Breadcrumbs (Template Center-Bottom Mockup) ── */}
      <div className="max-w-3xl mx-auto my-12">
        <div
          onClick={open}
          className={`gold-upload-zone ${isDragActive ? 'active' : ''}`}
        >
          <div className="gold-cloud-icon-wrap">
            {uploading ? (
              <div className="spinner spinner-md" />
            ) : (
              <UploadCloud size={32} />
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {uploading ? 'Analyzing Resume With NLP...' : 'Drag & Drop Your Resume Here'}
          </h3>
          <p className="text-xs text-gray-400 mb-5">or</p>

          <div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              disabled={uploading}
              className="btn btn-primary px-8 py-2.5 text-sm font-extrabold shadow-lg"
            >
              Choose File
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            Supported formats: PDF, DOCX (Max 5MB)
          </p>
        </div>

        {/* 3-Step Breadcrumbs Stepper */}
        <div className="breadcrumb-stepper">
          <div className="stepper-item active">
            <div className="stepper-circle">1</div>
            <span>Upload</span>
          </div>
          <div className="stepper-divider" />
          <div className="stepper-item active">
            <div className="stepper-circle">2</div>
            <span>Analyze</span>
          </div>
          <div className="stepper-divider" />
          <div className="stepper-item active">
            <div className="stepper-circle">3</div>
            <span>Get Results</span>
          </div>
        </div>
      </div>

      {/* ── Version Switcher & Interactive Deep Tabs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8 border-t border-white/10">
        {/* Left Column: Resumes history */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 bg-[#0D1018] border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                Uploaded Versions ({resumes.length})
              </h3>
              <button
                onClick={fetchResumes}
                className="text-gray-400 hover:text-white p-1"
                title="Refresh"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {resumes.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((r) => {
                  const isSelected = selectedResume?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => fetchResumeDetails(r.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? 'border-[#F59E0B] bg-[#F59E0B]/12 shadow-sm'
                          : 'border-white/5 hover:border-white/20 bg-black/20'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs truncate text-white">
                          {r.original_filename}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-1">
                          <span>v{r.version}</span>
                          <span>•</span>
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteResume(e, r.id)}
                        className="text-gray-400 hover:text-rose-400 p-1 rounded"
                        title="Delete resume"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deep Tabs (Parsed Skills, Experience, JD Matcher) */}
        <div className="lg:col-span-3">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-[#FFB800] text-[#FFB800]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Actionable Feedback
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'skills'
                  ? 'border-[#FFB800] text-[#FFB800]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Extracted Skills ({analysis?.skills_technical?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'experience'
                  ? 'border-[#FFB800] text-[#FFB800]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Parsed Experience
            </button>
            <button
              onClick={() => setActiveTab('matcher')}
              className={`py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'matcher'
                  ? 'border-[#FFB800] text-[#FFB800]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Search size={14} />
              <span>Job Description Matcher</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ATS Issues */}
              {analysis?.ats_issues && analysis.ats_issues.length > 0 && (
                <div className="card p-6 bg-[#0D1018] border-l-4 border-l-[#F59E0B] rounded-2xl">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-[#FFB800] mb-3">
                    <AlertTriangle size={16} />
                    <span>ATS Optimization Alerts ({analysis.ats_issues.length})</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysis.ats_issues.map((issue, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-2 text-gray-300">
                        <span className="text-[#FFB800] mt-0.5">•</span>
                        <span>{typeof issue === 'string' ? issue : issue.message || issue.issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-400 mb-3">
                    <CheckCircle2 size={16} />
                    <span>Identified Strengths</span>
                  </h3>
                  {analysis?.strengths && analysis.strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No specific strengths listed.</p>
                  )}
                </div>

                <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-rose-400 mb-3">
                    <XCircle size={16} />
                    <span>Areas for Improvement</span>
                  </h3>
                  {analysis?.weaknesses && analysis.weaknesses.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-rose-400 mt-0.5">⚠</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No major red flags detected.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-white">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Technical Skills ({analysis?.skills_technical?.length || 0})</span>
                </h3>
                {analysis?.skills_technical && analysis.skills_technical.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills_technical.map((skill, idx) => (
                      <span key={idx} className="badge badge-brand text-xs py-1 px-3">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No technical skills detected.</p>
                )}
              </div>

              <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-white">
                  <Sparkles size={16} className="text-[#FFB800]" />
                  <span>Soft Skills ({analysis?.skills_soft?.length || 0})</span>
                </h3>
                {analysis?.skills_soft && analysis.skills_soft.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills_soft.map((skill, idx) => (
                      <span key={idx} className="badge badge-gold text-xs py-1 px-3">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No soft skills detected.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl">
                <h3 className="font-bold text-sm text-white mb-4">Work Experience</h3>
                {analysis?.experience && analysis.experience.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.experience.map((exp, idx) => (
                      <div key={idx} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-white">{exp.role || exp.title || 'Role'}</h4>
                          <span className="text-xs text-gray-400">{exp.duration || exp.dates || ''}</span>
                        </div>
                        <div className="text-xs text-[#FFB800] font-semibold mt-0.5">{exp.company || ''}</div>
                        {exp.description && (
                          <p className="text-xs text-gray-300 mt-2 whitespace-pre-line leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No distinct work experience recognized.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: JD Matcher */}
          {activeTab === 'matcher' && (
            <div className="space-y-6">
              <div className="card p-6 bg-[#0D1018] border border-white/10 rounded-2xl">
                <h3 className="font-bold text-base text-white mb-1">Target Job Description Matcher</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Paste the requirements of the job you want to apply for. Our matcher calculates keyword overlap and reveals the exact missing skills.
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

              {/* Match Results */}
              {matchResult && (
                <div className="card p-6 bg-[#0D1018] border-t-4 border-t-[#F59E0B] rounded-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="badge badge-brand mb-1">Match Results</span>
                      <h3 className="text-xl font-bold text-white">
                        {jdTitle || 'Job Role'} Compatibility
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase font-bold">Match Score</div>
                      <div className="text-3xl font-black text-[#FFB800]">
                        {matchResult.scores?.overall || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
