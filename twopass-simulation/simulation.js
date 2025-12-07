/**
 * Two Passes Through Same Height Simulation
 * 
 * Physics Problem:
 * A stone is projected vertically up with velocity 39.2 m/s.
 * It passes through height 58.8m twice (once up, once down).
 * Time interval between two passes = 4 seconds.
 * 
 * Solution:
 * h = ut - ½gt²
 * 58.8 = 39.2t - 4.9t²
 * 4.9t² - 39.2t + 58.8 = 0
 * t² - 8t + 12 = 0
 * (t - 2)(t - 6) = 0
 * t = 2s (going up), t = 6s (coming down)
 * Δt = 6 - 2 = 4 seconds
 */

class TwoPassSimulation {
    constructor() {
        // Physics constants
        this.g = 9.8; // m/s²
        this.u = 39.2; // Initial velocity (m/s)
        this.targetHeight = 58.8; // Target height (m)

        // Calculated values
        this.maxHeight = (this.u * this.u) / (2 * this.g); // 78.4 m
        this.timeToMax = this.u / this.g; // 4 s
        this.totalTime = 2 * this.u / this.g; // 8 s
        this.timePass1 = 2; // s (going up)
        this.timePass2 = 6; // s (coming down)
        this.timeInterval = this.timePass2 - this.timePass1; // 4 s

        // Animation state
        this.currentTime = 0;
        this.isPlaying = false;
        this.animationId = null;
        this.pass1Shown = false;
        this.pass2Shown = false;

        // DOM elements
        this.stone = document.getElementById('stone');
        this.animationArea = document.getElementById('animation-area');
        this.targetHeightLine = document.getElementById('target-height-line');
        this.maxHeightLine = document.getElementById('max-height-line');
        this.passUpMarker = document.getElementById('pass-up-marker');
        this.passDownMarker = document.getElementById('pass-down-marker');
        this.timelineProgress = document.getElementById('timeline-progress');
        this.heightValue = document.getElementById('height-value');
        this.velocityValue = document.getElementById('velocity-value');
        this.timeValue = document.getElementById('time-value');
        this.phaseValue = document.getElementById('phase-value');
        this.currentHeightDisplay = document.getElementById('current-height-display');
        this.intervalValue = document.getElementById('interval-value');

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
        this.reset();
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
        window.addEventListener('resize', () => this.setupVisualization());
    }

    setupVisualization() {
        const areaHeight = this.animationArea.clientHeight - 40; // Subtract ground height
        const scale = areaHeight / (this.maxHeight + 10); // Buffer for max height

        // Position target height line (58.8m)
        const targetBottom = 40 + (this.targetHeight * scale);
        this.targetHeightLine.style.bottom = `${targetBottom}px`;

        // Position max height line (78.4m)
        const maxBottom = 40 + (this.maxHeight * scale);
        this.maxHeightLine.style.bottom = `${maxBottom}px`;

        // Position pass markers at target height
        this.passUpMarker.style.bottom = `${targetBottom - 25}px`;
        this.passDownMarker.style.bottom = `${targetBottom - 25}px`;

        // Store scale for animation
        this.scale = scale;
    }

    calculatePosition(t) {
        // h = ut - ½gt²
        let height = this.u * t - 0.5 * this.g * t * t;
        height = Math.max(0, height);

        // v = u - gt
        let velocity = this.u - this.g * t;

        return { height, velocity };
    }

    updateDisplay(height, velocity, time) {
        // Update data values
        this.heightValue.textContent = `${height.toFixed(1)} m`;
        this.velocityValue.textContent = `${velocity.toFixed(1)} m/s`;
        this.timeValue.textContent = `${time.toFixed(1)} s`;
        this.currentHeightDisplay.textContent = `${height.toFixed(1)} m`;

        // Update phase
        let phase = 'Ready';
        if (time > 0 && time < this.timeToMax) {
            phase = 'Rising ↑';
            this.phaseValue.style.color = '#00e676';
        } else if (Math.abs(time - this.timeToMax) < 0.1) {
            phase = 'At Max ●';
            this.phaseValue.style.color = '#ffd700';
        } else if (time > this.timeToMax && time < this.totalTime) {
            phase = 'Falling ↓';
            this.phaseValue.style.color = '#ff9f1c';
        } else if (time >= this.totalTime) {
            phase = 'Landed ✓';
            this.phaseValue.style.color = '#00d4ff';
        }
        this.phaseValue.textContent = phase;

        // Update timeline progress
        const progress = (time / this.totalTime) * 100;
        this.timelineProgress.style.width = `${Math.min(progress, 100)}%`;
    }

    updateStonePosition(height) {
        const bottomPos = 40 + (height * this.scale);
        this.stone.style.bottom = `${bottomPos}px`;
    }

    checkPassMarkers(time, height) {
        const tolerance = 2; // Height tolerance in meters

        // Check for first pass (going up around t=2s)
        if (!this.pass1Shown && time >= 1.8 && time <= 2.2 && Math.abs(height - this.targetHeight) < tolerance) {
            this.passUpMarker.classList.add('visible');
            this.pass1Shown = true;
        }

        // Check for second pass (coming down around t=6s)
        if (!this.pass2Shown && time >= 5.8 && time <= 6.2 && Math.abs(height - this.targetHeight) < tolerance) {
            this.passDownMarker.classList.add('visible');
            this.pass2Shown = true;
        }
    }

    animate() {
        if (!this.isPlaying) return;

        const { height, velocity } = this.calculatePosition(this.currentTime);

        this.updateStonePosition(height);
        this.updateDisplay(height, velocity, this.currentTime);
        this.checkPassMarkers(this.currentTime, height);

        // Increment time (slow motion factor for better visualization)
        this.currentTime += 0.04; // ~25 fps equivalent

        // Check if animation should stop
        if (this.currentTime >= this.totalTime + 0.5) {
            this.stop();
            return;
        }

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

    stop() {
        this.pause();
        this.currentTime = this.totalTime;

        // Ensure stone is at ground level
        this.updateStonePosition(0);
        this.updateDisplay(0, -this.u, this.totalTime);
    }

    reset() {
        this.pause();
        this.currentTime = 0;
        this.pass1Shown = false;
        this.pass2Shown = false;

        // Reset stone position
        this.updateStonePosition(0);

        // Reset display values
        this.heightValue.textContent = '0 m';
        this.velocityValue.textContent = `${this.u} m/s`;
        this.timeValue.textContent = '0.0 s';
        this.phaseValue.textContent = 'Ready';
        this.phaseValue.style.color = '#00e676';
        this.currentHeightDisplay.textContent = '0 m';

        // Reset timeline
        this.timelineProgress.style.width = '0%';

        // Hide pass markers
        this.passUpMarker.classList.remove('visible');
        this.passDownMarker.classList.remove('visible');

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
            this.quizFeedback.textContent = '✓ Correct! The time interval between the two passes is 4 seconds (6s - 2s = 4s).';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. The stone passes 58.8m at t=2s (up) and t=6s (down). Δt = 4 seconds.';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new TwoPassSimulation();
});
