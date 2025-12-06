/**
 * Gravitational Force Geometric Series Simulation
 * Demonstrates how gravitational forces from point masses at geometric positions
 * converge to (4/3)GMm
 */

// ============================================
// Configuration & Constants
// ============================================
const CONFIG = {
    canvas: {
        minWidth: 800,
        minHeight: 600,
        padding: 60,
        scale: 50, // pixels per meter
    },
    physics: {
        G: 1, // Gravitational constant (normalized)
        numMasses: 10, // Number of point masses to simulate
    },
    animation: {
        baseDuration: 1000, // Base duration for animations in ms
        vectorGrowDuration: 800,
    },
    colors: {
        centralMass: '#f59e0b',
        pointMass: '#3b82f6',
        forceVector: '#10b981',
        activeForce: '#ec4899',
        grid: 'rgba(255, 255, 255, 0.1)',
        axis: 'rgba(255, 255, 255, 0.3)',
        text: '#f3f4f6',
        textMuted: '#9ca3af',
    }
};

// Animation states
const STATES = {
    INITIAL: 'initial',
    SHOWING_MASSES: 'showing_masses',
    CALCULATING_FORCES: 'calculating_forces',
    ANIMATING_VECTOR: 'animating_vector',
    SUMMING: 'summing',
    COMPLETE: 'complete',
    PAUSED: 'paused',
};

// ============================================
// Simulation State
// ============================================
let state = {
    // Animation state
    currentState: STATES.INITIAL,
    previousState: null,
    isPlaying: false,
    speed: 1,

    // Physics parameters
    M: 1, // Central mass
    m: 1, // Point mass value

    // Display options
    showVectors: true,
    showGrid: true,
    showLabels: true,

    // Animation progress
    currentForceIndex: 0,
    vectorProgress: 0,
    runningTotal: 0,

    // Masses data
    pointMasses: [],
    forces: [],

    // Canvas context
    canvas: null,
    ctx: null,

    // Animation timing
    lastTimestamp: 0,
    animationFrame: null,
};

// ============================================
// Point Mass Class
// ============================================
class PointMass {
    constructor(x, y, mass, index) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.index = index;
        this.radius = 12;
        this.opacity = 0;
        this.showForce = false;
        this.forceProgress = 0;
    }

    get distance() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get force() {
        if (this.distance === 0) return 0;
        return (CONFIG.physics.G * state.M * this.mass) / (this.distance * this.distance);
    }

    get label() {
        return `F${this.x}`;
    }
}

// ============================================
// Canvas Setup & Rendering
// ============================================
function initCanvas() {
    state.canvas = document.getElementById('simulation-canvas');
    state.ctx = state.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = state.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    state.canvas.width = Math.max(rect.width, CONFIG.canvas.minWidth) * dpr;
    state.canvas.height = Math.max(rect.height, CONFIG.canvas.minHeight) * dpr;

    state.canvas.style.width = `${rect.width}px`;
    state.canvas.style.height = `${rect.height}px`;

    state.ctx.scale(dpr, dpr);

    // Store logical dimensions
    state.canvasWidth = rect.width;
    state.canvasHeight = rect.height;
}

function worldToCanvas(x, y) {
    const originX = CONFIG.canvas.padding + 30;
    const originY = state.canvasHeight / 2;

    return {
        x: originX + x * CONFIG.canvas.scale,
        y: originY - y * CONFIG.canvas.scale
    };
}

function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
}

// ============================================
// Drawing Functions
// ============================================
function drawGrid() {
    if (!state.showGrid) return;

    const ctx = state.ctx;
    const origin = worldToCanvas(0, 0);

    ctx.strokeStyle = CONFIG.colors.grid;
    ctx.lineWidth = 1;

    // Draw vertical grid lines every meter
    for (let x = 0; x <= 20; x++) {
        const pos = worldToCanvas(x, 0);
        ctx.beginPath();
        ctx.moveTo(pos.x, 0);
        ctx.lineTo(pos.x, state.canvasHeight);
        ctx.stroke();
    }

    // Draw horizontal center line
    ctx.strokeStyle = CONFIG.colors.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(state.canvasWidth, origin.y);
    ctx.stroke();

    // Draw axis labels if enabled
    if (state.showLabels) {
        ctx.fillStyle = CONFIG.colors.textMuted;
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (let x = 0; x <= 16; x *= 2 || (x = 1)) {
            const pos = worldToCanvas(x, 0);
            ctx.fillText(`${x}m`, pos.x, origin.y + 20);
            if (x === 0) x = 0.5; // Start from 1 after 0
        }
    }
}

