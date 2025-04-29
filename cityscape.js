// Cityscape rendering

const CITYSCAPE = {
    // Foreground layer
    buildings: [],
    // Background layer
    bgBuildings: [],
    // Trees and street lights
    trees: [],
    lights: [],
    flyingObjects: [], // airplanes and UFOs
    numBuildings: 12,
    numBgBuildings: 10,
    minBuildingWidth: 60,
    maxBuildingWidth: 140,
    minBuildingHeight: 120,
    maxBuildingHeight: 260,
    minBgBuildingWidth: 80,
    maxBgBuildingWidth: 180,
    minBgBuildingHeight: 220,
    maxBgBuildingHeight: 420,
    // SVG images
    airplaneRightImg: null,
    airplaneLeftImg: null,
    ufoImg: null,
    // Blinking timer
    blinkTimer: 0
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
    return {
        x,
        y: groundY,
        height: Math.random() * 30 + 40,
        width: Math.random() * 12 + 16,
        color: '#388e3c',
        trunkColor: '#795548'
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
        x += building.width + Math.floor(Math.random() * 10 + 2);
    }
    // Background buildings
    CITYSCAPE.bgBuildings = [];
    x = 0;
    for (let i = 0; i < CITYSCAPE.numBgBuildings; i++) {
        const building = createBuilding(x, true);
        CITYSCAPE.bgBuildings.push(building);
        x += building.width + Math.floor(Math.random() * 8 + 2);
    }
    // Trees
    CITYSCAPE.trees = [];
    const numTrees = 18;
    const treeSpread = window.canvas.width * 2;
    for (let i = 0; i < numTrees; i++) {
        const base = (i / numTrees) * treeSpread;
        const jitter = Math.random() * 60 - 30;
        CITYSCAPE.trees.push(createTree(base + jitter));
    }
    // Street lights
    CITYSCAPE.lights = [];
    const numLights = 12;
    const lightSpread = window.canvas.width * 2.2;
    for (let i = 0; i < numLights; i++) {
        const base = (i / numLights) * lightSpread;
        const jitter = Math.random() * 80 - 40;
        CITYSCAPE.lights.push(createLight(base + jitter));
    }
    // Flying objects
    CITYSCAPE.flyingObjects = [];
    CITYSCAPE.blinkTimer = 0;
    // Load SVGs if not already loaded
    if (!CITYSCAPE.airplaneRightImg) {
        loadSVGImage('Assets/airplane-right.svg', img => CITYSCAPE.airplaneRightImg = img);
    }
    if (!CITYSCAPE.airplaneLeftImg) {
        loadSVGImage('Assets/airplane-left.svg', img => CITYSCAPE.airplaneLeftImg = img);
    }
    if (!CITYSCAPE.ufoImg) {
        loadSVGImage('Assets/ufo.svg', img => CITYSCAPE.ufoImg = img);
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
        const newX = last.x + last.width + Math.floor(Math.random() * 10 + 2);
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
        const newX = last.x + last.width + Math.floor(Math.random() * 8 + 2);
        const newBuilding = createBuilding(newX, true);
        CITYSCAPE.bgBuildings.push(newBuilding);
    }
    // Trees
    for (let t of CITYSCAPE.trees) {
        t.x -= speed;
    }
    while (CITYSCAPE.trees.length && CITYSCAPE.trees[0].x < -30) {
        CITYSCAPE.trees.shift();
        CITYSCAPE.trees.push(createTree(window.canvas.width + Math.random() * 100));
    }
    // Street lights
    for (let l of CITYSCAPE.lights) {
        l.x -= speed;
    }
    while (CITYSCAPE.lights.length && CITYSCAPE.lights[0].x < -20) {
        CITYSCAPE.lights.shift();
        CITYSCAPE.lights.push(createLight(window.canvas.width + Math.random() * 120));
    }
    // Flying objects
    CITYSCAPE.blinkTimer += 0.12;
    // Move and remove off-screen
    for (let i = CITYSCAPE.flyingObjects.length - 1; i >= 0; i--) {
        const obj = CITYSCAPE.flyingObjects[i];
        obj.x += obj.speed;
        if ((obj.speed > 0 && obj.x > window.canvas.width + 80) || (obj.speed < 0 && obj.x < -80)) {
            CITYSCAPE.flyingObjects.splice(i, 1);
        }
    }
    // Randomly spawn new flying objects (reduced frequency)
    if (Math.random() < 0.004 && CITYSCAPE.airplaneRightImg && CITYSCAPE.airplaneLeftImg && CITYSCAPE.ufoImg) {
        CITYSCAPE.flyingObjects.push(createFlyingObject());
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
        b.windows.forEach(w => {
            ctx.fillStyle = w.lit ? w.color : '#222';
            ctx.fillRect(b.x + w.x, groundY - b.height + w.y, 10, 18);
        });
        ctx.restore();
    });
    // Draw flying objects (airplanes, UFOs)
    CITYSCAPE.flyingObjects.forEach(obj => {
        if (obj.img) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.drawImage(obj.img, obj.x, obj.y, 60, 40);
            // Blinking lights
            if (obj.type === 'airplane') {
                const blink = Math.sin(CITYSCAPE.blinkTimer + obj.blinkPhase) > 0.2;
                if (blink) {
                    ctx.beginPath();
                    if (obj.direction === 'right') {
                        ctx.arc(obj.x + 54, obj.y + 20, 3, 0, 2 * Math.PI);
                    } else {
                        ctx.arc(obj.x + 6, obj.y + 20, 3, 0, 2 * Math.PI);
                    }
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#fff';
                    ctx.shadowBlur = 8;
                    ctx.fill();
                }
            } else if (obj.type === 'ufo') {
                const blink1 = Math.sin(CITYSCAPE.blinkTimer + obj.blinkPhase) > 0.3;
                const blink2 = Math.sin(CITYSCAPE.blinkTimer + obj.blinkPhase + 1) > 0.3;
                const blink3 = Math.sin(CITYSCAPE.blinkTimer + obj.blinkPhase + 2) > 0.3;
                if (blink1) {
                    ctx.beginPath();
                    ctx.arc(obj.x + 18, obj.y + 30, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffeb3b';
                    ctx.shadowColor = '#ffeb3b';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                }
                if (blink2) {
                    ctx.beginPath();
                    ctx.arc(obj.x + 30, obj.y + 32, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#00e676';
                    ctx.shadowColor = '#00e676';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                }
                if (blink3) {
                    ctx.beginPath();
                    ctx.arc(obj.x + 42, obj.y + 30, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ff1744';
                    ctx.shadowColor = '#ff1744';
                    ctx.shadowBlur = 10;
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
        b.windows.forEach(w => {
            ctx.fillStyle = w.lit ? w.color : '#222';
            ctx.fillRect(b.x + w.x, groundY - b.height + w.y, 10, 18);
        });
        ctx.restore();
    });
    // Draw trees
    CITYSCAPE.trees.forEach(t => {
        ctx.save();
        ctx.fillStyle = t.trunkColor;
        ctx.fillRect(t.x + t.width/2 - 3, t.y - t.height + 20, 6, 20);
        ctx.beginPath();
        ctx.arc(t.x + t.width/2, t.y - t.height/2, t.width, Math.PI, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = t.color;
        ctx.fill();
        ctx.restore();
    });
    // Draw street lights
    CITYSCAPE.lights.forEach(l => {
        ctx.save();
        ctx.strokeStyle = l.poleColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y - l.height + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(l.x, l.y - l.height, 7, 0, 2 * Math.PI);
        ctx.fillStyle = l.color;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
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