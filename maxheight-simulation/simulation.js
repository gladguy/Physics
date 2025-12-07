/**
 * Maximum Height Problem Simulation
 * 
 * Physics Problem:
 * An object projected upward has velocity v = 9.8 m/s at half the maximum height.
 * Find the maximum height H.
 * 
 * Solution:
 * At max height H: v = 0, so u² = 2gH
 * At H/2: v² = u² - 2g(H/2) = 2gH - gH = gH
 * 
 * Given v = 9.8 m/s at H/2:
 * (9.8)² = gH
 * 96.04 = 9.8 × H
 * H = 9.8 m
 * 
 * Initial velocity u = √(2gH) = √(2 × 9.8 × 9.8) = 13.86 m/s
 */

class MaxHeightSimulation {
    constructor() {
        // Physical constants
        this.g = 9.8; // m/s²
        this.Hmax = 9.8; // meters (the answer)
        this.vHalf = 9.8; // m/s at H/2
        this.u = Math.sqrt(2 * this.g * this.Hmax); // 13.86 m/s

        // Calculated values
        this.timeToMax = this.u / this.g; // 1.414 s
        this.timeToHalf = (this.u - this.vHalf) / this.g; // 0.414 s

        // Animation state
        this.isPlaying = false;
        this.currentTime = 0;
        this.animationId = null;
        this.lastTimestamp = 0;

        // DOM elements
        this.projectile = document.getElementById('projectile');
        this.velocityArrow = document.getElementById('velocity-arrow');
        this.velocityLabel = document.getElementById('velocity-label');
        this.halfMarker = document.getElementById('half-marker');
        this.maxMarker = document.getElementById('max-marker');

        this.heightDisplay = document.getElementById('height-display');
        this.velocityDisplay = document.getElementById('velocity-display');
        this.timeDisplay = document.getElementById('time-display');
        this.phaseDisplay = document.getElementById('phase-display');

        this.playBtn = document.getElementById('play-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');

        // Container height for animation
        this.containerHeight = 280; // pixels for the trajectory area

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay(0, this.u, 0);
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.toggleAnimation());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });
    }

    toggleAnimation() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.currentTime >= this.timeToMax * 2) {
            this.currentTime = 0;
        }

        this.isPlaying = true;
        this.playBtn.innerHTML = '<span class="icon">⏸</span> Pause';
        this.lastTimestamp = 0;
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Resume';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.pause();
        this.currentTime = 0;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Launch';

        // Reset projectile position
        this.projectile.style.bottom = '0';
        this.velocityArrow.style.height = '40px';
        this.velocityArrow.classList.remove('down');

        // Reset markers
        this.halfMarker.classList.remove('active');
        this.maxMarker.classList.remove('active');

        // Reset quiz
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('correct', 'wrong');
            option.disabled = false;
        });
        this.quizFeedback.classList.remove('show', 'correct', 'wrong');
        this.quizFeedback.textContent = '';

        this.updateDisplay(0, this.u, 0);
    }

    animate(timestamp) {
        if (!this.isPlaying) return;

        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Slow motion factor (0.5x speed)
        this.currentTime += deltaTime * 0.5;

        // Calculate height and velocity
        let height = this.u * this.currentTime - 0.5 * this.g * this.currentTime * this.currentTime;
        let velocity = this.u - this.g * this.currentTime;

        // Clamp height
        if (height < 0) {
            height = 0;
            velocity = 0;
            this.pause();
            this.playBtn.innerHTML = '<span class="icon">▶</span> Replay';
        }

        if (height > this.Hmax) {
            height = this.Hmax;
        }

        // Update display
        this.updateDisplay(height, velocity, this.currentTime);

        // Update projectile position
        const heightPercent = (height / this.Hmax) * 100;
        this.projectile.style.bottom = `${heightPercent}%`;

        // Update velocity arrow
        const arrowHeight = Math.abs(velocity) * 3;
        this.velocityArrow.style.height = `${Math.max(arrowHeight, 5)}px`;

        if (velocity < 0) {
            this.velocityArrow.classList.add('down');
        } else {
            this.velocityArrow.classList.remove('down');
        }

        // Update velocity label
        this.velocityLabel.textContent = `${velocity.toFixed(1)} m/s`;

        // Highlight markers
        this.halfMarker.classList.toggle('active', Math.abs(height - this.Hmax / 2) < 0.3);
        this.maxMarker.classList.toggle('active', Math.abs(height - this.Hmax) < 0.2);

        if (this.isPlaying) {
            this.animationId = requestAnimationFrame((ts) => this.animate(ts));
        }
    }

    updateDisplay(height, velocity, time) {
        this.heightDisplay.textContent = height.toFixed(2) + ' m';
        this.velocityDisplay.textContent = velocity.toFixed(2) + ' m/s';
        this.timeDisplay.textContent = time.toFixed(2) + ' s';

        // Determine phase
        let phase = 'Ready';
        if (time > 0 && height > 0) {
            if (velocity > 0) {
                if (height < this.Hmax / 2) {
                    phase = 'Rising to H/2';
                } else {
                    phase = 'Rising to H_max';
                }
            } else if (velocity < 0) {
                phase = 'Falling';
            } else {
                phase = 'At Maximum';
            }
        } else if (time > 0) {
            phase = 'Landed';
        }

        this.phaseDisplay.querySelector('.data-value').textContent = phase;

        // Highlight when at half height
        const isAtHalf = Math.abs(height - this.Hmax / 2) < 0.3;
        this.phaseDisplay.style.borderColor = isAtHalf ? '#9d4edd' : '';
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
            this.quizFeedback.textContent = '✓ Correct! v² at H/2 = gH → (9.8)² = 9.8 × H → H = 9.8 m';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. From v² = gH: H = (9.8)²/9.8 = 9.8 m';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new MaxHeightSimulation();
});
