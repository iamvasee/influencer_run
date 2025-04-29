// Camera effects for cinematic moments
const ZOOM_DURATION = 2000; // 2 seconds for the zoom effect
let zoomStartTime = 0;
let isZooming = false;
let currentZoom = 2.5; // Start at 2.5x zoom

// Initialize camera state
function initCamera() {
    zoomStartTime = Date.now();
    isZooming = true;
    currentZoom = 2.5;
}

// Update camera zoom
function updateCamera(ctx) {
    if (!isZooming) return;

    const timePassed = Date.now() - zoomStartTime;
    if (timePassed >= ZOOM_DURATION) {
        isZooming = false;
        currentZoom = 1;
        return;
    }

    // Calculate zoom using easeOutCubic for smooth animation
    const progress = timePassed / ZOOM_DURATION;
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentZoom = 2.5 - (1.5 * easeOut); // Zoom from 2.5x to 1x

    // Apply camera transform
    ctx.save();
    
    // Calculate center point (player position)
    const centerX = window.player.x + window.player.width / 2;
    const centerY = window.player.y + window.player.height / 2;
    
    // Transform around the player
    ctx.translate(centerX, centerY);
    ctx.scale(currentZoom, currentZoom);
    ctx.translate(-centerX, -centerY);
}

// Reset camera transform
function resetCamera(ctx) {
    if (isZooming) {
        ctx.restore();
    }
}

// Expose to window
window.camera = {
    init: initCamera,
    update: updateCamera,
    reset: resetCamera,
    isZooming: () => isZooming
}; 