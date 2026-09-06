/**
 * JANSETU NOTIFICATIONS ENGINE (js/notifications.js)
 * In-app notification center service with unread badge management
 */

const Notifications = {
  /**
   * Get all notifications for current logged in user
   */
  getUserNotifications(userId) {
    const allNotifs = Storage.get(STORAGE_KEYS.NOTIFICATIONS, []);
    return allNotifs.filter(n => n.userId === userId || n.userId === 'all');
  },

  /**
   * Get unread notification count
   */
  getUnreadCount(userId) {
    const userNotifs = this.getUserNotifications(userId);
    return userNotifs.filter(n => !n.isRead).length;
  },

  /**
   * Create and push an in-app notification
   */
  createNotification(notifData) {
    const allNotifs = Storage.get(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif = {
      id: 'notif-' + Date.now(),
      userId: notifData.userId || 'usr-1',
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'info', // status_update, resolved, badge, civic_alert, assigned
      complaintId: notifData.complaintId || null,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    allNotifs.unshift(newNotif);
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, allNotifs);

    // Update UI badge if present on page
    this.updateBadgeUI();

    return newNotif;
  },

  /**
   * Mark single notification as read
   */
  markAsRead(notifId) {
    const allNotifs = Storage.get(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = allNotifs.map(n => (n.id === notifId ? { ...n, isRead: true } : n));
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.updateBadgeUI();
  },

  /**
   * Mark all notifications for user as read
   */
  markAllAsRead(userId) {
    const allNotifs = Storage.get(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = allNotifs.map(n =>
      (n.userId === userId || n.userId === 'all') ? { ...n, isRead: true } : n
    );
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.updateBadgeUI();
  },

  /**
   * Refresh navigation bell badge count
   */
  updateBadgeUI() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const count = this.getUnreadCount(user.id);
    const badgeElements = document.querySelectorAll('.notification-badge-count');
    badgeElements.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    });
  }
};
