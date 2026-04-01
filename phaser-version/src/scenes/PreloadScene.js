export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        // Add loading bar
        const progress = this.add.graphics();
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(100, this.sys.game.config.height / 2, 
                            (this.sys.game.config.width - 200) * value, 20);
        });

        // Load game assets
        this.loadAssets();

        // Clean up on complete
        this.load.on('complete', () => {
            progress.destroy();
            this.scene.start('Game');
            this.scene.launch('UI');
        });
    }

    loadAssets() {
        // Player
        this.load.spritesheet('player-run', 'assets/sprites/player/run.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        
        this.load.spritesheet('player-jump', 'assets/sprites/player/jump.png', {
            frameWidth: 100,
            frameHeight: 100
        });

        // Obstacles
        this.load.image('obstacle-1', 'assets/sprites/obstacles/obstacle1.png');
        this.load.image('obstacle-2', 'assets/sprites/obstacles/obstacle2.png');
        
        // Rewards
        this.load.image('reward-1', 'assets/sprites/rewards/reward1.png');
        this.load.image('reward-2', 'assets/sprites/rewards/reward2.png');
        
        // Environment
        this.load.image('ground', 'assets/images/ground.png');
        this.load.image('background', 'assets/images/background.png');
        
        // UI Elements
        this.load.image('ui-heart', 'assets/ui/heart.png');
        this.load.image('ui-view', 'assets/ui/view.png');
        
        // Audio
        this.load.audio('jump', 'assets/audio/jump.mp3');
        this.load.audio('collect', 'assets/audio/collect.mp3');
        this.load.audio('game-over', 'assets/audio/game-over.mp3');
    }
}
