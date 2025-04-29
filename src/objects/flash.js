// Flash effect functionality
// This file serves as a bridge between game.js and obstacles.js

// Flash effect variables
const FLASH_DURATION = 500; // 0.5 seconds

// Function to trigger camera flash
function triggerCameraFlash(obstacle) {
    // Create a new Audio instance for each flash
    const sound = new Audio('Assets/SFX/camera-click.mp3');
    sound.volume = 0.4;
    sound.play();
}

// Function to update flash effects
function updatePaparazziFlashEffects() {
    window.obstacles.forEach(obstacle => {
        if (obstacle.type.name === 'Paparazzi' && obstacle.flashActive) {
            const timePassed = Date.now() - obstacle.flashStartTime;
            if (timePassed < FLASH_DURATION) {
                obstacle.flashOpacity = 1 - (timePassed / FLASH_DURATION);
            } else {
                obstacle.flashActive = false;
                obstacle.flashOpacity = 0;
            }
        }
    });
}

// Function to trigger paparazzi flash
function triggerPaparazziFlash(obstacle) {
    // Set flash properties
    obstacle.flashActive = true;
    obstacle.flashOpacity = 1;
    obstacle.flashStartTime = Date.now();
    
    // Play camera sound
    triggerCameraFlash(obstacle);
}

// Expose functions to window
window.FLASH_DURATION = FLASH_DURATION;
window.triggerCameraFlash = triggerCameraFlash;
window.updatePaparazziFlashEffects = updatePaparazziFlashEffects;
window.triggerPaparazziFlash = triggerPaparazziFlash; 