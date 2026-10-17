import React from 'react';
import { Flame, Check, Sparkles, X, Calendar, Zap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const DAYS_OF_WEEK = [
  { day: 'Mon', completed: true, date: 'Oct 12' },
  { day: 'Tue', completed: true, date: 'Oct 13' },
  { day: 'Wed', completed: true, date: 'Oct 14' },
  { day: 'Thu', completed: true, date: 'Oct 15' },
  { day: 'Fri', completed: true, date: 'Oct 16', isToday: false },
  { day: 'Sat', completed: true, date: 'Oct 17', isToday: true },
  { day: 'Sun', completed: false, date: 'Oct 18' },
];

export default function StreakModal({ isOpen, onClose, streak = 5 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="card p-6 max-w-md w-full border border-rose-500/40 shadow-2xl relative bg-[#0B121B]">
        <div className="flex items-center justify-between pb-3 border-b border-[#253342] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F5F7FA]">Daily Practice Streak</h3>
              <p className="text-[11px] text-[#A8B3C2]">Consistency accelerates interview offers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#A8B3C2] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Big Flame Display */}
        <div className="text-center py-4 bg-[#101A26] rounded-2xl border border-[#253342] mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mb-2 border border-rose-500/30">
            <Flame size={36} className="text-rose-400 animate-bounce" />
          </div>
          <div className="text-3xl font-black text-[#F5F7FA]">{streak} Days Strong! 🔥</div>
          <p className="text-xs text-[#A8B3C2] mt-1">
            You're on track to unlock the <span className="text-[#F5BF45] font-bold">7-Day Consistency Badge</span> (+100 Bonus XP).
          </p>
        </div>

        {/* 7-Day Tracker Grid */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-xs font-semibold text-[#A8B3C2] mb-2.5">
            <span>This Week's Activity</span>
            <span className="text-emerald-400 font-bold">5 / 7 Days Active</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_OF_WEEK.map((item, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-center flex flex-col items-center justify-between transition-all ${
                  item.isToday
                    ? 'bg-[#F5BF45]/20 border-2 border-[#F5BF45]'
                    : item.completed
                    ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400'
                    : 'bg-[#101A26] border border-[#253342] text-[#7E8D9F]'
                }`}
              >
                <span className="text-[10px] font-bold mb-1">{item.day}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  item.completed
                    ? 'bg-rose-500 text-white'
                    : item.isToday
                    ? 'bg-[#F5BF45] text-[#05080D]'
                    : 'bg-[#253342] text-[#A8B3C2]'
                }`}>
                  {item.completed ? '✓' : item.isToday ? '🔥' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action recommendations */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-bold text-[#F5F7FA]">Ways to maintain your streak today:</div>
          <div className="p-2.5 rounded-lg bg-[#101A26] border border-[#253342] flex items-center justify-between text-xs">
            <span className="text-[#A8B3C2]">Complete 1 AI Mock Interview Question</span>
            <span className="text-[#F5BF45] font-bold">+30 XP</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#101A26] border border-[#253342] flex items-center justify-between text-xs">
            <span className="text-[#A8B3C2]">Run ATS Diagnostic on your resume</span>
            <span className="text-[#2DD4A0] font-bold">+20 XP</span>
          </div>
        </div>

        <Link
          to="/interview"
          onClick={onClose}
          className="btn btn-primary w-full text-xs font-bold py-2.5 text-center block"
        >
          Practice Mock Interview Now
        </Link>
      </div>
    </div>
  );
}
