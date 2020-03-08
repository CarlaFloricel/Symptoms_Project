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
        'Each circle represents one time stamp and they all map out from the center.' + 
        'Clockwise direction change indicates rating increase and vice versa.');

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
      .attr('font-size', 8)
      .attr('transform', `translate(${width / 2},12)`);
    this.drawTendrils(data);
  }

  clear() {
    this.svg.select('.tendrils').remove();
  }

  drawTendrils(data) {
    const { svg, height, width } = this;
    const { patient, symptoms } = data;
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

    // const g = svg.append('g')
    //   .classed('tendrils', true)
    //   .attr('transform', `translate(${width / 2},${height / 2})`);

    // symptoms.forEach(symptom => {
    //   const points = patient.map(p => ({
    //     [symptom]: parseInt(p[symptom]),
    //     period: p.period
    //   }))
    //   .map(p => {
    //       return [angleScale(p[symptom]), radiusScale(p.period)];
    //     });

    //   radialData.unshift([0, 0]);
    //   const path = line(radialData);
    //   g.append('path')
    //     .attr('d', path)
    //     .attr('fill', 'none')
    //     .attr('stroke', colorScale(i))
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke-width', 0.5)
    //     .classed(symptom, true);
    //   d = 20;
    //   alpha = 90;
    //   angle = (t2 - t1) / 10 * 90 / 360 * Math.PI; 
    // });

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
      .attr('transform', `translate(${width / 2},${height - 20}) scale(1.15, 1.15)`);

    symptoms.forEach((symptom, i) => {
      var time = 1;
      const radialData = patient
        .map(p => ({
          [symptom]: parseInt(p[symptom])
        }))
        

// console.log(radialData);


      // radialData.slice(1, radialData.length)
      //   .forEach(([angle, r]) => {
      //     const x = r * Math.sin(angle);
      //     const y = r * -Math.cos(angle);
      //     g.append('circle')
      //       .attr('cx', x)
      //       .attr('cy', y)
      //       .attr('r', 2)
      //       .attr('fill-opacity', 0.45)
      //       .attr('fill', colorScale(i));
      //   });

        function rotate(cx, cy, x, y, angle) {
           var radians = (Math.PI / 180) * angle,
              cos = Math.cos(radians),
              sin = Math.sin(radians),
              nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
              ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
          return [nx, ny];
      }

      // radialData.unshift([0, 0]);
      // const path = line(radialData);
      // g.append('path')
      //   .attr('d', path)
      //   .attr('fill', 'none')
      //   .attr('stroke', colorScale(i))
      //   .attr('stroke-linecap', 'round')
      //   .attr('stroke-width', 0.5)
      //   .classed(symptom, true);

        const angleRange = Math.PI;
        var prevX=0;
        var prevY=0;
        const points = [{x: 0, y: 0}];
        for(var k = 1; k< radialData.length; k++){
            var dif =radialData[k][symptom] - radialData[k-1][symptom]; 
            var angle = ((10+dif)/20) *  angleRange -  angleRange/2;
            const vala = rotate(0,0,0,20,angle/(2*Math.PI)*360);
            prevX = vala[0] + prevX;
            prevY = vala[1] + prevY;
            points.push({x: prevX, y: prevY})

              g.append('circle')
                .attr('cx', -prevX)
                .attr('cy', -prevY)
                .attr('r',2)
                .attr('fill-opacity', 0.45)
                .attr('fill', colorScale(i));
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
