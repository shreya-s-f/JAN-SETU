/**
 * JANSETU 3D CARD TILT & SPECULAR GLARE ENGINE (js/tilt3d.js)
 * Physics-based 3D perspective transforms & specular reflections
 */

const Tilt3D = {
  init() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.card-3d, .card-interactive, .kpi-card, .badge-tile, .workflow-card');
    cards.forEach(card => this.applyTilt(card));
  },

  applyTilt(el) {
    el.style.transformStyle = 'preserve-3d';
    el.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';

    // Create dynamic specular shine overlay
    let glare = el.querySelector('.glare-3d');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'glare-3d';
      glare.style.position = 'absolute';
      glare.style.inset = '0';
      glare.style.pointerEvents = 'none';
      glare.style.borderRadius = 'inherit';
      glare.style.opacity = '0';
      glare.style.transition = 'opacity 0.2s ease-out';
      glare.style.zIndex = '5';
      el.style.position = 'relative';
      el.appendChild(glare);
    }

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
      const rotateY = ((x - centerX) / centerX) * 9;

      el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      el.style.boxShadow = `0 16px 32px rgba(0, 102, 255, 0.18), 0 0 20px rgba(0, 0, 0, 0.4)`;

      // Update glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, transparent 65%)`;
      glare.style.opacity = '1';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.boxShadow = '';
      glare.style.opacity = '0';
    });
  }
};

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => Tilt3D.init());
