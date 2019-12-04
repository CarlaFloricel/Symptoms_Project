import * as d3 from 'd3';

class CorrelationMatrix {
  constructor(selector, width, height, data) {
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.data = data;
    this.itemSize = 22;
    this.cellSize = this.itemSize - 3;
  }

  prepareData(data) {
    this.symptoms = data.columns.sort((a, b) => a.length - b.length);
    this.correlationData = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < Object.keys(data[i]).length; j++) {
        this.correlationData.push({
          row: i,
          col: j,
          value: parseFloat(data[i][this.symptoms[j]]),
        });
      }
    }
  }

  init() {
    const { data, width, height } = this;
    this.margin = { left: 30, bottom: 30 };

    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", `0 0 ${width}, ${height}`)
      .attr("font-size", 20)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .classed('correlation', true)
      .classed('correlation-full', true);

    this.tooltip = d3.select("body")
      .append("div")
      .style("width", "40px")
      .style("height", "24px")
      .style("background", "#C3B3E5")
      .style("opacity", "1")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("box-shadow", "0px 0px 6px #7861A5")
      .style("padding", "4px")
      .attr('id', 'correlation-tooltip');

    this.toolval = this.tooltip.append('div');

    this.prepareData(data);

    this.xScale = d3.scaleBand()
      .rangeRound([0, width - this.margin.left])
      .domain(this.symptoms);
    this.yScale = d3.scaleBand()
      .rangeRound([0, height - this.margin.bottom])
      .domain(this.symptoms);
    this.colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['crimson', 'white', 'slateblue']);
    this.radiusScale = d3.scaleSqrt()
      .domain([0, 1])
      .range([0, 0.5 * this.xScale.bandwidth()]);

    this.drawCells();
  }

  drawCells() {
    const cells = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .attr('id', 'cells')
      .selectAll('empty')
      .data(this.correlationData)
      .enter().append('g')
      .attr('class', 'cell')
      .style('pointer-events', 'all');

    cells.append('rect')
      .attr('x', d => this.xScale(this.symptoms[d.col]))
      .attr('y', d => this.yScale(this.symptoms[d.row]))
      .attr('width', d => d.col >= d.row ? 0 : this.xScale.bandwidth())
      .attr('height', d => d.col >= d.row ? 0 : this.yScale.bandwidth())
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-width', '1')

    cells.append('circle')
      .attr('cx', d => this.xScale(this.symptoms[d.col]) + 0.5 * this.xScale.bandwidth())
      .attr('cy', d => this.yScale(this.symptoms[d.row]) + 0.5 * this.yScale.bandwidth())
      .attr('r', d => d.col >= d.row ? 0 : this.radiusScale(Math.abs(d.value)))
      .style('fill', d => this.colorScale(d.value));

    const { svg, toolval, tooltip, xScale, yScale, height, symptoms, margin } = this;
    svg.selectAll('g.cell')
      .on('mouseover', function (d) {
        d3.select(this)
          .select('rect')
          .attr('stroke', 'black');

        svg.append('text')
          .attr('class', 'correlation-label')
          .attr('x', margin.left + xScale(symptoms[d.col]))
          .attr('y', height - margin.bottom / 2)
          .text(symptoms[d.col])
          .attr('text-anchor', d.col <= symptoms.length / 2 ? 'start' : 'end')
          .style('font-size', '1em');

        svg.append('text')
          .attr('class', 'correlation-label')
          .attr('x', -15 - yScale(symptoms[d.row]))
          .attr('y', margin.left - 5)
          .attr('text-anchor', d.row > symptoms.length / 2 ? 'start' : 'end')
          .attr('dominant-baseline', 'middle')
          .attr('transform', 'rotate(-90)')
          .text(symptoms[d.row]);

        tooltip.style('visibility', 'visible')
          .style('left', `${d3.event.pageX + 20}px`)
          .style('top', `${d3.event.pageY - 20}px`);
        toolval.text(d3.format('.2f')(d.value));
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .select('rect')
          .attr('stroke', 'none');
        d3.selectAll('.correlation-label').remove();
        d3.selectAll('#correlation-tooltip')
          .style('visibility', 'hidden');
      });
  }

  clear() {
    this.svg.select('#cells').remove();
  }

  update(data) {
    this.data = data;
    this.prepareData(this.data);
    this.drawCells();
  }
}

export default CorrelationMatrix;
