import * as d3 from 'd3';

class StackedLinePlot {
  constructor(data, patientId) {
    this.data = data;
    this.patientId = patientId;
    this.symptoms = [];
  }

  init() {
    var i = 0;
    const { data, patientId } = this;
    const margin = { left: 0, right: 0, top: 10, bottom: 10 };
    const width = 500;
    const height = 260;

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
      .range([margin.left + 45, width - 10]);

    this.yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([height - margin.bottom - 30, margin.top + 35]);

    this.g.append('g')
      .attr('class', 'axis')
      .attr('color', 'black')
      .attr('transform', `translate(${0},${height - margin.top - 30})`)
      .call(d3.axisBottom(this.xScale));

    this.yScales = periods.map(period =>
      d3.scaleLinear()
        .range([height - margin.bottom - 30, margin.top + 35])
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
      .call(d3.axisLeft(this.yScale).ticks(0));

    for (i = 0; i < 5; i++) {
      this.g.append('rect')
        .attr('x', margin.left + 46)
        .attr('y', height - 78 - (height / 10 * 1.4) * i)
        .attr('height', height / 10 * 1.4)
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
      .attr('font-size', '30px');

    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 + 20)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Symptoms Group no.')
      .attr('font-size', '30px');

    for (i = 0; i < 5; i++) {
      this.g.append('text')
        .attr('class', 'symptomText')
        .attr('x', 285)
        .attr('y', height - 40 - 28 * i)
        .text(this.symptoms[i])
    }
  }

  drawStackPlot(patientId, symptoms) {
    const margin = { left: 10, right: 20, top: 30, bottom: 30 };
    const width = 300;
    const height = 200;
    var i = 0;
    var j = 0;
    var groupsNo = 5;
    var groupPlots = [];
    var patients = [];
    for (i = 0; i < patientId.length; i++) {
      patients[i] = this.data.filter(p => p.patientId == patientId[i]);
    }
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

    for (let i = 0; i < 5; i++) {
      groupPlots[i] = d3.line()
        .defined(d => parseInt(d.period) >= 0)
        .x(d => this.xScale(transformPeriod(parseInt(d.period))))
        .y(d => this.yScale((parseInt(d[symptoms[i]]) + 10 * i) / 10));
    }

    const { tooltip, xScale, yScale } = this;
    let path;
    for (let i = 0; i < symptoms.length; i++) {
      for (j = 0; j < patients.length; j++) {
        if (j == 1) {
          path = this.g.append("path")
            .datum(patients[j])
            .attr("d", groupPlots[i])
            .attr('class', 'linePlots')
            .attr('fill', 'none')
            .attr('stroke', colors[i])
            .attr('stroke-width', '1px')
            .style("stroke-dasharray", ("5, 5"))
        }
        if (j == 2) {
          path = this.g.append("path")
            .datum(patients[j])
            .attr("d", groupPlots[i])
            .attr('class', 'linePlots')
            .attr('fill', 'none')
            .attr('stroke', colors[i])
            .attr('stroke-width', '1px')
            .style("stroke-dasharray", ("3, 3"))
        }
        if (j == 0) {
          path = this.g.append("path")
            .datum(patients[j])
            .attr("d", groupPlots[i])
            .attr('class', 'linePlots')
            .attr('fill', 'none')
            .attr('stroke', colors[i])
            .attr('stroke-width', '1px')
        }

        path.style('cursor', 'pointer')
          .on('mouseover', function (d) {
            d3.select(this)
              .attr('stroke-width', 2);
            // const mouseX = d3.event.pageX;
            // const mouseY = d3.event.pageY;
            // const symptom = symptoms[i];
            // const symptomValues = d.map(x => x[symptom]);
            // console.log(yScale((parseInt(d[symptoms[i]]) + 10 * i) / 10));
            // tooltip
            //   .style('display', 'block')
            //   .style('top', `${mouseY + 20}px`)
            //   .style('left', `${mouseX + 20}px`)
            //   .text(Math.round(yScale.invert(y)));

          }).on('mousemove', function (d) {
            // const mouseX = d3.event.pageX;
            // const mouseY = d3.event.pageY;
            // const symptom = symptoms[i];
            // const symptomValues = d.map(x => x[symptom]);
            // const [x, y] = d3.mouse(this);

            // tooltip
            //   .style('display', 'block')
            //   .style('top', `${mouseY + 20}px`)
            //   .style('left', `${mouseX + 20}px`)
            //   .text(Math.round(yScale.invert(y)));
          }).on('mouseout', function () {
            d3.select(this)
              .attr('stroke-width', 1);

            // tooltip
            //   .style('display', 'none');
          })
      }
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
