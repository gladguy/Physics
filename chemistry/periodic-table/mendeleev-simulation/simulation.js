/**
 * Mendeleev's Periodic Table (1869) - Interactive Educational Visualization
 * Demonstrates the revolutionary concept of predicting undiscovered elements
 */

class MendeleevPeriodicTable {
    constructor() {
        // Mendeleev's original 1869 table data
        this.mendeleevTable1869 = this.getMendeleevTableData();

        // Mendeleev's successful predictions
        this.predictedElements = this.getPredictedElements();

        // Color scheme for element groups
        this.groupColors = {
            "alkali": "#FF6B6B",
            "alkaline_earth": "#FFD166",
            "transition": "#FF9E00",
            "metalloid": "#06D6A0",
            "nonmetal": "#118AB2",
            "halogen": "#7209B7",
            "noble": "#073B4C",
            "other_metal": "#4361EE",
            "predicted": "#FFD700"
        };

        // Quiz score
        this.quizScore = 0;
        this.answeredQuestions = new Set();
    }

    getMendeleevTableData() {
        return {
            groups: [1, 2, 3, 4, 5, 6, 7, 8], // 8 groups as per Mendeleev

            // Elements known in 1869 organized by groups
            elements: [
                // Group I (Alkali metals and Hydrogen)
                [
                    { symbol: "H", mass: 1, name: "Hydrogen", discovered: 1766, group: "nonmetal" },
                    { symbol: "Li", mass: 7, name: "Lithium", discovered: 1817, group: "alkali" },
                    { symbol: "Na", mass: 23, name: "Sodium", discovered: 1807, group: "alkali" },
                    { symbol: "K", mass: 39, name: "Potassium", discovered: 1807, group: "alkali" },
                    { symbol: "Rb", mass: 85, name: "Rubidium", discovered: 1861, group: "alkali" },
                    { symbol: "Cs", mass: 133, name: "Caesium", discovered: 1860, group: "alkali" }
                ],

                // Group II (Alkaline earth)
                [
                    { symbol: "Be", mass: 9.4, name: "Beryllium", discovered: 1798, group: "alkaline_earth" },
                    { symbol: "Mg", mass: 24, name: "Magnesium", discovered: 1755, group: "alkaline_earth" },
                    { symbol: "Ca", mass: 40, name: "Calcium", discovered: 1808, group: "alkaline_earth" },
                    { symbol: "Sr", mass: 87.6, name: "Strontium", discovered: 1790, group: "alkaline_earth" },
                    { symbol: "Ba", mass: 137, name: "Barium", discovered: 1808, group: "alkaline_earth" }
                ],

                // Group III (Boron family)
                [
                    { symbol: "B", mass: 11, name: "Boron", discovered: 1808, group: "metalloid" },
                    { symbol: "Al", mass: 27.3, name: "Aluminum", discovered: 1825, group: "other_metal" },
                    { symbol: "?", mass: 68, name: "Eka-aluminum", predicted: true, actual: "Ga", actualName: "Gallium" },
                    { symbol: "In", mass: 113.4, name: "Indium", discovered: 1863, group: "other_metal" },
                    { symbol: "Tl", mass: 204, name: "Thallium", discovered: 1861, group: "other_metal" }
                ],

                // Group IV (Carbon family)
                [
                    { symbol: "C", mass: 12, name: "Carbon", discovered: "Ancient", group: "nonmetal" },
                    { symbol: "Si", mass: 28.4, name: "Silicon", discovered: 1824, group: "metalloid" },
                    { symbol: "?", mass: 72, name: "Eka-silicon", predicted: true, actual: "Ge", actualName: "Germanium" },
                    { symbol: "Sn", mass: 118, name: "Tin", discovered: "Ancient", group: "other_metal" },
                    { symbol: "Pb", mass: 206.4, name: "Lead", discovered: "Ancient", group: "other_metal" }
                ],

                // Group V (Nitrogen family)
                [
                    { symbol: "N", mass: 14, name: "Nitrogen", discovered: 1772, group: "nonmetal" },
                    { symbol: "P", mass: 31, name: "Phosphorus", discovered: 1669, group: "nonmetal" },
                    { symbol: "As", mass: 75, name: "Arsenic", discovered: "Ancient", group: "metalloid" },
                    { symbol: "Sb", mass: 120, name: "Antimony", discovered: "Ancient", group: "metalloid" },
                    { symbol: "Bi", mass: 208, name: "Bismuth", discovered: 1753, group: "other_metal" }
                ],

                // Group VI (Oxygen family)
                [
                    { symbol: "O", mass: 16, name: "Oxygen", discovered: 1774, group: "nonmetal" },
                    { symbol: "S", mass: 32, name: "Sulfur", discovered: "Ancient", group: "nonmetal" },
                    { symbol: "Se", mass: 79, name: "Selenium", discovered: 1817, group: "nonmetal" },
                    { symbol: "Te", mass: 127.5, name: "Tellurium", discovered: 1782, group: "metalloid" }
                ],

                // Group VII (Halogens)
                [
                    { symbol: "F", mass: 19, name: "Fluorine", discovered: 1886, group: "halogen" },
                    { symbol: "Cl", mass: 35.5, name: "Chlorine", discovered: 1774, group: "halogen" },
                    { symbol: "Br", mass: 80, name: "Bromine", discovered: 1826, group: "halogen" },
                    { symbol: "I", mass: 127, name: "Iodine", discovered: 1811, group: "halogen" }
                ],

                // Group VIII (Iron family and noble metals)
                [
                    { symbol: "Fe", mass: 56, name: "Iron", discovered: "Ancient", group: "transition" },
                    { symbol: "Co", mass: 59, name: "Cobalt", discovered: 1735, group: "transition" },
                    { symbol: "Ni", mass: 58.7, name: "Nickel", discovered: 1751, group: "transition" },
                    { symbol: "Pt", mass: 196.7, name: "Platinum", discovered: 1735, group: "transition" }
                ]
            ]
        };
    }

