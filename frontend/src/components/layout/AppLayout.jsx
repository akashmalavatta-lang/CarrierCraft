import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, MessageSquare, Briefcase, Map,
  FolderKanban, User, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Bell, ChevronDown
} from 'lucide-react';
import { CareerCraftLogo, LinkedInIcon } from '../common/Icons';
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

const BOTTOM_ITEMS = [
  { label: 'Profile', icon: User, path: '/profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'S';

  const displayName = user?.name || 'Sharanappa';
  const isCollapsed = collapsed && !mobileOpen;

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

      {/* Sidebar (Template Style) */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
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

        {/* Nav */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="sidebar-section-title">Navigation</div>}
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="nav-icon" size={19} />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            {!isCollapsed && <div className="sidebar-section-title">Account</div>}
            {BOTTOM_ITEMS.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? label : undefined}
              >
                <Icon className="nav-icon" size={19} />
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-2 p-1">
              <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="text-xs font-bold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-muted truncate">{user?.experience_level || 'Software Engineer'}</div>
              </div>
            </div>
          )}
          <button
            className="nav-item w-full"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} className="nav-icon text-rose-400" />
            {!isCollapsed && <span className="text-rose-400 text-xs font-semibold">Logout</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            className="nav-item w-full hidden-mobile"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            id="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-muted text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar (Matching Template with CAREER CRAFT Logo, Notification Bell, User Avatar Pill) */}
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
            <button
              className="btn btn-ghost btn-icon hidden-mobile"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div className="hidden-mobile">
              <CareerCraftLogo size={24} showText={true} />
            </div>
          </div>

          <div className="topbar-right flex items-center gap-4">
            {/* Notification Bell with Dot */}
            <button
              className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FFB800] ring-2 ring-[#05070B]" />
            </button>

            {/* User Profile Dropdown Pill e.g. (S) Sharanappa ▾ */}
            <div
              className="topbar-profile-pill"
              onClick={() => navigate('/profile')}
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FFE071] text-black font-extrabold text-xs flex items-center justify-center">
                {initials}
              </div>
              <span className="text-xs font-bold text-gray-200 hidden-mobile">
                {displayName}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
