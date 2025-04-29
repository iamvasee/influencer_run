// Obstacle logic extracted from game.js

// Obstacle variables
let obstacles = [];
const obstacleWidth = 40;
const MIN_OBSTACLE_HEIGHT = 80;
const MAX_OBSTACLE_HEIGHT = 140;
const MIN_OBSTACLE_GAP = 400;
const MAX_OBSTACLE_GAP = 600;
// FLASH_DURATION is defined in game.js

// Define obstacle types
const OBSTACLE_TYPES = {
    PERVERT: {
        name: 'Pervert',
        emoji: '🧥',
        gameOverMessage: 'The pervert touched himself live. The stream got too real..',
        colors: {
            primary: '#4a4a4a',    // Dark gray
            secondary: '#2d2d2d',  // Darker gray
            base: '#1a1a1a'       // Almost black
        }
    },
    STALKER: {
        name: 'Stalker',
        emoji: '🧢',
        gameOverMessage: 'The stalker dragged you into an alley. The stream cut to black.',
        colors: {
            primary: '#4a0404',    // Dark red
            secondary: '#800000',  // Maroon
            base: '#2b0000'       // Darker red
        }
    },
    PAPARAZZI: {
        name: 'Paparazzi',
        emoji: '📸',
        gameOverMessage: 'The paparazzi caught the jiggle frame-by-frame. Twitter is on fire.',
        colors: {
            primary: '#ffd700',    // Gold
            secondary: '#daa520',  // Goldenrod
            base: '#b8860b'       // Dark goldenrod
        },
        // Add flash properties for Paparazzi
        flashActive: false,
        flashOpacity: 0,
        flashStartTime: 0,
        flashTriggered: false
    },
    RIVAL: {
        name: 'Jealous Rival',
        emoji: '💋',
        gameOverMessage: 'The jealous rival pulled your panties mid-run. Fans are calling it a meltdown.',
        colors: {
            primary: '#ff69b4',    // Hot pink
            secondary: '#ff1493',  // Deep pink
            base: '#c71585'       // Medium violet red
        }
    },
    TROLL: {
        name: 'Internet Troll',
        emoji: '🧌',
        gameOverMessage: 'The troll flooded your stream with 🍆s — algorithm flagged it instantly..',
        colors: {
            primary: '#6b8e23',    // Olive drab
            secondary: '#556b2f',  // Dark olive green
            base: '#3b4a1f'       // Darker olive
        }
    },
    FANS: {
        name: 'Thirsty Fans',
        emoji: '😍',
        gameOverMessage: 'The thirsty fans pulled you into a group selfie — hands went places..',
        colors: {
            primary: '#ff6b6b',    // Coral pink
            secondary: '#ff4040',  // Coral red
            base: '#cc3333'       // Darker coral
        }
    },
    MODS: {
        name: 'Platform Mods',
        emoji: '🛑',
        gameOverMessage: 'The platform mods saw too much underboob. That was enough..',
        colors: {
            primary: '#4169e1',    // Royal blue
            secondary: '#0000cd',  // Medium blue
            base: '#00008b'       // Dark blue
        }
    },
    DRONE: {
        name: 'Voyeur Drone',
        emoji: '🚁',
        gameOverMessage: 'The voyeur drone caught the perfect bounce. Stream went NSFW.',
        colors: {
            primary: '#808080',    // Gray
            secondary: '#696969',  // Dim gray
            base: '#404040'       // Dark gray
        }
    }
};

// Utility function
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random obstacle type
function getRandomObstacleType() {
    const types = Object.values(OBSTACLE_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

// Obstacle creation
function createObstacle() {
    const height = getRandomNumber(MIN_OBSTACLE_HEIGHT, MAX_OBSTACLE_HEIGHT);
    const type = getRandomObstacleType();
    
    // Create obstacle with type properties
    const obstacle = {
        x: window.canvas.width,
        y: window.GROUND_LEVEL + window.player.height - height,
        width: obstacleWidth,
        height: height,
        gap: getRandomNumber(MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP),
        type: type
    };
    
    // Initialize flash properties for Paparazzi
    if (type.name === 'Paparazzi') {
        obstacle.flashActive = false;
        obstacle.flashOpacity = 0;
        obstacle.flashStartTime = 0;
        obstacle.flashTriggered = false;
    }
    
    return obstacle;
}

// Draw obstacles
function drawObstacles() {
    const ctx = window.ctx;
    window.obstacles.forEach(obstacle => {
        const colors = obstacle.type.colors;
        
        // Pillar body gradient
        const grad = ctx.createLinearGradient(
            obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height
        );
        grad.addColorStop(0, colors.primary);
        grad.addColorStop(0.7, colors.secondary);
        grad.addColorStop(1, colors.base);
        ctx.fillStyle = grad;
        
        // Draw pillar body (rectangle, leaving space for rounded top)
        const radius = Math.min(obstacle.width / 2, 18);
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + radius);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + radius);
        
        // Rounded top
        ctx.arc(
            obstacle.x + obstacle.width / 2,
            obstacle.y + radius,
            radius,
            0,
            Math.PI,
            true
        );
        ctx.closePath();
        ctx.fill();
        
        // Draw a slightly darker base
        ctx.fillStyle = colors.base;
        ctx.fillRect(
            obstacle.x,
            obstacle.y + obstacle.height - 10,
            obstacle.width,
            10
        );
        
        // Draw the emoji on top of the obstacle
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            obstacle.type.emoji,
            obstacle.x + obstacle.width / 2,
            obstacle.y + radius
        );
        ctx.restore();
        
        // Optional: add a highlight for a more 3D look
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + radius,
            radius * 0.7,
            radius * 0.35,
            0,
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.restore();

        // Draw flash effect for paparazzi when triggered
        if (obstacle.type.name === 'Paparazzi' && obstacle.flashActive) {
            ctx.save();
            const flashGradient = ctx.createLinearGradient(
                obstacle.x + obstacle.width / 2,
                obstacle.y,
                obstacle.x + obstacle.width / 2,
                obstacle.y - 150
            );
            flashGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            flashGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = flashGradient;
            
            // Create a cone of light
            ctx.beginPath();
            ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
            ctx.lineTo(obstacle.x - 30, obstacle.y - 150);
            ctx.lineTo(obstacle.x + obstacle.width + 30, obstacle.y - 150);
            ctx.closePath();
            
            ctx.globalAlpha = obstacle.flashOpacity || 1;
            ctx.fill();
            
            // Add a bright center
            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.restore();
        }
    });
}

