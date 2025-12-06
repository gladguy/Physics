/**
 * Coriolis Force - Train Weight Simulation
 * Shows how Earth's rotation affects apparent weight of trains at equator
 */

// ============================================
// Physical Constants
// ============================================
const CONSTANTS = {
    R_earth: 6.371e6,           // Earth radius (m)
    omega_earth: 7.2921159e-5,  // Earth angular velocity (rad/s)
    g: 9.8,                     // Gravity (m/s²)
    v_earth_equator: 465,       // Linear speed at equator (m/s)
    train_mass: 50000,          // Train mass (kg)
};

// ============================================
// Configuration
// ============================================
const CONFIG = {
    canvas: {
        earthRadius: 150,       // pixels for Earth display
        trainSize: 15,          // pixels
    },
    colors: {
        earth: '#4a90d9',
        earthDark: '#2d5a87',
        land: '#4caf50',
        equator: '#ffeb3b',
        trainA: '#ff5252',
        trainB: '#448aff',
        velocity: '#00e676',
        force: '#ff9f1c',
    }
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    trainSpeed: 30,             // m/s
    trainA: null,
    trainB: null,
    canvas: null,
    ctx: null,
    vectorCanvas: null,
    vectorCtx: null,
    animationFrame: null,
    lastTimestamp: 0,
    earthRotation: 0,
    showVectors: true,
    showForces: true,
    showExplanation: false,
};

// ============================================
// Train Class
// ============================================
class Train {
    constructor(name, direction, color) {
        this.name = name;
        this.direction = direction;  // +1 for eastward, -1 for westward
        this.color = color;
        this.position = direction > 0 ? 0 : Math.PI;  // Angular position on equator
        this.speed = state.trainSpeed;

        this.calculateForces();
    }

    calculateForces() {
        const v_earth = CONSTANTS.v_earth_equator;
        const v_train = this.speed * this.direction;
        const R = CONSTANTS.R_earth;
        const m = CONSTANTS.train_mass;
        const g = CONSTANTS.g;

        // Effective speed in inertial frame
        this.v_effective = v_earth + v_train;

        // Centrifugal acceleration = v²/R
        this.centrifugal_acc = Math.pow(this.v_effective, 2) / R;

        // Centrifugal force
        this.centrifugal_force = m * this.centrifugal_acc;

        // Weight
        this.weight = m * g;

        // Apparent weight (force on tracks) = Weight - Centrifugal
        this.apparent_weight = this.weight - this.centrifugal_force;
        this.force_on_tracks = this.apparent_weight;
    }

    update(deltaTime, animationSpeed) {
        // Update angular position
        const angularSpeed = (this.speed / CONSTANTS.R_earth) * this.direction * animationSpeed * 10000;
        this.position += angularSpeed * deltaTime;

        // Normalize
        if (this.position > 2 * Math.PI) this.position -= 2 * Math.PI;
        if (this.position < 0) this.position += 2 * Math.PI;
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        this.calculateForces();
    }

