import $ from 'jquery';

class TimeSlider {
  constructor(selector, timePeriods, labels) {
    this.selector = selector;
    this.timePeriods = timePeriods;
    this.labels = labels || [...timePeriods];
    this.labels[0] = 'Baseline';
    this.labels[this.labels.length - 1] = '> 2 years';
  }

  init() {
    $(this.selector).slider({
      max: this.labels.length,
      min: 1,
      onChange: this.onChange.bind(this),
    });
    const { labels } = this;
    $(`${this.selector} ul li`).each(function (i) {
      $(this).text(labels[i]);
    })
  }

  onChange(value) {
    window.currentPeriod = this.timePeriods[value - 1];
    $('#matrix > img').attr('src', `/assets/imgs/correlation/${window.currentPeriod}.svg`);
  }
}

export default TimeSlider;
