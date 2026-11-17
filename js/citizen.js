/**
 * JANSETU CITIZEN CONTROLLER (js/citizen.js)
 * Multi-step Issue Reporting Wizard, Duplicate Detection Integration,
 * Dashboard KPIs, Timeline, Community Verification, and Feedback.
 */

const Citizen = {
  currentStep: 1,
  totalSteps: 7,
  formData: {
    category: '',
    title: '',
    description: '',
    beforeImage: '',
    city: 'Bengaluru',
    area: 'Indiranagar',
    address: '',
    lat: 12.9719,
    lng: 77.6412,
    peopleAffected: '10–50',
    priority: 'medium'
  },

  /**
   * Initialize Citizen Dashboard
   */
  async initDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // Set greeting
    const greetingEl = document.getElementById('citizen-greeting-name');
    if (greetingEl) greetingEl.textContent = user.name.split(' ')[0];

    const cityEl = document.getElementById('citizen-city-badge');
    if (cityEl) cityEl.textContent = user.city || 'Bengaluru';

    // Fetch complaints from API or fallback to Storage
    let complaints = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    if (window.API && API.complaints) {
      try {
        const liveList = await API.complaints.list();
        if (liveList && liveList.length > 0) {
          complaints = liveList;
          Storage.set(STORAGE_KEYS.COMPLAINTS, liveList);
        }
      } catch (err) {
        console.warn('API error fetching live complaints, using cache:', err);
      }
    }

    const userReports = complaints.filter(c => c.reportedBy && (c.reportedBy.id === user.id || c.reportedBy.email === user.email));
    const activeReports = userReports.filter(c => c.status !== 'resolved' && c.status !== 'rejected');
    const inProgressReports = userReports.filter(c => c.status === 'in_progress');
    const resolvedReports = userReports.filter(c => c.status === 'resolved');

    // Update KPI counters
    const kpiTotal = document.getElementById('kpi-total-reports');
    if (kpiTotal) UI.animateCounter(kpiTotal, userReports.length);

    const kpiActive = document.getElementById('kpi-active-reports');
    if (kpiActive) UI.animateCounter(kpiActive, activeReports.length);

    const kpiProgress = document.getElementById('kpi-progress-reports');
    if (kpiProgress) UI.animateCounter(kpiProgress, inProgressReports.length);

    const kpiResolved = document.getElementById('kpi-resolved-reports');
    if (kpiResolved) UI.animateCounter(kpiResolved, resolvedReports.length);

    const kpiImpact = document.getElementById('kpi-impact-score');
    if (kpiImpact) UI.animateCounter(kpiImpact, user.impactScore || 340);

    // Render Recent Complaints Table
    this.renderRecentComplaints(userReports.slice(0, 5));

    // Render Nearby/Trending Issues Map
    if (document.getElementById('citizen-map')) {
      MapEngine.init('citizen-map', { center: [12.9719, 77.6412], zoom: 13 });
      MapEngine.renderMarkers(complaints.slice(0, 10));
    }
  },
      MapEngine.init('citizen-map', { center: [12.9719, 77.6412], zoom: 13 });
      MapEngine.renderMarkers(complaints.slice(0, 10));
    }
  },

  renderRecentComplaints(items) {
    const tbody = document.getElementById('recent-complaints-tbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No civic reports filed yet. Click "Report Issue" to log your first complaint!</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(c => `
      <tr>
        <td><strong style="color: var(--primary);">${c.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${Utils.escapeHtml(c.title)}</div>
          <small class="text-muted">${c.area}, ${c.city}</small>
        </td>
        <td><span class="badge badge-neutral">${c.category}</span></td>
        <td>
          <span class="status-pill status-${c.status}">
            ${c.status.replace('_', ' ').toUpperCase()}
          </span>
        </td>
        <td>
          <div style="font-size: 0.85rem; font-weight: 700;">
            ${c.priorityScore}/100
          </div>
        </td>
        <td>
          <a href="complaint-details.html?id=${c.id}" class="btn btn-secondary btn-sm">
            Track <i class="fa-solid fa-arrow-right"></i>
          </a>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Multi-Step Report Issue Wizard Logic
   */
  initReportWizard() {
    this.currentStep = 1;
    this.updateWizardUI();

    // Category options listener
    document.querySelectorAll('.category-card-option').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.category-card-option').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.category = card.getAttribute('data-category');
      });
    });

    // Image upload drag-and-drop & file selection
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('issue-image-file');
    const previewImg = document.getElementById('image-preview');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.formData.beforeImage = event.target.result;
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            dropzone.querySelector('.dropzone-placeholder').style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Geolocation API Handler
    const geoBtn = document.getElementById('btn-get-geolocation');
    if (geoBtn) {
      geoBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          UI.showToast({ type: 'error', title: 'Geolocation Unavailable', message: 'Your browser does not support Geolocation API.' });
          return;
        }

        geoBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching GPS...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.formData.lat = pos.coords.latitude;
            this.formData.lng = pos.coords.longitude;
            geoBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> GPS Located';
            geoBtn.classList.remove('btn-outline');
            geoBtn.classList.add('btn-success');

            const addressInput = document.getElementById('issue-address');
            if (addressInput && !addressInput.value) {
              addressInput.value = `Near GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
            }

            UI.showToast({
              type: 'success',
              title: 'Location Acquired',
              message: `Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
            });
          },
          (err) => {
            geoBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use My Current Location';
            UI.showToast({ type: 'warning', title: 'Location Access Denied', message: 'Could not access GPS. Please enter locality manually.' });
          }
        );
      });
    }
  },

  nextStep() {
    if (!this.validateStep(this.currentStep)) return;

    if (this.currentStep === 2) {
      // Run Duplicate Check before moving to photos
      this.checkPotentialDuplicates();
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateWizardUI();
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateWizardUI();
    }
  },

  validateStep(step) {
    if (step === 1) {
      if (!this.formData.category) {
        UI.showToast({ type: 'warning', title: 'Category Required', message: 'Please select an issue category to proceed.' });
        return false;
      }
    } else if (step === 2) {
      const titleInput = document.getElementById('issue-title');
      const descInput = document.getElementById('issue-desc');
      if (!titleInput || titleInput.value.trim().length < 5) {
        UI.showToast({ type: 'warning', title: 'Title Required', message: 'Please enter a descriptive issue title (min 5 characters).' });
        return false;
      }
      if (!descInput || descInput.value.trim().length < 15) {
        UI.showToast({ type: 'warning', title: 'Description Required', message: 'Please provide issue details and street landmarks (min 15 characters).' });
        return false;
      }
      this.formData.title = titleInput.value.trim();
      this.formData.description = descInput.value.trim();
    } else if (step === 4) {
      const areaInput = document.getElementById('issue-area');
      const addressInput = document.getElementById('issue-address');
      if (areaInput) this.formData.area = areaInput.value.trim() || 'Indiranagar';
      if (addressInput) this.formData.address = addressInput.value.trim() || `${this.formData.area}, Bengaluru`;
    } else if (step === 5) {
      const peopleSel = document.getElementById('issue-people-affected');
      if (peopleSel) this.formData.peopleAffected = peopleSel.value;
    } else if (step === 6) {
      const priorityRadio = document.querySelector('input[name="priority-radio"]:checked');
      if (priorityRadio) this.formData.priority = priorityRadio.value;
    }
    return true;
  },

  updateWizardUI() {
    // Update step progress nodes
    document.querySelectorAll('.wizard-step-node').forEach((node, idx) => {
      const stepNum = idx + 1;
      node.classList.remove('active', 'completed');
      if (stepNum === this.currentStep) {
        node.classList.add('active');
      } else if (stepNum < this.currentStep) {
        node.classList.add('completed');
      }
    });

    // Update wizard panes
    document.querySelectorAll('.wizard-pane').forEach((pane, idx) => {
      const stepNum = idx + 1;
      pane.classList.toggle('active', stepNum === this.currentStep);
    });

    // If on review step (Step 7), populate review fields
    if (this.currentStep === 7) {
      this.renderReviewSummary();
    }
  },

  checkPotentialDuplicates() {
    const duplicates = Complaints.detectDuplicates({
      title: this.formData.title,
      description: this.formData.description,
      category: this.formData.category,
      lat: this.formData.lat,
      lng: this.formData.lng
    });

    const banner = document.getElementById('duplicate-alert-box');
    if (banner) {
      if (duplicates.length > 0) {
        const topMatch = duplicates[0];
        banner.innerHTML = `
          <div style="font-size: 1.4rem; color: var(--warning);"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div style="flex: 1;">
            <strong>Possible Existing Issue Nearby:</strong>
            <p style="margin: 0.25rem 0; font-size: 0.85rem;">"${topMatch.title}" (${topMatch.id}) was already reported in this area with ${topMatch.upvotes || 1} supporters.</p>
            <a href="complaint-details.html?id=${topMatch.id}" class="btn btn-outline btn-sm mt-1">
              Support Existing Issue (+1 Upvote)
            </a>
          </div>
        `;
        banner.classList.add('show');
      } else {
        banner.classList.remove('show');
      }
    }
  },

  renderReviewSummary() {
    const summaryBox = document.getElementById('review-summary-content');
    if (!summaryBox) return;

    const estScore = PriorityEngine.calculatePriorityScore({
      category: this.formData.category,
      peopleAffected: this.formData.peopleAffected,
      priority: this.formData.priority,
      upvotes: 1
    });

    summaryBox.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <span class="text-muted" style="font-size: 0.8rem;">CATEGORY</span>
          <div style="font-weight: 700;">${this.formData.category}</div>
        </div>
        <div>
          <span class="text-muted" style="font-size: 0.8rem;">ESTIMATED CIVIC PRIORITY SCORE</span>
          <div><span class="badge ${estScore >= 80 ? 'badge-danger' : estScore >= 60 ? 'badge-warning' : 'badge-primary'}">${estScore}/100</span></div>
        </div>
        <div>
          <span class="text-muted" style="font-size: 0.8rem;">PEOPLE AFFECTED</span>
          <div style="font-weight: 600;">${this.formData.peopleAffected} citizens</div>
        </div>
        <div>
          <span class="text-muted" style="font-size: 0.8rem;">LOCALITY</span>
          <div style="font-weight: 600;">${this.formData.area}, ${this.formData.city}</div>
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <span class="text-muted" style="font-size: 0.8rem;">ISSUE TITLE</span>
        <div style="font-weight: 700; font-size: 1.1rem;">${Utils.escapeHtml(this.formData.title)}</div>
      </div>
      <div>
        <span class="text-muted" style="font-size: 0.8rem;">DESCRIPTION</span>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${Utils.escapeHtml(this.formData.description)}</p>
      </div>
      ${this.formData.beforeImage ? `
        <div style="margin-top: 1rem;">
          <span class="text-muted" style="font-size: 0.8rem;">ATTACHED PHOTO PROOF</span>
          <img src="${this.formData.beforeImage}" style="max-height: 160px; border-radius: 8px; margin-top: 0.5rem; object-fit: cover;">
        </div>
      ` : ''}
    `;
  },

  submitComplaint() {
    const user = Auth.getCurrentUser();
    if (!user) {
      UI.showToast({ type: 'error', title: 'Authentication Required', message: 'Please login to submit this complaint.' });
      return;
    }

    const submitBtn = document.getElementById('btn-submit-complaint');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting to Municipal Desk...';
    }

    setTimeout(() => {
      const complaint = Complaints.create(this.formData, user);
      UI.showToast({
        type: 'success',
        title: 'Complaint Registered! 🎉',
        message: `Your tracking ID is ${complaint.id}. Redirecting to tracking timeline...`
      });

      setTimeout(() => {
        window.location.href = `complaint-details.html?id=${complaint.id}`;
      }, 1200);
    }, 800);
  }
};
