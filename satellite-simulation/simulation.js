/**
 * Satellite Energy Ratio Simulation
 * Demonstrates PE/KE = -2 for circular orbits
 */

// ============================================
// Physical Constants
// ============================================
const CONSTANTS = {
    G: 6.67430e-11,        // Gravitational constant (m³ kg⁻¹ s⁻²)
    M_earth: 5.972e24,     // Earth mass (kg)
    R_earth: 6.371e6,      // Earth radius (m)
    m_satellite: 1000,     // Satellite mass (kg)
};

// ============================================
// Configuration
// ============================================
const CONFIG = {
    canvas: {
        padding: 50,
        earthRadius: 40,  // pixels for Earth display
        satelliteRadius: 8,
        trailLength: 100,
    },
    animation: {
        baseSpeed: 0.5,   // radians per second at normalized scale
    },
    colors: {
        earth: '#4a90d9',
        earthGlow: 'rgba(74, 144, 217, 0.3)',
        atmosphere: 'rgba(135, 206, 250, 0.2)',
        satellite: '#ffd700',
        satelliteGlow: 'rgba(255, 215, 0, 0.4)',
        orbit: 'rgba(0, 212, 255, 0.3)',
        trail: 'rgba(0, 212, 255, 0.5)',
        velocityVector: '#00e676',
        forceVector: '#ff5252',
    }
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    speed: 1,
    satellite: null,
    canvas: null,
    ctx: null,
    pieCanvas: null,
    pieCtx: null,
    animationFrame: null,
    lastTimestamp: 0,
    showVectors: true,
    showTrail: true,
    showDerivation: false,
    derivationStep: 0,
    trail: [],
};

// ============================================
// Satellite Class
// ============================================
class Satellite {
    constructor(orbitalRadius) {
        this.radius = orbitalRadius;  // meters from Earth's center
        this.mass = CONSTANTS.m_satellite;
        this.angle = 0;  // radians

        // Calculate orbital mechanics
        this.calculateOrbitalParameters();
    }

    calculateOrbitalParameters() {
        const G = CONSTANTS.G;
        const M = CONSTANTS.M_earth;
        const r = this.radius;
        const m = this.mass;

        // Orbital velocity: v = sqrt(GM/r)
        this.velocity = Math.sqrt(G * M / r);

        // Angular velocity: ω = v/r
        this.angularVelocity = this.velocity / r;

        // Orbital period: T = 2πr/v
        this.period = 2 * Math.PI * r / this.velocity;

        // Energy calculations
        // KE = (1/2)mv² = GMm/(2r)
        this.KE = 0.5 * m * this.velocity * this.velocity;

        // PE = -GMm/r
        this.PE = -G * M * m / r;

        // Total Energy = PE + KE = -GMm/(2r)
        this.TE = this.PE + this.KE;

        // Ratio = PE/KE = -2&nbsp;(always for circular orbits)
        this.ratio = this.PE / this.KE;
    }

    update(deltaTime, speedMultiplier) {
        // Update angle based on angular velocity
        const effectiveAngularVelocity = this.angularVelocity * speedMultiplier * 500; // Scale for visibility
        this.angle += effectiveAngularVelocity * deltaTime;

        // Normalize angle
        if (this.angle > 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        }
    }

    getPosition() {
        return {
            x: Math.cos(this.angle) * this.radius,
            y: Math.sin(this.angle) * this.radius
        };
    }

    getVelocityDirection() {
        // Velocity is tangential (perpendicular to radius)
        return {
            x: -Math.sin(this.angle),
            y: Math.cos(this.angle)
        };
    }

    getForceDirection() {
        // Force points toward Earth (negative radial)
        return {
            x: -Math.cos(this.angle),
            y: -Math.sin(this.angle)
        };
    }

