import * as d3 from 'd3';

class PatientHistory {
  constructor(data, patientId, symptoms) {
    this.data = data;
    this.patientId = patientId;
	this.symptoms = symptoms;
  }

   init() {

   		this.drawPatientHistory(this.patientId);
	}


   drawPatientHistory(patientId){
		console.log(this.data);
		console.log(this.patientId);
		var i = 0;
	    var j=0;
	    const margin = { left: 10, right: 10, top: 10, bottom: 10 };
	    const width = 200;
	    const height = 670;

	    const periods = ["0M", "6M", "12M", "18M", "24M", ">24M"];
	    const colors = ['#fff', '#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d', '#4a1212'];
	    var patient=this.data.filter(p => p.patientId == this.patientId);
	    console.log(patient);

	 function transformRatingColor(r) {
      switch (r) {
        case 0:
          return '#fff';
        case 1:
          return '#fff5f0';
        case 2:
          return '#fee0d2'; 
        case 3:
          return '#fcbba1';
        case 4:
          return '#fc9272';
        case 5:
          return '#fb6a4a';
        case 6:
          return '#ef3b2c'; 
        case 7:
          return '#cb181d';             
        case 8:
          return '#a50f15'; 
        case 9:
          return '#67000d';             
        case 10:
          return '#4a1212';                   
        default:
          return '#bdbdbd';
      }
  }



	    this.svg = d3.select("#patient-info")
	      .append('svg')
	      .attr('class', 'patientSvg')
	      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
	      .attr('font-size', 10)
	      .attr("font-family", "sans-serif")
	      .attr('preserveAspectRatio', "xMidYMid meet")
	      .attr('width', width + margin.left + margin.right)
	      .attr('height', height + margin.top + margin.bottom);

	    this.g = this.svg.append('g')
	      .attr('class','patientGroup')
	      .attr('transform', `translate(0,0)`);

	    for (i = 0; i < this.symptoms.length; i++) {
	      this.g.append('text')
	        .attr('class', 'symptomText')
	        .attr('x', 135)
	        .attr('y', height - 146 - 15 * i)
	        .attr('color','black')
	        .text(this.symptoms[i])
	    }	

  	  periods.forEach((p,i) => {
	    this.g.append('text')
	        .attr('class', 'periodText')
	        .attr('x', margin.left +20*i)
	        .attr('y', height-130)
	        .attr('color','black')
	        .attr('font-size','8')
	        .text(p)
    	});

	   for (i = 0; i < 29; i++) {
	   	for(j=0;j<patient.length;j++){
	      	this.g.append('rect')
	      	.attr('class','symptoms')
	        .attr('x', margin.left +20*j)
	        .attr('y', height - 155 - 15 * i)
	        .attr('height', 10)
	        .attr('width', 15)
	        .attr('fill',transformRatingColor(parseInt(patient[j][this.symptoms[i]])) )
	        .attr('opacity', '0.9');
  	  }
	}

    this.g.append('text')
      .attr('class', 'patientTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top })`)
      .text("Patient " + this.patientId)


	this.g.append('text')
      .attr('class', 'AgeTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top +20})`)
      .text("Age: " )

	this.g.append('text')
      .attr('class', 'GenderTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top +30})`)
      .text("Gender: " )

	this.g.append('text')
      .attr('class', 'TumorTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top +40})`)
      .text("Tumor category: " )

	this.g.append('text')
      .attr('class', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top +50})`)
      .text("Therapeutic combination: " )

	this.g.append('text')
      .attr('class', 'DoseTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top +60})`)
      .text("Total dose: " )

    this.g.append('text')
      .attr('class', 'FractionTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top +70})`)
      .text("Total fractions: ")  

}

clear() {
    this.svg.selectAll('.symptomText').remove();
    this.svg.selectAll('.periodText').remove();
    this.svg.selectAll('.symptoms').remove();
    this.svg.selectAll('.patientTitle').remove();
    this.svg.selectAll('.AgeTitle').remove();
    this.svg.selectAll('.TumorTitle').remove();
    this.svg.selectAll('.patientTitle').remove();
    this.svg.selectAll('.AgeTitle').remove();
    this.svg.selectAll('.DoseTitle').remove();
    this.svg.selectAll('.FractionTitle').remove();
    this.svg.selectAll('.GenderTitle').remove();
    this.svg.selectAll('.patientGroup').remove();
    this.svg.selectAll('.patientSvg').remove();
  }


 update(patientId) {
    this.patientId = patientId;
    this.drawPatientHistory(patientId);
  }
}
export default PatientHistory;