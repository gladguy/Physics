/**
 * Periodic Table Evolution Visualization
 * Educational tool combining Newlands' Octaves and Meyer's Curve
 * Teaches both scientists' contributions to periodic table development
 */

class PeriodicTableEvolution {
    constructor() {
        // Comprehensive element data for both visualizations
        this.elements = [
            // Newlands' original elements and common ones for Meyer's curve
            { symbol: "H", name: "Hydrogen", atomicMass: 1.008, atomicVolume: 14.1, group: "nonmetal", yearDiscovered: 1766 },
            { symbol: "Li", name: "Lithium", atomicMass: 6.94, atomicVolume: 13.1, group: "alkali", yearDiscovered: 1817 },
            { symbol: "Be", name: "Beryllium", atomicMass: 9.01, atomicVolume: 5.0, group: "alkaline", yearDiscovered: 1798 },
            { symbol: "B", name: "Boron", atomicMass: 10.81, atomicVolume: 4.6, group: "metalloid", yearDiscovered: 1808 },
            { symbol: "C", name: "Carbon", atomicMass: 12.01, atomicVolume: 5.3, group: "nonmetal", yearDiscovered: "Ancient" },
            { symbol: "N", name: "Nitrogen", atomicMass: 14.01, atomicVolume: 17.3, group: "nonmetal", yearDiscovered: 1772 },
            { symbol: "O", name: "Oxygen", atomicMass: 16.00, atomicVolume: 14.0, group: "nonmetal", yearDiscovered: 1774 },
            { symbol: "F", name: "Fluorine", atomicMass: 19.00, atomicVolume: 17.1, group: "halogen", yearDiscovered: 1886 },

            { symbol: "Na", name: "Sodium", atomicMass: 22.99, atomicVolume: 23.7, group: "alkali", yearDiscovered: 1807 },
            { symbol: "Mg", name: "Magnesium", atomicMass: 24.31, atomicVolume: 14.0, group: "alkaline", yearDiscovered: 1755 },
            { symbol: "Al", name: "Aluminum", atomicMass: 26.98, atomicVolume: 10.0, group: "other", yearDiscovered: 1825 },
            { symbol: "Si", name: "Silicon", atomicMass: 28.09, atomicVolume: 12.1, group: "metalloid", yearDiscovered: 1824 },
            { symbol: "P", name: "Phosphorus", atomicMass: 30.97, atomicVolume: 17.0, group: "nonmetal", yearDiscovered: 1669 },
            { symbol: "S", name: "Sulfur", atomicMass: 32.07, atomicVolume: 15.5, group: "nonmetal", yearDiscovered: "Ancient" },
            { symbol: "Cl", name: "Chlorine", atomicMass: 35.45, atomicVolume: 18.7, group: "halogen", yearDiscovered: 1774 },

            { symbol: "K", name: "Potassium", atomicMass: 39.10, atomicVolume: 45.3, group: "alkali", yearDiscovered: 1807 },
            { symbol: "Ca", name: "Calcium", atomicMass: 40.08, atomicVolume: 25.9, group: "alkaline", yearDiscovered: 1808 },
            { symbol: "Ti", name: "Titanium", atomicMass: 47.87, atomicVolume: 10.6, group: "transition", yearDiscovered: 1791 },
            { symbol: "Cr", name: "Chromium", atomicMass: 52.00, atomicVolume: 7.2, group: "transition", yearDiscovered: 1797 },
            { symbol: "Mn", name: "Manganese", atomicMass: 54.94, atomicVolume: 7.4, group: "transition", yearDiscovered: 1774 },
            { symbol: "Fe", name: "Iron", atomicMass: 55.85, atomicVolume: 7.1, group: "transition", yearDiscovered: "Ancient" },
            { symbol: "Co", name: "Cobalt", atomicMass: 58.93, atomicVolume: 6.7, group: "transition", yearDiscovered: 1735 },
            { symbol: "Ni", name: "Nickel", atomicMass: 58.69, atomicVolume: 6.6, group: "transition", yearDiscovered: 1751 },
            { symbol: "Cu", name: "Copper", atomicMass: 63.55, atomicVolume: 7.1, group: "transition", yearDiscovered: "Ancient" },
            { symbol: "Zn", name: "Zinc", atomicMass: 65.38, atomicVolume: 9.2, group: "transition", yearDiscovered: 1746 },
            { symbol: "Br", name: "Bromine", atomicMass: 79.90, atomicVolume: 23.5, group: "halogen", yearDiscovered: 1826 },
            { symbol: "Rb", name: "Rubidium", atomicMass: 85.47, atomicVolume: 55.9, group: "alkali", yearDiscovered: 1861 },
            { symbol: "Sr", name: "Strontium", atomicMass: 87.62, atomicVolume: 33.7, group: "alkaline", yearDiscovered: 1790 }
        ];

        // Newlands' octave arrangement
        this.octaves = [
            {
                series: 1,
                elements: ["H", "Li", "Be", "B", "C", "N", "O", "F"],
                notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do'"],
                properties: [
                    "Lightest",
                    "Alkali",
                    "Alkaline",
                    "Metalloid",
                    "Organic",
                    "Gas",
                    "Reactive",
                    "Halogen"
                ]
            },
            {
                series: 2,
                elements: ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "K"],
                notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do'"],
                properties: [
                    "Soft metal",
                    "Light metal",
                    "Abundant",
                    "Semicond.",
                    "Glows",
                    "Yellow",
                    "Green gas",
                    "Essential"
                ]
            }
        ];

