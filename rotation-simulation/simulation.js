/**
 * Earth's Rotation Effect on Gravity Simulation
 * 
 * Physics Problem:
 * Statement I: Rotation of Earth affects g (TRUE)
 * Statement II: Effect minimum at equator, max at poles (FALSE - it's opposite!)
 * 
 * Formula: g' = g - ω²R cos²θ
 * 
 * At Equator (θ = 0°): cos²(0°) = 1 → Maximum reduction
 * At Poles (θ = 90°): cos²(90°) = 0 → No reduction
 * 
 * Answer: Option B (Statement I true, Statement II false)
 */

class RotationSimulation {
    constructor() {
        // Physical constants
        this.g = 9.8; // m/s² (actual gravitational acceleration)
        this.omega = 7.2921159e-5; // rad/s (Earth's angular velocity)
        this.R = 6.371e6; // m (Earth's radius)

        // Calculated values
        this.centrifugalAtEquator = Math.pow(this.omega, 2) * this.R; // ω²R at equator
        this.gAtEquator = this.g - this.centrifugalAtEquator; // ~9.766 m/s² (simplified)
        this.gAtPoles = this.g; // Full g at poles (no centrifugal effect)

        // Animation state
        this.isRotating = false;
        this.animationId = null;

        // DOM elements
        this.earth = document.getElementById('earth');
        this.playBtn = document.getElementById('play-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.toggleRotation());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });
    }

    toggleRotation() {
        if (this.isRotating) {
            this.stopRotation();
        } else {
            this.startRotation();
        }
    }

    startRotation() {
        this.isRotating = true;
        this.earth.classList.add('rotating');
        this.playBtn.innerHTML = '<span class="icon">⏸</span> Pause';
    }

    stopRotation() {
        this.isRotating = false;
        this.earth.classList.remove('rotating');
        this.playBtn.innerHTML = '<span class="icon">▶</span> Start Rotation';
    }

    reset() {
        this.stopRotation();

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
            this.quizFeedback.textContent = '✓ Correct! The effect is MAX at equator (cos²0°=1) and ZERO at poles (cos²90°=0).';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. Answer is B: Statement I is true (rotation affects g), Statement II is false (effect is max at equator, not poles).';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new RotationSimulation();
});
