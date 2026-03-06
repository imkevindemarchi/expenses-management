import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

// Api
import { ITEM_API } from "../api";

// Assets
import { MONTHS } from "../assets";

// Components
import { BarsChart, Input, ProgressBar, Table } from "../components";

// Contexts
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Icons
import { CalendarIcon } from "../assets/icons";

// Types
import { THTTPResponse, TItem, TItemType } from "../types";
import { IColumn } from "../components/Table.component";
import { IAutocompleteValue } from "../components/Autocomplete.component";
import {
  IBarsChartTooltip,
  TBarsChartDataset,
} from "../components/BarsChart.component";
import { TProgressBarStatus } from "../components/ProgressBar.component";

// Utils
import { setPageTitle } from "../utils";

interface IFilters {
  year: number;
}

type TTableItem = {
  month: string;
  incomings: number;
  exits: number;
};

const YearSummary: FC = () => {
  const { t } = useTranslation();
  const CURRENT_YEAR: number = new Date().getFullYear();
  const DEFAULT_FILTERS: IFilters = {
    year: CURRENT_YEAR,
  };
  const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { state: isLoading, setState: setIsLoading }: TLoaderContext =
    useContext(LoaderContext) as TLoaderContext;
  const [items, setItems] = useState<TItem[]>([]);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [tableData, setTableData] = useState<TTableItem[]>([]);
  const [barsChartLabels, setBarsChartLabels] = useState<string[]>([]);
  const [barsChartData, setBarsChartDataset] = useState<TBarsChartDataset[]>(
    [],
  );
  const progressBarStatus: TProgressBarStatus =
    Number(calculateProgress().toFixed(0)) >= 80
      ? "danger"
      : Number(calculateProgress().toFixed(0)) >= 50
        ? "warning"
        : "ok";
  const titleLabel: string = t("year-summary");
  const isMobile: boolean = window.innerWidth <= 800;

  setPageTitle(titleLabel);

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(ITEM_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) setItems(response.data);
        else openPopup(t("unableLoadExpenses"), "error");
      },
    );

    setIsLoading(false);
  }

  function onFiltersChange(propLabel: keyof IFilters, value: any): void {
    setFilters((prevState: IFilters) => {
      return { ...prevState, [propLabel]: value };
    });
  }

  function getTotalExpensesMonth(monthId: number): number {
    let total: number = 0;

    items.forEach((item: TItem) => {
      if (
        item.month_id === monthId &&
        item.type === "exit" &&
        Number(item.year) === Number(filters.year)
      )
        total += item.value;
    });

    return total;
  }

  function getTotalIncomingsMonth(monthId: number): number {
    let total: number = 0;

    items.forEach((item: TItem) => {
      if (
        item.month_id === monthId &&
        item.type === "income" &&
        Number(item.year) === Number(filters.year)
      )
        total += item.value;
    });

    return total;
  }

  function getTableData(): TTableItem[] {
    const data: TTableItem[] = [];

    MONTHS.forEach((month: IAutocompleteValue) => {
      const totalExpensesMonth: number = getTotalExpensesMonth(
        Number(month.id),
      );
      const totalIncomingsMonth: number = getTotalIncomingsMonth(
        Number(month.id),
      );

      data.push({
        month: month.label,
        incomings: totalIncomingsMonth,
        exits: totalExpensesMonth,
      });
    });

    return data;
  }

  function getEachMonthExits(): number[] {
    const eachMonthExit: number[] = [];

    MONTHS.forEach((month: IAutocompleteValue) => {
      let total: number = 0;

      items.forEach((item: TItem) => {
        if (
          item.month_id === month.id &&
          Number(item.year) === Number(filters.year) &&
          item.type === "exit"
        )
          total += item.value;
      });

      eachMonthExit.push(total);
    });

    return eachMonthExit;
  }

  function getEachMonthIncomings(): number[] {
    const eachMonthExit: number[] = [];

    MONTHS.forEach((month: IAutocompleteValue) => {
      let total: number = 0;

      items.forEach((item: TItem) => {
        if (
          item.month_id === month.id &&
          Number(item.year) === Number(filters.year) &&
          item.type === "income"
        )
          total += item.value;
      });

      eachMonthExit.push(total);
    });

    return eachMonthExit;
  }

  function getTotal(type: TItemType): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (Number(item.year) === Number(filters.year) && item.type === type)
        total += item.value;
    });

    return total;
  }

  function calculateProgress(): number {
    const progress: number =
      getTotal("exit") && getTotal("income")
        ? (getTotal("exit") / getTotal("income")) * 100
        : 100;

    return getTotal("exit") > getTotal("income") ? 100 : progress;
  }

  const title = (
    <span className="text-black text-[2em] mobile:text-2xl mobile:text-center">
      {titleLabel}
    </span>
  );

  const year = (
    <Grid size={{ xs: 12, md: 3 }}>
      <Input
        type="number"
        inputMode="numeric"
        value={filters.year}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onFiltersChange("year", event.target.value)
        }
        startIcon={<CalendarIcon className="text-darkgray text-lg" />}
        noShadow
      />
    </Grid>
  );

  const incomingsLabel = (
    <div className="flex flex-col gap-2">
      <span className="text-lg text-black capitalize">
        {t("totalIncomings")}
      </span>
      <span className="text-3xl text-primary">€ {getTotal("income")}</span>
    </div>
  );

  const exitsLabel = (
    <div className="flex flex-col gap-2">
      <span className="text-lg text-black capitalize">{t("totalExits")}</span>
      <span className="text-3xl text-primary-red">€ {getTotal("exit")}</span>
    </div>
  );

  const progressBar = (
    <div className="flex flex-row items-center gap-5 mobile:flex-col">
      <ProgressBar progress={calculateProgress()} status={progressBarStatus} />
      <span
        className={`text-xl ${progressBarStatus === "warning" ? "text-warning-popup " : progressBarStatus === "danger" ? "text-primary-red" : "text-primary"}`}
      >
        {calculateProgress().toFixed(0)}%
      </span>
    </div>
  );

  const progressLabel = getTotal("exit") !== 0 && (
    <div className="flex items-end h-full">
      <div className="flex flex-col gap-2">
        <span className="text-lg text-black lowercase">
          {t("percentageOfRevenueSpent")}
        </span>
        <div className="flex items-end h-full">{progressBar}</div>
      </div>
    </div>
  );

  const labels = (
    <div className="w-full flex items-center justify-between">
      <div className="w-full flex items-center gap-20 mobile:flex-col mobile:gap-5">
        <div className="w-full flex items-center gap-10">
          {incomingsLabel}
          <div className="h-[10vh] bg-lightgray w-[1px] rounded-full" />
          {exitsLabel}
        </div>
        <div className="w-full flex mobile:justify-center">{progressLabel}</div>
      </div>
    </div>
  );

  const header = (
    <Grid container rowSpacing={isMobile ? 2 : 0}>
      <Grid size={{ md: 4 }} sx={{ width: "100%" }}>
        <div className="w-full flex flex-col gap-10">
          {title}
          {year}
        </div>
      </Grid>
      <Grid size={{ md: 8 }} sx={{ width: "100%" }}>
        {labels}
      </Grid>
    </Grid>
  );

  const columns: IColumn[] = [
    { key: "month", value: t("month") },
    { key: "incomings", value: t("incomings") },
    { key: "exits", value: t("exits") },
  ];

  const table = tableData && tableData.length > 0 && (
    <Table
      isLoading={isLoading}
      data={tableData}
      columns={columns}
      noFooter
      smallPadding
    />
  );

  function graphTooltipTitle(context: IBarsChartTooltip[]): string {
    const type: string = context[0].dataset.label;
    const month: string = context[0].label;

    return `${type} ${month}`;
  }

  function graphTooltipLabel(context: IBarsChartTooltip): string {
    return ` €${context?.formattedValue}`;
  }

  const graph = (
    <BarsChart
      data={barsChartData}
      labels={barsChartLabels}
      customTooltipTitle={graphTooltipTitle}
      customTooltipLabel={graphTooltipLabel}
      height={isMobile ? 50 : 15}
      width={100}
    />
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  useEffect(() => {
    const tableData: TTableItem[] = getTableData();
    setTableData(tableData);

    const barsChartLabels: string[] = MONTHS.map(
      (month: IAutocompleteValue) => {
        return t(month.label);
      },
    );
    setBarsChartLabels(barsChartLabels);
    const barsChartDataset: TBarsChartDataset[] = [
      {
        backgroundColor: "#91FF75",
        data: getEachMonthIncomings(),
        label: t("incomings"),
      },
      {
        backgroundColor: "#FF8B75",
        data: getEachMonthExits(),
        label: t("exits"),
      },
    ];

    setBarsChartDataset(barsChartDataset);

    // eslint-disable-next-line
  }, [items, filters.year]);

  return (
    <div className="flex flex-col gap-10">
      {header}
      {graph}
      {table}
    </div>
  );
};

export default YearSummary;
