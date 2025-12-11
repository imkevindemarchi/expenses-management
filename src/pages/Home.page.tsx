import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

// Api
import { CATEGORY_API, ITEM_API, SUB_CATEGORY_API } from "../api";

// Assets
import { CloseIcon, ExitIcon, IncomeIcon } from "../assets/icons";
import { MONTHS } from "../assets";

// Components
import {
  Autocomplete,
  GoBackButton,
  Input,
  LiquidGlass,
  Modal,
} from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";

// Types
import {
  TCategory,
  THTTPResponse,
  TItem,
  TItemType,
  TSubCategory,
} from "../types";
import { IAutocompleteValue } from "../components/Autocomplete.component";

// Utils
import { setPageTitle } from "../utils";

interface IFormData {
  value: number;
  type: TItemType;
  month: IAutocompleteValue | null;
}

const Home: FC = () => {
  const { t } = useTranslation();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [categories, setCategories] = useState<TCategory[] | null>(null);
  const [subCategories, setSubCategories] = useState<TSubCategory[] | null>(
    null
  );
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<TSubCategory | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const _MONTHS: IAutocompleteValue[] = MONTHS.map(
    (month: IAutocompleteValue) => {
      return { id: month.id, label: t(month.label) };
    }
  );
  const DEFAULT_MONTH: IAutocompleteValue = _MONTHS.find(
    (month: IAutocompleteValue) => month.id === new Date().getMonth() + 1
  ) as IAutocompleteValue;
  const DEFAULT_FORM_DATA: IFormData = {
    value: 0,
    type: "exit",
    month: DEFAULT_MONTH,
  };
  const [formData, setFormData] = useState<IFormData>(DEFAULT_FORM_DATA);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("");

  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;

  const title: string = t(
    step === 1
      ? "selectACategoryToProceed"
      : step === 2
      ? "selectASubCategoryToProceed"
      : ""
  );
  const isIncomeType: boolean = formData.type === "income";
  const isExitType: boolean = formData.type === "exit";
  const filteredCategories: TCategory[] =
    categories?.filter((element: TCategory) => {
      return element?.label
        ?.toLowerCase()
        .startsWith(categoryFilter?.toLowerCase() as string);
    }) ?? [];
  const filteredSubCategories: TSubCategory[] =
    subCategories?.filter((element: TSubCategory) => {
      return element?.label
        ?.toLowerCase()
        .startsWith(subCategoryFilter?.toLowerCase() as string);
    }) ?? [];

  setPageTitle(t("home"));

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

    setIsLoading(false);
  }

  function onCategoryClick(category: TCategory): void {
    setSelectedCategory(category);
    setStep(step + 1);
  }

  function onSubCategoryClick(subCategory: TSubCategory): void {
    setSelectedSubCategory(subCategory);
    setModal(true);
  }

  function onFormDataChange(propLabel: keyof IFormData, value: any): void {
    setFormData((prevState: IFormData) => {
      return { ...prevState, [propLabel]: value };
    });
  }

  function resetFilterHandler(): void {
    step === 1 ? setCategoryFilter("") : step === 2 && setSubCategoryFilter("");
  }

  async function onSubmit(): Promise<void> {
    if (formData.value && formData.value > 0) {
      const payload: Partial<TItem> = {
        month_id: (formData.month as IAutocompleteValue).id as number,
        type: formData.type,
        value: formData.value,
        user_id: userData?.id,
        category_id: (selectedCategory as TCategory).id as string,
        sub_category_id: (selectedSubCategory as TSubCategory).id as string,
      };

      await Promise.resolve(ITEM_API.create(payload)).then(
        async (response: THTTPResponse) => {
          if (response && response.hasSuccess) {
            openPopup(t("itemSuccessfullyAdded"), "success");
            setFormData({ ...DEFAULT_FORM_DATA, month: formData.month });
          } else openPopup(t("unableAddItem"), "error");
        }
      );
    } else openPopup(t("insertItem"), "warning");
  }

  const categoryFilterComponent = (
    <Input
      placeholder={t("searchForName")}
      type="text"
      value={categoryFilter}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setCategoryFilter(event.target.value)
      }
    />
  );

  const subCategoryFilterComponent = (
    <Input
      placeholder={t("searchForName")}
      type="text"
      value={subCategoryFilter}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setSubCategoryFilter(event.target.value)
      }
    />
  );

  const step1Component = (
    <Grid container spacing={2}>
      {filteredCategories?.map((category: TCategory, index: number) => {
        return (
          <Grid key={index} size={{ xs: 3 }}>
            <LiquidGlass
              onClick={() => onCategoryClick(category)}
              className="p-2 flex justify-center items-center cursor-pointer hover:opacity-50 transition-all duration-300"
            >
              <span className="text-white text-lg">{category.label}</span>
            </LiquidGlass>
          </Grid>
        );
      })}
    </Grid>
  );

  const step2Component = (
    <Grid container spacing={2}>
      {filteredSubCategories?.map(
        (subCategory: TSubCategory, index: number) => {
          return (
            subCategory.category_id === selectedCategory?.id && (
              <Grid key={index} size={{ xs: 3 }}>
                <LiquidGlass
                  onClick={() => onSubCategoryClick(subCategory)}
                  className="p-2 flex justify-center items-center cursor-pointer hover:opacity-50 transition-all duration-300"
                >
                  <span className="text-white text-lg">
                    {subCategory.label}
                  </span>
                </LiquidGlass>
              </Grid>
            )
          );
        }
      )}
    </Grid>
  );

  const modalComponent = (
    <Modal
      title={t("addItem")}
      isOpen={modal}
      onCancel={() => {
        setModal(false);
        setFormData(DEFAULT_FORM_DATA);
      }}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-5">
        <span className="text-white text-base">{t("addItemDescription")}</span>
        <div className="flex items-center gap-5 justify-between">
          <LiquidGlass
            onClick={() => onFormDataChange("type", "income")}
            backgroundColor={isIncomeType ? "rgba(255, 255, 255, 0.5)" : ""}
            className={`p-2 px-10 flex items-center gap-5 transition-all duration-300 ${
              isIncomeType
                ? "cursor-default"
                : "hover:opacity-50 cursor-pointer"
            }`}
          >
            <IncomeIcon className="text-[3em] text-primary" />
            <span className="text-white">{t("income")}</span>
          </LiquidGlass>
          <LiquidGlass
            onClick={() => onFormDataChange("type", "exit")}
            backgroundColor={isExitType ? "rgba(255, 255, 255, 0.5)" : ""}
            className={`p-2 px-10 flex items-center gap-5 transition-all duration-300 ${
              isExitType ? "cursor-default" : "hover:opacity-50 cursor-pointer"
            }`}
          >
            <ExitIcon className="text-[3em] text-red" />
            <span className="text-white">{t("exit")}</span>
          </LiquidGlass>
        </div>
        <Input
          autoFocus
          type="number"
          placeholder={t("addItem")}
          value={formData.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFormDataChange("value", event.target.value)
          }
        />
        <Autocomplete
          autoComplete="current-password"
          placeholder={t("month")}
          value={formData?.month ?? DEFAULT_MONTH}
          onChange={(value: IAutocompleteValue) =>
            onFormDataChange("month", value)
          }
          data={_MONTHS}
          showAllOptions
        />
      </div>
    </Modal>
  );

  useEffect(() => {
    getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <span className="text-white text-lg">{title}</span>
        {step === 2 && <GoBackButton onClick={() => setStep(step - 1)} />}
        <LiquidGlass className="p-20 flex flex-col gap-5">
          <div className="flex justify-between gap-5">
            {step === 1
              ? categoryFilterComponent
              : step === 2 && subCategoryFilterComponent}
            <LiquidGlass
              onClick={resetFilterHandler}
              className="p-3 cursor-pointer hover:opacity-50"
            >
              <CloseIcon className="text-white text-2xl" />
            </LiquidGlass>
          </div>
          {step === 1 ? step1Component : step === 2 && step2Component}
        </LiquidGlass>
      </div>
      {modalComponent}
    </>
  );
};

export default Home;
