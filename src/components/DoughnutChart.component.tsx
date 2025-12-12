import { FC } from "react";
import { Pie } from "react-chartjs-2";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
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
  ArcElement
);

export type TDoughnutChartData = {
  label: string;
  data: number[];
  backgroundColor: string[];
};

interface IProps {
  labels: string[];
  data: TDoughnutChartData;
}

const DoughnutChart: FC<IProps> = ({ labels, data }) => {
  const dataset = {
    labels,
    datasets: [data],
  };

  const options: any = {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
      },
    },
    scales: {},
  };

  return <Pie data={dataset} options={options} width={250} height={250} />;
};

export default DoughnutChart;
