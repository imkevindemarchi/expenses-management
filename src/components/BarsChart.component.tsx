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
  ChartOptions,
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

export interface IBarsChartTooltip {
  formattedValue: string;
  label: string;
  dataset: {
    backgroundColor: string;
    data: number[];
    label: string;
  };
}

interface IProps {
  labels: string[];
  data: TBarsChartDataset[];
  customTooltipTitle?: (context: IBarsChartTooltip[]) => string;
  customTooltipLabel?: (context: IBarsChartTooltip) => string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
ChartJS.defaults.color = "#ffffff";

const BarsChart: FC<IProps> = ({
  labels,
  data,
  customTooltipTitle,
  customTooltipLabel,
}) => {
  const options: ChartOptions<any> = {
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: customTooltipTitle,
          label: customTooltipLabel,
        },
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
