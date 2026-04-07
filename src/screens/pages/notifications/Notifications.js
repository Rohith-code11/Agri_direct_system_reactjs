import { useCallback, useEffect, useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../../utils/authApi';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Notifications = ({ token }) => {
  const [data, setData] = useState({ unreadCount: 0, notifications: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setError('Missing authentication token.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getNotifications(token);
      setData(response?.data || { unreadCount: 0, notifications: [] });
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRead = async (notificationId) => {
    try {
      setBusyId(notificationId);
      const response = await markNotificationRead(token, notificationId);
      setData(response?.data || data);
    } catch (updateError) {
      setError(updateError.message || 'Failed to update notification.');
    } finally {
      setBusyId(null);
    }
  };

  const onReadAll = async () => {
    try {
      setBusyId('all');
      const response = await markAllNotificationsRead(token);
      setData(response?.data || data);
    } catch (updateError) {
      setError(updateError.message || 'Failed to update notifications.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Notifications</h2>
          <p>Stay on top of order confirmations, shipment progress, and payment updates.</p>
        </div>
        <div className="notification-actions">
          <span className="dashboard-chip">{data.unreadCount} unread</span>
          <button type="button" className="secondary-btn" onClick={onReadAll} disabled={busyId === 'all' || data.unreadCount === 0}>
            {busyId === 'all' ? 'Updating...' : 'Mark all read'}
          </button>
        </div>
      </div>

      {loading ? <p className="dashboard-message">Loading notifications...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {!loading && data.notifications.length === 0 ? <p className="dashboard-message">No notifications yet.</p> : null}

      <div className="commerce-stack">
        {data.notifications.map((notification) => (
          <article className={`dashboard-card notification-card ${notification.isRead ? 'is-read' : 'is-unread'}`} key={notification.id}>
            <div className="commerce-card-head">
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              <span className={`status-pill status-${notification.notificationType}`}>{notification.notificationType}</span>
            </div>
            <div className="notification-foot">
              <small>{formatDate(notification.createdAt)}</small>
              {!notification.isRead ? (
                <button type="button" onClick={() => onRead(notification.id)} disabled={busyId === notification.id}>
                  {busyId === notification.id ? 'Updating...' : 'Mark as read'}
                </button>
              ) : (
                <span className="notification-read-flag">Read</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Notifications;
