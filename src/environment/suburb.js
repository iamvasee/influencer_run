// Suburban environment rendering

const SUBURB = {
    // Foreground houses
    houses: [],
    // Background houses
    bgHouses: [],
    // Mailboxes and street signs
    mailboxes: [],
    signs: [],
    // Flying objects (airplanes and UFOs)
    flyingObjects: [],
    trees: [],
    numHouses: 8,
    numBgHouses: 6,
    numTrees: 6,
    minHouseWidth: 80,
    maxHouseWidth: 160,
    minHouseHeight: 100,
    maxHouseHeight: 180,
    minBgHouseWidth: 100,
    maxBgHouseWidth: 200,
    minBgHouseHeight: 150,
    maxBgHouseHeight: 250,
    // SVG images
    airplaneLeftImg: null,
    airplaneRightImg: null,
    ufoImg: null,
    treeImgs: [],
    // Animation timer
    animationTimer: 0
};

function generateWindows(house, isBg = false) {
    const windows = [];
    const groundY = window.GROUND_LEVEL + window.player.height;
    const colorLit = isBg ? '#f5f5f5' : '#ffd700';
    for (let wy = groundY - house.height + 20; wy < groundY - 15; wy += 30) {
        for (let wx = house.x + 15; wx < house.x + house.width - 15; wx += 25) {
            windows.push({
                x: wx - house.x,
                y: wy - (groundY - house.height),
                lit: Math.random() > 0.7,
                color: Math.random() > 0.5 ? colorLit : '#333'
            });
        }
    }
    return windows;
}

