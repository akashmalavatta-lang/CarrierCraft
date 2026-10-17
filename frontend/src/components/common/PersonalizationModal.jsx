import React, { useState } from 'react';
import {
  Sparkles, Check, ArrowRight, Target, Briefcase, GraduationCap,
  Layers, Code, Database, Cpu, Cloud, Shield, Smartphone, Compass, X
} from 'lucide-react';
import { profileAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DOMAIN_OPTIONS = [
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    icon: Code,
    color: 'text-cyan-400',
    skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux', 'System Design'],
    desc: 'Web apps, modern UI/UX, responsive state management, and performance.',
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: Database,
    color: 'text-indigo-400',
    skills: ['Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
    desc: 'APIs, distributed architectures, databases, and microservices.',
  },
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    icon: Layers,
    color: 'text-emerald-400',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'GraphQL'],
    desc: 'End-to-end full stack development from sleek UI to production cloud.',
  },
  {
    id: 'datascience',
    title: 'Data Scientist',
    icon: Sparkles,
    color: 'text-amber-400',
    skills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics'],
    desc: 'Data insights, statistical models, predictive analytics, and BI.',
  },
  {
    id: 'aiml',
    title: 'AI / Machine Learning Engineer',
    icon: Cpu,
    color: 'text-purple-400',
    skills: ['Python', 'PyTorch', 'LLMs & GenAI', 'Deep Learning', 'FastAPI', 'MLOps'],
    desc: 'Neural networks, generative AI, model fine-tuning, and production ML.',
  },
  {
    id: 'devops',
    title: 'Cloud & DevOps Engineer',
    icon: Cloud,
    color: 'text-sky-400',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux', 'Terraform'],
    desc: 'Infrastructure as Code, container orchestration, and high availability.',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst',
    icon: Shield,
    color: 'text-rose-400',
    skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Cryptography', 'Linux', 'SOC'],
    desc: 'Security auditing, threat intelligence, vulnerability assessment.',
  },
  {
    id: 'mobile',
    title: 'Mobile App Developer',
    icon: Smartphone,
    color: 'text-teal-400',
    skills: ['React Native', 'Flutter', 'iOS/Swift', 'Android/Kotlin', 'REST APIs', 'Firebase'],
    desc: 'Cross-platform and native iOS/Android mobile applications.',
  },
];

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher / Student', sub: 'Looking for 1st job or internship' },
  { value: 'junior', label: 'Junior (1-2 yrs)', sub: 'Early career developer' },
  { value: 'mid', label: 'Mid-Level (3-5 yrs)', sub: 'Experienced practitioner' },
  { value: 'senior', label: 'Senior (5+ yrs)', sub: 'Tech lead or architect' },
];

const GOAL_OPTIONS = [
  'Crack Top Product Company (FAANG / Tier-1 MNC)',
  'Secure High-Paying Tech Internship / First Job',
  'Transition into this new Tech Domain',
  'Accelerate Career Promotion to Senior Level',
];

