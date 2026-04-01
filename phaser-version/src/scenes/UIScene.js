export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
        this.scoreText = null;
        this.score = 0;
    }

    create() {
        // Create score text
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        // Make sure UI stays on top
        this.scene.bringToTop();
    }

    updateScore(score) {
        this.score = score;
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }
}
