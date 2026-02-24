import { FC } from "react";
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
  const dataset = {
    labels,
    datasets: [data],
  };

  const options: ChartOptions<any> = {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
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

  return <Pie data={dataset} options={options} width={250} height={250} />;
};

export default DoughnutChart;
