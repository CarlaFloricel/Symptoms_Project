import * as d3 from 'd3';

class StackedLinePlot {
  constructor(data) {
    this.data = data;
  }

  init() {

    const margin = { left: 10, right: 20, top: 30, bottom: 30 };
    const width = 300;
    const height = 200;
    const { data } = this;
    var i=0;
    var groupsNo=5;
    var groupPlots=[];
    const colors = ['green', 'red', 'blue', 'orange', 'purple'];
    const periods = ['Baseline', '6M', '12M', '18M', '24M', '> 2 years'];
    var groups = [];

    const svg = d3.select("#stackedLinePlot")
      .append('svg')
      .attr('class', 'plot')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('text')
      .attr('class', 'stackTitle')
      .attr('font-size','10px')
      .attr('transform', `translate(${width/2-margin.left},${margin.top/2})`)
      .text("Patient " +data[0].patientId)



    const xScale = d3.scalePoint()
      .domain(periods)
      .range([margin.left + 45, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0,groupsNo])
      .range([height - margin.bottom, margin.top]);

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${0},${height - margin.top})`)
      .call(d3.axisBottom(xScale));

    const yScales = periods.map(period => 
      d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain(d3.extent(periods.map(d => d[period])))
    )


    periods.forEach((period,i) => {
      g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${xScale(period)},0)`)
        .call(d3.axisLeft(yScales[i]))
    })
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left + 45},0)`)
      .call(d3.axisLeft(yScale))

    function transformPeriod(p){
       return p == 0 ? 'Baseline' :
              p == 6 ? '6M' :
              p == 12 ? '12M' :
              p == 18 ? '18M' :
              p == 24 ? '24M' :
              '> 2 years';
    }

    for(i=0;i<groupsNo;i++){
      g.append('rect')
        .attr('x',margin.left + 46)
        .attr('y',height-58-28*i)
        .attr('height',28)
        .attr('width',225)
        .attr('fill',colors[i])
        .attr('opacity', '0.2');
    }

    for(i=0;i<groupsNo;i++){
      g.append('rect')
        .attr('x',margin.left + 290)
        .attr('y',height-58-28*i)
        .attr('height',28)
        .attr('width',10)
        .attr('fill',colors[i])
        .attr('opacity', '0.2');
    }
    
    for(i=0;i<groupsNo;i++){
      groupPlots[i]=d3.line()
              .defined(function(d) { return parseInt(d.period) >= 0; })
              .x(function(d) { return xScale(transformPeriod(parseInt(d.period))); })
              .y(function(d) { return yScale((parseInt(d.pain)+10*i)/10); }); 
    }

    for(i=0;i<groupsNo;i++){
      g.append("path")
      .datum(data)
      .attr("d", groupPlots[i])
      .attr('fill','none')
      .attr('stroke',colors[i])
      .attr('stroke-width','1px') 
    }



 

    g.append('text')
      .attr('transform', `translate(${width / 2},${height})`)
      .style('text-anchor', 'middle')
      .text('Time')
      .attr('font-size','10px');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 16)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Symptoms Group no.')
      .attr('font-size','10px');
  }


}

export default StackedLinePlot;
