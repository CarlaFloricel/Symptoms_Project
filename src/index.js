import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('fomantic-ui-css/semantic');
require('fomantic-ui-css/semantic.min.css');

let patientIDs = new Set();
let timePeriods = [];

window.addEventListener('DOMContentLoaded', () => {
  d3.csv('/data/datasets/symptoms_period.csv').then((data) => {
    const selectEl = d3.select('#patient-list');
    timePeriods = _.sortedUniq(data.map(({ period }) => parseInt(period, 10))
      .sort((a, b) => a - b));
    $('#time-slider').slider({
      min: Math.min(...timePeriods),
      max: 6 * (Math.floor(Math.max(...timePeriods) / 6) + 1),
      step: 6,
    });
    d3.select('#time-slider ul li:last-child')
      .text('> 2 years');
    d3.select('#time-slider ul li:first-child')
      .text('Baseline');

    patientIDs = new Set(
      data.map(({ patientId }) => parseInt(patientId, 10))
        .sort((a, b) => a - b)
    );
    patientIDs.forEach((id) => {
      selectEl.append('option').text(id).attr('value', id);
    });
  });

  $('#patient-list').dropdown({ maxSelections: 3 });
});