    getPredictedElements() {
        return [
            {
                predictedName: "Eka-aluminum",
                predictedProperties: {
                    "Atomic Mass": "68",
                    "Density": "5.9 g/cm³",
                    "Melting Point": "Low",
                    "Oxide Formula": "Ea₂O₃"
                },
                actualElement: {
                    symbol: "Ga",
                    name: "Gallium",
                    discovered: 1875,
                    actualProperties: {
                        "Atomic Mass": "69.72",
                        "Density": "5.904 g/cm³",
                        "Melting Point": "29.76°C",
                        "Oxide Formula": "Ga₂O₃"
                    }
                },
                accuracy: "Remarkably accurate!"
            },
            {
                predictedName: "Eka-silicon",
                predictedProperties: {
                    "Atomic Mass": "72",
                    "Density": "5.5 g/cm³",
                    "Melting Point": "High",
                    "Chloride Formula": "EsCl₄"
                },
                actualElement: {
                    symbol: "Ge",
                    name: "Germanium",
                    discovered: 1886,
                    actualProperties: {
                        "Atomic Mass": "72.63",
                        "Density": "5.323 g/cm³",
                        "Melting Point": "938.25°C",
                        "Chloride Formula": "GeCl₄"
                    }
                },
                accuracy: "Extremely close!"
            },
            {
                predictedName: "Eka-boron",
                predictedProperties: {
                    "Atomic Mass": "44",
                    "Density": "3.5 g/cm³",
                    "Oxide Formula": "Eb₂O₃"
                },
                actualElement: {
                    symbol: "Sc",
                    name: "Scandium",
                    discovered: 1879,
                    actualProperties: {
                        "Atomic Mass": "44.96",
                        "Density": "2.985 g/cm³",
                        "Oxide Formula": "Sc₂O₃"
                    }
                },
                accuracy: "Very close prediction!"
            }
        ];
    }

    /**
     * Initialize the complete visualization
     */
    init() {
        this.createMendeleevTable('mendeleevContainer');
        this.createModernComparison('modernContainer');
        this.createPredictionsPanel('predictionsContainer');
        this.setupQuizInteractivity();
    }

    /**
     * Create Mendeleev's original periodic table using D3.js
     */
    createMendeleevTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const margin = { top: 30, right: 20, bottom: 80, left: 20 };
        const cellWidth = 65;
        const cellHeight = 60;
        const width = this.mendeleevTable1869.groups.length * cellWidth + margin.left + margin.right;

        // Calculate max rows
        const maxRows = Math.max(...this.mendeleevTable1869.elements.map(g => g.length));
        const height = maxRows * cellHeight + margin.top + margin.bottom + 180; // Extra for legend

        // Create SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Draw group headers
        this.mendeleevTable1869.groups.forEach((group, gi) => {
            const x = gi * cellWidth;

            // Header background
            svg.append("rect")
                .attr("x", x)
                .attr("y", 0)
                .attr("width", cellWidth - 2)
                .attr("height", 28)
                .attr("rx", 5)
                .attr("fill", "#2c3e50");

            // Header text
            svg.append("text")
                .attr("x", x + cellWidth / 2 - 1)
                .attr("y", 19)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-weight", "bold")
                .attr("font-size", "12px")
                .text(`Group ${group}`);
        });

