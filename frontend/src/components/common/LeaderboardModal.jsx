import React from 'react';
import { Trophy, Flame, Zap, Medal, X, ArrowUpRight, Crown, Sparkles, CheckCircle2 } from 'lucide-react';

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Priya Sharma', role: 'Full Stack Engineer', xp: 3420, streak: 18, avatarBg: 'from-amber-400 to-amber-600', badge: '🥇 Diamond' },
  { rank: 2, name: 'Rahul Verma', role: 'ML & AI Engineer', xp: 3150, streak: 14, avatarBg: 'from-slate-300 to-slate-500', badge: '🥈 Diamond' },
  { rank: 3, name: 'Ananya Gupta', role: 'Data Scientist', xp: 2890, streak: 12, avatarBg: 'from-amber-600 to-amber-800', badge: '🥉 Platinum' },
  { rank: 4, name: 'Siddharth Rao', role: 'Backend Architect', xp: 2540, streak: 10, avatarBg: 'from-blue-500 to-indigo-600', badge: 'Platinum' },
  { rank: 5, name: 'Kavya Nair', role: 'DevOps / Cloud Specialist', xp: 2310, streak: 9, avatarBg: 'from-purple-500 to-pink-600', badge: 'Platinum' },
  { rank: 6, name: 'Aditya Patel', role: 'Frontend Engineer', xp: 2120, streak: 8, avatarBg: 'from-emerald-500 to-teal-600', badge: 'Gold' },
  { rank: 7, name: 'Sneha Deshmukh', role: 'AI Researcher', xp: 1980, streak: 7, avatarBg: 'from-rose-500 to-red-600', badge: 'Gold' },
  { rank: 8, name: 'Vikram Malhotra', role: 'Software Engineer', xp: 1750, streak: 6, avatarBg: 'from-cyan-500 to-blue-600', badge: 'Gold' },
  { rank: 9, name: 'Rohan Mehra', role: 'Product Analyst', xp: 1560, streak: 5, avatarBg: 'from-amber-500 to-orange-600', badge: 'Silver' },
  { rank: 10, name: 'Pooja Iyer', role: 'Cloud Engineer', xp: 1420, streak: 5, avatarBg: 'from-indigo-500 to-purple-600', badge: 'Silver' },
  { rank: 12, name: 'Akash Malavatta (You)', role: 'AI / Data Science Engineer', xp: 1240, streak: 5, avatarBg: 'from-[#D99B22] to-[#F5BF45]', badge: 'Silver', isCurrent: true },
];

export default function LeaderboardModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const currentUser = {
    rank: 12,
    name: user?.name ? `${user.name} (You)` : 'Akash Malavatta (You)',
    role: user?.target_role || 'AI / Data Science Engineer',
    xp: 1240,
    streak: 5,
    badge: 'Silver League',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="card p-6 max-w-2xl w-full border border-[#F5BF45]/40 shadow-2xl relative bg-[#0B121B] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#253342] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] flex items-center justify-center font-black shadow-lg shadow-[#F5BF45]/20">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#F5F7FA]">Real-Time Leaderboard</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30 animate-pulse">
                  ● LIVE
                </span>
              </div>
              <p className="text-xs text-[#A8B3C2]">Weekly Career Readiness & Practice League • Resets Sundays 23:59 IST</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8B3C2] hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current User Spotlight Banner */}
        <div className="p-3.5 rounded-xl bg-[#101A26] border border-[#F5BF45]/40 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] font-black text-xs flex items-center justify-center">
              #{currentUser.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#F5F7FA]">{currentUser.name}</span>
                <span className="badge badge-brand text-[10px] px-1.5 py-0.5">Silver Tier</span>
              </div>
              <div className="text-xs text-[#A8B3C2]">{currentUser.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#F5BF45] justify-end">
                <Zap size={13} />
                <span>{currentUser.xp} XP</span>
              </div>
              <div className="text-[10px] text-[#A8B3C2]">180 XP to Rank #11</div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-400">
              <Flame size={14} />
              <span>{currentUser.streak}d</span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {LEADERBOARD_DATA.slice(0, 3).map((candidate) => (
            <div
              key={candidate.rank}
              className={`p-3 rounded-xl border text-center transition ${
                candidate.rank === 1
                  ? 'bg-gradient-to-b from-[#F5BF45]/15 to-[#0B121B] border-[#F5BF45]/50 shadow-md shadow-[#F5BF45]/10'
                  : 'bg-[#101A26] border-[#253342]'
              }`}
            >
              <div className="text-xs font-black mb-1">
                {candidate.rank === 1 ? '🥇 1st Place' : candidate.rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
              </div>
              <div className={`w-9 h-9 mx-auto rounded-full bg-gradient-to-tr ${candidate.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-sm mb-1.5`}>
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="font-bold text-xs text-[#F5F7FA] truncate">{candidate.name}</div>
              <div className="text-[10px] text-[#A8B3C2] truncate">{candidate.role}</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-xs font-black text-[#F5BF45]">
                <Zap size={11} />
                <span>{candidate.xp} XP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[320px]">
          {LEADERBOARD_DATA.map((candidate) => {
            const isUser = candidate.isCurrent;
            return (
              <div
                key={candidate.rank}
                className={`p-2.5 rounded-lg flex items-center justify-between text-xs transition ${
                  isUser
                    ? 'bg-[#F5BF45]/15 border border-[#F5BF45] font-bold'
                    : 'bg-[#101A26]/70 hover:bg-[#101A26] border border-[#253342]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 text-center font-black ${
                    candidate.rank === 1 ? 'text-[#F5BF45]' : candidate.rank === 2 ? 'text-slate-300' : candidate.rank === 3 ? 'text-amber-500' : 'text-[#A8B3C2]'
                  }`}>
                    #{candidate.rank}
                  </span>
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${candidate.avatarBg} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className={`truncate ${isUser ? 'text-[#F5BF45] font-extrabold' : 'text-[#F5F7FA] font-medium'}`}>
                      {candidate.name}
                    </div>
                    <div className="text-[10px] text-[#A8B3C2] truncate">{candidate.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                    <Flame size={12} />
                    <span>{candidate.streak}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#F5BF45] font-black text-xs w-16 justify-end">
                    <Zap size={12} />
                    <span>{candidate.xp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#253342] mt-4 flex items-center justify-between text-xs text-[#A8B3C2]">
          <span>Earn +30 XP per Mock Interview & +20 XP per ATS scan</span>
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
