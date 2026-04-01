// Cityscape rendering

const CITYSCAPE = {
    // Foreground layer
    buildings: [],
    // Background layer
    bgBuildings: [],
    // Flying objects (helicopters and UFOs)
    flyingObjects: [],
    trees: [],
    numBuildings: 8,
    numBgBuildings: 6,
    numTrees: 4,
    minBuildingWidth: 100,
    maxBuildingWidth: 200,
    minBuildingHeight: 200,
    maxBuildingHeight: 400,
    minBgBuildingWidth: 120,
    maxBgBuildingWidth: 240,
    minBgBuildingHeight: 300,
    maxBgBuildingHeight: 500,
    // SVG images
    helicopterLeftImg: null,
    helicopterRightImg: null,
    ufoImg: null,
    treeImgs: [],
    // Animation timer
    animationTimer: 0
};

function generateWindows(building, isBg = false) {
    const windows = [];
    const groundY = window.GROUND_LEVEL + window.player.height;
    const colorLit = isBg ? '#b0c4de' : '#ffe082';
    for (let wy = groundY - building.height + 18; wy < groundY - 10; wy += 28) {
        for (let wx = building.x + 10; wx < building.x + building.width - 10; wx += 22) {
            windows.push({
                x: wx - building.x,
                y: wy - (groundY - building.height),
                lit: Math.random() > 0.6,
                color: Math.random() > 0.5 ? colorLit : '#222'
            });
        }
    }
    return windows;
}

function createBuilding(x, isBg = false) {
    const width = Math.floor(Math.random() * (isBg ? (CITYSCAPE.maxBgBuildingWidth - CITYSCAPE.minBgBuildingWidth) : (CITYSCAPE.maxBuildingWidth - CITYSCAPE.minBuildingWidth))) + (isBg ? CITYSCAPE.minBgBuildingWidth : CITYSCAPE.minBuildingWidth);
    const height = Math.floor(Math.random() * (isBg ? (CITYSCAPE.maxBgBuildingHeight - CITYSCAPE.minBgBuildingHeight) : (CITYSCAPE.maxBuildingHeight - CITYSCAPE.minBuildingHeight))) + (isBg ? CITYSCAPE.minBgBuildingHeight : CITYSCAPE.minBuildingHeight);
    const color = isBg
        ? `hsl(${Math.random() * 20 + 210}, 16%, ${Math.random() * 10 + 35}%)`
        : `hsl(${Math.random() * 30 + 210}, 18%, ${Math.random() * 20 + 25}%)`;
    const windows = generateWindows({x, width, height}, isBg);
    return { x, width, height, color, windows };
}

function createTree(x) {
    const groundY = window.GROUND_LEVEL + window.player.height;
    const treeType = Math.floor(Math.random() * 7) + 1;
    return {
        x,
        y: groundY,
        type: treeType,
        width: 100,
        height: 120
    };
}

function createLight(x) {
    const groundY = window.GROUND_LEVEL + window.player.height;
    return {
        x,
        y: groundY,
        height: Math.random() * 30 + 50,
        color: '#ffd600',
        poleColor: '#aaa'
    };
}

// --- SVG Loader ---
function loadSVGImage(path, callback) {
    fetch(path)
        .then(res => res.text())
        .then(svgText => {
            const svg = new Blob([svgText], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svg);
            const img = new window.Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                callback(img);
            };
            img.src = url;
        });
}

// --- Flying Object Creation ---
function createFlyingObject() {
    // Randomly choose type and direction
    const type = Math.random() < 0.7 ? 'airplane' : 'ufo';
    let direction, y, x, speed, img, colorVariant;
    
    if (type === 'airplane') {
        // For airplanes, direction is determined by the image type
        // airplane-left.svg flies from left to right
        // airplane-right.svg flies from right to left
        if (Math.random() < 0.5) {
            direction = 'right';
            x = -70;
            speed = Math.random() * 1.5 + 2.2;
            img = CITYSCAPE.airplaneLeftImg; // Using left image for right direction
        } else {
            direction = 'left';
            x = window.canvas.width + 70;
            speed = -(Math.random() * 1.5 + 2.2);
            img = CITYSCAPE.airplaneRightImg; // Using right image for left direction
        }
    } else {
        // For UFOs, keep the random direction
        direction = Math.random() < 0.5 ? 'right' : 'left';
        if (direction === 'right') {
            x = -70;
            speed = Math.random() * 1.5 + 2.2;
            img = CITYSCAPE.ufoImg;
        } else {
            x = window.canvas.width + 70;
            speed = -(Math.random() * 1.5 + 2.2);
            img = CITYSCAPE.ufoImg;
        }
    }
    
    y = Math.random() * 120 + 40;
    
    // Color variant for UFOs
    if (type === 'ufo') {
        const colors = [
            ['#8e24aa', '#ce93d8'], // purple
            ['#009688', '#80cbc4'], // teal
            ['#fbc02d', '#fff176']  // yellow
        ];
        colorVariant = colors[Math.floor(Math.random() * colors.length)];
    }
    
    return {
        type,
        direction,
        x,
        y,
        speed,
        img,
        colorVariant,
        blinkPhase: Math.random() * Math.PI * 2 // for blinking offset
    };
}

