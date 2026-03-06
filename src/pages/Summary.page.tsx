import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

// Api
import { CATEGORY_API, ITEM_API, SETTING_API, SUB_CATEGORY_API } from "../api";

// Assets
import { MONTHS } from "../assets";
import { CalendarIcon, ExpenseIcon } from "../assets/icons";

// Components
import {
  Autocomplete,
  DoughnutChart,
  Input,
  ProgressBar,
  ShadowBox,
} from "../components";

// Contexts
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Types
import {
  TCategory,
  THTTPResponse,
  TItem,
  TItemType,
  TSubcategory,
} from "../types";
import { IAutocompleteValue } from "../components/Autocomplete.component";
import {
  IDoughnutChartTooltip,
  TDoughnutChartData,
} from "../components/DoughnutChart.component";
import { TProgressBarStatus } from "../components/ProgressBar.component";

interface IFilters {
  month: IAutocompleteValue;
  year: number;
}

type TSubcategoryItem = TSubcategory & { items: TItem[]; total: number };

type TCategoryItem = TCategory & {
  subcategories: TSubcategoryItem[];
  total: number;
};

type TLeftToSpendType = "positive" | "neutral" | "negative";

type TLeftToSpendColor =
  | "text-success-popup"
  | "text-warning-popup"
  | "text-error-popup";

