// Sky.js - Enhanced galaxy night sky with twinkling stars and moon (no clouds)

// Star state
if (!window._skyState) {
    window._skyState = {
        stars: Array.from({length: 80}, () => ({
            x: Math.random(),
            y: Math.random() * 0.7,
            r: Math.random() * 1.7 + 0.5,
            twinkle: Math.random() * Math.PI * 2,
            color: Math.random() < 0.85 ? '#fff' : (Math.random() < 0.5 ? '#b39ddb' : '#90caf9')
        })),
        moon: {
            x: 0.8,
            y: 0.18,
            r: 48
        },
        tick: 0
    };
}

function drawSky() {
    const ctx = window.ctx;
    const w = window.canvas.width;
    const h = window.canvas.height;
    const state = window._skyState;
    state.tick += 1;

    // Galaxy gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a1446'); // deep blue-purple
    grad.addColorStop(0.3, '#2d1b5a');
    grad.addColorStop(0.6, '#3a256b');
    grad.addColorStop(0.85, '#23243a');
    grad.addColorStop(1, '#181d2a');
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Subtle nebula/galaxy clouds
    for (let i = 0; i < 2; i++) {
        const nebulaX = (0.2 + 0.6 * i) * w + Math.sin(state.tick * 0.002 + i) * 60;
        const nebulaY = 0.18 * h + Math.cos(state.tick * 0.001 + i) * 30;
        ctx.save();
        ctx.globalAlpha = 0.10 + 0.07 * Math.sin(state.tick * 0.01 + i);
        const nebulaGrad = ctx.createRadialGradient(nebulaX, nebulaY, 10, nebulaX, nebulaY, 180);
        nebulaGrad.addColorStop(0, i === 0 ? '#b388ff' : '#80d8ff');
        nebulaGrad.addColorStop(0.5, 'rgba(76,0,130,0.18)');
        nebulaGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nebulaGrad;
        ctx.beginPath();
        ctx.arc(nebulaX, nebulaY, 180, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    // Twinkling stars
    for (const star of state.stars) {
        const tw = 0.7 + 0.5 * Math.sin(state.tick * 0.04 + star.twinkle);
        ctx.save();
        ctx.globalAlpha = 0.7 * tw;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.r * tw, 0, 2 * Math.PI);
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 8 * tw;
        ctx.fill();
        ctx.restore();
    }

    // Moon (glow)
    const moon = state.moon;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(moon.x * w, moon.y * h, moon.r, 0, 2 * Math.PI);
    ctx.fillStyle = '#f5f3ce';
    ctx.shadowColor = '#fffde7';
    ctx.shadowBlur = 60;
    ctx.fill();
    ctx.restore();
    // Moon craters
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath(); ctx.arc(moon.x * w + 18, moon.y * h - 10, 8, 0, 2 * Math.PI); ctx.fillStyle = '#bdbdbd'; ctx.fill();
    ctx.beginPath(); ctx.arc(moon.x * w - 12, moon.y * h + 8, 5, 0, 2 * Math.PI); ctx.fillStyle = '#bdbdbd'; ctx.fill();
    ctx.beginPath(); ctx.arc(moon.x * w + 8, moon.y * h + 16, 4, 0, 2 * Math.PI); ctx.fillStyle = '#bdbdbd'; ctx.fill();
    ctx.restore();
}
window.drawSky = drawSky; 