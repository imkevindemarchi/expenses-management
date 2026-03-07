import React, { FC, useContext } from "react";
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

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

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
  height?: number;
  width?: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const BarsChart: FC<IProps> = ({
  labels,
  data,
  customTooltipTitle,
  customTooltipLabel,
  height,
  width,
}) => {
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;
  ChartJS.defaults.color = isLightMode ? "#000000" : "#ffffff";

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
    scales: {
      x: {
        ticks: {},
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          beginAtZero: true,
        },
        grid: {
          drawBorder: false,
          display: false,
        },
      },
    },
  };

  const dataset = {
    labels,
    datasets: data,
  };

  return (
    <Bar
      options={options}
      data={dataset}
      height={height}
      width={width}
      className={`transition-all duration-300 ${isLightMode ? "" : "opacity-80"}`}
    />
  );
};

export default BarsChart;
