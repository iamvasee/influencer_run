// At the top of game.js, ensure obstacles.js is loaded before this file in index.html

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const finalRewardsElement = document.getElementById('finalRewards');
const gameOverElement = document.getElementById('gameOver');

// Make canvas and context globally available
window.canvas = canvas;
window.ctx = ctx;

// Set canvas size (16:9 ratio)
canvas.width = 1280;  // 16 units
canvas.height = 720;  // 9 units

// Game variables
let totalRewardPoints = 0;
let collectedRewards = {};
let gameSpeed = 7;
let gameLoop;
let isGameOver = false;
let rewards = [];
const REWARD_SIZE = 50;
let obstaclesDodged = 0;  // Track number of obstacles dodged
let streamDuration = 0;   // Track stream duration in seconds
let streamStartTime;      // Track when stream started
const passedObstacles = new Set();  // Track which obstacles have been passed

// Define ground level
const GROUND_LEVEL = canvas.height - 250;
// Make ground level globally available
window.GROUND_LEVEL = GROUND_LEVEL;

// Player
const player = {
    x: 100,
    y: GROUND_LEVEL,
    width: 100,  // Made equal to height for 1:1 ratio
    height: 100, // Made equal to width for 1:1 ratio
    jumping: false,
    jumpCount: 0,
    maxJumps: 2,
    jumpForce: 20,  // Increased jump force for better feel with square player
    doubleJumpForce: 17, // Adjusted for new height
    gravity: 0.9,    // Slightly increased gravity for better feel
    velocityY: 0
};
// Make player globally available
window.player = player;
window.gameSpeed = gameSpeed;

// Load player images
const playerImage = new Image();
playerImage.src = 'Assets/player poses/player.png';
const jumpImage = new Image();
jumpImage.src = 'Assets/player poses/jump1.png';

// Dust effect state
let playerDustPuffs = [];

// Game functions
function drawPlayer() {
    // Draw the player image
    if (player.jumping) {
        ctx.drawImage(jumpImage, player.x, player.y, player.width, player.height);
    } else {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    }
}

function drawGround() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL + player.height);
    ctx.lineTo(canvas.width, GROUND_LEVEL + player.height);
    ctx.stroke();
    
    // Add ground fill
    ctx.fillStyle = 'rgba(51, 51, 51, 0.3)';
    ctx.fillRect(0, GROUND_LEVEL + player.height, canvas.width, canvas.height - (GROUND_LEVEL + player.height));
}

function createReward(x) {
    const reward = getRandomReward();
    const y = getRandomNumber(
        GROUND_LEVEL - 180,  // Adjusted reward spawn height
        GROUND_LEVEL - REWARD_SIZE - 20
    );
    
    return {
        x: x,
        y: y,
        size: REWARD_SIZE,
        ...reward
    };
}

