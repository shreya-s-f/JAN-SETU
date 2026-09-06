/**
 * JANSETU COMPLAINTS SERVICE (js/complaints.js)
 * Issue CRUD, Duplicate Detection Algorithm, Community Verification,
 * Upvoting, and Escalation Rules.
 */

const Complaints = {
  /**
   * Get all complaints with optional filter parameters
   */
  getAll(filters = {}) {
    let list = Storage.get(STORAGE_KEYS.COMPLAINTS, []);

    if (filters.status && filters.status !== 'all') {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      list = list.filter(c => c.category === filters.category);
    }
    if (filters.city && filters.city !== 'all') {
      list = list.filter(c => c.city && c.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.area && c.area.toLowerCase().includes(q))
      );
    }
    if (filters.priority && filters.priority !== 'all') {
      list = list.filter(c => c.priority === filters.priority);
    }

    return list;
  },

  /**
   * Get single complaint by ID
   */
  getById(id) {
    const list = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    return list.find(c => c.id === id) || null;
  },

  /**
   * Duplicate / Related Issue Detection Algorithm
   * Compares Category, Keyword matching in Title/Description, and Geolocation proximity (< 1.5 km)
   */
  detectDuplicates(newIssue) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const inputWords = (newIssue.title + ' ' + (newIssue.description || ''))
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3);

    const matches = all.filter(existing => {
      // Must be open / active
      if (existing.status === 'resolved' || existing.status === 'rejected') return false;

      // Check category match
      const sameCategory = existing.category === newIssue.category;

      // Check keyword overlap
      const existingText = (existing.title + ' ' + existing.description).toLowerCase();
      let keywordHits = 0;
      inputWords.forEach(word => {
        if (existingText.includes(word)) keywordHits++;
      });

      // Check distance if coordinates present
      let nearby = false;
      if (newIssue.lat && newIssue.lng && existing.lat && existing.lng) {
        const dist = Utils.getDistanceKm(newIssue.lat, newIssue.lng, existing.lat, existing.lng);
        if (dist <= 1.5) nearby = true;
      }

      return (sameCategory && keywordHits >= 2) || (nearby && keywordHits >= 2) || (sameCategory && nearby);
    });

    return matches;
  },

  /**
   * Create and persist new Civic Complaint
   */
  create(issueData, user) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const newId = Utils.generateComplaintId();

    const priorityScore = PriorityEngine.calculatePriorityScore({
      category: issueData.category,
      peopleAffected: issueData.peopleAffected,
      priority: issueData.priority,
      upvotes: 1
    });

    const newComplaint = {
      id: newId,
      title: issueData.title,
      category: issueData.category,
      description: issueData.description,
      city: issueData.city || user.city || 'Bengaluru',
      area: issueData.area || 'Indiranagar',
      address: issueData.address || `${issueData.area || 'Indiranagar'}, ${issueData.city || 'Bengaluru'}`,
      lat: issueData.lat || 12.9716,
      lng: issueData.lng || 77.6412,
      priority: issueData.priority || 'medium',
      priorityScore: priorityScore,
      peopleAffected: issueData.peopleAffected || '10–50',
      status: 'submitted',
      reportedBy: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      beforeImage: issueData.beforeImage || 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
      upvotes: 1,
      verifications: { stillPresent: 1, resolved: 0 },
      timeline: [
        {
          status: 'submitted',
          title: 'Issue Logged by Citizen',
          desc: `Complaint reported with verified coordinates & photo evidence by ${user.name}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    all.unshift(newComplaint);
    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    // Award citizen impact points (+20)
    user.impactScore = (user.impactScore || 0) + 20;
    Storage.set(STORAGE_KEYS.CURRENT_USER, user);

    // Update user in users list
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const updatedUsers = users.map(u => (u.id === user.id ? user : u));
    Storage.set(STORAGE_KEYS.USERS, updatedUsers);

    // Trigger Notifications & Simulated Email
    if (window.Notifications) {
      Notifications.createNotification({
        userId: user.id,
        title: `Report Logged: ${newId}`,
        message: `Your issue "${issueData.title}" has been registered. Priority: ${priorityScore}/100.`,
        type: 'status_update',
        complaintId: newId
      });
    }

    if (window.EmailService) {
      EmailService.sendIssueSubmittedEmail(newComplaint, user);
    }

    return newComplaint;
  },

  /**
   * Community Upvoting Logic (prevents duplicate vote per session user)
   */
  upvote(complaintId, user) {
    if (!user) return { success: false, message: 'Please login to upvote this issue.' };

    const votes = Storage.get(STORAGE_KEYS.VOTES, {});
    const voteKey = `${user.id}_${complaintId}`;

    if (votes[voteKey]) {
      return { success: false, message: 'You have already supported this issue.' };
    }

    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return { success: false, message: 'Complaint not found.' };

    item.upvotes = (item.upvotes || 0) + 1;
    // Re-evaluate Civic Priority Score with higher community backing
    item.priorityScore = Math.min(100, item.priorityScore + 1);

    votes[voteKey] = true;
    Storage.set(STORAGE_KEYS.VOTES, votes);
    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    // Give citizen upvote karma (+2 points)
    user.impactScore = (user.impactScore || 0) + 2;
    Storage.set(STORAGE_KEYS.CURRENT_USER, user);

    return { success: true, upvotes: item.upvotes, score: item.priorityScore };
  },

  /**
   * Community Verification: "Still Present" vs "Resolved"
   */
  verifyCommunityStatus(complaintId, verificationType, user) {
    if (!user) return { success: false, message: 'Please login to submit community verification.' };

    const verifications = Storage.get(STORAGE_KEYS.VERIFICATIONS, {});
    const verifyKey = `${user.id}_${complaintId}`;

    if (verifications[verifyKey]) {
      return { success: false, message: 'You have already verified this complaint.' };
    }

    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return { success: false, message: 'Complaint not found.' };

    if (!item.verifications) {
      item.verifications = { stillPresent: 0, resolved: 0 };
    }

    if (verificationType === 'still_present') {
      item.verifications.stillPresent += 1;
    } else if (verificationType === 'resolved') {
      item.verifications.resolved += 1;
    }

    verifications[verifyKey] = verificationType;
    Storage.set(STORAGE_KEYS.VERIFICATIONS, verifications);
    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    // Reward citizen (+10 impact points)
    user.impactScore = (user.impactScore || 0) + 10;
    Storage.set(STORAGE_KEYS.CURRENT_USER, user);

    return { success: true, verifications: item.verifications };
  },

  /**
   * Admin Verification & Status Progression
   */
  updateStatus(complaintId, newStatus, extraData = {}) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return null;

    item.status = newStatus;
    item.updatedAt = new Date().toISOString();

    if (extraData.assignedWorker) item.assignedWorker = extraData.assignedWorker;
    if (extraData.deptId) item.deptId = extraData.deptId;
    if (extraData.priority) item.priority = extraData.priority;
    if (extraData.priorityScore) item.priorityScore = extraData.priorityScore;

    // Timeline event
    const statusTitles = {
      verified: 'Verified by Municipal Admin',
      assigned: `Assigned to ${extraData.assignedWorker?.name || 'Field Squad'}`,
      in_progress: 'Field Work Started',
      resolved: 'Issue Marked Resolved with Proof',
      rejected: 'Issue Marked Not Actionable',
      reopened: 'Reopened by Citizen'
    };

    item.timeline.push({
      status: newStatus,
      title: statusTitles[newStatus] || 'Status Updated',
      desc: extraData.note || `Complaint transitioned to ${newStatus}.`,
      timestamp: new Date().toISOString()
    });

    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    // In-app & Simulated Email notifications
    if (item.reportedBy && item.reportedBy.id) {
      if (window.Notifications) {
        Notifications.createNotification({
          userId: item.reportedBy.id,
          title: `Status Update: ${item.id}`,
          message: `${item.title} is now ${newStatus.toUpperCase().replace('_', ' ')}.`,
          type: 'status_update',
          complaintId: item.id
        });
      }

      if (window.EmailService) {
        if (newStatus === 'verified') EmailService.sendIssueAcceptedEmail(item, item.reportedBy);
        if (newStatus === 'rejected') EmailService.sendIssueRejectedEmail(item, item.reportedBy, extraData.note);
        if (newStatus === 'assigned') EmailService.sendAssignmentEmail(item, extraData.assignedWorker, item.reportedBy);
      }
    }

    return item;
  },

  /**
   * Field Worker Resolution with Before/After image proof
   */
  resolveIssue(complaintId, resolutionData, worker) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return null;

    item.status = 'resolved';
    item.updatedAt = new Date().toISOString();
    item.afterImage = resolutionData.afterImage || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
    item.resolutionNote = resolutionData.resolutionNote;
    item.citizensBenefited = resolutionData.citizensBenefited || 150;
    item.resolvedByWorker = {
      id: worker.id,
      name: worker.name
    };

    item.timeline.push({
      status: 'resolved',
      title: 'Resolution Completed & Verified',
      desc: resolutionData.resolutionNote || 'Ground work completed with photographic proof.',
      timestamp: new Date().toISOString()
    });

    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    // Notify citizen
    if (item.reportedBy) {
      if (window.Notifications) {
        Notifications.createNotification({
          userId: item.reportedBy.id,
          title: `Issue Resolved: ${item.id} 🎉`,
          message: `Worker ${worker.name} has completed repair work. View before/after photos and give feedback.`,
          type: 'resolved',
          complaintId: item.id
        });
      }

      if (window.EmailService) {
        EmailService.sendResolvedEmail(item, resolutionData, item.reportedBy);
      }
    }

    return item;
  },

  /**
   * Citizen Feedback & Rating Submission
   */
  submitFeedback(complaintId, rating, feedbackText, user) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return false;

    item.citizenRating = rating;
    item.citizenFeedback = feedbackText;
    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    user.impactScore = (user.impactScore || 0) + 15;
    Storage.set(STORAGE_KEYS.CURRENT_USER, user);

    return true;
  },

  /**
   * Citizen Reopens an Issue
   */
  reopenIssue(complaintId, reason, user) {
    const all = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const item = all.find(c => c.id === complaintId);
    if (!item) return false;

    item.status = 'reopened';
    item.updatedAt = new Date().toISOString();
    item.reopenReason = reason;

    item.timeline.push({
      status: 'reopened',
      title: 'Issue Reopened by Citizen',
      desc: reason,
      timestamp: new Date().toISOString()
    });

    Storage.set(STORAGE_KEYS.COMPLAINTS, all);

    if (window.EmailService) {
      EmailService.sendReopenedEmail(item, reason);
    }

    return true;
  }
};
