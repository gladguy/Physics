/**
 * Kepler's Third Law Simulation
 * Two planets at R₁ = 10¹² m and R₂ = 10¹⁰ m
 * Answer: T₁:T₂ = 1000:1
 */

// ============================================
// Constants
// ============================================
const CONFIG = {
    physics: {
        G: 6.67430e-11,     // Gravitational constant
        M_sun: 1.989e30,     // Sun mass (kg)
        R1: 1e12,            // Planet 1 orbital radius (m)
        R2: 1e10,            // Planet 2 orbital radius (m)
    },
    colors: {
        sun: '#ffd93d',
        sunGlow: '#ff9500',
        planet1: '#4a90d9',
        planet2: '#e24a6f',
        orbit1: 'rgba(74, 144, 217, 0.25)',
        orbit2: 'rgba(226, 74, 111, 0.35)',
        trail1: 'rgba(74, 144, 217, 0.3)',
        trail2: 'rgba(226, 74, 111, 0.3)',
    }
};

// Pre-calculate periods using Kepler's Third Law: T = 2π√(R³/GM)
function calculatePeriod(R) {
    return 2 * Math.PI * Math.sqrt(Math.pow(R, 3) / (CONFIG.physics.G * CONFIG.physics.M_sun));
}

const T1 = calculatePeriod(CONFIG.physics.R1);
const T2 = calculatePeriod(CONFIG.physics.R2);
const PERIOD_RATIO = T1 / T2;  // Should be ~1000

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    speedMultiplier: 1,
    canvas: null,
    ctx: null,
    graphCanvas: null,
    graphCtx: null,
    animationFrame: null,
    lastTimestamp: 0,
    solarSystem: null,
};

// ============================================
// SolarSystem Class
// ============================================
class SolarSystem {
    constructor() {
        this.planets = [
            {
                name: 'Planet 1',
                R: CONFIG.physics.R1,
                T: T1,
                omega: 2 * Math.PI / T1,
                angle: 0,
                color: CONFIG.colors.planet1,
                orbitColor: CONFIG.colors.orbit1,
                trailColor: CONFIG.colors.trail1,
                trail: [],
            },
            {
                name: 'Planet 2',
                R: CONFIG.physics.R2,
                T: T2,
                omega: 2 * Math.PI / T2,
                angle: 0,
                color: CONFIG.colors.planet2,
                orbitColor: CONFIG.colors.orbit2,
                trailColor: CONFIG.colors.trail2,
                trail: [],
            }
        ];

        this.simulationTime = 0;
        this.innerOrbits = 0;

        // Time scale: we want inner planet to complete 1 orbit in ~5 real seconds
        // T2 is actual period in seconds, so timeScale = T2 / 5
        this.baseTimeScale = T2 / 5;
    }

    update(deltaTime, speedMultiplier) {
        const simDelta = deltaTime * this.baseTimeScale * speedMultiplier;
        this.simulationTime += simDelta;

        this.planets.forEach((planet, index) => {
            const prevAngle = planet.angle;
            planet.angle += planet.omega * simDelta;

            // Count inner planet orbits
            if (index === 1 && planet.angle >= 2 * Math.PI) {
                this.innerOrbits++;
                planet.angle -= 2 * Math.PI;
            }

            // Wrap outer planet angle too
            if (index === 0 && planet.angle >= 2 * Math.PI) {
                planet.angle -= 2 * Math.PI;
            }
        });
    }

    getProgress(planetIndex) {
        return (this.planets[planetIndex].angle % (2 * Math.PI)) / (2 * Math.PI);
    }

