import * as d3 from 'd3';

class StackedLinePlot {
  constructor(data, patientId) {
    this.data = data;
    this.patientId = patientId;
    // this.symptoms = ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress'];
    this.symptoms = [];
  }

  init() {
    var i = 0;
    const { data, patientId } = this;
    const margin = { left: 10, right: 20, top: 10, bottom: 10 };
    const width = 300;
    const height = 200;

    // var symptoms = ['pain','nausea','fatigue','teethProblem','distress'];
    const periods = ['Baseline', '6M', '12M', '18M', '24M', '> 2 years'];

    const colors = ['green', 'red', 'blue', 'orange', 'purple'];
    this.svg = d3.select("#stackedLinePlot")
      .append('svg')
      .attr('class', 'plot')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('font-size', 10)
      .attr("font-family", "sans-serif")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    this.g = this.svg.append('g')
      .attr('transform', `translate(0,0)`);

    this.xScale = d3.scalePoint()
      .domain(periods)
      .range([margin.left + 45, width - margin.right]);

    this.yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([height - margin.bottom - 20, margin.top + 20]);

    this.g.append('g')
      .attr('class', 'axis')
      .attr('color', 'black')
      .attr('transform', `translate(${0},${height - margin.top - 20})`)
      .call(d3.axisBottom(this.xScale));

    this.yScales = periods.map(period =>
      d3.scaleLinear()
        .range([height - margin.bottom - 20, margin.top + 20])
        .domain(d3.extent(periods.map(d => d[period])))
    )

    periods.forEach((period, i) => {
      this.g.append('g')
        .attr('class', 'axis')
        .attr('color', 'black')
        .attr('transform', `translate(${this.xScale(period)},0)`)
        .call(d3.axisLeft(this.yScales[i]))
    })

    this.g.append('g')
      .attr('class', 'axis')
      .attr('color', 'black')
      .attr('transform', `translate(${margin.left + 45},0)`)
      .call(d3.axisLeft(this.yScale).ticks(20).tickFormat((d, i) => (i % 5) * 2));

    for (i = 0; i < 5; i++) {
      this.g.append('rect')
        .attr('x', margin.left + 46)
        .attr('y', height - 58 - 28 * i)
        .attr('height', 28)
        .attr('width', 225)
        .attr('fill', colors[i])
        .attr('opacity', '0.2');
    }

    // for(i=0;i<groupsNo;i++){
    //   g.append('rect')
    //     .attr('x',margin.left + 290)
    //     .attr('y',height-58-28*i)
    //     .attr('height',28)
    //     .attr('width',10)
    //     .attr('fill',colors[i])
    //     .attr('opacity', '0.2');
    // }

    this.g.append('text')
      .attr('transform', `translate(${width / 2},${height})`)
      .style('text-anchor', 'middle')
      .text('Time')
      .attr('font-size', '10px');

    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 30)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Symptoms Group no.')
      .attr('font-size', '10px');

    for (i = 0; i < 5; i++) {
      this.g.append('text')
        .attr('class', 'symptomText')
        .attr('x', 285)
        .attr('y', height - 40 - 28 * i)
        .text(this.symptoms[i])
    }

    this.drawStackPlot(patientId, this.symptoms);
  }

  drawStackPlot(patientId, symptoms) {
    const margin = { left: 10, right: 20, top: 30, bottom: 30 };
    const width = 300;
    const height = 200;
    var i = 0;
    var groupsNo = 5;
    var groupPlots = [];

    var patient = this.data.filter(p => p.patientId == patientId);
    const colors = ['green', 'red', 'blue', 'orange', 'purple'];
    const periods = ['Baseline', '6M', '12M', '18M', '24M', '> 2 years'];

    function transformPeriod(p) {
      switch (p) {
        case 0:
          return 'Baseline';
        case 6:
        case 12:
        case 18:
        case 24:
          return `${p}M`;
        default:
          return '> 2 years';
      }
    }

    for (i = 0; i < 5; i++) {
      groupPlots[i] = d3.line()
        .defined(d => parseInt(d.period) >= 0)
        .x(d => this.xScale(transformPeriod(parseInt(d.period))))
        .y(d => this.yScale((parseInt(d[symptoms[i]]) + 10 * i) / 10));
    }

    for (i = 0; i < symptoms.length; i++) {
      this.g.append("path")
        .datum(patient)
        .attr("d", groupPlots[i])
        .attr('class', 'linePlots')
        .attr('fill', 'none')
        .attr('stroke', colors[i])
        .attr('stroke-width', '1px')
    }

    this.g.append('text')
      .attr('class', 'stackTitle')
      .attr('id', 'stackTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${width / 2 - margin.left},${margin.top / 2})`)
      .text("Patient " + this.patientId)

    for (i = 0; i < 5; i++) {
      this.g.append('text')
        .attr('class', 'symptomText')
        .attr('x', 285)
        .attr('y', height - 40 - 28 * i)
        .text(this.symptoms[i])
    }
  }

  clear() {
    this.svg.selectAll('.linePlots').remove();
    this.svg.selectAll('.stackTitle').remove();
    this.svg.selectAll('.symptomText').remove();
  }

  update(patientId, symptoms) {
    this.symptoms = symptoms;
    this.patientId = patientId;
    this.drawStackPlot(patientId, symptoms);
  }
}

export default StackedLinePlot;
