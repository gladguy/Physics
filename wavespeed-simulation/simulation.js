/**
 * Wave Speed in Accelerating Car Simulation
 * 
 * Physics Problem:
 * Ball of mass M suspended by string of mass m << M
 * At rest: wave speed v₀ = 60 m/s
 * Accelerating: wave speed v = 60.5 m/s
 * Find acceleration 'a' in terms of g
 * 
 * Solution:
 * Wave speed: v = √(T/μ)
 * At rest: T₀ = Mg → v₀ = √(Mg/μ) = 60 m/s
 * Accelerating: T = M√(g² + a²) → v = √(M√(g² + a²)/μ)
 * 
 * v/v₀ = ⁴√(1 + a²/g²)
 * 60.5/60 = 1.0083
 * (1.0083)⁴ = 1.0337
 * 1 + a²/g² = 1.0337
 * a²/g² = 0.0337
 * a/g = 0.1835 ≈ 1/5.45 ≈ g/5
 */

class WaveSpeedSimulation {
    constructor() {
        // Physics constants
        this.g = 9.8; // m/s²
        this.v0 = 60.0; // Wave speed at rest (m/s)
        this.v = 60.5; // Wave speed while accelerating (m/s)

        // Calculated values
        this.aOverG = this.calculateAcceleration();
        this.theta = Math.atan(this.aOverG); // Pendulum angle
        this.effectiveG = Math.sqrt(1 + this.aOverG * this.aOverG);

        // DOM elements
        this.stringRest = document.getElementById('string-rest');
        this.stringAccel = document.getElementById('string-accel');
        this.ballRest = document.getElementById('ball-rest');
        this.ballAccel = document.getElementById('ball-accel');
        this.pendulumAccel = document.getElementById('pendulum-accel');
        this.waveRest = document.getElementById('wave-rest');
        this.waveAccel = document.getElementById('wave-accel');

        // Display elements
        this.accelDisplay = document.getElementById('accel-display');
        this.speedAccelDisplay = document.getElementById('speed-accel');
        this.speedRatioDisplay = document.getElementById('speed-ratio');
        this.tensionRestDisplay = document.getElementById('tension-rest');
        this.tensionAccelDisplay = document.getElementById('tension-accel');
        this.angleDisplay = document.getElementById('angle-value');
        this.effectiveGDisplay = document.getElementById('effective-g');
        this.tensionLabel = document.getElementById('tension-label');

        // Buttons
        this.playBtn = document.getElementById('play-btn');
        this.resetBtn = document.getElementById('reset-btn');

        // Quiz elements
        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');

        this.init();
    }

    calculateAcceleration() {
        // v/v₀ = ⁴√(1 + a²/g²)
        // (v/v₀)⁴ = 1 + a²/g²
        // a²/g² = (v/v₀)⁴ - 1
        // a/g = √((v/v₀)⁴ - 1)

        const ratio = this.v / this.v0;
        const ratioFourth = Math.pow(ratio, 4);
        const aOverGSquared = ratioFourth - 1;
        return Math.sqrt(aOverGSquared);
    }

    init() {
        this.setupEventListeners();
        this.setupPendulum();
        this.updateDisplays();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.sendWavePulse());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });
    }

    setupPendulum() {
        // Pendulum at rest - vertical
        this.stringRest.style.transform = 'translateX(-50%)';

        // Pendulum accelerating - tilted BACKWARD (to the left when car accelerates right)
        // Negative angle because pendulum swings opposite to acceleration direction
        const thetaDeg = this.theta * 180 / Math.PI;
        this.stringAccel.style.transform = `translateX(-50%) rotate(${-thetaDeg}deg)`;

        // Update ball position for accelerating pendulum
        // Ball moves to the LEFT (backward) when car accelerates right
        const stringLength = 80;
        const offsetX = -stringLength * Math.sin(this.theta); // Negative for backward tilt
        const offsetY = stringLength * Math.cos(this.theta);

        this.ballAccel.style.top = `${offsetY}px`;
        this.ballAccel.style.left = `calc(50% + ${offsetX}px)`;
    }

    updateDisplays() {
        // Acceleration display
        this.accelDisplay.textContent = `g/${(1 / this.aOverG).toFixed(0)}`;

        // Speed display
        this.speedAccelDisplay.textContent = `${this.v.toFixed(1)} m/s`;

        // Speed ratio
        this.speedRatioDisplay.textContent = (this.v / this.v0).toFixed(4);

        // Tension displays
        this.tensionRestDisplay.textContent = 'Mg';
        this.tensionAccelDisplay.textContent = `${this.effectiveG.toFixed(2)}Mg`;

        // Angle display
        const thetaDeg = this.theta * 180 / Math.PI;
        this.angleDisplay.textContent = `${thetaDeg.toFixed(1)}°`;

        // Effective g display
        this.effectiveGDisplay.textContent = `${this.effectiveG.toFixed(2)}g`;

        // Tension label in force diagram
        this.tensionLabel.textContent = `T = ${this.effectiveG.toFixed(2)}Mg`;
    }

    sendWavePulse() {
        // Reset wave pulses
        this.waveRest.classList.remove('active');
        this.waveAccel.classList.remove('active');

        // Force reflow to restart animation
        void this.waveRest.offsetWidth;
        void this.waveAccel.offsetWidth;

        // Activate wave pulses
        this.waveRest.classList.add('active');
        this.waveAccel.classList.add('active');

        // Accelerating wave is slightly faster - adjust animation duration
        const baseTime = 1.5; // seconds
        const accelTime = baseTime * (this.v0 / this.v);
        this.waveAccel.style.animationDuration = `${accelTime}s`;
    }

    reset() {
        // Reset wave pulses
        this.waveRest.classList.remove('active');
        this.waveAccel.classList.remove('active');

        // Reset quiz
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('correct', 'wrong');
            option.disabled = false;
        });
        this.quizFeedback.classList.remove('show', 'correct', 'wrong');
        this.quizFeedback.textContent = '';
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
            this.quizFeedback.textContent = '✓ Correct! The acceleration is g/5 ≈ 0.2g. The small increase in wave speed (0.5 m/s) corresponds to this moderate acceleration.';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. The answer is g/5. Using v/v₀ = ⁴√(1 + a²/g²), we get a ≈ 0.1835g ≈ g/5.45 ≈ g/5.';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new WaveSpeedSimulation();
});