export default function PersonalizationModal({ isOpen, onClose, onSaved }) {
  const { user, updateUser } = useAuth();

  const [selectedDomain, setSelectedDomain] = useState(() => {
    const role = user?.target_role?.toLowerCase() || '';
    if (role.includes('front')) return 'frontend';
    if (role.includes('back')) return 'backend';
    if (role.includes('full')) return 'fullstack';
    if (role.includes('machine') || role.includes('ai')) return 'aiml';
    if (role.includes('data')) return 'datascience';
    if (role.includes('cloud') || role.includes('devops')) return 'devops';
    if (role.includes('cyber') || role.includes('security')) return 'cybersecurity';
    if (role.includes('mobile')) return 'mobile';
    return 'datascience';
  });

  const [customRole, setCustomRole] = useState(user?.target_role || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'fresher');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(GOAL_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  // Sync default skills when domain changes
  React.useEffect(() => {
    const domainObj = DOMAIN_OPTIONS.find(d => d.id === selectedDomain);
    if (domainObj) {
      setSelectedSkills(domainObj.skills.slice(0, 4));
      if (!customRole || DOMAIN_OPTIONS.some(d => d.title === customRole)) {
        setCustomRole(domainObj.title);
      }
    }
  }, [selectedDomain]);

  if (!isOpen) return null;

  const currentDomainObj = DOMAIN_OPTIONS.find(d => d.id === selectedDomain) || DOMAIN_OPTIONS[0];

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const finalRole = customRole.trim() || currentDomainObj.title;

    try {
      setSaving(true);
      await profileAPI.update({
        target_role: finalRole,
        experience_level: experienceLevel,
      });

      if (updateUser) {
        updateUser({
          target_role: finalRole,
          experience_level: experienceLevel,
        });
      }

      toast.success(`Career Console customized for ${finalRole}! 🚀`, { duration: 4000 });
      if (onSaved) onSaved({ target_role: finalRole, experience_level: experienceLevel });
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to update personalization:', err);
      // Fallback local update
      if (updateUser) {
        updateUser({
          target_role: finalRole,
          experience_level: experienceLevel,
        });
      }
      toast.success(`Preferences saved locally for ${finalRole}!`);
      if (onSaved) onSaved({ target_role: finalRole, experience_level: experienceLevel });
      if (onClose) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="card p-6 sm:p-7 max-w-3xl w-full bg-[#0B121B] border-2 border-[#F5BF45]/60 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#253342] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5BF45]/15 border border-[#F5BF45]/40 text-[#F5BF45] flex items-center justify-center shadow-lg shadow-[#F5BF45]/20">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#F5F7FA]">Personalize Your Career Console</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F5BF45]/20 text-[#F5BF45] border border-[#F5BF45]/30">
                  Custom AI Tailoring
                </span>
              </div>
              <p className="text-xs text-[#A8B3C2] mt-0.5">
                Tell us your dream domain. We dynamically adapt your dashboard recommendations, mock interview questions, and roadmap.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A8B3C2] hover:text-white hover:bg-white/5 transition"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* 1. Choose Target Domain */}
          <div>
            <label className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
              <Target size={14} className="text-[#F5BF45]" />
              <span>Step 1: Select Your Target Career Domain</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DOMAIN_OPTIONS.map((dom) => {
                const Icon = dom.icon;
                const isSelected = selectedDomain === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => {
                      setSelectedDomain(dom.id);
                      setCustomRole(dom.title);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-[#F5BF45]/15 border-[#F5BF45] shadow-md shadow-[#F5BF45]/15 ring-1 ring-[#F5BF45]'
                        : 'bg-[#101A26] border-[#253342] hover:border-[#F5BF45]/40 hover:bg-[#152232]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg bg-black/40 ${dom.color}`}>
                        <Icon size={18} />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#F5BF45] text-[#05080D] font-bold text-[10px] flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-[#F5BF45]' : 'text-[#F5F7FA]'}`}>
                        {dom.title}
                      </div>
                      <div className="text-[10px] text-[#7E8D9F] line-clamp-1 mt-0.5">
                        {dom.skills.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-[#A8B3C2] mb-1">
                <span>Specific Role Title (Optional custom wording):</span>
              </div>
              <input
                type="text"
                className="form-control text-xs py-2 bg-[#101A26] border-[#253342] focus:border-[#F5BF45] text-[#F5F7FA]"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Senior Frontend React Developer or PyTorch ML Engineer"
              />
            </div>
          </div>

          {/* 2. Experience Level */}
          <div>
            <label className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
              <GraduationCap size={14} className="text-[#F5BF45]" />
              <span>Step 2: Your Experience Level</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {EXPERIENCE_LEVELS.map((lvl) => {
                const isSelected = experienceLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.value)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#F5BF45]/15 border-[#F5BF45] text-[#F5BF45]'
                        : 'bg-[#101A26] border-[#253342] text-[#A8B3C2] hover:bg-[#152232]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#F5F7FA] flex items-center justify-between">
                      <span>{lvl.label}</span>
                      {isSelected && <span className="text-[#F5BF45]">✓</span>}
                    </div>
                    <div className="text-[10px] text-[#7E8D9F] mt-0.5">{lvl.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Skills of Interest */}
          <div>
            <label className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code size={14} className="text-[#F5BF45]" />
                <span>Step 3: Core Skills & Technologies to Focus On</span>
              </span>
              <span className="text-[10px] text-[#A8B3C2] font-normal">Click to toggle focus</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {currentDomainObj.skills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#F5BF45] text-[#05080D] border-[#F5BF45] shadow-xs'
                        : 'bg-[#101A26] text-[#A8B3C2] border-[#253342] hover:border-[#F5BF45]/40'
                    }`}
                  >
                    <span>{skill}</span>
                    {isSelected ? <Check size={12} /> : <span className="text-[10px] text-[#7E8D9F]">+</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Primary Milestone */}
          <div>
            <label className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#F5BF45]" />
              <span>Step 4: Primary 90-Day Career Milestone</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#2DD4A0]/15 border-[#2DD4A0] text-[#2DD4A0] font-bold'
                        : 'bg-[#101A26] border-[#253342] text-[#A8B3C2] hover:bg-[#152232]'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#253342] mt-4 flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#A8B3C2]">
            Targeting: <strong className="text-[#F5BF45]">{customRole || currentDomainObj.title}</strong>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Configuring...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Activate My Personalized Console</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
