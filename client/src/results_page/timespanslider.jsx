var React = require('react');

var TimeSpanSlider = React.createClass({
  componentWillReceiveProps: function() {
    
    var component = this;
      $('#slider').slider({
        value: component.props.timeSpan,
        min: 1,
        max: 29,
        step: 7,
        slide: function(event, ui) {
          component.props.setTimeSpan(ui.value);
        }
    })
  },

  render: function() {
    return (
      <div id='slider'></div>
      )
  }
});

module.exports = TimeSpanSlider;