/**
 * JANSETU ADMIN CONTROLLER (js/admin.js)
 * Municipal Operations Management: Complaints Verification, Field Assignments,
 * Department KPIs, Escalation Management, and Worker Rosters.
 */

const Admin = {
  currentComplaintId: null,

  /**
   * Initialize Admin Dashboard KPIs
   */
  async initDashboard() {
    let complaints = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    if (window.API && API.complaints) {
      try {
        const liveList = await API.complaints.list();
        if (liveList && liveList.length > 0) {
          complaints = liveList;
          Storage.set(STORAGE_KEYS.COMPLAINTS, liveList);
        }
      } catch (err) {
        console.warn('API error fetching admin complaints:', err);
      }
    }

    const depts = Storage.get(STORAGE_KEYS.DEPARTMENTS, []);
    const workers = Storage.get(STORAGE_KEYS.WORKERS, []);

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pendingVerification = complaints.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
    const critical = complaints.filter(c => c.priorityScore >= 80 && c.status !== 'resolved').length;

    // KPI Counters
    const kpiTotal = document.getElementById('admin-kpi-total');
    if (kpiTotal) UI.animateCounter(kpiTotal, total);

    const kpiPending = document.getElementById('admin-kpi-pending');
    if (kpiPending) UI.animateCounter(kpiPending, pendingVerification);

    const kpiProgress = document.getElementById('admin-kpi-progress');
    if (kpiProgress) UI.animateCounter(kpiProgress, inProgress);

    const kpiResolved = document.getElementById('admin-kpi-resolved');
    if (kpiResolved) UI.animateCounter(kpiResolved, resolved);

    const kpiCritical = document.getElementById('admin-kpi-critical');
    if (kpiCritical) UI.animateCounter(kpiCritical, critical);

    // Initialize Analytics Charts if canvas elements exist
    if (window.Analytics) {
      Analytics.initAdminCharts();
    }

    // Render Recent Critical Issues
    this.renderCriticalTable(complaints.filter(c => c.status !== 'resolved').slice(0, 6));
  },

  renderCriticalTable(items) {
    const tbody = document.getElementById('admin-critical-tbody');
    if (!tbody) return;

    tbody.innerHTML = items.map(c => `
      <tr>
        <td><strong style="color: var(--primary);">${c.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${Utils.escapeHtml(c.title)}</div>
          <small class="text-muted">${c.area}, ${c.city}</small>
        </td>
        <td><span class="badge badge-neutral">${c.category}</span></td>
        <td>
          <span class="badge ${c.priorityScore >= 80 ? 'badge-danger' : c.priorityScore >= 60 ? 'badge-warning' : 'badge-primary'}">
            ${c.priorityScore}/100
          </span>
        </td>
        <td>
          <span class="status-pill status-${c.status}">
            ${c.status.replace('_', ' ').toUpperCase()}
          </span>
        </td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-secondary btn-sm" onclick="Admin.openActionModal('${c.id}')">
              Manage <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Complaints Management Page Controller
   */
  initComplaintsTable() {
    this.loadComplaintsTable();

    // Attach Search & Filters
    const searchInput = document.getElementById('admin-search-input');
    const statusSelect = document.getElementById('admin-status-filter');
    const categorySelect = document.getElementById('admin-category-filter');

    const handleFilterChange = () => {
      this.loadComplaintsTable({
        search: searchInput ? searchInput.value : '',
        status: statusSelect ? statusSelect.value : 'all',
        category: categorySelect ? categorySelect.value : 'all'
      });
    };

    if (searchInput) searchInput.addEventListener('input', handleFilterChange);
    if (statusSelect) statusSelect.addEventListener('change', handleFilterChange);
    if (categorySelect) categorySelect.addEventListener('change', handleFilterChange);
  },

  loadComplaintsTable(filters = {}) {
    const tbody = document.getElementById('admin-complaints-tbody');
    if (!tbody) return;

    const list = Complaints.getAll(filters);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No complaints matching the selected filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td><strong style="color: var(--primary);">${c.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${Utils.escapeHtml(c.title)}</div>
          <small class="text-muted"><i class="fa-solid fa-location-dot"></i> ${c.area}, ${c.city}</small>
        </td>
        <td><span class="badge badge-neutral">${c.category}</span></td>
        <td>
          <span class="badge ${c.priorityScore >= 80 ? 'badge-danger' : c.priorityScore >= 60 ? 'badge-warning' : 'badge-primary'}">
            ${c.priorityScore}/100
          </span>
        </td>
        <td>
          <span class="status-pill status-${c.status}">
            ${c.status.replace('_', ' ').toUpperCase()}
          </span>
        </td>
        <td>
          <div style="font-size: 0.82rem;">
            ${c.assignedWorker ? `<strong>${c.assignedWorker.name}</strong>` : '<span class="text-muted">Unassigned</span>'}
          </div>
        </td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-secondary btn-sm" onclick="Admin.openActionModal('${c.id}')">
              Action <i class="fa-solid fa-bolt"></i>
            </button>
            <a href="complaint-details.html?id=${c.id}" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-eye"></i>
            </a>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Action Modal: Verify, Assign, Escalate, or Reject
   */
  openActionModal(complaintId) {
    this.currentComplaintId = complaintId;
    const complaint = Complaints.getById(complaintId);
    if (!complaint) return;

    const workers = Storage.get(STORAGE_KEYS.WORKERS, []);
    const depts = Storage.get(STORAGE_KEYS.DEPARTMENTS, []);

    let modal = document.getElementById('admin-action-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-action-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Admin Operational Action</h3>
            <small class="text-muted">${complaint.id}: ${Utils.escapeHtml(complaint.title)}</small>
          </div>
          <button class="modal-close" onclick="UI.closeModal('admin-action-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 1.25rem;">
            <label class="form-label">Assign Field Squad Worker</label>
            <select id="modal-worker-select" class="form-control">
              <option value="">-- Select Field Worker --</option>
              ${workers.map(w => `
                <option value="${w.id}" ${complaint.assignedWorker && complaint.assignedWorker.id === w.id ? 'selected' : ''}>
                  ${w.name} (${w.ward}) - Active: ${w.activeTasks}
                </option>
              `).join('')}
            </select>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label class="form-label">Department Division</label>
            <select id="modal-dept-select" class="form-control">
              ${depts.map(d => `
                <option value="${d.id}" ${complaint.deptId === d.id ? 'selected' : ''}>${d.name}</option>
              `).join('')}
            </select>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label class="form-label">Update Status</label>
            <select id="modal-status-select" class="form-control">
              <option value="verified" ${complaint.status === 'verified' ? 'selected' : ''}>Verified & Queue for Dispatch</option>
              <option value="assigned" ${complaint.status === 'assigned' ? 'selected' : ''}>Assigned to Field Squad</option>
              <option value="in_progress" ${complaint.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="rejected" ${complaint.status === 'rejected' ? 'selected' : ''}>Reject / Out of Jurisdiction</option>
            </select>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label class="form-label">Administrative Note / Instructions</label>
            <textarea id="modal-admin-note" class="form-control" placeholder="Optional directions for field team or reason for status update..."></textarea>
          </div>

          <div style="padding: 1rem; border-radius: var(--radius-sm); background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25);">
            <div class="d-flex justify-between align-center">
              <div>
                <strong>Overdue Escalation</strong>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Bump Priority Score to 98 and alert Commissioner Desk.</p>
              </div>
              <button type="button" class="btn btn-danger btn-sm" onclick="Admin.escalateIssue('${complaint.id}')">
                <i class="fa-solid fa-triangle-exclamation"></i> Escalate Now
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal('admin-action-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="Admin.saveActionModal()">Save & Apply Changes</button>
        </div>
      </div>
    `;

    UI.openModal('admin-action-modal');
  },

  saveActionModal() {
    const complaintId = this.currentComplaintId;
    if (!complaintId) return;

    const workerId = document.getElementById('modal-worker-select').value;
    const deptId = document.getElementById('modal-dept-select').value;
    const newStatus = document.getElementById('modal-status-select').value;
    const note = document.getElementById('modal-admin-note').value;

    const workers = Storage.get(STORAGE_KEYS.WORKERS, []);
    const assignedWorker = workers.find(w => w.id === workerId) || null;

    Complaints.updateStatus(complaintId, newStatus, {
      assignedWorker: assignedWorker ? { id: assignedWorker.id, name: assignedWorker.name, phone: assignedWorker.phone } : null,
      deptId,
      note: note || 'Administrative status update applied.'
    });

    UI.closeModal('admin-action-modal');
    UI.showToast({ type: 'success', title: 'Operational Update Saved', message: `Complaint ${complaintId} has been updated.` });

    // Refresh whichever table is currently visible
    if (document.getElementById('admin-complaints-tbody')) {
      this.loadComplaintsTable();
    } else if (document.getElementById('admin-critical-tbody')) {
      this.initDashboard();
    }
  },

  /**
   * Overdue Escalation Trigger
   */
  escalateIssue(complaintId) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return;

    item.priority = 'critical';
    item.priorityScore = 98;
    item.timeline.push({
      status: 'escalated',
      title: '🚨 SLA Exceeded: Issue Escalated',
      desc: 'Resolution deadline exceeded. Priority boosted to Critical by Municipal Admin.',
      timestamp: new Date().toISOString()
    });

    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    if (window.EmailService) {
      EmailService.sendEscalationEmail(item);
    }

    UI.closeModal('admin-action-modal');
    UI.showToast({ type: 'error', title: 'Issue Escalated! 🚨', message: `Priority boosted to 98/100 and escalation logged.` });

    if (document.getElementById('admin-complaints-tbody')) this.loadComplaintsTable();
    if (document.getElementById('admin-critical-tbody')) this.initDashboard();
  },

  /**
   * Reset All Demo Data Action
   */
  triggerResetDemoData() {
    if (confirm('Are you sure you want to reset all data back to the clean demonstration seed state? Any new test complaints will be reset.')) {
      Storage.resetDemoData();
      UI.showToast({ type: 'info', title: 'Database Reset', message: 'Demo data restored with 22 initial complaints.' });
      setTimeout(() => window.location.reload(), 800);
    }
  }
};
