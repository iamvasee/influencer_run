// Game Container Management
class GameContainer {
    constructor() {
        this.container = document.querySelector('.game-container');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalRewardsElement = document.getElementById('finalRewards');
        this.bindEvents();
    }

    bindEvents() {
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    handleResize() {
        // Maintain aspect ratio and responsive sizing
        const containerWidth = this.container.clientWidth;
        const containerHeight = (containerWidth * 9) / 16; // 16:9 ratio
        this.container.style.height = `${containerHeight}px`;
    }

    showGameOver(collectedRewards) {
        this.gameOverElement.classList.remove('hidden');
        this.displayFinalRewards(collectedRewards);
    }

    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
    }

    displayFinalRewards(collectedRewards) {
        this.finalRewardsElement.innerHTML = '';
        for (const [emoji, count] of Object.entries(collectedRewards)) {
            const rewardItem = document.createElement('div');
            rewardItem.className = 'reward-item';
            rewardItem.innerHTML = `${emoji} × ${count}`;
            this.finalRewardsElement.appendChild(rewardItem);
        }
    }
}

// Initialize container and make it globally available
window.gameContainer = new GameContainer(); 