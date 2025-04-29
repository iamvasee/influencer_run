// Sound management module
const sounds = {
    cameraClick: new Audio('Assets/sounds/camera-click.mp3'),
    gameOver: new Audio('Assets/sounds/game-over.mp3'),
    reward: new Audio('Assets/sounds/reward.mp3'),
    jump: new Audio('Assets/sounds/jump.mp3')
};

// Initialize sounds
function initSounds() {
    Object.values(sounds).forEach(sound => sound.load());
}

// Play a sound
function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.warn(`Could not play sound ${soundName}:`, error));
    }
}

// Stop a sound
function stopSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}

// Stop all sounds
function stopAllSounds() {
    Object.values(sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
}

// Expose to window
window.soundManager = { init: initSounds, play: playSound, stop: stopSound, stopAll: stopAllSounds }; 