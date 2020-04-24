import * as d3 from 'd3';

class SymptomsList {
	constructor( symptoms, selectedSymptoms, patients) {
		this.symptoms = symptoms;
		this.selectedSymptoms = selectedSymptoms;
		this.patients = patients;
	}

	init() {
		if(!this.patients)
			this.drawSymptomsList(this.symptoms, this.selectedSymptoms, []);
		else
			this.drawSymptomsList(this.symptoms, this.selectedSymptoms, this.patients);
	}

	async drawSymptomsList(symptoms, selectedSymptoms, patients){

		    var i = 0;
		    var j = 0;
		    const margin = {
		      left: 0,
		      right: 10,
		      top: 10,
		      bottom: 10
		    };
		    const width = 140;
		    const height = 419;


	 	function transformText(p) {
	 
	 		if (!patients || patients.length <1) {
	 			return "black";
	 		}
	    	else 
	    		if(selectedSymptoms.includes(p))
	        		return "#ffab24";
	      		else
	        		return "black";
	    }



	    this.svg = d3.select("#symptomsText")
	    		  .append('svg')
			      .attr('class', 'symptomsText')
			      .attr('viewBox', `0 0 ${width} ${height}`)
			      .attr("font-family", "sans-serif")
			      .attr('preserveAspectRatio', "xMidYMid meet")
			      .attr('width', 140)
			      .attr('height', 419)

		this.g = this.svg.append('g')
      			.attr('class', 'symptoms')
      			.attr('transform', `translate(-132,50)`);


		for (i = 0; i < symptoms.length; i++) {

		  this.g.append('text')
		    .attr('class', 'symptomText')
		    .attr('id',symptoms[i])
		    .attr('x', 135)
		    .attr('y', height - 56 - 14.5 * i)
		    .attr('color', 'black')
		    .attr('font-size','0.8rem')
		    .text(symptoms[i])
		    .style("cursor", "pointer")
		    .style("fill", transformText(this.symptoms[i]))
		    
		}
	}




  clear() {
    d3.selectAll('.symptomsText').remove();
  }


}
  export default SymptomsList;
