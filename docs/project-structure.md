# Influencer On The Run - Project Structure

## Directory Structure

```
ior/
├── index.html              # Main entry point
├── style.css              # Global styles
├── README.md              # Project documentation
│
├── src/                   # Source code
│   ├── core/             # Core game mechanics
│   │   └── game.js       # Main game logic
│   │
│   ├── environment/      # Environment elements
│   │   ├── sky.js       # Sky rendering
│   │   ├── ground.js    # Ground mechanics
│   │   └── cityscape.js # City background
│   │
│   ├── objects/         # Game objects
│   │   ├── obstacles.js # Obstacle mechanics
│   │   ├── rewards.js   # Reward system
│   │   └── container.js # Object containers
│   │
│   └── ui/             # User interface components
│
├── Assets/              # Game assets
│   ├── posters/        # Marketing and UI images
│   │   ├── 169poster.png  # Game poster (16:9)
│   │   ├── poster.png     # Game over poster
│   │   └── profile.png    # Profile picture
│   │
│   ├── player poses/   # Character animations
│   │   ├── player.png    # Standing pose
│   │   └── jump1.png     # Jump animation
│   │
│   ├── ingame objects/ # Game object sprites
│   │   ├── bike.png      # Bike sprite
│   │   └── onbike.png    # Player on bike
│   │
│   └── SFX/           # Sound effects
│       └── camera-click.mp3  # Camera sound
│
└── docs/              # Documentation
    └── project-structure.md  # This file

## File Paths Reference

### Asset Paths
- Game Start Poster: `Assets/posters/169poster.png`
- Game Over Poster: `Assets/posters/poster.png`
- Profile Picture: `Assets/posters/profile.png`
- Player Standing: `Assets/player poses/player.png`
- Player Jumping: `Assets/player poses/jump1.png`
- Camera Sound: `Assets/SFX/camera-click.mp3`
- Bike Sprite: `Assets/ingame objects/bike.png`
- Player on Bike: `Assets/ingame objects/onbike.png`

### Script Paths
- Main Game Logic: `src/core/game.js`
- Sky Background: `src/environment/sky.js`
- Ground System: `src/environment/ground.js`
- City Background: `src/environment/cityscape.js`
- Obstacles System: `src/objects/obstacles.js`
- Rewards System: `src/objects/rewards.js`
- Container System: `src/objects/container.js`

## Asset Loading Order
1. Load image assets first
2. Load sound assets
3. Initialize game components
4. Start game loop

## Coding Standards

1. File Organization:
   - Keep related files in appropriate directories
   - Use consistent naming conventions
   - Maintain clear separation of concerns

2. Asset Management:
   - All game assets should be in the Assets directory
   - Use subdirectories for different asset types
   - Keep original files in a separate backup

3. Code Style:
   - Use camelCase for JavaScript files and functions
   - Use kebab-case for asset files
   - Use clear, descriptive names

4. Documentation:
   - Keep this structure document updated
   - Document any new assets or file paths
   - Include purpose and usage notes 