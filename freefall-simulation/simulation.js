/**
 * Free-Fall Storey Simulation
 * Ball dropped from 16th storey, takes 4 seconds to reach ground
 * Shows storeys passed in each second (pattern: 1:3:5:7)
 */

// ============================================
// Constants
// ============================================
const CONFIG = {
    physics: {
        g: 10,                  // m/s²
        totalTime: 4,           // seconds
        totalStoreys: 16,
        totalHeight: 80,        // ½ × 10 × 4² = 80m
        storeyHeight: 5,        // 80/16 = 5m per storey
    },
    animation: {
        fps: 60,
    },
    colors: {
        ball: '#ff5252',
        ballGlow: 'rgba(255, 82, 82, 0.4)',
        building: '#6b7280',
        buildingDark: '#4b5563',
        window: 'rgba(255, 255, 180, 0.4)',
        floor: '#9ca3af',
        ground: '#3d5a4d',
        sky: '#475569',
        highlight: '#ff9f1c',
    }
};

// Pre-calculate distances at each second
const DISTANCES = {
    0: 0,
    1: 0.5 * CONFIG.physics.g * 1 * 1,   // 5m = 1 storey
    2: 0.5 * CONFIG.physics.g * 2 * 2,   // 20m = 4 storeys
    3: 0.5 * CONFIG.physics.g * 3 * 3,   // 45m = 9 storeys
    4: 0.5 * CONFIG.physics.g * 4 * 4,   // 80m = 16 storeys
};

const STOREYS_AT = {
    0: 0,
    1: 1,
    2: 4,
    3: 9,
    4: 16,
};

// Storeys in each interval (1:3:5:7 pattern)
const STOREYS_PER_SECOND = {
    1: 1,   // 1 - 0 = 1
    2: 3,   // 4 - 1 = 3
    3: 5,   // 9 - 4 = 5
    4: 7,   // 16 - 9 = 7
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    speed: 1,
    currentTime: 0,
    ball: null,
    canvas: null,
    ctx: null,
    animationFrame: null,
    lastTimestamp: 0,
    showDerivation: false,
    completedIntervals: new Set(),
};

// ============================================
// FallingBall Class
// ============================================
class FallingBall {
    constructor() {
        this.reset();
    }

    reset() {
        this.y = 0;             // distance fallen (m)
        this.velocity = 0;      // m/s
        this.currentFloor = 16; // counting from bottom (16 = top)
        this.storeysFallen = 0;
        this.finished = false;
    }

    update(currentTime) {
        if (this.finished) return;

        if (currentTime >= CONFIG.physics.totalTime) {
            currentTime = CONFIG.physics.totalTime;
            this.finished = true;
        }

        // Physics: d = ½gt²
        this.y = 0.5 * CONFIG.physics.g * currentTime * currentTime;
        this.velocity = CONFIG.physics.g * currentTime;

        // Calculate storeys fallen
        this.storeysFallen = Math.min(16, Math.floor(this.y / CONFIG.physics.storeyHeight));
        this.currentFloor = Math.max(0, 16 - this.storeysFallen);
    }

