import React, { FC } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

export type TBarsChartData = {
  label: string;
  data: number[];
  backgroundColor: string[];
};

export type TBarsChartDataset = {
  label: string;
  data: number[];
  backgroundColor: string;
};

interface IProps {
  labels: string[];
  data: TBarsChartDataset[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
ChartJS.defaults.color = "#ffffff";

const BarsChart: FC<IProps> = ({ labels, data }) => {
  const options = {
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
  };

  const dataset = {
    labels,
    datasets: data,
  };

  return <Bar options={options} data={dataset} />;
};

export default BarsChart;
