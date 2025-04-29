// Obstacle logic extracted from game.js

// Obstacle variables
let obstacles = [];
const obstacleWidth = 40;
const MIN_OBSTACLE_HEIGHT = 80;
const MAX_OBSTACLE_HEIGHT = 140;
const MIN_OBSTACLE_GAP = 400;
const MAX_OBSTACLE_GAP = 600;

// Utility function
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Obstacle creation
function createObstacle() {
    const height = getRandomNumber(MIN_OBSTACLE_HEIGHT, MAX_OBSTACLE_HEIGHT);
    return {
        x: window.canvas.width,
        y: window.GROUND_LEVEL + window.player.height - height,
        width: obstacleWidth,
        height: height,
        gap: getRandomNumber(MIN_OBSTACLE_GAP, MAX_OBSTACLE_GAP)
    };
}

// Draw obstacles
function drawObstacles() {
    const ctx = window.ctx;
    window.obstacles.forEach(obstacle => {
        // Pillar body gradient
        const grad = ctx.createLinearGradient(
            obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height
        );
        grad.addColorStop(0, '#6ee16e'); // light green top
        grad.addColorStop(0.7, '#2e8b57'); // medium green
        grad.addColorStop(1, '#206040'); // dark green base
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
        ctx.fillStyle = '#1a4d2e';
        ctx.fillRect(
            obstacle.x,
            obstacle.y + obstacle.height - 10,
            obstacle.width,
            10
        );
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
    });
}

// Update obstacles
function updateObstacles(gameSpeed, rewards, createReward, REWARD_SIZE) {
    if (window.obstacles.length === 0 || 
        window.obstacles[window.obstacles.length - 1].x < window.canvas.width - window.obstacles[window.obstacles.length - 1].gap) {
        window.obstacles.push(createObstacle());
        // 70% chance to spawn a reward with each obstacle (increased from 50%)
        if (Math.random() < 0.7 && typeof createReward === 'function' && Array.isArray(rewards)) {
            rewards.push(createReward(window.canvas.width + getRandomNumber(0, 100)));
        }
    }
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