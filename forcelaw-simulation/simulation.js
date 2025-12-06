/**
 * Custom Force Law Simulation
 * F ∝ R⁻⁵/² → T² ∝ R⁷/²
 * Shows orbital motion under non-Newtonian gravity
 */

// ============================================
// Constants
// ============================================
const CONFIG = {
    physics: {
        k: 1,               // Force constant
        m: 1,               // Planet mass
        forceExponent: -2.5, // F ∝ R^(-5/2)
        periodExponent: 3.5, // T² ∝ R^(7/2)
    },
    colors: {
        star: '#fff3b0',
        starGlow: '#ffa500',
        planet: '#4a90d9',
        planetGlow: 'rgba(74, 144, 217, 0.4)',
        orbit: 'rgba(255, 255, 255, 0.3)',
        trail: 'rgba(74, 144, 217, 0.4)',
        force: '#ff5252',
        velocity: '#00e676',
        radius: '#4a9eff',
    }
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    canvas: null,
    ctx: null,
    graphCanvas: null,
    graphCtx: null,
    animationFrame: null,
    lastTimestamp: 0,
    orbitalSystem: null,
    showVectors: true,
    showTrail: true,
    trail: [],
    dataPoints: [],     // For graph
};

// ============================================
// OrbitalSystem Class
// ============================================
class OrbitalSystem {
    constructor(initialRadius = 1) {
        this.R = initialRadius;
        this.angle = 0;
        this.time = 0;
        this.orbitCount = 0;
        this.updatePhysics();
    }

    // F = k / R^(5/2)
    calculateForce() {
        return CONFIG.physics.k / Math.pow(this.R, 2.5);
    }

    // From F = m(4π²/T²)R, solve for T
    // T² = m × 4π² × R / F = m × 4π² × R × R^(5/2) / k = (4π²m/k) × R^(7/2)
    calculatePeriod() {
        const force = this.calculateForce();
        const T_squared = (CONFIG.physics.m * 4 * Math.PI * Math.PI * this.R) / force;
        return Math.sqrt(T_squared);
    }

    // ω = 2π/T
    calculateAngularVelocity() {
        return 2 * Math.PI / this.period;
    }

    // v = ωR
    calculateVelocity() {
        return this.angularVelocity * this.R;
    }

    updatePhysics() {
        this.force = this.calculateForce();
        this.period = this.calculatePeriod();
        this.angularVelocity = this.calculateAngularVelocity();
        this.velocity = this.calculateVelocity();

        // Calculate T² and R^(7/2)
        this.T_squared = this.period * this.period;
        this.R_power = Math.pow(this.R, 3.5);
        this.ratio = this.T_squared / this.R_power;
    }

    update(deltaTime, speedMultiplier = 1) {
        const prevAngle = this.angle;
        this.time += deltaTime * speedMultiplier;
        this.angle += this.angularVelocity * deltaTime * speedMultiplier;

        // Count orbits
        if (this.angle >= 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
            this.orbitCount++;
        }

        return {
            x: this.R * Math.cos(this.angle),
            y: this.R * Math.sin(this.angle)
        };
    }

    setRadius(newRadius) {
        this.R = newRadius;
        this.updatePhysics();
    }

    getPosition() {
        return {
            x: this.R * Math.cos(this.angle),
            y: this.R * Math.sin(this.angle)
        };
    }

