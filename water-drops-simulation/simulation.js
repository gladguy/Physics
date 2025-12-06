/**
 * Falling Water Drops Simulation
 * Physics problem: 6 drops falling from 20m building at regular intervals
 * When 1st drop hits ground, 6th drop just starts falling
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    physics: {
        g: 10,              // m/s² (acceleration due to gravity)
        h: 20,              // meters (building height)
        totalTime: 2,       // seconds (time for 1st drop to hit ground)
        numDrops: 6,
        dt: 0.4,            // seconds (interval between drops = 2/5)
    },
    canvas: {
        padding: { top: 50, bottom: 40, left: 70, right: 50 },
        scale: 25,          // pixels per meter
    },
    colors: {
        drops: ['#00b4d8', '#0096c7', '#0077b6', '#023e8a', '#03045e', '#90e0ef'],
        building: '#495057',
        buildingDark: '#343a40',
        ground: '#2d6a4f',
        sky: '#1d3557',
        highlight: '#ff9f1c',
    },
    animation: {
        fps: 60,
        realTimeScale: 0.5, // 1 real second = 0.5 simulation seconds at 1x speed
    }
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    isPaused: false,
    speed: 1,
    currentTime: 0,
    drops: [],
    canvas: null,
    ctx: null,
    animationFrame: null,
    lastTimestamp: 0,
    isFrozen: false,
    showSolution: false,
};

// ============================================
// Drop Class
// ============================================
class Drop {
    constructor(id, releaseTime, color) {
        this.id = id;
        this.releaseTime = releaseTime;
        this.color = color;
        this.y = CONFIG.physics.h;  // current height
        this.velocity = 0;
        this.falling = false;
        this.reachedGround = false;
        this.splashTime = 0;
        this.splashing = false;
    }

    update(currentTime) {
        if (currentTime < this.releaseTime) {
            this.falling = false;
            this.y = CONFIG.physics.h;
            this.velocity = 0;
            return;
        }

        if (this.reachedGround) {
            // Handle splash animation
            if (this.splashing) {
                this.splashTime += 0.016;
                if (this.splashTime > 0.5) {
                    this.splashing = false;
                }
            }
            return;
        }

        this.falling = true;
        const fallTime = currentTime - this.releaseTime;

        // h = h0 - (1/2)gt²
        this.y = CONFIG.physics.h - 0.5 * CONFIG.physics.g * fallTime * fallTime;

        // v = gt
        this.velocity = CONFIG.physics.g * fallTime;

        if (this.y <= 0) {
            this.y = 0;
            this.reachedGround = true;
            this.splashing = true;
            this.splashTime = 0;
        }
    }

    getFallTime(currentTime) {
        if (currentTime < this.releaseTime) return 0;
        return Math.max(0, currentTime - this.releaseTime);
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('physics-canvas');
    state.ctx = state.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = state.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;
    state.canvas.width = rect.width * dpr;
    state.canvas.height = rect.height * dpr;

    state.canvas.style.width = `${rect.width}px`;
    state.canvas.style.height = `${rect.height}px`;

    state.ctx.scale(dpr, dpr);

    state.canvasWidth = rect.width;
    state.canvasHeight = rect.height;

    // Calculate scale to fit 20m height
    const availableHeight = state.canvasHeight - CONFIG.canvas.padding.top - CONFIG.canvas.padding.bottom;
    CONFIG.canvas.scale = availableHeight / CONFIG.physics.h;
}

function heightToY(heightMeters) {
    // Convert height in meters to canvas Y coordinate
    // y=0 (ground) is at bottom, y=20m is at top
    const groundY = state.canvasHeight - CONFIG.canvas.padding.bottom;
    return groundY - heightMeters * CONFIG.canvas.scale;
}

function metersToPixels(meters) {
    return meters * CONFIG.canvas.scale;
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawBackground() {
    const ctx = state.ctx;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    skyGradient.addColorStop(0, '#0a1628');
    skyGradient.addColorStop(0.5, '#1d3557');
    skyGradient.addColorStop(1, '#457b9d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawBuilding() {
    const ctx = state.ctx;
    const padding = CONFIG.canvas.padding;

    // Building dimensions
    const buildingWidth = 120;
    const buildingX = padding.left + 30;
    const roofY = heightToY(CONFIG.physics.h);
    const groundY = heightToY(0);
    const buildingHeight = groundY - roofY;

    // Building body
    const buildingGradient = ctx.createLinearGradient(buildingX, 0, buildingX + buildingWidth, 0);
    buildingGradient.addColorStop(0, CONFIG.colors.buildingDark);
    buildingGradient.addColorStop(0.5, CONFIG.colors.building);
    buildingGradient.addColorStop(1, CONFIG.colors.buildingDark);

    ctx.fillStyle = buildingGradient;
    ctx.fillRect(buildingX, roofY, buildingWidth, buildingHeight);

    // Windows
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    const windowWidth = 20;
    const windowHeight = 25;
    const windowGap = 15;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const wx = buildingX + 15 + col * (windowWidth + windowGap);
            const wy = roofY + 30 + row * (windowHeight + 20);
            ctx.fillRect(wx, wy, windowWidth, windowHeight);
        }
    }

    // Roof
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(buildingX - 10, roofY - 10, buildingWidth + 20, 15);

    // Store roof position for drop release point
    state.roofX = buildingX + buildingWidth + 30;
    state.roofY = roofY;
}

function drawGround() {
    const ctx = state.ctx;
    const groundY = heightToY(0);

    // Ground
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, state.canvasHeight);
    groundGradient.addColorStop(0, CONFIG.colors.ground);
    groundGradient.addColorStop(1, '#1b4332');

    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, state.canvasWidth, state.canvasHeight - groundY);

    // Ground line
    ctx.strokeStyle = '#40916c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(state.canvasWidth, groundY);
    ctx.stroke();
}

function drawHeightScale() {
    const ctx = state.ctx;
    const padding = CONFIG.canvas.padding;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Draw height markers every 5m
    for (let h = 0; h <= CONFIG.physics.h; h += 5) {
        const y = heightToY(h);

        // Marker line
        ctx.beginPath();
        ctx.moveTo(padding.left - 10, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();

        // Label
        ctx.fillText(`${h}m`, padding.left - 15, y);
    }

    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(padding.left, heightToY(0));
    ctx.lineTo(padding.left, heightToY(CONFIG.physics.h));
    ctx.stroke();
}

function drawDrop(drop) {
    const ctx = state.ctx;
    const x = state.roofX + drop.id * 40;
    const y = heightToY(drop.y);

    // Don't draw if not released yet
    if (state.currentTime < drop.releaseTime) {
        // Show as waiting at roof
        drawWaitingDrop(drop, x);
        return;
    }

    // Splash effect
    if (drop.splashing) {
        drawSplash(drop, x, heightToY(0));
    }

    // Drop glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
    gradient.addColorStop(0, `${drop.color}80`);
    gradient.addColorStop(1, `${drop.color}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Main drop (teardrop shape)
    ctx.fillStyle = drop.color;
    ctx.beginPath();

    // Simple circle for now, could make teardrop
    const radius = 12;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(drop.id, x, y);

    // Height label (only if frozen or important drops)
    if (state.isFrozen || (state.currentTime >= CONFIG.physics.totalTime && (drop.id === 2 || drop.id === 4))) {
        ctx.fillStyle = drop.id === 2 || drop.id === 4 ? CONFIG.colors.highlight : '#fff';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(`${drop.y.toFixed(1)}m`, x, y - 22);
    }
}

function drawWaitingDrop(drop, x) {
    const ctx = state.ctx;
    const y = heightToY(CONFIG.physics.h);

    // Faded drop
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = drop.color;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(drop.id, x, y);
}

function drawSplash(drop, x, groundY) {
    const ctx = state.ctx;
    const progress = drop.splashTime / 0.5;

    // Expanding rings
    for (let i = 0; i < 3; i++) {
        const ringProgress = Math.min(1, progress * (1 + i * 0.3));
        const radius = 10 + ringProgress * 30;
        const alpha = (1 - ringProgress) * 0.5;

        ctx.strokeStyle = `rgba(144, 224, 239, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, groundY, radius, 0, Math.PI);
        ctx.stroke();
    }

    // Splash droplets
    const numDroplets = 8;
    for (let i = 0; i < numDroplets; i++) {
        const angle = (Math.PI / numDroplets) * i;
        const dist = progress * 40;
        const dx = x + Math.cos(angle) * dist;
        const dy = groundY - Math.sin(angle) * dist * 0.5 + progress * 20;
        const size = 3 * (1 - progress);

        if (size > 0) {
            ctx.fillStyle = `rgba(144, 224, 239, ${1 - progress})`;
            ctx.beginPath();
            ctx.arc(dx, dy, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawTimeInfo() {
    const ctx = state.ctx;

    // Time display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`t = ${state.currentTime.toFixed(2)}s`, 20, 30);

    // Critical moment indicator
    if (state.currentTime >= CONFIG.physics.totalTime - 0.05 && state.currentTime <= CONFIG.physics.totalTime + 0.05) {
        ctx.fillStyle = CONFIG.colors.highlight;
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('⚡ CRITICAL MOMENT', 20, 55);
    }
}

function render() {
    clearCanvas();
    drawBackground();
    drawGround();
    drawBuilding();
    drawHeightScale();

    // Draw drops
    state.drops.forEach(drop => drawDrop(drop));

    drawTimeInfo();
}

// ============================================
// Physics/Animation
// ============================================
function initDrops() {
    state.drops = [];

    for (let i = 0; i < CONFIG.physics.numDrops; i++) {
        const releaseTime = i * CONFIG.physics.dt;
        const color = CONFIG.colors.drops[i % CONFIG.colors.drops.length];
        const drop = new Drop(i + 1, releaseTime, color);
        state.drops.push(drop);
    }
}

function updatePhysics(dt) {
    state.currentTime += dt;

    // Clamp to slightly past total time for visualization
    if (state.currentTime > CONFIG.physics.totalTime + 0.5) {
        state.currentTime = CONFIG.physics.totalTime + 0.5;
        state.isPlaying = false;
        freezeAtCriticalMoment();
    }

    // Update all drops
    state.drops.forEach(drop => drop.update(state.currentTime));
}

function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    // Apply speed and time scale
    const simDt = deltaTime * state.speed * CONFIG.animation.realTimeScale;

    updatePhysics(simDt);
    updateUI();
    render();

    state.animationFrame = requestAnimationFrame(animate);
}

function freezeAtCriticalMoment() {
    state.currentTime = CONFIG.physics.totalTime;
    state.isFrozen = true;

    // Update drops to exact positions at t=2s
    state.drops.forEach(drop => drop.update(CONFIG.physics.totalTime));

    updateUI();
    render();

    // Reveal solution
    document.getElementById('solution-panel').classList.add('revealed');
    state.showSolution = true;

    // Update button states
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    // Time display
    document.getElementById('time-value').textContent = `${state.currentTime.toFixed(2)} s`;

    // Timeline progress
    const progress = (state.currentTime / CONFIG.physics.totalTime) * 100;
    document.getElementById('timeline-progress').style.width = `${Math.min(100, progress)}%`;

    // Update drops table
    updateDropsTable();

    // Update timeline markers
    updateTimelineMarkers();
}

function updateDropsTable() {
    const table = document.getElementById('drops-table');

    let html = `
        <div class="drop-row header">
            <span>Drop</span>
            <span>Height</span>
            <span>Fall Time</span>
        </div>
    `;

    state.drops.forEach(drop => {
        const isHighlight = (drop.id === 2 || drop.id === 4) && state.currentTime >= CONFIG.physics.totalTime;
        const fallTime = drop.getFallTime(state.currentTime);

        html += `
            <div class="drop-row${isHighlight ? ' highlight' : ''}">
                <div class="drop-id">
                    <span class="drop-indicator" style="background: ${drop.color}"></span>
                    Drop ${drop.id}
                </div>
                <span>${drop.y.toFixed(1)} m</span>
                <span>${fallTime.toFixed(2)} s</span>
            </div>
        `;
    });

    table.innerHTML = html;
}

function updateTimelineMarkers() {
    const container = document.getElementById('timeline-markers');

    let html = '';
    for (let i = 0; i < CONFIG.physics.numDrops; i++) {
        const releaseTime = i * CONFIG.physics.dt;
        const isActive = state.currentTime >= releaseTime;
        html += `<div class="timeline-marker${isActive ? ' active' : ''}"></div>`;
    }

    container.innerHTML = html;
}

function generateHeightScale() {
    const container = document.getElementById('height-scale');
    let html = '';

    for (let h = CONFIG.physics.h; h >= 0; h -= 5) {
        html += `<span>${h}m</span>`;
    }

    container.innerHTML = html;
}

// ============================================
// Controls
// ============================================
function setupControls() {
    // Play button
    document.getElementById('play-btn').addEventListener('click', () => {
        if (state.currentTime >= CONFIG.physics.totalTime + 0.5) {
            resetSimulation();
        }

        state.isPlaying = true;
        state.isFrozen = false;
        state.lastTimestamp = performance.now();
        state.animationFrame = requestAnimationFrame(animate);

        document.getElementById('play-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
    });

    // Pause button
    document.getElementById('pause-btn').addEventListener('click', () => {
        state.isPlaying = false;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
        }

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);

    // Jump to critical moment
    document.getElementById('critical-btn').addEventListener('click', () => {
        state.isPlaying = false;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
        }

        // Reinitialize drops to ensure clean state before jumping
        initDrops();

        freezeAtCriticalMoment();

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    });

    // Speed controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.speed = parseFloat(btn.dataset.speed);
        });
    });

    // Quiz
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const isCorrect = e.target.dataset.answer === 'correct';

            document.querySelectorAll('.quiz-option').forEach(b => {
                b.classList.remove('correct', 'wrong');
                if (b.dataset.answer === 'correct') {
                    b.classList.add('correct');
                } else if (b === e.target && !isCorrect) {
                    b.classList.add('wrong');
                }
            });

            const feedback = document.getElementById('quiz-feedback');
            feedback.classList.add('show');

            if (isCorrect) {
                feedback.className = 'quiz-feedback show correct';
                feedback.innerHTML = '✅ Correct! Drop 2 at 7.2m (fell for 1.6s) and Drop 4 at 16.8m (fell for 0.8s)';

                // Reveal solution panel
                document.getElementById('solution-panel').classList.add('revealed');
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Try again! Use h = 20 - ½(10)t² for each drop\'s fall time.';
            }
        });
    });
}

function resetSimulation() {
    state.isPlaying = false;
    state.isFrozen = false;
    state.currentTime = 0;
    state.showSolution = false;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    initDrops();
    updateUI();
    render();

    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('solution-panel').classList.remove('revealed');

    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(b => {
        b.classList.remove('correct', 'wrong');
    });
    document.getElementById('quiz-feedback').classList.remove('show');
}

// ============================================
// Initialization
// ============================================
function init() {
    initCanvas();
    initDrops();
    generateHeightScale();
    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

document.addEventListener('DOMContentLoaded', init);
