import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('fomantic-ui-css/semantic');
require('fomantic-ui-css/semantic.min.css');

import TimeSlider from './timeslider';

let patientIDs = new Set();

window.addEventListener('DOMContentLoaded', () => {
  d3.csv('/data/datasets/symptoms_period.csv').then((data) => {
    const selectEl = d3.select('#patient-list');
    const timePeriods = _.sortedUniq(data.map(({ period }) => parseInt(period, 10))
      .sort((a, b) => a - b));
    const timeSlider = new TimeSlider('#time-slider', timePeriods);
    timeSlider.init();

    patientIDs = new Set(
      data.map(({ patientId }) => parseInt(patientId, 10))
        .sort((a, b) => a - b)
    );
    patientIDs.forEach((id) => {
      selectEl.append('option').text(id).attr('value', id);
    });
  });

  $('#patient-list').dropdown({ maxSelections: 3 });

  // Connecting tab event listeners
  $('#timeline-btn').on('click', function () {
    $('#timeline-btn').toggleClass('active');
    $('#correlation-btn').toggleClass('active');
    $('#timeline').show();
    $('#matrix').hide();
  });
  $('#correlation-btn').on('click', function () {
    $('#timeline-btn').toggleClass('active');
    $('#correlation-btn').toggleClass('active');
    $('#timeline').hide();
    $('#matrix').show();
  });
  $('#mult-symptoms-btn').on('click', function () {
    $('#mult-symptoms-btn').toggleClass('active');
    $('#mult-patients-btn').toggleClass('active');
    $('#tendril').hide();
    $('#stack').show();
  });
  $('#mult-patients-btn').on('click', function () {
    $('#mult-symptoms-btn').toggleClass('active');
    $('#mult-patients-btn').toggleClass('active');
    $('#tendril').show();
    $('#stack').hide();
  });
});
