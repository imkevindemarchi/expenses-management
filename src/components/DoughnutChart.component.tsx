import { FC, useContext } from "react";
import { Pie } from "react-chartjs-2";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export type TDoughnutChartData = {
  label: string;
  data: number[];
  backgroundColor: string[];
};

export interface IDoughnutChartTooltip {
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
  data: TDoughnutChartData;
  customTooltipLabel?: (context: IDoughnutChartTooltip) => string;
}

const DoughnutChart: FC<IProps> = ({ labels, data, customTooltipLabel }) => {
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const dataset = {
    labels,
    datasets: [data],
  };

  const options: ChartOptions<any> = {
    plugins: {
      legend: {
        labels: {
          color: isLightMode ? "#000000" : "#ffffff",
        },
      },
      tooltip: {
        callbacks: {
          label: customTooltipLabel,
        },
      },
    },
    scales: {},
  };

  return (
    <Pie
      data={dataset}
      options={options}
      className={`transition-all duration-300 ${isLightMode ? "" : "opacity-80"}`}
    />
  );
};

export default DoughnutChart;
