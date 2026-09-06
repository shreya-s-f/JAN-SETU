/**
 * JANSETU FULL-STACK BACKEND SERVER (server.js)
 * High-performance, zero-dependency Node.js HTTP & REST API Server.
 * 
 * Features:
 * - Serves all static frontend files (HTML, CSS, JS, Assets) with full MIME mapping
 * - Complete RESTful API for Complaints, Auth, Verification, Workers, Departments,
 *   Email Simulation Logs, Notifications, Analytics, and Data Reset
 * - Persistent JSON file-based database store in data/database.json
 * - Works out of the box with: node server.js (Zero npm install required!)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// MIME types mapping for static file serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load or initialize database
 */
function getInitialSeedData() {
  // Read seed data from js/storage.js structure
  return {
    users: [
      {
        id: 'usr-1',
        name: 'Rajesh Kumar',
        email: 'citizen@jansetu.in',
        password: 'citizen123',
        phone: '+91 98450 12345',
        role: 'citizen',
        city: 'Bengaluru',
        ward: 'Ward 150 - Indiranagar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        impactScore: 340,
        memberSince: '2025-11-12T10:00:00.000Z',
        badges: ['First Reporter', 'Civic Observer', 'Community Helper']
      },
      {
        id: 'usr-2',
        name: 'Priya Sharma (IAS)',
        email: 'admin@jansetu.in',
        password: 'admin123',
        phone: '+91 98110 54321',
        role: 'admin',
        city: 'Bengaluru',
        department: 'Municipal Corporation HQ',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        memberSince: '2025-08-01T09:00:00.000Z'
      },
      {
        id: 'usr-3',
        name: 'Suresh Patil',
        email: 'worker@jansetu.in',
        password: 'worker123',
        phone: '+91 94480 98765',
        role: 'worker',
        city: 'Bengaluru',
        department: 'Roads & Infrastructure',
        ward: 'Ward 150 - Indiranagar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        completedTasks: 42,
        activeTasks: 3,
        rating: 4.8
      }
    ],
    departments: [
      { id: 'dept-roads', name: 'Roads & Infrastructure', head: 'Er. R. Sundaram', email: 'roads@bbmp.gov.in', activeIssues: 18, resolvedIssues: 142, avgHours: 48, satisfaction: 84 },
      { id: 'dept-sanitation', name: 'Solid Waste Management', head: 'Dr. Anita Desai', email: 'swm@bbmp.gov.in', activeIssues: 12, resolvedIssues: 215, avgHours: 18, satisfaction: 89 },
      { id: 'dept-water', name: 'Water Supply & Sewerage', head: 'K. Venkatesh', email: 'water@bwssb.gov.in', activeIssues: 15, resolvedIssues: 98, avgHours: 36, satisfaction: 76 },
      { id: 'dept-lighting', name: 'Street Lighting & Electrical', head: 'P. Balaji', email: 'lighting@bescom.gov.in', activeIssues: 7, resolvedIssues: 164, avgHours: 24, satisfaction: 92 },
      { id: 'dept-drainage', name: 'Stormwater Drainage', head: 'Manjunath Swamy', email: 'drainage@bbmp.gov.in', activeIssues: 14, resolvedIssues: 82, avgHours: 52, satisfaction: 71 },
      { id: 'dept-traffic', name: 'Traffic & Road Safety', head: 'ACP Naveen Reddy', email: 'traffic@bcp.gov.in', activeIssues: 9, resolvedIssues: 110, avgHours: 30, satisfaction: 86 },
      { id: 'dept-parks', name: 'Horticulture & Public Parks', head: 'V. Lakshmi', email: 'parks@bbmp.gov.in', activeIssues: 4, resolvedIssues: 68, avgHours: 40, satisfaction: 94 }
    ],
    workers: [
      { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765', email: 'worker@jansetu.in', deptId: 'dept-roads', ward: 'Indiranagar & Domlur', activeTasks: 2, completedTasks: 42 },
      { id: 'w-2', name: 'Ramesh Gowda', phone: '+91 98452 33445', email: 'ramesh.g@jansetu.in', deptId: 'dept-sanitation', ward: 'Koramangala & HSR', activeTasks: 3, completedTasks: 67 },
      { id: 'w-3', name: 'Anita Rao', phone: '+91 97410 88990', email: 'anita.rao@jansetu.in', deptId: 'dept-lighting', ward: 'CBD & MG Road', activeTasks: 1, completedTasks: 55 },
      { id: 'w-4', name: 'Vinod Deshmukh', phone: '+91 96200 44556', email: 'vinod.d@jansetu.in', deptId: 'dept-water', ward: 'Whitefield & Marathahalli', activeTasks: 4, completedTasks: 39 }
    ],
    challenges: [
      {
        id: 'ch-1',
        title: 'Zero Pothole Corridor: 100 Feet Road',
        category: 'Roads/Potholes',
        target: 25,
        resolved: 19,
        participants: 284,
        city: 'Bengaluru',
        area: 'Indiranagar',
        deadline: '2026-10-15T00:00:00.000Z',
        banner: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80',
        joined: true
      },
      {
        id: 'ch-2',
        title: 'Mission Swachh Koramangala 2026',
        category: 'Garbage',
        target: 40,
        resolved: 31,
        participants: 512,
        city: 'Bengaluru',
        area: 'Koramangala',
        deadline: '2026-11-01T00:00:00.000Z',
        banner: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        joined: false
      }
    ],
    complaints: [
      {
        id: 'JS-2026-001245',
        title: 'Massive crater pothole near 12th Main junction',
        category: 'Roads/Potholes',
        description: 'Large hazardous pothole right after the 12th Main traffic turn. Caused two two-wheeler skids yesterday during evening rain. Urgently needs asphalt filling.',
        city: 'Bengaluru',
        area: 'Indiranagar',
        address: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
        lat: 12.9719,
        lng: 77.6412,
        priority: 'critical',
        priorityScore: 92,
        peopleAffected: '100–500',
        status: 'in_progress',
        deptId: 'dept-roads',
        assignedWorker: { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-01T09:30:00.000Z',
        updatedAt: '2026-09-04T14:20:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
        upvotes: 142,
        verifications: { stillPresent: 18, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Issue Reported', desc: 'Complaint logged with location & photo evidence.', timestamp: '2026-09-01T09:30:00.000Z' },
          { status: 'verified', title: 'Admin Verified', desc: 'Civic Priority scored at 92/100. Verified by Municipal Admin.', timestamp: '2026-09-01T11:15:00.000Z' },
          { status: 'assigned', title: 'Worker Assigned', desc: 'Assigned to Ward Lead Suresh Patil.', timestamp: '2026-09-02T10:00:00.000Z' },
          { status: 'in_progress', title: 'Work Started', desc: 'Bitumen repair crew deployed on site with asphalt mixture.', timestamp: '2026-09-04T14:20:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001246',
        title: 'Overflowing open garbage dump near 80 Feet Road bus stop',
        category: 'Garbage',
        description: 'Black-spot garbage dumping has been unattended for 4 days. Stray dogs and cows tearing bags, causing unbearable stench and hygiene hazard near transit stop.',
        city: 'Bengaluru',
        area: 'Koramangala',
        address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
        lat: 12.9344,
        lng: 77.6256,
        priority: 'high',
        priorityScore: 78,
        peopleAffected: '500+',
        status: 'resolved',
        deptId: 'dept-sanitation',
        assignedWorker: { id: 'w-2', name: 'Ramesh Gowda', phone: '+91 98452 33445' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-08-28T08:00:00.000Z',
        updatedAt: '2026-08-30T16:45:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
        afterImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
        resolutionNote: 'Entire black spot cleared with Bobcat loader. Area bleached and painted with Rangoli warning signs.',
        citizensBenefited: 650,
        citizenRating: 5,
        citizenFeedback: 'Prompt and spotless cleanup! The street looks completely transformed.',
        upvotes: 210,
        verifications: { stillPresent: 1, resolved: 34 },
        timeline: [
          { status: 'submitted', title: 'Reported', desc: 'Complaint registered.', timestamp: '2026-08-28T08:00:00.000Z' },
          { status: 'resolved', title: 'Resolved & Sanitized', desc: 'Area sanitized with lime powder.', timestamp: '2026-08-30T16:45:00.000Z' }
        ]
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        userId: 'usr-1',
        title: 'Work Started on JS-2026-001245',
        message: 'Field Worker Suresh Patil has begun bitumen repair on your reported pothole at 12th Main Indiranagar.',
        type: 'status_update',
        complaintId: 'JS-2026-001245',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ],
    emailLogs: [
      {
        id: 'eml-001',
        to: 'citizen@jansetu.in',
        recipientName: 'Rajesh Kumar',
        subject: 'JanSetu: Complaint JS-2026-001245 Successfully Registered',
        template: 'issue_submitted',
        complaintId: 'JS-2026-001245',
        status: 'delivered',
        sentAt: new Date().toISOString(),
        bodyPreview: 'Report JS-2026-001245 received. Priority score 92/100.'
      }
    ]
  };
}

function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading database file, reinitializing:', e);
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving database:', e);
    return false;
  }
}

// Request body helper
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Cap at 20MB for photo uploads
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Server handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==========================================
  // REST API ROUTER (/api/...)
  // ==========================================
  if (pathname.startsWith('/api/')) {
    const db = loadDatabase();

    // 1. Health Check
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        app: 'JanSetu Civic Intelligence API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        complaintsCount: db.complaints.length
      });
    }

    // 2. Auth: Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseRequestBody(req);
      const user = db.users.find(
        u => u.email.toLowerCase() === (email || '').toLowerCase().trim() && u.password === password
      );
      if (user) {
        return sendJson(res, 200, { success: true, user });
      }
      return sendJson(res, 401, { success: false, message: 'Invalid credentials. Use demo accounts or verify email/password.' });
    }

    // 3. Auth: Register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const userData = await parseRequestBody(req);
      const exists = db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase().trim());
      if (exists) {
        return sendJson(res, 400, { success: false, message: 'An account with this email already exists.' });
      }

      const newUser = {
        id: 'usr-' + Date.now(),
        name: userData.name,
        email: userData.email.trim(),
        password: userData.password,
        phone: userData.phone || '+91 98000 00000',
        city: userData.city || 'Bengaluru',
        ward: userData.ward || 'General Ward',
        role: 'citizen',
        impactScore: 50,
        memberSince: new Date().toISOString(),
        badges: ['First Reporter']
      };

      db.users.push(newUser);

      // Log simulated registration email
      db.emailLogs.unshift({
        id: 'eml-' + Date.now(),
        to: newUser.email,
        recipientName: newUser.name,
        subject: `Welcome to JanSetu, ${newUser.name}! 🇮🇳`,
        template: 'registration',
        status: 'delivered',
        sentAt: new Date().toISOString(),
        bodyPreview: `Account created for ${newUser.name} in ${newUser.city}. Starting points: 50.`
      });

      saveDatabase(db);
      return sendJson(res, 201, { success: true, user: newUser });
    }

    // 4. Complaints: List & Filter
    if (pathname === '/api/complaints' && method === 'GET') {
      let list = [...db.complaints];
      const { category, status, city, search } = parsedUrl.query;

      if (category && category !== 'all') list = list.filter(c => c.category === category);
      if (status && status !== 'all') list = list.filter(c => c.status === status);
      if (city && city !== 'all') list = list.filter(c => c.city && c.city.toLowerCase() === city.toLowerCase());
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.area && c.area.toLowerCase().includes(q))
        );
      }

      return sendJson(res, 200, { success: true, total: list.length, complaints: list });
    }

    // 5. Complaints: Create
    if (pathname === '/api/complaints' && method === 'POST') {
      const issueData = await parseRequestBody(req);
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const newId = `JS-${new Date().getFullYear()}-${randomNum}`;

      const newComplaint = {
        id: newId,
        title: issueData.title,
        category: issueData.category,
        description: issueData.description,
        city: issueData.city || 'Bengaluru',
        area: issueData.area || 'Indiranagar',
        address: issueData.address || `${issueData.area || 'Indiranagar'}, ${issueData.city || 'Bengaluru'}`,
        lat: issueData.lat || 12.9716,
        lng: issueData.lng || 77.6412,
        priority: issueData.priority || 'medium',
        priorityScore: issueData.priorityScore || 75,
        peopleAffected: issueData.peopleAffected || '50–100',
        status: 'submitted',
        reportedBy: issueData.reportedBy || { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        beforeImage: issueData.beforeImage || 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
        upvotes: 1,
        verifications: { stillPresent: 1, resolved: 0 },
        timeline: [
          {
            status: 'submitted',
            title: 'Issue Logged by Citizen',
            desc: `Complaint reported with verified coordinates & photo evidence by ${issueData.reportedBy?.name || 'Citizen'}.`,
            timestamp: new Date().toISOString()
          }
        ]
      };

      db.complaints.unshift(newComplaint);

      // Log email & notification
      db.emailLogs.unshift({
        id: 'eml-' + Date.now(),
        to: newComplaint.reportedBy.email,
        recipientName: newComplaint.reportedBy.name,
        subject: `JanSetu: Report ${newId} Successfully Logged`,
        template: 'issue_submitted',
        complaintId: newId,
        status: 'delivered',
        sentAt: new Date().toISOString(),
        bodyPreview: `Report ${newId} (${newComplaint.title}) registered with Priority ${newComplaint.priorityScore}/100.`
      });

      db.notifications.unshift({
        id: 'notif-' + Date.now(),
        userId: newComplaint.reportedBy.id,
        title: `Report Logged: ${newId}`,
        message: `Your complaint "${newComplaint.title}" has been registered into the municipal queue.`,
        type: 'status_update',
        complaintId: newId,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      saveDatabase(db);
      return sendJson(res, 201, { success: true, complaint: newComplaint });
    }

    // 6. Complaints: Get Single
    const matchId = pathname.match(/^\/api\/complaints\/([^/]+)$/);
    if (matchId && method === 'GET') {
      const complaintId = matchId[1];
      const found = db.complaints.find(c => c.id === complaintId);
      if (found) return sendJson(res, 200, { success: true, complaint: found });
      return sendJson(res, 404, { success: false, message: 'Complaint not found.' });
    }

    // 7. Complaints: Upvote
    const matchUpvote = pathname.match(/^\/api\/complaints\/([^/]+)\/upvote$/);
    if (matchUpvote && method === 'POST') {
      const complaintId = matchUpvote[1];
      const item = db.complaints.find(c => c.id === complaintId);
      if (!item) return sendJson(res, 404, { success: false, message: 'Complaint not found.' });

      item.upvotes = (item.upvotes || 0) + 1;
      item.priorityScore = Math.min(100, item.priorityScore + 1);
      saveDatabase(db);
      return sendJson(res, 200, { success: true, upvotes: item.upvotes, score: item.priorityScore });
    }

    // 8. Complaints: Verify Status
    const matchVerify = pathname.match(/^\/api\/complaints\/([^/]+)\/verify$/);
    if (matchVerify && method === 'POST') {
      const complaintId = matchVerify[1];
      const { type } = await parseRequestBody(req);
      const item = db.complaints.find(c => c.id === complaintId);
      if (!item) return sendJson(res, 404, { success: false, message: 'Complaint not found.' });

      if (!item.verifications) item.verifications = { stillPresent: 0, resolved: 0 };
      if (type === 'still_present') item.verifications.stillPresent++;
      if (type === 'resolved') item.verifications.resolved++;

      saveDatabase(db);
      return sendJson(res, 200, { success: true, verifications: item.verifications });
    }

    // 9. Complaints: Admin Status Update / Assign / Escalate
    const matchStatus = pathname.match(/^\/api\/complaints\/([^/]+)\/status$/);
    if (matchStatus && method === 'PUT') {
      const complaintId = matchStatus[1];
      const payload = await parseRequestBody(req);
      const item = db.complaints.find(c => c.id === complaintId);
      if (!item) return sendJson(res, 404, { success: false, message: 'Complaint not found.' });

      if (payload.status) item.status = payload.status;
      if (payload.assignedWorker) item.assignedWorker = payload.assignedWorker;
      if (payload.deptId) item.deptId = payload.deptId;
      if (payload.priorityScore) item.priorityScore = payload.priorityScore;

      item.timeline.push({
        status: payload.status || 'updated',
        title: `Status Updated: ${(payload.status || 'updated').toUpperCase()}`,
        desc: payload.note || 'Municipal operations update applied.',
        timestamp: new Date().toISOString()
      });

      // Email log
      db.emailLogs.unshift({
        id: 'eml-' + Date.now(),
        to: item.reportedBy?.email || 'citizen@jansetu.in',
        recipientName: item.reportedBy?.name || 'Citizen',
        subject: `JanSetu Update: ${item.id} is now ${item.status.toUpperCase()}`,
        template: 'status_update',
        complaintId: item.id,
        status: 'delivered',
        sentAt: new Date().toISOString(),
        bodyPreview: `Status of ${item.id} transitioned to ${item.status}.`
      });

      saveDatabase(db);
      return sendJson(res, 200, { success: true, complaint: item });
    }

    // 10. Workers Roster
    if (pathname === '/api/workers' && method === 'GET') {
      return sendJson(res, 200, { success: true, workers: db.workers });
    }

    // 11. Departments
    if (pathname === '/api/departments' && method === 'GET') {
      return sendJson(res, 200, { success: true, departments: db.departments });
    }

    // 12. Email Logs
    if (pathname === '/api/emails' && method === 'GET') {
      return sendJson(res, 200, { success: true, logs: db.emailLogs });
    }

    // 13. Notifications
    if (pathname === '/api/notifications' && method === 'GET') {
      const { userId } = parsedUrl.query;
      const notifs = db.notifications.filter(n => !userId || n.userId === userId || n.userId === 'all');
      return sendJson(res, 200, { success: true, notifications: notifs });
    }

    // 14. Reset Database Endpoint
    if (pathname === '/api/reset' && method === 'POST') {
      const initial = getInitialSeedData();
      saveDatabase(initial);
      return sendJson(res, 200, { success: true, message: 'Database reset to clean demonstration seed state.' });
    }

    return sendJson(res, 404, { success: false, message: 'API Route Not Found' });
  }

  // ==========================================
  // STATIC FILE SERVER (HTML, CSS, JS, Assets)
  // ==========================================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Safe path traversal check
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: check if appending .html works (e.g. /login -> /login.html)
      if (fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      } else {
        // Serve 404.html
        const notFoundPath = path.join(__dirname, '404.html');
        if (fs.existsSync(notFoundPath)) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(notFoundPath).pipe(res);
          return;
        }
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🇮🇳 JANSETU SERVER ONLINE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🚀 REST API: http://localhost:${PORT}/api/health`);
  console.log(`📁 Database: ${DB_FILE}`);
  console.log('====================================================');
});
