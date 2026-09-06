/**
 * JANSETU AUTHENTICATION SERVICE (js/auth.js)
 * User session management, role-based route guard, demo logins, registration
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
  login(email, password) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (foundUser) {
      Storage.set(STORAGE_KEYS.CURRENT_USER, foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Invalid email or password. Check credentials or use demo accounts.' };
  },

  /**
   * 1-Click Demo Login Helper for Testing
   */
  demoLogin(role = 'citizen') {
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
  register(userData) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (exists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name,
      email: userData.email.trim(),
      password: userData.password,
      phone: userData.phone || '+91 98000 00000',
      city: userData.city || 'Bengaluru',
      ward: userData.ward || 'General Public',
      role: 'citizen',
      impactScore: 50, // Welcome bonus points
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      memberSince: new Date().toISOString(),
      badges: ['First Reporter']
    };

    users.push(newUser);
    Storage.set(STORAGE_KEYS.USERS, users);
    Storage.set(STORAGE_KEYS.CURRENT_USER, newUser);

    // Send Simulated Welcome Email
    if (window.EmailService) {
      EmailService.sendRegistrationEmail(newUser);
    }

    return { success: true, user: newUser };
  },

  /**
   * Terminate current session
   */
  logout() {
    Storage.remove(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
  },

  /**
   * Redirect user based on their active role
   */
  redirectByRole(role) {
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
