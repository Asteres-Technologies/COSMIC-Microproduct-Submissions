/**
 * Hero Number Glass Cutout Effect
 * Creates a canvas-based cutout effect for the "01." hero number
 * that reveals the satellite image through the glass layer
 */

(function() {
  'use strict';

  function initHeroCutout() {
    // Get the canvas element
    const canvas = document.getElementById('hero-cutout-canvas');
    if (!canvas) return;

    // Show and style the canvas
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '2';
    canvas.style.pointerEvents = 'none';
    canvas.style.backdropFilter = 'blur(15px)';
    canvas.style.webkitBackdropFilter = 'blur(15px)';
    canvas.style.overflow = 'hidden';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function drawGlassEffect() {
      // Set canvas size to viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate position (40% from left, vertically centered)
      const x = canvas.width * 0.4;
      const y = canvas.height * 0.5;

      // Pass 1: Draw glass layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pass 2: Cut out the text shape
      ctx.globalCompositeOperation = 'destination-out';
      ctx.font = '800 160px Inter';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('01.', x, y);

      // Pass 3: Fill the cutout with light overlay
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillText('01.', x, y);

      // Pass 4: Draw styled text on top
      ctx.globalCompositeOperation = 'source-over';
      
      // Reset shadow for stroke
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      
      // Gradient stroke (top-left to bottom-right) - more visible
      const gradient = ctx.createLinearGradient(x - 300, y - 150, x + 100, y + 150);
      gradient.addColorStop(0, 'rgba(231, 231, 231, 1)');
      gradient.addColorStop(1, 'rgba(225, 225, 225, 0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.strokeText('01.', x, y);
      
      // Create inner shadow effect
      // Step 1: Draw text as mask
      ctx.fillStyle = 'rgba(105, 106, 111, 0.14)';
      ctx.fillText('01.', x, y);
      
      // Step 2: Set composite to only draw inside existing pixels
      ctx.globalCompositeOperation = 'source-atop';
      
      // Step 3: Draw shadow with offset (this creates the inner shadow from top)
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
      ctx.fillText('01.', x, y - 4);
      
      // Reset
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
    }

    // Initial draw
    drawGlassEffect();

    // Redraw on resize
    window.addEventListener('resize', drawGlassEffect);

    // Hide the original hero number element
    const heroNumber = document.querySelector('.hero-number');
    if (heroNumber) {
      heroNumber.style.opacity = '0';
    }

    // Hide the glass-overlay div since canvas replaces it
    const glassOverlay = document.querySelector('.glass-overlay');
    if (glassOverlay) {
      glassOverlay.style.display = 'none';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCutout);
  } else {
    // Add a small delay to ensure React has hydrated
    setTimeout(initHeroCutout, 100);
  }
})();