        // Draw elements
        this.mendeleevTable1869.elements.forEach((groupElements, gi) => {
            const x = gi * cellWidth;

            groupElements.forEach((element, ei) => {
                const y = 40 + ei * cellHeight;

                const cell = svg.append("g")
                    .attr("class", "element-cell")
                    .attr("transform", `translate(${x}, ${y})`)
                    .datum(element)
                    .style("cursor", "pointer");

                // Element background
                const fillColor = element.predicted
                    ? this.groupColors.predicted
                    : this.groupColors[element.group];

                cell.append("rect")
                    .attr("width", cellWidth - 2)
                    .attr("height", cellHeight - 2)
                    .attr("rx", 6)
                    .attr("fill", fillColor)
                    .attr("stroke", element.predicted ? "#B8860B" : "#2c3e50")
                    .attr("stroke-width", element.predicted ? 3 : 1)
                    .attr("stroke-dasharray", element.predicted ? "5,3" : "none");

                // Symbol
                cell.append("text")
                    .attr("x", (cellWidth - 2) / 2)
                    .attr("y", 22)
                    .attr("text-anchor", "middle")
                    .attr("fill", element.predicted ? "#333" : "white")
                    .attr("font-weight", "bold")
                    .attr("font-size", element.predicted ? "20px" : "16px")
                    .text(element.symbol);

                // Mass
                cell.append("text")
                    .attr("x", (cellWidth - 2) / 2)
                    .attr("y", 38)
                    .attr("text-anchor", "middle")
                    .attr("fill", element.predicted ? "#333" : "rgba(255,255,255,0.9)")
                    .attr("font-size", "10px")
                    .text(element.mass);

                // Name (truncated)
                const displayName = element.name.length > 8
                    ? element.name.substring(0, 7) + "..."
                    : element.name;

                cell.append("text")
                    .attr("x", (cellWidth - 2) / 2)
                    .attr("y", 52)
                    .attr("text-anchor", "middle")
                    .attr("fill", element.predicted ? "#333" : "rgba(255,255,255,0.85)")
                    .attr("font-size", "8px")
                    .text(displayName);

                // Star for predicted elements
                if (element.predicted) {
                    cell.append("text")
                        .attr("x", cellWidth - 12)
                        .attr("y", 14)
                        .attr("text-anchor", "end")
                        .attr("font-size", "12px")
                        .text("⭐");
                }

                // Hover effects
                const self = this;
                cell.on("mouseover", function (event, d) {
                    d3.select(this).select("rect")
                        .attr("stroke", "#FFD700")
                        .attr("stroke-width", 3);

                    self.showTooltip(event, d);
                })
                    .on("mouseout", function () {
                        const el = d3.select(this).datum();
                        d3.select(this).select("rect")
                            .attr("stroke", el.predicted ? "#B8860B" : "#2c3e50")
                            .attr("stroke-width", el.predicted ? 3 : 1);

                        self.hideTooltip();
                    });
            });
        });

