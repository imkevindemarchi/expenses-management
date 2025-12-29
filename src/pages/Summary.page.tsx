import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

// Api
import { CATEGORY_API, ITEM_API, SETTING_API, SUB_CATEGORY_API } from "../api";

// Assets
import { MONTHS } from "../assets";

// Components
import { DoughnutChart, Input, LiquidGlass, ProgressBar } from "../components";

// Contexts
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Types
import Autocomplete, {
  IAutocompleteValue,
} from "../components/Autocomplete.component";
import { TCategory, THTTPResponse, TItem, TSubCategory } from "../types";
import { TDoughnutChartData } from "../components/DoughnutChart.component";

// Utils
import { setPageTitle } from "../utils";

interface IFilters {
  month: IAutocompleteValue;
  year: number;
}

const Summary = () => {
  const { t } = useTranslation();
  const _MONTHS: IAutocompleteValue[] = MONTHS.map(
    (month: IAutocompleteValue) => {
      return { id: month.id, label: t(month.label) };
    }
  );
  const DEFAULT_MONTH: IAutocompleteValue = _MONTHS.find(
    (month: IAutocompleteValue) => month.id === new Date().getMonth() + 1
  ) as IAutocompleteValue;
  const CURRENT_YEAR: number = new Date().getFullYear();
  const DEFAULT_FILTERS: IFilters = {
    month: DEFAULT_MONTH,
    year: CURRENT_YEAR,
  };
  const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const [categories, setCategories] = useState<TCategory[] | null>(null);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [subCategories, setSubCategories] = useState<TSubCategory[] | null>(
    null
  );
  const [items, setItems] = useState<TItem[] | null>(null);
  const [doughnutChartData, setDoughnutChartData] = useState<number[]>([]);
  const [doughnutChartColors, setDoughnutChartColors] = useState<string[]>([]);
  const [doughnutChartLabels, setDoughnutChartLabels] = useState<string[]>([]);
  const DOGHNUT_CART_COLORS: string[] = [
    "#91FF75",
    "#75DFFF",
    "#7C75FF",
    "#BA75FF",
    "#FD75FF",
    "#FF75B1",
    "#FF8B75",
    "#FFC375",
    "#FFED75",
  ];
  const [goal, setGoal] = useState<number>(0);

  const title = t("summary");
  const elabDoughnutChartData: TDoughnutChartData = {
    label: t("count"),
    data: doughnutChartData,
    backgroundColor: doughnutChartColors,
  };

  setPageTitle(t("summary"));

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(CATEGORY_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) setCategories(response.data);
        else openPopup(t("unableLoadCategories"), "error");
      }
    );

    await Promise.resolve(SUB_CATEGORY_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) setSubCategories(response.data);
        else openPopup(t("unableLoadSubCategories"), "error");
      }
    );

    await Promise.resolve(ITEM_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) setItems(response.data);
        else openPopup(t("unableLoadItems"), "error");
      }
    );

    await Promise.resolve(SETTING_API.get(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) setGoal(response.data?.goal ?? 0);
        else openPopup(t("unableLoadSettings"), "error");
      }
    );

    setIsLoading(false);
  }

  function onFiltersChange(propLabel: keyof IFilters, value: any): void {
    setFilters((prevState: IFilters) => {
      return { ...prevState, [propLabel]: value };
    });
  }

  function getSubCategories(category: TCategory): TSubCategory[] {
    const filteredSubCategories: TSubCategory[] = [
      ...(subCategories ?? []),
    ].filter(
      (subCategory: TSubCategory) => subCategory.category_id === category.id
    );

    return filteredSubCategories;
  }

  function getItems(subCategory: TSubCategory): TItem[] {
    const filteredItems: TItem[] = [...(items ?? [])].filter(
      (item: TItem) => item.sub_category_id === subCategory.id
    );

    return filteredItems;
  }

  function getItemsTotal(items: TItem[]): number {
    let total: number = 0;

    items.forEach((item: TItem) => {
      if (
        Number(item.year) === Number(filters.year) &&
        item.month_id === filters.month.id
      ) {
        if (item.type === "exit") total -= item.value;
        else if (item.type === "income") total += item.value;
      }
    });

    return total;
  }

  function getTotalsIncomings(): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (
        item.month_id === filters.month.id &&
        Number(item.year) === Number(filters.year) &&
        item.type === "income"
      )
        total += item.value;
    });

    return total;
  }

  function getTotalsIncomingsLabel(): string {
    let total: number = getTotalsIncomings();

    return `${t("incomings")}: € ${total}`;
  }

  function getTotalsExits(): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (
        item.month_id === filters.month.id &&
        Number(item.year) === Number(filters.year)
      )
        if (item.type === "exit") total += item.value;
    });

    return total;
  }

  function getYearTotalsExits(): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (Number(item.year) === Number(filters.year))
        if (item.type === "exit") total += item.value;
    });

    return total;
  }

  function getTotalsExitsLabel(): string {
    let total: number = getTotalsExits();

    return `${t("exits")}: € ${total}`;
  }

  function getLeftToSpendLabel(): string {
    let total: number = goal - getYearTotalsExits();
    const remainsMonths: number = 12 - Number(filters.month.id) + 1;
    const leftToSpend: number = total / remainsMonths;

    return `${t("leftToSpend")}: € ${leftToSpend}`;
  }

  function calculateProgress(): number {
    const progress: number =
      getTotalsExits() && getTotalsIncomings()
        ? (getTotalsExits() / getTotalsIncomings()) * 100
        : 100;

    return progress;
  }

  function buildDoughnutChartData(): void {
    const data: number[] = [];
    const colors: string[] = [];
    const labels: string[] = [];

    categories?.forEach((category: TCategory, index: number) => {
      let total: number = 0;
      items?.forEach((item: TItem) => {
        if (
          item.category_id === category.id &&
          item.type === "exit" &&
          Number(item.year) === Number(filters.year) &&
          item.month_id === filters.month.id
        )
          total += item.value;
      });

      data.push(total);
      colors.push(DOGHNUT_CART_COLORS[index]);
      total > 0 && labels.push(category.label);
    });

    setDoughnutChartData(data);
    setDoughnutChartColors(colors);
    setDoughnutChartLabels(labels);
  }

  const header = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 2 }}>
        <div className="flex items-center gap-5">
          <span className="text-white text-lg">{title}</span>
          <Input
            type="number"
            inputMode="numeric"
            value={filters.year}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onFiltersChange("year", event.target.value)
            }
          />
        </div>
      </Grid>
      <Grid size={{ xs: 12, md: 10 }}>
        <Autocomplete
          value={filters.month}
          onChange={(value: IAutocompleteValue) =>
            onFiltersChange("month", value)
          }
          data={_MONTHS}
          showAllOptions
        />
      </Grid>
    </Grid>
  );

  const progressBar = (
    <div className="flex items-center gap-5">
      <ProgressBar progress={calculateProgress()} />
      <span className="text-white text-3xl">
        {calculateProgress().toFixed(0)}%
      </span>
    </div>
  );

  const doghnutChart = (
    <div className="flex w-full mobile:justify-center">
      <LiquidGlass className="w-full p-10 w-9h-96 h-96 flex justify-center mobile:h-60 mobile:w-60">
        <DoughnutChart
          data={elabDoughnutChartData}
          labels={doughnutChartLabels}
        />
      </LiquidGlass>
    </div>
  );

  const exits = (
    <Grid container spacing={2}>
      {categories?.map((category: TCategory, index: number) => {
        const filteredSubCategories: TSubCategory[] =
          getSubCategories(category);

        return (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <div className="flex flex-col gap-5">
              <span className="text-white font-bold uppercase text-center">
                {category.label}
              </span>
              <LiquidGlass className="p-10 flex flex-col gap-2">
                {filteredSubCategories.map(
                  (filteredSubCategory: TSubCategory, index2: number) => {
                    const filteredItems: TItem[] =
                      getItems(filteredSubCategory);
                    const itemsTotal: number = getItemsTotal(filteredItems);
                    const itemsTotalString: string = `€${itemsTotal}`;

                    return (
                      <LiquidGlass
                        key={index2}
                        className="flex justify-between px-5 py-2"
                      >
                        <span className="text-white">
                          {filteredSubCategory.label}
                        </span>
                        <span className="text-wrap font-bold text-white">
                          {itemsTotalString}
                        </span>
                      </LiquidGlass>
                    );
                  }
                )}
              </LiquidGlass>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  useEffect(() => {
    categories && items && buildDoughnutChartData();

    // eslint-disable-next-line
  }, [categories, items, filters.year, filters.month]);

  return (
    <div className="flex flex-col gap-5">
      {header}
      <span className="text-3xl text-white">{getTotalsIncomingsLabel()}</span>
      <span className="text-3xl text-white">{getTotalsExitsLabel()}</span>
      {goal && Number(goal) !== 0 ? (
        <span className="text-xl text-white">{getLeftToSpendLabel()}</span>
      ) : null}
      {progressBar}
      {doghnutChart}
      {exits}
    </div>
  );
};

export default Summary;
