

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';
import { FiHome, FiFolder, FiPackage, FiBell, FiLogOut, FiCheck, FiX } from "react-icons/fi";
import api from '../utils/API';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const {
    unreadCount,
    notifications,
    markRead,
    markAllRead,
    acceptInvite,
    rejectInvite,
    actionLoading,
  } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const bellRef = useRef(null);
  const [notifPos, setNotifPos] = useState({ bottom: 0, left: 0 });

  useEffect(() => {
    fetchProjects();
  }, [location.pathname]);

  // Close notifications panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Planify</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-1 ${
              location.pathname === '/dashboard'
                ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-violet-400 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FiHome className="text-base" />
            Dashboard
          </Link>

          {/* Projects */}
          <div className="mt-4">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</div>
            {projects.map(project => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all mb-1 ${
                  location.pathname === `/projects/${project._id}`
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-400 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="text-base">{project.icon}</span>
                <span className="truncate font-medium">{project.title}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User area */}
        <div className="p-3 border-t border-slate-800 relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
              className="flex items-center gap-2 flex-1 p-2 rounded-xl hover:bg-slate-800/50 transition-all text-left"
            >
              <Avatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
            </button>

            {/* Notifications bell */}
            <button
              ref={bellRef}
              onClick={() => {
                if (!showNotifs && bellRef.current) {
                  const rect = bellRef.current.getBoundingClientRect();
                  setNotifPos({
                    bottom: window.innerHeight - rect.top + 8,
                    left: rect.left,
                  });
                }
                setShowNotifs(!showNotifs);
                setShowUserMenu(false);
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800/50 transition-all text-slate-400 hover:text-white"
            >
              <FiBell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User menu */}
          {showUserMenu && (
            <div ref={userMenuRef} className="mt-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl animate-slide-in">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}

          {/* Notifications panel — rendered via portal to escape sidebar clipping */}
          {showNotifs && ReactDOM.createPortal(
            <div
              ref={notifRef}
              style={{
                position: 'fixed',
                bottom: notifPos.bottom,
                left: notifPos.left,
                zIndex: 9999,
              }}
              className="w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-in overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list — scrollbar hidden */}
              <div
                className="max-h-96 overflow-y-auto divide-y divide-slate-800/50"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    <FiBell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 20).map((notif, idx) => {
                    if (!notif) return null;
                    const notifId = notif._id || notif.id || `notif-${idx}`;
                    const isInvite = notif.type === 'project_invite';
                    const alreadyResponded = notif?.meta?.responded;
                    const isLoading = actionLoading[notifId];

                    const projectIdFromMeta = notif?.meta?.projectId;
                    const projectIdFromLink = notif?.link?.split('/projects/')?.[1]?.split('/')?.[0];
                    const resolvedProjectId = projectIdFromMeta || projectIdFromLink;
                    const hasProjectId = !!resolvedProjectId;

                    const enrichedNotif = hasProjectId
                      ? { ...notif, meta: { ...(notif.meta || {}), projectId: resolvedProjectId } }
                      : notif;

                    let dateStr = '';
                    try {
                      if (notif.createdAt) {
                        dateStr = new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        });
                      }
                    } catch {}

                    return (
                      <div
                        key={notifId}
                        className={`px-4 py-3 transition-all ${!notif.read ? 'bg-violet-500/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.read ? 'bg-violet-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300 leading-snug">
                              {notif.message || 'New notification'}
                            </p>
                            {dateStr && <p className="text-xs text-slate-500 mt-1">{dateStr}</p>}

                            {isInvite && hasProjectId && !alreadyResponded && (
                              <div className="flex gap-2 mt-2.5">
                                <button
                                  onClick={() => acceptInvite(enrichedNotif)}
                                  disabled={!!isLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                  {isLoading === 'accepting' ? <span className="animate-pulse">Joining...</span> : <><FiCheck className="w-3 h-3" />Accept</>}
                                </button>
                                <button
                                  onClick={() => rejectInvite(enrichedNotif)}
                                  disabled={!!isLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                  {isLoading === 'rejecting' ? <span className="animate-pulse">Declining...</span> : <><FiX className="w-3 h-3" />Decline</>}
                                </button>
                              </div>
                            )}

                            {isInvite && alreadyResponded && (
                              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-md font-medium ${
                                alreadyResponded === 'accepted' ? 'bg-green-500/15 text-green-400' : 'bg-slate-700 text-slate-400'
                              }`}>
                                {alreadyResponded === 'accepted' ? '✓ Joined' : '✗ Declined'}
                              </span>
                            )}

                            {!isInvite && !notif.read && notifId && (
                              <button
                                onClick={() => markRead(notifId)}
                                className="mt-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}