/**
 * Energy Wastage Percentage Simulation
 * Mason throws brick to 10m, arrives with v=6m/s
 * Find percentage energy wasted = 18/118 ≈ 15%
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        g: 10,              // Gravity (m/s²)
        targetHeight: 10,   // Target height (m)
        velocityAtTarget: 6, // Velocity at target height (m/s)
    },
    colors: {
        brick: '#c0392b',
        brickHighlight: '#e74c3c',
        mason: '#8b7355',
        ground: '#5d4037',
        sky: '#1a1520',
        trajectory: 'rgba(255, 159, 28, 0.5)',
        useful: '#4caf50',
        wasted: '#f44336',
    }
};

// ============================================
// State
// ============================================
let state = {
    canvas: null,
    ctx: null,
    isPlaying: false,
    speedMultiplier: 0.5,
    animationFrame: null,
    lastTimestamp: 0,
    simulation: null,
};

// ============================================
// BrickThrowSimulation Class
// ============================================
class BrickThrowSimulation {
    constructor() {
        this.g = CONFIG.physics.g;
        this.targetHeight = CONFIG.physics.targetHeight;
        this.velocityAtTarget = CONFIG.physics.velocityAtTarget;

        this.calculateEnergetics();
        this.reset();
    }

    calculateEnergetics() {
        // From energy conservation: ½mu₀² = ½mv² + mgh
        // u₀² = v² + 2gh
        this.initialVelocity = Math.sqrt(
            this.velocityAtTarget * this.velocityAtTarget +
            2 * this.g * this.targetHeight
        );

        // Energy at 10m (per unit mass)
        this.keAtTarget = 0.5 * this.velocityAtTarget * this.velocityAtTarget; // 18
        this.peAtTarget = this.g * this.targetHeight;  // 100
        this.totalEnergyAtTarget = this.keAtTarget + this.peAtTarget;  // 118

        // Ideal energy needed (v=0 at 10m)
        this.idealEnergy = this.peAtTarget;  // 100

        // Wasted energy
        this.wastedEnergy = this.totalEnergyAtTarget - this.idealEnergy;  // 18

        // Percentage wasted (wasted/total)
        this.wastePercentage = (this.wastedEnergy / this.totalEnergyAtTarget) * 100;  // ~15.25%

        // Alternative percentage (wasted/ideal)
        this.wastePercentageAlt = (this.wastedEnergy / this.idealEnergy) * 100;  // 18%

        // Additional analysis - if brick continued
        this.additionalHeight = (this.velocityAtTarget * this.velocityAtTarget) / (2 * this.g);  // 1.8m
        this.maxHeight = this.targetHeight + this.additionalHeight;  // 11.8m

        // Time calculations
        this.timeToTarget = (this.initialVelocity - this.velocityAtTarget) / this.g;
        this.timeToMax = this.initialVelocity / this.g;

        console.log('=== Energy Analysis ===');
        console.log(`Initial velocity: ${this.initialVelocity.toFixed(2)} m/s`);
        console.log(`At 10m: KE = ${this.keAtTarget}m, PE = ${this.peAtTarget}m, Total = ${this.totalEnergyAtTarget}m`);
        console.log(`Ideal energy: ${this.idealEnergy}m`);
        console.log(`Wasted: ${this.wastedEnergy}m`);
        console.log(`Waste %: ${this.wastePercentage.toFixed(2)}%`);
        console.log(`Max height: ${this.maxHeight.toFixed(2)}m`);
    }

    reset() {
        this.time = 0;
        this.height = 0;
        this.velocity = this.initialVelocity;
        this.phase = 'throwing';  // throwing, ascending, at_target, continuing, at_max, descending, landed
        this.reachedTarget = false;
        this.reachedMax = false;
        this.trail = [];
    }

    update(deltaTime, speedMultiplier) {
        const scaledDelta = deltaTime * speedMultiplier;
        this.time += scaledDelta;

        if (this.phase === 'throwing' && this.time > 0.3) {
            this.phase = 'ascending';
            this.time = 0;
        }

        if (this.phase === 'ascending' || this.phase === 'continuing') {
            // Update velocity and height
            this.velocity = this.initialVelocity - this.g * this.time;
            this.height = this.initialVelocity * this.time - 0.5 * this.g * this.time * this.time;

            // Add to trail
            this.trail.push({ height: this.height });
            if (this.trail.length > 80) this.trail.shift();

            // Check if reached target height
            if (this.height >= this.targetHeight && !this.reachedTarget) {
                this.reachedTarget = true;
                this.phase = 'at_target';
            }

            // Check if reached max height
            if (this.velocity <= 0) {
                this.phase = 'at_max';
                this.reachedMax = true;
                this.height = this.maxHeight;
                this.velocity = 0;
            }

        } else if (this.phase === 'at_target') {
            // Brief pause at target, then continue
            setTimeout(() => {
                if (this.phase === 'at_target') {
                    this.phase = 'continuing';
                }
            }, 500);

        } else if (this.phase === 'at_max') {
            // Brief pause at max
            setTimeout(() => {
                if (this.phase === 'at_max') {
                    this.phase = 'descending';
                    this.time = 0;
                }
            }, 800);

        } else if (this.phase === 'descending') {
            this.velocity = -this.g * this.time;
            this.height = this.maxHeight - 0.5 * this.g * this.time * this.time;

            // Add to trail
            this.trail.push({ height: this.height });
            if (this.trail.length > 80) this.trail.shift();

            if (this.height <= 0) {
                this.height = 0;
                this.phase = 'landed';
            }
        }

        // Update current energies
        this.currentKE = 0.5 * this.velocity * this.velocity;
        this.currentPE = this.g * Math.max(0, this.height);
        this.currentTotal = this.currentKE + this.currentPE;

        return this.phase === 'landed';
    }

    getDisplayVelocity() {
        return Math.abs(this.velocity);
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('scene-canvas');
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

    // Calculate scale
    const sim = state.simulation;
    if (sim) {
        state.maxDisplayHeight = sim.maxHeight * 1.3;
        state.scale = (state.canvasHeight - 120) / state.maxDisplayHeight;
        state.groundY = state.canvasHeight - 60;
    }
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    const ctx = state.ctx;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, state.canvasHeight);
    gradient.addColorStop(0, '#252030');
    gradient.addColorStop(0.6, '#1a1520');
    gradient.addColorStop(0.9, '#3d2817');
    gradient.addColorStop(1, '#5d4037');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawGround() {
    const ctx = state.ctx;

    // Ground
    ctx.fillStyle = CONFIG.colors.ground;
    ctx.fillRect(0, state.groundY, state.canvasWidth, 60);

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
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';

    // Target height (10m) - highlighted
    const targetY = state.groundY - sim.targetHeight * state.scale;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(state.canvasWidth, targetY);
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.fillText('Target: 10m', state.canvasWidth - 60, targetY + 4);

    // Max height (11.8m)
    const maxY = state.groundY - sim.maxHeight * state.scale;
    ctx.strokeStyle = 'rgba(244, 67, 54, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, maxY);
    ctx.lineTo(state.canvasWidth, maxY);
    ctx.stroke();

    ctx.fillStyle = '#f44336';
    ctx.fillText(`Max: ${sim.maxHeight.toFixed(1)}m`, state.canvasWidth - 60, maxY + 4);

    // Wasted height region
    ctx.fillStyle = 'rgba(244, 67, 54, 0.15)';
    ctx.fillRect(state.canvasWidth * 0.3, maxY, state.canvasWidth * 0.4, targetY - maxY);

    ctx.fillStyle = '#f44336';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Wasted: 1.8m', state.canvasWidth * 0.5, (maxY + targetY) / 2 + 4);

    ctx.setLineDash([]);
}

function drawMason() {
    const ctx = state.ctx;
    const x = state.canvasWidth * 0.15;
    const y = state.groundY;

    // Body
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x - 15, y - 60, 30, 40);

    // Head
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(x, y - 75, 15, 0, Math.PI * 2);
    ctx.fill();

    // Hard hat
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(x, y - 85, 18, 8, 0, 0, Math.PI, true);
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 50);
    ctx.lineTo(x + 35, y - 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 15, y - 50);
    ctx.lineTo(x - 30, y - 40);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x - 12, y - 20, 10, 20);
    ctx.fillRect(x + 2, y - 20, 10, 20);
}

function drawBrick() {
    const ctx = state.ctx;
    const sim = state.simulation;

    const x = state.canvasWidth * 0.5;
    const y = state.groundY - sim.height * state.scale;

    // Trail
    ctx.strokeStyle = CONFIG.colors.trajectory;
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

    // Brick glow
    if (sim.height >= sim.targetHeight - 1 && sim.height <= sim.targetHeight + 1) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Brick
    ctx.fillStyle = CONFIG.colors.brick;
    ctx.fillRect(x - 15, y - 10, 30, 20);

    // Brick detail
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 15, y - 10, 30, 20);
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();

    // Brick highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x - 13, y - 8, 8, 4);

    // Velocity vector
    if (sim.phase !== 'throwing' && sim.phase !== 'landed' && Math.abs(sim.velocity) > 0.5) {
        const vectorLength = Math.min(Math.abs(sim.velocity) * 3, 60);
        const direction = sim.velocity > 0 ? -1 : 1;

        const color = sim.velocity > 0 ? '#4caf50' : '#f44336';
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
        ctx.lineTo(x - 5, y + direction * vectorLength);
        ctx.lineTo(x + 5, y + direction * vectorLength);
        ctx.closePath();
        ctx.fill();

        // Velocity label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`v = ${Math.abs(sim.velocity).toFixed(1)} m/s`, x + 20, y + direction * vectorLength / 2);
    }

    // Special indicator at target height
    if (sim.reachedTarget && sim.height >= sim.targetHeight - 0.5) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('v = 6 m/s!', x + 25, y);
    }
}

function render() {
    clearCanvas();
    drawGround();
    drawHeightMarkers();
    drawMason();
    drawBrick();
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

    // Live data
    document.getElementById('height-display').textContent = sim.height.toFixed(1);
    document.getElementById('velocity-display').textContent = sim.getDisplayVelocity().toFixed(1);

    // Energy values (dynamically update during animation)
    if (sim.phase !== 'throwing') {
        document.getElementById('ke-value').textContent = `${sim.currentKE.toFixed(1)}m J`;
        document.getElementById('pe-value').textContent = `${sim.currentPE.toFixed(1)}m J`;
        document.getElementById('total-value').textContent = `${sim.currentTotal.toFixed(1)}m J`;
    }
}

function showFinalResults() {
    const sim = state.simulation;

    // Show final energy values at target
    document.getElementById('ke-value').textContent = `${sim.keAtTarget}m J`;
    document.getElementById('pe-value').textContent = `${sim.peAtTarget}m J`;
    document.getElementById('total-value').textContent = `${sim.totalEnergyAtTarget}m J`;
    document.getElementById('ideal-value').textContent = `${sim.idealEnergy}m J`;
    document.getElementById('wasted-value').textContent = `${sim.wastedEnergy}m J`;
    document.getElementById('percentage-result').textContent = `≈ ${sim.wastePercentage.toFixed(2)}%`;
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

    // Analyze button
    document.getElementById('analyze-btn').addEventListener('click', () => {
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
                feedback.innerHTML = '✅ Correct! Wasted/Total = 18m/118m ≈ 15.25% ≈ 15%';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Calculate: Wasted = 18m, Total = 118m, so 18/118 ≈ 15%';
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
    document.getElementById('height-display').textContent = '0.0';
    document.getElementById('velocity-display').textContent = state.simulation.initialVelocity.toFixed(1);
    document.getElementById('ke-value').textContent = '18m J';
    document.getElementById('pe-value').textContent = '100m J';
    document.getElementById('total-value').textContent = '118m J';
    document.getElementById('percentage-result').textContent = '≈ 15.25%';

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
    state.simulation = new BrickThrowSimulation();
    initCanvas();
    setupControls();

    // Initial scale calculation
    state.maxDisplayHeight = state.simulation.maxHeight * 1.3;
    state.scale = (state.canvasHeight - 120) / state.maxDisplayHeight;
    state.groundY = state.canvasHeight - 60;

    render();
    updateUI();

    // Show initial values
    document.getElementById('velocity-display').textContent = state.simulation.initialVelocity.toFixed(1);

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log('Energy Wastage Simulation initialized');
    console.log(`Answer: ${state.simulation.wastePercentage.toFixed(2)}% ≈ 15%`);
}

document.addEventListener('DOMContentLoaded', init);
