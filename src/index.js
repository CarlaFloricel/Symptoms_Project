import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('fomantic-ui-css/semantic');
require('fomantic-ui-css/semantic.min.css');

import TimeSlider from './timeslider';
import ScatterPlot from './scatterplot';
import StackedLinePlot from './stackedLinePlot';
import TendrilPlot from './tendrilplot';
import CorrelationMatrix from './correlationmatrix';
import PatientHistory from './patientHistory';
import StarPlot from "./starplot";
import SymptomsList from "./symptomsList";


class App {
  constructor() {
    this.scatterPlot = null;
    this.stackPlot = null;
    this.sliderUpdate = this.sliderUpdate.bind(this);
    this.patientHistory = null;
    this.onPatientSelect = this.onPatientSelect.bind(this);
    this.showStackPlot = this.showStackPlot.bind(this);
    this.showPatientHistory = this.showPatientHistory.bind(this);
    this.onSymptomsSelect = this.onSymptomsSelect.bind(this);
    this.onPatientFilter = this.onPatientFilter.bind(this);
    this.patients = [];
    this.symptoms = [];
    this.filteredPatients = [];
    this.emptyPatientFilter = false;
    this.symptomsList = null;
    this.symptoms = ['nausea', 'vomit', 'choking', 'shortnessOfBreath', 'sores',
      'memory', 'lackOfAppetite', 'teethProblem', 'skinPain', 'constipation', 'taste',
      'numbness', 'dryMouth', 'mucusInMouthAndThroat', 'difficultyInSwallowing',
      'speech', 'distress', 'sadness', 'fatigue', 'drowsiness', 'disturbedSleep', 'pain',
      'generalActivity', 'mood', 'work', 'relations', 'walking', 'enjoymentOfLife'];
    this.allSymptoms = [...this.symptoms];
    this.symptoms = ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress'];
  }

  async initTimeSlider() {
    const symptoms = await d3.csv('/data/datasets/symptoms_period.csv');
    const timePeriods = _.sortedUniq(
      symptoms.map(({ period }) => parseInt(period, 10)).sort((a, b) => a - b));
    const timeSlider = new TimeSlider('#time-slider', timePeriods, await this.sliderUpdate);
    timeSlider.init();
  }

