import React from 'react';
import ChartJS from 'react-chartjs';

const LineChart = ChartJS.Line;

// Rand function, will remove when using real data.
const rand = (min, max, num) => {
  var rtn = [];
  while (rtn.length < num) {
    rtn.push((Math.random() * (max - min)) + min);
  }
  return rtn;
}

// Dummy datasets.
const datasets = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: rand(32, 100, 7)
    },
    {
      label: "My Second dataset",
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: rand(32, 100, 7)
    }
  ]
};

export default class Chart extends React.Component {
  componentDidMount () {
    // Do something on component mount (possibly fetch data?)
    // ... but will have to work out what I'm doing with Redux or Flux or wevz.
  }
  render () {
    return <LineChart data={datasets} options={{responsive:true}} height="300" width="600" />;
  }
}
