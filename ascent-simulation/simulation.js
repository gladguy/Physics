/**
 * Last 't' Seconds of Ascent Simulation
 * Ball thrown upward with speed u
 * Distance in last t seconds = ½gt² (using symmetry principle)
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        u: 20,        // Initial velocity (m/s)
        g: 10,        // Gravity (m/s²)
        tLast: 1,     // Last t seconds to analyze
    },
    colors: {
        ball: '#ff9f1c',
        ascent: '#4a9eff',
        descent: '#00e676',
        interval: '#ff5252',
        trail: 'rgba(255, 159, 28, 0.4)',
        ground: '#2d3436',
        maxHeight: '#ffd700',
    }
};

// ============================================
// State
// ============================================
let state = {
    canvas: null,
    ctx: null,
    symmetryCanvas: null,
    symmetryCtx: null,
    isPlaying: false,
    speedMultiplier: 0.5,
    animationFrame: null,
    lastTimestamp: 0,
    simulation: null,
    showSymmetry: false,
};

// ============================================
// BallThrowSimulation Class
// ============================================
class BallThrowSimulation {
    constructor() {
        this.u = CONFIG.physics.u;
        this.g = CONFIG.physics.g;
        this.tLast = CONFIG.physics.tLast;

        this.reset();
        this.calculateTheoreticalValues();
    }

    calculateTheoreticalValues() {
        // Total ascent time T = u/g
        this.totalAscentTime = this.u / this.g;

        // Max height = u²/2g
        this.maxHeight = (this.u * this.u) / (2 * this.g);

        // Last t seconds interval
        this.intervalStart = Math.max(0, this.totalAscentTime - this.tLast);
        this.intervalEnd = this.totalAscentTime;

        // Height at start of interval
        const tStart = this.intervalStart;
        this.heightAtIntervalStart = this.u * tStart - 0.5 * this.g * tStart * tStart;

        // Distance in last t seconds = ½gt²
        this.theoreticalDistance = 0.5 * this.g * this.tLast * this.tLast;

        // Actual distance from height difference
        this.actualIntervalDistance = this.maxHeight - this.heightAtIntervalStart;

        console.log(`T = u/g = ${this.u}/${this.g} = ${this.totalAscentTime.toFixed(2)}s`);
        console.log(`Max height = ${this.maxHeight.toFixed(2)}m`);
        console.log(`Interval: ${this.intervalStart.toFixed(2)}s to ${this.intervalEnd.toFixed(2)}s`);
        console.log(`Distance (theory) = ½gt² = ${this.theoreticalDistance.toFixed(2)}m`);
        console.log(`Distance (actual) = ${this.actualIntervalDistance.toFixed(2)}m`);
    }

    reset() {
        this.time = 0;
        this.height = 0;
        this.velocity = this.u;
        this.phase = 'ascending';
        this.inInterval = false;
        this.trail = [];
        this.intervalPositions = [];
        this.completed = false;

        // For symmetry demonstration
        this.symmetryTime = 0;
        this.symmetryHeight = 0;
    }

    update(deltaTime, speedMultiplier) {
        const scaledDelta = deltaTime * speedMultiplier;

        if (this.phase === 'ascending') {
            this.time += scaledDelta;

            // Update velocity: v = u - gt
            this.velocity = this.u - this.g * this.time;

            // Update height: h = ut - ½gt²
            this.height = this.u * this.time - 0.5 * this.g * this.time * this.time;

            // Check if in last t seconds interval
            if (this.time >= this.intervalStart && this.time <= this.intervalEnd) {
                this.inInterval = true;
                this.intervalPositions.push({ time: this.time, height: this.height });
            } else {
                this.inInterval = false;
            }

            // Add to trail
            this.trail.push({ height: this.height });
            if (this.trail.length > 100) this.trail.shift();

            // Check if reached max height
            if (this.time >= this.totalAscentTime) {
                this.phase = 'descending';
                this.time = 0;
                this.velocity = 0;
                this.height = this.maxHeight;
            }

        } else if (this.phase === 'descending') {
            this.time += scaledDelta;

            // Update velocity: v = -gt (negative = downward)
            this.velocity = -this.g * this.time;

            // Update height: h = h_max - ½gt²
            this.height = this.maxHeight - 0.5 * this.g * this.time * this.time;

            // Add to trail
            this.trail.push({ height: this.height });
            if (this.trail.length > 100) this.trail.shift();

            // Track first t seconds for symmetry comparison
            if (this.time <= this.tLast) {
                this.symmetryTime = this.time;
                this.symmetryHeight = this.maxHeight - this.height;
            }

            // Check if reached ground
            if (this.height <= 0) {
                this.height = 0;
                this.phase = 'complete';
                this.completed = true;
            }
        }

        return this.completed;
    }

    getCurrentPhaseLabel() {
        if (this.phase === 'ascending' && this.inInterval) {
            return 'In Last t Seconds!';
        }
        return this.phase.charAt(0).toUpperCase() + this.phase.slice(1);
    }

    getDisplayTime() {
        if (this.phase === 'ascending') {
            return this.time;
        } else if (this.phase === 'descending') {
            return this.totalAscentTime + this.time;
        }
        return this.totalAscentTime * 2;
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('motion-canvas');
    state.ctx = state.canvas.getContext('2d');

    state.symmetryCanvas = document.getElementById('symmetry-canvas');
    state.symmetryCtx = state.symmetryCanvas.getContext('2d');

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

    // Calculate scale
    const sim = state.simulation;
    if (sim) {
        state.maxDisplayHeight = sim.maxHeight * 1.3;
        state.scale = (state.canvasHeight - 100) / state.maxDisplayHeight;
        state.groundY = state.canvasHeight - 50;
    }
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    const ctx = state.ctx;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    gradient.addColorStop(0, '#1a2942');
    gradient.addColorStop(1, '#0f1a2e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawGround() {
    const ctx = state.ctx;

    // Ground
    ctx.fillStyle = CONFIG.colors.ground;
    ctx.fillRect(0, state.groundY, state.canvasWidth, 50);

    // Ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(state.canvasWidth, state.groundY);
    ctx.stroke();
}

function drawHeightMarkers() {
    const ctx = state.ctx;
    const sim = state.simulation;

    // Height grid
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    const heightStep = 5;
    for (let h = heightStep; h <= sim.maxHeight + 5; h += heightStep) {
        const y = state.groundY - h * state.scale;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(state.canvasWidth, y);
        ctx.stroke();

        ctx.fillText(`${h}m`, state.canvasWidth - 10, y + 4);
    }

    ctx.setLineDash([]);

    // Max height marker
    const maxY = state.groundY - sim.maxHeight * state.scale;
    ctx.strokeStyle = CONFIG.colors.maxHeight;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, maxY);
    ctx.lineTo(state.canvasWidth, maxY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = CONFIG.colors.maxHeight;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Max Height: ${sim.maxHeight.toFixed(1)}m`, 10, maxY - 5);

    // Interval height marker (height at interval start)
    const intervalY = state.groundY - sim.heightAtIntervalStart * state.scale;
    ctx.strokeStyle = CONFIG.colors.interval;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(state.canvasWidth * 0.4, intervalY);
    ctx.lineTo(state.canvasWidth * 0.8, intervalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = CONFIG.colors.interval;
    ctx.fillText(`Interval Start: ${sim.heightAtIntervalStart.toFixed(1)}m`, state.canvasWidth * 0.4, intervalY + 15);
}

function drawIntervalRegion() {
    const ctx = state.ctx;
    const sim = state.simulation;

    // Highlight the interval region
    const topY = state.groundY - sim.maxHeight * state.scale;
    const bottomY = state.groundY - sim.heightAtIntervalStart * state.scale;

    // Shaded region
    ctx.fillStyle = `${CONFIG.colors.interval}22`;
    ctx.fillRect(state.canvasWidth * 0.35, topY, state.canvasWidth * 0.3, bottomY - topY);

    // Border
    ctx.strokeStyle = CONFIG.colors.interval;
    ctx.lineWidth = 2;
    ctx.strokeRect(state.canvasWidth * 0.35, topY, state.canvasWidth * 0.3, bottomY - topY);

    // Distance label
    const midY = (topY + bottomY) / 2;
    ctx.fillStyle = CONFIG.colors.interval;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Distance = ${sim.theoreticalDistance.toFixed(1)}m`, state.canvasWidth * 0.5, midY);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`= ½gt² = ½×${sim.g}×${sim.tLast}²`, state.canvasWidth * 0.5, midY + 18);
}

function drawBall() {
    const ctx = state.ctx;
    const sim = state.simulation;

    const x = state.canvasWidth * 0.5;
    const y = state.groundY - sim.height * state.scale;

    // Trail
    ctx.strokeStyle = CONFIG.colors.trail;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < sim.trail.length; i++) {
        const trailY = state.groundY - sim.trail[i].height * state.scale;
        if (i === 0) {
            ctx.moveTo(x, trailY);
        } else {
            ctx.lineTo(x, trailY);
        }
    }
    ctx.stroke();

    // Ball glow
    ctx.fillStyle = `${CONFIG.colors.ball}44`;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    ctx.fillStyle = sim.inInterval ? CONFIG.colors.interval : CONFIG.colors.ball;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Ball highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Velocity vector
    if (Math.abs(sim.velocity) > 0.5) {
        const vectorLength = Math.min(Math.abs(sim.velocity) * 3, 80);
        const direction = sim.velocity > 0 ? -1 : 1; // Up is negative Y

        const color = sim.phase === 'ascending' ? CONFIG.colors.ascent : CONFIG.colors.descent;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + direction * vectorLength);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + direction * (vectorLength + 8));
        ctx.lineTo(x - 6, y + direction * vectorLength);
        ctx.lineTo(x + 6, y + direction * vectorLength);
        ctx.closePath();
        ctx.fill();
    }
}

function drawSymmetryCanvas() {
    const ctx = state.symmetryCtx;
    const w = state.symmetryCanvas.width;
    const h = state.symmetryCanvas.height;
    const sim = state.simulation;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Split into two halves
    const midX = w / 2;

    // Left: Last t seconds of ascent
    ctx.fillStyle = `${CONFIG.colors.ascent}22`;
    ctx.fillRect(0, 0, midX - 5, h);

    // Right: First t seconds of descent
    ctx.fillStyle = `${CONFIG.colors.descent}22`;
    ctx.fillRect(midX + 5, 0, midX - 5, h);

    // Labels
    ctx.fillStyle = CONFIG.colors.ascent;
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Ascent', midX / 2, 15);

    ctx.fillStyle = CONFIG.colors.descent;
    ctx.fillText('Descent', midX + midX / 2, 15);

    // Draw distance bars
    const maxBarHeight = h - 60;
    const barWidth = 40;
    const distance = sim.theoreticalDistance;
    const maxDist = sim.maxHeight;
    const barHeight = (distance / maxDist) * maxBarHeight;

    // Ascent bar
    ctx.fillStyle = CONFIG.colors.ascent;
    ctx.fillRect(midX / 2 - barWidth / 2, h - 30 - barHeight, barWidth, barHeight);

    // Descent bar
    ctx.fillStyle = CONFIG.colors.descent;
    ctx.fillRect(midX + midX / 2 - barWidth / 2, h - 30 - barHeight, barWidth, barHeight);

    // Distance value
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${distance.toFixed(1)}m`, midX / 2, h - 35 - barHeight);
    ctx.fillText(`${distance.toFixed(1)}m`, midX + midX / 2, h - 35 - barHeight);

    // Equal sign
    ctx.fillStyle = CONFIG.colors.maxHeight;
    ctx.font = 'bold 24px Inter';
    ctx.fillText('=', midX, h / 2);

    // Formula
    ctx.fillStyle = '#fff';
    ctx.font = '10px Inter';
    ctx.fillText('½gt²', midX / 2, h - 10);
    ctx.fillText('½gt²', midX + midX / 2, h - 10);
}

function render() {
    clearCanvas();
    drawGround();
    drawHeightMarkers();
    drawIntervalRegion();
    drawBall();
    drawSymmetryCanvas();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    const completed = state.simulation.update(deltaTime, state.speedMultiplier);

    updateUI();
    render();

    if (completed) {
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
    document.getElementById('time-display').textContent = sim.getDisplayTime().toFixed(2);

    // Phase indicator
    const phaseIndicator = document.getElementById('phase-indicator');
    phaseIndicator.textContent = sim.getCurrentPhaseLabel();
    phaseIndicator.className = 'phase-indicator';
    if (sim.phase === 'descending') {
        phaseIndicator.classList.add('descending');
    }
    if (sim.inInterval) {
        phaseIndicator.classList.add('in-interval');
    }

    // Parameters
    document.getElementById('u-value').textContent = `${sim.u} m/s`;
    document.getElementById('g-value').textContent = `${sim.g} m/s²`;
    document.getElementById('t-last-value').textContent = `${sim.tLast} s`;
    document.getElementById('T-value').textContent = `${sim.totalAscentTime.toFixed(2)} s`;
    document.getElementById('h-max-value').textContent = `${sim.maxHeight.toFixed(1)} m`;
}

function showFinalResults() {
    const sim = state.simulation;

    // Show result
    document.getElementById('distance-result').textContent = `½gt² = ${sim.theoreticalDistance.toFixed(1)} m`;
    document.getElementById('result-calc').innerHTML =
        `½ × ${sim.g} × ${sim.tLast}² = <strong>${sim.theoreticalDistance.toFixed(1)} m</strong>`;

    // Reveal derivation
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

    // Symmetry button
    document.getElementById('symmetry-btn').addEventListener('click', () => {
        state.showSymmetry = !state.showSymmetry;
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
                feedback.innerHTML = '✅ Correct! By symmetry, last t of ascent = first t of descent from rest = ½gt²';

                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Remember: Use symmetry! Last t seconds = First t seconds from rest at max height';
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
    document.getElementById('distance-result').textContent = '½gt² = ?';
    document.getElementById('result-calc').innerHTML = `½ × 10 × 1² = <strong>5 m</strong>`;

    const phaseIndicator = document.getElementById('phase-indicator');
    phaseIndicator.textContent = 'Ascending';
    phaseIndicator.className = 'phase-indicator';

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
    state.simulation = new BallThrowSimulation();
    initCanvas();
    setupControls();

    // Initial scale calculation
    state.maxDisplayHeight = state.simulation.maxHeight * 1.3;
    state.scale = (state.canvasHeight - 100) / state.maxDisplayHeight;
    state.groundY = state.canvasHeight - 50;

    render();
    updateUI();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log('Last t Seconds Simulation initialized');
    console.log(`Answer: ½gt² = ½ × ${state.simulation.g} × ${state.simulation.tLast}² = ${state.simulation.theoreticalDistance} m`);
}

document.addEventListener('DOMContentLoaded', init);