  init() {
    this.initTimeSlider();
    this.showStackPlot(0);
    this.drawTendrilPlot();
    this.showPatientHistory(0,this.symptoms);

    this.symptomsList = new SymptomsList(this.allSymptoms, this.symptoms);
    this.symptomsList.drawSymptomsList(this.allSymptoms, []);


    var i = 0;
    var ba = [];
    var allSymp = this.allSymptoms;

    $('#patient-list').dropdown({
      maxSelections: 3,
      action: 'activate',
      onChange: this.onPatientSelect,
    });

    $('#symptoms-list').dropdown({
      maxSelections: 5,
      action: 'activate',
      onChange: this.onSymptomsSelect,
    });

    $('#filters-list').dropdown({
      maxSelections: 20,
      action: 'activate',
      onChange: this.onPatientFilter,
    });
    $('#filters-list1').dropdown({
      maxSelections: 20,
      action: 'activate',
      onChange: this.onPatientFilter,
    });
    $('#filters-list2').dropdown({
      maxSelections: 20,
      action: 'activate',
      onChange: this.onPatientFilter,
    });
    $('#filters-list3').dropdown({
      maxSelections: 20,
      action: 'activate',
      onChange: this.onPatientFilter,
    });



    // Connecting tab event listeners
    $('#scatterplot-btn').on('click', function () {
      $('#scatterplot-btn').toggleClass('active');
      $('#correlation-btn').toggleClass('active');
      $('#scatterplot').show();
      $('#scales').show();
      $('#star-plot').hide();
      $('#matrix').hide();
      $('#patient-history').show();
      $('#infoButton').show();
      $('#defaultPatientText').show();
      if (this.patients = 'undefined' || this.patients.length == 0) {
        $('#defaultPatientText').hide();
      }
      $('#star-plot').hide();
    });

    $('#correlation-btn').on('click', function () {
      $('#scatterplot-btn').toggleClass('active');
      $('#correlation-btn').toggleClass('active');
      $('#scatterplot').hide();
      $('#matrix').show();
      $('#patient-history').hide();
      $('#infoButton').hide();
      $('#scales').hide();
      $('#defaultPatientText').hide();
      $('#star-plot').show();
    });

    $('#mult-symptoms-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').show();
      $('#stack').show();
      $('#patient-info').hide();
    });

    $('#mult-patients-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').hide();
      $('#stack').hide();
      // $('#defaultPatientText').hide();

    });

    $('#mult-timestamps-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').hide();
      $('#stack').hide();
    });
     

    $(document).on("click", (event) =>{
          for(i=0; i< allSymp.length; i++){
            if (allSymp[i] == event.target.id){
              if(!this.symptoms.includes(allSymp[i]) ){
                if(this.symptoms.length <5){
                  this.symptoms.push(allSymp[i]);
                  this.onSymptomsSelect(this.symptoms);
                  this.symptomsList.clear();
                  this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.patients);
                }
                else{
                  this.symptoms.shift();
                  this.symptoms.push(allSymp[i]);
                  this.onSymptomsSelect(this.symptoms);
                  this.symptomsList.clear();
                  this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.patients);
                }
              } 
            }
          }
    });


    this.updateSymptoms();
    this.updateFilters();
    if (this.patients.length == 0) {
      $('#defaultPatientText').show();
    }
    else {
      $('#defaultPatientText').hide();
    }

  }



  async onPatientSelect(value) {
    this.patientHistory.clear();
    $('.filters-list').dropdown('clear');
    this.onPatientFilter();
    this.patients = value;
    this.symptomsList.clear()
    this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.patients);
    if (this.patients.length == 0) {
      $('#defaultPatientText').show();
      
          $('#tendril').empty();
          this.drawTendrilPlot();

    } else {
      this.patientHistory.update(this.patients[this.patients.length - 1], this.symptoms);
      $('#defaultPatientText').hide();
    }
    this.highlightPatients(this.patients);
    if(this.symptoms != null){
          this.stackPlot.clear();
          this.stackPlot.update(value, this.symptoms);
    }
    else {
          this.stackPlot.clear();
          this.stackPlot.update(value, ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress']);
        }
    //this.showPatientHistory(this.patients[this.patients.length-1]);
    this.patientHistory.clear();
    
    this.drawTendrilPlot(this.patients, this.symptoms);

    //this.drawStarPlots(this.patients[this.patients.length - 1], window.currentPeriod);
  }

  async onSymptomsSelect(value) {

    var i;
    var sympList = [];
    for(i =0; i<value.length;i++){
      if(!sympList.includes(value[i])){
        sympList.push(value[i])
      }
    }
    if(this.symptoms.length >5){
      this.symptoms.slice(this.symptoms.length-5)
    }
    if(sympList.length >5){
      sympList.slice(sympList.length-5)
    }
    this.stackPlot.clear();
    this.stackPlot.update(this.patients, sympList);
    this.symptoms = sympList;
    this.drawTendrilPlot(this.patients, sympList);
    if(this.patients.length > 0)
    this.patientHistory.update(this.patients[this.patients.length - 1], this.symptoms);



    // var i;
    // var sympList = [];
    // for(i =0; i<value.length;i++){
    //   if(!sympList.includes(value[i])){
    //     sympList.push(value[i])
    //   }
    // }
    // if(this.symptoms.length >5){
    //   this.symptoms.slice(this.symptoms.length-5)
    // }
    // if(sympList.length <5){
    //   for (i =sympList.length; i< 5; i++){
    //     sympList.push(this.symptoms[i]);
    //   }
    // }
    // this.stackPlot.clear();
    // this.stackPlot.update(this.patients, sympList);
    // this.symptoms = sympList;
    // this.drawTendrilPlot(this.patients, sympList);

  }

  async onPatientFilter(period){
      this.filteredPatients = $('.filters-list').find(":selected").text();
      console.log(this.filteredPatients);
      const data = await this.loadDataset(parseInt(window.currentPeriod));
        var i =0;
      var patients = [];
      var totalPatients = [];
      var ratingsFilter = [];
      var genderFilter = [];
      var therapyFilter = [];
      var tumorFilter = [];
      this.emptyPatientFilter = false;
      if(this.filteredPatients.includes("T1")){
        patients = (data.filter(d => d.t_category == "T1"));
        patients.forEach(el => tumorFilter.push(el));
      }
      if(this.filteredPatients.includes("T2")){
        patients = (data.filter(d => d.t_category == "T2"));
         patients.forEach(el => tumorFilter.push(el));

      }

      if(this.filteredPatients.includes("T3")){
        patients = (data.filter(d => d.t_category == "T3"));
        patients.forEach(el => tumorFilter.push(el));
       
      }
      if(this.filteredPatients.includes("T4")){
        patients = (data.filter(d => d.t_category == "T4"));
         patients.forEach(el => tumorFilter.push(el));
      }
      if(this.filteredPatients.includes("Cc")){
        patients = (data.filter(d => d.therapeutic_combination == "CC"));
        patients.forEach(el => therapyFilter.push(el));
       
      }
      if(this.filteredPatients.includes("IC+CC")){
        patients = (data.filter(d => d.therapeutic_combination == "IC+CC"));
         patients.forEach(el => therapyFilter.push(el));
      }

      if(this.filteredPatients.includes("IC+Rad")){
        patients = (data.filter(d => d.therapeutic_combination == "IC+Radiation alone"));
        patients.forEach(el => therapyFilter.push(el));
       
      }
      if(this.filteredPatients.includes("Radiation")){
        patients = (data.filter(d => d.therapeutic_combination == "Radiation alone"));
         patients.forEach(el => therapyFilter.push(el));
      }

      if(this.filteredPatients.includes("Male")){
        patients = (data.filter(d => d.gender == "Male"));
        patients.forEach(el => genderFilter.push(el));
       
      }
      if(this.filteredPatients.includes("Female")){
        patients = (data.filter(d => d.gender == "Female"));
         patients.forEach(el => genderFilter.push(el));
      }


      if(this.filteredPatients.includes("Mild")){
        patients = (data.filter(d => d.cluster == 0));
        patients.forEach(el => ratingsFilter.push(el));
       
      }
      if(this.filteredPatients.includes("Severe")){
        patients = (data.filter(d => d.cluster == 1));
         patients.forEach(el => ratingsFilter.push(el));

      }

      if(ratingsFilter.length >0){
        if(totalPatients.length < 1){
          totalPatients = ratingsFilter;
        }
        else{
          var x = [];
          for(i = 0; i < ratingsFilter.length; i++){
            if(totalPatients.includes(ratingsFilter[i])){
              x.push(ratingsFilter[i]);
               this.emptyPatientFilter = false;
            }
          }
          if(x.length <1)
            this.emptyPatientFilter = true;
          totalPatients = x;

        } 

      }


      if(genderFilter.length >0){
        if(totalPatients.length <1 && ratingsFilter.length <1){
         totalPatients = genderFilter;
        }
        else{
          var x = [];
          for(i = 0; i < genderFilter.length; i++){
            if(totalPatients.includes(genderFilter[i])){
              this.emptyPatientFilter = false;
              x.push(genderFilter[i]);
            }
          }
          if(x.length <1)
            this.emptyPatientFilter = true;
          totalPatients = x;
        } 

      }


      if(therapyFilter.length >0){
        if(totalPatients.length <1 && ratingsFilter.length <1 && genderFilter.length <1){
         totalPatients = therapyFilter;
        }
        else{
          var x = [];
          for(i = 0; i < therapyFilter.length; i++){
            if(totalPatients.includes(therapyFilter[i])){
              this.emptyPatientFilter = false;
              x.push(therapyFilter[i]);
            }
          }
          if(x.length <1)
            this.emptyPatientFilter = true;
          totalPatients = x;
        } 

      }

      if(tumorFilter.length >0){
        if(totalPatients.length <1 && ratingsFilter.length<1 && genderFilter.length <1 && therapyFilter.length <1){
         totalPatients = tumorFilter;
        }
        else{
          var x = [];
          for(i = 0; i < tumorFilter.length; i++){
            if(totalPatients.includes(tumorFilter[i])){
              this.emptyPatientFilter = false;
              x.push(tumorFilter[i]);
            }
          }
          if(x.length <1)
            this.emptyPatientFilter = true;
          totalPatients = x;
        } 
      }
    
      if(this.emptyPatientFilter == true){
        this.highlightPatients('none');
      }
      else{
         if(this.patients.length >0 && totalPatients.length ==[]){
          this.highlightPatients(this.patients);
        }
        else
        this.highlightPatients(totalPatients.map(d => d.patientId));
      }
       
  }

  async loadDataset(period) {
    const patients = await d3.csv('/data/datasets/patients_complete_with_survival.csv');
    const clusters = await d3.csv(`/data/output/raw_result-time-${period}.csv`);
    const data = clusters
      .filter(cluster => patients.find(patient => patient.patientId === cluster.patientId))
      .map(cluster => ({ ...cluster, ...patients.find(patient => patient.patientId === cluster.patientId) }))
      .sort((a, b) => a.patientId - b.patientId)
      .map(({ cluster, gender, patientId, t_category,therapeutic_combination }) => ({
        cluster: parseInt(cluster),
        patientId,
        gender,
        t_category,
        therapeutic_combination
      }));
    return data;
  }

  async updatePatientIds(ids) {
    $('.ui.dropdown:has(#patient-list) .default.text')
      .text(`Select Patient ID(s) - Total Count: ${ids.size}`);
    const selectEl = $('#patient-list');
    selectEl.empty();
    ids.forEach((id) => {
      const optionEl = $('<option></option>', { value: id });
      optionEl.text(id);
      selectEl.append(optionEl);
    })

  }

  async updateSymptoms() {
    $('.ui.dropdown:has(#symptoms-list) .default.text').text(`Select Symptom(s)`)
    const selectEl = $('#symptoms-list');
    selectEl.empty();
    this.allSymptoms.forEach((i) => {
      const optionEl = $('<option></option>', { value: i });
      optionEl.text(i);
      selectEl.append(optionEl);
    })
  }

  async updateFilters() {
    const filters = ['Rating Severity', 'Gender', 'Tumor Category', 'Therapeutic Combination'];
    $('.ui.dropdown:has(#filters-list) .default.text').text(`Rating Severity`);
  }


  async sliderUpdate(period) {
    this.patients = []; 
    $('#tendril').empty();
    $('#patient-list').dropdown('clear');   
    await this.drawClusters(period);
    this.patientHistory.clear();
    this.onPatientFilter(); 
    this.stackPlot.clear();

    $('#tendril').empty();
    this.drawTendrilPlot();
      // $('#defaultPatientText').show();
   // await this.drawStarPlots(this.patients[this.patients.length - 1], period);
    // if (this.patients && this.patients.length > 0) {
    //   this.highlightPatients(this.patients);
      
    // }
    // const matrixData = await d3.csv(`/data/output/correlation/${period}.csv`);
    // if (!this.correlationMatrix && matrixData.length > 0) {
    //   this.correlationMatrix = new CorrelationMatrix('#matrix', 512, 512, matrixData);
    //   this.correlationMatrix.init();
    // } else {
    //   this.correlationMatrix.clear();
    //   this.correlationMatrix.update(matrixData);
    // }


  }

  async drawClusters(period) {
    const data = await this.loadDataset(period);
    const patientIds = data.map(({ patientId }) => parseInt(patientId));

    if (!this.scatterPlot && data.length > 0) {
      this.scatterPlot = new ScatterPlot('#scatterplot', 512, 512, data, this.selectPatient);
      this.scatterPlot.init();
    } else if (this.scatterPlot) {
      this.scatterPlot.clear();
      this.scatterPlot.update(data);
    }
    this.updatePatientIds(new Set(patientIds));
  }

  // async selectPatient(value) {
  //   this.patientId = value;
  //   this.patients = value;
  //   this.stackPlot.clear();
  //   this.stackPlot.update(value, this.symptoms);
  //   this.drawTendrilPlot(this.patients, this.symptoms);
  //   this.patientHistory.clear();
  //   this.patientHistory.update(this.patients[this.patients.length - 1]);
  //   $('#defaultPatientText').hide();
  // }

  // async drawStarPlots(patientId, currPeriod) {
  //   if (this.starPlots)
  //     this.starPlots.forEach(plot => plot.container.remove());

  //   if (!patientId) {
  //     d3.select('#matrix .correlation')
  //       .classed('correlation-full', true);
  //     return;
  //   }
  //   d3.select('#matrix .correlation')
  //     .classed('correlation-full', false);

  //   currPeriod = currPeriod === 0 ? 6 : currPeriod === 25 ? 24 : currPeriod;
  //   const nextPeriod = currPeriod === 24 ? 25 : currPeriod + 6;
  //   const prevPeriod = currPeriod - 6;
  //   const timestamps = [prevPeriod, currPeriod, nextPeriod];

  //   const data = await d3.csv('/data/datasets/symptoms_period.csv');
  //   const patient = data.filter(p => p.patientId === patientId);
  //   this.starPlots = this.allSymptoms.map(symptom => {
  //     const data = { patient, symptom, timestamps };
  //     const starPlot = new StarPlot('#matrix', 120, 120, data);
  //     starPlot.init();
  //     return starPlot;
  //   });
  // }

  async drawTendrilPlot(patientIds, symptoms) {
    $('#tendril-note').remove();
    if (this.tendrilPlots)
      this.tendrilPlots.forEach(plot => plot.svg.remove());

    if (!patientIds || patientIds.length === 0) {
      d3.select('#tendril')
        .append('p')
        .attr('id', 'tendril-note')
        .style('color', 'black')
        .text('Please select a patient.');
      return;
    }

    if (!symptoms || symptoms.length === 0) {
      d3.select('#tendril')
        .append('p')
        .attr('id', 'tendril-note')
        .style('color', 'black')
        .text('Select symptoms from dropdown to show tendril plot.');
      return;
    }

    $('#tendril-note').remove();

    const data = await d3.csv('/data/datasets/symptoms_period.csv');
    const data_patient = await d3.csv('/data/datasets/patients_complete_with_survival.csv');
    const patients = patientIds.map(patientId => data.filter(d => d.patientId === patientId));

    this.tendrilPlots = [];
    patients.forEach(patient => {
      const id = patient[0].patientId;
      const patientData = { patient, symptoms };
      const patientDataSelected=data_patient.filter(d => d.patientId == id)
      patientData['survival'] = patientDataSelected[0].survival
      const tendrilPlot = new TendrilPlot('#tendril', 150, 150, patientData);
      tendrilPlot.init();
      this.tendrilPlots.push(tendrilPlot);
      
    });
  }

  async showStackPlot(patientId) {
    const patientInfo = await d3.csv('/data/datasets/symptoms_period.csv');
    this.stackPlot = new StackedLinePlot(patientInfo, patientId);
    this.stackPlot.init();
  }

  async showPatientHistory(patientId) {
    const patientInfo = await d3.csv('/data/datasets/symptoms_period.csv');
    this.patientHistory = new PatientHistory(patientInfo, this.patients[this.patients.length - 1], this.allSymptoms,this.symptoms);
    this.patientHistory.init();
  }

  async highlightPatients(patientIds) {
    if (!this.scatterPlot) return;
    this.scatterPlot.highlight(patientIds);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
