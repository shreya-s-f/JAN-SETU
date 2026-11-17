/**
 * JANSETU GLOBAL UI ENGINE (js/ui.js)
 * Toasts, Modals, Theme Switcher, Email Simulation Viewer,
 * Mobile Drawer, Animated Counters, and Before/After Slider
 */

const UI = {
  init() {
    this.initTheme();
    this.initNavbar();
    this.initUserDropdown();
    this.initMobileSidebar();
    this.listenEmailEvents();
    if (window.Notifications) {
      Notifications.updateBadgeUI();
    }
  },

  /**
   * Theme Manager (Dark / Light Mode)
   */
  initTheme() {
    const settings = Storage.get(STORAGE_KEYS.SETTINGS, { theme: 'light' });
    const savedTheme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = savedTheme === 'dark' 
        ? '<i class="fa-regular fa-sun"></i>' 
        : '<i class="fa-regular fa-moon"></i>';
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        settings.theme = next;
        Storage.set(STORAGE_KEYS.SETTINGS, settings);
        themeToggleBtn.innerHTML = next === 'dark' 
          ? '<i class="fa-regular fa-sun"></i>' 
          : '<i class="fa-regular fa-moon"></i>';
      });
    }
  },

  /**
   * Top Navigation User Profile & Status Sync
   */
  initNavbar() {
    const user = Auth.getCurrentUser();
    const userContainer = document.getElementById('nav-user-container');
    if (user && userContainer) {
      const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      userContainer.innerHTML = `
        <div class="user-menu" id="user-menu-trigger">
          <div class="user-toggle">
            <div class="user-avatar">${initials}</div>
            <span style="font-size: 0.88rem; font-weight: 600;">${user.name.split(' ')[0]}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: var(--text-dim);"></i>
          </div>
          <div class="user-menu-dropdown" id="user-dropdown-menu">
            <div class="dropdown-header">
              <div class="dropdown-name">${user.name}</div>
              <div class="dropdown-role"><span class="badge badge-primary">${user.role.toUpperCase()}</span></div>
            </div>
            ${user.role === 'citizen' ? `
              <a href="citizen-dashboard.html" class="dropdown-item"><i class="fa-solid fa-gauge"></i> Dashboard</a>
              <a href="profile.html" class="dropdown-item"><i class="fa-solid fa-user"></i> Civic Profile</a>
              <a href="my-complaints.html" class="dropdown-item"><i class="fa-solid fa-list-check"></i> My Complaints</a>
              <a href="settings.html" class="dropdown-item"><i class="fa-solid fa-sliders"></i> Settings</a>
            ` : ''}
            ${user.role === 'admin' ? `
              <a href="admin-dashboard.html" class="dropdown-item"><i class="fa-solid fa-shield-halved"></i> Admin Portal</a>
              <a href="admin-complaints.html" class="dropdown-item"><i class="fa-solid fa-folder-open"></i> All Complaints</a>
              <a href="admin-email-logs.html" class="dropdown-item"><i class="fa-solid fa-envelope-open-text"></i> Email Logs</a>
              <a href="admin-settings.html" class="dropdown-item"><i class="fa-solid fa-gear"></i> Portal Settings</a>
            ` : ''}
            ${user.role === 'worker' ? `
              <a href="worker-dashboard.html" class="dropdown-item"><i class="fa-solid fa-helmet-safety"></i> Worker Portal</a>
              <a href="worker-issues.html" class="dropdown-item"><i class="fa-solid fa-list-check"></i> Task Orders</a>
            ` : ''}
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" onclick="Auth.logout()" class="dropdown-item text-danger"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>
          </div>
        </div>
      `;
    }
  },

  initUserDropdown() {
    document.addEventListener('click', (e) => {
      const trigger = document.getElementById('user-menu-trigger');
      const dropdown = document.getElementById('user-dropdown-menu');
      if (trigger && dropdown) {
        if (trigger.contains(e.target)) {
          dropdown.classList.toggle('active');
        } else {
          dropdown.classList.remove('active');
        }
      }
    });
  },

  /**
   * Mobile Sidebar Drawer
   */
  initMobileSidebar() {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  },

  /**
   * Toast Notifications
   */
  showToast({ type = 'info', title = 'Notification', message = '', duration = 5000 }) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-circle-xmark',
      warning: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-bell'
    };

    toast.innerHTML = `
      <i class="${icons[type] || icons.info} toast-icon"></i>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  /**
   * Modals Manager
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Simulated Email Modal Viewer
   */
  listenEmailEvents() {
    window.addEventListener('jansetu:email-sent', (e) => {
      // Optional: automatically show or provide inspect link
      console.log('📬 Captured Email Dispatch Event:', e.detail);
    });
  },

  viewEmailModal(emailId) {
    const logs = Storage.get(STORAGE_KEYS.EMAIL_LOGS, []);
    const email = logs.find(e => e.id === emailId);
    if (!email) {
      this.showToast({ type: 'warning', title: 'Not Found', message: 'Email record was not found in storage.' });
      return;
    }

    let modal = document.getElementById('email-sim-viewer-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'email-sim-viewer-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 650px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-envelope text-primary"></i>
            <h3 class="modal-title">Simulated Outbound Email</h3>
          </div>
          <button class="modal-close" onclick="UI.closeModal('email-sim-viewer-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="email-sim-badge"><i class="fa-solid fa-satellite-dish"></i> Frontend Simulated Delivery</span>
            <span style="font-size: 0.78rem; color: var(--text-dim);">${Utils.formatDateTime(email.sentAt)}</span>
          </div>
          <div class="email-preview-box">
            <div class="email-preview-header">
              <p><strong>From:</strong> JanSetu Civic Alerts &lt;notifications@jansetu.in&gt;</p>
              <p><strong>To:</strong> ${email.recipientName} &lt;${email.to}&gt;</p>
              <p><strong>Subject:</strong> ${email.subject}</p>
              ${email.complaintId ? `<p><strong>Ref ID:</strong> <span style="color: #0066ff; font-weight: bold;">${email.complaintId}</span></p>` : ''}
            </div>
            <div class="email-preview-body">
              ${email.htmlContent || `<p>${email.bodyPreview}</p>`}
            </div>
          </div>
          <div style="margin-top: 1rem; padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(0, 102, 255, 0.08); border: 1px solid rgba(0, 102, 255, 0.2); font-size: 0.8rem; color: var(--text-muted);">
            <i class="fa-solid fa-circle-info text-primary"></i> <strong>Backend Ready:</strong> This email event was logged into <code>localStorage.jansetu_email_logs</code> and is ready to connect with AWS SES, SendGrid, or Postmark in a Node/Python microservice.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal('email-sim-viewer-modal')">Close</button>
        </div>
      </div>
    `;

    this.openModal('email-sim-viewer-modal');
  },

  /**
   * Interactive Before/After Resolution Slider Controller
   */
  initBeforeAfterSlider(container) {
    if (!container) return;
    const overlay = container.querySelector('.ba-slider-overlay');
    const handle = container.querySelector('.ba-slider-handle');
    if (!overlay || !handle) return;

    let isDragging = false;

    const moveSlider = (x) => {
      const rect = container.getBoundingClientRect();
      let pos = ((x - rect.left) / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;

      overlay.style.width = `${pos}%`;
      handle.style.left = `${pos}%`;
    };

    handle.addEventListener('mousedown', () => (isDragging = true));
    window.addEventListener('mouseup', () => (isDragging = false));
    window.addEventListener('mousemove', (e) => {
      if (isDragging) moveSlider(e.clientX);
    });

    // Mobile touch events
    handle.addEventListener('touchstart', () => (isDragging = true));
    window.addEventListener('touchend', () => (isDragging = false));
    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) moveSlider(e.touches[0].clientX);
    });
  },

  /**
   * Animated Number Counters
   */
  animateCounter(element, target, duration = 1200) {
    if (!element) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = Math.round(target).toLocaleString('en-IN');
        clearInterval(timer);
      } else {
        element.textContent = Math.round(start).toLocaleString('en-IN');
      }
    }, 16);
  }
};

// Auto-run UI bootstrap on DOM load
document.addEventListener('DOMContentLoaded', () => UI.init());
