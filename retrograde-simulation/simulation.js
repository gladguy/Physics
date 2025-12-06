/**
 * Retrograde Satellite Simulation
 * Satellite seen every 6 hours over equator
 * Moves opposite to Earth's rotation
 * Answer: ω = π/2 rad/hour
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        earthPeriod: 24,           // Earth rotation period (hours)
        relativePeriod: 6,         // Seen every 6 hours
        satelliteOmega: Math.PI / 4,  // π/4 rad/hour (correct answer)
    },
    colors: {
        earth: '#4a90e2',
        earthGlow: 'rgba(74, 144, 226, 0.3)',
        satellite: '#ff6b6b',
        satelliteGlow: 'rgba(255, 107, 107, 0.4)',
        orbit: 'rgba(255, 255, 255, 0.2)',
        earthArrow: '#00e676',
        satArrow: '#ff6b6b',
        observer: '#ffd700',
    }
};

// ============================================
// State
// ============================================
let state = {
    canvas: null,
    ctx: null,
    isPlaying: false,
    speedMultiplier: 2,
    animationFrame: null,
    lastTimestamp: 0,
    simulation: null,
};

// ============================================
// SatelliteSimulation Class
// ============================================
class SatelliteSimulation {
    constructor() {
        // Earth angular velocity (eastward, positive)
        this.omegaEarth = (2 * Math.PI) / CONFIG.physics.earthPeriod;  // π/12 rad/h

        // Satellite angular velocity (westward, answer = π/2)
        this.omegaSatellite = CONFIG.physics.satelliteOmega;  // π/2 rad/h

        // Relative angular velocity (for retrograde: add)
        this.omegaRelative = this.omegaSatellite + this.omegaEarth;  // ~1.83 rad/h

        // Expected visibility period
        this.expectedPeriod = (2 * Math.PI) / this.omegaRelative;  // ~3.4 hours

        // Simulation state
        this.time = 0;  // hours
        this.earthAngle = 0;     // radians (eastward positive)
        this.satelliteAngle = 0; // radians (westward positive)

        // Observer on Earth (fixed position on Earth surface)
        this.observerAngleOnEarth = 0;  // Initial position

        // Visibility tracking
        this.sightings = [];
        this.lastSighting = null;

        // Visual properties
        this.earthRadius = 60;
        this.orbitRadius = 150;
        this.satelliteSize = 12;

        console.log('=== Retrograde Satellite Simulation ===');
        console.log(`ω_Earth = ${(this.omegaEarth / Math.PI).toFixed(4)}π rad/h = ${(this.omegaEarth * 180 / Math.PI).toFixed(1)}°/h`);
        console.log(`ω_Satellite = ${(this.omegaSatellite / Math.PI).toFixed(4)}π rad/h = ${(this.omegaSatellite * 180 / Math.PI).toFixed(1)}°/h`);
        console.log(`ω_Relative = ${(this.omegaRelative / Math.PI).toFixed(4)}π rad/h`);
        console.log(`Expected visibility period = ${this.expectedPeriod.toFixed(2)} hours`);
    }

    reset() {
        this.time = 0;
        this.earthAngle = 0;
        this.satelliteAngle = 0;
        this.sightings = [];
        this.lastSighting = null;
    }

    update(deltaTimeHours, speedMultiplier) {
        const scaledDelta = deltaTimeHours * speedMultiplier;
        this.time += scaledDelta;

        // Earth rotates eastward (counterclockwise in top view)
        this.earthAngle += this.omegaEarth * scaledDelta;

        // Satellite moves westward (clockwise in top view)
        this.satelliteAngle -= this.omegaSatellite * scaledDelta;

        // Keep angles in reasonable range
        this.earthAngle = this.earthAngle % (2 * Math.PI);
        this.satelliteAngle = this.satelliteAngle % (2 * Math.PI);

        // Check visibility (observer on Earth sees satellite)
        this.checkVisibility();
    }

    checkVisibility() {
        // Observer's position in inertial frame
        const observerAngleInertial = this.observerAngleOnEarth + this.earthAngle;

        // Satellite's position in inertial frame
        const satAngleInertial = this.satelliteAngle;

        // Relative angle (how far satellite is from observer's line of sight)
        let relAngle = satAngleInertial - observerAngleInertial;

        // Normalize to [-π, π]
        while (relAngle > Math.PI) relAngle -= 2 * Math.PI;
        while (relAngle < -Math.PI) relAngle += 2 * Math.PI;

        // Satellite is "visible" when roughly overhead (within ±10°)
        const isVisible = Math.abs(relAngle) < 0.175;  // ~10°

        if (isVisible && !this.wasVisible) {
            // New sighting
            this.sightings.push({
                time: this.time,
                earthAngle: this.earthAngle,
                satAngle: this.satelliteAngle
            });

            if (this.lastSighting !== null) {
                const interval = this.time - this.lastSighting;
                console.log(`Sighting at t=${this.time.toFixed(2)}h, interval=${interval.toFixed(2)}h`);
            }

            this.lastSighting = this.time;

            // Keep only last 10 sightings
            if (this.sightings.length > 10) this.sightings.shift();
        }

        this.wasVisible = isVisible;
        this.isCurrentlyVisible = isVisible;
    }

    getPositions(centerX, centerY) {
        // Observer position (on Earth surface)
        const observerAngle = this.observerAngleOnEarth + this.earthAngle;
        const observer = {
            x: centerX + this.earthRadius * Math.cos(observerAngle),
            y: centerY - this.earthRadius * Math.sin(observerAngle)
        };

        // Satellite position
        const satellite = {
            x: centerX + this.orbitRadius * Math.cos(this.satelliteAngle),
            y: centerY - this.orbitRadius * Math.sin(this.satelliteAngle)
        };

        return { observer, satellite, centerX, centerY };
    }

    skipTo(hours) {
        const steps = hours * 100;
        const dt = hours / steps;

        for (let i = 0; i < steps; i++) {
            this.update(dt, 1);
        }
    }
}

// ============================================
// Canvas Setup
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('orbit-canvas');
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
    state.centerX = rect.width / 2;
    state.centerY = rect.height / 2;
}

// ============================================
// Drawing Functions
// ============================================
function clearCanvas() {
    const ctx = state.ctx;

    // Space background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
}

function drawOrbit() {
    const ctx = state.ctx;
    const sim = state.simulation;

    // Orbit path
    ctx.strokeStyle = CONFIG.colors.orbit;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, sim.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Direction labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('⟲ Satellite (West)', state.centerX, state.centerY - sim.orbitRadius - 10);
}

function drawEarth() {
    const ctx = state.ctx;
    const sim = state.simulation;

    // Earth glow
    const gradient = ctx.createRadialGradient(
        state.centerX, state.centerY, sim.earthRadius * 0.8,
        state.centerX, state.centerY, sim.earthRadius * 1.5
    );
    gradient.addColorStop(0, CONFIG.colors.earthGlow);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, sim.earthRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Earth
    ctx.fillStyle = CONFIG.colors.earth;
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, sim.earthRadius, 0, Math.PI * 2);
    ctx.fill();

    // Continents (simple shapes)
    ctx.fillStyle = '#3d8b37';
    ctx.save();
    ctx.translate(state.centerX, state.centerY);
    ctx.rotate(-sim.earthAngle);  // Rotate with Earth

    // Simple continent shapes
    ctx.beginPath();
    ctx.ellipse(-15, -10, 20, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(20, 15, 12, 18, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Equator line
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(state.centerX - sim.earthRadius, state.centerY);
    ctx.lineTo(state.centerX + sim.earthRadius, state.centerY);
    ctx.stroke();

    // Rotation direction arrow (east = counterclockwise)
    const arrowAngle = sim.earthAngle + Math.PI / 4;
    const arrowX = state.centerX + (sim.earthRadius + 25) * Math.cos(arrowAngle);
    const arrowY = state.centerY - (sim.earthRadius + 25) * Math.sin(arrowAngle);

    ctx.strokeStyle = CONFIG.colors.earthArrow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, sim.earthRadius + 25, arrowAngle, arrowAngle + 0.5);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = CONFIG.colors.earthArrow;
    ctx.beginPath();
    const tipAngle = arrowAngle + 0.5;
    const tipX = state.centerX + (sim.earthRadius + 25) * Math.cos(tipAngle);
    const tipY = state.centerY - (sim.earthRadius + 25) * Math.sin(tipAngle);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - 8 * Math.cos(tipAngle + 0.5), tipY + 8 * Math.sin(tipAngle + 0.5));
    ctx.lineTo(tipX - 8 * Math.cos(tipAngle - 0.5), tipY + 8 * Math.sin(tipAngle - 0.5));
    ctx.closePath();
    ctx.fill();

    // Earth label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Earth', state.centerX, state.centerY + sim.earthRadius + 45);
    ctx.fillStyle = CONFIG.colors.earthArrow;
    ctx.font = '10px Inter';
    ctx.fillText('East ⟲', state.centerX, state.centerY + sim.earthRadius + 58);
}

function drawObserver() {
    const ctx = state.ctx;
    const sim = state.simulation;
    const pos = sim.getPositions(state.centerX, state.centerY);

    // Observer on Earth
    ctx.fillStyle = CONFIG.colors.observer;
    ctx.beginPath();
    ctx.arc(pos.observer.x, pos.observer.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Line of sight to satellite (when visible)
    if (sim.isCurrentlyVisible) {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(pos.observer.x, pos.observer.y);
        ctx.lineTo(pos.satellite.x, pos.satellite.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawSatellite() {
    const ctx = state.ctx;
    const sim = state.simulation;
    const pos = sim.getPositions(state.centerX, state.centerY);

    // Satellite glow
    ctx.fillStyle = CONFIG.colors.satelliteGlow;
    ctx.beginPath();
    ctx.arc(pos.satellite.x, pos.satellite.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Satellite body
    ctx.fillStyle = CONFIG.colors.satellite;
    ctx.beginPath();
    ctx.arc(pos.satellite.x, pos.satellite.y, sim.satelliteSize, 0, Math.PI * 2);
    ctx.fill();

    // Solar panels
    ctx.fillStyle = '#3a3aff';
    ctx.fillRect(pos.satellite.x - 25, pos.satellite.y - 4, 15, 8);
    ctx.fillRect(pos.satellite.x + 10, pos.satellite.y - 4, 15, 8);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(pos.satellite.x - 3, pos.satellite.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Satellite motion arrow (westward = clockwise)
    const arrowAngle = sim.satelliteAngle - Math.PI / 4;
    const arrowX = state.centerX + (sim.orbitRadius + 20) * Math.cos(arrowAngle);
    const arrowY = state.centerY - (sim.orbitRadius + 20) * Math.sin(arrowAngle);

    ctx.strokeStyle = CONFIG.colors.satArrow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, sim.orbitRadius + 20, arrowAngle, arrowAngle - 0.5, true);
    ctx.stroke();

    // Visibility indicator
    if (sim.isCurrentlyVisible) {
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('VISIBLE!', pos.satellite.x, pos.satellite.y - 25);
    }
}

function drawInfo() {
    const ctx = state.ctx;
    const sim = state.simulation;

    // Info box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 180, 80);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeRect(10, 10, 180, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`Earth: ${(sim.earthAngle * 180 / Math.PI).toFixed(1)}°`, 20, 30);
    ctx.fillText(`Satellite: ${(-sim.satelliteAngle * 180 / Math.PI).toFixed(1)}° (West)`, 20, 48);
    ctx.fillText(`Sightings: ${sim.sightings.length}`, 20, 66);

    if (sim.sightings.length >= 2) {
        const lastTwo = sim.sightings.slice(-2);
        const interval = lastTwo[1].time - lastTwo[0].time;
        ctx.fillText(`Last interval: ${interval.toFixed(2)} hours`, 20, 84);
    }
}

function render() {
    clearCanvas();
    drawOrbit();
    drawEarth();
    drawObserver();
    drawSatellite();
    drawInfo();
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    // Convert to hours (1 second real time = speedMultiplier hours simulation)
    const deltaHours = deltaTime * state.speedMultiplier * 0.5;

    state.simulation.update(deltaHours, 1);

    updateUI();
    render();

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    const sim = state.simulation;

    document.getElementById('time-value').textContent = sim.time.toFixed(1);
    document.getElementById('sighting-count').textContent = sim.sightings.length;

    // Update satellite omega display
    document.getElementById('sat-omega').textContent = `ω = π/4 rad/h`;
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

    // Fast forward button
    document.getElementById('fast-btn').addEventListener('click', () => {
        state.simulation.skipTo(6);  // Skip 6 hours
        updateUI();
        render();
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
                feedback.innerHTML = '✅ Correct! π/4 rad/hour = 45°/hour';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Calculate: ω_sat = π/3 - π/12 = π/4 rad/hour';
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
    document.getElementById('time-value').textContent = '0.0';
    document.getElementById('sighting-count').textContent = '0';

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
    state.simulation = new SatelliteSimulation();
    initCanvas();
    setupControls();

    render();
    updateUI();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log('Retrograde Satellite Simulation initialized');
    console.log('Answer: ω = π/2 rad/hour');
}

document.addEventListener('DOMContentLoaded', init);
