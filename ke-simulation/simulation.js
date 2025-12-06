/**
 * KE Reduction Simulation
 * Body thrown upward: v₀ = 4 m/s, g = 10 m/s²
 * Find height where KE = ½KE₀ (Answer: 0.4 m)
 */

// ============================================
// Constants
// ============================================
const CONFIG = {
    physics: {
        g: 10,           // m/s²
        v0: 4,           // initial velocity m/s
        mass: 1,         // kg (cancels out)
    },
    colors: {
        ball: '#ff5252',
        ballGlow: 'rgba(255, 82, 82, 0.4)',
        ground: '#3d5a4d',
        sky: '#1a2025',
        trail: 'rgba(255, 159, 28, 0.3)',
        ke: '#ff9f1c',
        pe: '#00e676',
        total: '#4a9eff',
        target: '#ff5252',
        velocity: '#00e676',
    }
};

// Pre-calculate key values
const KE0 = 0.5 * CONFIG.physics.mass * CONFIG.physics.v0 * CONFIG.physics.v0;  // 8 J
const TARGET_KE = KE0 / 2;  // 4 J
const TARGET_HEIGHT = 0.4;  // m
const MAX_HEIGHT = CONFIG.physics.v0 * CONFIG.physics.v0 / (2 * CONFIG.physics.g);  // 0.8 m

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    speed: 0.5,
    canvas: null,
    ctx: null,
    graphCanvas: null,
    graphCtx: null,
    animationFrame: null,
    lastTimestamp: 0,
    projectile: null,
    trail: [],
    reachedTarget: false,
    passedTarget: false,
};

// ============================================
// Projectile Class
// ============================================
class Projectile {
    constructor() {
        this.reset();
    }

    reset() {
        this.y = 0;
        this.v = CONFIG.physics.v0;
        this.time = 0;
        this.ascending = true;
        this.finished = false;

        // Energy values
        this.KE = KE0;
        this.PE = 0;
        this.totalE = KE0;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.time += deltaTime;

        // Kinematics
        this.v = CONFIG.physics.v0 - CONFIG.physics.g * this.time;
        this.y = CONFIG.physics.v0 * this.time - 0.5 * CONFIG.physics.g * this.time * this.time;

        this.ascending = this.v > 0;

        // Energy
        this.KE = 0.5 * CONFIG.physics.mass * this.v * this.v;
        this.PE = CONFIG.physics.mass * CONFIG.physics.g * this.y;

        // Check if back to ground (completed one full trajectory)
        if (this.y <= 0 && this.time > 0.1) {
            this.y = 0;
            this.v = CONFIG.physics.v0;
            this.KE = KE0;
            this.PE = 0;
            this.finished = true;
        }
    }

    getKERatio() {
        return this.KE / KE0;
    }

    // Time when KE = ½KE₀
    static getTargetTime() {
        // v² = v₀²/2 => v = v₀/√2
        const targetV = CONFIG.physics.v0 / Math.sqrt(2);
        // v = v₀ - gt => t = (v₀ - v)/g
        return (CONFIG.physics.v0 - targetV) / CONFIG.physics.g;
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('motion-canvas');
    state.ctx = state.canvas.getContext('2d');

    state.graphCanvas = document.getElementById('graph-canvas');
    state.graphCtx = state.graphCanvas.getContext('2d');

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

    // Ground at bottom 15%
    state.groundY = state.canvasHeight * 0.85;

    // Scale: pixels per meter (0.8m max height should use ~70% of canvas above ground)
    state.scale = (state.groundY - 50) / (MAX_HEIGHT * 1.2);

    // Ball X position
    state.ballX = state.canvasWidth / 2;
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
    const skyGradient = ctx.createLinearGradient(0, 0, 0, state.groundY);
    skyGradient.addColorStop(0, '#0f1419');
    skyGradient.addColorStop(0.5, '#1a2025');
    skyGradient.addColorStop(1, '#2a3035');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.groundY);

    // Ground
    ctx.fillStyle = CONFIG.colors.ground;
    ctx.fillRect(0, state.groundY, state.canvasWidth, state.canvasHeight - state.groundY);

    // Ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(state.canvasWidth, state.groundY);
    ctx.stroke();
}