function drawCentralMass() {
    const ctx = state.ctx;
    const pos = worldToCanvas(0, 0);

    // Glow effect
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 40);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Main circle
    ctx.fillStyle = CONFIG.colors.centralMass;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Label
    if (state.showLabels) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', pos.x, pos.y);
    }
}

function drawPointMass(mass) {
    if (mass.opacity <= 0) return;

    const ctx = state.ctx;
    const pos = worldToCanvas(mass.x, mass.y);

    ctx.globalAlpha = mass.opacity;

    // Glow effect
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 25);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Main circle
    const color = mass.showForce ? CONFIG.colors.activeForce : CONFIG.colors.pointMass;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, mass.radius, 0, Math.PI * 2);
    ctx.fill();

    // Label
    if (state.showLabels) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('m', pos.x, pos.y);

        // Position label below
        ctx.fillStyle = CONFIG.colors.textMuted;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`x=${mass.x}m`, pos.x, pos.y + 22);
    }

    ctx.globalAlpha = 1;
}

function drawForceVector(mass) {
    if (!state.showVectors || !mass.showForce || mass.forceProgress <= 0) return;

    const ctx = state.ctx;
    const massPos = worldToCanvas(mass.x, mass.y);
    const centralPos = worldToCanvas(0, 0);

    // Calculate vector length based on force magnitude and progress
    const maxLength = Math.min((centralPos.x - massPos.x) * 0.7, 100);
    const length = maxLength * mass.forceProgress;

    // Direction from mass to central mass
    const dx = centralPos.x - massPos.x;
    const dy = centralPos.y - massPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;

    // Start and end points
    const startX = massPos.x + nx * (mass.radius + 5);
    const startY = massPos.y + ny * (mass.radius + 5);
    const endX = startX + nx * length;
    const endY = startY + ny * length;

    // Draw arrow line
    ctx.strokeStyle = mass.forceProgress >= 1 ? CONFIG.colors.forceVector : CONFIG.colors.activeForce;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    if (mass.forceProgress >= 0.5) {
        const arrowSize = 10;
        const angle = Math.atan2(ny, nx);

        ctx.fillStyle = mass.forceProgress >= 1 ? CONFIG.colors.forceVector : CONFIG.colors.activeForce;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    // Force magnitude label
    if (mass.forceProgress >= 1 && state.showLabels) {
        const labelX = (startX + endX) / 2;
        const labelY = startY - 15;

        ctx.fillStyle = CONFIG.colors.forceVector;
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';

        const forceValue = (1 / (mass.x * mass.x)).toFixed(4);
        ctx.fillText(`F=${forceValue}`, labelX, labelY);
    }
}

function render() {
    clearCanvas();
    drawGrid();

    // Draw force vectors first (behind masses)
    state.pointMasses.forEach(mass => drawForceVector(mass));

    // Draw point masses
    state.pointMasses.forEach(mass => drawPointMass(mass));

    // Draw central mass on top
    drawCentralMass();
}

// ============================================
// Physics Initialization
// ============================================
function initPhysics() {
    state.pointMasses = [];
    state.forces = [];
    state.runningTotal = 0;
    state.currentForceIndex = 0;

    // Create point masses at geometric positions: 1, 2, 4, 8, 16...
    for (let i = 0; i < CONFIG.physics.numMasses; i++) {
        const x = Math.pow(2, i); // 1, 2, 4, 8, 16, 32...
        const mass = new PointMass(x, 0, state.m, i);
        state.pointMasses.push(mass);

        // Calculate force for this mass
        const force = (CONFIG.physics.G * state.M * state.m) / (x * x);
        state.forces.push(force);
    }

    updateForcesDisplay();
}

// ============================================
// Animation Loop
// ============================================
function animate(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = timestamp - state.lastTimestamp;
    state.lastTimestamp = timestamp;

    const adjustedDelta = deltaTime * state.speed;

    switch (state.currentState) {
        case STATES.SHOWING_MASSES:
            animateShowMasses(adjustedDelta);
            break;
        case STATES.ANIMATING_VECTOR:
            animateVector(adjustedDelta);
            break;
        case STATES.COMPLETE:
            // Animation complete, keep rendering
            break;
    }

    render();
    state.animationFrame = requestAnimationFrame(animate);
}

function animateShowMasses(delta) {
    let allVisible = true;

    state.pointMasses.forEach((mass, index) => {
        const targetOpacity = 1;
        const speed = 0.003 * (index + 1);

        if (mass.opacity < targetOpacity) {
            mass.opacity = Math.min(mass.opacity + delta * speed, targetOpacity);
            allVisible = false;
        }
    });

    if (allVisible) {
        // Move to force calculation
        setTimeout(() => {
            state.currentState = STATES.ANIMATING_VECTOR;
            state.currentForceIndex = 0;
            updateStep(3, 'Animating force vector from first mass (x=1m)');
        }, 500 / state.speed);
    }
}

function animateVector(delta) {
    if (state.currentForceIndex >= state.pointMasses.length) {
        state.currentState = STATES.COMPLETE;
        updateStep(state.pointMasses.length + 3, 'Complete! Total force converges to (4/3)GMm ≈ 1.333 GMm');
        highlightFormula('formula-result');
        return;
    }

    const currentMass = state.pointMasses[state.currentForceIndex];
    currentMass.showForce = true;

    // Animate vector growth
    const growSpeed = 0.002;
    currentMass.forceProgress += delta * growSpeed;

    if (currentMass.forceProgress >= 1) {
        currentMass.forceProgress = 1;

        // Add to running total
        state.runningTotal += state.forces[state.currentForceIndex];
        updateRunningTotal();
        updateForcesDisplay();

        // Move to next mass
        state.currentForceIndex++;

        if (state.currentForceIndex < state.pointMasses.length) {
            const nextMass = state.pointMasses[state.currentForceIndex];
            updateStep(
                state.currentForceIndex + 3,
                `Adding force from mass at x=${nextMass.x}m`
            );
        }
    }
}

// ============================================
// UI Updates
// ============================================
function updateRunningTotal() {
    const totalElement = document.getElementById('running-total');
    totalElement.textContent = `${state.runningTotal.toFixed(4)} GMm`;
}

function updateForcesDisplay() {
    const grid = document.getElementById('forces-grid');
    grid.innerHTML = '';

    state.pointMasses.forEach((mass, index) => {
        const forceValue = state.forces[index];
        const div = document.createElement('div');
        div.className = `force-item${index < state.currentForceIndex ? ' active' : ''}`;
        div.innerHTML = `
            <span class="label">F<sub>${mass.x}</sub>:</span>
            <span class="value">${forceValue.toFixed(4)}</span>
        `;
        grid.appendChild(div);
    });
}

function updateStep(stepNumber, description) {
    document.getElementById('step-number').textContent = stepNumber;
    document.getElementById('step-description').textContent = description;

    const progress = (stepNumber / (CONFIG.physics.numMasses + 3)) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function highlightFormula(formulaId) {
    document.querySelectorAll('.formula-step').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(formulaId)?.classList.add('active');
}

// ============================================
// Controls
// ============================================
function setupControls() {
    // Play button
    document.getElementById('play-btn').addEventListener('click', () => {
        if (state.currentState === STATES.INITIAL) {
            initPhysics();
            state.currentState = STATES.SHOWING_MASSES;
            updateStep(2, 'Showing point masses at geometric positions');
            highlightFormula('formula-individual');
        }

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
    document.getElementById('reset-btn').addEventListener('click', () => {
        state.isPlaying = false;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
        }

        state.currentState = STATES.INITIAL;
        state.currentForceIndex = 0;
        state.runningTotal = 0;
        state.pointMasses = [];

        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;

        updateStep(1, 'Initial state: Ready to visualize gravitational forces');
        updateRunningTotal();
        updateForcesDisplay();

        document.querySelectorAll('.formula-step').forEach(el => {
            el.classList.remove('active');
        });

        render();
    });

    // Step button
    document.getElementById('step-btn').addEventListener('click', () => {
        if (state.currentState === STATES.INITIAL) {
            initPhysics();
            state.currentState = STATES.SHOWING_MASSES;

            // Instantly show all masses
            state.pointMasses.forEach(mass => mass.opacity = 1);
            state.currentState = STATES.ANIMATING_VECTOR;
            updateStep(2, 'Showing point masses at geometric positions');
        }

        if (state.currentState === STATES.ANIMATING_VECTOR &&
            state.currentForceIndex < state.pointMasses.length) {

            const currentMass = state.pointMasses[state.currentForceIndex];
            currentMass.showForce = true;
            currentMass.forceProgress = 1;

            state.runningTotal += state.forces[state.currentForceIndex];
            updateRunningTotal();
            updateForcesDisplay();

            state.currentForceIndex++;

            if (state.currentForceIndex < state.pointMasses.length) {
                const nextMass = state.pointMasses[state.currentForceIndex];
                updateStep(
                    state.currentForceIndex + 2,
                    `Adding force from mass at x=${nextMass.x}m`
                );
            } else {
                state.currentState = STATES.COMPLETE;
                updateStep(state.pointMasses.length + 3, 'Complete! Total force converges to (4/3)GMm ≈ 1.333 GMm');
                highlightFormula('formula-result');
            }
        }

        render();
    });

    // Speed controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.speed = parseFloat(btn.dataset.speed);
        });
    });

    // Mass sliders
    document.getElementById('mass-M').addEventListener('input', (e) => {
        state.M = parseFloat(e.target.value);
        document.getElementById('mass-M-value').textContent = state.M;
        if (state.currentState !== STATES.INITIAL) {
            // Recalculate forces
            state.forces = state.pointMasses.map(mass =>
                (CONFIG.physics.G * state.M * state.m) / (mass.x * mass.x)
            );
            updateForcesDisplay();
        }
    });

    document.getElementById('mass-m').addEventListener('input', (e) => {
        state.m = parseFloat(e.target.value);
        document.getElementById('mass-m-value').textContent = state.m;
        if (state.currentState !== STATES.INITIAL) {
            state.forces = state.pointMasses.map(mass =>
                (CONFIG.physics.G * state.M * state.m) / (mass.x * mass.x)
            );
            updateForcesDisplay();
        }
    });

    // Display toggles
    document.getElementById('show-vectors').addEventListener('change', (e) => {
        state.showVectors = e.target.checked;
        render();
    });

    document.getElementById('show-grid').addEventListener('change', (e) => {
        state.showGrid = e.target.checked;
        render();
    });

    document.getElementById('show-labels').addEventListener('change', (e) => {
        state.showLabels = e.target.checked;
        render();
    });

    // Quiz
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
                feedback.innerHTML = '✅ Correct! The geometric series 1 + 1/4 + 1/16 + ... = 4/3';
            } else {
                feedback.className = 'quiz-feedback show wrong';
                feedback.innerHTML = '❌ Not quite. The series converges to 4/3, not infinity!';
            }
        });
    });

    // Canvas hover for tooltips
    state.canvas.addEventListener('mousemove', (e) => {
        const rect = state.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const tooltip = document.getElementById('hover-tooltip');
        let foundMass = null;

        // Check if hovering over a point mass
        for (const mass of state.pointMasses) {
            if (mass.opacity <= 0) continue;

            const pos = worldToCanvas(mass.x, mass.y);
            const dx = mouseX - pos.x;
            const dy = mouseY - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mass.radius + 5) {
                foundMass = mass;
                break;
            }
        }

        // Check central mass
        if (!foundMass) {
            const centralPos = worldToCanvas(0, 0);
            const dx = mouseX - centralPos.x;
            const dy = mouseY - centralPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 25) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${mouseX + 10}px`;
                tooltip.style.top = `${mouseY - 30}px`;
                tooltip.innerHTML = `<strong>Central Mass M</strong><br>Mass: ${state.M}`;
                return;
            }
        }

        if (foundMass) {
            tooltip.style.display = 'block';
            tooltip.style.left = `${mouseX + 10}px`;
            tooltip.style.top = `${mouseY - 30}px`;

            const force = state.forces[foundMass.index] || 0;
            tooltip.innerHTML = `
                <strong>Point Mass m</strong><br>
                Position: x = ${foundMass.x}m<br>
                Force: ${force.toFixed(4)} GMm
            `;
        } else {
            tooltip.style.display = 'none';
        }
    });

    state.canvas.addEventListener('mouseleave', () => {
        document.getElementById('hover-tooltip').style.display = 'none';
    });
}

// ============================================
// Initialization
// ============================================
function init() {
    initCanvas();
    setupControls();

    // Initial render
    render();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    updateStep(1, 'Initial state: Click Play to start the simulation');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