function createHouse(x, isBg = false) {
    const width = Math.floor(Math.random() * (isBg ? (SUBURB.maxBgHouseWidth - SUBURB.minBgHouseWidth) : (SUBURB.maxHouseWidth - SUBURB.minHouseWidth))) + (isBg ? SUBURB.minBgHouseWidth : SUBURB.minHouseWidth);
    const height = Math.floor(Math.random() * (isBg ? (SUBURB.maxBgHouseHeight - SUBURB.minBgHouseHeight) : (SUBURB.maxHouseHeight - SUBURB.minHouseHeight))) + (isBg ? SUBURB.minBgHouseHeight : SUBURB.minHouseHeight);
    const colors = [
        '#e57373', // light red
        '#81c784', // light green
        '#64b5f6', // light blue
        '#ffb74d', // light orange
        '#ba68c8'  // light purple
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const windows = generateWindows({x, width, height}, isBg);
    return { x, width, height, color, windows };
}

function createMailbox(x) {
    const groundY = window.GROUND_LEVEL + window.player.height;
    return {
        x,
        y: groundY,
        height: 50,
        width: 20,
        postColor: '#8d6e63',
        boxColor: '#e0e0e0'
    };
}

function createSign(x) {
    const groundY = window.GROUND_LEVEL + window.player.height;
    const signs = ['STOP', 'YIELD', 'SPEED LIMIT 25'];
    return {
        x,
        y: groundY,
        height: 60,
        width: 30,
        text: signs[Math.floor(Math.random() * signs.length)],
        postColor: '#9e9e9e',
        signColor: '#f44336'
    };
}

function createTree(x) {
    const groundY = window.GROUND_LEVEL + window.player.height;
    const treeType = Math.floor(Math.random() * 7) + 1; // Random tree type (1-7)
    return {
        x,
        y: groundY,
        type: treeType,
        width: 100,
        height: 120
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
    const type = Math.random() < 0.7 ? 'airplane' : 'ufo';
    let direction, y, x, speed, img, colorVariant;
    
    if (type === 'airplane') {
        direction = Math.random() < 0.5 ? 'right' : 'left';
        if (direction === 'right') {
            x = -70;
            speed = Math.random() * 1.5 + 2.2;
            img = SUBURB.airplaneLeftImg; // Using left image for right direction
        } else {
            direction = 'left';
            x = window.canvas.width + 70;
            speed = -(Math.random() * 1.5 + 2.2);
            img = SUBURB.airplaneRightImg; // Using right image for left direction
        }
    } else {
        // For UFOs, keep the random direction
        direction = Math.random() < 0.5 ? 'right' : 'left';
        if (direction === 'right') {
            x = -70;
            speed = Math.random() * 1.5 + 2.2;
            img = SUBURB.ufoImg;
        } else {
            x = window.canvas.width + 70;
            speed = -(Math.random() * 1.5 + 2.2);
            img = SUBURB.ufoImg;
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

function initSuburb() {
    // Foreground houses
    SUBURB.houses = [];
    let x = 0;
    for (let i = 0; i < SUBURB.numHouses; i++) {
        const house = createHouse(x, false);
        SUBURB.houses.push(house);
        x += house.width + Math.floor(Math.random() * 20 + 10);
    }
    // Background houses
    SUBURB.bgHouses = [];
    x = 0;
    for (let i = 0; i < SUBURB.numBgHouses; i++) {
        const house = createHouse(x, true);
        SUBURB.bgHouses.push(house);
        x += house.width + Math.floor(Math.random() * 15 + 5);
    }
    // Mailboxes
    SUBURB.mailboxes = [];
    const numMailboxes = 8;
    const mailboxSpread = window.canvas.width * 2;
    for (let i = 0; i < numMailboxes; i++) {
        const base = (i / numMailboxes) * mailboxSpread;
        const jitter = Math.random() * 30 - 15;
        SUBURB.mailboxes.push(createMailbox(base + jitter));
    }
    // Signs
    SUBURB.signs = [];
    const numSigns = 6;
    const signSpread = window.canvas.width * 2.2;
    for (let i = 0; i < numSigns; i++) {
        const base = (i / numSigns) * signSpread;
        const jitter = Math.random() * 40 - 20;
        SUBURB.signs.push(createSign(base + jitter));
    }
    // Flying objects
    SUBURB.flyingObjects = [];
    SUBURB.animationTimer = 0;
    // Load SVGs if not already loaded
    if (!SUBURB.airplaneRightImg) {
        loadSVGImage('Assets/ingame objects/airplane-right.svg', img => SUBURB.airplaneRightImg = img);
    }
    if (!SUBURB.airplaneLeftImg) {
        loadSVGImage('Assets/ingame objects/airplane-left.svg', img => SUBURB.airplaneLeftImg = img);
    }
    if (!SUBURB.ufoImg) {
        loadSVGImage('Assets/ingame objects/ufo.svg', img => SUBURB.ufoImg = img);
    }
    // Initialize trees
    SUBURB.trees = [];
    let treeX = 0;
    for (let i = 0; i < SUBURB.numTrees; i++) {
        const tree = createTree(treeX);
        SUBURB.trees.push(tree);
        treeX += Math.floor(Math.random() * 200) + 300; // Random spacing between trees
    }
    // Load tree SVGs
    SUBURB.treeImgs = [];
    for (let i = 1; i <= 7; i++) {
        loadSVGImage(`Assets/ingame objects/tree${i}.svg`, img => {
            SUBURB.treeImgs[i] = img;
        });
    }
}

function updateSuburb() {
    // Parallax speeds
    const speed = (window.gameSpeed || 7) * 0.6;
    const bgSpeed = (window.gameSpeed || 7) * 0.35;
    // Foreground houses
    for (let h of SUBURB.houses) {
        h.x -= speed;
    }
    while (SUBURB.houses.length && SUBURB.houses[0].x + SUBURB.houses[0].width < 0) {
        SUBURB.houses.shift();
        const last = SUBURB.houses[SUBURB.houses.length - 1];
        const newX = last.x + last.width + Math.floor(Math.random() * 20 + 10);
        const newHouse = createHouse(newX, false);
        SUBURB.houses.push(newHouse);
    }
    // Background houses
    for (let h of SUBURB.bgHouses) {
        h.x -= bgSpeed;
    }
    while (SUBURB.bgHouses.length && SUBURB.bgHouses[0].x + SUBURB.bgHouses[0].width < 0) {
        SUBURB.bgHouses.shift();
        const last = SUBURB.bgHouses[SUBURB.bgHouses.length - 1];
        const newX = last.x + last.width + Math.floor(Math.random() * 15 + 5);
        const newHouse = createHouse(newX, true);
        SUBURB.bgHouses.push(newHouse);
    }
    // Mailboxes
    for (let m of SUBURB.mailboxes) {
        m.x -= speed;
    }
    while (SUBURB.mailboxes.length && SUBURB.mailboxes[0].x < -20) {
        SUBURB.mailboxes.shift();
        SUBURB.mailboxes.push(createMailbox(window.canvas.width + Math.random() * 80));
    }
    // Signs
    for (let s of SUBURB.signs) {
        s.x -= speed;
    }
    while (SUBURB.signs.length && SUBURB.signs[0].x < -30) {
        SUBURB.signs.shift();
        SUBURB.signs.push(createSign(window.canvas.width + Math.random() * 100));
    }
    // Flying objects
    SUBURB.animationTimer += 0.1;
    // Move and remove off-screen
    for (let i = SUBURB.flyingObjects.length - 1; i >= 0; i--) {
        const obj = SUBURB.flyingObjects[i];
        obj.x += obj.speed;
        if ((obj.speed > 0 && obj.x > window.canvas.width + 50) || (obj.speed < 0 && obj.x < -50)) {
            SUBURB.flyingObjects.splice(i, 1);
        }
    }
    // Randomly spawn new flying objects
    if (Math.random() < 0.005 && SUBURB.airplaneRightImg && SUBURB.airplaneLeftImg && SUBURB.ufoImg) {
        SUBURB.flyingObjects.push(createFlyingObject());
    }
    // Update trees
    for (let t of SUBURB.trees) {
        t.x -= speed;
    }
    while (SUBURB.trees.length && SUBURB.trees[0].x + SUBURB.trees[0].width < 0) {
        SUBURB.trees.shift();
        const last = SUBURB.trees[SUBURB.trees.length - 1];
        const newX = last.x + last.width + Math.floor(Math.random() * 200) + 300;
        const newTree = createTree(newX);
        SUBURB.trees.push(newTree);
    }
}

function drawSuburb() {
    const ctx = window.ctx;
    const groundY = window.GROUND_LEVEL + window.player.height;
    // Draw background houses
    SUBURB.bgHouses.forEach(h => {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = h.color;
        ctx.fillRect(h.x, groundY - h.height, h.width, h.height);
        // Draw roof
        ctx.beginPath();
        ctx.moveTo(h.x, groundY - h.height);
        ctx.lineTo(h.x + h.width/2, groundY - h.height - 20);
        ctx.lineTo(h.x + h.width, groundY - h.height);
        ctx.closePath();
        ctx.fillStyle = '#795548';
        ctx.fill();
        // Draw windows
        h.windows.forEach(w => {
            ctx.fillStyle = w.lit ? w.color : '#333';
            ctx.fillRect(h.x + w.x, groundY - h.height + w.y, 12, 15);
        });
        ctx.restore();
    });
    // Draw flying objects (airplanes and UFOs)
    SUBURB.flyingObjects.forEach(obj => {
        if (obj.img) {
            ctx.save();
            ctx.globalAlpha = 1;
            if (obj.type === 'airplane') {
                ctx.drawImage(obj.img, obj.x, obj.y, 60, 40);
                // Blinking lights
                const blink = Math.sin(SUBURB.animationTimer + obj.blinkPhase) > 0.2;
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
                ctx.drawImage(obj.img, obj.x, obj.y, 60, 40);
                // Blinking lights
                const blink1 = Math.sin(SUBURB.animationTimer + obj.blinkPhase) > 0.3;
                const blink2 = Math.sin(SUBURB.animationTimer + obj.blinkPhase + 1) > 0.3;
                const blink3 = Math.sin(SUBURB.animationTimer + obj.blinkPhase + 2) > 0.3;
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
                    ctx.arc(obj.x + 56, obj.y + 30, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ff1744';
                    ctx.shadowColor = '#ff1744';
                    ctx.shadowBlur = 10;
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    });
    // Draw foreground houses
    SUBURB.houses.forEach(h => {
        ctx.save();
        ctx.fillStyle = h.color;
        ctx.fillRect(h.x, groundY - h.height, h.width, h.height);
        // Draw roof
        ctx.beginPath();
        ctx.moveTo(h.x, groundY - h.height);
        ctx.lineTo(h.x + h.width/2, groundY - h.height - 25);
        ctx.lineTo(h.x + h.width, groundY - h.height);
        ctx.closePath();
        ctx.fillStyle = '#5d4037';
        ctx.fill();
        // Draw windows
        h.windows.forEach(w => {
            ctx.fillStyle = w.lit ? w.color : '#333';
            ctx.fillRect(h.x + w.x, groundY - h.height + w.y, 12, 15);
        });
        ctx.restore();
    });
    // Draw mailboxes
    SUBURB.mailboxes.forEach(m => {
        ctx.save();
        // Draw post
        ctx.fillStyle = m.postColor;
        ctx.fillRect(m.x + m.width/2 - 2, m.y - m.height + 10, 4, m.height - 10);
        // Draw box
        ctx.fillStyle = m.boxColor;
        ctx.fillRect(m.x, m.y - m.height + 10, m.width, 15);
        ctx.restore();
    });
    // Draw signs
    SUBURB.signs.forEach(s => {
        ctx.save();
        // Draw post
        ctx.fillStyle = s.postColor;
        ctx.fillRect(s.x + s.width/2 - 2, s.y - s.height + 10, 4, s.height - 10);
        // Draw sign
        ctx.fillStyle = s.signColor;
        ctx.fillRect(s.x, s.y - s.height + 10, s.width, 20);
        // Draw text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(s.text, s.x + s.width/2, s.y - s.height + 24);
        ctx.restore();
    });
    // Draw trees
    SUBURB.trees.forEach(t => {
        if (SUBURB.treeImgs[t.type]) {
            ctx.save();
            ctx.drawImage(SUBURB.treeImgs[t.type], t.x, t.y - t.height, t.width, t.height);
            ctx.restore();
        }
    });
}

// Expose functions globally
window.initSuburb = initSuburb;
window.updateSuburb = updateSuburb;
window.drawSuburb = drawSuburb;

// Initialize on load
window.addEventListener('load', () => {
    initSuburb();
}); 