    reset() {
        this.angle = 0;
        this.time = 0;
        this.orbitCount = 0;
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('orbit-canvas');
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
    state.centerX = rect.width / 2;
    state.centerY = rect.height / 2;

    // Scale: how many pixels per unit radius
    state.scale = Math.min(rect.width, rect.height) / 8;
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawStars() {
    const ctx = state.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

    const seed = 42;
    for (let i = 0; i < 60; i++) {
        const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * state.canvasWidth;
        const y = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280 * state.canvasHeight;
        const size = ((seed * (i + 3) * 9301 + 49297) % 233280) / 233280 * 0.8 + 0.3;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStar() {
    const ctx = state.ctx;
    const cx = state.centerX;
    const cy = state.centerY;

    // Star glow layers
    for (let i = 4; i >= 0; i--) {
        const radius = 20 + i * 10;
        const alpha = 0.15 - i * 0.03;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(255, 200, 100, ${alpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Star core
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.3, CONFIG.colors.star);
    coreGradient.addColorStop(0.7, CONFIG.colors.starGlow);
    coreGradient.addColorStop(1, '#ff6b00');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();

    // Star label
    ctx.fillStyle = CONFIG.colors.star;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Star (M)', cx, cy + 35);
}

function drawOrbitPath() {
    const ctx = state.ctx;
    const R_pixels = state.orbitalSystem.R * state.scale;

    ctx.strokeStyle = CONFIG.colors.orbit;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, R_pixels, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawTrail() {
    if (!state.showTrail || state.trail.length < 2) return;

    const ctx = state.ctx;

    for (let i = 1; i < state.trail.length; i++) {
        const alpha = i / state.trail.length * 0.7;
        ctx.strokeStyle = `rgba(74, 144, 217, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            state.centerX + state.trail[i - 1].x * state.scale,
            state.centerY - state.trail[i - 1].y * state.scale
        );
        ctx.lineTo(
            state.centerX + state.trail[i].x * state.scale,
            state.centerY - state.trail[i].y * state.scale
        );
        ctx.stroke();
    }
}

function drawPlanet() {
    const ctx = state.ctx;
    const pos = state.orbitalSystem.getPosition();
    const px = state.centerX + pos.x * state.scale;
    const py = state.centerY - pos.y * state.scale;

    // Planet glow
    const glowGradient = ctx.createRadialGradient(px, py, 0, px, py, 20);
    glowGradient.addColorStop(0, CONFIG.colors.planetGlow);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.fill();

    // Planet
    const planetGradient = ctx.createRadialGradient(px - 3, py - 3, 0, px, py, 10);
    planetGradient.addColorStop(0, '#6db3f2');
    planetGradient.addColorStop(1, CONFIG.colors.planet);
    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();

    // Planet label
    ctx.fillStyle = CONFIG.colors.planet;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Planet (m)', px, py + 22);
}

function drawVectors() {
    if (!state.showVectors) return;

    const ctx = state.ctx;
    const system = state.orbitalSystem;
    const pos = system.getPosition();
    const px = state.centerX + pos.x * state.scale;
    const py = state.centerY - pos.y * state.scale;

    // Radius line
    ctx.strokeStyle = CONFIG.colors.radius;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(state.centerX, state.centerY);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // R label
    const midX = (state.centerX + px) / 2;
    const midY = (state.centerY + py) / 2;
    ctx.fillStyle = CONFIG.colors.radius;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R', midX + 12, midY);

    // Force vector (toward star)
    const forceLen = 40;
    const angle = system.angle;
    const fx = -Math.cos(angle) * forceLen;
    const fy = Math.sin(angle) * forceLen;

    drawArrow(ctx, px, py, px + fx, py + fy, CONFIG.colors.force, 'F');

    // Velocity vector (tangent)
    const velLen = 35;
    const vx = -Math.sin(angle) * velLen;
    const vy = -Math.cos(angle) * velLen;

    drawArrow(ctx, px, py, px + vx, py + vy, CONFIG.colors.velocity, 'v');
}

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 8;

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x2 + (x2 - x1) * 0.3, y2 + (y2 - y1) * 0.3);
}

function drawForceLabel() {
    const ctx = state.ctx;

    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F ∝ R⁻⁵/²', state.centerX, state.canvasHeight - 20);
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
    ctx.fillText('R⁷/²', w - padding, h - 10);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('T²', 0, 0);
    ctx.restore();

    // Draw theoretical line (T² = constant × R^(7/2))
    const maxR = 3;
    const maxRPower = Math.pow(maxR, 3.5);
    const ratio = state.orbitalSystem.ratio;
    const maxT2 = ratio * maxRPower;

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let r = 0.5; r <= maxR; r += 0.1) {
        const rPower = Math.pow(r, 3.5);
        const t2 = ratio * rPower;
        const x = padding + (rPower / maxRPower) * graphW;
        const y = h - padding - (t2 / maxT2) * graphH;
        if (r === 0.5) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Plot data points
    state.dataPoints.forEach((pt, i) => {
        const x = padding + (pt.rPower / maxRPower) * graphW;
        const y = h - padding - (pt.t2 / maxT2) * graphH;

        ctx.fillStyle = `rgba(74, 158, 255, ${0.5 + i * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Current point
    const currentRPower = state.orbitalSystem.R_power;
    const currentT2 = state.orbitalSystem.T_squared;
    const cx = padding + (currentRPower / maxRPower) * graphW;
    const cy = h - padding - (currentT2 / maxT2) * graphH;

    ctx.fillStyle = CONFIG.colors.star;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
}

function render() {
    clearCanvas();
    drawStars();
    drawOrbitPath();
    drawTrail();
    drawStar();
    drawPlanet();
    drawVectors();
    drawForceLabel();
    drawGraph();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    // Update orbital system
    const pos = state.orbitalSystem.update(deltaTime, 1);

    // Update trail
    state.trail.push({ x: pos.x, y: pos.y });
    if (state.trail.length > 150) {
        state.trail.shift();
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
    const system = state.orbitalSystem;

    // Stats
    document.getElementById('radius-display').textContent = system.R.toFixed(2);
    document.getElementById('period-display').textContent = system.period.toFixed(2);
    document.getElementById('orbit-time').textContent = `${system.time.toFixed(1)}s`;

    // Physics data
    document.getElementById('force-value').textContent = system.force.toFixed(3);
    document.getElementById('t-squared').textContent = system.T_squared.toFixed(3);
    document.getElementById('r-power').textContent = system.R_power.toFixed(3);
    document.getElementById('ratio-value').textContent = system.ratio.toFixed(3);
}

function addDataPoint() {
    const system = state.orbitalSystem;
    state.dataPoints.push({
        r: system.R,
        rPower: system.R_power,
        t2: system.T_squared
    });

    // Keep only last 10 points
    if (state.dataPoints.length > 10) {
        state.dataPoints.shift();
    }
}

// ============================================
// Controls
// ============================================
function setupControls() {
    // Play button
    document.getElementById('play-btn').addEventListener('click', () => {
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

    // Derive button
    document.getElementById('derive-btn').addEventListener('click', () => {
        document.getElementById('derivation-panel').classList.add('revealed');
        animateDerivation();
    });

    // Radius slider
    document.getElementById('radius-slider').addEventListener('input', (e) => {
        const radius = parseFloat(e.target.value);
        document.getElementById('radius-value').textContent = radius.toFixed(1);

        state.orbitalSystem.setRadius(radius);
        state.trail = [];
        addDataPoint();

        updateUI();
        render();
    });

    // Toggle vectors
    document.getElementById('show-vectors').addEventListener('change', (e) => {
        state.showVectors = e.target.checked;
        render();
    });

    // Toggle trail
    document.getElementById('show-trail').addEventListener('change', (e) => {
        state.showTrail = e.target.checked;
        render();
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
                feedback.innerHTML = '✅ Correct! For F ∝ R⁻ⁿ, we get T² ∝ Rⁿ⁺¹. With n=5/2, T² ∝ R⁷/²';

                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Hint: Set F_centripetal = F_gravity and solve for T²';
            }
        });
    });
}

function animateDerivation() {
    const steps = document.querySelectorAll('.deriv-step');

    steps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
        }, index * 500);
    });
}

function resetSimulation() {
    state.isPlaying = false;
    state.trail = [];
    state.dataPoints = [];

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    // Reset slider
    document.getElementById('radius-slider').value = 1;
    document.getElementById('radius-value').textContent = '1.0';

    // Reset orbital system
    state.orbitalSystem = new OrbitalSystem(1);
    addDataPoint();

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
    state.orbitalSystem = new OrbitalSystem(1);
    addDataPoint();
    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

document.addEventListener('DOMContentLoaded', init);
