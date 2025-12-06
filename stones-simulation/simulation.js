/**
 * Falling Stones Velocity Ratio Simulation
 * Heights h₁:h₂ = 2:3 (20m and 30m)
 * Answer: v₁:v₂ = √2:√3, so v₂:v₁ = √3:√2
 */

// ============================================
// Constants
// ============================================
const CONFIG = {
    physics: {
        g: 10,           // m/s²
        h1: 20,          // meters (2 units)
        h2: 30,          // meters (3 units)
    },
    colors: {
        stone1: '#4a90d9',
        stone2: '#e24a6f',
        trail1: 'rgba(74, 144, 217, 0.4)',
        trail2: 'rgba(226, 74, 111, 0.4)',
        ground: '#5d4037',
        sky: '#0f1530',
    }
};

// ============================================
// State
// ============================================
let state = {
    canvas: null,
    ctx: null,
    graphCanvas: null,
    graphCtx: null,
    isPlaying: false,
    speedMultiplier: 0.5,
    animationFrame: null,
    lastTimestamp: 0,
    simulation: null,
};

// ============================================
// FallingStonesSimulation Class
// ============================================
class FallingStonesSimulation {
    constructor() {
        this.stones = [
            {
                id: 1,
                name: 'Stone 1',
                color: CONFIG.colors.stone1,
                trailColor: CONFIG.colors.trail1,
                initialHeight: CONFIG.physics.h1,
                height: CONFIG.physics.h1,
                velocity: 0,
                time: 0,
                reachedGround: false,
                finalVelocity: null,
                fallTime: null,
                trail: [],
            },
            {
                id: 2,
                name: 'Stone 2',
                color: CONFIG.colors.stone2,
                trailColor: CONFIG.colors.trail2,
                initialHeight: CONFIG.physics.h2,
                height: CONFIG.physics.h2,
                velocity: 0,
                time: 0,
                reachedGround: false,
                finalVelocity: null,
                fallTime: null,
                trail: [],
            }
        ];

        this.time = 0;
        this.g = CONFIG.physics.g;

        // Calculate theoretical values
        this.calculateTheoreticalValues();
    }

    calculateTheoreticalValues() {
        this.stones.forEach(stone => {
            // Final velocity: v = √(2gh)
            stone.theoreticalFinalV = Math.sqrt(2 * this.g * stone.initialHeight);

            // Fall time: t = √(2h/g)
            stone.theoreticalFallTime = Math.sqrt(2 * stone.initialHeight / this.g);
        });

        // Velocity ratio
        this.theoreticalRatio = this.stones[0].theoreticalFinalV / this.stones[1].theoreticalFinalV;

        // This should equal √(h1/h2) = √(2/3)
        console.log('Theoretical v1/v2 =', this.theoreticalRatio.toFixed(4));
        console.log('√(2/3) =', Math.sqrt(2 / 3).toFixed(4));
        console.log('v2/v1 = √3/√2 =', Math.sqrt(3 / 2).toFixed(4));
    }

    update(deltaTime, speedMultiplier) {
        const scaledDelta = deltaTime * speedMultiplier;
        this.time += scaledDelta;

        this.stones.forEach(stone => {
            if (!stone.reachedGround) {
                // Update time
                stone.time += scaledDelta;

                // Update velocity: v = gt
                stone.velocity = this.g * stone.time;

                // Update height: h = h₀ - ½gt²
                stone.height = stone.initialHeight - 0.5 * this.g * stone.time * stone.time;

                // Check if reached ground
                if (stone.height <= 0) {
                    stone.height = 0;
                    stone.velocity = stone.theoreticalFinalV;
                    stone.reachedGround = true;
                    stone.finalVelocity = stone.velocity;
                    stone.fallTime = stone.time;
                }
            }
        });

        return this.stones.every(s => s.reachedGround);
    }

    getVelocityRatio() {
        if (this.stones[0].finalVelocity && this.stones[1].finalVelocity) {
            return this.stones[0].finalVelocity / this.stones[1].finalVelocity;
        }
        return null;
    }

