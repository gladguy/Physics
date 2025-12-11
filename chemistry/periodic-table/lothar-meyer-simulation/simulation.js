/**
 * Lothar Meyer's Curve Visualization
 * Shows atomic volume vs atomic weight with periodicity
 * Demonstrates the periodic law through graphical representation
 */

class LotharMeyerCurve {
    constructor() {
        // Element data: [symbol, atomicWeight, atomicVolume, group, name]
        this.elements = [
            // Alkali Metals (Group 1) - peaks of the curve
            ["Li", 6.94, 13.1, 1, "Lithium"],
            ["Na", 22.99, 23.7, 1, "Sodium"],
            ["K", 39.10, 45.3, 1, "Potassium"],
            ["Rb", 85.47, 55.9, 1, "Rubidium"],
            ["Cs", 132.91, 70.0, 1, "Caesium"],

            // Alkaline Earth Metals (Group 2)
            ["Be", 9.01, 5.0, 2, "Beryllium"],
            ["Mg", 24.31, 14.0, 2, "Magnesium"],
            ["Ca", 40.08, 25.9, 2, "Calcium"],
            ["Sr", 87.62, 33.7, 2, "Strontium"],
            ["Ba", 137.33, 39.0, 2, "Barium"],

            // Boron Group (Group 13)
            ["B", 10.81, 4.6, 13, "Boron"],
            ["Al", 26.98, 10.0, 13, "Aluminium"],

            // Carbon Group (Group 14)
            ["C", 12.01, 5.3, 14, "Carbon"],
            ["Si", 28.09, 12.1, 14, "Silicon"],

            // Nitrogen Group (Group 15)
            ["N", 14.01, 17.3, 15, "Nitrogen"],
            ["P", 30.97, 17.0, 15, "Phosphorus"],

            // Oxygen Group (Group 16)
            ["O", 16.00, 14.0, 16, "Oxygen"],
            ["S", 32.07, 15.5, 16, "Sulfur"],

            // Halogens (Group 17)
            ["F", 19.00, 17.1, 17, "Fluorine"],
            ["Cl", 35.45, 18.7, 17, "Chlorine"],

            // Transition Metals (Groups 8-12) - valleys of the curve
            ["Fe", 55.85, 7.1, 8, "Iron"],
            ["Co", 58.93, 6.7, 9, "Cobalt"],
            ["Ni", 58.69, 6.6, 10, "Nickel"],
            ["Cu", 63.55, 7.1, 11, "Copper"],
            ["Zn", 65.38, 9.2, 12, "Zinc"]
        ];

        // Group colors with vibrant palette
        this.groupColors = {
            1: "#FF6B6B",   // Alkali metals - Red
            2: "#FFD166",   // Alkaline earth - Yellow
            13: "#06D6A0",  // Boron group - Teal
            14: "#118AB2",  // Carbon group - Blue
            15: "#073B4C",  // Nitrogen group - Dark Blue
            16: "#7209B7",  // Oxygen group - Purple
            17: "#F72585",  // Halogens - Pink
            8: "#FF9E00",   // Transition metals - Orange
            9: "#FF9E00",
            10: "#FF9E00",
            11: "#FF9E00",
            12: "#FF9E00"
        };

        // Group names for legend
        this.groupNames = {
            1: "Alkali Metals",
            2: "Alkaline Earth Metals",
            13: "Boron Group",
            14: "Carbon Group",
            15: "Nitrogen Group",
            16: "Oxygen Group",
            17: "Halogens",
            8: "Transition Metals"
        };

        // Chart dimensions
        this.margin = { top: 50, right: 40, bottom: 70, left: 70 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 450 - this.margin.top - this.margin.bottom;

        // State
        this.showCurve = true;
        this.showLabels = true;
        this.currentFilter = 'all';
        this.tooltip = null;
        this.svg = null;
        this.xScale = null;
        this.yScale = null;
    }

    /**
     * Initialize the curve visualization
     * @param {string} containerId - ID of the container div
     */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Create SVG
        this.svg = d3.select(container)
            .append("svg")
            .attr("viewBox", `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Create scales
        this.xScale = d3.scaleLog()
            .domain([5, 150])
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .domain([0, 80])
            .range([this.height, 0]);

        // Create tooltip
        this.createTooltip();

        // Add grid
        this.addGrid();

        // Add axes
        this.addAxes();

        // Add curve
        this.drawCurve();

        // Add elements
        this.plotElements();

        // Add title
        this.addTitle();

        // Setup controls
        this.setupControls();

        // Setup legend
        this.setupLegend();

        // Setup quiz
        this.setupQuiz();
    }

    /**
     * Create tooltip element
     */
    createTooltip() {
        // Remove existing tooltip if any
        d3.select(".meyer-tooltip").remove();

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "meyer-tooltip")
            .style("opacity", 0);
    }

    /**
     * Add grid lines
     */
    addGrid() {
        // Y-axis grid
        this.svg.append("g")
            .attr("class", "grid y-grid")
            .call(d3.axisLeft(this.yScale)
                .tickSize(-this.width)
                .tickFormat("")
                .ticks(8))
            .selectAll("line")
            .style("stroke", "rgba(255, 255, 255, 0.05)")
            .style("stroke-dasharray", "3,3");

        // X-axis grid
        this.svg.append("g")
            .attr("class", "grid x-grid")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale)
                .tickSize(-this.height)
                .tickFormat("")
                .ticks(5))
            .selectAll("line")
            .style("stroke", "rgba(255, 255, 255, 0.05)")
            .style("stroke-dasharray", "3,3");
    }

    /**
     * Add axes to the visualization
     */
    addAxes() {
        // X Axis
        const xAxis = this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale)
                .ticks(5, ".0f")
                .tickFormat(d => d));

        xAxis.selectAll("text")
            .style("fill", "#a0b0c0")
            .style("font-size", "11px");

        xAxis.selectAll("line, path")
            .style("stroke", "rgba(255, 255, 255, 0.3)");

        // X Axis Label
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", this.width / 2)
            .attr("y", this.height + 50)
            .attr("fill", "#a0b0c0")
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .text("Atomic Weight (u)");

        // Y Axis
        const yAxis = this.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(this.yScale)
                .ticks(8));

        yAxis.selectAll("text")
            .style("fill", "#a0b0c0")
            .style("font-size", "11px");

        yAxis.selectAll("line, path")
            .style("stroke", "rgba(255, 255, 255, 0.3)");

        // Y Axis Label
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -55)
            .attr("x", -this.height / 2)
            .attr("fill", "#a0b0c0")
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .text("Atomic Volume (cm³/mol)");
    }

    /**
     * Draw the Meyer curve connecting elements
     */
    drawCurve() {
        // Sort elements by atomic weight
        const sortedElements = [...this.elements].sort((a, b) => a[1] - b[1]);

        // Create line generator with smoothing
        const line = d3.line()
            .x(d => this.xScale(d[1]))
            .y(d => this.yScale(d[2]))
            .curve(d3.curveMonotoneX);

        // Draw the curve
        this.svg.append("path")
            .datum(sortedElements)
            .attr("class", "meyer-curve")
            .attr("fill", "none")
            .attr("stroke", "url(#curveGradient)")
            .attr("stroke-width", 2.5)
            .attr("stroke-dasharray", "8,4")
            .attr("d", line)
            .attr("opacity", 0.8);

        // Add gradient definition
        const defs = this.svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "curveGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#a855f7");

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ec4899");
    }

    /**
     * Plot individual elements as points
     */
    plotElements() {
        const self = this;

        // Create points for each element
        const points = this.svg.selectAll(".element-point")
            .data(this.elements)
            .enter()
            .append("circle")
            .attr("class", "element-point")
            .attr("cx", d => this.xScale(d[1]))
            .attr("cy", d => this.yScale(d[2]))
            .attr("r", 10)
            .attr("fill", d => this.groupColors[d[3]])
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))")
            .on("mouseover", function (event, d) {
                self.tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                self.tooltip.html(`
                    <strong>${d[0]} - ${d[4]}</strong><br/>
                    <span style="color: #a0b0c0;">Atomic Weight:</span> ${d[1]} u<br/>
                    <span style="color: #a0b0c0;">Atomic Volume:</span> ${d[2]} cm³/mol<br/>
                    <span style="color: #a0b0c0;">Group:</span> ${self.groupNames[d[3]] || 'Group ' + d[3]}
                `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 30) + "px");

                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 14)
                    .attr("stroke-width", 3);

                // Update element info panel
                self.updateElementInfo(d);
            })
            .on("mousemove", function (event) {
                self.tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function () {
                self.tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 10)
                    .attr("stroke-width", 2);
            });

        // Add element symbols
        this.svg.selectAll(".element-label")
            .data(this.elements)
            .enter()
            .append("text")
            .attr("class", "element-label")
            .attr("x", d => this.xScale(d[1]))
            .attr("y", d => this.yScale(d[2]) - 16)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "#fff")
            .text(d => d[0]);
    }

    /**
     * Update element info panel
     */
    updateElementInfo(element) {
        const panel = document.getElementById('element-details');
        if (!panel) return;

        const groupName = this.groupNames[element[3]] || 'Group ' + element[3];
        const color = this.groupColors[element[3]];

        panel.innerHTML = `
            <div class="element-symbol" style="color: ${color}">${element[0]}</div>
            <div class="element-name" style="margin-bottom: 0.75rem; color: #fff;">${element[4]}</div>
            <div class="element-prop">
                <span class="prop-label">Atomic Weight</span>
                <span class="prop-value">${element[1]} u</span>
            </div>
            <div class="element-prop">
                <span class="prop-label">Atomic Volume</span>
                <span class="prop-value">${element[2]} cm³/mol</span>
            </div>
            <div class="element-prop">
                <span class="prop-label">Group</span>
                <span class="prop-value" style="color: ${color}">${groupName}</span>
            </div>
        `;
    }

    /**
     * Add title
     */
    addTitle() {
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "#fff")
            .text("Lothar Meyer's Curve: Atomic Volume vs Atomic Weight (1869)");
    }

    /**
     * Setup control buttons
     */
    setupControls() {
        const resetBtn = document.getElementById('reset-btn');
        const toggleCurveBtn = document.getElementById('toggle-curve-btn');
        const toggleLabelsBtn = document.getElementById('toggle-labels-btn');
        const groupFilter = document.getElementById('group-filter');

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.currentFilter = 'all';
                if (groupFilter) groupFilter.value = 'all';
                this.showCurve = true;
                this.showLabels = true;
                this.updateVisualization();
            });
        }

        if (toggleCurveBtn) {
            toggleCurveBtn.addEventListener('click', () => {
                this.showCurve = !this.showCurve;
                this.svg.select('.meyer-curve')
                    .transition()
                    .duration(300)
                    .attr('opacity', this.showCurve ? 0.8 : 0);
            });
        }

        if (toggleLabelsBtn) {
            toggleLabelsBtn.addEventListener('click', () => {
                this.showLabels = !this.showLabels;
                this.svg.selectAll('.element-label')
                    .transition()
                    .duration(300)
                    .attr('opacity', this.showLabels ? 1 : 0);
            });
        }

        if (groupFilter) {
            groupFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.updateVisualization();
            });
        }
    }

    /**
     * Update visualization based on filter
     */
    updateVisualization() {
        const filter = this.currentFilter;

        this.svg.selectAll('.element-point')
            .transition()
            .duration(300)
            .attr('opacity', d => {
                if (filter === 'all') return 1;
                if (filter === 'transition') {
                    return [8, 9, 10, 11, 12].includes(d[3]) ? 1 : 0.15;
                }
                return d[3] === parseInt(filter) ? 1 : 0.15;
            })
            .attr('r', d => {
                if (filter === 'all') return 10;
                if (filter === 'transition') {
                    return [8, 9, 10, 11, 12].includes(d[3]) ? 12 : 8;
                }
                return d[3] === parseInt(filter) ? 12 : 8;
            });

        this.svg.selectAll('.element-label')
            .transition()
            .duration(300)
            .attr('opacity', d => {
                if (!this.showLabels) return 0;
                if (filter === 'all') return 1;
                if (filter === 'transition') {
                    return [8, 9, 10, 11, 12].includes(d[3]) ? 1 : 0.15;
                }
                return d[3] === parseInt(filter) ? 1 : 0.15;
            });
    }

    /**
     * Setup legend
     */
    setupLegend() {
        const legendContainer = document.getElementById('legend-items');
        if (!legendContainer) return;

        const legendData = [
            { group: 1, label: "Alkali Metals" },
            { group: 2, label: "Alkaline Earth" },
            { group: 13, label: "Boron Group" },
            { group: 14, label: "Carbon Group" },
            { group: 15, label: "Nitrogen Group" },
            { group: 16, label: "Oxygen Group" },
            { group: 17, label: "Halogens" },
            { group: 8, label: "Transition Metals" }
        ];

        legendContainer.innerHTML = legendData.map(item => `
            <div class="legend-item" data-group="${item.group}">
                <div class="legend-color" style="background: ${this.groupColors[item.group]}"></div>
                <span class="legend-label">${item.label}</span>
            </div>
        `).join('');

        // Add click handlers for legend items
        legendContainer.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const group = item.dataset.group;
                const groupFilter = document.getElementById('group-filter');

                if (group === '8') {
                    this.currentFilter = 'transition';
                    if (groupFilter) groupFilter.value = 'transition';
                } else {
                    this.currentFilter = group;
                    if (groupFilter) groupFilter.value = group;
                }

                this.updateVisualization();
            });
        });
    }

    /**
     * Setup quiz functionality
     */
    setupQuiz() {
        const quizOptions = document.getElementById('quiz-options');
        const quizFeedback = document.getElementById('quiz-feedback');

        if (!quizOptions || !quizFeedback) return;

        quizOptions.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                // Reset all options
                quizOptions.querySelectorAll('.quiz-option').forEach(opt => {
                    opt.classList.remove('correct', 'wrong');
                    opt.disabled = true;
                });

                // Mark selected option
                const isCorrect = option.dataset.answer === 'correct';
                option.classList.add(isCorrect ? 'correct' : 'wrong');

                // Show feedback
                quizFeedback.className = 'quiz-feedback show ' + (isCorrect ? 'correct' : 'wrong');
                quizFeedback.textContent = isCorrect
                    ? '✓ Correct! Alkali metals (Li, Na, K, Rb, Cs) have the highest atomic volumes, creating peaks in Meyer\'s curve.'
                    : '✗ Incorrect. The correct answer is Alkali Metals. Look at the peaks of the curve!';

                // Highlight alkali metals in the chart
                if (isCorrect) {
                    this.currentFilter = '1';
                    document.getElementById('group-filter').value = '1';
                    this.updateVisualization();
                }
            });
        });
    }

    /**
     * Get data for specific element
     * @param {string} elementSymbol - Element symbol
     * @returns {Array|null} Element data
     */
    getElementData(elementSymbol) {
        return this.elements.find(el => el[0] === elementSymbol) || null;
    }

    /**
     * Get all elements by group
     * @param {number} group - Group number
     * @returns {Array} Elements in the group
     */
    getElementsByGroup(group) {
        return this.elements.filter(el => el[3] === group);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    // Initialize visualization
    const meyerCurve = new LotharMeyerCurve();
    meyerCurve.init('meyerCurveContainer');

    // Make available globally for debugging
    window.meyerCurve = meyerCurve;
});
