import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('fomantic-ui-css/semantic');
require('fomantic-ui-css/semantic.min.css');
import innerJoin from 'lodash-joins/lib/hash/hashInnerJoin';

import TimeSlider from './timeslider';
import ScatterPlot from './scatterplot';

window.addEventListener('DOMContentLoaded', () => {
  d3.csv('/data/datasets/symptoms_period.csv').then((data) => {
    const timePeriods = _.sortedUniq(data.map(({ period }) => parseInt(period, 10))
      .sort((a, b) => a - b));
    const timeSlider = new TimeSlider('#time-slider', timePeriods, drawScatterPlots);
    timeSlider.init();
  });

  $('#patient-list').dropdown({ maxSelections: 3 });

  // Connecting tab event listeners
  $('#scatterplot-btn').on('click', function () {
    $('#scatterplot-btn').toggleClass('active');
    $('#correlation-btn').toggleClass('active');
    $('#scatterplot').show();
    $('#star-plot').hide();
    $('#matrix').hide();
  });
  $('#correlation-btn').on('click', function () {
    $('#scatterplot-btn').toggleClass('active');
    $('#correlation-btn').toggleClass('active');
    $('#scatterplot').hide();
    $('#matrix').show();
  });
  $('#mult-symptoms-btn').on('click', function () {
    $('#mult-symptoms-btn').toggleClass('active');
    $('#mult-patients-btn').toggleClass('active');
    $('#tendril').hide();
    $('#stack').show();
    $('#star-plot').hide();
  });
  $('#mult-patients-btn').on('click', function () {
    $('#mult-symptoms-btn').toggleClass('active');
    $('#mult-patients-btn').toggleClass('active');
    $('#tendril').show();
    $('#star-plot').hide();
    $('#stack').hide();
  $('#mult-timestamps-btn').on('click', function () {
    $('#mult-symptoms-btn').toggleClass('active');
    $('#mult-patients-btn').toggleClass('active');
    $('#star-plot').show();
    $('#tendril').hide();
    $('#stack').hide();
  });
  });
});

const scatterPlotLevels = ['Mild', 'Average', 'Severe'];
const scatterPlots = { 0: null, 1: null, 2: null };

async function drawScatterPlots(period) {
  const patients = await d3.csv('/data/datasets/patients.csv');
  const clusters = await d3.csv(`/data/output/raw_result-time-${period}.csv`);
  window.patients = patients;
  window.clusters = clusters;
  const merged = innerJoin(clusters, (x) => x['patientId'], patients, (x) => x['ID']);
  const x = d3.extent(merged.map(m => parseInt(m['Age.at.Diagnosis'])));
  const y = d3.extent(merged.map(m => parseFloat(m['Total.dose'])));
  const domain = {
    x: [x[0] - 10, x[1] + 10],
    y: [y[0] - 1, y[1] + 1],
  };

  Object.values(scatterPlots).forEach(plot => plot ? plot.clear() : null);

  const patientIds = merged.map(({ patientId }) => parseInt(patientId));
  const clusterIds = new Set(merged.map(({ cluster }) => parseInt(cluster)));
  clusterIds.forEach((clusterId) => {
    const data = merged.filter((r) => parseInt(r.cluster) === clusterId)
      .map((row) => {
        return {
          age: parseInt(row['Age.at.Diagnosis']),
          dosage: parseFloat(row['Total.dose']),
          gender: row['Gender'],
          tumorCategory: row['T.category'],
        };
      })
      .filter(d => d);
    let plot = scatterPlots[clusterId];
    if (!scatterPlots[clusterId]) {
      const margin = { left: 10, right: 20, top: 30, bottom: 30 };
      const width = 400;
      const height = 300;
      plot = new ScatterPlot(
        '#scatterplot',
        scatterPlotLevels[clusterId],
        margin,
        width,
        height,
        data,
        domain);
      plot.init();
    } else {
      plot.update(data);
    }
    scatterPlots[clusterId] = plot;
  });

  updatePatientIds(new Set(patientIds));
}

async function updatePatientIds(ids) {
  $('.ui.dropdown .default.text').text(`Select Patient ID(s) - Total Count: ${ids.size}`)
  const selectEl = $('#patient-list');
  selectEl.empty();
  ids.forEach((id) => {
    const optionEl = $('<option></option>', { value: id });
    optionEl.text(id);
    selectEl.append(optionEl);
  })
}
