// ============================================================
// NOTIFICATIONS PANEL
// ============================================================
const NotificationsPanel = ({ onClose }) => {
  const { notifications, clearNotifications } = useApp();
  return (
    <div style={{
      position: "fixed", top: 60, right: 20, width: 360, zIndex: 1500,
      background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14,
      boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      animation: "slideDown 0.2s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>Notifications</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={clearNotifications} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>Clear all</button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: theme.textDim, fontSize: 14 }}>No notifications yet</div>
        ) : (
          notifications.map((n, i) => (
            <div key={n.id} style={{
              display: "flex", gap: 12, padding: "14px 20px",
              borderBottom: i < notifications.length - 1 ? `1px solid ${theme.border}` : "none",
              background: !n.read ? theme.accentDim : "transparent",
            }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>
                {n.type === "move" ? "↗️" : n.type === "comment" ? "💬" : n.type === "assign" ? "👤" : "✨"}
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, color: theme.text }}>{n.message}</p>
                <span style={{ fontSize: 11, color: theme.textDim }}>{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};