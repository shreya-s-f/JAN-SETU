/**
 * JANSETU CIVIC PRIORITY & HEALTH SCORING (js/priority.js)
 * Algorithmic calculations: Civic Priority Score (0-100),
 * Area Health Index (0-100), and Citizen Impact Badges.
 */

const PriorityEngine = {
  /**
   * Calculate Civic Priority Score (0 - 100)
   * Formula: Base Category Weight + People Affected Weight + Upvote Factor + Age Penalty + Urgency Factor
   */
  calculatePriorityScore(data) {
    let score = 0;

    // 1. Category Base Weight (Max 30 pts)
    const categoryWeights = {
      'Water Supply': 28,
      'Drainage/Flooding': 27,
      'Damaged Infrastructure': 26,
      'Roads/Potholes': 24,
      'Traffic Signals': 22,
      'Streetlights': 20,
      'Garbage': 18,
      'Public Toilets': 16,
      'Stray Animals': 15,
      'Illegal Dumping': 15,
      'Parks': 12,
      'Public Transport': 14,
      'Other': 10
    };
    score += categoryWeights[data.category] || 15;

    // 2. People Affected Factor (Max 25 pts)
    const peopleWeights = {
      'Only me': 4,
      '2–10': 8,
      '10–50': 14,
      '50–100': 18,
      '100–500': 22,
      '500+': 25
    };
    score += peopleWeights[data.peopleAffected] || 10;

    // 3. Upvotes / Community Backing (Max 15 pts)
    const upvotes = data.upvotes || 0;
    const upvotePts = Math.min(15, Math.floor(upvotes / 10));
    score += upvotePts;

    // 4. Age of Complaint / Overdue Penalty (Max 15 pts)
    if (data.createdAt) {
      const daysOld = (new Date() - new Date(data.createdAt)) / (1000 * 60 * 60 * 24);
      const agePenalty = Math.min(15, Math.floor(daysOld * 3));
      score += agePenalty;
    }

    // 5. Emergency Level Setting (Max 15 pts)
    const priorityBoost = {
      'emergency': 15,
      'critical': 15,
      'high': 10,
      'medium': 5,
      'low': 0
    };
    score += priorityBoost[data.priority] || 0;

    // Clamp score between 1 and 100
    return Math.min(100, Math.max(1, Math.round(score)));
  },

  /**
   * Get Priority Level Descriptor & Color from numeric score
   */
  getPriorityMeta(score) {
    if (score >= 81) {
      return { level: 'Critical', class: 'badge-danger', color: '#ef4444', icon: 'fa-triangle-exclamation' };
    }
    if (score >= 61) {
      return { level: 'High', class: 'badge-warning', color: '#f59e0b', icon: 'fa-circle-exclamation' };
    }
    if (score >= 31) {
      return { level: 'Medium', class: 'badge-primary', color: '#3b82f6', icon: 'fa-info-circle' };
    }
    return { level: 'Low', class: 'badge-neutral', color: '#94a3b8', icon: 'fa-circle' };
  },

  /**
   * Calculate Area Health Scores across standard Indian localities
   */
  getAreaHealthScores() {
    const complaints = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    const localities = [
      { name: 'Indiranagar', city: 'Bengaluru', baseline: 84 },
      { name: 'Koramangala', city: 'Bengaluru', baseline: 81 },
      { name: 'HSR Layout', city: 'Bengaluru', baseline: 78 },
      { name: 'Whitefield', city: 'Bengaluru', baseline: 72 },
      { name: 'Bandra West', city: 'Mumbai', baseline: 85 },
      { name: 'Connaught Place', city: 'Delhi', baseline: 76 },
      { name: 'Gachibowli', city: 'Hyderabad', baseline: 83 },
      { name: 'Anna Nagar', city: 'Chennai', baseline: 86 }
    ];

    return localities.map(area => {
      // Find area complaints
      const areaIssues = complaints.filter(
        c => c.area && c.area.toLowerCase().includes(area.name.toLowerCase())
      );
      const total = areaIssues.length;
      const resolved = areaIssues.filter(c => c.status === 'resolved').length;
      const critical = areaIssues.filter(c => c.priorityScore >= 80 && c.status !== 'resolved').length;

      // Deduction for unresolved critical defects
      const penalty = critical * 4 + (total - resolved) * 1.5;
      const healthScore = Math.max(40, Math.min(98, Math.round(area.baseline - penalty)));

      return {
        area: area.name,
        city: area.city,
        score: healthScore,
        roads: Math.min(95, Math.max(50, healthScore + (Math.floor(Math.random() * 8) - 4))),
        cleanliness: Math.min(95, Math.max(45, healthScore - (critical > 0 ? 8 : -3))),
        streetlights: Math.min(98, Math.max(60, healthScore + 6)),
        drainage: Math.min(90, Math.max(40, healthScore - 5)),
        publicSpaces: Math.min(95, Math.max(55, healthScore + 3)),
        monthlyImprovement: healthScore > 75 ? '+8%' : '+3%'
      };
    });
  },

  /**
   * Citizen Badges & Progression Evaluation
   */
  evaluateCitizenBadges(user, complaints) {
    const userReports = complaints.filter(c => c.reportedBy && c.reportedBy.id === user.id);
    const resolvedCount = userReports.filter(c => c.status === 'resolved').length;
    const votes = Storage.get(STORAGE_KEYS.VOTES, {});
    const userUpvoteCount = Object.keys(votes).length;

    const badges = [
      {
        id: 'b-first',
        name: 'First Reporter',
        icon: '🌱',
        desc: 'Logged your very first civic defect',
        unlocked: userReports.length >= 1
      },
      {
        id: 'b-observer',
        name: 'Civic Observer',
        icon: '👁️',
        desc: 'Actively upvoted & verified 5+ community issues',
        unlocked: userUpvoteCount >= 2 || userReports.length >= 3
      },
      {
        id: 'b-helper',
        name: 'Community Helper',
        icon: '🤝',
        desc: 'Achieved 200+ verified Civic Impact Points',
        unlocked: (user.impactScore || 0) >= 200
      },
      {
        id: 'b-champion',
        name: 'Civic Champion',
        icon: '🏆',
        desc: 'Helped resolve 3+ community defects in your ward',
        unlocked: resolvedCount >= 2 || (user.impactScore || 0) >= 500
      },
      {
        id: 'b-changemaker',
        name: 'Change Maker',
        icon: '⭐',
        desc: 'Top 1% civic contributors with 1,000+ points',
        unlocked: (user.impactScore || 0) >= 1000
      }
    ];

    return badges;
  }
};
