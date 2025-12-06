import gradio as gr
import json

def get_adiabatic_game_html():
    return """
    <style>
        .game-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            background: #f0f4f8;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .game-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .game-header h2 {
            color: #2c3e50;
            margin: 0;
        }
        .level-badge {
            background: #3498db;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-top: 10px;
            display: inline-block;
        }
        .game-area {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .graph-panel {
            flex: 2;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            min-width: 300px;
        }
        .controls-panel {
            flex: 1;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            min-width: 250px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .chamber-panel {
            width: 100%;
            height: 150px;
            background: #eec;
            border: 2px solid #998;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            margin-top: 20px;
        }
        .piston {
            width: 20px;
            height: 100%;
            background: #555;
            position: absolute;
            left: 50%;
            top: 0;
            transition: left 0.5s ease;
        }
        .gas-particles {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 50%; /* Dynamic */
            background: rgba(255, 100, 100, 0.2);
            transition: width 0.5s ease, background-color 0.5s ease;
        }
        canvas {
            width: 100%;
            height: 300px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .input-group label {
            font-weight: bold;
            color: #555;
        }
        .input-group input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        button.game-btn {
            background: #27ae60;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }
        button.game-btn:hover {
            background: #2ecc71;
        }
        .feedback {
            margin-top: 10px;
            padding: 10px;
            border-radius: 5px;
            display: none;
        }
        .feedback.success { background: #d4edda; color: #155724; display: block; }
        .feedback.error { background: #f8d7da; color: #721c24; display: block; }

    </style>

    <div class="game-container">
        <div class="game-header">
            <h2>🕵️ Adiabatic Mystery Solver</h2>
            <div class="level-badge" id="level-indicator">Level 1: The Concept</div>
            <p>Mission: Find the adiabatic constant γ (Gamma)</p>
        </div>

        <div class="game-area">
            <div class="graph-panel">
                <canvas id="pvGraph"></canvas>
            </div>
            
            <div class="controls-panel">
                <div id="level-1-content">
                    <p><strong>Adiabatic Process (Q=0)</strong></p>
                    <p>No heat enters or leaves the system.</p>
                    <p>Observe how Pressure (P) changes as you change Volume (V).</p>
                    <div class="input-group">
                        <label>Volume (V): <span id="vol-val">5.0</span> L</label>
                        <input type="range" id="vol-slider" min="1" max="10" step="0.1" value="5.0">
                    </div>
                    <button class="game-btn" onclick="nextLevel()">I Understand (Next Level)</button>
                </div>

                <div id="level-2-content" style="display:none;">
                    <p><strong>The Formula</strong></p>
                    <p>For adiabatic processes:</p>
                    <code style="display:block; text-align:center; margin: 10px 0;">P * V<sup>γ</sup> = Constant</code>
                    <p>Try to find a Gamma (γ) that fits the curve!</p>
                    <div class="input-group">
                        <label>Try Gamma (γ):</label>
                        <input type="number" id="gamma-guess" step="0.01" placeholder="e.g. 1.4">
                    </div>
                    <button class="game-btn" onclick="checkGamma()">Check Gamma</button>
                    <div id="feedback-msg" class="feedback"></div>
                </div>
            </div>
        </div>

        <div class="chamber-panel">
            <div class="gas-particles" id="gas-chamber"></div>
            <div class="piston" id="piston"></div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Game State
        let currentLevel = 1;
        let volume = 5.0;
        let pressure = 1.0;
        let trueGamma = 1.4; // Diatomic gas example
        let constantK = 10.0; // P * V^gamma = K -> Let's fix a point (V=5, P=1) -> 1 * 5^1.4 = 9.5... let's just calc K dynamically based on initial state
        
        // Initial State: P=2 atm, V=5 L
        const V0 = 5.0;
        const P0 = 2.0;
        constantK = P0 * Math.pow(V0, trueGamma);

        // Chart Setup
        const ctx = document.getElementById('pvGraph').getContext('2d');
        
        // Generate Curve Data
        function generateCurve(gamma) {
            const data = [];
            for (let v = 1; v <= 10; v += 0.5) {
                // P = K / V^gamma
                let p = constantK / Math.pow(v, gamma);
                data.push({x: v, y: p});
            }
            return data;
        }

        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Adiabatic Curve (True γ)',
                    data: generateCurve(trueGamma),
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    showLine: true,
                    tension: 0.4
                }, {
                    label: 'Your State',
                    data: [{x: V0, y: P0}],
                    backgroundColor: 'red',
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Volume (L)' },
                        min: 0,
                        max: 12
                    },
                    y: {
                        title: { display: true, text: 'Pressure (atm)' },
                        min: 0,
                        max: 10
                    }
                },
                animation: {
                    duration: 0 // fast updates
                }
            }
        });

        // Interactions
        const volSlider = document.getElementById('vol-slider');
        const volVal = document.getElementById('vol-val');
        const piston = document.getElementById('piston');
        const gasChamber = document.getElementById('gas-chamber');

        function updatePhysics(v) {
            volume = parseFloat(v);
            // Calculate P based on adiabatic law
            pressure = constantK / Math.pow(volume, trueGamma);
            
            // Update UI Text
            volVal.innerText = volume.toFixed(1);
            
            // Update Chart Point
            chart.data.datasets[1].data[0] = {x: volume, y: pressure};
            chart.update();

            // Update Chamber Animation
            // Map Volume 1-10 to Width 10%-90%
            const widthPct = (volume / 10) * 90; 
            piston.style.left = widthPct + '%';
            gasChamber.style.width = widthPct + '%';
            
            // Color change based on Temperature (Pressure/Volume proxy)
            // Adiabatic compression -> heats up (redder)
            // Expansion -> cools down (bluer)
            // Simple visual proxy: higher pressure = redder
            const intensity = Math.min(255, Math.max(0, pressure * 40));
            gasChamber.style.backgroundColor = `rgba(255, ${255-intensity}, ${255-intensity}, 0.5)`;
        }

        volSlider.addEventListener('input', (e) => {
            updatePhysics(e.target.value);
        });

        // Level Logic
        window.nextLevel = function() {
            currentLevel++;
            document.getElementById('level-indicator').innerText = "Level " + currentLevel + ": Calculate Gamma";
            document.getElementById('level-1-content').style.display = 'none';
            document.getElementById('level-2-content').style.display = 'block';
            
            // Add a "Guess" curve to the chart
            chart.data.datasets.push({
                label: 'Your Guess',
                data: [],
                borderColor: 'rgba(46, 204, 113, 1)',
                borderDash: [5, 5],
                showLine: true,
                tension: 0.4
            });
            chart.update();
        };

        window.checkGamma = function() {
            const guess = parseFloat(document.getElementById('gamma-guess').value);
            const feedback = document.getElementById('feedback-msg');
            
            if (isNaN(guess)) {
                feedback.innerText = "Please enter a number.";
                feedback.className = "feedback error";
                return;
            }

            // Plot the guessed curve
            // Assume same starting point (V0, P0) to calculate implied K for this guess
            const kGuess = P0 * Math.pow(V0, guess);
            const guessData = [];
            for (let v = 1; v <= 10; v += 0.5) {
                let p = kGuess / Math.pow(v, guess);
                guessData.push({x: v, y: p});
            }
            
            // Update the 3rd dataset (index 2)
            chart.data.datasets[2].data = guessData;
            chart.update();

            // Check accuracy
            if (Math.abs(guess - trueGamma) < 0.1) {
                feedback.innerText = "Correct! You found the Adiabatic Constant! 🎉";
                feedback.className = "feedback success";
            } else {
                feedback.innerText = "Not quite. Observe the green dashed line vs the blue line. Try again!";
                feedback.className = "feedback error";
            }
        };

        // Init
        updatePhysics(5.0);

    </script>
    """

def create_adiabatic_tab():
    with gr.Tab("Adiabatic Mystery"):
        gr.HTML(get_adiabatic_game_html())
