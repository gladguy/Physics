/**
 * Satellite with Half Escape Speed Simulation
 * 
 * Physics Problem:
 * Satellite orbital speed = ½ × Escape speed
 * Find height h above Earth's surface
 * 
 * Solution:
 * v_esc = √(2GM/R)  [escape speed from surface]
 * v_orb = √(GM/r)   [orbital speed at radius r]
 * 
 * Given: v_orb = ½ v_esc
 * √(GM/r) = ½ √(2GM/R)
 * 
 * Square both sides:
 * GM/r = ¼ × 2GM/R = GM/(2R)
 * 
 * Cancel GM:
 * 1/r = 1/(2R)
 * r = 2R
 * 
 * Height: h = r - R = 2R - R = R
 * 
 * Answer: h = R (one Earth radius above surface)
 */

class HalfEscapeSimulation {
    constructor() {
        // Physical constants
        this.G = 6.674e-11; // Gravitational constant (m³/kg/s²)
        this.M_earth = 5.972e24; // Earth mass (kg)
        this.R_earth = 6.371e6; // Earth radius (m)

        // Calculated values
        this.v_escape = Math.sqrt(2 * this.G * this.M_earth / this.R_earth); // ~11.2 km/s
        this.v_orbital = this.v_escape / 2; // Half escape speed
        this.orbitRadius = 2 * this.R_earth; // r = 2R
        this.height = this.R_earth; // h = R

        // Animation state
        this.isPlaying = false;
        this.angle = 0;
        this.animationId = null;

        // DOM elements
        this.satellite = document.getElementById('satellite');
        this.orbitPath = document.getElementById('orbit-path');
        this.velocityArrow = document.getElementById('velocity-arrow');
        this.animationArea = document.getElementById('animation-area');

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
        this.playBtn.addEventListener('click', () => this.toggleAnimation());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });

        // Handle resize
        window.addEventListener('resize', () => this.updateDisplay());
    }

    updateDisplay() {
        // Get animation area dimensions
        const rect = this.animationArea.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Earth radius in pixels (visual representation)
        const earthRadiusPx = 50;

        // Orbit radius in pixels (2R = 2 * earthRadius)
        const orbitRadiusPx = earthRadiusPx * 2;

        // Update orbit path
        this.orbitPath.style.width = `${orbitRadiusPx * 2}px`;
        this.orbitPath.style.height = `${orbitRadiusPx * 2}px`;

        // Update satellite position if not animating
        if (!this.isPlaying) {
            this.updateSatellitePosition(centerX, centerY, orbitRadiusPx);
        }
    }

    updateSatellitePosition(centerX, centerY, orbitRadiusPx) {
        const x = centerX + orbitRadiusPx * Math.cos(this.angle);
        const y = centerY + orbitRadiusPx * Math.sin(this.angle);

        this.satellite.style.left = `${x}px`;
        this.satellite.style.top = `${y}px`;

        // Update velocity arrow direction (tangent to orbit)
        const arrowAngle = this.angle + Math.PI / 2; // Perpendicular to radius
        this.velocityArrow.style.transform = `rotate(${arrowAngle}rad)`;
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

        const rect = this.animationArea.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const earthRadiusPx = 50;
        const orbitRadiusPx = earthRadiusPx * 2;

        const animate = () => {
            if (!this.isPlaying) return;

            // Angular speed (faster at lower orbits - Kepler's 3rd law visually represented)
            const angularSpeed = 0.02;
            this.angle += angularSpeed;

            this.updateSatellitePosition(centerX, centerY, orbitRadiusPx);

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Start Orbit';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.pause();
        this.angle = 0;

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
            this.quizFeedback.textContent = '✓ Correct! When v_orb = ½v_esc, the orbit radius r = 2R, so height h = r - R = R.';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. The answer is R. From v_orb = ½v_esc, squaring gives r = 2R, so h = R.';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new HalfEscapeSimulation();
});
