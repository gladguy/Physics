/**
 * Projectile Motion: KE at Highest Point Simulation
 * 
 * Physics Problem:
 * KE at apex = ¾ × Initial KE
 * Find the projection angle θ
 * 
 * Solution:
 * At apex: v_y = 0, only v_x = v₀ cos θ remains
 * KE_apex = ½m(v₀ cos θ)² = ½mv₀² × cos²θ
 * 
 * Given: KE_apex/KE_initial = ¾
 * cos²θ = 3/4
 * cos θ = √(3/4) = √3/2
 * θ = 30°
 */

class KEProjectileSimulation {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('projectileCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Physics parameters
        this.angle = 30; // degrees
        this.velocity = 20; // m/s
        this.g = 9.8; // m/s²
        this.mass = 1; // kg (simplified)

        // Animation state
        this.time = 0;
        this.timeStep = 0.05;
        this.isPlaying = false;
        this.animationId = null;

        // DOM elements
        this.angleSlider = document.getElementById('angle-slider');
        this.angleValue = document.getElementById('angle-value');
        this.velocitySlider = document.getElementById('velocity-slider');
        this.velocityValue = document.getElementById('velocity-value');
        this.angleButtons = document.querySelectorAll('.angle-btn');

        this.playBtn = document.getElementById('play-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.timeDisplay = document.getElementById('time-display');
        this.heightDisplay = document.getElementById('height-display');
        this.initialKEDisplay = document.getElementById('initial-ke');
        this.apexKEDisplay = document.getElementById('apex-ke');
        this.keRatioDisplay = document.getElementById('ke-ratio');
        this.conditionStatus = document.getElementById('condition-status');
        this.conditionItem = document.getElementById('condition-item');
        this.vxDisplay = document.getElementById('vx-display');

        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.updateDisplay();
        this.drawScene();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = 350;
    }

    setupEventListeners() {
        // Angle slider
        this.angleSlider.addEventListener('input', (e) => {
            this.updateAngle(parseInt(e.target.value));
        });

        // Velocity slider
        this.velocitySlider.addEventListener('input', (e) => {
            this.velocity = parseInt(e.target.value);
            this.velocityValue.textContent = `${this.velocity} m/s`;
            this.reset();
        });

        // Angle buttons
        this.angleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateAngle(parseInt(btn.dataset.angle));
            });
        });

        // Control buttons
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.stepBtn.addEventListener('click', () => this.step());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Quiz options
        this.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleQuizAnswer(e));
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.drawScene();
        });
    }

    updateAngle(newAngle) {
        this.angle = newAngle;
        this.angleSlider.value = this.angle;
        this.angleValue.textContent = `${this.angle}°`;

        // Update button states
        this.angleButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.angle) === this.angle) {
                btn.classList.add('active');
            }
        });

        this.reset();
    }

    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    calculateInitialKE() {
        return 0.5 * this.mass * this.velocity * this.velocity;
    }

    calculateApexKE() {
        const vx = this.velocity * Math.cos(this.toRadians(this.angle));
        return 0.5 * this.mass * vx * vx;
    }

    calculateTrajectory() {
        const radians = this.toRadians(this.angle);
        const vx = this.velocity * Math.cos(radians);
        const vy = this.velocity * Math.sin(radians);

        const tApex = vy / this.g;
        const tTotal = 2 * tApex;
        const hMax = (vy * vy) / (2 * this.g);
        const range = vx * tTotal;

        return { vx, vy, tApex, tTotal, hMax, range };
    }

    calculatePosition(t) {
        const radians = this.toRadians(this.angle);
        const vx = this.velocity * Math.cos(radians);
        const vy = this.velocity * Math.sin(radians);

        const x = vx * t;
        const y = vy * t - 0.5 * this.g * t * t;
        const vyCurrent = vy - this.g * t;
        const speed = Math.sqrt(vx * vx + vyCurrent * vyCurrent);
        const keCurrent = 0.5 * this.mass * speed * speed;

        return { x, y: Math.max(0, y), vx, vy: vyCurrent, speed, ke: keCurrent };
    }

    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = 0; x <= width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = 0; y <= height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Ground line
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, height - 30);
        this.ctx.lineTo(width, height - 30);
        this.ctx.stroke();

        // Ground fill
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, height - 30, width, 30);
    }

    drawTrajectory() {
        const { range, hMax, tTotal } = this.calculateTrajectory();
        if (range <= 0 || hMax <= 0) return 1;

        const padding = 50;
        const availableWidth = this.canvas.width - 2 * padding;
        const availableHeight = this.canvas.height - 80;

        const scaleX = availableWidth / range;
        const scaleY = availableHeight / (hMax * 1.2);
        const scale = Math.min(scaleX, scaleY);

        const groundY = this.canvas.height - 30;
        const originX = padding;

        // Draw full trajectory (dashed)
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();

        for (let t = 0; t <= tTotal; t += 0.05) {
            const pos = this.calculatePosition(t);
            const x = originX + pos.x * scale;
            const y = groundY - pos.y * scale;

            if (t === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw current trajectory (solid)
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        for (let t = 0; t <= this.time; t += 0.05) {
            const pos = this.calculatePosition(t);
            const x = originX + pos.x * scale;
            const y = groundY - pos.y * scale;

            if (t === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();

        return { scale, groundY, originX };
    }

    drawApexMarker(scaleInfo) {
        const { scale, groundY, originX } = scaleInfo;
        const { tApex, hMax } = this.calculateTrajectory();
        const apexPos = this.calculatePosition(tApex);

        const x = originX + apexPos.x * scale;
        const y = groundY - hMax * scale;

        // Horizontal line at apex
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(originX, y);
        this.ctx.lineTo(this.canvas.width - 50, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Apex marker
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Label
        this.ctx.fillStyle = '#10b981';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('Apex (v_y = 0)', x + 10, y - 10);
    }

    drawProjectile(scaleInfo) {
        const { scale, groundY, originX } = scaleInfo;
        const pos = this.calculatePosition(this.time);

        const x = originX + pos.x * scale;
        const y = groundY - pos.y * scale;

        // Draw projectile
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Velocity vector
        const vectorScale = 2;

        // Total velocity vector
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + pos.vx * vectorScale, y - pos.vy * vectorScale);
        this.ctx.stroke();

        // Draw arrowhead
        this.drawArrow(x, y, x + pos.vx * vectorScale, y - pos.vy * vectorScale, '#ef4444');

        // X component (green)
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + pos.vx * vectorScale, y);
        this.ctx.stroke();

        // Y component (purple)
        if (Math.abs(pos.vy) > 0.5) {
            this.ctx.strokeStyle = '#8b5cf6';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y - pos.vy * vectorScale);
            this.ctx.stroke();
        }

        return pos;
    }

    drawArrow(x1, y1, x2, y2, color) {
        const headLen = 10;
        const angle = Math.atan2(y1 - y2, x2 - x1);

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);
        this.ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 + headLen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 + headLen * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawEnergyBars(pos) {
        const initialKE = this.calculateInitialKE();
        const apexKE = this.calculateApexKE();
        const currentKE = pos.ke;

        const barWidth = 25;
        const barMaxHeight = 80;
        const barX = this.canvas.width - 120;
        const barY = 30;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX - 10, barY - 20, 130, barMaxHeight + 50);

        // Initial KE bar
        const initialHeight = barMaxHeight;
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(barX, barY + barMaxHeight - initialHeight, barWidth, initialHeight);

        // Apex KE bar
        const apexHeight = (apexKE / initialKE) * barMaxHeight;
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(barX + 35, barY + barMaxHeight - apexHeight, barWidth, apexHeight);

        // Current KE bar
        const currentHeight = Math.min((currentKE / initialKE) * barMaxHeight, barMaxHeight);
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillRect(barX + 70, barY + barMaxHeight - currentHeight, barWidth, currentHeight);

        // Labels
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Init', barX + barWidth / 2, barY + barMaxHeight + 15);
        this.ctx.fillText('Apex', barX + 35 + barWidth / 2, barY + barMaxHeight + 15);
        this.ctx.fillText('Now', barX + 70 + barWidth / 2, barY + barMaxHeight + 15);

        // Ratio display
        const ratio = apexKE / initialKE;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = Math.abs(ratio - 0.75) < 0.01 ? '#10b981' : '#e2e8f0';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Ratio: ${ratio.toFixed(3)}`, barX - 5, barY - 5);
    }

    drawScene() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        const scaleInfo = this.drawTrajectory();

        if (scaleInfo && typeof scaleInfo === 'object') {
            this.drawApexMarker(scaleInfo);
            const pos = this.drawProjectile(scaleInfo);
            this.drawEnergyBars(pos);
        }
    }

    updateDisplay() {
        const pos = this.calculatePosition(this.time);
        const initialKE = this.calculateInitialKE();
        const apexKE = this.calculateApexKE();
        const ratio = apexKE / initialKE;
        const vx = this.velocity * Math.cos(this.toRadians(this.angle));

        this.timeDisplay.textContent = `${this.time.toFixed(2)} s`;
        this.heightDisplay.textContent = `${pos.y.toFixed(2)} m`;
        this.initialKEDisplay.textContent = `${initialKE.toFixed(1)} J`;
        this.apexKEDisplay.textContent = `${apexKE.toFixed(1)} J`;
        this.keRatioDisplay.textContent = ratio.toFixed(3);
        this.vxDisplay.textContent = `${vx.toFixed(1)} m/s`;

        // Check if condition is met (ratio = 0.75)
        if (Math.abs(ratio - 0.75) < 0.01) {
            this.conditionStatus.textContent = '✓ MET';
            this.conditionStatus.style.color = '#10b981';
            this.conditionItem.classList.add('met');
            this.conditionItem.classList.remove('not-met');
        } else {
            this.conditionStatus.textContent = '✗ NOT MET';
            this.conditionStatus.style.color = '#ef4444';
            this.conditionItem.classList.add('not-met');
            this.conditionItem.classList.remove('met');
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        const { tTotal } = this.calculateTrajectory();

        if (this.time >= tTotal - 0.01) {
            this.time = 0;
        }

        this.isPlaying = true;
        this.playBtn.innerHTML = '<span class="icon">⏸</span> Pause';
        this.animate();
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Play';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    step() {
        const { tTotal } = this.calculateTrajectory();

        if (this.time < tTotal) {
            this.time += 0.1;
            if (this.time > tTotal) this.time = tTotal;
            this.drawScene();
            this.updateDisplay();
        }
    }

    reset() {
        this.pause();
        this.time = 0;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Play';
        this.drawScene();
        this.updateDisplay();
    }

    animate() {
        if (!this.isPlaying) return;

        const { tTotal } = this.calculateTrajectory();

        if (this.time < tTotal) {
            this.time += this.timeStep;
            this.drawScene();
            this.updateDisplay();
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.time = tTotal;
            this.drawScene();
            this.updateDisplay();
            this.pause();
        }
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
            this.quizFeedback.textContent = '✓ Correct! cos²(30°) = 3/4, so KE_apex/KE_initial = ¾';
        } else {
            option.classList.add('wrong');
            this.quizFeedback.classList.add('wrong');
            this.quizFeedback.textContent = '✗ Incorrect. θ = 30° because cos²(30°) = (√3/2)² = 3/4';
        }
    }
}

// Initialize simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    new KEProjectileSimulation();
});
