import * as d3 from 'd3';

class TendrilPlot {
  constructor(selector, width, height, data) {
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.data = data;
  }

  init() {
    const { data, width, height } = this;
    d3.select(this.selector)
      .attr('title', 'This plot shows how the selected symptom ratings change over time. ' + 
        'Each tendril represents a symptom and each circle one time stamp .' + 
        'Left leaning indicates rating increase and vice versa.');

    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", `0 0 ${width}, ${height}`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr('preserveAspectRatio', "xMidYMid meet");

    this.patientIdEl = this.svg
      .append('text')
      .classed('patientTitle', true)
      .attr('font-size', '0.7rem')
      .attr('transform', `translate(${width / 2},20)`);
    this.drawTendrils(data);
  }

  clear() {
    this.svg.select('.tendrils').remove();
  }

  drawTendrils(data) {
    const { svg, height, width } = this;
    const { patient, symptoms, survival } = data;
    const s = survival;
    const timestamps = patient.map(p => parseInt(p.period));
    const radiusScale = d3.scaleLinear()
      .domain(d3.extent(timestamps))
      .range([10, 50]);
    const angleScale = d3.scaleLinear()
      .domain([0, 10])
      .range([-Math.PI/8, Math.PI / 8]);
    const colors = ['green', 'red', 'blue', 'orange', 'purple'];
    const colorScale = d3.scaleOrdinal(colors);

    const line = d3.lineRadial()
      .curve(d3.curveCardinal);

    this.patientIdEl.text(`Patient ${patient[0].patientId}`);


function transformPeriod(p) {
      switch (p) {
        case 0:
          return 0;
        case 1:
          return 20;
        case 2:
          return 40;
        case 3:
          return 60;
        case 4:
          return 80;
        default:
          return 100;
      }
    }



    const g = svg.append('g')
      .classed('tendrils', true)
      .attr('transform', `translate(${width / 2},${height -10}) scale(1.15, 1.15)`);

    symptoms.forEach((symptom, i) => {
      var time = 1;
      const radialData = patient
        .map(p => ({
          [symptom]: parseInt(p[symptom])
        }))


        function rotate(cx, cy, x, y, angle) {
           var radians = (Math.PI / 180) * angle,
              cos = Math.cos(radians),
              sin = Math.sin(radians),
              nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
              ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
          return [nx, ny];
      }

        const angleRange = Math.PI;
        var prevX=0;
        var prevY=0;
        const surv = this.survival;
        console.log(s)
        const points = [{x: 0, y: 0}];
        for(var k = 1; k< radialData.length; k++){
            var dif =radialData[k][symptom] - radialData[k-1][symptom]; 
            var angle = ((10+dif)/20) *  angleRange -  angleRange/2;
            const vala = rotate(0,0,0,20,angle/(2*Math.PI)*360);
            prevX = vala[0] + prevX;
            prevY = vala[1] + prevY;
            points.push({x: prevX, y: prevY})
            if(k == radialData.length-1 ){
            	if( parseInt(s) ==0 ){
            	g.append('circle')
                .attr('cx', -prevX)
                .attr('cy', -prevY)
                .attr('r',2)
                .attr('fill-opacity', 0.8)
                .attr('fill', 'black');

            }
            else {
            	 g.append('circle')
                .attr('cx', -prevX)
                .attr('cy', -prevY)
                .attr('r',2)
                .attr('fill-opacity', 0.45)
                .attr('fill', colorScale(i));
            }
        }
            else{
              g.append('circle')
                .attr('cx', -prevX)
                .attr('cy', -prevY)
                .attr('r',2)
                .attr('fill-opacity', 0.45)
                .attr('fill', colorScale(i));
            }

        }



        const line = d3.line()
          .x((d) => (-d.x))
          .y((d) => (-d.y))
          .curve(d3.curveCardinal.tension(0.5));

        g.append('path')
          .attr('fill', 'none')
          .attr('stroke', colorScale(i))
          .attr('stroke-width', '0.5px')
          .attr('d', line(points));

    });
  }
}

export default TendrilPlot;
