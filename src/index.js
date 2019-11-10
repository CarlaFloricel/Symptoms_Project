import * as d3 from "d3";
import $ from 'jquery';
window.$ = window.jQuery = $;
require('semantic-ui-css/semantic');
require('semantic-ui-css/semantic.min.css');

window.addEventListener('DOMContentLoaded', () => {
  $('.ui.dropdown').dropdown({maxSelections: 3});
});
