import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

// Api
import { ITEM_API } from "../api";

// Assets
import { MONTHS } from "../assets";

// Components
import { BarsChart, Input, LiquidGlass, Table } from "../components";

// Contexts
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Types
import { THTTPResponse, TItem, TItemType } from "../types";
import { IColumn } from "../components/Table.component";
import { IAutocompleteValue } from "../components/Autocomplete.component";
import { TBarsChartDataset } from "../components/BarsChart.component";

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

  const title: string = t("year-summary");
  setPageTitle(title);

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
        month: t(month.label),
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

  const header = (
    <div className="flex items-center gap-5">
      <span className="text-white text-lg whitespace-nowrap">{title}</span>
      <Input
        type="number"
        inputMode="numeric"
        value={filters.year}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onFiltersChange("year", event.target.value)
        }
        className="w-fit"
      />
    </div>
  );

  const columns: IColumn[] = [
    { key: "month", value: t("month") },
    { key: "incomings", value: t("incomings") },
    { key: "exits", value: t("exits") },
  ];

  const table = tableData && tableData.length > 0 && (
    <LiquidGlass>
      <Table
        isLoading={isLoading}
        data={tableData}
        columns={columns}
        noFooter
        smallPadding
      />
    </LiquidGlass>
  );

  const graph = (
    <LiquidGlass
      blur={100}
      borderRadius={20}
      className="p-10 mobile:p-5 h-full"
    >
      <BarsChart data={barsChartData} labels={barsChartLabels} />
    </LiquidGlass>
  );

  const incomingsTotal = (
    <div className="flex items-center gap-5">
      <span className="text-3xl text-white">{t("incomings")}:</span>
      <LiquidGlass
        backgroundColor="rgba(0, 0, 0, 0.5)"
        className="flex justify-center items-center w-fit px-5 py-2"
      >
        <span className="text-incomings text-3xl">€ {getTotal("income")}</span>
      </LiquidGlass>
    </div>
  );

  const exitsTotal = (
    <div className="flex items-center gap-5">
      <span className="text-3xl text-white">{t("exits")}:</span>
      <LiquidGlass
        backgroundColor="rgba(0, 0, 0, 0.5)"
        className="flex justify-center items-center w-fit px-5 py-2"
      >
        <span className="text-exits text-3xl">€ {getTotal("exit")}</span>
      </LiquidGlass>
    </div>
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
        backgroundColor: "#FFE875",
        data: getEachMonthIncomings(),
        label: t("incomings"),
      },
      {
        backgroundColor: "#FF7575",
        data: getEachMonthExits(),
        label: t("exits"),
      },
    ];

    setBarsChartDataset(barsChartDataset);

    // eslint-disable-next-line
  }, [items, filters.year]);

  return (
    <div className="flex flex-col gap-5">
      {header}
      {incomingsTotal}
      {exitsTotal}
      <Grid container columnSpacing={5} rowSpacing={5}>
        <Grid size={{ xs: 12, md: 8 }}>{graph}</Grid>
        <Grid size={{ xs: 12, md: 4 }}>{table}</Grid>
      </Grid>
    </div>
  );
};

export default YearSummary;