    getCanvasPosition(centerX, centerY, radius) {
        return {
            x: centerX + Math.cos(this.position) * radius,
            y: centerY - Math.sin(this.position) * radius * 0.3  // Perspective
        };
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('earth-canvas');
    state.ctx = state.canvas.getContext('2d');

    state.vectorCanvas = document.getElementById('vector-canvas');
    state.vectorCtx = state.vectorCanvas.getContext('2d');

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

    // Adjust Earth size
    CONFIG.canvas.earthRadius = Math.min(rect.width, rect.height) * 0.35;
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawStars() {
    const ctx = state.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    const seed = 42;
    for (let i = 0; i < 40; i++) {
        const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * state.canvasWidth;
        const y = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280 * state.canvasHeight;
        const size = ((seed * (i + 3) * 9301 + 49297) % 233280) / 233280 + 0.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEarth() {
    const ctx = state.ctx;
    const cx = state.centerX;
    const cy = state.centerY;
    const r = CONFIG.canvas.earthRadius;

    // Earth shadow side
    const earthGradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    earthGradient.addColorStop(0, '#6db3f2');
    earthGradient.addColorStop(0.6, CONFIG.colors.earth);
    earthGradient.addColorStop(1, CONFIG.colors.earthDark);

    ctx.fillStyle = earthGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Continents (simplified)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';

    // Rotate based on Earth rotation
    const offsetX = (state.earthRotation % (2 * Math.PI)) / (2 * Math.PI) * r * 2;

    // Simple continent shapes
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.3 - offsetX, cy - r * 0.2, r * 0.3, r * 0.4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + r * 0.4 - offsetX, cy + r * 0.1, r * 0.25, r * 0.3, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Equator line
    ctx.strokeStyle = CONFIG.colors.equator;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotation arrow
    drawEarthRotationArrow(cx, cy, r);

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Equator', cx, cy + r * 0.3 + 20);

    ctx.fillStyle = CONFIG.colors.equator;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('(Earth rotates East →)', cx, cy + r * 0.3 + 38);
}

function drawEarthRotationArrow(cx, cy, r) {
    const ctx = state.ctx;

    // Arrow showing eastward rotation
    const arrowY = cy - r - 25;
    const arrowLen = 50;

    ctx.strokeStyle = CONFIG.colors.velocity;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - arrowLen / 2, arrowY);
    ctx.lineTo(cx + arrowLen / 2, arrowY);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = CONFIG.colors.velocity;
    ctx.beginPath();
    ctx.moveTo(cx + arrowLen / 2, arrowY);
    ctx.lineTo(cx + arrowLen / 2 - 10, arrowY - 6);
    ctx.lineTo(cx + arrowLen / 2 - 10, arrowY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ω (East)', cx, arrowY - 12);
}

function drawTrain(train) {
    const ctx = state.ctx;
    const r = CONFIG.canvas.earthRadius;
    const pos = train.getCanvasPosition(state.centerX, state.centerY, r);

    // Train body
    ctx.fillStyle = train.color;
    ctx.beginPath();
    ctx.roundRect(pos.x - 20, pos.y - 8, 40, 16, 4);
    ctx.fill();

    // Windows
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(pos.x - 15, pos.y - 5, 8, 6);
    ctx.fillRect(pos.x - 3, pos.y - 5, 8, 6);
    ctx.fillRect(pos.x + 9, pos.y - 5, 8, 6);

    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(pos.x - 12, pos.y + 8, 4, 0, Math.PI * 2);
    ctx.arc(pos.x + 12, pos.y + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    if (state.showVectors) {
        const arrowDir = train.direction;
        const arrowLen = 35;
        const arrowX = pos.x + arrowDir * 30;

        ctx.strokeStyle = train.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(arrowX, pos.y);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = train.color;
        ctx.beginPath();
        ctx.moveTo(arrowX, pos.y);
        ctx.lineTo(arrowX - arrowDir * 8, pos.y - 5);
        ctx.lineTo(arrowX - arrowDir * 8, pos.y + 5);
        ctx.closePath();
        ctx.fill();
    }

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(train.name, pos.x, pos.y - 18);

    const dirLabel = train.direction > 0 ? '→ East' : '← West';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = train.color;
    ctx.fillText(dirLabel, pos.x, pos.y - 30);
}

function drawVectorDiagram() {
    const ctx = state.vectorCtx;
    const canvas = state.vectorCanvas;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!state.showForces) return;

    // Draw for both trains side by side
    drawTrainForceDiagram(ctx, 60, h / 2, state.trainA, 'A');
    drawTrainForceDiagram(ctx, 190, h / 2, state.trainB, 'B');
}

function drawTrainForceDiagram(ctx, cx, cy, train, label) {
    const scale = 80 / train.weight;  // Normalize to fit

    // Ground line
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy + 50);
    ctx.lineTo(cx + 40, cy + 50);
    ctx.stroke();

    // Train box
    ctx.fillStyle = train.color;
    ctx.fillRect(cx - 20, cy + 20, 40, 25);

    // Weight vector (down)
    const weightLen = train.weight * scale;
    drawVector(ctx, cx, cy + 45, cx, cy + 45 + weightLen * 0.5, '#666', 2);

    // Centrifugal vector (up/outward) - smaller
    const centLen = train.centrifugal_force * scale;
    drawVector(ctx, cx - 15, cy + 30, cx - 15, cy + 30 - centLen * 10, CONFIG.colors.force, 2);

    // Normal force (up)
    const normalLen = train.force_on_tracks * scale;
    drawVector(ctx, cx + 15, cy + 45, cx + 15, cy + 45 - normalLen * 0.5, CONFIG.colors.trainB, 2);

    // Label
    ctx.fillStyle = train.color;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Train ${label}`, cx, cy + 10);
}

function drawVector(ctx, x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 6;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function render() {
    clearCanvas();
    drawStars();
    drawEarth();

    if (state.trainA) drawTrain(state.trainA);
    if (state.trainB) drawTrain(state.trainB);

    drawVectorDiagram();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    // Update Earth rotation
    state.earthRotation += CONSTANTS.omega_earth * deltaTime * 50000;

    // Update trains
    if (state.trainA) state.trainA.update(deltaTime, 1);
    if (state.trainB) state.trainB.update(deltaTime, 1);

    render();

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    if (!state.trainA || !state.trainB) return;

    const trainA = state.trainA;
    const trainB = state.trainB;

    // Train A data (westbound - lower effective speed)
    document.getElementById('v-eff-a').textContent = `${Math.abs(trainA.v_effective).toFixed(0)} m/s`;
    document.getElementById('ac-a').textContent = `${trainA.centrifugal_acc.toFixed(4)} m/s²`;
    document.getElementById('force-a').textContent = formatForce(trainA.force_on_tracks);

    // Train B data (eastbound - higher effective speed)
    document.getElementById('v-eff-b').textContent = `${Math.abs(trainB.v_effective).toFixed(0)} m/s`;
    document.getElementById('ac-b').textContent = `${trainB.centrifugal_acc.toFixed(4)} m/s²`;
    document.getElementById('force-b').textContent = formatForce(trainB.force_on_tracks);

    // Force difference
    const diff = Math.abs(trainA.force_on_tracks - trainB.force_on_tracks);
    const avgForce = (trainA.force_on_tracks + trainB.force_on_tracks) / 2;
    const percentDiff = (diff / avgForce) * 100;
    document.getElementById('force-diff').textContent = `${formatForce(diff)} (${percentDiff.toFixed(2)}%)`;

    // Force meters (normalized)
    const maxForce = Math.max(trainA.force_on_tracks, trainB.force_on_tracks);
    document.getElementById('meter-a').style.width = `${(trainA.force_on_tracks / maxForce) * 100}%`;
    document.getElementById('meter-b').style.width = `${(trainB.force_on_tracks / maxForce) * 100}%`;
}

function formatForce(newtons) {
    if (newtons >= 1e6) {
        return `${(newtons / 1e6).toFixed(2)} MN`;
    }
    return `${newtons.toLocaleString(undefined, { maximumFractionDigits: 0 })} N`;
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
        state.showExplanation = !state.showExplanation;
        const panel = document.getElementById('explanation-panel');
        panel.classList.toggle('revealed', state.showExplanation);

        if (state.showExplanation) {
            animateExplanation();
        }
    });

    // Speed slider
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        state.trainSpeed = speed;

        const kmh = Math.round(speed * 3.6);
        document.getElementById('speed-value').textContent = `${speed} m/s (${kmh} km/h)`;

        if (state.trainA) state.trainA.setSpeed(speed);
        if (state.trainB) state.trainB.setSpeed(speed);

        updateUI();
        render();
    });

    // Toggle vectors
    document.getElementById('show-vectors').addEventListener('change', (e) => {
        state.showVectors = e.target.checked;
        render();
    });

    // Toggle forces
    document.getElementById('show-forces').addEventListener('change', (e) => {
        state.showForces = e.target.checked;
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
                feedback.innerHTML = '✅ Correct! Westbound train has lower effective speed → less centrifugal force → more weight on tracks.';

                // Show explanation
                document.getElementById('explanation-panel').classList.add('revealed');
                animateExplanation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Think about effective speed: East + v vs East - v';
            }
        });
    });
}

function animateExplanation() {
    const steps = document.querySelectorAll('.exp-step');

    steps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
        }, index * 400);
    });
}

function resetSimulation() {
    state.isPlaying = false;
    state.earthRotation = 0;
    state.showExplanation = false;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    // Recreate trains
    initTrains();

    // Reset slider
    document.getElementById('speed-slider').value = 30;
    document.getElementById('speed-value').textContent = '30 m/s (108 km/h)';
    state.trainSpeed = 30;

    // Reset UI
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('explanation-panel').classList.remove('revealed');

    // Reset explanation steps
    document.querySelectorAll('.exp-step').forEach(step => {
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

function initTrains() {
    // Train A: East→West (moves opposite to Earth rotation, lower effective speed)
    state.trainA = new Train('Train A', -1, CONFIG.colors.trainA);

    // Train B: West→East (moves with Earth rotation, higher effective speed)
    state.trainB = new Train('Train B', +1, CONFIG.colors.trainB);
}

// ============================================
// Initialization
// ============================================
function init() {
    initCanvas();
    initTrains();
    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

document.addEventListener('DOMContentLoaded', init);
