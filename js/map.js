/**
 * JANSETU MAP ENGINE (js/map.js)
 * Leaflet.js & OpenStreetMap Integration with Custom Markers,
 * Popups, Category Filters, and Civic Heatmap Visualization.
 */

const MapEngine = {
  mapInstance: null,
  markersLayer: null,
  heatLayer: null,
  activeComplaints: [],

  /**
   * Initialize Leaflet Map in target container element
   */
  init(containerId, options = {}) {
    const defaultCenter = options.center || [12.9716, 77.6412]; // Bengaluru center
    const defaultZoom = options.zoom || 13;

    const mapElement = document.getElementById(containerId);
    if (!mapElement) return null;

    if (this.mapInstance) {
      this.mapInstance.remove();
    }

    this.mapInstance = L.map(containerId, {
      zoomControl: true,
      scrollWheelZoom: options.scrollWheelZoom !== undefined ? options.scrollWheelZoom : true
    }).setView(defaultCenter, defaultZoom);

    // Modern OpenStreetMap CartoDB dark/light tile layer
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.mapInstance);

    this.markersLayer = L.layerGroup().addTo(this.mapInstance);
    return this.mapInstance;
  },

  /**
   * Render color-coded issue markers onto the map
   */
  renderMarkers(complaints) {
    if (!this.mapInstance || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    this.activeComplaints = complaints;

    const bounds = [];

    complaints.forEach(item => {
      if (!item.lat || !item.lng) return;

      // Determine marker color class based on status & priority
      let colorClass = 'marker-medium';
      let iconName = 'fa-circle-exclamation';

      if (item.status === 'resolved') {
        colorClass = 'marker-resolved';
        iconName = 'fa-circle-check';
      } else if (item.priorityScore >= 80 || item.priority === 'critical') {
        colorClass = 'marker-critical';
        iconName = 'fa-triangle-exclamation';
      } else if (item.priorityScore >= 60 || item.priority === 'high') {
        colorClass = 'marker-high';
        iconName = 'fa-circle-exclamation';
      }

      // Custom HTML Leaflet DivIcon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-map-marker ${colorClass}"><i class="fa-solid ${iconName}"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      // Rich popup content
      const popupHtml = `
        <div class="map-popup-card">
          <img src="${item.beforeImage}" alt="${Utils.escapeHtml(item.title)}">
          <h4>${Utils.escapeHtml(item.title)}</h4>
          <div class="map-popup-meta">
            <span><i class="fa-solid fa-tag"></i> ${item.category}</span><br>
            <span><i class="fa-solid fa-location-dot"></i> ${item.area || item.city}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
            <span class="status-pill status-${item.status}">${item.status.replace('_', ' ').toUpperCase()}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">
              <i class="fa-solid fa-arrow-up"></i> ${item.upvotes || 0}
            </span>
          </div>
          <a href="complaint-details.html?id=${item.id}" class="btn btn-primary btn-sm btn-block mt-2">
            View Details <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.markersLayer.addLayer(marker);
      bounds.push([item.lat, item.lng]);
    });

    if (bounds.length > 0) {
      this.mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  },

  /**
   * Toggle Civic Problem Heatmap Visualization
   * Generates intensity heat zones across dense problem areas
   */
  renderHeatmap(complaints, categoryFilter = 'all') {
    if (!this.mapInstance) return;

    if (this.heatLayer) {
      this.mapInstance.removeLayer(this.heatLayer);
      this.heatLayer = null;
    }

    let filtered = complaints;
    if (categoryFilter !== 'all') {
      filtered = complaints.filter(c => c.category === categoryFilter);
    }

    // Create a LayerGroup of styled radial SVG circles simulating heat intensities
    this.heatLayer = L.layerGroup();

    filtered.forEach(c => {
      if (!c.lat || !c.lng || c.status === 'resolved') return;

      const radius = 250 + (c.priorityScore || 50) * 4;
      const color = c.priorityScore >= 80 ? '#ef4444' : c.priorityScore >= 60 ? '#f59e0b' : '#0066ff';

      const circle = L.circle([c.lat, c.lng], {
        radius: radius,
        fillColor: color,
        fillOpacity: 0.28,
        color: color,
        weight: 1,
        opacity: 0.5
      });

      circle.bindTooltip(`<strong>${c.category} Density</strong><br>Severity Score: ${c.priorityScore}/100`, {
        sticky: true
      });

      this.heatLayer.addLayer(circle);
    });

    this.heatLayer.addTo(this.mapInstance);
  }
};
