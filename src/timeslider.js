import $ from 'jquery';

class TimeSlider {
  constructor(selector, timePeriods, labels, stepSize = 6) {
    this.selector = selector;
    this.timePeriods = timePeriods;
    this.labels = labels;
    this.stepSize = stepSize;
  }

  init() {
    const min = Math.min(...this.timePeriods);
    const max = this.stepSize * (
      Math.floor(Math.max(...this.timePeriods) / this.stepSize) + 1);
    $(this.selector).slider({
      max,
      min,
      step: this.stepSize,
      onChange: this.onChange.bind(this),
    });
    $(`${this.selector} ul li:last-child`)
      .text('> 2 years');
    $(`${this.selector} ul li:first-child`)
      .text('Baseline');
  }

  onChange(value) {
    console.log(value);
  }
}

export default TimeSlider;