// Function to trigger camera flash for Paparazzi
function triggerPaparazziFlash(obstacle) {
    // Set flash properties
    obstacle.flashActive = true;
    obstacle.flashOpacity = 1;
    obstacle.flashStartTime = Date.now();
    
    // Play camera sound
    if (typeof window.triggerCameraFlash === 'function') {
        window.triggerCameraFlash(obstacle);
    }
}

// Function to update flash effects
function updatePaparazziFlashEffects() {
    window.obstacles.forEach(obstacle => {
        if (obstacle.type.name === 'Paparazzi' && obstacle.flashActive) {
            const timePassed = Date.now() - obstacle.flashStartTime;
            if (timePassed < window.FLASH_DURATION) {
                obstacle.flashOpacity = 1 - (timePassed / window.FLASH_DURATION);
            } else {
                obstacle.flashActive = false;
                obstacle.flashOpacity = 0;
            }
        }
    });
}

// Update obstacles
function updateObstacles(gameSpeed, rewards, createReward, REWARD_SIZE) {
    if (window.obstacles.length === 0 || 
        window.obstacles[window.obstacles.length - 1].x < window.canvas.width - window.obstacles[window.obstacles.length - 1].gap) {
        window.obstacles.push(createObstacle());
        // 70% chance to spawn a reward with each obstacle
        if (Math.random() < 0.7 && typeof createReward === 'function' && Array.isArray(rewards)) {
            rewards.push(createReward(window.canvas.width + getRandomNumber(0, 100)));
        }
    }
    
    // Check for player jumping over Paparazzi
    window.obstacles.forEach(obstacle => {
        if (obstacle.type.name === 'Paparazzi' && !obstacle.flashTriggered) {
            // Check if player has jumped over the obstacle
            const playerRight = window.player.x + window.player.width;
            const playerLeft = window.player.x;
            const obstacleRight = obstacle.x + obstacle.width;
            const obstacleLeft = obstacle.x;
            
            // Calculate player's crotch position (center of player)
            const playerCrotchX = window.player.x + (window.player.width / 2);
            
            // If player's crotch is directly above the Paparazzi and hasn't triggered the flash yet
            if (playerCrotchX > obstacleLeft && playerCrotchX < obstacleRight && !obstacle.flashTriggered) {
                // Trigger camera flash and sound using the flash.js module
                if (typeof window.triggerPaparazziFlash === 'function') {
                    window.triggerPaparazziFlash(obstacle);
                    obstacle.flashTriggered = true;
                }
            }
        }
    });
    
    window.obstacles = window.obstacles.filter(obstacle => obstacle.x > -obstacle.width);
    window.obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });
    return window.obstacles;
}

// Expose to window for use in game.js
window.obstacles = obstacles;
window.obstacleWidth = obstacleWidth;
window.MIN_OBSTACLE_HEIGHT = MIN_OBSTACLE_HEIGHT;
window.MAX_OBSTACLE_HEIGHT = MAX_OBSTACLE_HEIGHT;
window.MIN_OBSTACLE_GAP = MIN_OBSTACLE_GAP;
window.MAX_OBSTACLE_GAP = MAX_OBSTACLE_GAP;
window.getRandomNumber = getRandomNumber;
window.createObstacle = createObstacle;
window.drawObstacles = drawObstacles;
window.updateObstacles = updateObstacles;
window.OBSTACLE_TYPES = OBSTACLE_TYPES; 
window.updatePaparazziFlashEffects = updatePaparazziFlashEffects; 