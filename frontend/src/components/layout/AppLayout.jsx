import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, MessageSquare, Briefcase, Map,
  FolderKanban, User, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Bell, ChevronDown, Search, Crown, Sparkles, CheckCircle2,
  FileCheck, Shield, Zap, ExternalLink, HelpCircle, Flame, Trophy
} from 'lucide-react';
import { CareerCraftLogo, LinkedInIcon } from '../common/Icons';
import LeaderboardModal from '../common/LeaderboardModal';
import StreakModal from '../common/StreakModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Resume Analyzer', icon: FileText, path: '/resume' },
  { label: 'Mock Interview', icon: MessageSquare, path: '/interview' },
  { label: 'Job Explorer', icon: Briefcase, path: '/jobs' },
  { label: 'Learning Roadmap', icon: Map, path: '/roadmap' },
  { label: 'Project Builder', icon: FolderKanban, path: '/projects' },
  { label: 'LinkedIn Optimizer', icon: LinkedInIcon, path: '/linkedin' },
];

const TOOLS_ITEMS = [
  { label: 'ATS Scanner', icon: FileCheck, path: '/resume' },
  { label: 'Interview Library', icon: MessageSquare, path: '/interview' },
  { label: 'Skill Analyzer', icon: Zap, path: '/dashboard' },
  { label: 'Career Coach', icon: User, path: '/profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const term = globalSearch.trim().toLowerCase();
    if (term.includes('job') || term.includes('hiring') || term.includes('engineer') || term.includes('developer')) {
      navigate(`/jobs?q=${encodeURIComponent(globalSearch.trim())}`);
    } else if (term.includes('resume') || term.includes('ats')) {
      navigate('/resume');
    } else if (term.includes('interview') || term.includes('mock')) {
      navigate('/interview');
    } else if (term.includes('project') || term.includes('build')) {
      navigate('/projects');
    } else if (term.includes('roadmap') || term.includes('learn')) {
      navigate('/roadmap');
    } else {
      navigate(`/jobs?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const rawName = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : 'Akash Malavatta';
  const nameParts = rawName.split(/\s+/).filter(Boolean);
  const initials = (nameParts.length > 1
    ? (nameParts[0][0] || '') + (nameParts[nameParts.length - 1][0] || '')
    : (nameParts[0]?.[0] || 'A')).toUpperCase();

  const displayName = rawName;
  const displayRole = typeof user?.target_role === 'string' && user.target_role.trim()
    ? user.target_role.trim()
    : (typeof user?.experience_level === 'string' && user.experience_level.trim() ? user.experience_level.trim() : 'AI Engineer');
  const isCollapsed = collapsed && !mobileOpen;

  // Dynamic search placeholder based on current route
  const getSearchPlaceholder = () => {
    if (location.pathname.startsWith('/jobs')) return 'Search for jobs, skills, company, or location...';
    if (location.pathname.startsWith('/projects')) return 'Search for projects, technologies, or skills...';
    if (location.pathname.startsWith('/roadmap')) return 'Search for skills, courses, tools, or career paths...';
    return 'Search for jobs, skills, company, or tools...';
  };

  return (
    <div className="app-layout tech-grid-bg">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          style={{ zIndex: 999 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar (Reference UI Design) ─────────────────────────────────── */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-logo">
          <CareerCraftLogo size={28} showText={!isCollapsed} />
          {mobileOpen && (
            <button
              className="btn btn-ghost btn-icon ml-auto text-muted hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="nav-icon" size={18} />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}

          {/* Upgrade to Pro Card (Matching Reference Designs media_1792187740448) */}
          {!isCollapsed && (
            <div className="sidebar-pro-card mt-auto mb-2">
              <div className="flex items-center gap-2 mb-1.5 text-[#F5BF45] font-bold text-xs">
                <Crown size={15} className="text-[#F5BF45]" />
                <span>Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-[#A8B3C2] mb-3 leading-relaxed">
                Get advanced analysis, more checks and personalized suggestions.
              </p>
              <button
                className="btn btn-primary w-full text-xs py-2 font-bold shadow-md"
                onClick={() => setShowProModal(true)}
              >
                Upgrade Now
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Bottom: User & Logout (Matching Reference Designs) */}
        <div className="sidebar-bottom">
          {!isCollapsed ? (
            <>
              <div
                className="flex items-center gap-2.5 px-2 py-1 cursor-pointer rounded-lg hover:bg-white/5 transition"
                onClick={() => navigate('/profile')}
                title="View Profile"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#F5F7FA] truncate">{displayName}</div>
                  <div className="text-[11px] text-[#A8B3C2] truncate capitalize">{displayRole}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  className="flex items-center gap-1.5 px-2 py-1 text-rose-400 hover:text-rose-300 text-xs font-semibold transition"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>

                <button
                  className="text-[11px] text-[#A8B3C2] hover:text-[#F5BF45] p-1"
                  onClick={() => setCollapsed(c => !c)}
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] font-extrabold text-xs flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/profile')}
                title={displayName}
              >
                {initials}
              </div>
              <button
                className="p-1 text-rose-400 hover:text-rose-300"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
              <button
                className="p-1 text-[#A8B3C2] hover:text-[#F5BF45]"
                onClick={() => setCollapsed(c => !c)}
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>


      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar Header */}
        <header className="topbar">
          <div className="topbar-left flex items-center gap-3">
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setMobileOpen(o => !o)}
              id="mobile-menu-btn"
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar (Matching Reference Design) */}
            <form onSubmit={handleGlobalSearch} className="topbar-search-wrap hidden sm:flex">
              <Search size={15} className="topbar-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="topbar-search-input"
                placeholder={getSearchPlaceholder()}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              <kbd className="topbar-kbd">Ctrl + K</kbd>
            </form>
          </div>

          <div className="topbar-right flex items-center gap-2.5">
            {/* Daily Practice Streak Pill */}
            <button
              onClick={() => setShowStreakModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition shadow-xs"
              title="Practice Streak: 5 Days (Click to view streak calendar)"
            >
              <Flame size={14} className="animate-pulse text-rose-400" />
              <span>5d</span>
            </button>

            {/* XP Points Pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F5BF45]/10 border border-[#F5BF45]/30 text-[#F5BF45] text-xs font-bold"
              title="Career XP: 1,240 XP (Level 4 Specialist)"
            >
              <Zap size={13} />
              <span>1,240 XP</span>
            </div>

            {/* Real-Time Leaderboard Pill */}
            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#101A26] border border-[#253342] text-[#F5F7FA] hover:border-[#F5BF45]/60 hover:text-[#F5BF45] text-xs font-bold transition"
              title="Real-Time Leaderboard: Rank #12"
            >
              <Trophy size={13} className="text-[#F5BF45]" />
              <span className="hidden sm:inline">Rank #12</span>
            </button>

            {/* Notification Bell with Red Badge */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 rounded-lg hover:bg-white/5 text-[#A8B3C2] hover:text-[#F5F7FA] transition-colors"
                title="Notifications"
                onClick={() => setNotifMenuOpen(o => !o)}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#05080D]">
                  3
                </span>
              </button>

              {notifMenuOpen && (
                <div className="topbar-dropdown-menu" style={{ width: 280, right: 0 }}>
                  <div className="px-3 py-2 border-b border-[#253342] text-xs font-bold text-[#F5F7FA] flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-[10px] text-[#F5BF45]">3 Unread</span>
                  </div>
                  <div className="p-1 max-h-64 overflow-y-auto space-y-1">
                    <div className="p-2 rounded hover:bg-white/5 text-xs cursor-pointer">
                      <div className="font-semibold text-[#F5F7FA]">Resume ATS Score Updated</div>
                      <div className="text-[11px] text-[#A8B3C2]">Your latest resume scan scored 87/100</div>
                    </div>
                    <div className="p-2 rounded hover:bg-white/5 text-xs cursor-pointer">
                      <div className="font-semibold text-[#F5F7FA]">New Job Matches Available</div>
                      <div className="text-[11px] text-[#A8B3C2]">128 opportunities match your target role</div>
                    </div>
                    <div className="p-2 rounded hover:bg-white/5 text-xs cursor-pointer">
                      <div className="font-semibold text-[#F5F7FA]">AI Mock Interview Ready</div>
                      <div className="text-[11px] text-[#A8B3C2]">Practice Technical and Behavioral rounds</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown Pill e.g. (A) Akash Student ▾ */}
            <div className="relative" ref={profileRef}>
              <div
                className="topbar-profile-pill"
                onClick={() => setProfileMenuOpen(o => !o)}
                title="Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D99B22] to-[#F5BF45] text-[#05080D] font-extrabold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#F5F7FA] leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#A8B3C2] capitalize leading-none">
                    {displayRole}
                  </span>
                </div>
                <ChevronDown size={14} className="text-[#A8B3C2]" />
              </div>

              {profileMenuOpen && (
                <div className="topbar-dropdown-menu">
                  <div className="px-3 py-2 border-b border-[#253342] mb-1">
                    <div className="text-xs font-bold text-[#F5F7FA]">{displayName}</div>
                    <div className="text-[11px] text-[#A8B3C2] truncate">{user?.email || 'user@careercraft.io'}</div>
                  </div>
                  <button
                    className="topbar-dropdown-item"
                    onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}
                  >
                    <User size={15} />
                    <span>View Profile</span>
                  </button>
                  <button
                    className="topbar-dropdown-item text-[#F5BF45]"
                    onClick={() => { setProfileMenuOpen(false); setShowProModal(true); }}
                  >
                    <Crown size={15} />
                    <span>Upgrade to Pro</span>
                  </button>
                  <div className="border-t border-[#253342] my-1" />
                  <button
                    className="topbar-dropdown-item danger"
                    onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                  >
                    <LogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>

      {/* ── Upgrade to Pro Modal ──────────────────────────────────────────── */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full border border-[#F5BF45]/40 shadow-2xl relative bg-[#0B121B]">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-[#A8B3C2] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F5BF45]/15 border border-[#F5BF45]/40 flex items-center justify-center text-[#F5BF45]">
                <Crown size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F7FA]">CareerCraft Pro</h3>
                <p className="text-xs text-[#A8B3C2]">Unlock your complete career acceleration suite</p>
              </div>
            </div>

            <div className="space-y-2.5 my-5 text-xs text-[#F5F7FA]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2DD4A0]" />
                <span>Unlimited ATS resume scans & instant PDF reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2DD4A0]" />
                <span>Full multi-round AI voice mock interviews (HR, Tech, STAR)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2DD4A0]" />
                <span>Personalized job matches & salary insight analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2DD4A0]" />
                <span>Interactive Learning Roadmaps with step-by-step progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#2DD4A0]" />
                <span>Full source code and architecture diagrams in Project Builder</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#101A26] border border-[#253342] text-center mb-5">
              <div className="text-xl font-black text-[#F5BF45]">₹499 <span className="text-xs font-normal text-[#A8B3C2]">/ month</span></div>
              <div className="text-[11px] text-[#A8B3C2] mt-0.5">Cancel anytime • 7-day money back guarantee</div>
            </div>

            <button
              className="btn btn-primary w-full font-bold py-2.5 text-sm"
              onClick={() => {
                toast.success('CareerCraft Pro activated for your account!');
                setShowProModal(false);
              }}
            >
              Get Started with Pro
            </button>
          </div>
        </div>
      )}

      {/* ── Real-Time Leaderboard Modal ───────────────────────────────────── */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        user={user}
      />

      {/* ── Daily Practice Streak Modal ────────────────────────────────────── */}
      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streak={5}
      />
    </div>
  );
}
