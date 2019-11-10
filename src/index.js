import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('semantic-ui-css/semantic');
require('semantic-ui-css/semantic.min.css');

let patientIDs = new Set();
let timePeriods = new Set();

window.addEventListener('DOMContentLoaded', () => {
  d3.csv('/data/datasets/symptoms_period.csv').then((data) => {
    const selectEl = d3.select('#patient-list');
    timePeriods = new Set(
      data.map(({ period }) => parseInt(period, 10))
        .sort((a, b) => a - b)
    );
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