    getStoreysInInterval(intervalNum) {
        return STOREYS_PER_SECOND[intervalNum] || 0;
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('building-canvas');
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

    // Calculate building dimensions
    const padding = 40;
    state.buildingHeight = state.canvasHeight - padding * 2;
    state.storeyPixelHeight = state.buildingHeight / 16;
    state.buildingX = state.canvasWidth / 2 - 80;
    state.buildingWidth = 160;
    state.buildingTop = padding;
    state.groundY = state.canvasHeight - padding;
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawSky() {
    const ctx = state.ctx;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    skyGradient.addColorStop(0, '#0f172a');
    skyGradient.addColorStop(0.7, '#475569');
    skyGradient.addColorStop(1, '#3d5a4d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const seed = 123;
    for (let i = 0; i < 30; i++) {
        const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * state.canvasWidth;
        const y = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280 * state.canvasHeight * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBuilding() {
    const ctx = state.ctx;
    const { buildingX, buildingWidth, buildingTop, storeyPixelHeight } = state;

    // Building shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(buildingX + 10, buildingTop + 10, buildingWidth, state.buildingHeight);

    // Building body
    const buildingGradient = ctx.createLinearGradient(buildingX, 0, buildingX + buildingWidth, 0);
    buildingGradient.addColorStop(0, CONFIG.colors.buildingDark);
    buildingGradient.addColorStop(0.5, CONFIG.colors.building);
    buildingGradient.addColorStop(1, CONFIG.colors.buildingDark);
    ctx.fillStyle = buildingGradient;
    ctx.fillRect(buildingX, buildingTop, buildingWidth, state.buildingHeight);

    // Draw each storey
    for (let i = 0; i < 16; i++) {
        const storeyTop = buildingTop + i * storeyPixelHeight;
        const floorNum = 16 - i;

        // Check if this storey is being passed in current interval
        const currentInterval = Math.ceil(state.currentTime);
        const storeysAtPrevSec = STOREYS_AT[Math.floor(state.currentTime)] || 0;
        const currentStoreysPassed = state.ball.storeysFallen;
        const isBeingPassed = currentStoreysPassed >= i && storeysAtPrevSec < i + 1 && currentInterval > 0;

        // Floor line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(buildingX, storeyTop);
        ctx.lineTo(buildingX + buildingWidth, storeyTop);
        ctx.stroke();

        // Windows
        const windowWidth = 20;
        const windowHeight = storeyPixelHeight * 0.5;
        const windowY = storeyTop + storeyPixelHeight * 0.25;

        for (let w = 0; w < 4; w++) {
            const windowX = buildingX + 15 + w * 35;
            ctx.fillStyle = CONFIG.colors.window;
            ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
        }

        // Floor number label
        ctx.fillStyle = state.ball.storeysFallen >= 17 - floorNum ? 'rgba(255, 159, 28, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(floorNum, buildingX - 20, storeyTop + storeyPixelHeight / 2 + 4);
    }

    // Ground
    ctx.fillStyle = CONFIG.colors.ground;
    ctx.fillRect(0, state.groundY, state.canvasWidth, state.canvasHeight - state.groundY);

    // Ground label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ground', buildingX + buildingWidth / 2, state.groundY + 20);
}

function drawBall() {
    const ctx = state.ctx;
    const { buildingX, buildingWidth, buildingTop } = state;

    // Ball position
    const ballX = buildingX + buildingWidth + 40;
    const ballY = buildingTop + (state.ball.y / CONFIG.physics.totalHeight) * state.buildingHeight;

    // Trail
    if (state.ball.y > 0) {
        ctx.strokeStyle = 'rgba(255, 82, 82, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ballX, buildingTop);
        ctx.lineTo(ballX, ballY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Ball glow
    const glowGradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 25);
    glowGradient.addColorStop(0, CONFIG.colors.ballGlow);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 25, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    ctx.fillStyle = CONFIG.colors.ball;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(ballX - 3, ballY - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Velocity arrow
    if (state.ball.velocity > 0) {
        const arrowLen = Math.min(50, state.ball.velocity * 2);
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ballX, ballY + 15);
        ctx.lineTo(ballX, ballY + 15 + arrowLen);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = '#00e676';
        ctx.beginPath();
        ctx.moveTo(ballX, ballY + 15 + arrowLen);
        ctx.lineTo(ballX - 5, ballY + 10 + arrowLen);
        ctx.lineTo(ballX + 5, ballY + 10 + arrowLen);
        ctx.closePath();
        ctx.fill();

        // Velocity label
        ctx.fillStyle = '#00e676';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`v = ${state.ball.velocity.toFixed(1)} m/s`, ballX + 20, ballY + 15 + arrowLen / 2);
    }
}

function drawIntervalHighlight() {
    const ctx = state.ctx;
    const currentInterval = Math.ceil(state.currentTime);

    if (currentInterval >= 1 && currentInterval <= 4 && state.currentTime > 0) {
        const prevTime = currentInterval - 1;
        const startY = state.buildingTop + (DISTANCES[prevTime] / CONFIG.physics.totalHeight) * state.buildingHeight;
        const endY = state.buildingTop + (Math.min(state.ball.y, DISTANCES[currentInterval]) / CONFIG.physics.totalHeight) * state.buildingHeight;

        // Highlight region
        ctx.fillStyle = currentInterval === 4 ? 'rgba(255, 159, 28, 0.2)' : 'rgba(74, 158, 255, 0.15)';
        ctx.fillRect(state.buildingX + state.buildingWidth + 20, startY, 50, endY - startY);

        // Interval label
        ctx.fillStyle = currentInterval === 4 ? '#ff9f1c' : '#4a9eff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${currentInterval}${currentInterval === 1 ? 'st' : currentInterval === 2 ? 'nd' : currentInterval === 3 ? 'rd' : 'th'} sec`,
            state.buildingX + state.buildingWidth + 75, (startY + endY) / 2);
    }
}

function render() {
    clearCanvas();
    drawSky();
    drawBuilding();
    drawIntervalHighlight();
    drawBall();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    // Update time
    state.currentTime += deltaTime * state.speed;

    if (state.currentTime >= CONFIG.physics.totalTime) {
        state.currentTime = CONFIG.physics.totalTime;
        state.isPlaying = false;

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        // Show derivation
        document.getElementById('derivation-panel').classList.add('revealed');
        animateDerivation();
    }

    // Update physics
    state.ball.update(state.currentTime);

    // Update UI
    updateUI();
    render();

    // Check for interval completion
    const currentInterval = Math.floor(state.currentTime);
    if (currentInterval > 0 && !state.completedIntervals.has(currentInterval)) {
        state.completedIntervals.add(currentInterval);
        updateIntervalDisplay(currentInterval);
    }

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    // Time display
    document.getElementById('time-display').textContent = state.currentTime.toFixed(2);

    // Live data
    document.getElementById('current-floor').textContent = state.ball.currentFloor;
    document.getElementById('storeys-fallen').textContent = state.ball.storeysFallen;
    document.getElementById('velocity').textContent = `${state.ball.velocity.toFixed(1)} m/s`;
    document.getElementById('distance').textContent = `${state.ball.y.toFixed(1)} m`;

    // Highlight current interval
    const currentInterval = Math.ceil(state.currentTime);
    document.querySelectorAll('.interval-item').forEach(item => {
        const interval = parseInt(item.dataset.interval);
        item.classList.toggle('active', interval === currentInterval && currentInterval <= 4);
    });
}

function updateIntervalDisplay(interval) {
    if (interval >= 1 && interval <= 4) {
        document.getElementById(`interval-${interval}`).textContent = `${STOREYS_PER_SECOND[interval]} storeys`;
    }
}

function animateDerivation() {
    const steps = document.querySelectorAll('.deriv-step');

    steps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
        }, index * 400);
    });
}

