/**
 * JANSETU BACKEND API CLIENT BRIDGE (js/api.js)
 * Automatically detects if running against the Node.js server (http://localhost:3000)
 * and bridges frontend state with REST endpoints, with seamless fallback to localStorage.
 */

const API = {
  baseUrl: window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:3000',
  isServerAvailable: false,

  async checkServer() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { method: 'GET', cache: 'no-cache' });
      if (res.ok) {
        this.isServerAvailable = true;
        console.log('📡 JanSetu Backend Connected:', this.baseUrl);
        return true;
      }
    } catch (e) {
      this.isServerAvailable = false;
      console.log('ℹ️ Running in Client-First LocalStorage mode.');
    }
    return false;
  },

  async getComplaints(filters = {}) {
    if (this.isServerAvailable) {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${this.baseUrl}/api/complaints?${query}`);
        const data = await res.json();
        if (data.success) return data.complaints;
      } catch (e) {
        console.error('API Error, falling back to storage:', e);
      }
    }
    return Storage.get(STORAGE_KEYS.COMPLAINTS, []);
  },

  async createComplaint(complaintData) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/complaints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complaintData)
        });
        const data = await res.json();
        if (data.success) return data.complaint;
      } catch (e) {
        console.error('API Error:', e);
      }
    }
    return null;
  },

  async upvoteComplaint(id) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/complaints/${id}/upvote`, { method: 'POST' });
        return await res.json();
      } catch (e) {
        console.error('API Error:', e);
      }
    }
    return null;
  },

  async updateComplaintStatus(id, statusData) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/complaints/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statusData)
        });
        return await res.json();
      } catch (e) {
        console.error('API Error:', e);
      }
    }
    return null;
  }
};

// Check server status immediately on load
API.checkServer();