    reset() {
        this.stones.forEach(stone => {
            stone.height = stone.initialHeight;
            stone.velocity = 0;
            stone.time = 0;
            stone.reachedGround = false;
            stone.finalVelocity = null;
            stone.fallTime = null;
            stone.trail = [];
        });
        this.time = 0;
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('fall-canvas');
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

    // Calculate scale: max height = 35m to give some headroom
    state.maxHeight = 35;
    state.scale = (state.canvasHeight - 80) / state.maxHeight;
    state.groundY = state.canvasHeight - 40;
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    const ctx = state.ctx;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    skyGradient.addColorStop(0, '#1a1f3c');
    skyGradient.addColorStop(0.6, '#0f1530');
    skyGradient.addColorStop(0.85, '#3d2817');
    skyGradient.addColorStop(1, '#5d4037');

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawGround() {
    const ctx = state.ctx;

    // Ground
    ctx.fillStyle = CONFIG.colors.ground;
    ctx.fillRect(0, state.groundY, state.canvasWidth, 40);

    // Ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(state.canvasWidth, state.groundY);
    ctx.stroke();

    // Ground label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ground (h = 0)', 10, state.groundY + 20);
}

function drawHeightMarkers() {
    const ctx = state.ctx;

    // Height markers
    const heights = [10, 20, 30];

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    heights.forEach(h => {
        const y = state.groundY - h * state.scale;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(state.canvasWidth, y);
        ctx.stroke();

        ctx.fillText(`${h}m`, state.canvasWidth - 10, y + 4);
    });

    ctx.setLineDash([]);

    // Height labels for stones
    const sim = state.simulation;

    // Stone 1 height marker (h₁ = 20m)
    const y1 = state.groundY - sim.stones[0].initialHeight * state.scale;
    ctx.fillStyle = CONFIG.colors.stone1;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('h₁ = 20m', state.canvasWidth * 0.3, y1 - 15);

    // Stone 2 height marker (h₂ = 30m)
    const y2 = state.groundY - sim.stones[1].initialHeight * state.scale;
    ctx.fillStyle = CONFIG.colors.stone2;
    ctx.fillText('h₂ = 30m', state.canvasWidth * 0.7, y2 - 15);
}

function drawStones() {
    const ctx = state.ctx;
    const sim = state.simulation;

    sim.stones.forEach((stone, index) => {
        const x = index === 0 ? state.canvasWidth * 0.3 : state.canvasWidth * 0.7;
        const y = state.groundY - stone.height * state.scale;

        // Add to trail
        if (stone.height > 0) {
            stone.trail.push({ x, y });
            if (stone.trail.length > 50) stone.trail.shift();
        }

        // Draw trail
        for (let i = 1; i < stone.trail.length; i++) {
            const alpha = i / stone.trail.length * 0.5;
            ctx.strokeStyle = stone.trailColor.replace('0.4', alpha.toString());
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(stone.trail[i - 1].x, stone.trail[i - 1].y);
            ctx.lineTo(stone.trail[i].x, stone.trail[i].y);
            ctx.stroke();
        }

        // Stone glow effect (simple approach using hex alpha)
        ctx.fillStyle = `${stone.color}40`;  // 25% opacity
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.fillStyle = `${stone.color}33`;  // 20% opacity
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Stone
        const stoneGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 12);
        stoneGradient.addColorStop(0, '#ffffff');
        stoneGradient.addColorStop(0.3, stone.color);
        stoneGradient.addColorStop(1, stone.color.replace(/[a-f0-9]{2}$/i, '88'));

        ctx.fillStyle = stone.color;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Stone highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector
        if (stone.velocity > 0) {
            const vectorLength = Math.min(stone.velocity * 2, 80);

            ctx.strokeStyle = stone.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y + 15);
            ctx.lineTo(x, y + 15 + vectorLength);
            ctx.stroke();

            // Arrowhead
            ctx.fillStyle = stone.color;
            ctx.beginPath();
            ctx.moveTo(x, y + 15 + vectorLength + 8);
            ctx.lineTo(x - 6, y + 15 + vectorLength);
            ctx.lineTo(x + 6, y + 15 + vectorLength);
            ctx.closePath();
            ctx.fill();
        }

        // Ground impact effect
        if (stone.reachedGround) {
            ctx.fillStyle = `${stone.color}44`;
            ctx.beginPath();
            ctx.ellipse(x, state.groundY, 30, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });
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
    const padding = 35;
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
    ctx.fillText('√h', w - padding, h - 8);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('v', 0, 0);
    ctx.restore();

    // Draw linear relationship v = k√h
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, padding);
    ctx.stroke();

    // Plot points for both stones
    const sim = state.simulation;
    const maxSqrtH = Math.sqrt(30);
    const maxV = sim.stones[1].theoreticalFinalV;

    sim.stones.forEach(stone => {
        const sqrtH = Math.sqrt(stone.initialHeight);
        const v = stone.theoreticalFinalV;

        const x = padding + (sqrtH / maxSqrtH) * graphW;
        const y = h - padding - (v / maxV) * graphH;

        ctx.fillStyle = stone.color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function render() {
    clearCanvas();
    drawGround();
    drawHeightMarkers();
    drawStones();
    drawGraph();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    const allLanded = state.simulation.update(deltaTime, state.speedMultiplier);

    updateUI();
    render();

    if (allLanded) {
        state.isPlaying = false;
        showFinalResults();
        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    } else {
        state.animationFrame = requestAnimationFrame(animate);
    }
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    const sim = state.simulation;

    // Time
    document.getElementById('time-display').textContent = sim.time.toFixed(2);

    // Stone 1
    document.getElementById('h1-current').textContent = sim.stones[0].height.toFixed(2) + ' m';
    document.getElementById('v1-current').textContent = sim.stones[0].velocity.toFixed(2) + ' m/s';

    if (sim.stones[0].reachedGround) {
        document.getElementById('v1-final').textContent = sim.stones[0].finalVelocity.toFixed(2) + ' m/s';
    }

    // Stone 2
    document.getElementById('h2-current').textContent = sim.stones[1].height.toFixed(2) + ' m';
    document.getElementById('v2-current').textContent = sim.stones[1].velocity.toFixed(2) + ' m/s';

    if (sim.stones[1].reachedGround) {
        document.getElementById('v2-final').textContent = sim.stones[1].finalVelocity.toFixed(2) + ' m/s';
    }

    // Velocity ratio
    if (sim.stones[0].velocity > 0 && sim.stones[1].velocity > 0) {
        const ratio = sim.stones[0].velocity / sim.stones[1].velocity;
        document.getElementById('velocity-ratio').textContent = ratio.toFixed(3) + ' : 1';
    }
}

function showFinalResults() {
    const sim = state.simulation;

    const v1 = sim.stones[0].finalVelocity;
    const v2 = sim.stones[1].finalVelocity;
    const ratio = v1 / v2;

    // Show final ratio as √2:√3
    document.getElementById('velocity-ratio').textContent = '√2 : √3';

    // Show derivation
    document.getElementById('derivation-panel').classList.add('revealed');
    animateDerivation();
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

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.speedMultiplier = parseFloat(btn.dataset.speed);
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
                feedback.innerHTML = '✅ Correct! v ∝ √h, so v₂:v₁ = √h₂:√h₁ = √3:√2';

                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Remember: v² = 2gh, so v ∝ √h, not linear!';
            }
        });
    });
}

