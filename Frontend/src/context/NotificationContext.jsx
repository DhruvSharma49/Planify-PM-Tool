import React, { createContext, useContext, useState, useEffect } from 'react';
import api from "../utils/API";

import { getSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const socket = getSocket();
    socket.on('notification:new', ({ notification }) => {
      setNotifications(prev => [notification, ...prev]);
    });
    return () => socket.off('notification:new');
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch {}
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);