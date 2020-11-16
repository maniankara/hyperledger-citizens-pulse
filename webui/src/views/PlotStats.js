import React, { Component } from "react";
import { Line, Pie } from "react-chartjs-2";

export class PlotStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      upvote: 0,
      downvote: 0,
    };
  }

  render() {
    const dashboardEmailStatisticsChart = {
      data: (canvas) => {
        let sum = this.props.upvotes + this.props.downvotes;
        let nota = sum == 0 || sum == NaN ? 1 : 0;

        return {
          labels: [1, 2, 3],
          datasets: [
            {
              label: "Vote Count",
              pointRadius: 0,
              pointHoverRadius: 0,
              backgroundColor: ["#4acccd", "#ef8157", "#e3e3e3"],
              borderWidth: 0,
              data: [this.props.upvotes, this.props.downvotes, nota],
            },
          ],
        };
      },
      options: {
        legend: {
          display: false,
        },

        pieceLabel: {
          render: "percentage",
          fontColor: ["white"],
          precision: 2,
        },

        tooltips: {
          enabled: true,
        },

        scales: {
          yAxes: [
            {
              ticks: {
                display: false,
              },
              gridLines: {
                drawBorder: false,
                zeroLineColor: "transparent",
                color: "rgba(255,255,255,0.05)",
              },
            },
          ],

          xAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(255,255,255,0.1)",
                zeroLineColor: "transparent",
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
      },
    };
    return (
      <div>
        <Pie
          data={dashboardEmailStatisticsChart.data}
          options={dashboardEmailStatisticsChart.options}
        />
      </div>
    );
  }
}

export default PlotStats;
