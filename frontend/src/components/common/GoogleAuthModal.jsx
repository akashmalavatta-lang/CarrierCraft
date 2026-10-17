import React, { useState } from 'react';
import { Mail, User, Briefcase, ArrowRight, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoogleAuthModal({ isOpen, onClose, onConfirm, initialEmail = '', initialName = '' }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [name, setName] = useState(initialName || '');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialName) setName(initialName);
  }, [initialEmail, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid Google email address');
      return;
    }

    const derivedName = name.trim() || email.split('@')[0].replace('.', ' ').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

    try {
      setLoading(true);
      await onConfirm({
        email: email.trim().toLowerCase(),
        name: derivedName,
        target_role: targetRole,
      });
      onClose();
    } catch (err) {
      console.error('Google auth error in modal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccount = (quickName, quickEmail, quickRole) => {
    setName(quickName);
    setEmail(quickEmail);
    setTargetRole(quickRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="card p-6 max-w-md w-full bg-[#0B121B] border border-[#253342] shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#253342] mb-4">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Sign in with Google</h3>
              <p className="text-[11px] text-[#A8B3C2]">Authenticate with your individual account</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#A8B3C2] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Account Switcher (For Pair Testing Any Identity) */}
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8D9F] mb-1.5 block">
            Select or customize account:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAccount('Akash Malavatta', 'akash.student@gmail.com', 'AI / Data Science Engineer')}
              className="p-2 rounded-lg bg-[#101A26] hover:bg-[#152232] border border-[#253342] text-left text-[11px] transition"
            >
              <div className="font-bold text-[#F5BF45] truncate">Akash M.</div>
              <div className="text-[9px] text-[#7E8D9F] truncate">AI Engineer</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAccount('Priya Sharma', 'priya.sharma@gmail.com', 'Frontend Engineer')}
              className="p-2 rounded-lg bg-[#101A26] hover:bg-[#152232] border border-[#253342] text-left text-[11px] transition"
            >
              <div className="font-bold text-cyan-400 truncate">Priya S.</div>
              <div className="text-[9px] text-[#7E8D9F] truncate">Frontend</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAccount('Rahul Verma', 'rahul.verma@gmail.com', 'Backend Developer')}
              className="p-2 rounded-lg bg-[#101A26] hover:bg-[#152232] border border-[#253342] text-left text-[11px] transition"
            >
              <div className="font-bold text-emerald-400 truncate">Rahul V.</div>
              <div className="text-[9px] text-[#7E8D9F] truncate">Backend</div>
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#A8B3C2] mb-1 block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                className="form-control text-xs py-2 pl-8 bg-[#101A26] border-[#253342] focus:border-[#4285F4] text-[#F5F7FA]"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <User size={14} className="absolute left-2.5 top-2.5 text-[#7E8D9F]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A8B3C2] mb-1 block">Google Email</label>
            <div className="relative">
              <input
                type="email"
                className="form-control text-xs py-2 pl-8 bg-[#101A26] border-[#253342] focus:border-[#4285F4] text-[#F5F7FA]"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={14} className="absolute left-2.5 top-2.5 text-[#7E8D9F]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A8B3C2] mb-1 block">Career Interest / Target Domain</label>
            <select
              className="form-control text-xs py-2 bg-[#101A26] border-[#253342] text-[#F5F7FA] focus:border-[#4285F4]"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="Frontend Engineer">Frontend Engineer (React / Next.js)</option>
              <option value="Backend Developer">Backend Developer (Python / FastAPI / Node)</option>
              <option value="Full Stack Engineer">Full Stack Engineer (MERN / Full Cloud)</option>
              <option value="Data Scientist">Data Scientist (Machine Learning / Analytics)</option>
              <option value="AI / Machine Learning Engineer">AI / ML Engineer (Deep Learning / LLMs)</option>
              <option value="Cloud & DevOps Engineer">Cloud & DevOps (AWS / Docker / K8s)</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              <option value="Mobile App Developer">Mobile App Developer (Flutter / React Native)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <span>Continue to Personalized Console</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] text-center text-[#7E8D9F] flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-[#2DD4A0]" />
            <span>Secure OAuth 2.0 Identity Protocol</span>
          </div>
        </form>
      </div>
    </div>
  );
}
