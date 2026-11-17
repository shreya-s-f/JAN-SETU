/**
 * JANSETU STORAGE ENGINE (js/storage.js)
 * Centralized localStorage repository with 20+ realistic Indian civic complaints,
 * municipal departments, field workers, demo users, community challenges, and audit logs.
 */

const STORAGE_KEYS = {
  USERS: 'jansetu_users',
  CURRENT_USER: 'jansetu_current_user',
  COMPLAINTS: 'jansetu_complaints',
  DEPARTMENTS: 'jansetu_departments',
  WORKERS: 'jansetu_workers',
  CHALLENGES: 'jansetu_challenges',
  NOTIFICATIONS: 'jansetu_notifications',
  EMAIL_LOGS: 'jansetu_email_logs',
  SETTINGS: 'jansetu_settings',
  VOTES: 'jansetu_user_votes',
  VERIFICATIONS: 'jansetu_user_verifications'
};

const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e);
      return false;
    }
  },

  /**
   * Reset the entire database with fresh, realistic demo data
   */
  resetDemoData() {
    localStorage.clear();
    this.initDatabase(true);
  },

  /**
   * Initialize database with seed records if empty or forced
   */
  initDatabase(force = false) {
    if (!force && this.get(STORAGE_KEYS.COMPLAINTS)) {
      return; // Already initialized
    }

    console.log('⚡ Seeding JanSetu local database with realistic civic data...');

    // 1. Demo Users
    const seedUsers = [
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
    ];

    // 2. Municipal Departments
    const seedDepartments = [
      { id: 'dept-roads', name: 'Roads & Infrastructure', head: 'Er. R. Sundaram', email: 'roads@bbmp.gov.in', activeIssues: 18, resolvedIssues: 142, avgHours: 48, satisfaction: 84 },
      { id: 'dept-sanitation', name: 'Solid Waste Management', head: 'Dr. Anita Desai', email: 'swm@bbmp.gov.in', activeIssues: 12, resolvedIssues: 215, avgHours: 18, satisfaction: 89 },
      { id: 'dept-water', name: 'Water Supply & Sewerage', head: 'K. Venkatesh', email: 'water@bwssb.gov.in', activeIssues: 15, resolvedIssues: 98, avgHours: 36, satisfaction: 76 },
      { id: 'dept-lighting', name: 'Street Lighting & Electrical', head: 'P. Balaji', email: 'lighting@bescom.gov.in', activeIssues: 7, resolvedIssues: 164, avgHours: 24, satisfaction: 92 },
      { id: 'dept-drainage', name: 'Stormwater Drainage', head: 'Manjunath Swamy', email: 'drainage@bbmp.gov.in', activeIssues: 14, resolvedIssues: 82, avgHours: 52, satisfaction: 71 },
      { id: 'dept-traffic', name: 'Traffic & Road Safety', head: 'ACP Naveen Reddy', email: 'traffic@bcp.gov.in', activeIssues: 9, resolvedIssues: 110, avgHours: 30, satisfaction: 86 },
      { id: 'dept-parks', name: 'Horticulture & Public Parks', head: 'V. Lakshmi', email: 'parks@bbmp.gov.in', activeIssues: 4, resolvedIssues: 68, avgHours: 40, satisfaction: 94 }
    ];

    // 3. Field Workers Roster
    const seedWorkers = [
      { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765', email: 'worker@jansetu.in', deptId: 'dept-roads', ward: 'Indiranagar & Domlur', activeTasks: 2, completedTasks: 42 },
      { id: 'w-2', name: 'Ramesh Gowda', phone: '+91 98452 33445', email: 'ramesh.g@jansetu.in', deptId: 'dept-sanitation', ward: 'Koramangala & HSR', activeTasks: 3, completedTasks: 67 },
      { id: 'w-3', name: 'Anita Rao', phone: '+91 97410 88990', email: 'anita.rao@jansetu.in', deptId: 'dept-lighting', ward: 'CBD & MG Road', activeTasks: 1, completedTasks: 55 },
      { id: 'w-4', name: 'Vinod Deshmukh', phone: '+91 96200 44556', email: 'vinod.d@jansetu.in', deptId: 'dept-water', ward: 'Whitefield & Marathahalli', activeTasks: 4, completedTasks: 39 }
    ];

    // 4. Community Challenges
    const seedChallenges = [
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
      },
      {
        id: 'ch-3',
        title: 'Light Up Every Alley: Ward 150',
        category: 'Streetlights',
        target: 20,
        resolved: 16,
        participants: 198,
        city: 'Bengaluru',
        area: 'Indiranagar',
        deadline: '2026-09-30T00:00:00.000Z',
        banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        joined: true
      }
    ];

    // 5. 22 Realistic Indian Civic Complaints
    const seedComplaints = [
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
          { status: 'submitted', title: 'Issue Reported', desc: 'Complaint logged by Rajesh Kumar with location & photo evidence.', timestamp: '2026-09-01T09:30:00.000Z' },
          { status: 'verified', title: 'Admin Verified', desc: 'Civic Priority scored at 92/100 (Critical). Verified by Municipal Admin.', timestamp: '2026-09-01T11:15:00.000Z' },
          { status: 'assigned', title: 'Worker Assigned', desc: 'Assigned to Ward Lead Suresh Patil (Roads & Infrastructure).', timestamp: '2026-09-02T10:00:00.000Z' },
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
        resolutionNote: 'Entire black spot cleared with Bobcat loader. Area bleached and painted with Rangoli warning signs. Daily compactor scheduled at 7:00 AM.',
        citizensBenefited: 650,
        citizenRating: 5,
        citizenFeedback: 'Prompt and spotless cleanup! The street looks completely transformed.',
        upvotes: 210,
        verifications: { stillPresent: 1, resolved: 34 },
        timeline: [
          { status: 'submitted', title: 'Reported', desc: 'Complaint registered.', timestamp: '2026-08-28T08:00:00.000Z' },
          { status: 'verified', title: 'Verified by Admin', desc: 'SWM team alerted.', timestamp: '2026-08-28T10:30:00.000Z' },
          { status: 'assigned', title: 'Assigned', desc: 'Ramesh Gowda dispatched.', timestamp: '2026-08-29T07:15:00.000Z' },
          { status: 'in_progress', title: 'Cleaning in progress', desc: 'Waste removed.', timestamp: '2026-08-29T11:00:00.000Z' },
          { status: 'resolved', title: 'Resolved & Sanitized', desc: 'Area sanitized with lime powder.', timestamp: '2026-08-30T16:45:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001247',
        title: 'Dark stretch due to 6 non-functional streetlights',
        category: 'Streetlights',
        description: 'Six consecutive LED poles from Sony World signal towards Ejipura are dead. Extremely unsafe for women walking home after 8 PM.',
        city: 'Bengaluru',
        area: 'Koramangala',
        address: 'Intermediate Ring Rd, Koramangala 1st Block, Bengaluru, Karnataka 560047',
        lat: 12.9362,
        lng: 77.6335,
        priority: 'high',
        priorityScore: 74,
        peopleAffected: '100–500',
        status: 'assigned',
        deptId: 'dept-lighting',
        assignedWorker: { id: 'w-3', name: 'Anita Rao', phone: '+91 97410 88990' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-02T18:40:00.000Z',
        updatedAt: '2026-09-03T11:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        upvotes: 88,
        verifications: { stillPresent: 14, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Reported', desc: 'Report logged with geo-tag.', timestamp: '2026-09-02T18:40:00.000Z' },
          { status: 'verified', title: 'Priority Assessed', desc: 'Safety priority scored 74.', timestamp: '2026-09-03T09:00:00.000Z' },
          { status: 'assigned', title: 'Assigned to Anita Rao', desc: 'BESCOM lineman team notified for capacitor replacement.', timestamp: '2026-09-03T11:00:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001248',
        title: 'Severe pipeline burst wasting drinking water on roadside',
        category: 'Water Supply',
        description: 'High pressure Cauvery water line burst near BDA complex. Thousands of liters flooding the main road while local residential apartments have zero tap water.',
        city: 'Bengaluru',
        area: 'Indiranagar',
        address: 'Old Airport Road near Kodihalli Junction, Bengaluru, Karnataka 560008',
        lat: 12.9602,
        lng: 77.6485,
        priority: 'critical',
        priorityScore: 96,
        peopleAffected: '500+',
        status: 'submitted',
        deptId: 'dept-water',
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-05T07:15:00.000Z',
        updatedAt: '2026-09-05T07:15:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
        upvotes: 185,
        verifications: { stillPresent: 29, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Report Logged', desc: 'Emergency priority water loss reported.', timestamp: '2026-09-05T07:15:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001249',
        title: 'Broken stormwater drain slab exposing deep trench',
        category: 'Drainage/Flooding',
        description: 'Footpath concrete slab collapsed into stormwater drain outside primary school gate. Serious child hazard. Requires immediate precast slab replacement.',
        city: 'Bengaluru',
        area: 'HSR Layout',
        address: 'Sector 2, 27th Main Rd, HSR Layout, Bengaluru, Karnataka 560102',
        lat: 12.9116,
        lng: 77.6521,
        priority: 'critical',
        priorityScore: 89,
        peopleAffected: '100–500',
        status: 'in_progress',
        deptId: 'dept-drainage',
        assignedWorker: { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-03T12:00:00.000Z',
        updatedAt: '2026-09-04T10:30:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        upvotes: 95,
        verifications: { stillPresent: 12, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Issue Logged', desc: 'Reported with school pedestrian hazard note.', timestamp: '2026-09-03T12:00:00.000Z' },
          { status: 'verified', title: 'Verified', desc: 'Admin confirmed high vulnerability.', timestamp: '2026-09-03T15:30:00.000Z' },
          { status: 'assigned', title: 'Assigned', desc: 'Assigned to Suresh Patil.', timestamp: '2026-09-03T17:00:00.000Z' },
          { status: 'in_progress', title: 'Barricaded', desc: 'Safety barriers placed; replacement slab arriving tomorrow.', timestamp: '2026-09-04T10:30:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001250',
        title: 'Traffic signal malfunctioning causing gridlock at Silk Board',
        category: 'Traffic Signals',
        description: 'Timer stuck on red on Hosur Road ramp causing 2 km long traffic jam stretching back to Madivala. Manual traffic police assistance requested immediately.',
        city: 'Bengaluru',
        area: 'Silk Board',
        address: 'Central Silk Board Junction, Outer Ring Rd, Bengaluru, Karnataka 560068',
        lat: 12.9176,
        lng: 77.6238,
        priority: 'high',
        priorityScore: 79,
        peopleAffected: '500+',
        status: 'resolved',
        deptId: 'dept-traffic',
        assignedWorker: { id: 'w-4', name: 'Vinod Deshmukh', phone: '+91 96200 44556' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-02T08:30:00.000Z',
        updatedAt: '2026-09-02T11:45:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1542314831-c6a4d27575b5?auto=format&fit=crop&w=800&q=80',
        afterImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
        resolutionNote: 'Signal motherboard controller reset and recalibrated with dynamic sensor timings. Traffic flowing normally.',
        citizensBenefited: 4200,
        citizenRating: 4,
        citizenFeedback: 'Fast action by the traffic maintenance unit.',
        upvotes: 310,
        verifications: { stillPresent: 0, resolved: 41 },
        timeline: [
          { status: 'submitted', title: 'Submitted', desc: 'Logged during morning rush hour.', timestamp: '2026-09-02T08:30:00.000Z' },
          { status: 'assigned', title: 'Fast-track Dispatch', desc: 'Dispatched signal technician.', timestamp: '2026-09-02T09:00:00.000Z' },
          { status: 'resolved', title: 'Restored', desc: 'Signal back online with 90s cycles.', timestamp: '2026-09-02T11:45:00.000Z' }
        ]
      },
      // Complaints from other major Indian metropolitan areas
      {
        id: 'JS-2026-001251',
        title: 'Damaged speed breaker causing axle damage on Linking Road',
        category: 'Roads/Potholes',
        description: 'Unmarked broken rubberized speed breaker with protruding iron rods near Khar Telephone exchange.',
        city: 'Mumbai',
        area: 'Bandra West',
        address: 'Linking Rd, Khar West, Mumbai, Maharashtra 400052',
        lat: 19.0668,
        lng: 72.8362,
        priority: 'high',
        priorityScore: 75,
        peopleAffected: '500+',
        status: 'verified',
        deptId: 'dept-roads',
        reportedBy: { id: 'usr-2', name: 'Priya Sharma', email: 'admin@jansetu.in' },
        createdAt: '2026-09-03T16:00:00.000Z',
        updatedAt: '2026-09-04T09:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
        upvotes: 62,
        verifications: { stillPresent: 8, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Logged', desc: 'Reported by local resident.', timestamp: '2026-09-03T16:00:00.000Z' },
          { status: 'verified', title: 'Verified by BMC Ward H/West', desc: 'Forwarded for removal.', timestamp: '2026-09-04T09:00:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001252',
        title: 'Open manhole lid missing in heavy rain zone',
        category: 'Drainage/Flooding',
        description: 'Manhole cover stolen or broken opposite metro pillar 102. Citizens placed a tree branch as makeshift warning.',
        city: 'Delhi',
        area: 'Connaught Place',
        address: 'Barakhamba Rd, Connaught Place, New Delhi 110001',
        lat: 28.6304,
        lng: 77.2177,
        priority: 'critical',
        priorityScore: 98,
        peopleAffected: '500+',
        status: 'assigned',
        deptId: 'dept-drainage',
        assignedWorker: { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-04T19:00:00.000Z',
        updatedAt: '2026-09-05T08:10:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        upvotes: 215,
        verifications: { stillPresent: 31, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Emergency report logged', desc: 'Life threat risk noted.', timestamp: '2026-09-04T19:00:00.000Z' },
          { status: 'assigned', title: 'NDMC Squad Dispatched', desc: 'Heavy cast ductile iron lid sent for placement.', timestamp: '2026-09-05T08:10:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001253',
        title: 'Uncollected construction debris blocking pedestrian walkway',
        category: 'Illegal Dumping',
        description: 'Debris from private commercial renovation dumped illegally on public pathway for over two weeks.',
        city: 'Hyderabad',
        area: 'Gachibowli',
        address: 'Old Mumbai Highway, Gachibowli, Hyderabad, Telangana 500032',
        lat: 17.4401,
        lng: 78.3489,
        priority: 'medium',
        priorityScore: 54,
        peopleAffected: '50–100',
        status: 'submitted',
        deptId: 'dept-sanitation',
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-04T11:20:00.000Z',
        updatedAt: '2026-09-04T11:20:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
        upvotes: 38,
        verifications: { stillPresent: 5, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Submitted', desc: 'Complaint registered.', timestamp: '2026-09-04T11:20:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001254',
        title: 'Broken children swing & open electrical wire in public park',
        category: 'Parks',
        description: 'The community park play area has broken metal swings with sharp rusted edges, and an underground lamp post junction wire is exposed right on the lawn.',
        city: 'Pune',
        area: 'Kothrud',
        address: 'Paud Rd, Ideal Colony, Kothrud, Pune, Maharashtra 411038',
        lat: 18.5074,
        lng: 73.8077,
        priority: 'high',
        priorityScore: 82,
        peopleAffected: '50–100',
        status: 'in_progress',
        deptId: 'dept-parks',
        assignedWorker: { id: 'w-3', name: 'Anita Rao', phone: '+91 97410 88990' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-01T15:00:00.000Z',
        updatedAt: '2026-09-03T14:10:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
        upvotes: 74,
        verifications: { stillPresent: 9, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Submitted', desc: 'Safety hazard noted.', timestamp: '2026-09-01T15:00:00.000Z' },
          { status: 'verified', title: 'Verified by PMC', desc: 'Priority heightened.', timestamp: '2026-09-02T10:00:00.000Z' },
          { status: 'in_progress', title: 'Electrician on site', desc: 'Wire insulated with MCB box; new swing ordered.', timestamp: '2026-09-03T14:10:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001255',
        title: 'Public toilet complex tap water disconnected and dirty',
        category: 'Public Toilets',
        description: 'E-toilet near metro station entrance has no running water for 5 days. High footfall area with severe hygiene failure.',
        city: 'Chennai',
        area: 'Anna Nagar',
        address: '2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040',
        lat: 13.0850,
        lng: 80.2101,
        priority: 'high',
        priorityScore: 76,
        peopleAffected: '100–500',
        status: 'assigned',
        deptId: 'dept-sanitation',
        assignedWorker: { id: 'w-2', name: 'Ramesh Gowda', phone: '+91 98452 33445' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-03T10:00:00.000Z',
        updatedAt: '2026-09-04T12:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        upvotes: 56,
        verifications: { stillPresent: 7, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Reported', desc: 'Sanitation report logged.', timestamp: '2026-09-03T10:00:00.000Z' },
          { status: 'assigned', title: 'Assigned', desc: 'Assigned to sanitation contractor.', timestamp: '2026-09-04T12:00:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001256',
        title: 'Fallen tree branch dangerously entangled in overhead power lines',
        category: 'Damaged Infrastructure',
        description: 'Heavy Gulmohar branch snapped during storm and resting directly on 11kV distribution line near residential colony gate.',
        city: 'Bengaluru',
        area: 'Whitefield',
        address: 'ITPB Main Rd, Whitefield, Bengaluru, Karnataka 560066',
        lat: 12.9863,
        lng: 77.7337,
        priority: 'critical',
        priorityScore: 94,
        peopleAffected: '100–500',
        status: 'in_progress',
        deptId: 'dept-lighting',
        assignedWorker: { id: 'w-4', name: 'Vinod Deshmukh', phone: '+91 96200 44556' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-04T17:30:00.000Z',
        updatedAt: '2026-09-05T08:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        upvotes: 110,
        verifications: { stillPresent: 15, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Urgent Hazard Logged', desc: 'Tree branch on power line.', timestamp: '2026-09-04T17:30:00.000Z' },
          { status: 'in_progress', title: 'BESCOM Tree Gang Deployed', desc: 'Power shutdown taken for 45 mins to clear branch safely.', timestamp: '2026-09-05T08:00:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001257',
        title: 'Pack of aggressive stray dogs chasing two-wheelers near school',
        category: 'Stray Animals',
        description: 'Pack of 8-10 aggressive stray dogs at junction near National Public School. Several near-accidents reported in the morning hours.',
        city: 'Bengaluru',
        area: 'Indiranagar',
        address: '100 Feet Rd near 4th Cross, Indiranagar, Bengaluru 560038',
        lat: 12.9734,
        lng: 77.6439,
        priority: 'medium',
        priorityScore: 58,
        peopleAffected: '50–100',
        status: 'submitted',
        deptId: 'dept-sanitation',
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-03T07:45:00.000Z',
        updatedAt: '2026-09-03T07:45:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
        upvotes: 49,
        verifications: { stillPresent: 11, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Reported', desc: 'ABC (Animal Birth Control) team requested.', timestamp: '2026-09-03T07:45:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001258',
        title: 'Clogged roadside drain causing flood during 20-minute showers',
        category: 'Drainage/Flooding',
        description: 'Solid plastic waste choking culvert under flyover ramp. Knee-deep stagnant water blocks service road completely.',
        city: 'Bengaluru',
        area: 'Domlur',
        address: 'Old Airport Rd, Domlur Flyover Service Rd, Bengaluru 560071',
        lat: 12.9609,
        lng: 77.6387,
        priority: 'high',
        priorityScore: 84,
        peopleAffected: '100–500',
        status: 'resolved',
        deptId: 'dept-drainage',
        assignedWorker: { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-08-25T14:00:00.000Z',
        updatedAt: '2026-08-27T17:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        afterImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        resolutionNote: 'Suction jetting machine cleared 4.5 tons of silt and plastic from stormwater culvert. Water flowing freely.',
        citizensBenefited: 1200,
        citizenRating: 5,
        citizenFeedback: 'Super clean desilting. Service road remained totally dry in yesterday rain!',
        upvotes: 172,
        verifications: { stillPresent: 0, resolved: 28 },
        timeline: [
          { status: 'submitted', title: 'Submitted', desc: 'Rain drainage choke logged.', timestamp: '2026-08-25T14:00:00.000Z' },
          { status: 'assigned', title: 'Assigned', desc: 'Suction truck scheduled.', timestamp: '2026-08-26T09:00:00.000Z' },
          { status: 'resolved', title: 'Desilted', desc: 'Culvert cleared.', timestamp: '2026-08-27T17:00:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001259',
        title: 'Broken BMTC bus shelter roof leaking during monsoon',
        category: 'Public Transport',
        description: 'Corrugated roof sheets blown away during high winds. Daily commuters and senior citizens have zero shelter from scorching sun and rain.',
        city: 'Bengaluru',
        area: 'Jayanagar',
        address: '4th Block Bus Stand, 11th Main Rd, Jayanagar, Bengaluru 560011',
        lat: 12.9298,
        lng: 77.5833,
        priority: 'medium',
        priorityScore: 52,
        peopleAffected: '100–500',
        status: 'verified',
        deptId: 'dept-roads',
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-02T13:00:00.000Z',
        updatedAt: '2026-09-03T10:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        upvotes: 64,
        verifications: { stillPresent: 8, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Submitted', desc: 'Transit shelter issue logged.', timestamp: '2026-09-02T13:00:00.000Z' },
          { status: 'verified', title: 'Verified', desc: 'Forwarded to Infrastructure division.', timestamp: '2026-09-03T10:00:00.000Z' }
        ]
      },
      {
        id: 'JS-2026-001260',
        title: 'Broken and missing pedestrian tactile tiles on Smart City footpath',
        category: 'Damaged Infrastructure',
        description: 'Tactile paving for visually impaired citizens is completely broken and uprooted near Church Street entrance, creating dangerous tripping hazard.',
        city: 'Bengaluru',
        area: 'MG Road',
        address: 'Church St, Haridevpur, Shanthala Nagar, Ashok Nagar, Bengaluru 560001',
        lat: 12.9754,
        lng: 77.6067,
        priority: 'high',
        priorityScore: 71,
        peopleAffected: '100–500',
        status: 'assigned',
        deptId: 'dept-roads',
        assignedWorker: { id: 'w-1', name: 'Suresh Patil', phone: '+91 94480 98765' },
        reportedBy: { id: 'usr-1', name: 'Rajesh Kumar', email: 'citizen@jansetu.in' },
        createdAt: '2026-09-03T09:00:00.000Z',
        updatedAt: '2026-09-04T15:00:00.000Z',
        beforeImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        upvotes: 83,
        verifications: { stillPresent: 10, resolved: 0 },
        timeline: [
          { status: 'submitted', title: 'Reported', desc: 'Accessibility defect logged.', timestamp: '2026-09-03T09:00:00.000Z' },
          { status: 'assigned', title: 'Assigned', desc: 'Cobblestone contractor notified.', timestamp: '2026-09-04T15:00:00.000Z' }
        ]
      }
    ];

    // 6. Pre-seeded Notifications
    const seedNotifications = [
      {
        id: 'notif-1',
        userId: 'usr-1',
        title: 'Work Started on JS-2026-001245',
        message: 'Field Worker Suresh Patil has begun bitumen repair on your reported pothole at 12th Main Indiranagar.',
        type: 'status_update',
        complaintId: 'JS-2026-001245',
        isRead: false,
        createdAt: '2026-09-04T14:20:00.000Z'
      },
      {
        id: 'notif-2',
        userId: 'usr-1',
        title: 'Complaint Resolved: JS-2026-001246',
        message: 'Your reported garbage dump issue on 80 Feet Road Koramangala has been resolved. Please review and provide feedback.',
        type: 'resolved',
        complaintId: 'JS-2026-001246',
        isRead: true,
        createdAt: '2026-08-30T16:45:00.000Z'
      },
      {
        id: 'notif-3',
        userId: 'usr-1',
        title: 'Badge Earned: Community Helper 🏆',
        message: 'Congratulations! You reached 300+ Civic Impact Points. Community Helper badge is now displayed on your profile.',
        type: 'badge',
        isRead: true,
        createdAt: '2026-08-31T11:00:00.000Z'
      },
      {
        id: 'notif-4',
        userId: 'usr-1',
        title: 'Civic Alert: Monsoon Preparedness Drive',
        message: 'BBMP Stormwater division has begun pre-monsoon desilting in Ward 150. Report choked culverts directly on JanSetu.',
        type: 'civic_alert',
        isRead: false,
        createdAt: '2026-09-04T08:00:00.000Z'
      }
    ];

    // 7. Seed Simulated Email Logs
    const seedEmailLogs = [
      {
        id: 'eml-001',
        to: 'citizen@jansetu.in',
        recipientName: 'Rajesh Kumar',
        subject: 'JanSetu: Complaint JS-2026-001245 Successfully Registered',
        template: 'issue_submitted',
        complaintId: 'JS-2026-001245',
        status: 'simulated_delivered',
        sentAt: '2026-09-01T09:30:15.000Z',
        bodyPreview: 'Dear Rajesh Kumar, your report "Massive crater pothole near 12th Main junction" has been received. Your tracking ID is JS-2026-001245.'
      },
      {
        id: 'eml-002',
        to: 'citizen@jansetu.in',
        recipientName: 'Rajesh Kumar',
        subject: 'JanSetu: Complaint JS-2026-001245 Assigned to Field Team',
        template: 'issue_assigned',
        complaintId: 'JS-2026-001245',
        status: 'simulated_delivered',
        sentAt: '2026-09-02T10:00:10.000Z',
        bodyPreview: 'Dear Rajesh Kumar, Municipal Admin has assigned your issue to Ward Lead Suresh Patil (+91 94480 98765).'
      },
      {
        id: 'eml-003',
        to: 'citizen@jansetu.in',
        recipientName: 'Rajesh Kumar',
        subject: 'JanSetu: Resolution Completed for JS-2026-001246',
        template: 'issue_resolved',
        complaintId: 'JS-2026-001246',
        status: 'simulated_delivered',
        sentAt: '2026-08-30T16:45:22.000Z',
        bodyPreview: 'Dear Rajesh Kumar, the reported garbage black-spot on 80 Feet Road has been fully cleared. View before/after photo proof.'
      }
    ];

    // 8. Application Settings
    const defaultSettings = {
      theme: 'light',
      emailNotifications: true,
      browserNotifications: true,
      soundAlerts: false,
      autoLocation: true,
      defaultCity: 'Bengaluru',
      defaultCategory: 'Roads/Potholes',
      language: 'en'
    };

    // Save everything to localStorage
    this.set(STORAGE_KEYS.USERS, seedUsers);
    this.set(STORAGE_KEYS.DEPARTMENTS, seedDepartments);
    this.set(STORAGE_KEYS.WORKERS, seedWorkers);
    this.set(STORAGE_KEYS.CHALLENGES, seedChallenges);
    this.set(STORAGE_KEYS.COMPLAINTS, seedComplaints);
    this.set(STORAGE_KEYS.NOTIFICATIONS, seedNotifications);
    this.set(STORAGE_KEYS.EMAIL_LOGS, seedEmailLogs);
    this.set(STORAGE_KEYS.SETTINGS, defaultSettings);

    // Set default session to citizen if no current user
    if (!this.get(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, seedUsers[0]);
    }

    console.log('✅ JanSetu local database ready with 22 seeded complaints and 3 roles.');
  }
};

// Auto-run initialization on script load
Storage.initDatabase();
