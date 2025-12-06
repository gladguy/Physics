/**
 * Two Balls Dropped with Time Delay Simulation
 * Ball 1 dropped at t=0, Ball 2 at t=2s
 * Both hit ground at t=5s
 * Answer: Δh = 78.4m, h₁ = 122.5m
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        g: 9.8,             // Gravity (m/s²)
        totalTime: 5.0,     // Total simulation time
        ball1DropTime: 0,   // Ball 1 drop time
        ball2DropTime: 2.0, // Ball 2 drop time (2s delay)
    },
    colors: {
        ball1: '#4a9eff',
        ball2: '#ff5252',
        trail1: 'rgba(74, 158, 255, 0.4)',
        trail2: 'rgba(255, 82, 82, 0.4)',
        ground: '#3d2817',
    }
};

// ============================================
// State
// ============================================
let state = {
    canvas: null,
    ctx: null,
    isPlaying: false,
    speedMultiplier: 1,
    animationFrame: null,
    lastTimestamp: 0,
    simulation: null,
};

// ============================================
// DualBallSimulation Class
// ============================================
class DualBallSimulation {
    constructor() {
        this.g = CONFIG.physics.g;
        this.totalTime = CONFIG.physics.totalTime;

        // Calculate heights from physics
        // Ball 1: falls for 5s -> h₁ = ½g×5² = 122.5m
        // Ball 2: falls for 3s -> h₂ = ½g×3² = 44.1m
        this.ball1FallTime = 5.0;
        this.ball2FallTime = 3.0;

        this.ball1Height = 0.5 * this.g * this.ball1FallTime * this.ball1FallTime;  // 122.5m
        this.ball2Height = 0.5 * this.g * this.ball2FallTime * this.ball2FallTime;  // 44.1m
        this.heightDifference = this.ball1Height - this.ball2Height;  // 78.4m

        // Impact velocities
        this.ball1ImpactVelocity = this.g * this.ball1FallTime;  // 49 m/s
        this.ball2ImpactVelocity = this.g * this.ball2FallTime;  // 29.4 m/s

        this.balls = [
            {
                id: 1,
                color: CONFIG.colors.ball1,
                trailColor: CONFIG.colors.trail1,
                dropTime: 0,
                initialHeight: this.ball1Height,
                height: this.ball1Height,
                velocity: 0,
                falling: false,
                landed: false,
                trail: [],
                x: 0.35,  // Canvas position
            },
            {
                id: 2,
                color: CONFIG.colors.ball2,
                trailColor: CONFIG.colors.trail2,
                dropTime: 2.0,
                initialHeight: this.ball2Height,
                height: this.ball2Height,
                velocity: 0,
                falling: false,
                landed: false,
                trail: [],
                x: 0.65,  // Canvas position
            }
        ];

        this.time = 0;

        console.log('=== Dual Ball Simulation ===');
        console.log(`Ball 1: h = ${this.ball1Height.toFixed(1)}m (falls 5s)`);
        console.log(`Ball 2: h = ${this.ball2Height.toFixed(1)}m (falls 3s)`);
        console.log(`Δh = ${this.heightDifference.toFixed(1)}m`);
    }

    reset() {
        this.time = 0;

        this.balls.forEach(ball => {
            ball.height = ball.initialHeight;
            ball.velocity = 0;
            ball.falling = false;
            ball.landed = false;
            ball.trail = [];
        });
    }

    update(deltaTime, speedMultiplier) {
        const scaledDelta = deltaTime * speedMultiplier;
        this.time += scaledDelta;

        if (this.time > this.totalTime) {
            this.time = this.totalTime;
        }

        this.balls.forEach(ball => {
            if (this.time >= ball.dropTime && !ball.landed) {
                ball.falling = true;

                // Time since drop
                const fallTime = this.time - ball.dropTime;

                // Update height: h = h₀ - ½gt²
                ball.height = ball.initialHeight - 0.5 * this.g * fallTime * fallTime;

                // Update velocity: v = gt
                ball.velocity = this.g * fallTime;

                // Add to trail
                ball.trail.push({ height: ball.height });
                if (ball.trail.length > 60) ball.trail.shift();

                // Check if hit ground
                if (ball.height <= 0) {
                    ball.height = 0;
                    ball.landed = true;
                    ball.velocity = ball.id === 1 ? this.ball1ImpactVelocity : this.ball2ImpactVelocity;
                }
            }
        });

        // Check if simulation complete
        return this.balls.every(ball => ball.landed);
    }

    getTimeProgress() {
        return this.time / this.totalTime;
    }

    getBall1FallTime() {
        if (this.time < 0) return 0;
        return Math.min(this.time, this.ball1FallTime);
    }

    getBall2FallTime() {
        if (this.time < 2.0) return 0;
        return Math.min(this.time - 2.0, this.ball2FallTime);
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('animation-canvas');
    state.ctx = state.canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = state.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;
    state.canvas.width = rect.width * dpr;
    state.canvas.height = (rect.height - 50) * dpr;  // Account for timeline bar

    state.canvas.style.width = `${rect.width}px`;
    state.canvas.style.height = `${rect.height - 50}px`;

    state.ctx.scale(dpr, dpr);

    state.canvasWidth = rect.width;
    state.canvasHeight = rect.height - 50;

    // Calculate scale
    const sim = state.simulation;
    if (sim) {
        state.maxHeight = sim.ball1Height * 1.15;
        state.scale = (state.canvasHeight - 80) / state.maxHeight;
        state.groundY = state.canvasHeight - 40;
    }
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    const ctx = state.ctx;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    gradient.addColorStop(0, '#1b3a5c');
    gradient.addColorStop(0.8, '#0d1b2a');
    gradient.addColorStop(1, '#3d2817');

    ctx.fillStyle = gradient;
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
}

function drawHeightMarkers() {
    const ctx = state.ctx;
    const sim = state.simulation;

    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, sans-serif';

    // Height markers every 20m
    const heights = [0, 20, 40, 60, 80, 100, 120];

    heights.forEach(h => {
        const y = state.groundY - h * state.scale;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(state.canvasWidth, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'left';
        ctx.fillText(`${h}m`, 10, y + 4);
    });

    // Ball 1 initial height marker
    const y1 = state.groundY - sim.ball1Height * state.scale;
    ctx.strokeStyle = CONFIG.colors.ball1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.canvasWidth * 0.2, y1);
    ctx.lineTo(state.canvasWidth * 0.5, y1);
    ctx.stroke();

    ctx.fillStyle = CONFIG.colors.ball1;
    ctx.textAlign = 'center';
    ctx.fillText(`h₁ = ${sim.ball1Height.toFixed(1)}m`, state.canvasWidth * 0.35, y1 - 8);

    // Ball 2 initial height marker
    const y2 = state.groundY - sim.ball2Height * state.scale;
    ctx.strokeStyle = CONFIG.colors.ball2;
    ctx.beginPath();
    ctx.moveTo(state.canvasWidth * 0.5, y2);
    ctx.lineTo(state.canvasWidth * 0.8, y2);
    ctx.stroke();

    ctx.fillStyle = CONFIG.colors.ball2;
    ctx.fillText(`h₂ = ${sim.ball2Height.toFixed(1)}m`, state.canvasWidth * 0.65, y2 - 8);

    // Height difference
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(state.canvasWidth * 0.45, y1, state.canvasWidth * 0.1, y2 - y1);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px Inter';
    ctx.fillText(`Δh = ${sim.heightDifference.toFixed(1)}m`, state.canvasWidth * 0.5, (y1 + y2) / 2 + 4);

    ctx.setLineDash([]);
}

function drawBalls() {
    const ctx = state.ctx;
    const sim = state.simulation;

    sim.balls.forEach(ball => {
        const x = state.canvasWidth * ball.x;
        const y = state.groundY - ball.height * state.scale;

        // Trail
        if (ball.trail.length > 1) {
            ctx.strokeStyle = ball.trailColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < ball.trail.length; i++) {
                const trailY = state.groundY - ball.trail[i].height * state.scale;
                if (i === 0) {
                    ctx.moveTo(x, trailY);
                } else {
                    ctx.lineTo(x, trailY);
                }
            }
            ctx.stroke();
        }

        // Ball glow
        ctx.fillStyle = `${ball.color}44`;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Ball highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector
        if (ball.falling && !ball.landed && ball.velocity > 0.5) {
            const vectorLength = Math.min(ball.velocity * 1.5, 60);

            ctx.strokeStyle = ball.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + vectorLength);
            ctx.stroke();

            // Arrowhead
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.moveTo(x, y + vectorLength + 8);
            ctx.lineTo(x - 5, y + vectorLength);
            ctx.lineTo(x + 5, y + vectorLength);
            ctx.closePath();
            ctx.fill();
        }

        // Ball label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`Ball ${ball.id}`, x, y - 25);

        // Status label
        if (!ball.falling && sim.time < ball.dropTime) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '10px Inter';
            ctx.fillText('Waiting...', x, y + 35);
        } else if (ball.landed) {
            ctx.fillStyle = '#00e676';
            ctx.font = 'bold 10px Inter';
            ctx.fillText('LANDED!', x, y - 40);
        }
    });
}

function render() {
    clearCanvas();
    drawGround();
    drawHeightMarkers();
    drawBalls();
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

    // Time display
    document.getElementById('time-value').textContent = sim.time.toFixed(2);

    // Timeline progress
    const progress = sim.getTimeProgress() * 100;
    document.getElementById('timeline-progress').style.width = `${progress}%`;

    // Ball 1 data
    document.getElementById('fall-time-1').textContent = `${sim.getBall1FallTime().toFixed(1)}s`;
    document.getElementById('height-1').textContent = `${sim.balls[0].height.toFixed(1)}m`;
    document.getElementById('velocity-1').textContent = `${sim.balls[0].velocity.toFixed(1)} m/s`;

    // Ball 2 data
    document.getElementById('fall-time-2').textContent = `${sim.getBall2FallTime().toFixed(1)}s`;
    document.getElementById('height-2').textContent = `${sim.balls[1].height.toFixed(1)}m`;
    document.getElementById('velocity-2').textContent = `${sim.balls[1].velocity.toFixed(1)} m/s`;
}

function showFinalResults() {
    const sim = state.simulation;

    document.getElementById('result-diff').textContent = `${sim.heightDifference.toFixed(1)} m`;
    document.getElementById('result-h1').textContent = `${sim.ball1Height.toFixed(1)} m`;
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

    // Skip button
    document.getElementById('skip-btn').addEventListener('click', () => {
        state.simulation.time = 5.0;
        state.simulation.balls.forEach(ball => {
            ball.height = 0;
            ball.landed = true;
            ball.velocity = ball.id === 1 ? state.simulation.ball1ImpactVelocity : state.simulation.ball2ImpactVelocity;
        });
        updateUI();
        render();
        showFinalResults();
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
            const isCorrect = e.target.closest('.quiz-option').dataset.answer === 'correct';

            document.querySelectorAll('.quiz-option').forEach(b => {
                b.classList.remove('correct', 'wrong');
                if (b.dataset.answer === 'correct') {
                    b.classList.add('correct');
                } else if (b === e.target.closest('.quiz-option') && !isCorrect) {
                    b.classList.add('wrong');
                }
            });

            const feedback = document.getElementById('quiz-feedback');
            feedback.classList.add('show');

            if (isCorrect) {
                feedback.className = 'quiz-feedback show correct';
                feedback.innerHTML = '✅ Correct! h₁ = ½g×5² = 122.5m, h₂ = ½g×3² = 44.1m, Δh = 78.4m';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Use h = ½gt² with g=9.8. Ball 1 falls 5s, Ball 2 falls 3s.';
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
    document.getElementById('time-value').textContent = '0.00';
    document.getElementById('timeline-progress').style.width = '0%';
    document.getElementById('fall-time-1').textContent = '0.0s';
    document.getElementById('fall-time-2').textContent = '0.0s';
    document.getElementById('height-1').textContent = `${state.simulation.ball1Height.toFixed(1)}m`;
    document.getElementById('height-2').textContent = `${state.simulation.ball2Height.toFixed(1)}m`;
    document.getElementById('velocity-1').textContent = '0.0 m/s';
    document.getElementById('velocity-2').textContent = '0.0 m/s';

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
    state.simulation = new DualBallSimulation();
    initCanvas();
    setupControls();

    // Initial scale calculation
    state.maxHeight = state.simulation.ball1Height * 1.15;
    state.scale = (state.canvasHeight - 80) / state.maxHeight;
    state.groundY = state.canvasHeight - 40;

    render();
    updateUI();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log('Dual Ball Drop Simulation initialized');
    console.log(`Answer: Δh = ${state.simulation.heightDifference.toFixed(1)}m, h₁ = ${state.simulation.ball1Height.toFixed(1)}m`);
}

document.addEventListener('DOMContentLoaded', init);
