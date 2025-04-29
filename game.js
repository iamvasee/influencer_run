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
playerImage.src = 'Assets/player.png';
const jumpImage = new Image();
jumpImage.src = 'Assets/jump1.png';

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
            
            // Remove collected reward
            rewards.splice(index, 1);
            
            // Increase game speed slightly with each reward
            gameSpeed += 0.1;
        }
    });
}

function displayFinalRewards() {
    finalRewardsElement.innerHTML = '';
    for (const [emoji, count] of Object.entries(collectedRewards)) {
        const rewardItem = document.createElement('div');
        rewardItem.className = 'reward-item';
        rewardItem.innerHTML = `${emoji} × ${count}`;
        finalRewardsElement.appendChild(rewardItem);
    }
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
    drawStaticScene(); // Keep ground and background visible
    displayFinalRewards();
    const viewsElem = document.getElementById('gameOverViews');
    if (viewsElem) viewsElem.textContent = totalRewardPoints;
    gameOverElement.classList.remove('hidden');
}

function jump() {
    if (player.jumpCount < player.maxJumps) {
        player.jumping = true;
        player.jumpCount++;
        
        // First jump is stronger than second
        player.velocityY = player.jumpCount === 1 ? -player.jumpForce : -player.doubleJumpForce;
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

function drawLiveCounter() {
    const ctx = window.ctx;
    const padding = 32;
    // LIVE badge
    const liveText = 'LIVE';
    ctx.save();
    ctx.font = '700 22px Space Grotesk, Arial, sans-serif';
    const liveWidth = ctx.measureText(liveText).width + 36;
    const liveHeight = 36;
    
    // Calculate dynamic width for eye badge based on number of digits
    const viewCountText = totalRewardPoints.toString();
    ctx.font = '500 20px Space Grotesk, Arial, sans-serif';
    const viewCountWidth = ctx.measureText(viewCountText).width;
    const eyeIconWidth = 20; // Width of the eye icon
    const eyeIconPadding = 18; // Padding around the eye icon
    const eyeBadgeWidth = Math.max(70, eyeIconWidth + eyeIconPadding + viewCountWidth + 20); // Minimum 70px, or wider if needed
    const eyeBadgeHeight = 36; // Add back the missing height variable
    
    const gap = 10; // small gap between badges
    const eyeX = window.canvas.width - padding - eyeBadgeWidth;
    const eyeY = padding;
    const liveX = eyeX - liveWidth - gap;
    const liveY = padding;
    // Gradient for LIVE
    const grad = ctx.createLinearGradient(liveX, liveY, liveX + liveWidth, liveY + liveHeight);
    grad.addColorStop(0, '#ff007a');
    grad.addColorStop(1, '#ff4e50');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(liveX + 12, liveY);
    ctx.lineTo(liveX + liveWidth - 12, liveY);
    ctx.quadraticCurveTo(liveX + liveWidth, liveY, liveX + liveWidth, liveY + 12);
    ctx.lineTo(liveX + liveWidth, liveY + liveHeight - 12);
    ctx.quadraticCurveTo(liveX + liveWidth, liveY + liveHeight, liveX + liveWidth - 12, liveY + liveHeight);
    ctx.lineTo(liveX + 12, liveY + liveHeight);
    ctx.quadraticCurveTo(liveX, liveY + liveHeight, liveX, liveY + liveHeight - 12);
    ctx.lineTo(liveX, liveY + 12);
    ctx.quadraticCurveTo(liveX, liveY, liveX + 12, liveY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(liveText, liveX + liveWidth / 2, liveY + liveHeight / 2);
    ctx.restore();

    // Eye badge
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(eyeX + 12, eyeY);
    ctx.lineTo(eyeX + eyeBadgeWidth - 12, eyeY);
    ctx.quadraticCurveTo(eyeX + eyeBadgeWidth, eyeY, eyeX + eyeBadgeWidth, eyeY + 12);
    ctx.lineTo(eyeX + eyeBadgeWidth, eyeY + eyeBadgeHeight - 12);
    ctx.quadraticCurveTo(eyeX + eyeBadgeWidth, eyeY + eyeBadgeHeight, eyeX + eyeBadgeWidth - 12, eyeY + eyeBadgeHeight);
    ctx.lineTo(eyeX + 12, eyeY + eyeBadgeHeight);
    ctx.quadraticCurveTo(eyeX, eyeY + eyeBadgeHeight, eyeX, eyeY + eyeBadgeHeight - 12);
    ctx.lineTo(eyeX, eyeY + 12);
    ctx.quadraticCurveTo(eyeX, eyeY, eyeX + 12, eyeY);
    ctx.closePath();
    ctx.fillStyle = '#18181b';
    ctx.shadowColor = 'rgba(0,0,0,0.10)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Draw eye icon
    ctx.save();
    ctx.translate(eyeX + 20, eyeY + eyeBadgeHeight / 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 6, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
    // Draw reward value
    ctx.fillStyle = '#fff';
    ctx.font = '500 20px Space Grotesk, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(totalRewardPoints, eyeX + 38, eyeY + eyeBadgeHeight / 2);
    ctx.restore();
}

function update() {
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

    // Draw red sky background
    if (typeof window.drawSky === 'function') {
        window.drawSky();
    }
    // Update and draw cityscape (skyline, buildings, flying objects)
    if (typeof window.updateCityscape === 'function') {
        window.updateCityscape();
    }
    if (typeof window.drawCityscape === 'function') {
        window.drawCityscape();
    }
    
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

    // Spawn and update player dust
    spawnPlayerDust();
    updatePlayerDust();
    
    // Update obstacles and rewards
    window.updateObstacles(gameSpeed, rewards, createReward, REWARD_SIZE);
    // Move rewards left and filter out off-screen rewards
    rewards = rewards.filter(reward => reward.x > -reward.size);
    rewards.forEach(reward => {
        reward.x -= gameSpeed;
    });
    
    // Update ground elements
    if (typeof window.updateGround === 'function') {
        window.updateGround();
    }
    
    // Check collisions
    for (let obstacle of window.obstacles) {
        if (checkCollision(player, obstacle)) {
            ctx.restore();
            gameOver();
            return;
        }
    }
    
    // Check reward collisions
    checkRewardCollision();
    
    // Draw everything else
    if (typeof window.drawGround === 'function') {
        window.drawGround();
    }
    drawPlayerDust();
    drawPlayer();
    window.drawObstacles();
    drawRewards();
    drawLiveCounter();
    
    ctx.restore();
    // Continue game loop
    gameLoop = requestAnimationFrame(update);
}

function startGame() {
    // Reset game state
    totalRewardPoints = 0;
    collectedRewards = {};
    gameSpeed = 7;
    window.gameSpeed = gameSpeed;
    window.obstacles = [];
    rewards = [];
    isGameOver = false;
    player.y = GROUND_LEVEL;
    player.jumping = false;
    player.jumpCount = 0;
    player.velocityY = 0;
    
    // Initialize ground if available
    if (typeof window.initGround === 'function') {
        window.initGround();
    }
    
    // Reset UI
    gameOverElement.classList.add('hidden');
    
    // Start game loop
    update();
}

// Start game when page loads
window.addEventListener('load', () => {
    startGame();
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