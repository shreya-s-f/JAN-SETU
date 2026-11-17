/**
 * JANSETU AUTHENTICATION SERVICE (js/auth.js)
 * User session management, role-based route guards, demo logins, registration
 * Integrated with the backend REST API with seamless local-first fallback.
 */

const Auth = {
  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return Storage.get(STORAGE_KEYS.CURRENT_USER, null);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Authenticate user by email & password
   */
  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Try Backend API first
    if (window.API) {
      const apiRes = await API.auth.login(cleanEmail, password);
      if (apiRes.success && apiRes.user) {
        if (apiRes.token) API.setToken(apiRes.token);
        Storage.set(STORAGE_KEYS.CURRENT_USER, apiRes.user);

        // Sync with local storage cache
        const users = Storage.get(STORAGE_KEYS.USERS, []);
        const idx = users.findIndex(u => u.id === apiRes.user.id || u.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...apiRes.user };
        } else {
          users.push(apiRes.user);
        }
        Storage.set(STORAGE_KEYS.USERS, users);

        return { success: true, user: apiRes.user };
      }

      // If server specifically rejected with a message or unverified email
      if (!apiRes.networkError && apiRes.status !== 0) {
        return {
          success: false,
          code: apiRes.code || apiRes.data?.code,
          message: apiRes.message || 'Invalid email or password.'
        };
      }
    }

    // 2. Fallback to LocalStorage for offline demonstration
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const foundUser = users.find(
      u => u.email.toLowerCase() === cleanEmail && (u.password === password || !u.password)
    );

    if (foundUser) {
      Storage.set(STORAGE_KEYS.CURRENT_USER, foundUser);
      return { success: true, user: foundUser };
    }

    return {
      success: false,
      message: 'Invalid email or password. Check credentials or use 1-click demo accounts.'
    };
  },

  /**
   * 1-Click Demo Login Helper for Testing
   */
  async demoLogin(role = 'citizen') {
    const demoCredentials = {
      citizen: { email: 'citizen@jansetu.in', password: 'citizen123' },
      admin: { email: 'admin@jansetu.in', password: 'admin123' },
      worker: { email: 'worker@jansetu.in', password: 'worker123' }
    };

    const creds = demoCredentials[role] || demoCredentials.citizen;
    const res = await this.login(creds.email, creds.password);

    if (res.success) {
      if (window.UI) {
        UI.showToast({
          type: 'success',
          title: 'Demo Session Active',
          message: `Logged in as ${res.user.name} (${role.toUpperCase()})`
        });
      }
      setTimeout(() => this.redirectByRole(res.user.role), 300);
      return true;
    }

    // Fallback: direct localStorage role login
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const demoUser = users.find(u => u.role === role);
    if (demoUser) {
      Storage.set(STORAGE_KEYS.CURRENT_USER, demoUser);
      this.redirectByRole(demoUser.role);
      return true;
    }
    return false;
  },

  /**
   * Register a new Citizen
   */
  async register(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // 1. Try Backend API first
    if (window.API) {
      const apiRes = await API.auth.register({
        name: userData.name,
        email: cleanEmail,
        password: userData.password,
        phone: userData.phone || '+91 98000 00000',
        city: userData.city || 'Bengaluru',
        ward: userData.ward || 'General Ward',
        role: userData.role || 'citizen'
      });

      if (apiRes.success) {
        if (apiRes.token) API.setToken(apiRes.token);
        if (apiRes.user) {
          const users = Storage.get(STORAGE_KEYS.USERS, []);
          users.push(apiRes.user);
          Storage.set(STORAGE_KEYS.USERS, users);
        }

        return {
          success: true,
          user: apiRes.user,
          requiresVerification: apiRes.requiresVerification !== false,
          verificationToken: apiRes.verificationToken || null,
          message: apiRes.message || 'Account created successfully! Verification email dispatched.'
        };
      }

      if (!apiRes.networkError && apiRes.status !== 0) {
        return { success: false, message: apiRes.message };
      }
    }

    // 2. Fallback to LocalStorage registration
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name,
      email: cleanEmail,
      password: userData.password,
      phone: userData.phone || '+91 98000 00000',
      city: userData.city || 'Bengaluru',
      ward: userData.ward || 'General Public',
      role: 'citizen',
      impactScore: 50,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      memberSince: new Date().toISOString(),
      badges: ['First Reporter'],
      emailVerified: true
    };

    users.push(newUser);
    Storage.set(STORAGE_KEYS.USERS, users);
    Storage.set(STORAGE_KEYS.CURRENT_USER, newUser);

    if (window.EmailService) {
      EmailService.sendRegistrationEmail(newUser);
    }

    return { success: true, user: newUser, requiresVerification: false };
  },

  /**
   * Terminate current session
   */
  logout() {
    if (window.API) {
      API.clearToken();
    }
    Storage.remove(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
  },

  /**
   * Redirect user based on their active role
   */
  redirectByRole(role) {
    const savedRedirect = sessionStorage.getItem('jansetu_redirect_after_login');
    if (savedRedirect && !savedRedirect.includes('login') && !savedRedirect.includes('register')) {
      sessionStorage.removeItem('jansetu_redirect_after_login');
      window.location.href = savedRedirect;
      return;
    }

    switch (role) {
      case 'admin':
        window.location.href = 'admin-dashboard.html';
        break;
      case 'worker':
        window.location.href = 'worker-dashboard.html';
        break;
      case 'citizen':
      default:
        window.location.href = 'citizen-dashboard.html';
        break;
    }
  },

  /**
   * Enforce page protection on dashboard routes
   */
  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();
    if (!user) {
      sessionStorage.setItem('jansetu_redirect_after_login', window.location.pathname);
      window.location.href = 'login.html';
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Access Restricted: This section is reserved for ${allowedRoles.join(', ')} users.`);
      this.redirectByRole(user.role);
      return false;
    }
    return true;
  }
};
