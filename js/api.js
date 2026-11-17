/**
 * JANSETU CENTRALIZED API CLIENT (js/api.js)
 * High-performance, production-grade REST API client bridge.
 * Features:
 * - Automatic base URL resolution and health monitoring
 * - Centralized token storage with 'Authorization: Bearer <token>' header injection
 * - Unified request/response pipeline with HTTP status code handling (200, 201, 400, 401, 403, 404, 500)
 * - Safe fallback to persistent client-side storage when server is unreachable
 * - Standardized error formatting without raw crashes
 */

const API = {
  baseUrl: window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:3000',
  isServerAvailable: false,
  tokenKey: 'jansetu_auth_token',

  /**
   * Token Management
   */
  getToken() {
    return localStorage.getItem(this.tokenKey) || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  },

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  },

  /**
   * Health Check & Server Availability
   */
  async checkServer() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        this.isServerAvailable = true;
        return true;
      }
    } catch (e) {
      this.isServerAvailable = false;
    }
    return false;
  },

  /**
   * Core HTTP Request Dispatcher
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    // Auto-attach auth token if present
    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type') || '';
      let data = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: response.ok, message: text };
      }

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.warn('API 401 Unauthorized:', endpoint);
        }
        return {
          success: false,
          status: response.status,
          message: data.message || `Request failed with status ${response.status}`,
          errors: data.errors || null,
          data: data
        };
      }

      return {
        success: true,
        status: response.status,
        ...data
      };
    } catch (err) {
      console.warn(`Network / Fetch error calling ${endpoint}:`, err.message);
      return {
        success: false,
        status: 0,
        networkError: true,
        message: 'Unable to connect to JanSetu backend server. Operating in offline/client mode.'
      };
    }
  },

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================
  auth: {
    async login(email, password) {
      return API.request('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
    },

    async register(userData) {
      return API.request('/api/auth/register', {
        method: 'POST',
        body: userData
      });
    },

    async verifyEmail(token) {
      return API.request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: 'GET'
      });
    },

    async resendVerification(email) {
      return API.request('/api/auth/resend-verification', {
        method: 'POST',
        body: { email }
      });
    },

    async getMe() {
      return API.request('/api/auth/me', {
        method: 'GET'
      });
    }
  },

  // ==========================================
  // COMPLAINT ENDPOINTS
  // ==========================================
  complaints: {
    async list(filters = {}) {
      const query = new URLSearchParams(filters).toString();
      const endpoint = query ? `/api/complaints?${query}` : '/api/complaints';
      const res = await API.request(endpoint, { method: 'GET' });
      if (res.success && res.complaints) {
        return res.complaints;
      }
      return Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    },

    async get(id) {
      const res = await API.request(`/api/complaints/${encodeURIComponent(id)}`, { method: 'GET' });
      if (res.success && res.complaint) {
        return res.complaint;
      }
      const list = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
      return list.find(c => c.id === id) || null;
    },

    async create(complaintData) {
      const res = await API.request('/api/complaints', {
        method: 'POST',
        body: complaintData
      });
      if (res.success && res.complaint) {
        return res.complaint;
      }
      return null;
    },

    async updateStatus(id, updatePayload) {
      return API.request(`/api/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        body: updatePayload
      });
    },

    async upvote(id) {
      return API.request(`/api/complaints/${encodeURIComponent(id)}/upvote`, {
        method: 'POST'
      });
    },

    async verify(id, type) {
      return API.request(`/api/complaints/${encodeURIComponent(id)}/verify`, {
        method: 'POST',
        body: { type }
      });
    }
  },

  // ==========================================
  // WORKERS & DEPARTMENTS ENDPOINTS
  // ==========================================
  workers: {
    async list() {
      const res = await API.request('/api/workers', { method: 'GET' });
      if (res.success && res.workers) return res.workers;
      return Storage.get(STORAGE_KEYS.WORKERS, []);
    }
  },

  departments: {
    async list() {
      const res = await API.request('/api/departments', { method: 'GET' });
      if (res.success && res.departments) return res.departments;
      return Storage.get(STORAGE_KEYS.DEPARTMENTS, []);
    }
  },

  // ==========================================
  // CIVIC LEARNING FLASHCARDS ENDPOINT
  // ==========================================
  flashcards: {
    async list(category = 'all') {
      const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await API.request(`/api/flashcards${query}`, { method: 'GET' });
      if (res.success && res.flashcards) return res.flashcards;
      return null;
    }
  },

  // ==========================================
  // SYSTEM & AUDIT LOGS ENDPOINTS
  // ==========================================
  system: {
    async getEmailLogs() {
      const res = await API.request('/api/emails', { method: 'GET' });
      if (res.success && res.logs) return res.logs;
      return Storage.get(STORAGE_KEYS.EMAIL_LOGS, []);
    },

    async getNotifications(userId) {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await API.request(`/api/notifications${query}`, { method: 'GET' });
      if (res.success && res.notifications) return res.notifications;
      return Storage.get(STORAGE_KEYS.NOTIFICATIONS, []);
    },

    async resetData() {
      return API.request('/api/reset', { method: 'POST' });
    }
  }
};

// Probe server availability on initialization
if (typeof window !== 'undefined') {
  API.checkServer();
}
