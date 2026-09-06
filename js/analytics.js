/**
 * JANSETU ANALYTICS ENGINE (js/analytics.js)
 * Chart.js configurations: Category Doughnut, Department Performance Bars,
 * Monthly Trend Lines, and Resolution KPIs.
 */

const Analytics = {
  charts: {},

  /**
   * Initialize Admin Analytics Visualizations
   */
  initAdminCharts() {
    const complaints = Storage.get(STORAGE_KEYS.COMPLAINTS, []);
    this.renderCategoryChart('chart-categories', complaints);
    this.renderDepartmentChart('chart-departments');
    this.renderMonthlyTrendsChart('chart-monthly-trends');
  },

  /**
   * 1. Category Distribution Doughnut Chart
   */
  renderCategoryChart(canvasId, complaints) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const counts = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    const colors = [
      '#0066ff', '#38bdf8', '#a855f7', '#10b981',
      '#f59e0b', '#ef4444', '#ec4899', '#64748b'
    ];

    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    this.charts[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        },
        cutout: '70%'
      }
    });
  },

  /**
   * 2. Department Resolution Bar Chart
   */
  renderDepartmentChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const depts = Storage.get(STORAGE_KEYS.DEPARTMENTS, []);
    const labels = depts.map(d => d.name.split('&')[0]);
    const resolvedData = depts.map(d => d.resolvedIssues);
    const activeData = depts.map(d => d.activeIssues);

    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    this.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Resolved',
            data: resolvedData,
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Active/Pending',
            data: activeData,
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { display: false }
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
          }
        }
      }
    });
  },

  /**
   * 3. Monthly Trends Line Chart
   */
  renderMonthlyTrendsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep 2026'];
    const reported = [42, 65, 88, 120, 165, 198];
    const resolved = [35, 52, 74, 102, 148, 172];

    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    this.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Issues Reported',
            data: reported,
            borderColor: '#0066ff',
            backgroundColor: 'rgba(0, 102, 255, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Issues Resolved',
            data: resolved,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
          }
        }
      }
    });
  }
};
