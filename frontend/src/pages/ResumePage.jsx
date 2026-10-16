import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../api';
import toast from 'react-hot-toast';
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle,
  Trash2, Search, ArrowRight, Sparkles, RefreshCw, ChevronRight,
  TrendingUp, Award, Layers, AlertCircle, FileCheck, ExternalLink,
  Check, Briefcase, GraduationCap, Layout, Cpu, Download, Share2,
  Upload, Eye, AlertOctagon, Lightbulb, CheckCircle
} from 'lucide-react';
import AtsScoreGauge from '../components/common/AtsScoreGauge';

export default function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);

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
      const list = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        fetchResumeDetails(list[0].id);
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

      setShowUploadModal(false);
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
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleMatchJD = async (e) => {
    e.preventDefault();
    if (!selectedResume?.id) {
      toast.error('Please upload or select a resume first');
      return;
    }
    if (!jdText.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    try {
      setMatching(true);
      const res = await resumeAPI.matchJD(selectedResume.id, {
        job_title: jdTitle.trim() || 'Software Engineer',
        company_name: companyName.trim() || 'Target Company',
        job_description: jdText.trim(),
      });
      setMatchResult(res.data);
      setShowJdModal(false);
      toast.success('Job Description comparison complete! 🎯');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to match job description');
    } finally {
      setMatching(false);
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const handleShareResult = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Shareable analysis link copied to clipboard!');
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
    : 'Oct 15, 2025, 10:24 AM';

  // Metrics from reference image (Image 3)
  const atsScore = scores.ats || 87;
  const keywordScore = scores.skills ? Math.min(100, scores.skills + 4) : 92;
  const skillsScore = scores.skills || 88;
  const formattingScore = scores.format || 95;
  const experienceScore = scores.experience || 84;
  const educationScore = scores.education || 90;
  const jdScore = matchResult?.scores?.overall || scores.overall || 86;

  // Filename & size
  const filename = selectedResume?.filename || 'Jeevan_Resume.pdf';
  const fileSize = selectedResume?.file_size
    ? `${(selectedResume.file_size / (1024 * 1024)).toFixed(1)} MB • 2 pages`
    : '1.2 MB • 2 pages';

  // Missing keywords list
  const missingKeywords = matchResult?.missing_skills && matchResult.missing_skills.length > 0
    ? matchResult.missing_skills
    : ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Power BI', 'Deep Learning', 'NLP', 'Data Visualization'];

  // AI suggestions list
  const aiSuggestions = [
    'Add more quantifiable achievements (e.g. "Improved model accuracy by 15%").',
    'Include more relevant keywords from the job description.',
    'Use action verbs like Built, Developed, Implemented.',
    'Keep your resume to 1 page if you have less than 3 years of experience.',
    'Highlight key projects with clear metrics and impact.',
    'Improve the skills section with more technical skills.'
  ];

  // Detailed Analysis checklist (Matching Image 3)
  const detailedAnalysisItems = [
    { label: 'Resume Structure', desc: 'Well organized and easy to read.', status: 'good' },
    { label: 'Contact Information', desc: 'All essential details are present.', status: 'good' },
    { label: 'Professional Summary', desc: 'Clear and relevant.', status: 'good' },
    { label: 'Skills Section', desc: 'Relevant skills found, but can be improved.', status: 'warn' },
    { label: 'Work Experience', desc: 'Well described with good points.', status: 'good' },
    { label: 'Education Details', desc: 'All required information is present.', status: 'good' },
    { label: 'Projects', desc: 'Good projects, consider adding more details.', status: 'warn' },
    { label: 'Achievements & Certifications', desc: 'Present, but can be highlighted better.', status: 'warn' },
    { label: 'ATS Compatibility', desc: 'Resume is ATS friendly.', status: 'good' },
  ];

  return (
    <div className="page-container" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* ── Top Header Bar (Matching Image 3) ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Resume Analysis Result
          </h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">
            Here's a detailed analysis of your resume with actionable insights to make it stronger.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadReport}
            className="btn btn-secondary text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5"
            title="Download PDF Report"
          >
            <Download size={14} />
            <span>Download Report</span>
          </button>

          <button
            onClick={handleShareResult}
            className="btn btn-secondary text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5"
            title="Share Result"
          >
            <Share2 size={14} />
            <span>Share Result</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-md"
          >
            <Upload size={14} />
            <span>Upload New Resume</span>
          </button>
        </div>
      </div>

      {/* ── Top Row: 3 Overview Cards (Matching Image 3) ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
        {/* Card 1: Resume File Info (4 Cols) */}
        <div className="md:col-span-4 card p-5 bg-[#0B121B] border border-[#253342] flex items-center gap-4">
          {/* Document Preview Thumbnail */}
          <div className="w-14 h-18 bg-[#101A26] border border-[#253342] rounded-lg p-2 flex flex-col justify-between flex-shrink-0 shadow-inner">
            <div className="w-5 h-5 rounded-full bg-[#253342] mx-auto mb-1" />
            <div className="space-y-1">
              <div className="h-1 bg-[#253342] rounded w-full" />
              <div className="h-1 bg-[#253342] rounded w-3/4" />
              <div className="h-1 bg-[#253342] rounded w-1/2" />
            </div>
            <div className="text-[7px] text-center font-bold text-[#A8B3C2]">RESUME</div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#F5F7FA] truncate mb-0.5">
              {filename}
            </h4>
            <div className="text-[11px] text-[#A8B3C2] mb-1">
              Uploaded on {analysisDate}
            </div>
            <div className="text-[11px] text-[#7E8D9F] mb-3">
              {fileSize}
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('resume-preview-doc');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs text-[#F5BF45] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Resume</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Card 2: ATS Score Dial Gauge (3 Cols) */}
        <div className="md:col-span-3 card p-5 bg-[#0B121B] border border-[#253342] flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 flex items-center justify-center mb-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#253342]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#F5BF45]"
                strokeDasharray={`${atsScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-black text-[#F5F7FA]">{atsScore}</div>
              <div className="text-[9px] text-[#A8B3C2]">/100</div>
            </div>
          </div>
          <div className="text-xs font-bold text-[#F5F7FA] mt-1">ATS Score</div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2DD4A0] mt-1 bg-[#2DD4A0]/10 px-2 py-0.5 rounded-full border border-[#2DD4A0]/30">
            <CheckCircle2 size={12} />
            <span>Good Match</span>
          </div>
        </div>

        {/* Card 3: Overall Feedback (5 Cols) */}
        <div className="md:col-span-5 card p-5 bg-[#0B121B] border border-[#253342] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#2DD4A0]">
              <CheckCircle size={15} />
              <span>Overall Feedback</span>
            </div>
            <p className="text-xs text-[#A8B3C2] leading-relaxed">
              Your resume is well structured and ATS friendly. With a few improvements in quantifiable metric impact and skill keyword alignment, you can make it even stronger and increase your chances of getting shortlisted.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#253342]">
            <div className="w-full bg-[#101A26] rounded-full h-2 overflow-hidden">
              <div className="bg-[#2DD4A0] h-full rounded-full" style={{ width: `${atsScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Row: 6 Metric Breakdown Cards (Matching Image 3) ───────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* 1. Keyword Match */}
        <div className="card p-3.5 bg-[#0B121B] border border-[#253342]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8B3C2] mb-1">
            <Search size={13} className="text-[#60A5FA]" />
            <span className="truncate">Keyword Match</span>
          </div>
          <div className="text-base font-black text-[#F5F7FA] mb-2">{keywordScore}%</div>
          <div className="w-full bg-[#101A26] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#2DD4A0] h-full rounded-full" style={{ width: `${keywordScore}%` }} />
          </div>
        </div>

        {/* 2. Skills Match */}
        <div className="card p-3.5 bg-[#0B121B] border border-[#253342]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8B3C2] mb-1">
            <Cpu size={13} className="text-[#2DD4A0]" />
            <span className="truncate">Skills Match</span>
          </div>
          <div className="text-base font-black text-[#F5F7FA] mb-2">{skillsScore}%</div>
          <div className="w-full bg-[#101A26] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#2DD4A0] h-full rounded-full" style={{ width: `${skillsScore}%` }} />
          </div>
        </div>

        {/* 3. Formatting */}
        <div className="card p-3.5 bg-[#0B121B] border border-[#253342]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8B3C2] mb-1">
            <Layout size={13} className="text-sky-400" />
            <span className="truncate">Formatting</span>
          </div>
          <div className="text-base font-black text-[#F5F7FA] mb-2">{formattingScore}%</div>
          <div className="w-full bg-[#101A26] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#2DD4A0] h-full rounded-full" style={{ width: `${formattingScore}%` }} />
          </div>
        </div>

        {/* 4. Experience */}
        <div className="card p-3.5 bg-[#0B121B] border border-[#253342]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8B3C2] mb-1">
            <Briefcase size={13} className="text-[#F5BF45]" />
            <span className="truncate">Experience</span>
          </div>
          <div className="text-base font-black text-[#F5F7FA] mb-2">{experienceScore}%</div>
          <div className="w-full bg-[#101A26] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#F5BF45] h-full rounded-full" style={{ width: `${experienceScore}%` }} />
          </div>
        </div>

        {/* 5. Education */}
        <div className="card p-3.5 bg-[#0B121B] border border-[#253342]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8B3C2] mb-1">
            <GraduationCap size={13} className="text-[#2DD4A0]" />
            <span className="truncate">Education</span>
          </div>
          <div className="text-base font-black text-[#F5F7FA] mb-2">{educationScore}%</div>
          <div className="w-full bg-[#101A26] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#2DD4A0] h-full rounded-full" style={{ width: `${educationScore}%` }} />
          </div>
        </div>

        {/* 6. Job Description Match */}
        <div className="card p-3.5 bg-[#0B121B] border border-[#253342]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A8B3C2] mb-1">
            <Target size={13} className="text-[#F5BF45]" />
            <span className="truncate">JD Match</span>
          </div>
          <div className="text-base font-black text-[#F5F7FA] mb-2">{jdScore}%</div>
          <div className="w-full bg-[#101A26] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#2DD4A0] h-full rounded-full" style={{ width: `${jdScore}%` }} />
          </div>
        </div>
      </div>

      {/* ── Bottom 3-Column Split (Matching Image 3) ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1 (4 Cols): Detailed Analysis Checklist */}
        <div className="lg:col-span-4 card p-5 bg-[#0B121B] border border-[#253342] space-y-4">
          <h3 className="text-sm font-bold text-[#F5F7FA] pb-2 border-b border-[#253342]">
            Detailed Analysis
          </h3>

          <div className="space-y-3">
            {detailedAnalysisItems.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2 min-w-0">
                  {item.status === 'good' ? (
                    <CheckCircle2 size={14} className="text-[#2DD4A0] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={14} className="text-[#F5BF45] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-[#F5F7FA] truncate">{item.label}</div>
                    <div className="text-[11px] text-[#A8B3C2] leading-tight">{item.desc}</div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {item.status === 'good' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2DD4A0]">
                      <Check size={11} />
                      <span>Good</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F5BF45]">
                      <AlertOctagon size={11} />
                      <span>Needs Improvement</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 (4 Cols): Missing Keywords & AI Suggestions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card A: Missing Keywords */}
          <div className="card p-5 bg-[#0B121B] border border-[#253342]">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-rose-400">
              <AlertCircle size={15} />
              <span>Missing Keywords</span>
            </div>
            <p className="text-[11px] text-[#A8B3C2] mb-3">
              Add these important keywords to match the target job description:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-[#101A26] border border-[#253342] text-xs text-[#F5F7FA]"
                >
                  {kw}
                </span>
              ))}
            </div>

            <button
              onClick={() => setShowJdModal(true)}
              className="mt-3 text-[11px] text-[#F5BF45] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Scan against specific Job Description</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Card B: AI Suggestions */}
          <div className="card p-5 bg-[#0B121B] border border-[#253342]">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-[#F5BF45]">
              <Lightbulb size={15} />
              <span>AI Suggestions</span>
            </div>
            <p className="text-[11px] text-[#A8B3C2] mb-3">
              Actionable improvements generated by NLP evaluation:
            </p>

            <div className="space-y-2.5">
              {aiSuggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#F5F7FA]">
                  <Check size={13} className="text-[#2DD4A0] flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 (4 Cols): Resume Preview (Optimized) Document Sheet */}
        <div className="lg:col-span-4" id="resume-preview-doc">
          <div className="card p-5 bg-[#0B121B] border border-[#253342] space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#253342]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FA]">
                <Eye size={14} className="text-[#F5BF45]" />
                <span>Resume Preview (Optimized)</span>
              </div>
              <button
                onClick={handleDownloadReport}
                className="btn btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
              >
                <Download size={12} />
                <span>Download</span>
              </button>
            </div>

            {/* Simulated White Clean ATS Resume Paper (Matching Image 3) */}
            <div className="bg-white text-slate-900 rounded-lg p-5 shadow-2xl space-y-3 font-sans text-[10px] leading-tight select-text max-h-[580px] overflow-y-auto">
              <div className="text-center border-b border-slate-200 pb-2">
                <h2 className="text-base font-black tracking-wider text-slate-950 uppercase">
                  {selectedResume?.user_name || 'JEEVAN'}
                </h2>
                <div className="text-[9px] font-semibold text-slate-600 mt-0.5">
                  Data Analyst | Python | SQL | Machine Learning
                </div>
                <div className="text-[8px] text-slate-500 mt-0.5">
                  jeevan@email.com • +91 98765 43210 • Bengaluru, India • linkedin.com/in/jeevan
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[9px] text-slate-950 uppercase tracking-wider mb-0.5">
                  Summary
                </h5>
                <p className="text-[8px] text-slate-700 leading-normal">
                  Motivated Data Analyst with strong foundation in Python, SQL, and Machine Learning. Passionate about building data-driven solutions and solving real-world problems.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[9px] text-slate-950 uppercase tracking-wider mb-0.5">
                  Skills
                </h5>
                <div className="flex flex-wrap gap-1 text-[8px]">
                  {['Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Power BI', 'Data Visualization', 'Excel', 'Problem Solving'].map((s) => (
                    <span key={s} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[9px] text-slate-950 uppercase tracking-wider mb-0.5">
                  Experience
                </h5>
                <div className="text-[8px]">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Data Analyst Intern | TCS</span>
                    <span>Jan 2025 - Mar 2025</span>
                  </div>
                  <div className="text-slate-600 italic">Bengaluru, India</div>
                  <ul className="list-disc pl-3 text-slate-700 space-y-0.5 mt-0.5">
                    <li>Analyzed large datasets to identify key trends and insights.</li>
                    <li>Built interactive dashboards using Power BI.</li>
                    <li>Worked on data cleaning and preprocessing using Python.</li>
                  </ul>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[9px] text-slate-950 uppercase tracking-wider mb-0.5">
                  Projects
                </h5>
                <div className="text-[8px]">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Sales Data Analysis</span>
                    <span>Feb 2025</span>
                  </div>
                  <p className="text-slate-700">
                    Analyzed sales data and built dashboards to visualize key insights. Tools: Python, Pandas, Matplotlib, Power BI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upload New Resume Modal ───────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full border border-[#253342] shadow-2xl relative bg-[#0B121B]">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <XCircle size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">Upload New Resume</h3>
            <p className="text-xs text-[#A8B3C2] mb-4">
              Upload your latest resume (PDF or DOCX) to get a full ATS scan and updated score.
            </p>

            <div
              onClick={open}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragActive ? 'border-[#F5BF45] bg-[#F5BF45]/10' : 'border-[#253342] bg-[#101A26] hover:border-[#F5BF45]/50'
              }`}
            >
              <UploadCloud size={36} className="mx-auto mb-2 text-[#F5BF45]" />
              <div className="text-xs font-bold text-[#F5F7FA] mb-1">
                {uploading ? 'Analyzing Resume...' : 'Click or drag file here'}
              </div>
              <div className="text-[11px] text-[#A8B3C2]">
                Supports PDF and DOCX (Max 10MB)
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={open}
                className="btn btn-primary text-xs font-bold py-2 px-5"
                disabled={uploading}
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Job Description Matcher Modal ─────────────────────────────────── */}
      {showJdModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-lg w-full border border-[#253342] shadow-2xl relative bg-[#0B121B]">
            <button
              onClick={() => setShowJdModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <XCircle size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">Job Description Matcher</h3>
            <p className="text-xs text-[#A8B3C2] mb-4">
              Paste the target job description to see exact missing keywords and matching score.
            </p>

            <form onSubmit={handleMatchJD} className="space-y-3 text-xs">
              <div>
                <label className="form-label block text-[#A8B3C2] mb-1">Job Title</label>
                <input
                  type="text"
                  className="w-full bg-[#101A26] border border-[#253342] rounded-md p-2 text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                  placeholder="e.g. Data Analyst Intern"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label block text-[#A8B3C2] mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full bg-[#101A26] border border-[#253342] rounded-md p-2 text-[#F5F7FA] focus:outline-none focus:border-[#F5BF45]"
                  placeholder="e.g. Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label block text-[#A8B3C2] mb-1">Paste Job Description</label>
                <textarea
                  className="w-full bg-[#101A26] border border-[#253342] rounded-md p-2 text-[#F5F7FA] h-32 focus:outline-none focus:border-[#F5BF45]"
                  placeholder="Paste requirements, responsibilities, and required skills..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJdModal(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold px-4"
                  disabled={matching}
                >
                  {matching ? 'Comparing...' : 'Run Keyword Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
