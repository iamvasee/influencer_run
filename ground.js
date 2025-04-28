// Ground decorations and patterns
const GROUND_COLORS = {
    road: {
        top: '#404040',     // Lighter asphalt
        middle: '#2c2c2c',  // Mid asphalt
        bottom: '#1a1a1a',  // Darker asphalt
        lines: {
            lane: '#ffffff',     // Lane lines
            edge: '#ffffff'      // Edge lines
        }
    },
    dirt: {
        top: '#4a3020',     // Rich soil
        middle: '#3d2617',  // Mid soil
        bottom: '#2c1810',  // Deep soil
        particles: ['#5c4030', '#6b5040', '#7c6050', '#8d7060'] // Enhanced dirt particles
    },
    effects: {
        roadGlow: 'rgba(255, 255, 255, 0.15)',
        dirtDust: 'rgba(92, 64, 48, 0.3)',
        highlight: 'rgba(255, 255, 255, 0.1)'
    }
};

// Pattern offsets for movement (only for dirt)
let dirtPatternOffsetX = 0;

// Create pattern canvas for road texture
const roadPatternCanvas = document.createElement('canvas');
const roadPatternCtx = roadPatternCanvas.getContext('2d');
roadPatternCanvas.width = 200;
roadPatternCanvas.height = 200;

const dirtPatternCanvas = document.createElement('canvas');
const dirtPatternCtx = dirtPatternCanvas.getContext('2d');
dirtPatternCanvas.width = 200;
dirtPatternCanvas.height = 200;

// Static road pattern
function createRoadPattern() {
    roadPatternCtx.clearRect(0, 0, roadPatternCanvas.width, roadPatternCanvas.height);
    
    // Base texture
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * roadPatternCanvas.width;
        const y = Math.random() * roadPatternCanvas.height;
        const size = Math.random() * 3 + 1;
        
        roadPatternCtx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
        roadPatternCtx.beginPath();
        roadPatternCtx.arc(x, y, size, 0, Math.PI * 2);
        roadPatternCtx.fill();
    }
    
    // Add subtle cracks
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * roadPatternCanvas.width;
        const y = Math.random() * roadPatternCanvas.height;
        const length = Math.random() * 15 + 5;
        const angle = Math.random() * Math.PI;
        
        roadPatternCtx.save();
        roadPatternCtx.translate(x, y);
        roadPatternCtx.rotate(angle);
        roadPatternCtx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
        roadPatternCtx.lineWidth = Math.random() + 0.5;
        roadPatternCtx.beginPath();
        roadPatternCtx.moveTo(-length/2, 0);
        roadPatternCtx.lineTo(length/2, 0);
        roadPatternCtx.stroke();
        roadPatternCtx.restore();
    }
}

// Enhanced dirt pattern
function createDirtPattern() {
    dirtPatternCtx.clearRect(0, 0, dirtPatternCanvas.width, dirtPatternCanvas.height);
    
    // Multiple layers of dirt particles
    for (let layer = 0; layer < 3; layer++) {
        const numParticles = 150 - (layer * 30);
        const baseSize = 2 + layer * 2;
        
        for (let i = 0; i < numParticles; i++) {
            const x = Math.random() * dirtPatternCanvas.width;
            const y = Math.random() * dirtPatternCanvas.height;
            const size = Math.random() * baseSize + 1;
            
            dirtPatternCtx.fillStyle = GROUND_COLORS.dirt.particles[Math.floor(Math.random() * GROUND_COLORS.dirt.particles.length)];
            dirtPatternCtx.globalAlpha = 0.6 - (layer * 0.15);
            dirtPatternCtx.beginPath();
            dirtPatternCtx.arc(x, y, size, 0, Math.PI * 2);
            dirtPatternCtx.fill();
        }
    }
    dirtPatternCtx.globalAlpha = 1;
}

// Static lane markings
let laneLines = [];

function initLaneLines() {
    const roadHeight = 25; // Half the previous size
    laneLines = [
        // Center line
        {
            y: window.GROUND_LEVEL + window.player.height + roadHeight/2,
            color: GROUND_COLORS.road.lines.lane,
            width: 3
        },
        // Edge lines
        {
            y: window.GROUND_LEVEL + window.player.height + 2,
            color: GROUND_COLORS.road.lines.edge,
            width: 2
        },
        {
            y: window.GROUND_LEVEL + window.player.height + roadHeight - 2,
            color: GROUND_COLORS.road.lines.edge,
            width: 2
        }
    ];
}

// Enhanced dust particles
let dustParticles = [];

