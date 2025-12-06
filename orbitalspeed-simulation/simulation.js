/**
 * Satellite Orbital Speed Simulation
 * v = √(gR²/(R+x))
 * Answer: (gR²/(R+x))^½
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        g: 9.80665,    // Surface gravity (m/s²)
        G: 6.67430e-11 // Gravitational constant (m³/kg/s²)
    },
    defaults: {
        earthRadius: 6371,  // km
        height: 500         // km
    }
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    animationFrame: null,
    simulation: null,
    angle: 0,
    lastTimestamp: 0
};

// ============================================
// OrbitalSimulation Class
// ============================================
class OrbitalSimulation {
    constructor() {
        this.g = CONFIG.physics.g;
        this.R = CONFIG.defaults.earthRadius * 1000;  // meters
        this.x = CONFIG.defaults.height * 1000;       // meters

        // Animation properties
        this.animArea = document.getElementById('animation-area');
        this.centerX = 0;
        this.centerY = 0;
        this.earthRadiusPx = 50;  // Earth visual radius in pixels
        this.scale = 0;           // pixels per km

        this.calculateOrbitalParams();
    }

    calculateOrbitalParams() {
        // Orbit radius (R + x) in meters
        this.orbitRadius = this.R + this.x;

        // Orbital speed: v = √(gR²/(R+x))
        this.orbitalSpeed = Math.sqrt(this.g * this.R * this.R / this.orbitRadius);

        // Orbital period: T = 2π(R+x)/v
        this.orbitalPeriod = (2 * Math.PI * this.orbitRadius) / this.orbitalSpeed;

        // Centripetal acceleration: a = v²/(R+x)
        this.centripetalAccel = (this.orbitalSpeed * this.orbitalSpeed) / this.orbitRadius;

        // Angular velocity for animation
        this.angularVelocity = this.orbitalSpeed / this.orbitRadius;

        console.log('=== Orbital Parameters ===');
        console.log(`Earth Radius (R): ${(this.R / 1000).toFixed(0)} km`);
        console.log(`Height (x): ${(this.x / 1000).toFixed(0)} km`);
        console.log(`Orbit Radius: ${(this.orbitRadius / 1000).toFixed(0)} km`);
        console.log(`Orbital Speed: ${(this.orbitalSpeed / 1000).toFixed(2)} km/s`);
        console.log(`Period: ${(this.orbitalPeriod / 60).toFixed(1)} min`);
    }

    setParams(earthRadiusKm, heightKm) {
        this.R = earthRadiusKm * 1000;
        this.x = heightKm * 1000;
        this.calculateOrbitalParams();
    }

    updateScale() {
        if (!this.animArea) return;

        const rect = this.animArea.getBoundingClientRect();
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;

        // Calculate scale to fit orbit in view
        const maxVisualRadius = Math.min(this.centerX, this.centerY) - 30;
        const orbitRadiusKm = this.orbitRadius / 1000;
        this.scale = maxVisualRadius / orbitRadiusKm;

        // Earth radius in pixels
        this.earthRadiusPx = (this.R / 1000) * this.scale;

        // Orbit radius in pixels
        this.orbitRadiusPx = orbitRadiusKm * this.scale;
    }

    getSatellitePosition(angle) {
        return {
            x: this.centerX + this.orbitRadiusPx * Math.cos(angle),
            y: this.centerY - this.orbitRadiusPx * Math.sin(angle)
        };
    }

    // Get velocity vector direction (tangent to orbit)
    getVelocityDirection(angle) {
        // Velocity is perpendicular to radius, in direction of motion
        return angle + Math.PI / 2;  // 90° ahead
    }

    // Get gravity vector direction (toward center)
    getGravityDirection(angle) {
        return angle + Math.PI;  // Pointing toward Earth
    }
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    const sim = state.simulation;

    // Update data values
    document.getElementById('speed-value').textContent =
        `${(sim.orbitalSpeed / 1000).toFixed(2)} km/s`;
    document.getElementById('period-value').textContent =
        `${(sim.orbitalPeriod / 60).toFixed(1)} min`;
    document.getElementById('orbit-radius-value').textContent =
        `${(sim.orbitRadius / 1000).toFixed(0)} km`;
    document.getElementById('accel-value').textContent =
        `${sim.centripetalAccel.toFixed(2)} m/s²`;

    // Update slider displays
    document.getElementById('height-value').textContent =
        `${(sim.x / 1000).toFixed(0)} km`;
    document.getElementById('radius-value').textContent =
        `${(sim.R / 1000).toFixed(0)} km`;
}

function updateVisuals() {
    const sim = state.simulation;
    sim.updateScale();

    // Update Earth size
    const earth = document.getElementById('earth');
    earth.style.width = `${sim.earthRadiusPx * 2}px`;
    earth.style.height = `${sim.earthRadiusPx * 2}px`;

    // Update orbit path
    const orbitPath = document.getElementById('orbit-path');
    orbitPath.style.width = `${sim.orbitRadiusPx * 2}px`;
    orbitPath.style.height = `${sim.orbitRadiusPx * 2}px`;

    // Update satellite position
    updateSatellitePosition(state.angle);
}

function updateSatellitePosition(angle) {
    const sim = state.simulation;
    const pos = sim.getSatellitePosition(angle);

    const satellite = document.getElementById('satellite');
    satellite.style.left = `${pos.x}px`;
    satellite.style.top = `${pos.y}px`;

    // Update velocity vector
    const velVector = document.getElementById('velocity-vector');
    velVector.style.display = 'block';
    velVector.style.left = `${pos.x}px`;
    velVector.style.top = `${pos.y}px`;
    const velDir = sim.getVelocityDirection(angle);
    velVector.style.transform = `rotate(${-velDir * 180 / Math.PI}deg)`;

    // Update gravity vector
    const gravVector = document.getElementById('gravity-vector');
    gravVector.style.display = 'block';
    gravVector.style.left = `${pos.x}px`;
    gravVector.style.top = `${pos.y}px`;
    const gravDir = sim.getGravityDirection(angle);
    gravVector.style.transform = `rotate(${-gravDir * 180 / Math.PI}deg)`;
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    // Speed up animation for visibility (real orbit takes 90+ minutes)
    const speedFactor = 100;

    // Update angle
    state.angle += state.simulation.angularVelocity * deltaTime * speedFactor;

    // Keep angle in range
    if (state.angle > Math.PI * 2) state.angle -= Math.PI * 2;

    updateSatellitePosition(state.angle);

    state.animationFrame = requestAnimationFrame(animate);
}

// ============================================
// Controls
// ============================================
function setupControls() {
    // Play button
    document.getElementById('play-btn').addEventListener('click', () => {
        if (state.isPlaying) {
            // Stop
            state.isPlaying = false;
            document.getElementById('play-btn').innerHTML = '<span class="icon">▶</span> Start Orbit';
            if (state.animationFrame) {
                cancelAnimationFrame(state.animationFrame);
            }
        } else {
            // Start
            state.isPlaying = true;
            state.lastTimestamp = performance.now();
            document.getElementById('play-btn').innerHTML = '<span class="icon">⏸</span> Stop Orbit';
            state.animationFrame = requestAnimationFrame(animate);
        }
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);

    // Height slider
    document.getElementById('height-slider').addEventListener('input', (e) => {
        const heightKm = parseFloat(e.target.value);
        state.simulation.setParams(state.simulation.R / 1000, heightKm);
        updateUI();
        updateVisuals();
    });

    // Radius slider
    document.getElementById('radius-slider').addEventListener('input', (e) => {
        const radiusKm = parseFloat(e.target.value);
        state.simulation.setParams(radiusKm, state.simulation.x / 1000);
        updateUI();
        updateVisuals();
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
                feedback.innerHTML = '✅ Correct! v = √(gR²/(R+x)) = (gR²/(R+x))^½';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Use: Gravity = Centripetal force, then GM = gR²';
            }
        });
    });
}

function resetSimulation() {
    state.isPlaying = false;
    state.angle = 0;

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    // Reset sliders
    document.getElementById('height-slider').value = CONFIG.defaults.height;
    document.getElementById('radius-slider').value = CONFIG.defaults.earthRadius;
    document.getElementById('play-btn').innerHTML = '<span class="icon">▶</span> Start Orbit';

    // Reset simulation
    state.simulation.setParams(CONFIG.defaults.earthRadius, CONFIG.defaults.height);

    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(b => {
        b.classList.remove('correct', 'wrong');
    });
    document.getElementById('quiz-feedback').classList.remove('show');

    updateUI();
    updateVisuals();
}

// ============================================
// Initialization
// ============================================
function init() {
    state.simulation = new OrbitalSimulation();
    setupControls();

    updateUI();
    updateVisuals();

    // Handle window resize
    window.addEventListener('resize', updateVisuals);

    console.log('Satellite Orbital Speed Simulation initialized');
    console.log('Answer: v = √(gR²/(R+x)) = (gR²/(R+x))^½');
}

document.addEventListener('DOMContentLoaded', init);
