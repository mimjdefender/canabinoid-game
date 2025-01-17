import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 800,  // Game width
    height: 600, // Game height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for a top-down game
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize the Phaser game
const game = new Phaser.Game(config);

function preload() {
    // Load assets here (e.g., images, sprites)
    this.load.image('background', 'background.png'); // Example background
    this.load.image('cannabinoid', 'cannabinoid.png'); // Example player sprite
}

function create() {
    // Add a background
    this.add.image(400, 300, 'background'); // Centered at (400, 300)

    // Add a player (cannabinoid)
    this.player = this.physics.add.sprite(400, 300, 'cannabinoid');
    this.player.setCollideWorldBounds(true); // Keep the player inside the game boundaries
}

function update() {
    // Update game logic (e.g., player movement) here
}
