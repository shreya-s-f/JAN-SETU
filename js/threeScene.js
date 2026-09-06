/**
 * JANSETU 3D DIGITAL TWIN CITY ENGINE (js/threeScene.js)
 * Interactive Three.js 3D Metropolis & Civic Hologram Scanner
 * 
 * Renders a procedural 3D Indian Smart City grid with:
 * - 3D Skyscrapers with glowing cyber-blue wireframes
 * - Illuminated highway interchanges & traffic light streams
 * - Floating pulsing 3D civic hazard beacons (Critical, High, Resolved)
 * - Holographic data particle clouds
 * - Interactive mouse parallax, touch drag & orbit rotation
 */

const ThreeCity = {
  scene: null,
  camera: null,
  renderer: null,
  buildingsGroup: null,
  beaconsGroup: null,
  particleSystem: null,
  animationId: null,
  mouseX: 0,
  mouseY: 0,
  targetRotationX: 0.35,
  targetRotationY: 0.75,
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },

  /**
   * Initialize 3D City Scene in target DOM container
   */
  init(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof THREE === 'undefined') {
      console.warn('Three.js not loaded or container not found:', containerId);
      return null;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 450;

    // 1. Scene & Fog for depth
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x090d16, 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    this.camera.position.set(0, 180, 320);
    this.camera.lookAt(0, 20, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 4. Lighting (Volumetric tech-blue ambience)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x0066ff, 2.5);
    dirLight.position.set(150, 250, 100);
    this.scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 3, 400);
    cyanLight.position.set(-100, 80, -50);
    this.scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.5, 300);
    goldLight.position.set(80, 60, 80);
    this.scene.add(goldLight);

    // 5. Build City Grid & Roads
    this.createRoadGrid();
    this.createSkyscrapers();
    this.createHolographicBeacons();
    this.createDataParticles();

    // 6. Interactive Event Handlers
    this.attachEventListeners(container);

    // 7. Render Loop
    this.animate();

    console.log('🏙️ JanSetu 3D Digital Twin City initialized on container:', containerId);
    return this;
  },

  /**
   * Road Ground Plane & Glowing Grid Lines
   */
  createRoadGrid() {
    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070a12,
      roughness: 0.85,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    // Grid wireframe
    const gridHelper = new THREE.GridHelper(800, 50, 0x0066ff, 0x1e293b);
    gridHelper.position.y = 0.5;
    this.scene.add(gridHelper);

    // Glowing main arterial highway lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2, transparent: true, opacity: 0.8 });
    const roadsGeo = new THREE.BufferGeometry();
    const points = [];
    for (let i = -300; i <= 300; i += 100) {
      points.push(new THREE.Vector3(i, 1, -400));
      points.push(new THREE.Vector3(i, 1, 400));
      points.push(new THREE.Vector3(-400, 1, i));
      points.push(new THREE.Vector3(400, 1, i));
    }
    roadsGeo.setFromPoints(points);
    const roads = new THREE.LineSegments(roadsGeo, lineMat);
    this.scene.add(roads);
  },

  /**
   * Procedural Skyscrapers with Cyber Edge Highlights
   */
  createSkyscrapers() {
    this.buildingsGroup = new THREE.Group();

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.92
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.6
    });

    const gridSize = 14;
    const spacing = 35;

    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        // Leave avenues for major roads
        if (x % 3 === 0 || z % 3 === 0) continue;

        const height = 20 + Math.random() * 110 + (Math.abs(x) < 2 && Math.abs(z) < 2 ? 60 : 0);
        const width = 18 + Math.random() * 8;
        const depth = 18 + Math.random() * 8;

        const geo = new THREE.BoxGeometry(width, height, depth);
        const building = new THREE.Mesh(geo, buildingMat);
        building.position.set(x * spacing + (Math.random() - 0.5) * 4, height / 2, z * spacing + (Math.random() - 0.5) * 4);

        // Add luminous edges
        const edgesGeo = new THREE.EdgesGeometry(geo);
        const wireframe = new THREE.LineSegments(edgesGeo, edgeMat);
        building.add(wireframe);

        this.buildingsGroup.add(building);
      }
    }

    this.scene.add(this.buildingsGroup);
  },

  /**
   * Floating 3D Civic Hazard Beacons (Critical, High, Resolved)
   */
  createHolographicBeacons() {
    this.beaconsGroup = new THREE.Group();

    const beaconData = [
      { x: 40, z: 35, color: 0xef4444, label: 'JS-2026-001245: Critical Pothole', priority: 'Critical (92/100)' },
      { x: -75, z: 65, color: 0xf59e0b, label: 'JS-2026-001247: Broken Streetlights', priority: 'High (74/100)' },
      { x: 85, z: -80, color: 0x10b981, label: 'JS-2026-001246: Resolved Waste Dump', priority: 'Resolved ✓' },
      { x: -35, z: -60, color: 0xef4444, label: 'JS-2026-001248: Water Pipe Burst', priority: 'Critical (96/100)' },
      { x: 120, z: 10, color: 0x10b981, label: 'JS-2026-001250: Restored Signal', priority: 'Resolved ✓' }
    ];

    beaconData.forEach((b, index) => {
      const beaconSubGroup = new THREE.Group();
      beaconSubGroup.position.set(b.x, 85, b.z);

      // Core pulsating sphere
      const sphereGeo = new THREE.SphereGeometry(4, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: b.color, wireframe: true });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      beaconSubGroup.add(sphere);

      // Vertical holographic beam pointing to ground
      const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 85, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.35 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = -42.5;
      beaconSubGroup.add(beam);

      // Ground beacon ring
      const ringGeo = new THREE.RingGeometry(3, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: b.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -84;
      beaconSubGroup.add(ring);

      beaconSubGroup.userData = {
        label: b.label,
        priority: b.priority,
        initialY: 85,
        offset: index * 1.5
      };

      this.beaconsGroup.add(beaconSubGroup);
    });

    this.scene.add(this.beaconsGroup);
  },

  /**
   * Floating Data Particles
   */
  createDataParticles() {
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 600;
      positions[i + 1] = Math.random() * 200 + 10;
      positions[i + 2] = (Math.random() - 0.5) * 600;

      // Cyan to blue palette
      colors[i] = 0.0;
      colors[i + 1] = 0.4 + Math.random() * 0.5;
      colors[i + 2] = 0.9 + Math.random() * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  },

  /**
   * Event Listeners for Parallax & Orbit Drag
   */
  attachEventListeners(container) {
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX = Math.max(0.1, Math.min(0.8, this.targetRotationX + deltaY * 0.005));
      } else {
        this.mouseX = x * 0.3;
        this.mouseY = y * 0.15;
      }
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => (this.isDragging = false));
    container.addEventListener('mousemove', onMouseMove);

    // Touch support for mobile devices
    container.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        onMouseMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    }, { passive: true });

    // Window resize
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 450;
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
    });
  },

  /**
   * Continuous Animation Loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.0015;

    // Smooth camera orbit
    const radius = 340;
    const currentRotY = this.targetRotationY + this.mouseX;
    const currentRotX = this.targetRotationX + this.mouseY;

    this.camera.position.x = radius * Math.sin(currentRotY) * Math.cos(currentRotX);
    this.camera.position.z = radius * Math.cos(currentRotY) * Math.cos(currentRotX);
    this.camera.position.y = 60 + radius * Math.sin(currentRotX);
    this.camera.lookAt(0, 30, 0);

    // Pulsate and oscillate 3D civic beacons
    if (this.beaconsGroup) {
      this.beaconsGroup.children.forEach(beacon => {
        const d = beacon.userData;
        beacon.position.y = d.initialY + Math.sin(time * 3 + d.offset) * 4;
        beacon.rotation.y += 0.03;
      });
    }

    // Drift data particles slowly
    if (this.particleSystem) {
      this.particleSystem.rotation.y = time * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  },

  /**
   * Cleanup method
   */
  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
};
