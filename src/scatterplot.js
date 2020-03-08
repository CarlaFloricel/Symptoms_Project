import * as d3 from 'd3';

class ScatterPlot {
  drawHexagon(data) {
    return d3.line()
      .x(function (d) { return d.x; })
      .y(function (d) { return d.y; })
      .curve(d3.curveCardinalClosed.tension(0.65))(data);
  }

  constructor(selector, width, height, data, onPatientSelected) {
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.data = data;
    this.onPatientSelected = onPatientSelected;
  }

  pack(data) {
    this.data = data.sort((a , b) => b.cluster - a.cluster)
    const { width, height } = this;
    const packer = d3.pack().size([width - 2, height - 2]).padding(3);
    // console.log(this.data.map(t => [t.t_category, t.patientId]))
    return packer(d3.hierarchy({ children: this.data }).sum(d => {
    try {   
      return parseInt(d.t_category[1])
    } catch (e) {
      return 1;
    }
    }));

  }

  init() {
    const { data, width, height } = this;
    const root = this.pack(data);

    this.colorScale = d3.scaleOrdinal()
      .domain(d3.extent(data.map(d => d.cluster)))
      .range([ '#fee0d2',  '#de2d26'])


    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", `0 0 ${width}, ${height}`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr('preserveAspectRatio', "xMidYMid meet");

    this.drawLeaves(root.leaves());
  }

 transformMarginColor(r) {
      switch (r) {
        case "CC":
          return '#80483b';
        case "IC+CC":
          return '#d29f43';
        case "IC+Radiation alone":
          return '#058f96';
        default:
          return '#9854cc';
      }
    }

 transformClusterColor(r) {
      switch (r) {
        case 1:
          return '#de2d26';
        // case 1:
        //   return '#fc9272';
        default:
          return '#fee0d2';
      }
    }


  drawLeaves(leaves) {
    const { svg, onPatientSelected } = this;
    const leaf = svg.selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
      .classed("leaf", true)
      .attr("id", d => (d.leafUid = `leaf-container-${d.data.patientId}`))
      .style('cursor', 'pointer');

    leaf.append("path")
      .attr("d", d => {
        const h = (Math.sqrt(3) / 2),
          radius = d.r,
          xp = 0,
          yp = 0,
          hexagonData = [

            { "x": -radius * h + xp, "y": -radius / 2.0  +yp },
            { "x": radius * h + xp, "y": -radius / 2.0  +yp },
            { "x": xp, "y": radius * h  + yp }

           
          ];
        return this.drawHexagon(hexagonData);
      })
      .attr("id", d => (d.leafUid = `leaf-${d.data.patientId}`))
      .attr("fill", d => parseInt(d.data.cluster) == 1 ? '#de2d26' : '#fee0d2')
      .attr("stroke", d => this.transformMarginColor(d.data.therapeutic_combination))
      .attr("stroke-width",2)
      .attr("stroke-opacity", d => d.data.gender === 'Female' ? 0 : 1.0)
      .attr("fill-opacity", d => d.data.gender === 'Female' ? 0 : 0.5);

    leaf.append("circle")
      .attr("id", d => (d.leafUid = `leaf-${d.data.patientId}`))
      .attr("r", d => d.r)
      .attr("fill", d => parseInt(d.data.cluster) == 1 ? '#de2d26' : '#fee0d2')
      .attr("stroke", d => this.transformMarginColor(d.data.therapeutic_combination))
      .attr("stroke-width",2)
      .attr("stroke-opacity", d => d.data.gender === 'Male' ? 0 : 1.0)
      .attr("fill-opacity", d => d.data.gender === 'Male' ? 0 : 0.5);


    leaf.append("text")
      .text(d => d.data.patientId);

    leaf.append("title")
      .text(d => d.data.patientId);
  }

  highlight(ids) {
    if (!ids || ids.length === 0) {
      this.svg.selectAll('.leaf').style('opacity', 1);
      return;
    }

    // lower opacity of all leaves
    const leaves = this.svg.selectAll('.leaf');
    leaves.style('opacity', 0.35);

    // increase opacity of selected leaves
    ids.forEach((id) => {
      this.svg.select(`#leaf-container-${id}`).style('opacity', 1);
    });
  }

  clear() {
    this.svg.selectAll('.leaf').remove();
  }

  update(data) {
    this.data = data;
    const leaves = this.pack(data).leaves();
    this.drawLeaves(leaves);
  }
}

export default ScatterPlot;
