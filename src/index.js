import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('fomantic-ui-css/semantic');
require('fomantic-ui-css/semantic.min.css');

import TimeSlider from './timeslider';
import ScatterPlot from './scatterplot';
import StackedLinePlot from './stackedLinePlot';
import TendrilPlot from "./tendrilplot";

class App {
  constructor() {
    this.scatterPlot = null;
    this.stackPlot = null;
    this.drawClusters = this.drawClusters.bind(this);
    this.onPatientSelect = this.onPatientSelect.bind(this);
    this.showStackPlot = this.showStackPlot.bind(this);
    this.onSymptomsSelect = this.onSymptomsSelect.bind(this);
    this.patients = [];
    this.symptoms = [];
    this.selectPatient = this.selectPatient.bind(this);
  }

  async initTimeSlider() {
    const symptoms = await d3.csv('/data/datasets/symptoms_period.csv');
    const timePeriods = _.sortedUniq(
      symptoms.map(({ period }) => parseInt(period, 10)).sort((a, b) => a - b));
    const timeSlider = new TimeSlider('#time-slider', timePeriods, this.drawClusters);
    timeSlider.init();
  }

  init() {
    this.initTimeSlider();
    this.showStackPlot(0);
    this.drawTendrilPlot();

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

    // Connecting tab event listeners
    $('#scatterplot-btn').on('click', function () {
      $('#scatterplot-btn').toggleClass('active');
      $('#correlation-btn').toggleClass('active');
      $('#scatterplot').show();
      $('#scatterplot-legend').show();
      $('#star-plot').hide();
      $('#matrix').hide();
    });

    $('#correlation-btn').on('click', function () {
      $('#scatterplot-btn').toggleClass('active');
      $('#correlation-btn').toggleClass('active');
      $('#scatterplot').hide();
      $('#scatterplot-legend').hide();
      $('#matrix').show();
    });

    $('#mult-symptoms-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').show();
      $('#stack').show();
      $('#star-plot').hide();
    });

    // $('#mult-patients-btn').on('click', function () {
    //   $('#mult-symptoms-btn').toggleClass('active');
    //   $('#mult-patients-btn').toggleClass('active');
    //   $('#tendril').hide();
    //   $('#star-plot').hide();
    //   $('#stack').hide();
    // });

    // $('#mult-timestamps-btn').on('click', function () {
    //   $('#mult-symptoms-btn').toggleClass('active');
    //   $('#mult-patients-btn').toggleClass('active');
    //   $('#star-plot').show();
    //   $('#tendril').hide();
    //   $('#stack').hide();
    // });

    this.updateSymptoms();
  }

  async onPatientSelect(value) {
    this.highlightPatients(value);
    this.patients = value;
    this.stackPlot.clear();
    this.stackPlot.update(value[value.length - 1], ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress']);
  }

  async onSymptomsSelect(value) {
    this.stackPlot.clear();
    this.stackPlot.update(this.patientId, value);
    this.symptoms = value;
    this.drawTendrilPlot(this.patientId, value);
  }

  async loadDataset(period) {
    const patients = await d3.csv('/data/datasets/patients_complete.csv');
    const clusters = await d3.csv(`/data/output/raw_result-time-${period}.csv`);
    const data = clusters
      .filter(cluster => patients.find(patient => patient.patientId === cluster.patientId))
      .map(cluster => ({ ...cluster, ...patients.find(patient => patient.patientId === cluster.patientId) }))
      .sort((a, b) => a.cluster - b.cluster)
      .map(({ cluster, gender, patientId, t_category }) => ({
        cluster: parseInt(cluster),
        patientId,
        gender,
        t_category,
      }));
    return data;
  }

  async updatePatientIds(ids) {
    $('.ui.dropdown:has(#patient-list)').hide();
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
    const symptoms = ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress', 'shortnessOfBreath', 'memory', 'lackOfAppetite', 'drowsiness', 'dryMouth', 'sadness',
      'vomit', 'numbness', 'mucusInMouthAndThroat', 'difficultyInSwallowing', 'choking', 'speech', 'skinPain', 'constipation', 'taste', 'sores', 'teethProblem',
      'generalActivity', 'mood', 'work', 'relations', 'walking', 'enjoymentOfLife', 'period'];
    const selectEl = $('#symptoms-list');
    selectEl.empty();
    symptoms.forEach((i) => {
      const optionEl = $('<option></option>', { value: i });
      optionEl.text(i);
      selectEl.append(optionEl);
    })

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

  async selectPatient(value) {
    this.patientId = value;
    this.stackPlot.clear();
    this.stackPlot.update(value, this.symptoms);
    this.drawTendrilPlot(this.patientId, this.symptoms);
  }

  async drawTendrilPlot(patientId, symptoms) {
    $('#tendril-note').remove();

    if (!patientId) {
      d3.select('#tendril')
        .append('p')
        .attr('id', 'tendril-note')
        .style('color', 'black')
        .text('Click on a patient in the clusters to show info.');
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
    const patient = data.filter(d => d.patientId === patientId);
    const patientData = { patient, symptoms };
    if (!this.tendrilPlot) {
      this.tendrilPlot = new TendrilPlot('#tendril', 150, 150, patientData);
      this.tendrilPlot.init();
    } else {
      this.tendrilPlot.clear();
      this.tendrilPlot.drawTendrils(patientData);
    }
  }

  async showStackPlot(patientId) {
    const patientInfo = await d3.csv('/data/datasets/symptoms_period.csv');
    this.stackPlot = new StackedLinePlot(patientInfo, patientId);
    this.stackPlot.init();
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
