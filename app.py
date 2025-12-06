# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "gradio==5.0.0",
#     "transformers",
#     "torch",
#     "pandas",
#     "scipy",
# ]
# ///

import gradio as gr
import json
import pandas as pd
from transformers import pipeline

# Load Element Data
with open('data/elements.json', 'r') as f:
    elements_data = json.load(f)

# AI Setup (Lightweight for CPU)
try:
    qa_pipeline = pipeline("text2text-generation", model="google/flan-t5-small")
except Exception as e:
    print(f"Error loading model: {e}")
    qa_pipeline = None

def get_element_details(symbol_or_name):
    if not symbol_or_name:
        return "Please select an element."
    
    symbol_or_name = symbol_or_name.strip().title()
    
    element = None
    for el in elements_data:
        if el['symbol'].lower() == symbol_or_name.lower() or el['name'].lower() == symbol_or_name.lower():
            element = el
            break
            
    if not element:
        return f"Element '{symbol_or_name}' not found."
    
    details = f"""
    # {element['name']} ({element['symbol']})
    
    **Atomic Number:** {element['atomic_number']}
    **Atomic Weight:** {element['atomic_weight']}
    **Group:** {element['group']}
    **Period:** {element['period']}
    **Category:** {element['category']}
    **Electron Configuration:** {element['electron_configuration']}
    
    ### Summary
    {element['summary']}
    
    ### Uses
    {element['uses']}
    """
    return details

def ai_response(user_input, history):
    if not qa_pipeline:
        return "AI model is not loaded."
    
    # Contextualize for Kids/Education
    prompt = f"Answer the following question about chemistry and the periodic table simply for a student: {user_input}"
    result = qa_pipeline(prompt, max_length=100)
    return result[0]['generated_text']

def generate_periodic_table_html():
    # CSS for the table
    html = """
    <style>
        .periodic-table-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-x: auto;
            padding: 10px;
        }
        .periodic-table {
            display: grid;
            grid-template-columns: repeat(18, 1fr);
            gap: 4px;
            margin-bottom: 20px;
            width: 100%;
            min-width: 800px;
        }
        .lanthanides-actinides {
            display: grid;
            grid-template-columns: repeat(18, 1fr); /* Align with main table */
            gap: 4px;
            width: 100%;
            min-width: 800px;
            margin-top: 10px;
        }
        .element {
            border: 1px solid #ccc;
            padding: 2px;
            text-align: center;
            cursor: pointer;
            border-radius: 4px;
            background-color: #f9f9f9;
            transition: transform 0.2s, box-shadow 0.2s;
            aspect-ratio: 1 / 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
        }
        .element:hover {
            transform: scale(1.1);
            z-index: 10;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            border-color: #999;
        }
        .symbol { font-weight: bold; font-size: 1.1em; }
        .number { font-size: 0.7em; position: absolute; top: 2px; left: 2px; color: #555; }
        .name { font-size: 0.6em; display: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        
        @media (min-width: 900px) {
            .name { display: block; }
        }

        /* Categories Colors */
        .cat-alkali-metals { background-color: #ff6666; color: white; }
        .cat-alkaline-earth-metals { background-color: #ffdead; }
        .cat-transition-metals { background-color: #ffc0c0; }
        .cat-post-transition-metals, .cat-poor-metals { background-color: #cccccc; }
        .cat-metalloids { background-color: #cccc99; }
        .cat-nonmetals { background-color: #a0ffa0; }
        .cat-halogens { background-color: #ffff99; }
        .cat-noble-gases { background-color: #c0ffff; }
        .cat-lanthanides { background-color: #ffbfff; }
        .cat-actinides { background-color: #ff99ff; }
        .cat-unknown { background-color: #e0e0e0; }
        
        .empty-cell { visibility: hidden; }
        .label-cell { grid-column: span 1; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    </style>
    <div class="periodic-table-container">
        <div class="periodic-table">
    """
    
    # Create a grid map for main table
    grid = {}
    lanthanides = []
    actinides = []
    
    for el in elements_data:
        cat = el['category']
        if cat == "Lanthanides" or el['group'] == "Lanthanide":
            lanthanides.append(el)
        elif cat == "Actinides" or el['group'] == "Actinide":
            actinides.append(el)
        else:
            grid[(el['period'], el['group'])] = el
            
    # Main Table Generation
    for period in range(1, 8):
        for group in range(1, 19):
            # Special handling for Lanthanide/Actinide placeholders in main table
            # Group 3, Period 6 -> Lanthanides placeholder
            # Group 3, Period 7 -> Actinides placeholder
            if period == 6 and group == 3:
                 html += """<div class="element cat-lanthanides">
                                <div class="symbol">57-71</div>
                                <div class="name">Lanthanides</div>
                            </div>"""
                 continue
            if period == 7 and group == 3:
                 html += """<div class="element cat-actinides">
                                <div class="symbol">89-103</div>
                                <div class="name">Actinides</div>
                            </div>"""
                 continue

            if (period, group) in grid:
                el = grid[(period, group)]
                cat_class = f"cat-{el['category'].lower().replace(' ', '-')}"
                html += f"""
                <div class="element {cat_class}" onclick="selectElement('{el['symbol']}')" title="{el['name']}">
                    <div class="number">{el['atomic_number']}</div>
                    <div class="symbol">{el['symbol']}</div>
                    <div class="name">{el['name']}</div>
                </div>
                """
            else:
                html += "<div class='empty-cell'></div>"
    
    html += "</div>" # End main table
    
    # Lanthanides and Actinides Section
    html += '<div class="lanthanides-actinides">'
    
    # Spacer for alignment (usually start at group 3 position, so 2 empty cells, but we can just center or list them)
    # To align with the main table's group 3, we need 2 empty cells before.
    # Actually, usually they are displayed as a separate block of 15 elements.
    # Let's just render them in the grid.
    
    # Lanthanides Row
    html += "<div class='label-cell' style='grid-column: span 3; text-align: right; padding-right: 10px;'>Lanthanides</div>"
    for el in sorted(lanthanides, key=lambda x: x['atomic_number']):
        cat_class = f"cat-{el['category'].lower().replace(' ', '-')}"
        html += f"""
        <div class="element {cat_class}" onclick="selectElement('{el['symbol']}')" title="{el['name']}">
            <div class="number">{el['atomic_number']}</div>
            <div class="symbol">{el['symbol']}</div>
            <div class="name">{el['name']}</div>
        </div>
        """
    # Fill remaining columns if any (18 total columns - 3 label - 15 elements = 0)
    
    # Actinides Row
    html += "<div class='label-cell' style='grid-column: span 3; text-align: right; padding-right: 10px;'>Actinides</div>"
    for el in sorted(actinides, key=lambda x: x['atomic_number']):
        cat_class = f"cat-{el['category'].lower().replace(' ', '-')}"
        html += f"""
        <div class="element {cat_class}" onclick="selectElement('{el['symbol']}')" title="{el['name']}">
            <div class="number">{el['atomic_number']}</div>
            <div class="symbol">{el['symbol']}</div>
            <div class="name">{el['name']}</div>
        </div>
        """
        
    html += "</div></div>"
    
    # JS for interaction
    html += """
    <script>
        function selectElement(symbol) {
            console.log("Selected: " + symbol);
            // Target the hidden textbox
            const input = document.querySelector('#selected-element textarea');
            if (input) {
                input.value = symbol;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.error("Could not find input #selected-element");
            }
        }
    </script>
    """
    return html