    setRadius(newRadius) {
        this.radius = newRadius;
        this.calculateOrbitalParameters();
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('orbit-canvas');
    state.ctx = state.canvas.getContext('2d');

    state.pieCanvas = document.getElementById('pie-canvas');
    state.pieCtx = state.pieCanvas.getContext('2d');

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

    // Calculate scale based on canvas size and max orbital radius
    const maxOrbitRadius = 42000e3;  // 42,000 km
    const availableRadius = Math.min(state.canvasWidth, state.canvasHeight) / 2 - CONFIG.canvas.padding;
    state.scale = availableRadius / maxOrbitRadius;
}

function metersToPixels(meters) {
    return meters * state.scale;
}

function worldToCanvas(x, y) {
    return {
        x: state.centerX + metersToPixels(x),
        y: state.centerY - metersToPixels(y)  // Flip Y for canvas
    };
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawStars() {
    const ctx = state.ctx;

    // Draw some random stars (deterministic based on seed)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const seed = 12345;
    for (let i = 0; i < 50; i++) {
        const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * state.canvasWidth;
        const y = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280 * state.canvasHeight;
        const size = ((seed * (i + 3) * 9301 + 49297) % 233280) / 233280 * 1.5 + 0.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEarth() {
    const ctx = state.ctx;
    const cx = state.centerX;
    const cy = state.centerY;
    const earthPixelRadius = Math.max(CONFIG.canvas.earthRadius, metersToPixels(CONSTANTS.R_earth));

    // Atmosphere glow
    const glowGradient = ctx.createRadialGradient(cx, cy, earthPixelRadius, cx, cy, earthPixelRadius * 1.5);
    glowGradient.addColorStop(0, CONFIG.colors.atmosphere);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, earthPixelRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Earth body
    const earthGradient = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, earthPixelRadius);
    earthGradient.addColorStop(0, '#6db3f2');
    earthGradient.addColorStop(0.5, CONFIG.colors.earth);
    earthGradient.addColorStop(1, '#2d5a87');

    ctx.fillStyle = earthGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, earthPixelRadius, 0, Math.PI * 2);
    ctx.fill();

    // Land masses (simplified)
    ctx.fillStyle = 'rgba(61, 153, 112, 0.6)';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 5, earthPixelRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 10, cy + 8, earthPixelRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Earth label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Earth', cx, cy + earthPixelRadius + 15);
}

function drawOrbitPath() {
    if (!state.satellite) return;

    const ctx = state.ctx;
    const orbitRadius = metersToPixels(state.satellite.radius);

    // Orbit path
    ctx.strokeStyle = CONFIG.colors.orbit;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawTrail() {
    if (!state.showTrail || state.trail.length < 2) return;

    const ctx = state.ctx;

    ctx.beginPath();
    ctx.moveTo(state.trail[0].x, state.trail[0].y);

    for (let i = 1; i < state.trail.length; i++) {
        const alpha = i / state.trail.length;
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 2 + alpha * 2;
        ctx.lineTo(state.trail[i].x, state.trail[i].y);
    }

    ctx.stroke();
}

function drawSatellite() {
    if (!state.satellite) return;

    const ctx = state.ctx;
    const pos = state.satellite.getPosition();
    const canvasPos = worldToCanvas(pos.x, pos.y);

    // Update trail
    state.trail.push({ x: canvasPos.x, y: canvasPos.y });
    if (state.trail.length > CONFIG.canvas.trailLength) {
        state.trail.shift();
    }

    // Satellite glow
    const glow = ctx.createRadialGradient(canvasPos.x, canvasPos.y, 0, canvasPos.x, canvasPos.y, 25);
    glow.addColorStop(0, CONFIG.colors.satelliteGlow);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(canvasPos.x, canvasPos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Satellite body
    ctx.fillStyle = CONFIG.colors.satellite;
    ctx.beginPath();
    ctx.arc(canvasPos.x, canvasPos.y, CONFIG.canvas.satelliteRadius, 0, Math.PI * 2);
    ctx.fill();

    // Solar panels
    ctx.fillStyle = '#3d5a80';
    ctx.fillRect(canvasPos.x - 18, canvasPos.y - 3, 10, 6);
    ctx.fillRect(canvasPos.x + 8, canvasPos.y - 3, 10, 6);

    // Draw vectors
    if (state.showVectors) {
        drawVectors(canvasPos);
    }
}

function drawVectors(satellitePos) {
    const ctx = state.ctx;
    const vectorLength = 50;

    // Velocity vector (green, tangential)
    const velDir = state.satellite.getVelocityDirection();
    drawArrow(
        ctx,
        satellitePos.x,
        satellitePos.y,
        satellitePos.x + velDir.x * vectorLength,
        satellitePos.y - velDir.y * vectorLength,  // Flip Y
        CONFIG.colors.velocityVector,
        'v'
    );

    // Force vector (red, toward Earth)
    const forceDir = state.satellite.getForceDirection();
    drawArrow(
        ctx,
        satellitePos.x,
        satellitePos.y,
        satellitePos.x + forceDir.x * vectorLength * 0.7,
        satellitePos.y - forceDir.y * vectorLength * 0.7,
        CONFIG.colors.forceVector,
        'F'
    );
}

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
    const headLength = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x2 + 15 * Math.cos(angle), y2 + 15 * Math.sin(angle));
}

function drawPieChart() {
    const ctx = state.pieCtx;
    const canvas = state.pieCanvas;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // |PE| is 2 parts, |KE| is 1 part (total 3 parts)
    // PE slice (2/3)
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, 0, (2 / 3) * 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // KE slice (1/3)
    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, (2 / 3) * 2 * Math.PI, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // PE label (in center of PE slice)
    const peAngle = (2 / 3) * Math.PI;
    ctx.fillText('|PE|', cx + radius * 0.5 * Math.cos(peAngle), cy + radius * 0.5 * Math.sin(peAngle));

    // KE label
    const keAngle = (2 / 3 + 1 / 6) * 2 * Math.PI;
    ctx.fillText('|KE|', cx + radius * 0.5 * Math.cos(keAngle), cy + radius * 0.5 * Math.sin(keAngle));

    // Ratio annotation
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText('2:1', cx, cy);
}

function render() {
    clearCanvas();
    drawStars();
    drawOrbitPath();
    drawTrail();
    drawEarth();
    drawSatellite();
    drawPieChart();
}

// ============================================
// Animation Loop
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    if (state.satellite) {
        state.satellite.update(deltaTime, state.speed);
    }

    updateUI();
    render();

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    if (!state.satellite) return;

    const sat = state.satellite;

    // Orbit info
    document.getElementById('radius-display').textContent = formatDistance(sat.radius);
    document.getElementById('velocity-display').textContent = formatVelocity(sat.velocity);
    document.getElementById('period-display').textContent = formatPeriod(sat.period);

    // Energy values
    document.getElementById('ke-value').textContent = formatEnergy(sat.KE);
    document.getElementById('pe-value').textContent = formatEnergy(sat.PE);
    document.getElementById('te-value').textContent = formatEnergy(sat.TE);

    // Ratio
    document.getElementById('ratio-value').textContent = sat.ratio.toFixed(2);

    // Update energy bars (normalized to max)
    const maxEnergy = Math.abs(sat.PE);
    document.getElementById('ke-bar').style.width = `${(sat.KE / maxEnergy) * 100}%`;
    document.getElementById('pe-bar').style.width = `${(Math.abs(sat.PE) / maxEnergy) * 100}%`;
    document.getElementById('te-bar').style.width = `${(Math.abs(sat.TE) / maxEnergy) * 100}%`;
}

function formatDistance(meters) {
    const km = meters / 1000;
    if (km >= 1000) {
        return `${(km / 1000).toFixed(1)}k km`;
    }
    return `${km.toLocaleString()} km`;
}

function formatVelocity(mps) {
    return `${(mps / 1000).toFixed(2)} km/s`;
}

function formatPeriod(seconds) {
    const hours = seconds / 3600;
    if (hours > 24) {
        return `${(hours / 24).toFixed(1)} days`;
    }
    return `${hours.toFixed(2)} hrs`;
}

function formatEnergy(joules) {
    const exp = Math.floor(Math.log10(Math.abs(joules)));
    const mantissa = joules / Math.pow(10, exp);
    const sign = joules >= 0 ? '+' : '';
    return `${sign}${mantissa.toFixed(2)}×10^${exp} J`;
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

    // Derivation button
    document.getElementById('derive-btn').addEventListener('click', () => {
        state.showDerivation = !state.showDerivation;
        const panel = document.getElementById('derivation-panel');
        panel.classList.toggle('revealed', state.showDerivation);

        if (state.showDerivation) {
            animateDerivation();
        }
    });

    // Radius slider
    document.getElementById('radius-slider').addEventListener('input', (e) => {
        const radiusKm = parseInt(e.target.value);
        const radiusM = radiusKm * 1000;

        document.getElementById('radius-value').textContent = `${radiusKm.toLocaleString()} km`;

        if (state.satellite) {
            state.satellite.setRadius(radiusM);
            state.trail = [];  // Clear trail when radius changes
            updateUI();
            render();
        }
    });

    // Toggle vectors
    document.getElementById('show-vectors').addEventListener('change', (e) => {
        state.showVectors = e.target.checked;
        render();
    });

    // Toggle trail
    document.getElementById('show-trail').addEventListener('change', (e) => {
        state.showTrail = e.target.checked;
        if (!e.target.checked) {
            state.trail = [];
        }
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
                feedback.innerHTML = '✅ Correct! PE/KE = -2 for all circular orbits. The ratio is independent of orbital radius!';

                // Show derivation
                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Not quite. Remember: PE = -GMm/r and KE = GMm/(2r) for circular orbits.';
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
    state.showDerivation = false;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    // Reset satellite to initial radius
    const initialRadius = 10000 * 1000;  // 10,000 km
    state.satellite = new Satellite(initialRadius);

    // Reset slider
    document.getElementById('radius-slider').value = 10000;
    document.getElementById('radius-value').textContent = '10,000 km';

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

    // Create satellite at 10,000 km orbital radius
    const initialRadius = 10000 * 1000;  // meters
    state.satellite = new Satellite(initialRadius);

    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

document.addEventListener('DOMContentLoaded', init);
