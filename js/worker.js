/**
 * JANSETU FIELD WORKER CONTROLLER (js/worker.js)
 * Work Orders Roster, Start Work, On-site Progress Notes,
 * After-Photo Upload, and Resolution Confirmation.
 */

const Worker = {
  currentIssueId: null,

  /**
   * Initialize Worker Dashboard
   */
  async initDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    let complaints = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    if (window.API && API.complaints) {
      try {
        const liveList = await API.complaints.list();
        if (liveList && liveList.length > 0) {
          complaints = liveList;
          Storage.set(STORAGE_KEYS.COMPLAINTS, liveList);
        }
      } catch (err) {
        console.warn('API error fetching worker complaints:', err);
      }
    }

    // Find issues assigned to this worker or department
    const myIssues = complaints.filter(
      c => (c.assignedWorker && (c.assignedWorker.id === 'w-1' || c.assignedWorker.name === user.name || c.assignedWorker.id === user.id)) ||
           (c.status === 'assigned' || c.status === 'in_progress')
    );

    const active = myIssues.filter(c => c.status === 'assigned' || c.status === 'in_progress');
    const inProgress = myIssues.filter(c => c.status === 'in_progress');
    const resolved = myIssues.filter(c => c.status === 'resolved');

    // KPI numbers
    const kpiActive = document.getElementById('worker-kpi-active');
    if (kpiActive) UI.animateCounter(kpiActive, active.length);

    const kpiInProgress = document.getElementById('worker-kpi-progress');
    if (kpiInProgress) UI.animateCounter(kpiProgress, inProgress.length);

    const kpiResolved = document.getElementById('worker-kpi-resolved');
    if (kpiResolved) UI.animateCounter(kpiResolved, resolved.length);

    this.renderWorkOrdersTable(myIssues);
  },

  renderWorkOrdersTable(items) {
    const tbody = document.getElementById('worker-tasks-tbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No work orders currently assigned to your squad.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(c => `
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
          <a href="worker-issue-details.html?id=${c.id}" class="btn btn-primary btn-sm">
            Execute <i class="fa-solid fa-wrench"></i>
          </a>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Field Execution Page (worker-issue-details.html)
   */
  initIssueExecution(issueId) {
    this.currentIssueId = issueId;
    const complaint = Complaints.getById(issueId);
    if (!complaint) {
      alert('Work order not found.');
      window.location.href = 'worker-dashboard.html';
      return;
    }

    // Populate UI details
    document.getElementById('exec-issue-id').textContent = complaint.id;
    document.getElementById('exec-issue-title').textContent = complaint.title;
    document.getElementById('exec-issue-desc').textContent = complaint.description;
    document.getElementById('exec-issue-category').textContent = complaint.category;
    document.getElementById('exec-issue-location').textContent = `${complaint.address || complaint.area}, ${complaint.city}`;
    document.getElementById('exec-issue-priority').textContent = `${complaint.priorityScore}/100 (${complaint.priority.toUpperCase()})`;

    const beforeImg = document.getElementById('exec-before-image');
    if (beforeImg) beforeImg.src = complaint.beforeImage;

    const statusPill = document.getElementById('exec-status-pill');
    if (statusPill) {
      statusPill.className = `status-pill status-${complaint.status}`;
      statusPill.textContent = complaint.status.replace('_', ' ').toUpperCase();
    }

    // Image upload handler for After-photo
    const dropzone = document.getElementById('after-image-dropzone');
    const fileInput = document.getElementById('after-image-file');
    const preview = document.getElementById('after-image-preview');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            preview.src = ev.target.result;
            preview.style.display = 'block';
            dropzone.querySelector('.dropzone-placeholder').style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Render Mini Map
    if (document.getElementById('exec-map') && complaint.lat && complaint.lng) {
      const map = L.map('exec-map', { zoomControl: false, scrollWheelZoom: false })
        .setView([complaint.lat, complaint.lng], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
      L.marker([complaint.lat, complaint.lng]).addTo(map).bindPopup(complaint.title).openPopup();
    }
  },

  /**
   * Action: Start Work
   */
  startWork() {
    const user = Auth.getCurrentUser();
    const note = prompt('Enter starting work note (e.g., "Crew and machinery dispatched to site"):');
    if (note === null) return;

    Complaints.updateStatus(this.currentIssueId, 'in_progress', {
      note: note || 'Field worker commenced work.'
    });

    if (window.EmailService) {
      const item = Complaints.getById(this.currentIssueId);
      if (item && item.reportedBy) {
        EmailService.sendProgressEmail(item, note || 'Field operations active.', item.reportedBy);
      }
    }

    UI.showToast({ type: 'success', title: 'Work Started', message: 'Status updated to In Progress.' });
    setTimeout(() => window.location.reload(), 600);
  },

  /**
   * Action: Complete & Mark Resolved
   */
  markResolved() {
    const user = Auth.getCurrentUser();
    const noteInput = document.getElementById('resolution-notes');
    const benefitedInput = document.getElementById('citizens-benefited');
    const preview = document.getElementById('after-image-preview');

    const note = noteInput ? noteInput.value.trim() : '';
    if (!note || note.length < 10) {
      UI.showToast({ type: 'warning', title: 'Resolution Note Required', message: 'Please detail the repair actions taken (min 10 characters).' });
      return;
    }

    const afterImgSrc = preview && preview.src && preview.style.display !== 'none'
      ? preview.src
      : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';

    const resolutionData = {
      resolutionNote: note,
      citizensBenefited: parseInt(benefitedInput?.value || 150),
      afterImage: afterImgSrc
    };

    Complaints.resolveIssue(this.currentIssueId, resolutionData, user);

    UI.showToast({
      type: 'success',
      title: 'Resolution Completed! 🎉',
      message: 'Before/after proof archived and citizen notified.'
    });

    setTimeout(() => {
      window.location.href = 'worker-dashboard.html';
    }, 1000);
  }
};