const Summary: FC = () => {
  const { t } = useTranslation();
  const _MONTHS: IAutocompleteValue[] = MONTHS.map(
    (month: IAutocompleteValue) => {
      return { id: month.id, label: t(month.label) };
    },
  );
  const DEFAULT_MONTH: IAutocompleteValue = _MONTHS.find(
    (month: IAutocompleteValue) => month.id === new Date().getMonth() + 1,
  ) as IAutocompleteValue;
  const CURRENT_YEAR: number = new Date().getFullYear();
  const DEFAULT_FILTERS: IFilters = {
    month: DEFAULT_MONTH,
    year: CURRENT_YEAR,
  };
  const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [goal, setGoal] = useState<number>(0);
  const [data, setData] = useState<TCategoryItem[] | null>(null);
  const [items, setItems] = useState<TItem[] | null>(null);
  const [doughnutChartData, setDoughnutChartData] = useState<number[]>([]);
  const [doughnutChartLabels, setDoughnutChartLabels] = useState<string[]>([]);
  const [isSamePeriod, setIsSamePeriod] = useState<boolean>(true);

  const elabDoughnutChartData: TDoughnutChartData = {
    label: t("count"),
    data: doughnutChartData,
    backgroundColor: [
      "#91FF75",
      "#75DFFF",
      "#7C75FF",
      "#BA75FF",
      "#FD75FF",
      "#FF75B1",
      "#FF8B75",
      "#FFC375",
      "#FFED75",
    ],
  };
  const isData: boolean =
    elabDoughnutChartData.data &&
    elabDoughnutChartData.data.length > 0 &&
    elabDoughnutChartData.data[0] !== 0;
  const progressBarStatus: TProgressBarStatus =
    Number(calculateProgress().toFixed(0)) >= 80
      ? "danger"
      : Number(calculateProgress().toFixed(0)) >= 50
        ? "warning"
        : "ok";
  const isLeftToSpendShown: boolean =
    goal && Number(goal) !== 0 && isSamePeriod ? true : false;
  const isMobile: boolean = window.innerWidth <= 800;

  function getSubcategoryTotal(
    subcategory: TSubcategory,
    items: TItem[],
  ): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (
        item.sub_category_id === subcategory.id &&
        item.type === "exit" &&
        Number(item.year) === Number(filters.year) &&
        item.month_id === filters.month.id
      )
        total += item.value;
    });

    return total;
  }

  function getCategoryTotal(
    category: TCategory | TCategoryItem,
    items: TItem[],
  ): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (
        item.category_id === category.id &&
        item.type === "exit" &&
        Number(item.year) === Number(filters.year) &&
        item.month_id === filters.month.id
      ) {
        total += item.value;
      }
    });

    return total;
  }

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.all([
      CATEGORY_API.getAll(userData?.id as string),
      SUB_CATEGORY_API.getAll(userData?.id as string),
      ITEM_API.getAll(userData?.id as string),
      SETTING_API.get(userData?.id as string),
    ]).then((response: THTTPResponse[]) => {
      const categoriesRes = response[0];
      const subcategoriesRes = response[1];
      const itemsRes = response[2];
      const settingsRes = response[3];

      if (
        categoriesRes &&
        categoriesRes.hasSuccess &&
        subcategoriesRes &&
        subcategoriesRes.hasSuccess &&
        itemsRes &&
        itemsRes.hasSuccess &&
        settingsRes &&
        settingsRes.hasSuccess
      ) {
        const data: TCategoryItem[] = [...(categoriesRes?.data ?? [])].map(
          (category: TCategory) => {
            const categoryTotal: number = getCategoryTotal(
              category,
              itemsRes.data,
            );
            const subcategories: TSubcategoryItem[] = [];
            subcategoriesRes?.data?.forEach((subcategory: TSubcategory) => {
              const items: TItem[] = [];
              itemsRes?.data?.forEach((item: TItem) => {
                item.category_id === category.id &&
                  item.sub_category_id === subcategory.id &&
                  items.push(item);
              });
              const subcategoryTotal: number = getSubcategoryTotal(
                subcategory,
                items,
              );

              subcategory.category_id === category.id &&
                subcategories.push({
                  ...subcategory,
                  items,
                  total: subcategoryTotal,
                });
            });

            return { ...category, subcategories, total: categoryTotal };
          },
        );

        setData(data);
        setItems(itemsRes.data);
        setGoal(settingsRes.data?.month_goal ?? 0);
      } else openPopup(t("unableLoadData"), "error");
    });

    setIsLoading(false);
  }

  function onFiltersChange(propLabel: keyof IFilters, value: any): void {
    setFilters((prevState: IFilters) => {
      return { ...prevState, [propLabel]: value };
    });
  }

  function buildDoughnutChartData(): void {
    const chartData: number[] = [];
    const chartLabels: string[] = [];

    data?.forEach((category: TCategoryItem) => {
      getCategoryTotal(category, items as TItem[]) &&
        chartData.push(getCategoryTotal(category, items as TItem[]) ?? 0);
      getCategoryTotal(category, items as TItem[]) &&
        chartLabels.push(category.label);
    });

    setDoughnutChartData(chartData);
    setDoughnutChartLabels(chartLabels);
  }

  function getTotal(type: TItemType): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (
        item.month_id === filters.month.id &&
        Number(item.year) === Number(filters.year) &&
        item.type === type
      )
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

  function filteredData(): TCategoryItem[] {
    return data?.sort(
      (a: TCategoryItem, b: TCategoryItem) =>
        b.subcategories.length - a.subcategories.length,
    ) as TCategoryItem[];
  }

  function graphTooltipLabel(context: IDoughnutChartTooltip): string {
    return ` €${context?.formattedValue}`;
  }

  const title = (
    <span className="text-black text-[2em] mobile:text-2xl mobile:text-center">
      {t("summary")}
    </span>
  );

  const inputs = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 2 }}>
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
      <Grid size={{ xs: 12, md: 3 }}>
        <Autocomplete
          value={filters.month}
          onChange={(value: IAutocompleteValue) =>
            onFiltersChange("month", value)
          }
          data={_MONTHS}
          showAllOptions
          alignTextToCenter
          noShadow
        />
      </Grid>
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
    <div className="flex flex-row items-center gap-5">
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
    <div className="flex flex-col gap-10 h-full">
      {inputs}
      <div className="flex items-center gap-20 mobile:flex-col mobile:gap-5">
        <div className="flex items-center gap-10">
          {incomingsLabel}
          <div className="h-[10vh] bg-lightgray w-[1px] rounded-full" />
          {exitsLabel}
        </div>
        {progressLabel}
      </div>
    </div>
  );

  const doghnutChart = isData && (
    <div className="flex w-full mobile:justify-center">
      <div className="w-60 h-60 mobile:w-40 mobile:h-40">
        <DoughnutChart
          data={elabDoughnutChartData}
          labels={doughnutChartLabels}
          customTooltipLabel={graphTooltipLabel}
        />
      </div>
    </div>
  );

  const LeftToSpend: FC = () => {
    function getLeftToSpend(): number {
      let leftToSpend: number = 0;
      leftToSpend = goal - getTotal("exit");

      return leftToSpend;
    }

    const leftToSpend: number = getLeftToSpend();

    function getLeftToSpendType(): TLeftToSpendType {
      return leftToSpend > 100
        ? "positive"
        : leftToSpend > 0
          ? "neutral"
          : "negative";
    }

    const isPositive: boolean = getLeftToSpendType() === "positive";
    const isNeutral: boolean = getLeftToSpendType() === "neutral";
    const isNegative: boolean = getLeftToSpendType() === "negative";

    function getLeftToSpendColor(): TLeftToSpendColor {
      return isPositive
        ? "text-success-popup"
        : isNeutral
          ? "text-warning-popup"
          : "text-error-popup";
    }

    const icon = (
      <div>
        {isPositive && (
          <span
            className={`text-[3em] mobile:text-xl ${getLeftToSpendColor()}`}
          >
            🤑
          </span>
        )}
        {isNeutral && (
          <span
            className={`text-[3em] mobile:text-xl ${getLeftToSpendColor()}`}
          >
            🫤
          </span>
        )}
        {isNegative && (
          <span
            className={`text-[3em] mobile:text-xl ${getLeftToSpendColor()}`}
          >
            🥵
          </span>
        )}
      </div>
    );

    const leftToSpendLabel: string =
      leftToSpend > 0 ? "youCanStillSpend" : "youHaveAlreadyCrossedThreshold";

    const leftToSpendValue = (
      <span className={`text-xl ml-2 font-bold ${getLeftToSpendColor()}`}>
        €{leftToSpend}
      </span>
    );

    return (
      <div className="mobile:flex mobile:justify-center mobile:items-center mobile:w-full">
        <ShadowBox
          noBorder
          noShadow
          borderRadius={20}
          className="p-2 px-5 flex items-center gap-2 bg-lightgray"
        >
          {icon}
          <div className="flex flex-col gap-2">
            <span className="text-lg text-black">
              {t(leftToSpendLabel)}
              {leftToSpend !== 0 && leftToSpendValue}!
            </span>
            {!isMobile && (
              <span className="text-lg text-darkgray">
                {t("continueMonitorExpenses")}
              </span>
            )}
          </div>
        </ShadowBox>
      </div>
    );
  };

  const header = (
    <div className="flex flex-col gap-5">
      {title}
      <Grid container rowSpacing={isMobile ? 2 : 0}>
        <Grid size={{ xs: 12, md: 8 }}>{labels}</Grid>
        <Grid size={{ xs: 12, md: 4 }}>{doghnutChart}</Grid>
      </Grid>
      {isLeftToSpendShown && <LeftToSpend />}
    </div>
  );

  const exits = (
    <Grid container spacing={2}>
      {filteredData()?.map((category: TCategoryItem, index: number) => {
        const isCategoryVisible: boolean =
          getCategoryTotal(category, items as TItem[]) > 0;

        const categoryTitle = (
          <span className="text-black text-xl">{category.label}</span>
        );

        const categoryTotal = (
          <span className="text-darkgray text-xl">{`€ ${getCategoryTotal(category, items as TItem[])}`}</span>
        );

        const categoryHeader = (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExpenseIcon className="text-primary text-xl" />
              {categoryTitle}
            </div>
            {categoryTotal}
          </div>
        );

        const subcategories = (
          <div className="flex flex-col gap-2">
            {category?.subcategories?.map(
              (subcategory: TSubcategory, index2: number) => {
                const itemsTotal: number = getSubcategoryTotal(
                  subcategory,
                  items as TItem[],
                );
                const itemsTotalString: string = `€ ${itemsTotal}`.replaceAll(
                  "-",
                  "",
                );
                const isItemVisible: boolean = itemsTotal !== 0;

                const subcategoryLabel = (
                  <span className="text-darkgray">{subcategory.label}</span>
                );

                const subcategoryValue = (
                  <span className="text-wrap text-blue">
                    {itemsTotalString}
                  </span>
                );

                return (
                  isItemVisible && (
                    <ShadowBox
                      key={index2}
                      className="flex justify-between px-5 py-2 bg-lightgray"
                      noBorder
                      noShadow
                    >
                      {subcategoryLabel}
                      {subcategoryValue}
                    </ShadowBox>
                  )
                );
              },
            )}
          </div>
        );

        return (
          isCategoryVisible && (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <ShadowBox
                className="py-5 px-10 flex flex-col gap-5"
                borderRadius={20}
              >
                {categoryHeader}
                <div className="w-full h-[1px] bg-lightgray" />
                {subcategories}
              </ShadowBox>
            </Grid>
          )
        );
      })}
    </Grid>
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  useEffect(() => {
    data && data.length > 0 && buildDoughnutChartData();

    // eslint-disable-next-line
  }, [data, filters.year, filters.month]);

  useEffect(() => {
    const CURRENT_MONTH: number = new Date().getMonth() + 1;

    if (
      CURRENT_YEAR === Number(filters.year) &&
      CURRENT_MONTH === filters.month.id
    )
      setIsSamePeriod(true);
    else setIsSamePeriod(false);

    // eslint-disable-next-line
  }, [filters.month, filters.year]);

  return (
    <div className="flex flex-col gap-10">
      {header}
      {exits}
    </div>
  );
};

export default Summary;
