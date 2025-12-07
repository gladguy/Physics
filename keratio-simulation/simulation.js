/**
 * Projectile Motion: Kinetic Energy Ratio Simulation
 * 
 * Physics Problem:
 * KE at highest point = (3/4) × Initial KE
 * Find the projection angle θ
 * 
 * Solution:
 * At highest point: v = v_x = v₀ cos θ (v_y = 0)
 * KE_h / KE_i = (v_x)² / (v₀)² = cos²θ
 * cos²θ = 3/4
 * cos θ = √(3/4) = √3/2
 * θ = 30°
 */

class KEratioSimulation {
    constructor() {
        // Physics parameters
        this.v0 = 20; // Initial speed (m/s)
        this.g = 9.8; // Gravity (m/s²)
        this.theta = 30; // Angle in degrees

        // Animation state
        this.isPlaying = false;
        this.time = 0;
        this.animationId = null;

        // DOM elements
        this.angleSlider = document.getElementById('angle-slider');
        this.angleValue = document.getElementById('angle-value');
        this.angleLabel = document.getElementById('angle-label');
        this.angleArc = document.getElementById('angle-arc');

        this.projectile = document.getElementById('projectile');
        this.trajectory = document.getElementById('trajectory');
        this.highestLine = document.getElementById('highest-line');

        this.velocityArrow = document.getElementById('velocity-arrow');
        this.vxArrow = document.getElementById('vx-arrow');
        this.vyArrow = document.getElementById('vy-arrow');

        this.keBar = document.getElementById('ke-bar');
        this.kePercent = document.getElementById('ke-percent');
        this.ratioValue = document.getElementById('ratio-value');
        this.matchStatus = document.getElementById('match-status');

        this.vxValue = document.getElementById('vx-value');
        this.vyValue = document.getElementById('vy-value');

        this.playBtn = document.getElementById('play-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        this.angleSlider.addEventListener('input', () => this.updateDisplay());
        this.playBtn.addEventListener('click', () => this.toggleAnimation());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });
    }

    updateDisplay() {
        this.theta = parseFloat(this.angleSlider.value);
        const thetaRad = this.theta * Math.PI / 180;

        // Update angle displays
        this.angleValue.textContent = `${this.theta}°`;
        this.angleLabel.textContent = `θ = ${this.theta}°`;

        // Update angle arc rotation
        const arcRotation = -90 + this.theta;
        this.angleArc.style.transform = `rotate(${-60 + this.theta}deg)`;

        // Calculate cos²θ (KE ratio)
        const cosTheta = Math.cos(thetaRad);
        const cosSqTheta = cosTheta * cosTheta;

        // Update KE displays
        const kePercentValue = Math.round(cosSqTheta * 100);
        this.keBar.style.width = `${kePercentValue}%`;
        this.kePercent.textContent = `${kePercentValue}%`;
        this.ratioValue.textContent = cosSqTheta.toFixed(3);

        // Check if matches target (3/4 = 0.75)
        const target = 0.75;
        const tolerance = 0.01;
        if (Math.abs(cosSqTheta - target) < tolerance) {
            this.matchStatus.textContent = '✓ Match!';
            this.matchStatus.classList.remove('no-match');
        } else {
            this.matchStatus.textContent = '✗ No match';
            this.matchStatus.classList.add('no-match');
        }

        // Update velocity component displays
        const sinTheta = Math.sin(thetaRad);
        this.vxValue.textContent = `= ${cosTheta.toFixed(3)}v`;
        this.vyValue.textContent = `= ${sinTheta.toFixed(3)}v (initial)`;

        // Update velocity arrow angles
        this.velocityArrow.style.transform = `rotate(${-this.theta}deg)`;
        this.vyArrow.style.width = `${Math.max(5, sinTheta * 40)}px`;
        this.vxArrow.style.width = `${Math.max(10, cosTheta * 50)}px`;

        // Update trajectory shape based on angle
        this.updateTrajectory();
    }

    updateTrajectory() {
        const thetaRad = this.theta * Math.PI / 180;

        // Calculate trajectory dimensions
        const timeToMax = this.v0 * Math.sin(thetaRad) / this.g;
        const maxHeight = this.v0 * Math.sin(thetaRad) * timeToMax - 0.5 * this.g * timeToMax * timeToMax;
        const totalTime = 2 * timeToMax;
        const range = this.v0 * Math.cos(thetaRad) * totalTime;

        // Scale for display
        const scale = 2;
        const width = Math.max(50, range * scale);
        const height = Math.max(20, maxHeight * scale);

        this.trajectory.style.width = `${width}px`;
        this.trajectory.style.height = `${height}px`;

        // Update highest line position
        const animArea = document.getElementById('animation-area');
        const groundHeight = 40;
        const maxDisplayHeight = animArea.clientHeight - groundHeight - 30;
        const lineTop = animArea.clientHeight - groundHeight - Math.min(height, maxDisplayHeight);
        this.highestLine.style.top = `${lineTop}px`;
    }

    toggleAnimation() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.playBtn.innerHTML = '<span class="icon">⏸</span> Pause';

        const thetaRad = this.theta * Math.PI / 180;
        const timeToMax = this.v0 * Math.sin(thetaRad) / this.g;
        const totalTime = 2 * timeToMax;

        const animate = () => {
            if (!this.isPlaying) return;

            // Calculate position
            const x = this.v0 * Math.cos(thetaRad) * this.time;
            const y = this.v0 * Math.sin(thetaRad) * this.time - 0.5 * this.g * this.time * this.time;

            // Scale for display
            const scale = 2;
            const baseX = 50;
            const baseY = 40;

            this.projectile.style.left = `${baseX + x * scale}px`;
            this.projectile.style.bottom = `${baseY + Math.max(0, y * scale)}px`;

            // Update velocity arrows
            const vy = this.v0 * Math.sin(thetaRad) - this.g * this.time;
            const vx = this.v0 * Math.cos(thetaRad);
            const currentAngle = Math.atan2(vy, vx) * 180 / Math.PI;

            this.velocityArrow.style.transform = `rotate(${-currentAngle}deg)`;
            this.vyArrow.style.width = `${Math.max(2, Math.abs(vy) * 2)}px`;
            this.vyArrow.style.transform = `rotate(${vy >= 0 ? -90 : 90}deg)`;

            // Increment time
            this.time += 0.05;

            // Check if landed
            if (this.time >= totalTime || y < 0) {
                this.pause();
                this.time = 0;
                return;
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Launch';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.pause();
        this.time = 0;

        // Reset projectile position
        this.projectile.style.left = '50px';
        this.projectile.style.bottom = '40px';

        // Reset angle to correct answer
        this.angleSlider.value = 30;

        // Reset velocity arrows
        this.velocityArrow.style.transform = `rotate(-30deg)`;
        this.vyArrow.style.transform = `rotate(-90deg)`;

        // Reset quiz
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('correct', 'wrong');
            option.disabled = false;
        });
        this.quizFeedback.classList.remove('show', 'correct', 'wrong');
        this.quizFeedback.textContent = '';

        this.updateDisplay();
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
            this.quizFeedback.textContent = '✓ Correct! At θ = 30°, cos²θ = (√3/2)² = 3/4, so KE at highest point is 3/4 of initial KE.';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. The answer is 30°. KE ratio = cos²θ = 3/4, so cos θ = √3/2, giving θ = 30°.';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new KEratioSimulation();
});
