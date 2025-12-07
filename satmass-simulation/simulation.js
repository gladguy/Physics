/**
 * Satellite Mass vs. Orbital Speed Simulation
 * 
 * Physics Problem:
 * Two satellites A and B move in the same orbit around Earth.
 * Mass of B = 2 × Mass of A
 * 
 * Key Concept:
 * Orbital speed is INDEPENDENT of satellite mass!
 * v = √(GM/r) - no 'm' in formula
 * 
 * But kinetic energy IS proportional to mass:
 * KE = ½mv² → KE_B = 2 × KE_A
 */

class SatelliteSimulation {
    constructor() {
        // Physics constants
        this.G = 6.67430e-11; // Gravitational constant (m³/kg/s²)
        this.M_earth = 5.972e24; // Earth mass (kg)
        this.R_earth = 6371; // Earth radius (km)

        // Orbit parameters
        this.orbitRadius = 6871; // km (500 km above Earth surface)
        this.massRatio = 2; // m_B / m_A

        // Animation state
        this.angleA = 0; // radians
        this.angleB = Math.PI / 6; // Start 30° ahead
        this.isPlaying = false;
        this.animationId = null;
        this.angularSpeed = 0.015; // rad/frame for visualization

        // DOM elements
        this.animationArea = document.getElementById('animation-area');
        this.earth = document.getElementById('earth');
        this.orbitPath = document.getElementById('orbit-path');
        this.satelliteA = document.getElementById('satellite-a');
        this.satelliteB = document.getElementById('satellite-b');
        this.velocityA = document.getElementById('velocity-a');
        this.velocityB = document.getElementById('velocity-b');

        // Data displays
        this.speedADisplay = document.getElementById('speed-a');
        this.speedBDisplay = document.getElementById('speed-b');
        this.energyADisplay = document.getElementById('energy-a');
        this.energyBDisplay = document.getElementById('energy-b');
        this.massADisplay = document.getElementById('mass-a');
        this.massBDisplay = document.getElementById('mass-b');
        this.radiusDisplay = document.getElementById('radius-value');
        this.angleADisplay = document.getElementById('angle-a');
        this.angleBDisplay = document.getElementById('angle-b');
        this.ratioDisplay = document.getElementById('ratio-value');

        // Buttons
        this.playBtn = document.getElementById('play-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        // Quiz elements
        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVisualization();
        this.updateCalculations();
        this.updatePositions();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.setupVisualization();
            this.updatePositions();
        });
    }

    setupVisualization() {
        const areaWidth = this.animationArea.clientWidth;
        const areaHeight = this.animationArea.clientHeight;

        // Calculate orbit radius in pixels (leave room for satellites)
        const maxRadius = Math.min(areaWidth, areaHeight) / 2 - 50;
        this.orbitRadiusPx = maxRadius;

        // Center coordinates
        this.centerX = areaWidth / 2;
        this.centerY = areaHeight / 2;

        // Set orbit path size
        this.orbitPath.style.width = `${this.orbitRadiusPx * 2}px`;
        this.orbitPath.style.height = `${this.orbitRadiusPx * 2}px`;
    }

    calculateOrbitalSpeed() {
        // v = √(GM/r)
        const r = this.orbitRadius * 1000; // Convert km to m
        return Math.sqrt(this.G * this.M_earth / r);
    }

    updateCalculations() {
        // Calculate orbital speed (same for both satellites!)
        const orbitalSpeed = this.calculateOrbitalSpeed();
        const speedKmS = (orbitalSpeed / 1000).toFixed(2);

        // Update speed displays (EQUAL for both)
        this.speedADisplay.textContent = `${speedKmS} km/s`;
        this.speedBDisplay.textContent = `${speedKmS} km/s`;

        // Update energy displays (proportional to mass)
        this.energyADisplay.textContent = 'KE';
        this.energyBDisplay.textContent = `${this.massRatio}KE`;

        // Update mass displays
        this.massADisplay.textContent = 'm';
        this.massBDisplay.textContent = `${this.massRatio}m`;

        // Update data panel
        this.radiusDisplay.textContent = `${this.orbitRadius} km`;
        this.ratioDisplay.textContent = this.massRatio.toString();
    }

    updatePositions() {
        // Calculate satellite positions
        const xA = this.centerX + this.orbitRadiusPx * Math.cos(this.angleA);
        const yA = this.centerY + this.orbitRadiusPx * Math.sin(this.angleA);

        const xB = this.centerX + this.orbitRadiusPx * Math.cos(this.angleB);
        const yB = this.centerY + this.orbitRadiusPx * Math.sin(this.angleB);

        // Update satellite positions
        this.satelliteA.style.left = `${xA}px`;
        this.satelliteA.style.top = `${yA}px`;

        this.satelliteB.style.left = `${xB}px`;
        this.satelliteB.style.top = `${yB}px`;

        // Update velocity vectors (tangent to orbit = angle + 90°)
        const vectorLength = 40;

        this.velocityA.style.left = `${xA}px`;
        this.velocityA.style.top = `${yA}px`;
        this.velocityA.style.width = `${vectorLength}px`;
        this.velocityA.style.transform = `rotate(${this.angleA + Math.PI / 2}rad)`;

        this.velocityB.style.left = `${xB}px`;
        this.velocityB.style.top = `${yB}px`;
        this.velocityB.style.width = `${vectorLength}px`;
        this.velocityB.style.transform = `rotate(${this.angleB + Math.PI / 2}rad)`;

        // Update angle displays
        const angleADeg = ((this.angleA * 180 / Math.PI) % 360).toFixed(0);
        const angleBDeg = ((this.angleB * 180 / Math.PI) % 360).toFixed(0);
        this.angleADisplay.textContent = `${angleADeg}°`;
        this.angleBDisplay.textContent = `${angleBDeg}°`;
    }

    animate() {
        if (!this.isPlaying) return;

        // Both satellites move at SAME angular speed (same orbit = same period)
        this.angleA += this.angularSpeed;
        this.angleB += this.angularSpeed;

        // Keep angles within 0-2π
        if (this.angleA > 2 * Math.PI) this.angleA -= 2 * Math.PI;
        if (this.angleB > 2 * Math.PI) this.angleB -= 2 * Math.PI;

        this.updatePositions();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.playBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.animate();
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.pause();

        // Reset angles
        this.angleA = 0;
        this.angleB = Math.PI / 6;

        // Reset buttons
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = true;

        // Reset quiz
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('correct', 'wrong');
            option.disabled = false;
        });
        this.quizFeedback.classList.remove('show', 'correct', 'wrong');
        this.quizFeedback.textContent = '';

        // Update displays
        this.updateCalculations();
        this.updatePositions();
    }

    handleQuizAnswer(e) {
        const option = e.target;
        const isCorrect = option.dataset.answer === 'correct';

        // Disable all options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(opt => {
            opt.disabled = true;
            if (opt.dataset.answer === 'correct') {
                opt.classList.add('correct');
            }
        });

        // Show feedback
        this.quizFeedback.classList.add('show');

        if (isCorrect) {
            option.classList.add('correct');
            this.quizFeedback.classList.add('correct');
            this.quizFeedback.textContent = '✓ Correct! Orbital speed v = √(GM/r) is independent of satellite mass. The mass cancels out in the force balance equation!';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. The correct answer is: Orbital speeds are equal. Mass cancels out when balancing gravitational and centripetal forces.';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new SatelliteSimulation();
});