        // Colors for different groups
        this.groupColors = {
            "alkali": "#FF6B6B",
            "alkaline": "#FFD166",
            "transition": "#FF9E00",
            "metalloid": "#06D6A0",
            "nonmetal": "#118AB2",
            "halogen": "#7209B7",
            "noble": "#073B4C",
            "other": "#F72585"
        };

        this.groupNames = {
            "alkali": "Alkali Metals",
            "alkaline": "Alkaline Earth",
            "transition": "Transition Metals",
            "metalloid": "Metalloids",
            "nonmetal": "Non-metals",
            "halogen": "Halogens",
            "noble": "Noble Gases",
            "other": "Other Metals"
        };

        // Quiz state
        this.score = 0;
        this.answeredQuestions = new Set();
    }

    /**
     * Initialize both visualizations
     */
    init() {
        this.initNewlandsOctaves('newlandsContainer');
        this.initMeyerCurve('meyerContainer');
        this.setupQuizInteractivity();
    }

    /**
     * Initialize Newlands' Octaves visualization
     */
    initNewlandsOctaves(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const margin = { top: 30, right: 20, bottom: 30, left: 20 };
        const width = 500 - margin.left - margin.right;
        const height = 380 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create piano keyboard visualization
        this.createPianoKeyboard(svg, width, height);

        // Create octave rows
        this.createOctaveRows(svg, width, height);
    }

    /**
     * Create piano keyboard background
     */
    createPianoKeyboard(svg, width, height) {
        const keyWidth = width / 8;
        const keyHeight = 60;
        const startY = 20;
        const notes = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do'"];

        // Draw white keys
        for (let i = 0; i < 8; i++) {
            // White key
            svg.append("rect")
                .attr("class", "piano-key")
                .attr("x", i * keyWidth + 2)
                .attr("y", startY)
                .attr("width", keyWidth - 4)
                .attr("height", keyHeight)
                .attr("fill", "#ffffff")
                .attr("stroke", "#333")
                .attr("stroke-width", 1)
                .attr("rx", 3);

            // Note label
            svg.append("text")
                .attr("x", i * keyWidth + keyWidth / 2)
                .attr("y", startY + keyHeight + 15)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "#7209B7")
                .text(notes[i]);
        }

        // Add title for piano section
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#a0b0c0")
            .text("🎹 Musical Scale Analogy");

        // Add connecting arrow
        svg.append("path")
            .attr("d", `M ${0} ${startY + keyHeight + 25} 
                        C ${width / 4} ${startY + keyHeight + 50} 
                          ${width * 3 / 4} ${startY + keyHeight + 50} 
                          ${width} ${startY + keyHeight + 25}`)
            .attr("fill", "none")
            .attr("stroke", "#FF6B6B")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("marker-end", "url(#arrowhead)");

        // Arrow marker definition
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#FF6B6B");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", startY + keyHeight + 55)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "#FF6B6B")
            .text("Octave repeats!");
    }

    /**
     * Create octave rows with elements
     */
    createOctaveRows(svg, width, height) {
        const elementSize = 35;
        const startY = 130;
        const rowSpacing = 110;
        const self = this;

        this.octaves.forEach((octave, octaveIndex) => {
            const rowY = startY + (octaveIndex * rowSpacing);
            const spacing = width / 8;

            // Row background
            svg.append("rect")
                .attr("x", 0)
                .attr("y", rowY - 10)
                .attr("width", width)
                .attr("height", 95)
                .attr("fill", "rgba(255, 255, 255, 0.03)")
                .attr("stroke", octaveIndex === 0 ? "#7209B7" : "#118AB2")
                .attr("stroke-width", 1)
                .attr("rx", 8);

            // Series label
            svg.append("text")
                .attr("x", 10)
                .attr("y", rowY + 5)
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .attr("fill", octaveIndex === 0 ? "#7209B7" : "#118AB2")
                .text(`Series ${octave.series}`);

            // Create element circles
            octave.elements.forEach((symbolName, index) => {
                const elementData = this.elements.find(e => e.symbol === symbolName);
                if (!elementData) return;

                const xPos = (index * spacing) + spacing / 2;
                const yPos = rowY + 35;

                // Element circle
                const circle = svg.append("circle")
                    .attr("class", "octave-element")
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("r", elementSize / 2)
                    .attr("fill", this.groupColors[elementData.group])
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2)
                    .datum({ ...elementData, octaveNote: octave.notes[index], position: index + 1 });

                // Element symbol
                svg.append("text")
                    .attr("x", xPos)
                    .attr("y", yPos + 4)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr("fill", "#fff")
                    .attr("pointer-events", "none")
                    .text(symbolName);

                // Atomic mass
                svg.append("text")
                    .attr("x", xPos)
                    .attr("y", yPos + elementSize / 2 + 12)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "8px")
                    .attr("fill", "#a0b0c0")
                    .text(elementData.atomicMass.toFixed(1));

                // Property
                svg.append("text")
                    .attr("x", xPos)
                    .attr("y", yPos + elementSize / 2 + 22)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "7px")
                    .attr("fill", "#666")
                    .text(octave.properties[index]);

                // Add hover interaction
                circle.on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(150)
                        .attr("r", elementSize / 2 + 5)
                        .attr("stroke", "#ffd700")
                        .attr("stroke-width", 3);

                    const tooltip = d3.select(".octave-tooltip");
                    tooltip.style("opacity", 1)
                        .html(`
                            <strong>${d.symbol}</strong> - ${d.name}<br/>
                            <span style="color: #a0b0c0;">Atomic Mass:</span> ${d.atomicMass}<br/>
                            <span style="color: #a0b0c0;">Group:</span> ${self.groupNames[d.group]}<br/>
                            <span style="color: #7209B7;">Musical Note:</span> ${d.octaveNote}<br/>
                            <span style="color: #a0b0c0;">Position in Octave:</span> ${d.position}
                        `)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                    .on("mouseout", function () {
                        d3.select(this)
                            .transition()
                            .duration(150)
                            .attr("r", elementSize / 2)
                            .attr("stroke", "#fff")
                            .attr("stroke-width", 2);

                        d3.select(".octave-tooltip").style("opacity", 0);
                    });
            });

            // Draw vertical connecting lines between octaves
            if (octaveIndex < this.octaves.length - 1) {
                octave.elements.forEach((_, index) => {
                    const xPos = (index * spacing) + spacing / 2;
                    svg.append("line")
                        .attr("x1", xPos)
                        .attr("y1", rowY + 35 + elementSize / 2 + 5)
                        .attr("x2", xPos)
                        .attr("y2", rowY + rowSpacing + 35 - elementSize / 2 - 5)
                        .attr("stroke", "#FF6B6B")
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", "3,3")
                        .attr("opacity", 0.5);
                });
            }
        });

        // Add legend for Newlands'
        this.createNewlandsLegend(svg, startY + rowSpacing * 2 + 10);
    }

    /**
     * Create legend for Newlands visualization
     */
    createNewlandsLegend(svg, yPos) {
        svg.append("text")
            .attr("x", 10)
            .attr("y", yPos)
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("fill", "#a0b0c0")
            .text("Similar elements are vertically aligned!");
    }

    /**
     * Initialize Meyer's Curve visualization
     */
    initMeyerCurve(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const margin = { top: 40, right: 30, bottom: 60, left: 55 };
        const width = 500 - margin.left - margin.right;
        const height = 380 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleLog()
            .domain([1, 100])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 60])
            .range([height, 0]);

        // Add grid
        this.addMeyerGrid(svg, xScale, yScale, width, height);

        // Add axes
        this.addMeyerAxes(svg, xScale, yScale, width, height);

        // Draw curve
        this.drawMeyerCurve(svg, xScale, yScale);

        // Plot elements
        this.plotMeyerElements(svg, xScale, yScale);

        // Add legend
        this.createMeyerLegend(svg, width, height);
    }

    /**
     * Add grid to Meyer's curve
     */
    addMeyerGrid(svg, xScale, yScale, width, height) {
        // Y-axis grid
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(""))
            .selectAll("line")
            .style("stroke", "rgba(255, 255, 255, 0.05)")
            .style("stroke-dasharray", "3,3");

        svg.selectAll(".grid .domain").style("display", "none");
    }

    /**
     * Add axes to Meyer's curve
     */
    addMeyerAxes(svg, xScale, yScale, width, height) {
        // X Axis
        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .ticks(5, ".0f"));

        xAxis.selectAll("text")
            .style("fill", "#a0b0c0")
            .style("font-size", "10px");

        xAxis.selectAll("line, path")
            .style("stroke", "rgba(255, 255, 255, 0.3)");

        // X Label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#a0b0c0")
            .text("Atomic Mass (u)");

        // Y Axis
        const yAxis = svg.append("g")
            .call(d3.axisLeft(yScale).ticks(6));

        yAxis.selectAll("text")
            .style("fill", "#a0b0c0")
            .style("font-size", "10px");

        yAxis.selectAll("line, path")
            .style("stroke", "rgba(255, 255, 255, 0.3)");

        // Y Label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#a0b0c0")
            .text("Atomic Volume (cm³/mol)");
    }

    /**
     * Draw Meyer's curve
     */
    drawMeyerCurve(svg, xScale, yScale) {
        const sortedElements = [...this.elements].sort((a, b) => a.atomicMass - b.atomicMass);

        // Gradient definition
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "meyerGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#118AB2");

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#06D6A0");

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.atomicMass))
            .y(d => yScale(d.atomicVolume))
            .curve(d3.curveMonotoneX);

        // Draw curve
        svg.append("path")
            .datum(sortedElements)
            .attr("fill", "none")
            .attr("stroke", "url(#meyerGradient)")
            .attr("stroke-width", 3)
            .attr("d", line);

        // Highlight peaks (alkali metals)
        const alkaliMetals = this.elements.filter(e => e.group === "alkali");
        alkaliMetals.forEach(metal => {
            // Peak indicator line
            svg.append("line")
                .attr("x1", xScale(metal.atomicMass))
                .attr("y1", yScale(metal.atomicVolume))
                .attr("x2", xScale(metal.atomicMass))
                .attr("y2", yScale(metal.atomicVolume) - 20)
                .attr("stroke", "#FF6B6B")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "3,3");

            // Peak label
            svg.append("text")
                .attr("x", xScale(metal.atomicMass))
                .attr("y", yScale(metal.atomicVolume) - 25)
                .attr("text-anchor", "middle")
                .attr("font-size", "9px")
                .attr("font-weight", "bold")
                .attr("fill", "#FF6B6B")
                .text("Peak!");
        });
    }

    /**
     * Plot elements on Meyer's curve
     */
    plotMeyerElements(svg, xScale, yScale) {
        const self = this;

        this.elements.forEach(element => {
            const g = svg.append("g")
                .attr("class", "meyer-element")
                .datum(element);

            // Element circle
            g.append("circle")
                .attr("cx", xScale(element.atomicMass))
                .attr("cy", yScale(element.atomicVolume))
                .attr("r", 7)
                .attr("fill", this.groupColors[element.group])
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5);

            // Element symbol
            g.append("text")
                .attr("x", xScale(element.atomicMass))
                .attr("y", yScale(element.atomicVolume) - 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "9px")
                .attr("font-weight", "bold")
                .attr("fill", "#fff")
                .text(element.symbol);

            // Hover interaction
            g.on("mouseover", function (event, d) {
                d3.select(this).select("circle")
                    .transition()
                    .duration(150)
                    .attr("r", 10)
                    .attr("stroke", "#ffd700")
                    .attr("stroke-width", 3);

                const tooltip = d3.select(".meyer-tooltip");
                tooltip.style("opacity", 1)
                    .html(`
                        <strong>${d.symbol}</strong> - ${d.name}<br/>
                        <span style="color: #a0b0c0;">Atomic Mass:</span> ${d.atomicMass} u<br/>
                        <span style="color: #a0b0c0;">Atomic Volume:</span> ${d.atomicVolume} cm³/mol<br/>
                        <span style="color: #118AB2;">Group:</span> ${self.groupNames[d.group]}<br/>
                        <span style="color: #a0b0c0;">Discovered:</span> ${d.yearDiscovered}
                    `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
                .on("mouseout", function () {
                    d3.select(this).select("circle")
                        .transition()
                        .duration(150)
                        .attr("r", 7)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1.5);

                    d3.select(".meyer-tooltip").style("opacity", 0);
                });
        });
    }

    /**
     * Create legend for Meyer's curve
     */
    createMeyerLegend(svg, width, height) {
        const legendX = 10;
        const legendY = 10;

        const groups = [
            { name: "Alkali", color: this.groupColors.alkali },
            { name: "Alkaline", color: this.groupColors.alkaline },
            { name: "Transition", color: this.groupColors.transition },
            { name: "Non-metal", color: this.groupColors.nonmetal },
            { name: "Halogen", color: this.groupColors.halogen }
        ];

        groups.forEach((group, i) => {
            const yPos = legendY + (i * 16);

            svg.append("circle")
                .attr("cx", legendX)
                .attr("cy", yPos)
                .attr("r", 5)
                .attr("fill", group.color);

            svg.append("text")
                .attr("x", legendX + 12)
                .attr("y", yPos + 3)
                .attr("font-size", "9px")
                .attr("fill", "#a0b0c0")
                .text(group.name);
        });
    }

    /**
     * Setup quiz interactivity
     */
    setupQuizInteractivity() {
        const self = this;
        const questions = document.querySelectorAll('.quiz-question');

        questions.forEach((question, qIndex) => {
            const options = question.querySelectorAll('.quiz-option');
            const feedback = question.querySelector('.quiz-feedback');

            options.forEach(option => {
                option.addEventListener('click', function () {
                    // Check if already answered
                    if (self.answeredQuestions.has(qIndex)) return;
                    self.answeredQuestions.add(qIndex);

                    const isCorrect = this.getAttribute('data-answer') === 'correct';

                    // Disable all options
                    options.forEach(opt => {
                        opt.disabled = true;
                        if (opt.getAttribute('data-answer') === 'correct') {
                            opt.classList.add('correct');
                        }
                    });

                    // Show selected state
                    if (!isCorrect) {
                        this.classList.add('wrong');
                    }

                    // Update score
                    if (isCorrect) {
                        self.score++;
                        feedback.className = 'quiz-feedback show correct';
                        feedback.textContent = '✓ Correct! Great job!';
                    } else {
                        feedback.className = 'quiz-feedback show wrong';
                        feedback.textContent = '✗ Not quite. The correct answer is highlighted above.';
                    }

                    // Update score display
                    document.getElementById('scoreValue').textContent = self.score;
                });
            });
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    const periodicEvolution = new PeriodicTableEvolution();
    periodicEvolution.init();

    // Make available globally for debugging
    window.periodicEvolution = periodicEvolution;
});
