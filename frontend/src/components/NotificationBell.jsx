import { useState, useEffect } from 'react';
import axios from '../api/axios'; // adjust this path to match your project's axios instance
import Notification from './NotificationBell';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: '22px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white',
            borderRadius: '50%', fontSize: '11px', padding: '2px 6px', fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '36px', width: '320px', maxHeight: '400px',
          overflowY: 'auto', background: '#1e1e2e', border: '1px solid #333', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #333' }}>
            <strong style={{ color: '#fff' }}>Notifications</strong>
            <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '13px' }}>
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: '16px', color: '#888', textAlign: 'center' }}>No notifications yet</p>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                style={{
                  padding: '10px 14px', borderBottom: '1px solid #2a2a3a', cursor: 'pointer',
                  background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.1)'
                }}
              >
                <p style={{ margin: 0, color: '#eee', fontSize: '13px' }}>{n.message}</p>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}