function initCityscape() {
    // Foreground buildings
    CITYSCAPE.buildings = [];
    let x = 0;
    for (let i = 0; i < CITYSCAPE.numBuildings; i++) {
        const building = createBuilding(x, false);
        CITYSCAPE.buildings.push(building);
        x += building.width + Math.floor(Math.random() * 20 + 10);
    }
    // Background buildings
    CITYSCAPE.bgBuildings = [];
    x = 0;
    for (let i = 0; i < CITYSCAPE.numBgBuildings; i++) {
        const building = createBuilding(x, true);
        CITYSCAPE.bgBuildings.push(building);
        x += building.width + Math.floor(Math.random() * 15 + 5);
    }
    // Flying objects
    CITYSCAPE.flyingObjects = [];
    CITYSCAPE.animationTimer = 0;
    // Initialize trees
    CITYSCAPE.trees = [];
    let treeX = 0;
    for (let i = 0; i < CITYSCAPE.numTrees; i++) {
        const tree = createTree(treeX);
        CITYSCAPE.trees.push(tree);
        treeX += Math.floor(Math.random() * 200) + 300;
    }
    // Load SVGs if not already loaded
    if (!CITYSCAPE.helicopterRightImg) {
        loadSVGImage('Assets/ingame objects/helicopter-right.svg', img => CITYSCAPE.helicopterRightImg = img);
    }
    if (!CITYSCAPE.helicopterLeftImg) {
        loadSVGImage('Assets/ingame objects/helicopter-left.svg', img => CITYSCAPE.helicopterLeftImg = img);
    }
    if (!CITYSCAPE.ufoImg) {
        loadSVGImage('Assets/ingame objects/ufo.svg', img => CITYSCAPE.ufoImg = img);
    }
    // Load tree SVGs
    CITYSCAPE.treeImgs = [];
    for (let i = 1; i <= 7; i++) {
        loadSVGImage(`Assets/ingame objects/tree${i}.svg`, img => {
            CITYSCAPE.treeImgs[i] = img;
        });
    }
}

function updateCityscape() {
    // Parallax speeds
    const speed = (window.gameSpeed || 7) * 0.6;
    const bgSpeed = (window.gameSpeed || 7) * 0.35;
    // Foreground buildings
    for (let b of CITYSCAPE.buildings) {
        b.x -= speed;
    }
    while (CITYSCAPE.buildings.length && CITYSCAPE.buildings[0].x + CITYSCAPE.buildings[0].width < 0) {
        CITYSCAPE.buildings.shift();
        const last = CITYSCAPE.buildings[CITYSCAPE.buildings.length - 1];
        const newX = last.x + last.width + Math.floor(Math.random() * 20 + 10);
        const newBuilding = createBuilding(newX, false);
        CITYSCAPE.buildings.push(newBuilding);
    }
    // Background buildings
    for (let b of CITYSCAPE.bgBuildings) {
        b.x -= bgSpeed;
    }
    while (CITYSCAPE.bgBuildings.length && CITYSCAPE.bgBuildings[0].x + CITYSCAPE.bgBuildings[0].width < 0) {
        CITYSCAPE.bgBuildings.shift();
        const last = CITYSCAPE.bgBuildings[CITYSCAPE.bgBuildings.length - 1];
        const newX = last.x + last.width + Math.floor(Math.random() * 15 + 5);
        const newBuilding = createBuilding(newX, true);
        CITYSCAPE.bgBuildings.push(newBuilding);
    }
    // Flying objects
    CITYSCAPE.animationTimer += 0.1;
    // Move and remove off-screen
    for (let i = CITYSCAPE.flyingObjects.length - 1; i >= 0; i--) {
        const obj = CITYSCAPE.flyingObjects[i];
        obj.x += obj.speed;
        if ((obj.speed > 0 && obj.x > window.canvas.width + 50) || (obj.speed < 0 && obj.x < -50)) {
            CITYSCAPE.flyingObjects.splice(i, 1);
        }
    }
    // Randomly spawn new flying objects
    if (Math.random() < 0.005 && CITYSCAPE.helicopterRightImg && CITYSCAPE.helicopterLeftImg && CITYSCAPE.ufoImg) {
        CITYSCAPE.flyingObjects.push(createFlyingObject());
    }
    // Update trees
    for (let t of CITYSCAPE.trees) {
        t.x -= speed;
    }
    while (CITYSCAPE.trees.length && CITYSCAPE.trees[0].x + CITYSCAPE.trees[0].width < 0) {
        CITYSCAPE.trees.shift();
        const last = CITYSCAPE.trees[CITYSCAPE.trees.length - 1];
        const newX = last.x + last.width + Math.floor(Math.random() * 200) + 300;
        const newTree = createTree(newX);
        CITYSCAPE.trees.push(newTree);
    }
}

