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
    this.drawFilteredClusters = this.drawFilteredClusters.bind(this);
    this.clusterSymptoms = this.clusterSymptoms.bind(this);
    this.patients = [];
    this.symptoms = [];
    this.patientFilters = [];
    this.filteredPatients = []
    this.emptyPatientFilter = false;
    this.symptomsList = null;
    this.tendrilPlots = [];
    this.period = 0;
    this.clearDropDown =  this.clearDropDown.bind(this);
    this.clusteringSymptoms = [];
    this.symptoms = ['nausea', 'vomit', 'choking', 'shortnessOfBreath', 'sores',
      'memory', 'lackOfAppetite', 'teethProblem', 'skinPain', 'constipation', 'taste',
      'numbness', 'dryMouth', 'mucusInMouthAndThroat', 'difficultyInSwallowing',
      'speech', 'distress', 'sadness', 'fatigue', 'drowsiness', 'disturbedSleep', 'pain',
      'generalActivity', 'mood', 'work', 'relations', 'walking', 'enjoymentOfLife'];
    this.allSymptoms = [...this.symptoms];
    this.symptoms = ['mood', 'work', 'relations', 'walking', 'enjoymentOfLife'];
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
    this.showPatientHistory(0,this.symptoms);
    this.symptomsList = new SymptomsList(this.allSymptoms, this.symptoms);
    this.symptomsList.drawSymptomsList(this.allSymptoms, []);

    var i = 0;
    var allSymp = this.allSymptoms;

    $('#patient-list').dropdown({
      maxSelections: 3,
      action: 'activate',
      onChange: this.onPatientSelect,
      value: "2"
    });

    $('#symptoms-list').dropdown({
      maxSelections: 28,
      action: 'activate',
      onChange: this.clusterSymptoms,
    });

    $('.filters-list').dropdown({
      maxSelections: 20,
      action: 'activate',
      onChange: this.onPatientFilter,
    });

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
    });

    $('#mult-timestamps-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').hide();
      $('#stack').hide();
    });   

      $("#resetTimeButton").on('click', function(){
        $('.stackPath').css('opacity','0.8')
        $('circle').css('opacity','1');
      })

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
                  if(this.patients.length > 0){
                    this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.patients);
                    setTimeout(() =>{
                        this.drawTendrilPlot(this.patients, this.symptoms);
            
            
                   }, 500);
                  }
                  else{
                    this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.filteredPatients);
                    setTimeout(() =>{
                        this.drawTendrilPlot(this.filteredPatients, this.symptoms);
            
            
                   }, 500);
                    
                  }
                }
              } 
              if(this.patients.length > 0 || this.filteredPatients.length >0){
                $('#lastSymp').css('font-size','2em');
                $('.linePlots').css('opacity','0.3');
                $('.lastLinePlots').css('stroke-width','2')
                 $('#lastSelectedsymp').css('display','block');
                    setTimeout(function() {
                       $('#lastSelectedsymp').css('display','none');
                       $('#lastSymp').css('font-size','1em');
                       $('.linePlots').css('opacity','0.8');
                       $('.lastLinePlots').css('stroke-width','1')

                    }, 1000);
                    
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


    $('#resetButton').on("click",(event) =>{
      $('#scatterplot').css('visibility','hidden');
      if(this.clusteringSymptoms.length > 22){
        setTimeout(() =>{
            this.drawClusters(this.period).then($('#scatterplot').css('visibility','visible'));
            
            
        }, 5000);
      }
      else if(this.clusteringSymptoms.length > 14){
        setTimeout(() =>{
            this.drawClusters(this.period).then($('#scatterplot').css('visibility','visible'));
            
            
        }, 3500);
      }
      else{
        setTimeout(() =>{
            this.drawClusters(this.period).then($('#scatterplot').css('visibility','visible'));
            
            
        }, 2000);
      }

      
      $('.filters-list').dropdown('clear'); 
      $('#symptoms-list').dropdown('clear');
    })
  }


  async clusterSymptoms(value){
    this.clusteringSymptoms = value;
    await this.drawFilteredClusters(this.period, value)
    this.onPatientFilter(this.period)
  }

  async drawFilteredClusters(period, symptoms){
    await this.drawClusters(period,symptoms);
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
    if(this.patients.length > 0){
       this.stackPlot.update(this.patients, sympList);
    }
    else if(this.filteredPatients.length >0){
      this.stackPlot.update(this.filteredPatients, sympList);
    }
    
    this.symptoms = sympList;
    if (!this.filteredPatients || this.filteredPatients.length == 0){
      setTimeout(()=> {
       this.drawTendrilPlot(this.patients, sympList);

      }, 500);
      
    }
    if(this.patients.length > 0)
      this.patientHistory.update(this.patients[this.patients.length - 1], this.symptoms);

  }


  async onPatientSelect(value) {
   this.patientHistory.clear();
  if(!value)
    {return;}
   this.patientHistory.clear();
    this.patients = value;
    this.symptomsList.clear()
    this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.patients);
    if (this.patients.length == 0 && this.filteredPatients.length == 0) {
           setTimeout(()=> {
       $('#defaultPatientText').show();

      }, 600);
      
          $('#tendril').empty();
    } else {
      this.patientHistory.update(this.patients[this.patients.length - 1], this.symptoms);
     $('#defaultPatientText').hide();
      setTimeout(()=> {
        this.drawTendrilPlot(this.patients, this.symptoms);

      }, 500);
       
    }
    this.highlightPatients(this.patients);
    if(this.symptoms != null){
          this.stackPlot.clear();
          this.stackPlot.update(value, this.symptoms);
    }
    else {
      if(value.length > 0){
          this.stackPlot.clear();
          this.stackPlot.update(value, ['mood', 'work', 'relations', 'walking', 'enjoymentOfLife']);
        }else{
          this.stackPlot.clear();
          this.stackPlot.update([], []);
        }
          
    }



  }


  async onPatientFilter(period){
      if (this.patients.length > 0){
        $('#patient-list').dropdown('clear'); 
        this.patients = [];
        await this.onPatientSelect([]) 
        this.patientHistory.update([],[])
      }

      this.patientFilters = $('.filters-list').find(":selected").text();
      if(this.patientFilters.length == 0){
        //await this.onPatientSelect(this.patients)
      }
      const data = await this.loadDataset(parseInt(window.currentPeriod), this.clusteringSymptoms);
      var i =0;
      var patients = [];
      var totalPatients = [];
      var ratingsFilter = [];
      var genderFilter = [];
      var therapyFilter = [];
      var tumorFilter = [];
      this.emptyPatientFilter = false;
      if(this.patientFilters.includes("T1")){
        patients = (data.filter(d => d.t_category == "T1"));
        patients.forEach(el => tumorFilter.push(el));
      }
      if(this.patientFilters.includes("T2")){
        patients = (data.filter(d => d.t_category == "T2"));
         patients.forEach(el => tumorFilter.push(el));
      }

      if(this.patientFilters.includes("T3")){
        patients = (data.filter(d => d.t_category == "T3"));
        patients.forEach(el => tumorFilter.push(el));
       
      }
      if(this.patientFilters.includes("T4")){
        patients = (data.filter(d => d.t_category == "T4"));
         patients.forEach(el => tumorFilter.push(el));
      }
      if(this.patientFilters.includes("Cc")){
        patients = (data.filter(d => d.therapeutic_combination == "CC"));
        patients.forEach(el => therapyFilter.push(el));
       
      }
      if(this.patientFilters.includes("IC+CC")){
        patients = (data.filter(d => d.therapeutic_combination == "IC+CC"));
         patients.forEach(el => therapyFilter.push(el));
      }

      if(this.patientFilters.includes("IC+Rad")){
        patients = (data.filter(d => d.therapeutic_combination == "IC+Radiation alone"));
        patients.forEach(el => therapyFilter.push(el));
       
      }
      if(this.patientFilters.includes("Radiation")){
        patients = (data.filter(d => d.therapeutic_combination == "Radiation alone"));
         patients.forEach(el => therapyFilter.push(el));
      }

      if(this.patientFilters.includes("Male")){
        patients = (data.filter(d => d.gender == "Male"));
        patients.forEach(el => genderFilter.push(el));
       
      }
      if(this.patientFilters.includes("Female")){
        patients = (data.filter(d => d.gender == "Female"));
         patients.forEach(el => genderFilter.push(el));
      }

      if(this.patientFilters.includes("Mild")){
        patients = (data.filter(d => d.cluster == 0));
        patients.forEach(el => ratingsFilter.push(el));
       
      }
      if(this.patientFilters.includes("Severe")){
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

      this.filteredPatients = totalPatients.map(el => el.patientId);
      if(this.filteredPatients.length >0){
         this.symptomsList.clear()
          this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, this.filteredPatients);
          this.stackPlot.clear();
          this.stackPlot.update(this.filteredPatients, this.symptoms);
                setTimeout(()=> {
        this.drawTendrilPlot(this.filteredPatients, []);

      }, 500);
         
          $('#defaultPatientText').hide();
          return;
      }
      else{
        if(this.patients.length <1)
                setTimeout(()=> {
      $('#defaultPatientText').show();

      }, 600);
       
        this.symptomsList.clear()
          this.symptomsList.drawSymptomsList(this.allSymptoms, this.symptoms, []);
          this.stackPlot.clear();
          this.stackPlot.update([], []);
      }
      setTimeout(()=> {
       this.drawTendrilPlot();

      }, 500);
      

  }


  async loadDataset(period, symptoms) {
    const patients = await d3.csv('/data/datasets/patients_complete_with_survival.csv');
    const clusters = await d3.csv(`/data/output/raw_result-time-${period}.csv`);

    if(!symptoms || symptoms.length == 0){
    // const data = clusters
    //   .filter(cluster => patients.find(patient => patient.patientId === cluster.patientId))
    //   .map(cluster => ({ ...cluster, ...patients.find(patient => patient.patientId === cluster.patientId) }))
    //   .sort((a, b) => a.patientId - b.patientId)
    //   .map(({ cluster,sum, gender, patientId, t_category,therapeutic_combination }) => ({
    //     cluster: parseInt(cluster),
    //     sum,
    //     patientId,
    //     gender,
    //     t_category,
    //     therapeutic_combination
    //   }));

     const filename = `D:/sem1/VDS/symptom_project/cs529-project/data/output/raw_result-time-${period}.csv`;
     const symptoms = this.allSymptoms;
      const response = await fetch("http://localhost:5000/", {method:'POST', mode: 'cors', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({filename,symptoms}) });
      const filtered_clusters = await response.json();
      const f = []
      for (var i =0; i <clusters.length; i++){
        f.push(filtered_clusters[i])
      }
      
      const data = f
      .filter(cluster => patients.find(patient => patient.patientId == cluster['patientId']))
      .map(cluster => ({ ...cluster, ...patients.find(patient => patient.patientId == cluster['patientId']) }))
      .sort((a, b) => a.patientId - b.patientId)
      .map(({ cluster,sum, gender, patientId, t_category,therapeutic_combination }) => ({
        cluster: parseInt(cluster),
        sum,
        patientId,
        gender,
        t_category,
        therapeutic_combination
      }));

    return data;
    }
    else{
      const filename = `D:/sem1/VDS/symptom_project/cs529-project/data/output/raw_result-time-${period}.csv`;
      const response = await fetch("http://localhost:5000/", {method:'POST', mode: 'cors', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({filename,symptoms}) });
      const filtered_clusters = await response.json();
      const f = []
      for (var i =0; i <clusters.length; i++){
        f.push(filtered_clusters[i])
      }
      
      const data = f
      .filter(cluster => patients.find(patient => patient.patientId == cluster['patientId']))
      .map(cluster => ({ ...cluster, ...patients.find(patient => patient.patientId == cluster['patientId']) }))
      .sort((a, b) => a.patientId - b.patientId)
      .map(({ cluster,sum, gender, patientId, t_category,therapeutic_combination }) => ({
        cluster: parseInt(cluster),
        sum,
        patientId,
        gender,
        t_category,
        therapeutic_combination
      }));
    return data;
    }
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
    $('.ui.dropdown:has(#symptoms-list) .default.text').text(`Select Clustering Symptoms`)
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


  async clearDropDown(){
      $('#scatterplot').css('visibility','hidden')
      setTimeout(()=> {
        this.drawClusters(this.period).then($('#scatterplot').css('visibility','visible'));

      }, 2000);
      
      $('#symptoms-list').dropdown('clear');
      this.clusteringSymptoms = [];

  }

  async sliderUpdate(period) {
    this.period = period;
    await this.clearDropDown().then(this.drawClusters(period));
    $('#patient-list').dropdown('clear'); 
    await this.clearDropDown();
    await this.onPatientFilter(); 
    this.patientHistory.clear();
    await this.drawTendrilPlot();
    this.clearDropDown();
  }

  async drawClusters(period, symptoms) {
    const data = await this.loadDataset(period, symptoms);
    // if(!symptoms || symptoms.length == 0){
    //    data = await this.loadDataset(period);
    //    console.log("papa")
    // }
    // else{
    //    data = await this.loadDataset(period, symptoms);
    // }
    const patientIds = data.map(({ patientId }) => parseInt(patientId));

    if (!this.scatterPlot && data.length > 0) {
      this.scatterPlot = new ScatterPlot('#scatterplot', 512, 512, data, this.selectPatient);
      await this.scatterPlot.init();
    } else if (this.scatterPlot) {
      await this.scatterPlot.clear();
      await this.scatterPlot.update(data);
    }
    this.updatePatientIds(new Set(patientIds));
    if(this.patients.length > 0){
      this.highlightPatients(this.patients)
    }
    else{
      if(this.filteredPatients.length > 0){
        this.highlightPatients(this.filteredPatients)
      }
    }
  }

 

  async drawTendrilPlot(patientIds, symptoms) {
    if (this.tendrilPlots.length >0){

      this.tendrilPlots.forEach(plot => plot.svg.remove());
      this.tendrilPlots = [];
    }
    if (!patientIds || patientIds.length <1 ) {
      if(this.filteredPatients.length <1 || this.patients.length ==0){
      return; 
      }
    }

    const data = await d3.csv('/data/datasets/symptoms_period.csv');
    const data_patient = await d3.csv('/data/datasets/patients_complete_with_survival.csv');
    const patients = patientIds.map(patientId => data.filter(d => d.patientId === patientId));
    const p = patients;

   
    if (this.filteredPatients.length> 0 && this.patients.length ==0){
      const colors = ['#66a61e', '#9854cc', '#058f96', '#DA8A00', '#803e3b' ];
      const patientDataSelected =[];
      patients.forEach(patient => {
        const id = patient[0].patientId;
        const p_surv = data_patient.filter(d => d.patientId == id).map((p) =>{return parseInt(p.survival)} )
        const p_with_survival = p.filter(d => d[0].patientId == id)
        p_with_survival['survival'] = p_surv;
        patientDataSelected.push(p_with_survival);

      });
      for (var i = 0; i < this.symptoms.length; i++){

        const tendrilPlot = new TendrilPlot('#tendril', 120, 150, patientDataSelected,this.symptoms[this.symptoms.length -i -1],colors[i] );
        tendrilPlot.init();
        this.tendrilPlots.push(tendrilPlot);

      }

      // this.symptoms.forEach(s => {
      //   const tendrilPlot = new TendrilPlot('#tendril', 150, 150, patientDataSelected, s, );
      //   tendrilPlot.init();
      //   this.tendrilPlots.push(tendrilPlot);

      // })
      // const tendrilPlot = new TendrilPlot('#tendril', 150, 150, patientDataSelected);
      // tendrilPlot.init();
      // this.tendrilPlots.push(tendrilPlot);
     
      return;
    }

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

