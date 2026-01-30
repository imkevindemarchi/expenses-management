import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

// Api
import { CATEGORY_API, ITEM_API, SETTING_API, SUB_CATEGORY_API } from "../api";

// Assets
import { MONTHS } from "../assets";
import { HappyIcon, NeutralIcon, SadIcon } from "../assets/icons";

// Components
import {
  Autocomplete,
  DoughnutChart,
  Input,
  LiquidGlass,
  ProgressBar,
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
  TSubCategory,
} from "../types";
import { IAutocompleteValue } from "../components/Autocomplete.component";
import { TDoughnutChartData } from "../components/DoughnutChart.component";

interface IFilters {
  month: IAutocompleteValue;
  year: number;
}

type TSubCategoryItem = TSubCategory & { items: TItem[]; total: number };

type TCategoryItem = TCategory & {
  subCategories: TSubCategoryItem[];
  total: number;
};

type TLeftToSpendType = "positive" | "neutral" | "negative";

type TLeftToSpendColor = "text-exits" | "text-green" | "text-neutral";

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

  const title = t("summary");

  function getSubCategoryTotal(
    subCategory: TSubCategory,
    items: TItem[],
  ): number {
    let total: number = 0;

    items?.forEach((item: TItem) => {
      if (
        item.sub_category_id === subCategory.id &&
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
      const subCategoriesRes = response[1];
      const itemsRes = response[2];
      const settingsRes = response[3];

      if (
        categoriesRes &&
        categoriesRes.hasSuccess &&
        subCategoriesRes &&
        subCategoriesRes.hasSuccess &&
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
            const subCategories: TSubCategoryItem[] = [];
            subCategoriesRes?.data?.forEach((subCategory: TSubCategory) => {
              const items: TItem[] = [];
              itemsRes?.data?.forEach((item: TItem) => {
                item.category_id === category.id &&
                  item.sub_category_id === subCategory.id &&
                  items.push(item);
              });
              const subCategoryTotal: number = getSubCategoryTotal(
                subCategory,
                items,
              );

              subCategory.category_id === category.id &&
                subCategories.push({
                  ...subCategory,
                  items,
                  total: subCategoryTotal,
                });
            });

            return { ...category, subCategories, total: categoryTotal };
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
        chartData.push(category?.total ?? 0);
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
      (a: TCategoryItem, b: TCategoryItem) => b.total - a.total,
    ) as TCategoryItem[];
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

  const LeftToSpend: FC = () => {
    function getLeftToSpend(): number {
      let leftToSpend: number = 0;
      leftToSpend = goal - getTotal("exit");

      return leftToSpend;
    }

    function getLeftToSpendType(): TLeftToSpendType {
      return getLeftToSpend() > 100
        ? "positive"
        : getLeftToSpend() > 0
          ? "neutral"
          : "negative";
    }

    const isPositive: boolean = getLeftToSpendType() === "positive";
    const isNeutral: boolean = getLeftToSpendType() === "neutral";
    const isNegative: boolean = getLeftToSpendType() === "negative";

    function getLeftToSpendColor(): TLeftToSpendColor {
      return isPositive
        ? "text-green"
        : isNeutral
          ? "text-neutral"
          : "text-exits";
    }

    function getLeftToSpendLabel(): string {
      const leftToSpend: number = getLeftToSpend();

      return leftToSpend > 0
        ? `${t("leftToSpend")}: €${leftToSpend}`
        : t("youHaveAlreadyCrossedThreshold");
    }

    return (
      <div className="mobile:flex mobile:justify-center mobile:items-center mobile:w-full">
        <LiquidGlass
          backgroundColor="rgba(0, 0, 0, 0.5)"
          className="p-2 pr-5 flex items-center gap-5"
        >
          {isPositive && (
            <HappyIcon className={`text-[3em] ${getLeftToSpendColor()}`} />
          )}
          {isNeutral && (
            <NeutralIcon className={`text-[3em] ${getLeftToSpendColor()}`} />
          )}
          {isNegative && (
            <SadIcon className={`text-[3em] ${getLeftToSpendColor()}`} />
          )}
          <span className={`text-xl mobile:text-lg ${getLeftToSpendColor()}`}>
            {getLeftToSpendLabel()}
          </span>
        </LiquidGlass>
      </div>
    );
  };

  const leftToSpend = (
    <div className="flex flex-row items-center gap-2">
      <LeftToSpend />
    </div>
  );

  const progressBar = getTotal("exit") !== 0 && (
    <div className="flex flex-row items-center gap-5 mobile:flex-col">
      <span className="text-white">{t("percentageOfRevenueSpent")}</span>
      <ProgressBar progress={calculateProgress()} />
      <span className="text-white text-3xl">
        {calculateProgress().toFixed(0)}%
      </span>
    </div>
  );

  const doghnutChart = isData && (
    <div className="flex w-full mobile:justify-center">
      <LiquidGlass
        hasBlur={false}
        className="w-full p-10 w-9h-96 h-96 flex justify-center mobile:h-full mobile:w-full"
      >
        <DoughnutChart
          data={elabDoughnutChartData}
          labels={doughnutChartLabels}
        />
      </LiquidGlass>
    </div>
  );

  const exits = (
    <Grid container spacing={2}>
      {filteredData()?.map((category: TCategoryItem, index: number) => {
        const isCategoryVisible: boolean =
          getCategoryTotal(category, items as TItem[]) > 0;

        return (
          isCategoryVisible && (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-center gap-2">
                  <LiquidGlass
                    borderRadius={10}
                    backgroundColor="rgba(0, 0, 0, 0.5)"
                    className="w-full flex justify-center items-center px-5 py-2"
                  >
                    <span className="text-white font-bold uppercase">
                      {`${category.label} (`}
                      <span className="text-exits">{`€${getCategoryTotal(category, items as TItem[])}`}</span>
                      )
                    </span>
                  </LiquidGlass>
                </div>
                <LiquidGlass
                  borderRadius={20}
                  className="p-10 flex flex-col gap-2"
                >
                  {category?.subCategories?.map(
                    (subCategory: TSubCategory, index2: number) => {
                      const itemsTotal: number = getSubCategoryTotal(
                        subCategory,
                        items as TItem[],
                      );
                      const itemsTotalString: string =
                        `€${itemsTotal}`.replaceAll("-", "");
                      const isItemVisible: boolean = itemsTotal !== 0;

                      return (
                        isItemVisible && (
                          <LiquidGlass
                            key={index2}
                            backgroundColor="rgba(0, 0, 0, 0.5)"
                            className="flex justify-between px-5 py-2"
                          >
                            <span className="text-white">
                              {subCategory.label}
                            </span>
                            <span className="text-wrap font-bold text-white">
                              {itemsTotalString}
                            </span>
                          </LiquidGlass>
                        )
                      );
                    },
                  )}
                </LiquidGlass>
              </div>
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
    <div className="flex flex-col gap-5">
      {header}
      {incomingsTotal}
      {exitsTotal}
      {goal && Number(goal) !== 0 && isSamePeriod ? leftToSpend : null}
      {progressBar}
      {doghnutChart}
      {exits}
    </div>
  );
};

export default Summary;