function drawCityscape() {
    const ctx = window.ctx;
    const groundY = window.GROUND_LEVEL + window.player.height;
    // Draw background buildings
    CITYSCAPE.bgBuildings.forEach(b => {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, groundY - b.height, b.width, b.height);
        // Draw windows
        b.windows.forEach(w => {
            ctx.fillStyle = w.lit ? w.color : '#333';
            ctx.fillRect(b.x + w.x, groundY - b.height + w.y, 15, 20);
        });
        ctx.restore();
    });
    // Draw flying objects (helicopters and UFOs)
    CITYSCAPE.flyingObjects.forEach(obj => {
        if (obj.img) {
            ctx.save();
            ctx.globalAlpha = 1;
            if (obj.type === 'helicopter') {
                ctx.drawImage(obj.img, obj.x, obj.y, 80, 50);
                // Blinking lights
                const blink = Math.sin(CITYSCAPE.animationTimer + obj.blinkPhase) > 0.2;
                if (blink) {
                    ctx.beginPath();
                    if (obj.direction === 'right') {
                        ctx.arc(obj.x + 72, obj.y + 25, 4, 0, 2 * Math.PI);
                    } else {
                        ctx.arc(obj.x + 8, obj.y + 25, 4, 0, 2 * Math.PI);
                    }
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#fff';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                }
            } else if (obj.type === 'ufo') {
                ctx.drawImage(obj.img, obj.x, obj.y, 80, 50);
                // Blinking lights
                const blink1 = Math.sin(CITYSCAPE.animationTimer + obj.blinkPhase) > 0.3;
                const blink2 = Math.sin(CITYSCAPE.animationTimer + obj.blinkPhase + 1) > 0.3;
                const blink3 = Math.sin(CITYSCAPE.animationTimer + obj.blinkPhase + 2) > 0.3;
                if (blink1) {
                    ctx.beginPath();
                    ctx.arc(obj.x + 24, obj.y + 40, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffeb3b';
                    ctx.shadowColor = '#ffeb3b';
                    ctx.shadowBlur = 12;
                    ctx.fill();
                }
                if (blink2) {
                    ctx.beginPath();
                    ctx.arc(obj.x + 40, obj.y + 42, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#00e676';
                    ctx.shadowColor = '#00e676';
                    ctx.shadowBlur = 12;
                    ctx.fill();
                }
                if (blink3) {
                    ctx.beginPath();
                    ctx.arc(obj.x + 56, obj.y + 40, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ff1744';
                    ctx.shadowColor = '#ff1744';
                    ctx.shadowBlur = 12;
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    });
    // Draw foreground buildings
    CITYSCAPE.buildings.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, groundY - b.height, b.width, b.height);
        // Draw windows
        b.windows.forEach(w => {
            ctx.fillStyle = w.lit ? w.color : '#333';
            ctx.fillRect(b.x + w.x, groundY - b.height + w.y, 15, 20);
        });
        ctx.restore();
    });
    // Draw trees
    CITYSCAPE.trees.forEach(t => {
        if (CITYSCAPE.treeImgs[t.type]) {
            ctx.save();
            ctx.drawImage(CITYSCAPE.treeImgs[t.type], t.x, t.y - t.height, t.width, t.height);
            ctx.restore();
        }
    });
}

// Expose functions globally
window.initCityscape = initCityscape;
window.updateCityscape = updateCityscape;
window.drawCityscape = drawCityscape;

// Initialize on load
window.addEventListener('load', () => {
    initCityscape();
}); 