import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router";

// Api
import { CATEGORY_API, ITEM_API, SUB_CATEGORY_API } from "../api";

// Assets
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  EuroIcon,
  ExitIcon,
  IncomeIcon,
  SearchIcon,
} from "../assets/icons";
import { MONTHS } from "../assets";
import {
  DEFAULT_DARK_BORDER_COLOR,
  DEFAULT_LIGHT_BORDER_COLOR,
} from "../assets/constants";

// Components
import {
  Autocomplete,
  GoBackButton,
  Input,
  Modal,
  ShadowBox,
} from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Types
import {
  TCategory,
  THTTPResponse,
  TItem,
  TItemType,
  TSubcategory,
} from "../types";
import { IAutocompleteValue } from "../components/Autocomplete.component";

// Utils
import { setPageTitle } from "../utils";

interface IFormData {
  value: number;
  type: TItemType;
  month: IAutocompleteValue | null;
  year: number;
}

const Home: FC = () => {
  const { t } = useTranslation();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [categories, setCategories] = useState<TCategory[] | null>(null);
  const [subcategories, setSubcategories] = useState<TSubcategory[] | null>(
    null,
  );
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<TSubcategory | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const _MONTHS: IAutocompleteValue[] = MONTHS.map(
    (month: IAutocompleteValue) => {
      return { id: month.id, label: t(month.label) };
    },
  );
  const DEFAULT_MONTH: IAutocompleteValue = _MONTHS.find(
    (month: IAutocompleteValue) => month.id === new Date().getMonth() + 1,
  ) as IAutocompleteValue;
  const CURRENT_YEAR: number = new Date().getFullYear();
  const DEFAULT_FORM_DATA: IFormData = {
    value: 0,
    type: "exit",
    month: DEFAULT_MONTH,
    year: CURRENT_YEAR,
  };
  const [formData, setFormData] = useState<IFormData>(DEFAULT_FORM_DATA);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("");
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const [welcomeModal, setWelcomeModal] = useState<boolean>(false);
  const [isFirstTimeOnWebsite, setIsFirstTimeOnWebsite] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const titleLabel: string = t(
    step === 1 ? "selectACategory" : step === 2 ? "selectASubcategory" : "",
  );
  const isIncomeType: boolean = formData.type === "income";
  const isExitType: boolean = formData.type === "exit";
  const filteredCategories: TCategory[] =
    categories
      ?.filter((element: TCategory) => {
        return element?.label
          ?.toLowerCase()
          .startsWith(categoryFilter?.toLowerCase() as string);
      })
      .sort((a: TCategory, b: TCategory) =>
        (a.label ?? "").localeCompare(b.label ?? ""),
      ) ?? [];
  const filteredSubcategories: TSubcategory[] =
    subcategories
      ?.filter((element: TSubcategory) => {
        return element?.label
          ?.toLowerCase()
          .startsWith(subcategoryFilter?.toLowerCase() as string);
      })
      .sort((a: TSubcategory, b: TSubcategory) =>
        (a.label ?? "").localeCompare(b.label ?? ""),
      ) ?? [];

  setPageTitle(t("home"));

  async function getData(): Promise<void> {
    let doesCategoriesExist: boolean = false;
    let doesSubcategoriesExist: boolean = false;

    await Promise.resolve(CATEGORY_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) {
          setCategories(response.data);
          if (response.data?.length > 0) doesCategoriesExist = true;
        } else openPopup(t("unableLoadCategories"), "error");
      },
    );

    await Promise.resolve(SUB_CATEGORY_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) {
          setSubcategories(response.data);
          if (response.data?.length > 0) doesSubcategoriesExist = true;
        } else openPopup(t("unableLoadSubcategories"), "error");
      },
    );

    !doesCategoriesExist &&
      !doesSubcategoriesExist &&
      setIsFirstTimeOnWebsite(true);

    setIsLoading(false);
  }

  function onCategoryClick(category: TCategory): void {
    setSelectedCategory(category);
    setStep(step + 1);
  }

  function onSubcategoryClick(subcategory: TSubcategory): void {
    setSelectedSubcategory(subcategory);
    setModal(true);
  }

  function onFormDataChange(propLabel: keyof IFormData, value: any): void {
    setFormData((prevState: IFormData) => {
      return { ...prevState, [propLabel]: value };
    });
  }

  function resetFilterHandler(): void {
    step === 1 ? setCategoryFilter("") : step === 2 && setSubcategoryFilter("");
  }

  async function onItemKeyUp(event: any): Promise<void> {
    if (event.key === "Enter") await onSubmit();
  }

  async function onSubmit(): Promise<void> {
    if (formData.value && formData.value > 0) {
      if (formData.year <= CURRENT_YEAR) {
        const payload: Partial<TItem> = {
          month_id: (formData.month as IAutocompleteValue).id as number,
          type: formData.type,
          value: formData.value,
          user_id: userData?.id,
          category_id: (selectedCategory as TCategory).id as string,
          sub_category_id: (selectedSubcategory as TSubcategory).id as string,
          year: formData.year,
          date: new Date(),
        };

        await Promise.resolve(ITEM_API.create(payload)).then(
          async (response: THTTPResponse) => {
            if (response && response.hasSuccess) {
              openPopup(t("itemSuccessfullyAdded"), "success");
              setFormData({ ...DEFAULT_FORM_DATA, month: formData.month });
            } else openPopup(t("unableAddItem"), "error");
          },
        );

        setStep(1);
        setModal(false);
      } else openPopup(t("insertValidYear"), "warning");
    } else openPopup(t("insertItem"), "warning");
  }

  const title = (
    <span
      className={`text-[2.5em] mobile:text-2xl transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
    >
      {titleLabel}
    </span>
  );

  const categoryFilterComponent = categories && categories.length > 0 && (
    <Input
      placeholder={t("searchForCategory")}
      type="text"
      value={categoryFilter}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setCategoryFilter(event.target.value)
      }
      className="w-full"
      startIcon={<SearchIcon className="text-darkgray text-3xl" />}
      noShadow={!isLightMode}
      endIcon={
        <div
          onClick={resetFilterHandler}
          className={`flex items-center justify-center p-2 rounded-full cursor-pointer hover:opacity-50 transition-all duration-300 ${isLightMode ? "bg-lightgray" : "bg-darkgray2"}`}
        >
          <CloseIcon
            className={`transition-all duration-300 text-2xl ${isLightMode ? "text-darkgray" : "text-lightgray"}`}
          />
        </div>
      }
    />
  );

  const subcategoryFilterComponent = subcategories &&
    subcategories.length > 0 && (
      <Input
        placeholder={t("searchForSubcategory")}
        type="text"
        value={subcategoryFilter}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setSubcategoryFilter(event.target.value)
        }
        className="w-full"
        startIcon={<SearchIcon className="text-darkgray text-3xl" />}
        noShadow={!isLightMode}
        endIcon={
          <div
            onClick={resetFilterHandler}
            className={`flex items-center justify-center p-2 rounded-full cursor-pointer hover:opacity-50 transition-all duration-300 ${isLightMode ? "bg-lightgray" : "bg-darkgray2"}`}
          >
            <CloseIcon
              className={`transition-all duration-300 text-2xl ${isLightMode ? "text-darkgray" : "text-lightgray"}`}
            />
          </div>
        }
      />
    );

  const step1Component = (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      {categories && categories.length > 0 ? (
        filteredCategories?.map((category: TCategory, index: number) => {
          return (
            <Grid key={index} size={{ xs: 12, md: 3 }}>
              <ShadowBox
                onClick={() => onCategoryClick(category)}
                className="p-2 flex justify-center items-center cursor-pointer hover:opacity-50"
                noShadow
                borderColor="#3Bcc3d"
              >
                <span
                  className={`text-lg transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
                >
                  {category.label}
                </span>
              </ShadowBox>
            </Grid>
          );
        })
      ) : (
        <div className="flex flex-col gap-2">
          <span
            className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
          >
            {t("noCategoriesMessage")}
          </span>
          <span
            onClick={() => navigate("/categories/new")}
            className={`underline cursor-pointer w-fit transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
          >
            {t("createCategory")}
          </span>
        </div>
      )}
    </Grid>
  );

  const step2Component = (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      {subcategories && subcategories.length > 0 ? (
        filteredSubcategories?.map(
          (subcategory: TSubcategory, index: number) => {
            return (
              subcategory.category_id === selectedCategory?.id && (
                <Grid key={index} size={{ xs: 12, md: 3 }}>
                  <ShadowBox
                    onClick={() => onSubcategoryClick(subcategory)}
                    className="p-2 flex justify-center items-center cursor-pointer hover:opacity-50"
                    noShadow
                    borderColor="#3Bcc3d"
                  >
                    <span
                      className={`text-lg transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
                    >
                      {subcategory.label}
                    </span>
                  </ShadowBox>
                </Grid>
              )
            );
          },
        )
      ) : (
        <div className="flex flex-col gap-2">
          <span
            className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
          >
            {t("noSubcategoriesMessage")}
          </span>
          <span
            onClick={() => navigate("/subcategories/new")}
            className={`underline cursor-pointer w-fit transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
          >
            {t("createSubcategory")}
          </span>
        </div>
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
      className="mobile:mt-10"
    >
      <div className="flex flex-col gap-5">
        <span
          className={`text-base transition-all duration-300 ${isLightMode ? "text-darkgray" : "text-gray"}`}
        >
          {t("addItemDescription")}
        </span>
        <Input
          type="number"
          value={formData.year}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFormDataChange("year", event.target.value)
          }
          inputMode="numeric"
          startIcon={<CalendarIcon className="text-darkgray text-xl" />}
          noShadow
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
          noFullOptionsWidth
          startIcon={<ClockIcon className="text-darkgray text-2xl" />}
          noShadow
        />
        <Input
          autoFocus
          type="number"
          placeholder={t("addItem")}
          value={formData.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFormDataChange("value", event.target.value)
          }
          inputMode="numeric"
          onKeyUp={onItemKeyUp}
          startIcon={<EuroIcon className="text-darkgray text-2xl" />}
          noShadow
        />
        <div className="flex items-center gap-5 justify-between">
          <ShadowBox
            borderColor={
              isLightMode
                ? DEFAULT_LIGHT_BORDER_COLOR
                : DEFAULT_DARK_BORDER_COLOR
            }
            onClick={() => onFormDataChange("type", "income")}
            className={`p-2 px-10 mobile:px-5 w-full justify-center flex items-center gap-5 transition-all duration-300 ${
              isIncomeType
                ? "cursor-default opacity-70 bg-success-popup"
                : "hover:opacity-50 cursor-pointer"
            }`}
            noShadow
          >
            <IncomeIcon
              className={`text-[3em] mobile:text-[2em] ${isIncomeType ? "text-primary" : "text-gray"}`}
            />
            <span
              className={`transition-all duration-300 ${isIncomeType ? "text-white" : "text-gray"}`}
            >
              {t("income")}
            </span>
          </ShadowBox>
          <ShadowBox
            borderColor={
              isLightMode
                ? DEFAULT_LIGHT_BORDER_COLOR
                : DEFAULT_DARK_BORDER_COLOR
            }
            onClick={() => onFormDataChange("type", "exit")}
            className={`p-2 px-10 mobile:px-5 w-full justify-center flex items-center gap-5 transition-all duration-300 ${
              isExitType
                ? "cursor-default opacity-70 bg-error-popup"
                : "hover:opacity-50  cursor-pointer"
            }`}
            noShadow
          >
            <ExitIcon
              className={`text-[3em] mobile:text-[2em] ${isExitType ? "text-primary-red" : "text-gray"}`}
            />
            <span
              className={`transition-all duration-300 ${isExitType ? "text-white" : "text-gray"}`}
            >
              {t("exit")}
            </span>
          </ShadowBox>
        </div>
      </div>
    </Modal>
  );

  function welcomeModalHandler(): void {
    setWelcomeModal(false);
    setIsFirstTimeOnWebsite(false);
  }

  const welcomeModalComponent = (
    <Modal
      title={t("welcome")}
      isOpen={welcomeModal}
      onSubmit={welcomeModalHandler}
      onClose={welcomeModalHandler}
      submitButtonText="understood"
      hideSubmitIcon
    >
      <span
        className={`transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
      >
        {t("welcomeMessage")}
      </span>
    </Modal>
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  useEffect(() => {
    if (isFirstTimeOnWebsite) setWelcomeModal(true);
  }, [isFirstTimeOnWebsite]);

  return (
    <>
      <div className="flex flex-col gap-5 justify-center items-center">
        {!isFirstTimeOnWebsite && (
          <div className="flex items-center gap-5">
            {step !== 1 && <GoBackButton onGoBack={() => setStep(step - 1)} />}
            {title}
          </div>
        )}
        {!isFirstTimeOnWebsite && (
          <div className="w-full flex flex-col gap-5 justify-center items-center px-80 mobile:px-0">
            <div className="flex justify-between gap-5 w-full">
              {step === 1
                ? categoryFilterComponent
                : step === 2 && subcategoryFilterComponent}
            </div>
            {step === 1 ? step1Component : step === 2 && step2Component}
          </div>
        )}
      </div>
      {modalComponent}
      {welcomeModalComponent}
    </>
  );
};

export default Home;
