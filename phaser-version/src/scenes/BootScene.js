export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load loading screen assets
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('loading-background', 'assets/images/loading-background.png');
    }

    create() {
        // Initialize game settings here
        this.scene.start('Preload');
    }
}
