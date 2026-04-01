export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
        this.player = null;
        this.cursors = null;
        this.ground = null;
        this.obstacles = null;
        this.rewards = null;
        this.score = 0;
        this.gameOver = false;
        this.speed = 5;
    }

    create() {
        // Setup world bounds
        this.physics.world.setBounds(0, 0, 4000, this.game.config.height);
        
        // Create background
        this.createBackground();
        
        // Create ground
        this.createGround();
        
        // Create player
        this.createPlayer();
        
        // Create groups
        this.obstacles = this.physics.add.group();
        this.rewards = this.physics.add.group();
        
        // Setup collisions
        this.setupCollisions();
        
        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.jump, this);
        
        // Spawn obstacles and rewards
        this.time.addEvent({
            delay: 1500,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
        
        this.time.addEvent({
            delay: 3000,
            callback: this.spawnReward,
            callbackScope: this,
            loop: true
        });
    }

    createBackground() {
        // Add parallax background layers here
        this.background = this.add.tileSprite(
            0, 0, 
            this.game.config.width * 2, 
            this.game.config.height, 
            'background'
        );
        this.background.setOrigin(0, 0);
        this.background.setScrollFactor(0);
    }

    createGround() {
        this.ground = this.physics.add.staticGroup();
        const ground = this.ground.create(0, this.game.config.height - 40, 'ground')
            .setOrigin(0, 1)
            .refreshBody();
        
        // Make ground wider than the screen
        ground.setScale(10, 1);
        
        // Setup collision with player
        this.physics.add.collider(this.player, this.ground);
    }

    createPlayer() {
        // Create player with physics
        this.player = this.physics.add.sprite(100, 300, 'player-run');
        this.player.setCollideWorldBounds(true);
        
        // Player animations
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.player.play('run');
    }

    setupCollisions() {
        // Player collision with obstacles
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
        
        // Player collision with rewards
        this.physics.add.overlap(this.player, this.rewards, this.collectReward, null, this);
    }

    update() {
        if (this.gameOver) return;
        
        // Player controls
        if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
            this.jump();
        }
        
        // Camera follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 4000, this.game.config.height);
        
        // Update background position for parallax effect
        if (this.background) {
            this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
        }
        
        // Increase difficulty over time
        this.speed = 5 + Math.floor(this.time.now / 30000);
    }

    jump() {
        if (this.player.body.onFloor()) {
            this.player.setVelocityY(-800);
            this.player.play('jump');
            this.sound.play('jump');
            
            // Switch back to run animation when landing
            this.player.on('animationcomplete', () => {
                if (this.player.body.onFloor()) {
                    this.player.play('run');
                }
            }, this);
        }
    }

    spawnObstacle() {
        if (this.gameOver) return;
        
        const obstacle = this.obstacles.create(
            this.cameras.main.scrollX + this.game.config.width + 100,
            this.game.config.height - 100,
            `obstacle-${Phaser.Math.Between(1, 2)}`
        );
        
        obstacle.setVelocityX(-200 - (this.speed * 20));
        obstacle.setImmovable(true);
        
        // Remove obstacle when it leaves the screen
        obstacle.checkWorldBounds = true;
        obstacle.outOfBoundsKill = true;
    }

    spawnReward() {
        if (this.gameOver) return;
        
        const reward = this.rewards.create(
            this.cameras.main.scrollX + this.game.config.width + 50,
            Phaser.Math.Between(100, this.game.config.height - 150),
            `reward-${Phaser.Math.Between(1, 2)}`
        );
        
        reward.setVelocityX(-200 - (this.speed * 15));
        reward.setGravityY(300);
        
        // Add bounciness
        reward.setBounce(0.5);
        reward.setCollideWorldBounds(true);
        
        // Remove reward when it leaves the screen
        reward.checkWorldBounds = true;
        reward.outOfBoundsKill = true;
    }

    hitObstacle(player, obstacle) {
        this.gameOver = true;
        this.sound.play('game-over');
        this.scene.pause();
        this.scene.launch('GameOver', { score: this.score });
    }

    collectReward(player, reward) {
        reward.disableBody(true, true);
        this.score += 100;
        this.sound.play('collect');
        
        // Update score in UI scene
        const uiScene = this.scene.get('UI');
        if (uiScene) {
            uiScene.updateScore(this.score);
        }
    }
}
