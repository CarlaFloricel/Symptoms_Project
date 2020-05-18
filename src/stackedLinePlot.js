import * as d3 from 'd3';

class StackedLinePlot {
  constructor(data, patientId) {
    this.data = data;
    this.patientId = patientId;
    this.symptoms = [];
  }

  init() {
    var i = 0;
    const {
      data,
      patientId
    } = this;
    const margin = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 10
    };
    const width = 525;
    const height = 260;

    const periods = ['Baseline', '6M', '12M', '18M', '24M', '> 2 years'];

    const colors = ['#803e3b', '#DA8A00', '#058f96', '#9854cc', '#66a61e'];
    this.svg = d3.select("#stackplot")
      .append('svg')
      .attr('class', 'plot')
      .attr('viewBox', `0 0 ${width } ${height }`)
      .attr('font-size', '0.5rem')
      .attr("font-family", "sans-serif")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('width', width)
      .attr('height', height );

    this.g = this.svg.append('g')
      .attr('transform', `translate(10,0)`);

    this.xScale = d3.scalePoint()
      .domain(periods)
      .range([margin.left + 45, width - 200]);

    this.yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([height - margin.bottom - 30, margin.top + 35]);

    this.g.append('g')
      .attr('class', 'axis')
      .attr('color', 'black')
      .attr('transform', `translate(${0},${height - margin.top - 40})`)
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
        .attr('stroke-width','1.2px')
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
        .attr('y', height - 77 - (height / 10 * 1.42) * i)
        .attr('height', height / 10 * 1.42)
        .attr('width', width - 245)
        .attr('fill', colors[i])
        .attr('opacity', '0.25');
    }

    for(i=0; i<5; i++){
      this.g.append('text')
      .attr('transform', `translate(35,${height-220 +i*37})`)
      .text('10')
      .attr('font-size', '0.3rem');
    }
    for(i=0; i<5; i++){
      this.g.append('text')
      .attr('transform', `translate(37,${height-205 +i*37})`)
      .text('5')
      .attr('font-size', '0.3rem');
    }
    for(i=0; i<5; i++){
      this.g.append('text')
      .attr('transform', `translate(37,${height-188.5 +i*37})`)
      .text('0')
      .attr('font-size', '0.3rem');
    }
    for(i=0; i<5; i++){
      this.g.append('text')
      .attr('transform', `translate(45.5,${height-185 +i*36.92})`)
      .text('-')
      .attr('font-size', '0.7rem');
    }
    for(i=0; i<5; i++){
      this.g.append('text')
      .attr('transform', `translate(45.5,${height-203 +i*36.92})`)
      .text('-')
      .attr('font-size', '0.7rem');
    }
    this.g.append('text')
      .attr('transform', `translate(45.5,${height-221.5})`)
      .text('-')
      .attr('font-size', '0.7rem');

    this.g.append('text')
      .attr('transform', `translate(${width / 2.8},${height-8})`)
      .style('text-anchor', 'middle')
      .text('Time')
      .attr('font-size', '0.5rem');

    this.g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 + 10)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Symptoms Group no.')
      .attr('font-size', '0.5rem');

  }


  drawStackPlot(patientId, symptoms) {
    console.log(patientId)
    const margin = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 10
    };
    const width = 580;
    const height = 260;
    var i = 0;
    var j = 0;
    var groupsNo = 5;
    var groupPlots = [];
    var patients = [];
    for (i = 0; i < patientId.length; i++) {
      patients[i] = this.data.filter(p => p.patientId == patientId[i]);
    }
    const colors = ['#803e3b', '#DA8A00', '#058f96', '#9854cc', '#66a61e'];
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

    const {
      tooltip,
      xScale,
      yScale
    } = this;


    let path;
    d3.select("#patient1").attr('visibility', 'hidden')
    d3.select("#patient2").attr('visibility', 'hidden')
    d3.select("#patient3").attr('visibility', 'hidden')
    d3.select("#line1").attr('visibility', 'hidden')
    d3.select("#line2").attr('visibility', 'hidden')
    d3.select("#line3").attr('visibility', 'hidden')

    if (patients.length == 1) {
      d3.select("#patient1").attr('visibility', 'visible')
      d3.select("#patient2").attr('visibility', 'hidden')
      d3.select("#patient3").attr('visibility', 'hidden')
      d3.select('#line1')
        .text("Patient: " + patients[0][0]["patientId"])
        .attr("visibility", "visible")
        .style("font-size", '1rem')
        .attr("font-weight", "bold")
      d3.select("#line2").attr("visibility", "hidden")
      d3.select("#line3").attr("visibility", "hidden")
    } else if (patients.length == 2) {
      d3.select("#patient1").attr('visibility', 'visible')
      d3.select("#patient2").attr('visibility', 'visible')
      d3.select("#patient3").attr('visibility', 'hidden')
      d3.select('#line1')
        .text("Patient: " + patients[0][0]["patientId"])
        .attr("visibility", "visible")
        .style("font-size", '1rem')
        .attr("font-weight", "bold")
      d3.select("#line2")
        .text("Patient: " + patients[1][0]["patientId"])
        .attr("visibility", "visible")
        .style("font-size", '1rem')
        .attr("font-weight", "bold")
      d3.select("#line3").attr("visibility", "hidden")

    } else if (patients.length == 3) {
      d3.select("#patient1").attr('visibility', 'visible')
      d3.select("#patient2").attr('visibility', 'visible')
      d3.select("#patient3").attr('visibility', 'visible')
      d3.select('#line1')
        .text("Patient: " + patients[0][0]["patientId"])
        .attr("visibility", "visible")
        .style("font-size", '1rem')
        .attr("font-weight", "bold")
      d3.select("#line2")
        .text("Patient: " + patients[1][0]["patientId"])
        .attr("visibility", "visible")
        .style("font-size", '1rem')
        .attr("font-weight", "bold")
      d3.select("#line3")
        .text("Patient: " + patients[2][0]["patientId"])
        .attr("visibility", "visible")
        .style("font-size", '1rem')
        .attr("font-weight", "bold")

    }
    for (let i = 0; i < symptoms.length; i++) {
      for (j = 0; j < patients.length; j++) {
        const p = patients[j][0]["patientId"]
        if(patients.length > 3){
          path = this.g.append("path")
            .datum(patients[j])
            .attr("d", groupPlots[i])
            .attr('class', 'linePlots')
            .attr('fill', 'none')
            .attr("opacity",0.8)
            .attr('stroke', colors[i])
            .attr('stroke-width', '1px')
        }

        else{

        if (j == 1) {
          path = this.g.append("path")
            .datum(patients[j])
            .attr("d", groupPlots[i])
            .attr('class', 'linePlots')
            .attr('fill', 'none')
            .attr("opacity",0.8)
            .attr('stroke', colors[i])
            .attr('stroke-width', '1px')
            .style("stroke-dasharray", ("5, 5"));
        }
        if (j == 2) {
          path = this.g.append("path")
            .datum(patients[j])
            .attr("d", groupPlots[i])
            .attr('class', 'linePlots')
            .attr('fill', 'none')
            .attr("opacity",0.8)
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
            .attr("opacity",0.8)
            .attr('stroke', colors[i])
            .attr('stroke-width', '1px')
        }
        }

        path.style('cursor', 'pointer')
          .on('mouseover', function (d) {
            d3.select(this)
              .attr('stroke-width', 2)
              .append("title")
              .text("Patient ID: " +p);


          }).on('mousemove', function (d) {

          }).on('mouseout', function () {
            d3.select(this)
              .attr('stroke-width', 1);
          })
      }
    }

    if(patients.length <= 3){
          this.g.append('text')
            .attr('class', 'stackTitle')
            .attr('id', 'stackTitle')
            .attr('font-size', '0.7rem')
            .attr('transform', `translate(${width / 4 - margin.left},20)`)
            .text("Patient " + this.patientId)
    }
    else{
       this.g.append('text')
            .attr('class', 'stackTitle')
            .attr('id', 'stackTitle')
            .attr('font-size', '0.7rem')
            .attr('transform', `translate(${width / 4 - margin.left},20)`)
            .text("Filtered Patients")
    
    }

    for (i = 0; i < 5; i++) {
      this.g.append('text')
        .attr('class', 'symptomText')
        .attr('x', width - 240)
        .attr('y', height - 50 - (height / 10 * 1.42) * i)
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