from alphabet_ui import generate_alphabet_html

with gr.Blocks(title="AI Periodic Table", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🧪 AI Periodic Table for Kids")
    
    with gr.Tabs():
        with gr.Tab("Alphabet Game"):
            gr.HTML(generate_alphabet_html(elements_data))

        with gr.Tab("Learn"):
            gr.Markdown("### Click on an element or search to learn more!")
            
            with gr.Row():
                with gr.Column(scale=3):
                    # Hidden input to capture clicks
                    selected_element = gr.Textbox(elem_id="selected-element", visible=False)
                    
                    # Search Box
                    search_input = gr.Textbox(label="Search Element (Symbol or Name)", placeholder="e.g., H, Gold")
                    search_btn = gr.Button("Search")
                    
                    # Visual Table
                    table_html = gr.HTML(generate_periodic_table_html())
                    
                with gr.Column(scale=2):
                    details_output = gr.Markdown(label="Element Details", value="Select an element to see details here.")
            
            # Interactions
            search_btn.click(get_element_details, inputs=search_input, outputs=details_output)
            search_input.submit(get_element_details, inputs=search_input, outputs=details_output)
            
            # When hidden textbox changes (via JS), update details
            selected_element.change(get_element_details, inputs=selected_element, outputs=details_output)

        with gr.Tab("AI Tutor"):
            gr.Markdown("### Ask the AI Tutor anything about elements!")
            chatbot = gr.ChatInterface(ai_response)

        with gr.Tab("Quiz"):
            gr.Markdown("### Test your knowledge!")
            gr.Markdown("Coming Soon: Interactive Quizzes generated by AI!")

    from adiabatic_game import create_adiabatic_tab
    create_adiabatic_tab()

if __name__ == "__main__":
    demo.launch()

