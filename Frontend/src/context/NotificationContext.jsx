import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/API";
import { getSocket } from "../utils/socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [actionLoading, setActionLoading] = useState({}); // { notifId: true/false }
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const socket = getSocket();
    socket.on("notification:new", ({ notification }) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => socket.off("notification:new");
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch {}
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  // ─── Accept project invite ─────────────────────────────────────────────────
  const acceptInvite = async (notification) => {
    const projectId = notification?.meta?.projectId;
    if (!projectId) {
      alert("Project ID missing. Please refresh and try again.");
      return;
    }

    const notifId = notification._id || notification.id;
    setActionLoading((prev) => ({ ...prev, [notifId]: "accepting" }));
    try {
      await api.post(`/projects/${projectId}/accept-invite`);
      setNotifications((prev) =>
        prev.map((n) => {
          const nId = n._id || n.id;
          return nId === notifId
            ? {
                ...n,
                read: true,
                meta: { ...(n.meta || {}), responded: "accepted" },
              }
            : n;
        }),
      );
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept invite");
    } finally {
      setActionLoading((prev) => ({ ...prev, [notifId]: false }));
    }
  };

  // ─── Reject project invite ─────────────────────────────────────────────────
  const rejectInvite = async (notification) => {
    const projectId = notification?.meta?.projectId;
    if (!projectId) {
      alert("Project ID missing. Please refresh and try again.");
      return;
    }

    const notifId = notification._id || notification.id;
    setActionLoading((prev) => ({ ...prev, [notifId]: "rejecting" }));
    try {
      await api.post(`/projects/${projectId}/reject-invite`);
      setNotifications((prev) =>
        prev.map((n) => {
          const nId = n._id || n.id;
          return nId === notifId
            ? {
                ...n,
                read: true,
                meta: { ...(n.meta || {}), responded: "rejected" },
              }
            : n;
        }),
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject invite");
    } finally {
      setActionLoading((prev) => ({ ...prev, [notifId]: false }));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        addNotification,
        acceptInvite,
        rejectInvite,
        actionLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
