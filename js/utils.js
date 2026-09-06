/**
 * JANSETU UTILITIES (js/utils.js)
 * Helper functions: Date/Time formatting, ID generators, GPS distance, Indian formatting
 */

const Utils = {
  /**
   * Generate unique Complaint ID: JS-2026-XXXXXX
   */
  generateComplaintId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `JS-${year}-${randomNum}`;
  },

  /**
   * Format ISO Date string to readable Indian date (e.g. 15 Aug 2026)
   */
  formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Format date with time (e.g. 15 Aug 2026, 04:30 PM)
   */
  formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Human readable time ago (e.g. "2 hours ago", "Yesterday")
   */
  timeAgo(isoString) {
    if (!isoString) return '';
    const now = new Date();
    const past = new Date(isoString);
    const elapsedSeconds = Math.floor((now - past) / 1000);

    if (elapsedSeconds < 60) return 'Just now';
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  },

  /**
   * Format Indian Rupee value (₹)
   */
  formatRupee(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Haversine formula to compute distance between two coords in kilometers
   */
  getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Escape HTML to prevent XSS in rendering
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Copy text to clipboard with notification
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  /**
   * Truncate string with ellipsis
   */
  truncate(str, length = 60) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  }
};
