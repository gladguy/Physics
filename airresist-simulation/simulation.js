/**
 * Projectile Motion with Air Resistance
 * Initial v = 20 m/s, Return v = 18 m/s
 * Find max height = 18.1 m
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        g: 10,           // Gravity (m/s²)
        u: 20,           // Initial velocity (m/s)
        vReturn: 18,     // Return velocity (m/s)
    }
};

// ============================================
// State
// ============================================
let state = {
    isPlaying: false,
    animationFrame: null,
    lastTimestamp: 0,
    simulation: null,
};

// ============================================
// AirResistanceSimulation Class
// ============================================
class AirResistanceSimulation {
    constructor() {
        this.g = CONFIG.physics.g;
        this.u = CONFIG.physics.u;
        this.vReturn = CONFIG.physics.vReturn;

        // Calculate heights and times
        this.calculateParams();

        // Animation properties
        this.time = 0;
        this.idealHeight = 0;
        this.realHeight = 0;
        this.groundOffset = 40;  // pixels

        console.log('=== Air Resistance Simulation ===');
        console.log(`Initial velocity: ${this.u} m/s`);
        console.log(`Return velocity: ${this.vReturn} m/s`);
        console.log(`Ideal max height: ${this.idealMaxHeight} m`);
        console.log(`Real max height: ${this.realMaxHeight} m`);
    }

    calculateParams() {
        // Ideal motion (no air resistance)
        // h = u²/(2g)
        this.idealMaxHeight = (this.u * this.u) / (2 * this.g);  // 20 m
        this.idealTimeUp = this.u / this.g;  // 2.0 s
        this.idealTotalTime = 2 * this.idealTimeUp;  // 4.0 s

        // Real motion (with air resistance)
        // Energy approach:
        // Initial KE = ½m(20)² = 200m J
        // Final KE = ½m(18)² = 162m J
        // Energy lost = 38m J
        // Assuming symmetric loss: 19m J lost going up
        // PE at max = 200m - 19m = 181m J
        // h = 181/g = 18.1 m

        const initialKE = 0.5 * this.u * this.u;      // 200 (per unit mass)
        const finalKE = 0.5 * this.vReturn * this.vReturn;  // 162
        this.energyLost = initialKE - finalKE;         // 38
        this.energyLostUp = this.energyLost / 2;       // 19

        this.realMaxHeight = (initialKE - this.energyLostUp) / this.g;  // 18.1 m
        this.realTimeUp = 1.9;  // Approximate
        this.realTotalTime = 3.8;  // Approximate
    }

    reset() {
        this.time = 0;
        this.idealHeight = 0;
        this.realHeight = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Calculate ideal position
        if (this.time <= this.idealTimeUp) {
            // Upward
            this.idealHeight = this.u * this.time - 0.5 * this.g * this.time * this.time;
        } else if (this.time <= this.idealTotalTime) {
            // Downward
            const fallTime = this.time - this.idealTimeUp;
            this.idealHeight = this.idealMaxHeight - 0.5 * this.g * fallTime * fallTime;
        } else {
            this.idealHeight = 0;
        }

        // Calculate real position (with air resistance effect)
        const effectiveGUp = this.g * 1.1;   // Higher effective g going up (more deceleration)
        const effectiveGDown = this.g * 0.9; // Lower effective g coming down (retarded)

        if (this.time <= this.realTimeUp) {
            // Upward with air resistance
            this.realHeight = this.u * this.time - 0.5 * effectiveGUp * this.time * this.time;
        } else if (this.time <= this.realTotalTime) {
            // Downward with air resistance
            const fallTime = this.time - this.realTimeUp;
            this.realHeight = this.realMaxHeight - 0.5 * effectiveGDown * fallTime * fallTime;
        } else {
            this.realHeight = 0;
        }

        // Clamp heights
        this.idealHeight = Math.max(0, this.idealHeight);
        this.realHeight = Math.max(0, this.realHeight);

        // Check if animation complete
        return this.time >= Math.max(this.idealTotalTime, this.realTotalTime);
    }

    getScale(areaHeight) {
        const maxHeight = Math.max(this.idealMaxHeight, this.realMaxHeight) + 3;
        return (areaHeight - this.groundOffset - 20) / maxHeight;
    }
}

// ============================================
// UI Updates
// ============================================
function updateVisuals() {
    const sim = state.simulation;

    const idealArea = document.getElementById('ideal-area');
    const realArea = document.getElementById('real-area');

    const idealAreaHeight = idealArea.clientHeight;
    const realAreaHeight = realArea.clientHeight;

    const scale = sim.getScale(idealAreaHeight);

    // Update ball positions
    const idealBall = document.getElementById('ideal-ball');
    const realBall = document.getElementById('real-ball');

    idealBall.style.bottom = `${sim.groundOffset + sim.idealHeight * scale}px`;
    realBall.style.bottom = `${sim.groundOffset + sim.realHeight * scale}px`;

    // Update max height lines
    const idealMaxLine = document.getElementById('ideal-max-line');
    const realMaxLine = document.getElementById('real-max-line');

    idealMaxLine.style.bottom = `${sim.groundOffset + sim.idealMaxHeight * scale}px`;
    realMaxLine.style.bottom = `${sim.groundOffset + sim.realMaxHeight * scale}px`;
}

function setupHeightMarkers() {
    const sim = state.simulation;

    ['ideal', 'real'].forEach(type => {
        const area = document.getElementById(`${type}-area`);
        const markersContainer = document.getElementById(`${type}-markers`);
        if (!markersContainer) return;

        markersContainer.innerHTML = '';

        const areaHeight = area.clientHeight;
        const scale = sim.getScale(areaHeight);

        // Add markers every 5m
        for (let h = 5; h <= 25; h += 5) {
            const yPos = sim.groundOffset + h * scale;

            const marker = document.createElement('div');
            marker.style.cssText = `
                position: absolute;
                left: 5px;
                bottom: ${yPos}px;
                width: 25px;
                height: 1px;
                background: rgba(255, 255, 255, 0.2);
            `;

            const label = document.createElement('div');
            label.style.cssText = `
                position: absolute;
                left: 32px;
                bottom: ${yPos - 7}px;
                color: rgba(255, 255, 255, 0.4);
                font-size: 0.7rem;
            `;
            label.textContent = `${h}m`;

            markersContainer.appendChild(marker);
            markersContainer.appendChild(label);
        }
    });
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    const completed = state.simulation.update(deltaTime);

    updateVisuals();

    if (completed) {
        state.isPlaying = false;
        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    } else {
        state.animationFrame = requestAnimationFrame(animate);
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
                feedback.innerHTML = '✅ Correct! Using energy: PE = KE - ½·Loss = 181m → h = 18.1m';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Use energy approach: Total loss = 38m, half during ascent';
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

    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(b => {
        b.classList.remove('correct', 'wrong');
    });
    document.getElementById('quiz-feedback').classList.remove('show');

    updateVisuals();
}

// ============================================
// Initialization
// ============================================
function init() {
    state.simulation = new AirResistanceSimulation();
    setupControls();
    setupHeightMarkers();

    updateVisuals();

    // Handle window resize
    window.addEventListener('resize', () => {
        setupHeightMarkers();
        updateVisuals();
    });

    console.log('Air Resistance Projectile Simulation initialized');
    console.log('Answer: Max height = 18.1 m');
}

document.addEventListener('DOMContentLoaded', init);
