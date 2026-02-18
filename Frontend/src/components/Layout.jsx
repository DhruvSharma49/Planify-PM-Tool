import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';
import api from '../utils/API';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markRead, markAllRead } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [location.pathname]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-void overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64  bg-surface border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br- from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">P</span>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Planify</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1 ${
              location.pathname === '/dashboard'
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-slate-400 hover:text-white hover:bg-muted'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            Dashboard
          </Link>

          {/* Projects */}
          <div className="mt-4">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</div>
            {projects.map(project => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors mb-0.5 ${
                  location.pathname === `/projects/${project._id}`
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'text-slate-400 hover:text-white hover:bg-muted'
                }`}
              >
                <span className="text-base">{project.icon}</span>
                <span className="truncate font-medium">{project.title}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User area */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
              className="flex items-center gap-2 flex-1 p-2 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <Avatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
            </button>
            {/* Notifications bell */}
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User menu dropdown */}
          {showUserMenu && (
            <div className="mt-2 bg-card border border-border rounded-xl shadow-xl animate-slide-in">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-muted rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}

          {/* Notifications panel */}
          {showNotifs && (
            <div className="absolute bottom-20 left-3 w-72 bg-card border border-border rounded-2xl shadow-2xl animate-slide-in z-50">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                ) : (
                  notifications.slice(0, 20).map(notif => (
                    <div
                      key={notif._id}
                      onClick={() => markRead(notif._id)}
                      className={`p-3 border-b border-border/50 cursor-pointer hover:bg-muted transition-colors ${!notif.read ? 'bg-violet-500/5' : ''}`}
                    >
                      <div className="flex gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5  ${!notif.read ? 'bg-violet-500' : 'bg-transparent'}`} />
                        <div>
                          <p className="text-sm text-slate-300">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}