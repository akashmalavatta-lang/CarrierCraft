import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, MessageSquare, Briefcase, Map,
  FolderKanban, User, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { LinkedInIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Resume AI', icon: FileText, path: '/resume' },
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
    : 'U';

  const isCollapsed = collapsed && !mobileOpen;

  return (
    <div className="app-layout tech-grid-bg">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ zIndex: 999 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="CareerCraft Logo" className="sidebar-logo-img" />
          {!isCollapsed && (
            <span className="sidebar-logo-text">
              Career<span>Craft</span>
            </span>
          )}
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
          {!isCollapsed && <div className="sidebar-section-title">Main</div>}
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="nav-icon" size={20} />
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
                <Icon className="nav-icon" size={20} />
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3 p-2">
              <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div className="text-sm font-semibold truncate">{user?.name}</div>
                <div className="text-xs text-muted truncate">{user?.experience_level || 'Fresher'}</div>
              </div>
            </div>
          )}
          <button
            className="nav-item w-full"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="nav-icon text-danger" />
            {!isCollapsed && <span style={{ color: 'var(--rose-500)' }}>Logout</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            className="nav-item w-full hidden-mobile"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            id="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-secondary">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
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
          </div>

          <div className="topbar-right">
            <div className="text-sm text-secondary font-medium hidden-mobile">
              {user?.target_role && (
                <span className="badge badge-brand">
                  🎯 {user.target_role}
                </span>
              )}
            </div>
            <div
              className="user-avatar"
              onClick={() => navigate('/profile')}
              title={user?.name}
            >
              {initials}
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
