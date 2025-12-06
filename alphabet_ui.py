import json

def generate_alphabet_html(elements_data):
    # Pre-process data to group by letter
    elements_by_letter = {chr(i): [] for i in range(65, 91)} # A-Z
    
    for el in elements_data:
        first_letter = el['name'][0].upper()
        if first_letter in elements_by_letter:
            # Add a simplified version for the frontend
            elements_by_letter[first_letter].append({
                "name": el['name'],
                "symbol": el['symbol'],
                "number": el['atomic_number'],
                "summary": el['summary'][:100] + "..." # Short summary
            })
            
    # Convert to JSON for JS
    elements_json = json.dumps(elements_by_letter)
    
    html = f"""
    <style>
        .alphabet-container {{
            font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
            text-align: center;
            padding: 20px;
            background-color: #f0f8ff;
            border-radius: 15px;
        }}
        
        .nav-buttons {{
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }}
        
        .mode-btn {{
            padding: 12px 24px;
            font-size: 1.2em;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            background-color: #4CAF50;
            color: white;
            transition: transform 0.1s, box-shadow 0.1s;
            box-shadow: 0 4px #2E7D32;
            min-width: 150px;
        }}
        
        .mode-btn:active {{
            transform: translateY(4px);
            box-shadow: 0 0 #2E7D32;
        }}
        
        .mode-btn.secondary {{
            background-color: #2196F3;
            box-shadow: 0 4px #1565C0;
        }}
        
        .mode-btn.secondary:active {{
            box-shadow: 0 0 #1565C0;
        }}

        /* Grid View */
        .alphabet-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
            gap: 10px;
            max-width: 800px;
            margin: 0 auto;
        }}
        
        .letter-btn {{
            aspect-ratio: 1;
            font-size: 2em;
            font-weight: bold;
            background: linear-gradient(145deg, #ffffff, #e6e6e6);
            border: 2px solid #ddd;
            border-radius: 10px;
            cursor: pointer;
            color: #333;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        
        .letter-btn:hover {{
            transform: scale(1.1) rotate(5deg);
            background: #fff9c4;
            border-color: #fbc02d;
            z-index: 2;
        }}
        
        /* Details View */
        .details-view {{
            display: none;
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
            position: relative;
        }}
        
        .back-btn {{
            position: absolute;
            top: 10px;
            left: 10px;
            background: #ff5252;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-weight: bold;
        }}
        
        .element-card {{
            border: 2px dashed #4CAF50;
            padding: 15px;
            margin: 10px 0;
            border-radius: 10px;
            background: #f1f8e9;
            cursor: pointer;
        }}
        
        .element-card:hover {{
            background: #dcedc8;
        }}
        
        .element-symbol {{
            font-size: 3em;
            color: #2E7D32;
            font-weight: bold;
        }}

        /* Game View */
        .game-view {{
            display: none;
            max-width: 800px;
            margin: 0 auto;
        }}
        
        .drop-zone {{
            width: 100px;
            height: 100px;
            border: 3px dashed #2196F3;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            margin: 20px auto;
            background: #e3f2fd;
            transition: background 0.3s;
        }}
        
        .drop-zone.highlight {{
            background: #bbdefb;
            transform: scale(1.1);
        }}
        
        .draggable-container {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
        }}
        
        .draggable {{
            width: 60px;
            height: 60px;
            background: #ff9800;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            cursor: grab;
            user-select: none;
            box-shadow: 0 4px 5px rgba(0,0,0,0.2);
        }}
        
        .draggable:active {{
            cursor: grabbing;
        }}
        
        .score-board {{
            font-size: 1.5em;
            color: #e91e63;
            margin-bottom: 10px;
        }}
        
        .feedback {{
            height: 30px;
            font-weight: bold;
            color: #4CAF50;
        }}

    </style>

    <div class="alphabet-container">
        <h1>ABC Chemistry! 🧪</h1>
        
        <div class="nav-buttons">
            <button class="mode-btn" onclick="window.showGrid()">Learn ABCs</button>
            <button class="mode-btn secondary" onclick="window.startGame()">Play Game</button>
        </div>

        <!-- Grid View -->
        <div id="alphabet-grid" class="alphabet-grid">
            <!-- Generated by JS -->
        </div>

        <!-- Details View -->
        <div id="details-view" class="details-view">
            <button class="back-btn" onclick="window.showGrid()">X</button>
            <h2 id="letter-title" style="font-size: 4em; margin: 0; color: #3f51b5;">A</h2>
            <div id="elements-list"></div>
        </div>

        <!-- Game View -->
        <div id="game-view" class="game-view">
            <div class="score-board">Score: <span id="score">0</span> 🌟</div>
            <div class="feedback" id="feedback"></div>
            
            <div style="margin: 20px;">
                <p>Drag the element to the matching letter!</p>
                <div id="target-letter" class="drop-zone">?</div>
            </div>
            
            <div id="draggables" class="draggable-container">
                <!-- Generated by JS -->
            </div>
        </div>
    </div>

    <script>
        // Ensure data is available
        window.elementsData = {elements_json};
        window.score = 0;
        window.currentTargetLetter = '';

        // Initialize Grid
        setTimeout(() => {{
            const grid = document.getElementById('alphabet-grid');
            if (grid && grid.children.length === 0) {{
                for (let i = 65; i <= 90; i++) {{
                    const letter = String.fromCharCode(i);
                    const btn = document.createElement('div');
                    btn.className = 'letter-btn';
                    btn.innerText = letter;
                    btn.onclick = () => window.showDetails(letter);
                    
                    const hue = Math.floor(Math.random() * 360);
                    btn.style.borderColor = `hsl(${{hue}}, 70%, 50%)`;
                    
                    grid.appendChild(btn);
                }}
            }}
        }}, 100);

        window.speak = function(text) {{
            if ('speechSynthesis' in window) {{
                window.speechSynthesis.cancel(); // Stop previous
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                window.speechSynthesis.speak(utterance);
            }}
        }};

        window.showGrid = function() {{
            document.getElementById('alphabet-grid').style.display = 'grid';
            document.getElementById('details-view').style.display = 'none';
            document.getElementById('game-view').style.display = 'none';
        }};

        window.showDetails = function(letter) {{
            document.getElementById('alphabet-grid').style.display = 'none';
            const view = document.getElementById('details-view');
            view.style.display = 'block';
            
            document.getElementById('letter-title').innerText = letter;
            window.speak(letter);
            
            const list = document.getElementById('elements-list');
            list.innerHTML = '';
            
            const elements = window.elementsData[letter];
            if (elements.length === 0) {{
                list.innerHTML = '<p>No elements start with this letter!</p>';
                window.speak("No elements start with " + letter);
            }} else {{
                elements.forEach(el => {{
                    const card = document.createElement('div');
                    card.className = 'element-card';
                    card.innerHTML = `
                        <div class="element-symbol">${{el.symbol}}</div>
                        <h3>${{el.name}}</h3>
                        <p>Atomic Number: ${{el.number}}</p>
                        <p style="font-size: 0.9em;">${{el.summary}}</p>
                    `;
                    card.onclick = () => window.speak(`${{el.name}}. ${{el.summary}}`);
                    list.appendChild(card);
                }});
                
                setTimeout(() => window.speak(`${{letter}} is for ${{elements[0].name}}`), 500);
            }}
        }};

        window.startGame = function() {{
            document.getElementById('alphabet-grid').style.display = 'none';
            document.getElementById('details-view').style.display = 'none';
            document.getElementById('game-view').style.display = 'block';
            window.nextRound();
        }};
        
        window.nextRound = function() {{
            // Pick a random letter that has elements
            const availableLetters = Object.keys(window.elementsData).filter(l => window.elementsData[l].length > 0);
            window.currentTargetLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
            
            const targetZone = document.getElementById('target-letter');
            targetZone.innerText = window.currentTargetLetter;
            targetZone.style.background = '#e3f2fd';
            
            // Create draggables: 1 correct, 3 wrong
            const correctEl = window.elementsData[window.currentTargetLetter][0];
            
            let options = [correctEl];
            while (options.length < 4) {{
                const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
                if (randomLetter !== window.currentTargetLetter) {{
                    const wrongEl = window.elementsData[randomLetter][0];
                    if (!options.includes(wrongEl)) options.push(wrongEl);
                }}
            }}
            
            // Shuffle
            options.sort(() => Math.random() - 0.5);
            
            const container = document.getElementById('draggables');
            container.innerHTML = '';
            
            options.forEach(el => {{
                const drag = document.createElement('div');
                drag.className = 'draggable';
                drag.draggable = true;
                drag.innerText = el.symbol;
                drag.dataset.name = el.name;
                drag.dataset.letter = el.name[0].toUpperCase(); // Ensure case
                
                drag.ondragstart = (e) => {{
                    e.dataTransfer.setData('text/plain', el.name[0].toUpperCase());
                    e.dataTransfer.setData('name', el.name);
                }};
                
                container.appendChild(drag);
            }});
            
            window.speak("Find the element that starts with " + window.currentTargetLetter);
        }};
        
        // Re-attach drop zone logic safely
        setTimeout(() => {{
            const dropZone = document.getElementById('target-letter');
            if (dropZone) {{
                dropZone.ondragover = (e) => {{
                    e.preventDefault();
                    dropZone.classList.add('highlight');
                }};
                
                dropZone.ondragleave = () => {{
                    dropZone.classList.remove('highlight');
                }};
                
                dropZone.ondrop = (e) => {{
                    e.preventDefault();
                    dropZone.classList.remove('highlight');
                    
                    const droppedLetter = e.dataTransfer.getData('text/plain');
                    const droppedName = e.dataTransfer.getData('name');
                    
                    const feedback = document.getElementById('feedback');
                    
                    if (droppedLetter === window.currentTargetLetter) {{
                        window.score += 10;
                        document.getElementById('score').innerText = window.score;
                        feedback.innerText = `Correct! ${{droppedName}} starts with ${{window.currentTargetLetter}}! 🎉`;
                        dropZone.style.background = '#a5d6a7';
                        window.speak("Correct! Good job!");
                        setTimeout(() => {{
                            feedback.innerText = '';
                            window.nextRound();
                        }}, 2000);
                    }} else {{
                        feedback.innerText = `Oops! ${{droppedName}} starts with ${{droppedLetter}}. Try again!`;
                        dropZone.style.background = '#ef9a9a';
                        window.speak("Oops! Try again.");
                        setTimeout(() => {{
                            dropZone.style.background = '#e3f2fd';
                        }}, 1000);
                    }}
                }};
            }}
        }}, 100);
        
    </script>
    """
    return html

