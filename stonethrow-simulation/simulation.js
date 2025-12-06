/**
 * Stone Thrown Vertically Simulation
 * Stone reaches 500m max height in 10s
 * Find time to fall back to ground
 * Answer: ≈10 seconds (10.1s exactly)
 */

// ============================================
// Constants & Configuration
// ============================================
const CONFIG = {
    physics: {
        g: 9.8,              // Gravity (m/s²)
        maxHeight: 500,      // meters
        timeToMaxHeight: 10, // seconds
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
// StoneThrowSimulation Class
// ============================================
class StoneThrowSimulation {
    constructor() {
        this.g = CONFIG.physics.g;
        this.maxHeight = CONFIG.physics.maxHeight;
        this.timeToMaxHeight = CONFIG.physics.timeToMaxHeight;

        // Calculate initial velocity (u = g × t at max height where v = 0)
        this.initialVelocity = this.g * this.timeToMaxHeight;  // 98 m/s

        // Calculate time to fall from max height: h = ½gt²
        this.timeToFall = Math.sqrt((2 * this.maxHeight) / this.g);  // ~10.1s

        // Total flight time
        this.totalTime = this.timeToMaxHeight + this.timeToFall;  // ~20.1s

        // State
        this.time = 0;
        this.height = 0;
        this.velocity = this.initialVelocity;
        this.phase = 'Ready';

        // Animation scale (400px for 500m)
        this.animationHeight = 360;  // pixels available
        this.scale = this.animationHeight / this.maxHeight;  // px per meter
        this.groundOffset = 50;  // ground height in pixels

        console.log('=== Stone Throw Simulation ===');
        console.log(`Initial velocity: ${this.initialVelocity.toFixed(1)} m/s`);
        console.log(`Max height: ${this.maxHeight} m at t=${this.timeToMaxHeight}s`);
        console.log(`Time to fall: ${this.timeToFall.toFixed(2)} s`);
        console.log(`Total time: ${this.totalTime.toFixed(2)} s`);
    }

    reset() {
        this.time = 0;
        this.height = 0;
        this.velocity = this.initialVelocity;
        this.phase = 'Ready';
    }

    update(deltaTime) {
        this.time += deltaTime;

        if (this.time >= this.totalTime) {
            this.time = this.totalTime;
            this.height = 0;
            this.velocity = 0;
            this.phase = 'Landed';
            return true;  // Animation complete
        }

        if (this.time <= this.timeToMaxHeight) {
            // Upward phase
            this.phase = 'Rising ↑';
            // h = ut - ½gt²
            this.height = this.initialVelocity * this.time - 0.5 * this.g * this.time * this.time;
            // v = u - gt
            this.velocity = this.initialVelocity - this.g * this.time;
        } else {
            // Downward phase
            this.phase = 'Falling ↓';
            const fallTime = this.time - this.timeToMaxHeight;
            // h = h_max - ½gt² (falling from max)
            this.height = this.maxHeight - 0.5 * this.g * fallTime * fallTime;
            // v = -gt (falling down, negative velocity)
            this.velocity = -this.g * fallTime;
        }

        // Clamp height
        this.height = Math.max(0, this.height);

        return false;  // Animation continues
    }

    getStonePosition() {
        // Convert height to pixel position
        return this.groundOffset + this.height * this.scale;
    }

    getProgress() {
        return (this.time / this.totalTime) * 100;
    }
}

// ============================================
// UI Updates
// ============================================
function updateUI() {
    const sim = state.simulation;

    // Update data values
    document.getElementById('height-value').textContent = `${sim.height.toFixed(1)} m`;
    document.getElementById('velocity-value').textContent = `${sim.velocity.toFixed(1)} m/s`;
    document.getElementById('time-value').textContent = `${sim.time.toFixed(1)} s`;
    document.getElementById('phase-value').textContent = sim.phase;

    // Update stone position
    const stone = document.getElementById('stone');
    stone.style.bottom = `${sim.getStonePosition()}px`;

    // Update timeline progress
    document.getElementById('timeline-progress').style.width = `${sim.getProgress()}%`;
}

// ============================================
// Animation
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    const completed = state.simulation.update(deltaTime);

    updateUI();

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
                feedback.innerHTML = '✅ Correct! t = √(2h/g) = √(1000/9.8) ≈ 10.1 seconds';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Use h = ½gt². Time to rise = Time to fall!';
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
    document.getElementById('stone').style.bottom = `${state.simulation.groundOffset}px`;
    document.getElementById('height-value').textContent = '0 m';
    document.getElementById('velocity-value').textContent = `${state.simulation.initialVelocity.toFixed(1)} m/s`;
    document.getElementById('time-value').textContent = '0.0 s';
    document.getElementById('phase-value').textContent = 'Ready';
    document.getElementById('timeline-progress').style.width = '0%';

    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(b => {
        b.classList.remove('correct', 'wrong');
    });
    document.getElementById('quiz-feedback').classList.remove('show');
}

// ============================================
// Height Markers
// ============================================
function addHeightMarkers() {
    const markersContainer = document.getElementById('height-markers');
    if (!markersContainer) return;

    const sim = state.simulation;

    // Clear existing markers
    markersContainer.innerHTML = '';

    // Add markers every 100m
    for (let h = 100; h < sim.maxHeight; h += 100) {
        const yPos = sim.groundOffset + h * sim.scale;

        const marker = document.createElement('div');
        marker.style.cssText = `
            position: absolute;
            left: 10px;
            bottom: ${yPos}px;
            width: 30px;
            height: 1px;
            background: rgba(255, 255, 255, 0.3);
        `;

        const label = document.createElement('div');
        label.style.cssText = `
            position: absolute;
            left: 45px;
            bottom: ${yPos - 8}px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.75rem;
        `;
        label.textContent = `${h}m`;

        markersContainer.appendChild(marker);
        markersContainer.appendChild(label);
    }
}

// ============================================
// Initialization
// ============================================
function init() {
    state.simulation = new StoneThrowSimulation();
    setupControls();
    addHeightMarkers();

    // Initial stone position
    document.getElementById('stone').style.bottom = `${state.simulation.groundOffset}px`;

    updateUI();

    console.log('Stone Throw Simulation initialized');
    console.log(`Answer: Time to fall ≈ ${state.simulation.timeToFall.toFixed(1)} seconds`);
}

document.addEventListener('DOMContentLoaded', init);
