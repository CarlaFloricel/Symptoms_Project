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


  async drawPatientHistory(patientId) {
    console.log(this.data);
    console.log(this.patientId);
    const patients = await d3.csv('/data/datasets/patients_complete.csv');
    var patientBackground = patients.find(p => p.patientId == this.patientId);
    var i = 0;
    var j = 0;
    const margin = { left: 0, right: 10, top: 10, bottom: 10 };
    const width = 260;
    const height = 670;

    const periods = ["0M", "6M", "12M", "18M", "24M", ">24M"];
    const colors = ['#fff', '#fff5f0', '#d1c0c0', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d', '#4a1212'];
    var patient = this.data.filter(p => p.patientId == this.patientId);
    console.log(patient);

    function transformRatingColor(r) {
      switch (r) {
        case 0:
          return '#bdbdbd';
        case 1:
          return '#d9d9d9';
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
          return '#d9d9d9';
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
      .attr('height', height + margin.top + margin.bottom)
      .style('display', 'none');

    this.g = this.svg.append('g')
      .attr('class', 'patientGroup')
      .attr('transform', `translate(0,0)`);

    for (i = 0; i < this.symptoms.length; i++) {
      this.g.append('text')
        .attr('class', 'symptomText')
        .attr('x', 135)
        .attr('y', height - 86 - 15 * i)
        .attr('color', 'black')
        .text(this.symptoms[i])
    }

    periods.forEach((p, i) => {
      this.g.append('text')
        .attr('class', 'periodText')
        .attr('x', 20 * i + margin.left)
        .attr('y', height - 70)
        .attr('color', 'black')
        .attr('font-size', '8')
        .text(p)
    });

    function transformPeriod(p) {
      switch (p) {
        case 0:
        case 6:
        case 12:
        case 18:
        case 24:
          return Math.round(p / 6);
        default:
          return 5;
      }
    }


    for (i = 0; i < 29; i++) {
      for (j = 0; j < patient.length; j++) {
        console.log(parseInt(patient[j].period));
        this.g.append('rect')
          .attr('class', 'symptoms')
          .attr('x', 20 * transformPeriod(parseInt(patient[j].period)) + margin.left)
          .attr('y', height - 95 - 15 * i)
          .attr('height', 10)
          .attr('width', 15)
          .attr('fill', transformRatingColor(parseInt(patient[j][this.symptoms[i]])))
          .attr('opacity', '0.9');
      }
    }

    this.g.append('text')
      .attr('class', 'patientTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 60})`)
      .text("Patient " + this.patientId)


    this.g.append('text')
      .attr('class', 'AgeTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 80})`)
      .text("Age: " + parseInt(patientBackground.age));

    this.g.append('text')
      .attr('class', 'GenderTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 90})`)
      .text("Gender: " + patientBackground.gender)

    this.g.append('text')
      .attr('class', 'TumorTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 100})`)
      .text("Tumor category: " + patientBackground.t_category)

    this.g.append('text')
      .attr('class', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 110})`)
      .text("Therapeutic combination: " + patientBackground.therapeutic_combination)

    this.g.append('text')
      .attr('class', 'DoseTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 120})`)
      .text("Total dose: " + patientBackground.total_dose)

    this.g.append('text')
      .attr('class', 'FractionTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 130})`)
      .text("Total fractions: " + patientBackground.total_fractions)

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
    d3.selectAll('.patientSvg').remove();
  }


  async update(patientId) {
    this.patientId = patientId;
    await this.drawPatientHistory(patientId);
    this.svg.style('display', 'block');
  }
}
export default PatientHistory;
