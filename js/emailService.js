/**
 * JANSETU EMAIL NOTIFICATION MODULE (js/emailService.js)
 * Frontend Email Simulation Engine & Backend Integration Abstraction
 * 
 * -----------------------------------------------------------------------------
 * ⚠️ ARCHITECTURAL NOTE FOR PRODUCTION BACKEND INTEGRATION:
 * Pure browser JavaScript cannot and should never send real emails directly or
 * expose SMTP credentials / API keys (e.g. SendGrid, AWS SES, Resend, Postmark).
 * 
 * In production, this module would execute a secure authenticated POST request:
 * 
 * async function dispatchToBackend(payload) {
 *    const response = await fetch('https://api.jansetu.in/v1/notifications/email', {
 *       method: 'POST',
 *       headers: {
 *          'Content-Type': 'application/json',
 *          'Authorization': `Bearer ${userAuthToken}`
 *       },
 *       body: JSON.stringify(payload)
 *    });
 *    return await response.json();
 * }
 * -----------------------------------------------------------------------------
 */

const EmailService = {
  /**
   * Internal dispatcher that generates simulated email events, logs to localStorage,
   * triggers in-app notification toasts, and renders the Email Simulation Preview Modal.
   */
  _dispatchSimulatedEmail(options) {
    const {
      to,
      recipientName = 'Citizen',
      subject,
      template,
      complaintId = null,
      htmlContent,
      plainText
    } = options;

    const emailRecord = {
      id: 'eml-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      to,
      recipientName,
      subject,
      template,
      complaintId,
      status: 'simulated_delivered',
      sentAt: new Date().toISOString(),
      bodyPreview: plainText || 'Notification regarding civic report status update.',
      htmlContent
    };

    // 1. Persist in Storage Email Logs
    const currentLogs = Storage.get(STORAGE_KEYS.EMAIL_LOGS, []);
    currentLogs.unshift(emailRecord);
    Storage.set(STORAGE_KEYS.EMAIL_LOGS, currentLogs);

    console.log(`📨 [SIMULATED EMAIL SENT] To: ${to} | Subject: "${subject}"`);

    // 2. Dispatch Custom DOM Event for Global UI Listeners
    window.dispatchEvent(
      new CustomEvent('jansetu:email-sent', { detail: emailRecord })
    );

    // 3. Show Interactive Simulation Toast / Floating Badge
    if (window.UI && UI.showToast) {
      UI.showToast({
        type: 'info',
        title: '📧 Simulated Email Dispatched',
        message: `Sent to ${to}: "${subject}"`,
        duration: 6000
      });
    }

    return emailRecord;
  },

  /**
   * 1. Citizen Registration Confirmation
   */
  sendRegistrationEmail(user) {
    const subject = `Welcome to JanSetu, ${user.name}! 🇮🇳`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0066ff;">Welcome to JanSetu!</h2>
        <p>Namaste <strong>${user.name}</strong>,</p>
        <p>Thank you for stepping forward to make <strong>${user.city}</strong> a cleaner, safer, and better-governed city.</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Registered Email:</strong> ${user.email}</p>
          <p style="margin: 5px 0 0;"><strong>Starting Civic Impact Score:</strong> ${user.impactScore} Points</p>
        </div>
        <p>You can now report civic defects (potholes, garbage dumps, broken streetlights) and track their resolution transparently.</p>
        <p style="color: #64748b; font-size: 0.85em;">JanSetu Civic Intelligence Platform — Your Voice. Your City. Your JanSetu.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: user.email,
      recipientName: user.name,
      subject,
      template: 'registration',
      htmlContent,
      plainText: `Welcome to JanSetu! Your account for ${user.email} is active. Start reporting civic issues today.`
    });
  },

  /**
   * 2. Complaint Successfully Submitted
   */
  sendIssueSubmittedEmail(complaint, user) {
    const subject = `JanSetu: Report ${complaint.id} Successfully Logged`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #0066ff;">Civic Issue Logged Successfully</h3>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your civic issue has been successfully received and placed on the municipal priority queue.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Tracking ID:</strong> <span style="color: #0066ff; font-weight: bold;">${complaint.id}</span></p>
          <p style="margin: 5px 0 0;"><strong>Category:</strong> ${complaint.category}</p>
          <p style="margin: 5px 0 0;"><strong>Location:</strong> ${complaint.area}, ${complaint.city}</p>
          <p style="margin: 5px 0 0;"><strong>Civic Priority Score:</strong> ${complaint.priorityScore}/100 (${complaint.priority.toUpperCase()})</p>
        </div>
        <p>Our municipal coordination team will verify this report and dispatch field personnel.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: user.email,
      recipientName: user.name,
      subject,
      template: 'issue_submitted',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Report ${complaint.id} (${complaint.title}) logged with Priority Score ${complaint.priorityScore}/100.`
    });
  },

  /**
   * 3. Complaint Verified by Admin
   */
  sendIssueAcceptedEmail(complaint, user) {
    const subject = `JanSetu: Report ${complaint.id} Verified & Accepted`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #10b981;">Report Verified by Civic Administration</h3>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your reported issue <strong>"${complaint.title}"</strong> (${complaint.id}) has been verified by the municipal commissioner desk.</p>
        <p>It is scheduled for field dispatch under the <strong>${complaint.category}</strong> division.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: user.email,
      recipientName: user.name,
      subject,
      template: 'issue_verified',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Report ${complaint.id} verified and scheduled for field dispatch.`
    });
  },

  /**
   * 4. Complaint Rejected / Duplicate
   */
  sendIssueRejectedEmail(complaint, user, reason) {
    const subject = `JanSetu: Update on Report ${complaint.id}`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #ef4444;">Issue Report Status: Not Actionable</h3>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your issue <strong>"${complaint.title}"</strong> (${complaint.id}) could not be verified for the following reason:</p>
        <blockquote style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 10px 15px; margin: 15px 0;">
          ${reason || 'Location falls outside municipal jurisdiction or duplicate record exists.'}
        </blockquote>
        <p>If you believe this was an error, you may file a community appeal from your dashboard.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: user.email,
      recipientName: user.name,
      subject,
      template: 'issue_rejected',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Report ${complaint.id} was marked not actionable: ${reason}`
    });
  },

  /**
   * 5. Field Worker Assigned
   */
  sendAssignmentEmail(complaint, worker, citizen) {
    const subject = `JanSetu: Field Team Assigned for ${complaint.id}`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #a855f7;">Field Worker Dispatched</h3>
        <p>Dear <strong>${citizen.name}</strong>,</p>
        <p>Your complaint has been assigned to our municipal field squad:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
          <p style="margin: 0;"><strong>Assigned Lead:</strong> ${worker.name}</p>
          <p style="margin: 5px 0 0;"><strong>Contact:</strong> ${worker.phone}</p>
          <p style="margin: 5px 0 0;"><strong>Ward:</strong> ${worker.ward || complaint.area}</p>
        </div>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: citizen.email,
      recipientName: citizen.name,
      subject,
      template: 'issue_assigned',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Worker ${worker.name} (${worker.phone}) assigned to your complaint ${complaint.id}.`
    });
  },

  /**
   * 6. Work Started / Progress Update
   */
  sendProgressEmail(complaint, note, citizen) {
    const subject = `JanSetu: Work in Progress on ${complaint.id}`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #f59e0b;">Ground Work Initiated</h3>
        <p>Dear <strong>${citizen.name}</strong>,</p>
        <p>Ground operations have commenced for <strong>"${complaint.title}"</strong> (${complaint.id}).</p>
        <p><strong>Field Worker Note:</strong> <em>"${note}"</em></p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: citizen.email,
      recipientName: citizen.name,
      subject,
      template: 'issue_progress',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Work started on ${complaint.id}: ${note}`
    });
  },

  /**
   * 7. Issue Resolved
   */
  sendResolvedEmail(complaint, resolutionData, citizen) {
    const subject = `JanSetu: Issue ${complaint.id} Successfully Resolved! 🎉`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #10b981;">Issue Resolved with Proof</h3>
        <p>Dear <strong>${citizen.name}</strong>,</p>
        <p>The municipal crew has completed repair work on <strong>"${complaint.title}"</strong> (${complaint.id}).</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Resolution Note:</strong> ${resolutionData.resolutionNote || 'Work inspected and completed according to standard civic specifications.'}</p>
          <p style="margin: 5px 0 0;"><strong>Benefited Citizens:</strong> ~${resolutionData.citizensBenefited || 100} citizens</p>
        </div>
        <p>Please inspect the before/after photos and give your 1 to 5-star rating, or reopen the complaint if unresolved.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: citizen.email,
      recipientName: citizen.name,
      subject,
      template: 'issue_resolved',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Issue ${complaint.id} marked resolved. Please rate the resolution quality on JanSetu.`
    });
  },

  /**
   * 8. Issue Reopened by Citizen
   */
  sendReopenedEmail(complaint, reason) {
    const subject = `JanSetu Alert: Issue ${complaint.id} Reopened by Citizen`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #ec4899;">Issue Reopened for Inspection</h3>
        <p>The citizen was not satisfied with the resolution of <strong>${complaint.id}</strong>.</p>
        <p><strong>Citizen Reason:</strong> <em>"${reason}"</em></p>
        <p>This complaint has been flagged for Senior Supervisor review.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: 'admin@jansetu.in',
      recipientName: 'Municipal Admin',
      subject,
      template: 'issue_reopened',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Complaint ${complaint.id} was reopened by citizen: ${reason}`
    });
  },

  /**
   * 9. Escalation / Overdue Alert
   */
  sendEscalationEmail(complaint) {
    const subject = `🚨 JanSetu ESCALATION: Complaint ${complaint.id} Exceeded SLA`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h3 style="color: #ef4444;">Resolution SLA Exceeded - High Priority Escalation</h3>
        <p>Complaint <strong>${complaint.id}</strong> (${complaint.title}) in <strong>${complaint.area}, ${complaint.city}</strong> has been pending beyond standard response deadlines.</p>
        <p>Civic Priority Score auto-elevated to <strong>${complaint.priorityScore}/100</strong>.</p>
      </div>
    `;
    return this._dispatchSimulatedEmail({
      to: 'admin@jansetu.in',
      recipientName: 'Municipal Commissioner Desk',
      subject,
      template: 'issue_escalation',
      complaintId: complaint.id,
      htmlContent,
      plainText: `Complaint ${complaint.id} has exceeded SLA resolution timeline and has been escalated.`
    });
  }
};