function drawHeightScale() {
    const ctx = state.ctx;
    const scaleX = state.canvasWidth * 0.15;

    // Scale line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scaleX, state.groundY);
    ctx.lineTo(scaleX, state.groundY - MAX_HEIGHT * state.scale - 30);
    ctx.stroke();

    // Height markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';

    for (let h = 0; h <= 0.8; h += 0.2) {
        const y = state.groundY - h * state.scale;

        // Tick
        ctx.beginPath();
        ctx.moveTo(scaleX - 5, y);
        ctx.lineTo(scaleX + 5, y);
        ctx.stroke();

        // Label
        ctx.fillText(`${h.toFixed(1)}m`, scaleX - 10, y + 3);
    }

    // Target height marker (0.4m)
    const targetY = state.groundY - TARGET_HEIGHT * state.scale;
    ctx.strokeStyle = CONFIG.colors.target;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(scaleX + 10, targetY);
    ctx.lineTo(state.canvasWidth * 0.85, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target label
    ctx.fillStyle = CONFIG.colors.target;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('h = 0.4m (KE = ½KE₀)', state.canvasWidth * 0.6, targetY - 8);

    // Max height marker
    const maxY = state.groundY - MAX_HEIGHT * state.scale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(scaleX + 10, maxY);
    ctx.lineTo(state.canvasWidth * 0.85, maxY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('h_max = 0.8m (KE = 0)', state.canvasWidth * 0.6, maxY - 8);
}

function drawTrail() {
    if (state.trail.length < 2) return;

    const ctx = state.ctx;

    for (let i = 1; i < state.trail.length; i++) {
        const alpha = i / state.trail.length * 0.6;
        ctx.strokeStyle = `rgba(255, 159, 28, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.trail[i - 1].x, state.trail[i - 1].y);
        ctx.lineTo(state.trail[i].x, state.trail[i].y);
        ctx.stroke();
    }
}

function drawBall() {
    const ctx = state.ctx;
    const proj = state.projectile;

    const x = state.ballX;
    const y = state.groundY - proj.y * state.scale;

    // Glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    glowGradient.addColorStop(0, CONFIG.colors.ballGlow);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    const ballGradient = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, 15);
    ballGradient.addColorStop(0, '#ff8a80');
    ballGradient.addColorStop(1, CONFIG.colors.ball);
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Velocity arrow
    if (Math.abs(proj.v) > 0.1) {
        const arrowLen = Math.abs(proj.v) * 10;
        const arrowDir = proj.v > 0 ? -1 : 1;  // Up is negative y

        ctx.strokeStyle = CONFIG.colors.velocity;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + arrowDir * arrowLen);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = CONFIG.colors.velocity;
        ctx.beginPath();
        ctx.moveTo(x, y + arrowDir * arrowLen);
        ctx.lineTo(x - 6, y + arrowDir * (arrowLen - 10));
        ctx.lineTo(x + 6, y + arrowDir * (arrowLen - 10));
        ctx.closePath();
        ctx.fill();

        // Velocity label
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`v = ${Math.abs(proj.v).toFixed(2)} m/s`, x + 25, y);
    }

    // Height label
    ctx.fillStyle = CONFIG.colors.ke;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`h = ${proj.y.toFixed(2)} m`, x - 25, y);

    return { x, y };
}

function drawEnergyInfo() {
    const ctx = state.ctx;
    const proj = state.projectile;

    // Energy legend in bottom right
    const x = state.canvasWidth - 20;
    const y = state.groundY - 30;

    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';

    ctx.fillStyle = CONFIG.colors.ke;
    ctx.fillText(`KE = ${proj.KE.toFixed(2)} J`, x, y - 30);

    ctx.fillStyle = CONFIG.colors.pe;
    ctx.fillText(`PE = ${proj.PE.toFixed(2)} J`, x, y - 15);

    ctx.fillStyle = CONFIG.colors.total;
    ctx.fillText(`E = ${proj.totalE.toFixed(2)} J`, x, y);
}

function drawGraph() {
    const ctx = state.graphCtx;
    const w = state.graphCanvas.width;
    const h = state.graphCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Axes
    const padding = 30;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Height (m)', w / 2, h - 5);
    ctx.save();
    ctx.translate(10, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energy (J)', 0, 0);
    ctx.restore();

    // Draw curves
    const maxH = MAX_HEIGHT;
    const maxE = KE0;

    // Total energy line
    ctx.strokeStyle = CONFIG.colors.total;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding - (KE0 / maxE) * graphH);
    ctx.lineTo(w - padding, h - padding - (KE0 / maxE) * graphH);
    ctx.stroke();

    // KE curve (decreasing parabola)
    ctx.strokeStyle = CONFIG.colors.ke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let ht = 0; ht <= maxH; ht += 0.02) {
        const ke = KE0 - CONFIG.physics.mass * CONFIG.physics.g * ht;
        const x = padding + (ht / maxH) * graphW;
        const y = h - padding - (ke / maxE) * graphH;
        if (ht === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // PE curve (linear increase)
    ctx.strokeStyle = CONFIG.colors.pe;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let ht = 0; ht <= maxH; ht += 0.02) {
        const pe = CONFIG.physics.mass * CONFIG.physics.g * ht;
        const x = padding + (ht / maxH) * graphW;
        const y = h - padding - (pe / maxE) * graphH;
        if (ht === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Target point (h=0.4, KE=4)
    const targetX = padding + (TARGET_HEIGHT / maxH) * graphW;
    const targetY = h - padding - (TARGET_KE / maxE) * graphH;

    ctx.fillStyle = CONFIG.colors.target;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Current point
    if (state.projectile) {
        const currX = padding + (state.projectile.y / maxH) * graphW;
        const currKEY = h - padding - (state.projectile.KE / maxE) * graphH;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(currX, currKEY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function render() {
    clearCanvas();
    drawBackground();
    drawHeightScale();
    drawTrail();
    const ballPos = drawBall();
    drawEnergyInfo();
    drawGraph();

    // Update trail
    if (state.isPlaying && ballPos) {
        state.trail.push(ballPos);
        if (state.trail.length > 60) {
            state.trail.shift();
        }
    }
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    // Update projectile
    state.projectile.update(deltaTime * state.speed);

    // Check if reached target
    const keRatio = state.projectile.getKERatio();
    if (!state.passedTarget && keRatio <= 0.5 && state.projectile.ascending) {
        state.passedTarget = true;
        state.reachedTarget = true;
    }

    // Check if finished
    if (state.projectile.finished) {
        state.isPlaying = false;
        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        // Show derivation
        document.getElementById('derivation-panel').classList.add('revealed');
        animateDerivation();
    }

    // Update UI
    updateUI();
    render();

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    const proj = state.projectile;

    // Stats
    document.getElementById('height-display').textContent = `${proj.y.toFixed(2)} m`;
    document.getElementById('velocity-display').textContent = `${proj.v.toFixed(2)} m/s`;
    document.getElementById('time-display').textContent = `${proj.time.toFixed(2)} s`;

    // Energy values
    document.getElementById('ke-value').textContent = `${proj.KE.toFixed(2)} J`;
    document.getElementById('pe-value').textContent = `${proj.PE.toFixed(2)} J`;
    document.getElementById('total-value').textContent = `${proj.totalE.toFixed(2)} J`;

    // Energy bars
    const kePercent = (proj.KE / KE0) * 100;
    const pePercent = (proj.PE / KE0) * 100;
    document.getElementById('ke-bar').style.width = `${kePercent}%`;
    document.getElementById('pe-bar').style.width = `${pePercent}%`;

    // KE ratio
    const ratio = proj.getKERatio();
    document.getElementById('ke-ratio').textContent = ratio.toFixed(2);

    // Highlight when at target
    const ratioEl = document.getElementById('ke-ratio');
    if (Math.abs(ratio - 0.5) < 0.05) {
        ratioEl.style.color = '#ff5252';
        ratioEl.style.textShadow = '0 0 10px rgba(255, 82, 82, 0.5)';
    } else {
        ratioEl.style.color = '#ff9f1c';
        ratioEl.style.textShadow = 'none';
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
        if (state.projectile.finished) {
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

    // Jump to target button
    document.getElementById('target-btn').addEventListener('click', () => {
        state.isPlaying = false;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
        }

        // Set projectile to target state
        const targetTime = Projectile.getTargetTime();
        state.projectile.time = targetTime;
        state.projectile.y = TARGET_HEIGHT;
        state.projectile.v = CONFIG.physics.v0 / Math.sqrt(2);
        state.projectile.KE = TARGET_KE;
        state.projectile.PE = CONFIG.physics.mass * CONFIG.physics.g * TARGET_HEIGHT;

        state.reachedTarget = true;
        state.passedTarget = true;

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        // Show derivation
        document.getElementById('derivation-panel').classList.add('revealed');
        animateDerivation();

        updateUI();
        render();
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
                feedback.innerHTML = '✅ Correct! Energy conservation: KE₀ = KE + PE → 8m = 4m + mgh → h = 0.4m';

                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Use energy conservation: KE₀ = KE + mgh';
            }
        });
    });
}

function resetSimulation() {
    state.isPlaying = false;
    state.trail = [];
    state.reachedTarget = false;
    state.passedTarget = false;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    state.projectile.reset();

    // Reset UI
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('derivation-panel').classList.remove('revealed');

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
    state.projectile = new Projectile();
    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

document.addEventListener('DOMContentLoaded', init);