    reset() {
        this.planets.forEach(p => {
            p.angle = 0;
            p.trail = [];
        });
        this.simulationTime = 0;
        this.innerOrbits = 0;
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('solar-canvas');
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

    // Scale to fit outer orbit with padding
    // We use log scale visually to show both orbits meaningfully
    state.outerOrbitRadius = Math.min(rect.width, rect.height) * 0.4;
    state.innerOrbitRadius = state.outerOrbitRadius * 0.15;  // Visual ratio (not actual 1:100)
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawStars() {
    const ctx = state.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    const seed = 123;
    for (let i = 0; i < 80; i++) {
        const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * state.canvasWidth;
        const y = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280 * state.canvasHeight;
        const size = ((seed * (i + 3) * 9301 + 49297) % 233280) / 233280 * 0.8 + 0.2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSun() {
    const ctx = state.ctx;
    const cx = state.centerX;
    const cy = state.centerY;

    // Sun glow layers
    for (let i = 5; i >= 0; i--) {
        const radius = 25 + i * 12;
        const alpha = 0.12 - i * 0.02;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Sun core
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.3, CONFIG.colors.sun);
    coreGradient.addColorStop(0.7, CONFIG.colors.sunGlow);
    coreGradient.addColorStop(1, '#ff6b00');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();

    // Sun label
    ctx.fillStyle = CONFIG.colors.sun;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sun', cx, cy + 38);
}

function drawOrbits() {
    const ctx = state.ctx;

    // Outer orbit
    ctx.strokeStyle = CONFIG.colors.orbit1;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, state.outerOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner orbit
    ctx.strokeStyle = CONFIG.colors.orbit2;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, state.innerOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPlanets() {
    const ctx = state.ctx;
    const system = state.solarSystem;

    system.planets.forEach((planet, index) => {
        const orbitR = index === 0 ? state.outerOrbitRadius : state.innerOrbitRadius;
        const x = state.centerX + orbitR * Math.cos(planet.angle);
        const y = state.centerY - orbitR * Math.sin(planet.angle);

        // Add to trail
        planet.trail.push({ x, y });
        if (planet.trail.length > 100) planet.trail.shift();

        // Draw trail
        for (let i = 1; i < planet.trail.length; i++) {
            const alpha = i / planet.trail.length * 0.5;
            ctx.strokeStyle = planet.trailColor.replace('0.3', alpha.toString());
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(planet.trail[i - 1].x, planet.trail[i - 1].y);
            ctx.lineTo(planet.trail[i].x, planet.trail[i].y);
            ctx.stroke();
        }

        // Planet glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 18);
        glowGradient.addColorStop(0, planet.color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        // Planet
        const planetR = index === 0 ? 10 : 8;
        const planetGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, planetR);
        planetGradient.addColorStop(0, index === 0 ? '#82b1ff' : '#ff82a9');
        planetGradient.addColorStop(1, planet.color);
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(x, y, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = planet.color;
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        const labelY = index === 0 ? y + 22 : y - 15;
        ctx.fillText(`Planet ${index + 1}`, x, labelY);
    });
}

function drawScaleNote() {
    const ctx = state.ctx;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('(Not to scale - visual representation)', state.centerX, state.canvasHeight - 15);
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
    ctx.fillText('R³', w - padding, h - 8);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('T²', 0, 0);
    ctx.restore();

    // Draw line T² = k × R³ (linear relationship)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, padding);
    ctx.stroke();

    // Plot points for both planets (log scale representation)
    const points = [
        { R: CONFIG.physics.R1, T: T1, color: CONFIG.colors.planet1 },
        { R: CONFIG.physics.R2, T: T2, color: CONFIG.colors.planet2 }
    ];

    // Normalize to fit graph (outer planet at top-right, inner at origin-ish)
    const maxR3 = Math.pow(CONFIG.physics.R1, 3);
    const maxT2 = T1 * T1;

    points.forEach(pt => {
        const R3 = Math.pow(pt.R, 3);
        const T2 = pt.T * pt.T;

        const x = padding + (R3 / maxR3) * graphW;
        const y = h - padding - (T2 / maxT2) * graphH;

        ctx.fillStyle = pt.color;
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
    drawStars();
    drawOrbits();
    drawSun();
    drawPlanets();
    drawScaleNote();
    drawGraph();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    state.solarSystem.update(deltaTime, state.speedMultiplier);

    updateUI();
    render();

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    const system = state.solarSystem;

    // Progress bars
    const p1Progress = system.getProgress(0) * 100;
    const p2Progress = system.getProgress(1) * 100;

    document.getElementById('p1-progress').style.width = `${p1Progress}%`;
    document.getElementById('p2-progress').style.width = `${p2Progress}%`;
    document.getElementById('p1-pct').textContent = `${Math.floor(p1Progress)}%`;
    document.getElementById('p2-pct').textContent = `${Math.floor(p2Progress)}%`;

    // Orbit counter
    document.getElementById('orbit-count').textContent = system.innerOrbits;
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
                feedback.innerHTML = '✅ Correct! T ∝ R^(3/2), so T₁/T₂ = (R₁/R₂)^(3/2) = 100^(3/2) = 1000';

                document.getElementById('derivation-panel').classList.add('revealed');
                animateDerivation();
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Remember: T² ∝ R³, so T ∝ R^(3/2), not linear!';
            }
        });
    });
}

function resetSimulation() {
    state.isPlaying = false;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    state.solarSystem.reset();

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
    state.solarSystem = new SolarSystem();
    setupControls();
    updateUI();
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log(`Period ratio T1/T2 = ${PERIOD_RATIO.toFixed(2)} (should be ~1000)`);
}

document.addEventListener('DOMContentLoaded', init);