function resetSimulation() {
    state.isPlaying = false;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    state.simulation.reset();

    // Reset UI
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('time-display').textContent = '0.00';
    document.getElementById('h1-current').textContent = '20.00 m';
    document.getElementById('h2-current').textContent = '30.00 m';
    document.getElementById('v1-current').textContent = '0.00 m/s';
    document.getElementById('v2-current').textContent = '0.00 m/s';
    document.getElementById('v1-final').textContent = '—';
    document.getElementById('v2-final').textContent = '—';
    document.getElementById('velocity-ratio').textContent = '? : ?';

    // Reset derivation
    document.getElementById('derivation-panel').classList.remove('revealed');
    document.querySelectorAll('.deriv-step').forEach(step => {
        step.classList.remove('active');
    });

    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(b => {
        b.classList.remove('correct', 'wrong');
    });
    document.getElementById('quiz-feedback').classList.remove('show');

    render();
}

// ============================================
// Initialization
// ============================================
function init() {
    initCanvas();
    state.simulation = new FallingStonesSimulation();
    setupControls();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log('Falling Stones Simulation initialized');
    console.log(`v₁ = √(2×10×20) = ${state.simulation.stones[0].theoreticalFinalV.toFixed(2)} m/s`);
    console.log(`v₂ = √(2×10×30) = ${state.simulation.stones[1].theoreticalFinalV.toFixed(2)} m/s`);
    console.log(`v₁:v₂ = √2:√3 = ${Math.sqrt(2).toFixed(4)}:${Math.sqrt(3).toFixed(4)}`);
}

document.addEventListener('DOMContentLoaded', init);