function drawRewards() {
    rewards.forEach(reward => {
        ctx.font = `${reward.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(reward.emoji, reward.x + reward.size/2, reward.y + reward.size/2);
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y + rect1.height > rect2.y &&
           rect1.y < rect2.y + rect2.height;
}

function checkRewardCollision() {
    rewards.forEach((reward, index) => {
        const rewardRect = {
            x: reward.x,
            y: reward.y,
            width: reward.size,
            height: reward.size
        };
        
        if (checkCollision(player, rewardRect)) {
            // Collect reward
            totalRewardPoints += reward.points;
            collectedRewards[reward.emoji] = (collectedRewards[reward.emoji] || 0) + 1;
            
            // Play reward sound
            window.soundManager.play('reward');
            
            // Remove collected reward
            rewards.splice(index, 1);
            
            // Increase game speed slightly with each reward
            gameSpeed += 0.1;
        }
    });
}

function displayFinalRewards() {
    // Get all reward cells
    const rewardCells = document.querySelectorAll('.reward-cell');
    
    // Update each cell's count based on collected rewards
    rewardCells.forEach(cell => {
        const emoji = cell.textContent.split(' ')[0]; // Get the emoji
        const count = collectedRewards[emoji] || 0;
        const span = cell.querySelector('span');
        if (span) {
            span.textContent = `${count}`;
    }
    });
}

function drawStaticScene() {
    if (typeof window.drawSky === 'function') {
        window.drawSky();
    }
    if (typeof window.drawCityscape === 'function') {
        window.drawCityscape();
    }
    if (typeof window.drawGround === 'function') {
        window.drawGround();
    }
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoop);
    update(); // Draw final scene
    
    // Calculate final stats
    const hours = Math.floor(streamDuration / 3600);
    const minutes = Math.floor((streamDuration % 3600) / 60);
    const seconds = streamDuration % 60;
    const duration = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    
    // Update stats display
    document.getElementById('streamDuration').textContent = duration;
    document.getElementById('viewerCount').textContent = totalRewardPoints;
    document.getElementById('obstacleCount').textContent = obstaclesDodged;
    
    // Display collected rewards
    displayFinalRewards();
    
    // Update game over message with the message from the last hit obstacle
    const gameOverMessageElem = document.getElementById('gameOverMessage');
    if (gameOverMessageElem && window.lastHitObstacle && window.lastHitObstacle.type) {
        gameOverMessageElem.textContent = window.lastHitObstacle.type.gameOverMessage;
    }
    
    // Play end stream sound
    window.soundManager.play('gameOver');
    
    // Show end stream screen
    gameOverElement.classList.remove('hidden');
}

function jump() {
    if (player.jumpCount < player.maxJumps) {
        player.jumping = true;
        player.jumpCount++;
        
        // First jump is stronger than second
        player.velocityY = player.jumpCount === 1 ? -player.jumpForce : -player.doubleJumpForce;
        
        // Play jump sound
        window.soundManager.play('jump');
    }
}

// Make updateGroundDecorations available globally if it exists
window.updateGroundDecorations = window.updateGroundDecorations || function() {};

function spawnPlayerDust() {
    // Only spawn if player is on the ground and moving horizontally (simulate running)
    if (!player.jumping && player.velocityY === 0) {
        playerDustPuffs.push({
            x: player.x + player.width * 0.2 + Math.random() * player.width * 0.6,
            y: player.y + player.height - 8 + Math.random() * 6,
            r: 7 + Math.random() * 5,
            alpha: 0.5 + Math.random() * 0.3,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -0.5 - Math.random() * 0.7,
            life: 0
        });
    }
}

function updatePlayerDust() {
    for (let i = playerDustPuffs.length - 1; i >= 0; i--) {
        const d = playerDustPuffs[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.12; // gravity
        d.alpha -= 0.018;
        d.life += 1;
        if (d.alpha <= 0 || d.life > 32) {
            playerDustPuffs.splice(i, 1);
        }
    }
}

function drawPlayerDust() {
    const ctx = window.ctx;
    for (const d of playerDustPuffs) {
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(200,180,140,0.7)';
        ctx.shadowColor = '#fffde7';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
    }
}

function update() {
    // Update stream duration
    streamDuration = Math.floor((Date.now() - streamStartTime) / 1000);
    
    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Clip to rounded rectangle
    ctx.save();
    ctx.beginPath();
    const r = 25;
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
    ctx.lineTo(r, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    // Apply camera transform if zooming
    window.camera?.update(ctx);

    // Draw background elements
    window.drawSky?.();
    window.updateCityscape?.();
    window.drawCityscape?.();
    
    // Update player
    if (player.jumping) {
        player.velocityY += player.gravity;
        player.y += player.velocityY;
        if (player.y > GROUND_LEVEL) {
            player.y = GROUND_LEVEL;
            player.jumping = false;
            player.jumpCount = 0;
            player.velocityY = 0;
        }
    }

    // Update game objects
    spawnPlayerDust();
    updatePlayerDust();
    
    // Update obstacles and flash effects
    window.updatePaparazziFlashEffects?.();
    window.updateObstacles(gameSpeed, rewards, createReward, REWARD_SIZE);
    
    // Update rewards
    rewards = rewards.filter(reward => reward.x > -reward.size);
    rewards.forEach(reward => {
        reward.x -= gameSpeed;
    });
    
    // Check collisions
    for (let obstacle of window.obstacles) {
        if (checkObstacleCollision(obstacle)) {
            return;
        }
    }
    checkRewardCollision();
    
    // Draw everything else
    window.drawGround?.();
    drawPlayerDust();
    drawPlayer();
    window.drawObstacles();
    drawRewards();
    
    // Draw HUD elements
    window.drawProfile?.();
    window.drawLiveCounter?.(totalRewardPoints);
    
    // Reset camera transform if zooming
    window.camera?.reset(ctx);
    
    ctx.restore();
    
    // Continue game loop if not game over
    if (!isGameOver) {
    gameLoop = requestAnimationFrame(update);
    }
}

function startGame() {
    // Reset game state
    totalRewardPoints = 0;
    collectedRewards = {};
    gameSpeed = 7;
    window.gameSpeed = gameSpeed;
    window.obstacles = [];
    window.lastHitObstacle = null;
    rewards = [];
    isGameOver = false;
    obstaclesDodged = 0;
    passedObstacles.clear();  // Clear passed obstacles
    streamStartTime = Date.now();
    
    // Reset player
    player.y = GROUND_LEVEL;
    player.jumping = false;
    player.jumpCount = 0;
    player.velocityY = 0;
    
    // Initialize systems
    window.camera?.init();
    window.soundManager?.init();
    window.initGround?.();
    
    // Clear any existing game loop
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // Hide end stream screen
    gameOverElement.classList.add('hidden');
    
    // Start game loop
    update();
}

// Start game when page loads
window.addEventListener('load', () => {
    // Hide game over screen initially
    gameOverElement.classList.add('hidden');
    // Show start popup
    document.getElementById('gameStart').classList.remove('hidden');
    // Prevent game from running until start is pressed
    cancelAnimationFrame(window.gameLoop);
});

// Event listeners
document.addEventListener('keydown', (event) => {
    if (!isGameOver && (event.code === 'Space' || event.code === 'ArrowUp')) {
        event.preventDefault();
        jump();
    } else if (isGameOver && (event.code === 'Space' || event.code === 'ArrowUp')) {
        event.preventDefault();
        startGame();
    }
});

// Update obstacle collision check to track dodged obstacles
function checkObstacleCollision(obstacle) {
    if (checkCollision(player, obstacle)) {
        window.lastHitObstacle = obstacle;
        ctx.restore();
        window.camera?.reset(ctx);
        gameOver();
        return true;
    }
    
    // Only increment if the obstacle has been passed and hasn't been counted yet
    if (player.x > obstacle.x + obstacle.width && !passedObstacles.has(obstacle)) {
        obstaclesDodged++;
        passedObstacles.add(obstacle);
    }
    
    return false;
}