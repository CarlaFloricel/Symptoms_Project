import * as d3 from 'd3';

class ScatterPlot {
  constructor(selector, label, margin, width, height, data, domain) {
    this.selector = selector;
    this.margin = margin;
    this.width = width;
    this.height = height;
    this.data = data;
    this.label = label;
    this.domain = domain;
  }

  init() {
    const { data } = this;
    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('id', this.label)
      .attr('class', 'plot')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
    // .attr('width', this.width + this.margin.left + this.margin.right)
    // .attr('height', this.height + this.margin.top + this.margin.bottom);
    const g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const leftStart = this.margin.left + 45;

    g.append('text')
      .attr('class', 'plot-title')
      .text(this.label);

    this.xScale = d3.scaleLinear()
      .domain(this.domain.x)
      .range([leftStart, this.width - this.margin.right]);
    this.yScale = d3.scaleLinear()
      .domain(this.domain.y)
      .range([this.height - this.margin.bottom, this.margin.top]);
    this.sizeScale = d3.scaleOrdinal()
      .domain(d3.extent(data.map(d => d.tumorCategory)))
      .range([4, 8, 12, 16]);
    this.colorScale = d3.scaleOrdinal()
      .domain(['Male', 'Female'])
      .range(['rgba(33, 127, 242, 0.52)', 'rgba(242, 33, 166, 0.52)']);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.age))
      .attr('cy', d => this.yScale(d.dosage))
      .attr('r', d => this.sizeScale(d.tumorCategory))
      .style('fill', d => this.colorScale(d.gender));

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${0},${this.height - this.margin.top})`)
      .call(d3.axisBottom(this.xScale));

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${leftStart},0)`)
      .call(d3.axisLeft(this.yScale));

    g.append('text')
      .attr('transform', `translate(${this.width / 2},${this.height})`)
      .style('text-anchor', 'middle')
      .text('Age');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left + 16)
      .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Total Dosage');
  }

  clear() {
    this.svg.selectAll('circle').remove();
  }

  update(data) {
    const circles = this.svg.select('g')
      .selectAll('circle')
      .data(data);

    circles.enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.age))
      .attr('cy', d => this.yScale(d.dosage))
      .attr('r', d => this.sizeScale(d.tumorCategory))
      .style('fill', d => this.colorScale(d.gender));
  }
}

export default ScatterPlot;
