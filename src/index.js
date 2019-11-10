import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('semantic-ui-css/semantic');
require('semantic-ui-css/semantic.min.css');

window.addEventListener('DOMContentLoaded', () => {
  d3.csv('/data/datasets/symptoms_period.csv').then((data) => {
    _.sortedUniq(data.map(({ patientId }) => parseInt(patientId, 10)))
      .forEach((id) => {
        d3.select('#patient-list').append('option').text(id).attr('value', id);
      });
  });
  $('#patient-list').dropdown({ maxSelections: 3 });
});