// ============================================
// Controls
// ============================================
function setupControls() {
    // Play button
    document.getElementById('play-btn').addEventListener('click', () => {
        if (state.currentTime >= CONFIG.physics.totalTime) {
            resetSimulation();
        }

        state.isPlaying = true;
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

    // Jump to last second button
    document.getElementById('last-second-btn').addEventListener('click', () => {
        state.isPlaying = false;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
        }

        // Set to start of last second
        state.currentTime = 3;
        state.ball.update(state.currentTime);

        // Mark previous intervals as complete
        for (let i = 1; i <= 3; i++) {
            state.completedIntervals.add(i);
            updateIntervalDisplay(i);
        }

        updateUI();
        render();

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    });

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.speed = parseFloat(btn.dataset.speed);
        });
    });

    // Quiz options
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
                feedback.innerHTML = '✅ Correct! Distance in nth second = ½g(2n-1). For n=4: 5×7 = 35m = 7 storeys';

                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Remember the pattern 1:3:5:7 for successive seconds!';
            }
        });
    });
}

function resetSimulation() {
    state.isPlaying = false;
    state.currentTime = 0;
    state.completedIntervals = new Set();

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    state.ball.reset();

    // Reset UI
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('derivation-panel').classList.remove('revealed');

    // Reset interval displays
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`interval-${i}`).textContent = '—';
    }

    // Reset derivation steps
    document.querySelectorAll('.deriv-step').forEach(step => {
        step.classList.remove('active');
    });

    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(b => {
        b.classList.remove('correct', 'wrong');
    });
    document.getElementById('quiz-feedback').classList.remove('show');

    updateUI();
    render();
}

// ============================================
// Initialization
// ============================================
function init() {
    initCanvas();
    state.ball = new FallingBall();
    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

document.addEventListener('DOMContentLoaded', init);