        // Add legend
        this.createLegend(svg, maxRows * cellHeight + 60);
    }

    /**
     * Show element tooltip
     */
    showTooltip(event, element) {
        const tooltip = document.querySelector('.element-tooltip');
        if (!tooltip) return;

        let content = `<strong>${element.symbol} - ${element.name}</strong><br/>`;
        content += `Atomic Mass: ${element.mass}<br/>`;
        content += `Group: ${element.group.replace(/_/g, " ")}<br/>`;

        if (element.predicted) {
            content += `<br/><span class="predicted-badge">⭐ Mendeleev predicted this element!</span><br/>`;
            content += `Later discovered as: ${element.actualName} (${element.actual})`;
        } else {
            content += `Discovered: ${element.discovered}`;
        }

        tooltip.innerHTML = content;
        tooltip.classList.add('show');

        // Position tooltip
        const x = event.pageX + 15;
        const y = event.pageY - 10;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.querySelector('.element-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    /**
     * Create legend for element groups
     */
    createLegend(svg, yPosition) {
        const legendData = [
            { name: "Alkali Metals", color: this.groupColors.alkali },
            { name: "Alkaline Earth", color: this.groupColors.alkaline_earth },
            { name: "Transition Metals", color: this.groupColors.transition },
            { name: "Other Metals", color: this.groupColors.other_metal },
            { name: "Metalloids", color: this.groupColors.metalloid },
            { name: "Nonmetals", color: this.groupColors.nonmetal },
            { name: "Halogens", color: this.groupColors.halogen },
            { name: "Predicted ⭐", color: this.groupColors.predicted }
        ];

        const legendGroup = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${yPosition})`);

        // Legend title
        legendGroup.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text("Element Groups:");

        const itemWidth = 120;
        const itemsPerRow = 4;

        legendData.forEach((item, i) => {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            const x = col * itemWidth;
            const y = 15 + row * 25;

            // Color box
            legendGroup.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 16)
                .attr("height", 16)
                .attr("rx", 3)
                .attr("fill", item.color)
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5);

            // Label
            legendGroup.append("text")
                .attr("x", x + 22)
                .attr("y", y + 12)
                .attr("font-size", "10px")
                .attr("fill", "#333")
                .text(item.name);
        });
    }

    /**
     * Create modern comparison panel
     */
    createModernComparison(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="comparison-points">
                <div class="comparison-card">
                    <h3>📊 Mendeleev's Table (1869)</h3>
                    <ul>
                        <li>✅ Arranged by atomic mass</li>
                        <li>✅ 8 groups (columns)</li>
                        <li>✅ Left gaps for undiscovered elements</li>
                        <li>✅ Predicted properties of missing elements</li>
                        <li>⚠️ Some elements out of order (Ar/K, Co/Ni)</li>
                    </ul>
                </div>
                
                <div class="comparison-card">
                    <h3>⚛️ Modern Table</h3>
                    <ul>
                        <li>✅ Arranged by atomic number (proton count)</li>
                        <li>✅ 18 groups (columns)</li>
                        <li>✅ Includes noble gases (unknown to Mendeleev)</li>
                        <li>✅ Perfect periodicity based on electron configuration</li>
                        <li>✅ 118 elements discovered</li>
                    </ul>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <h4 style="margin-bottom: 10px; color: #333;">Example: Alkali Metals</h4>
                <div class="element-row">
                    <div class="element-cell-example alkali">Li</div>
                    <div class="element-cell-example alkali">Na</div>
                    <div class="element-cell-example alkali">K</div>
                    <div class="element-cell-example alkali">Rb</div>
                    <div class="element-cell-example alkali">Cs</div>
                    <div class="element-cell-example alkali">Fr</div>
                </div>
                <p style="text-align: center; color: #666; font-size: 0.9rem; margin-top: 8px;">All in Group 1 - Same chemical properties!</p>
            </div>
            
            <div class="key-difference">
                <h4>🔑 Key Improvement</h4>
                <p>Moseley (1913) showed elements should be arranged by <strong>atomic number</strong> (protons), 
                not atomic mass. This fixed the ordering problems in Mendeleev's table.</p>
            </div>
        `;
    }

    /**
     * Create predictions panel
     */
    createPredictionsPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';

        this.predictedElements.forEach(prediction => {
            const properties = Object.keys(prediction.predictedProperties);

            html += `
                <div class="prediction-card">
                    <div class="prediction-header">
                        <span class="prediction-icon">🔮</span>
                        <h3>${prediction.predictedName} → ${prediction.actualElement.name} (${prediction.actualElement.symbol})</h3>
                        <span class="accuracy-badge">${prediction.accuracy}</span>
                    </div>
                    
                    <div class="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Mendeleev's Prediction</th>
                                    <th>Actual Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${properties.map(prop => {
                const predicted = prediction.predictedProperties[prop];
                const actual = prediction.actualElement.actualProperties[prop];
                return `
                                        <tr>
                                            <td>${prop}</td>
                                            <td>${predicted}</td>
                                            <td class="match-good">${actual || 'N/A'}</td>
                                        </tr>
                                    `;
            }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="discovery-info">
                        <strong>Discovered in ${prediction.actualElement.discovered}</strong> - 
                        Properties matched Mendeleev's predictions remarkably well!
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Setup quiz interactivity
     */
    setupQuizInteractivity() {
        const questions = document.querySelectorAll('.quiz-question');

        questions.forEach((question, qIndex) => {
            const options = question.querySelectorAll('.quiz-option');
            const feedback = question.querySelector('.quiz-feedback');

            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Check if already answered
                    if (this.answeredQuestions.has(qIndex)) return;
                    this.answeredQuestions.add(qIndex);

                    const isCorrect = option.dataset.answer === 'correct';

                    // Disable all options
                    options.forEach(opt => {
                        opt.disabled = true;
                        if (opt.dataset.answer === 'correct') {
                            opt.classList.add('correct');
                        }
                    });

                    if (isCorrect) {
                        this.quizScore++;
                        feedback.textContent = '✅ Correct! Great job!';
                        feedback.className = 'quiz-feedback show correct';
                    } else {
                        option.classList.add('incorrect');
                        feedback.textContent = '❌ Not quite. The correct answer is highlighted in green.';
                        feedback.className = 'quiz-feedback show incorrect';
                    }

                    // Update score
                    document.getElementById('scoreValue').textContent = this.quizScore;
                });
            });
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    const mendeleevTable = new MendeleevPeriodicTable();
    mendeleevTable.init();

    // Make available globally for debugging
    window.mendeleevTable = mendeleevTable;
});