function createDustParticle(forceX = null) {
    return {
        x: forceX || Math.random() * window.canvas.width,
        y: window.GROUND_LEVEL + window.player.height + 30 + Math.random() * 140,
        size: Math.random() * 4 + 1,
        speed: window.gameSpeed * (Math.random() * 0.5 + 0.3),
        alpha: Math.random() * 0.4 + 0.1,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        rotation: Math.random() * Math.PI * 2,
        color: GROUND_COLORS.dirt.particles[Math.floor(Math.random() * GROUND_COLORS.dirt.particles.length)]
    };
}

function initDustParticles() {
    dustParticles = [];
    const numParticles = 40;
    
    for (let i = 0; i < numParticles; i++) {
        dustParticles.push(createDustParticle());
    }
}

function updateDustParticles() {
    dustParticles.forEach((particle, index) => {
        particle.x -= particle.speed;
        particle.rotation += particle.rotationSpeed;
        
        if (particle.x < -10) {
            dustParticles[index] = createDustParticle(window.canvas.width + 10);
        }
    });
}

function drawGround() {
    const ctx = window.ctx;
    const groundLevel = window.GROUND_LEVEL + window.player.height;
    const roadHeight = 25; // Half the previous size
    
    // Update dirt pattern offset
    dirtPatternOffsetX = (dirtPatternOffsetX + window.gameSpeed * 0.5) % dirtPatternCanvas.width;
    
    // 1. Static road layer
    const roadGradient = ctx.createLinearGradient(0, groundLevel, 0, groundLevel + roadHeight);
    roadGradient.addColorStop(0, GROUND_COLORS.road.top);
    roadGradient.addColorStop(0.5, GROUND_COLORS.road.middle);
    roadGradient.addColorStop(1, GROUND_COLORS.road.bottom);
    ctx.fillStyle = roadGradient;
    ctx.fillRect(0, groundLevel, window.canvas.width, roadHeight);
    
    // Apply static road texture
    const roadPattern = ctx.createPattern(roadPatternCanvas, 'repeat');
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = roadPattern;
    ctx.fillRect(0, groundLevel, window.canvas.width, roadHeight);
    ctx.globalAlpha = 1;
    
    // 2. Moving dirt layer
    const dirtGradient = ctx.createLinearGradient(
        0, groundLevel + roadHeight,
        0, window.canvas.height
    );
    dirtGradient.addColorStop(0, GROUND_COLORS.dirt.top);
    dirtGradient.addColorStop(0.5, GROUND_COLORS.dirt.middle);
    dirtGradient.addColorStop(1, GROUND_COLORS.dirt.bottom);
    ctx.fillStyle = dirtGradient;
    ctx.fillRect(
        0,
        groundLevel + roadHeight,
        window.canvas.width,
        window.canvas.height - (groundLevel + roadHeight)
    );
    
    // Apply moving dirt texture
    ctx.save();
    ctx.translate(-dirtPatternOffsetX, 0);
    const dirtPattern = ctx.createPattern(dirtPatternCanvas, 'repeat');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = dirtPattern;
    ctx.fillRect(
        dirtPatternOffsetX,
        groundLevel + roadHeight,
        window.canvas.width + dirtPatternCanvas.width,
        window.canvas.height - (groundLevel + roadHeight)
    );
    ctx.restore();
    
    // 3. Static lane markings
    laneLines.forEach(line => {
        ctx.save();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(window.canvas.width, line.y);
        ctx.stroke();
        
        // Add subtle glow effect
        ctx.strokeStyle = GROUND_COLORS.effects.roadGlow;
        ctx.lineWidth = line.width + 1;
        ctx.stroke();
        ctx.restore();
    });
    
    // 4. Dust particles in dirt layer
    dustParticles.forEach(particle => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle glow effect
        ctx.fillStyle = GROUND_COLORS.effects.dirtDust;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    
    // 5. Layer separation line
    ctx.save();
    const separationGradient = ctx.createLinearGradient(
        0, groundLevel + roadHeight - 2,
        0, groundLevel + roadHeight + 2
    );
    separationGradient.addColorStop(0, GROUND_COLORS.road.bottom);
    separationGradient.addColorStop(0.5, GROUND_COLORS.effects.highlight);
    separationGradient.addColorStop(1, GROUND_COLORS.dirt.top);
    
    ctx.strokeStyle = separationGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundLevel + roadHeight);
    ctx.lineTo(window.canvas.width, groundLevel + roadHeight);
    ctx.stroke();
    ctx.restore();
}

// Helper function to convert hex to rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '0, 0, 0';
}

// Initialize everything
function initGround() {
    createRoadPattern();
    createDirtPattern();
    initLaneLines();
    initDustParticles();
}

// Update ground elements
function updateGround() {
    updateDustParticles();
}

// Make functions globally available
window.initGround = initGround;
window.updateGround = updateGround;
window.drawGround = drawGround;

// Initial setup
initGround(); 