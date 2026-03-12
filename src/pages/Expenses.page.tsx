import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { Grid } from "@mui/material";

// Api
import { CATEGORY_API, ITEM_API, SUB_CATEGORY_API } from "../api";

// Assets
import { MONTHS } from "../assets";
import {
  CalendarIcon,
  EuroIcon,
  ExitIcon,
  FiltersIcon,
  IncomeIcon,
} from "../assets/icons";
import { isMobile, Z_INDEX } from "../assets/constants";

// Components
import { Button, Input, Modal, ShadowBox, Table } from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Types
import {
  TCategory,
  THTTPResponse,
  TItem,
  TItemType,
  TSubcategory,
} from "../types";
import { IColumn } from "../components/Table.component";
import Autocomplete, {
  IAutocompleteValue,
} from "../components/Autocomplete.component";

// Utils
import { setPageTitle } from "../utils";

interface ITableData {
  from: number;
  to: number;
  total: number;
  page: number;
  subcategory: string;
  year: number;
  type: string;
  month: string;
  value: number;
}

interface IModal {
  show: boolean;
  item: TItem | null;
}

const DEFAULT_DELETE_MODAL: IModal = {
  show: false,
  item: null,
};

const DEFAULT_EDIT_MODAL: IModal = {
  show: false,
  item: null,
};

interface IFormData {
  value: number;
  type: TItemType;
  month: IAutocompleteValue | null;
  year: number;
}

const Expenses: FC = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<TItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams({});
  const TABLE_DEFAULT_STATE: ITableData = {
    from: parseInt(searchParams.get("from") as string) || 0,
    to: parseInt(searchParams.get("to") as string) || 4,
    total: parseInt(searchParams.get("total") as string) || 0,
    page: parseInt(searchParams.get("page") as string) || 1,
    subcategory: searchParams.get("subcategory") || "",
    year: Number(searchParams.get("year")) || new Date().getFullYear(),
    type: searchParams.get("type") || "",
    month: searchParams.get("month") || "",
    value: parseInt(searchParams.get("value") as string) || 0,
  };
  const [table, setTable] = useState<ITableData>(TABLE_DEFAULT_STATE);
  const [deleteModal, setDeleteModal] = useState<IModal>(DEFAULT_DELETE_MODAL);
  const [editModal, setEditModal] = useState<IModal>(DEFAULT_EDIT_MODAL);
  const { state: isLoading, setState: setIsLoading }: TLoaderContext =
    useContext(LoaderContext) as TLoaderContext;
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [formData, setFormData] = useState<IFormData | null>();
  const CURRENT_YEAR: number = new Date().getFullYear();
  const _MONTHS: IAutocompleteValue[] = MONTHS.map(
    (month: IAutocompleteValue) => {
      return { id: month.id, label: t(month.label) };
    },
  );
  const DEFAULT_MONTH: IAutocompleteValue = _MONTHS.find(
    (month: IAutocompleteValue) => month.id === new Date().getMonth() + 1,
  ) as IAutocompleteValue;
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [categories, setCategories] = useState<TCategory[] | null>(null);
  const [subcategries, setSubcategories] = useState<TSubcategory[] | null>(
    null,
  );
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false);
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const talbeColumns: IColumn[] = [
    { key: "type", value: t("type") },
    { key: "date", value: t("creationDate") },
    { key: "month", value: t("month") },
    { key: "year", value: t("year") },
    { key: "category", value: t("category") },
    { key: "subcategory", value: t("subcategory") },
    { key: "value", value: t("value") },
  ];
  const isIncomeType: boolean = formData?.type === "income";
  const isExitType: boolean = formData?.type === "exit";
  const tableType: TItemType | string =
    table?.type === "1" ? "income" : table?.type === "2" ? "exit" : "";

  setPageTitle(t("expenses"));

  async function getData(): Promise<void> {
    setIsLoading(true);

    if (isFirstLoad)
      await Promise.resolve(CATEGORY_API.getAll(userData?.id as string)).then(
        async (categoriesRes: THTTPResponse) => {
          if (categoriesRes && categoriesRes.hasSuccess) {
            await Promise.resolve(
              SUB_CATEGORY_API.getAll(userData?.id as string),
            ).then(async (subcategoriesRes: THTTPResponse) => {
              if (subcategoriesRes && subcategoriesRes.hasSuccess) {
                await Promise.resolve(
                  ITEM_API.getAllWithFilters(
                    table.from,
                    table.to,
                    table.subcategory,
                    table.year,
                    tableType,
                    table.month,
                    table.value,
                    userData?.id as string,
                  ),
                ).then((itemsRes: THTTPResponse) => {
                  if (itemsRes && itemsRes.hasSuccess) {
                    const items: TItem[] = itemsRes.data.map((item: TItem) => {
                      const category: TCategory = categoriesRes.data.find(
                        (category: TCategory) =>
                          category.id === item.category_id,
                      ) as TCategory;
                      const subcategory: TSubcategory =
                        subcategoriesRes.data.find(
                          (subcategory: TSubcategory) =>
                            subcategory.id === item.sub_category_id,
                        ) as TSubcategory;
                      const month = MONTHS.find(
                        (month: IAutocompleteValue) =>
                          month.id === item.month_id,
                      );

                      return {
                        ...item,
                        type: t(item.type),
                        category: category?.label,
                        subcategory: subcategory?.label,
                        month: month?.label,
                      };
                    });
                    setTableData(items);
                    setTable((prevState) => {
                      return {
                        ...prevState,
                        total: itemsRes?.totalRecords as number,
                      };
                    });
                  } else openPopup(t("unableLoadItems"), "error");
                });
                setSubcategories(subcategoriesRes.data);
              } else openPopup(t("unableLoadSubcategories"), "error");
            });
            setCategories(categoriesRes.data);
          } else openPopup(t("unableLoadCategories"), "error");
        },
      );
    else
      await Promise.resolve(
        ITEM_API.getAllWithFilters(
          table.from,
          table.to,
          table.subcategory,
          table.year,
          tableType,
          table.month,
          table.value,
          userData?.id as string,
        ),
      ).then((itemsRes: THTTPResponse) => {
        if (itemsRes && itemsRes.hasSuccess) {
          const items: any[] = itemsRes.data.map((item: TItem) => {
            const category: TCategory = categories?.find(
              (category: TCategory) => category.id === item.category_id,
            ) as TCategory;
            const subcategory: TSubcategory = subcategries?.find(
              (subcategory: TSubcategory) =>
                subcategory.id === item.sub_category_id,
            ) as TSubcategory;
            const month = MONTHS.find(
              (month: IAutocompleteValue) => month.id === item.month_id,
            );

            return {
              ...item,
              type: t(item.type),
              category: category?.label,
              subcategory: subcategory?.label,
              month: month?.label,
            };
          });
          setTableData(items);
          setTable((prevState) => {
            return {
              ...prevState,
              total: itemsRes?.totalRecords as number,
            };
          });
        } else openPopup(t("unableLoadItems"), "error");
      });

    setIsLoading(false);
  }

  async function onTableGoPreviousPage(): Promise<void> {
    setTable((prevState) => {
      return {
        ...prevState,
        page: table.page - 1,
        from: table.from - 5,
        to: table.to - 5,
      };
    });
  }

  async function onTableGoNextPage(): Promise<void> {
    setTable((prevState) => {
      return {
        ...prevState,
        page: table.page + 1,
        from: table.from + 5,
        to: table.to + 5,
      };
    });
  }

  async function onTableDelete(rowData: TItem): Promise<void> {
    setDeleteModal({
      show: true,
      item: rowData,
    });
  }

  async function onDelete(): Promise<void> {
    setDeleteModal(DEFAULT_DELETE_MODAL);
    setIsLoading(true);

    await Promise.resolve(ITEM_API.delete(deleteModal.item?.id as string)).then(
      async (itemRes: THTTPResponse) => {
        if (itemRes && itemRes.hasSuccess) {
          openPopup(t("itemSuccessfullyDeleted"), "success");
          getData();
        } else openPopup(t("unableDeleteItem"), "error");
      },
    );

    setIsLoading(false);
  }

  function onTableRowClick(rowData: TItem): void {
    setEditModal({ show: true, item: rowData });
  }

  async function onEdit(): Promise<void> {
    if (formData?.value && formData?.value > 0) {
      if (formData?.year <= CURRENT_YEAR) {
        const payload: Partial<TItem> = {
          month_id: (formData?.month as IAutocompleteValue).id as number,
          type: formData?.type,
          value: formData?.value,
          user_id: userData?.id,
          category_id: editModal.item?.category_id,
          sub_category_id: editModal.item?.sub_category_id,
          year: formData.year,
        };

        await Promise.resolve(
          ITEM_API.update(payload, editModal.item?.id as string),
        ).then(async (response: THTTPResponse) => {
          if (response && response.hasSuccess) {
            setEditModal(DEFAULT_EDIT_MODAL);
            openPopup(t("itemSuccessfullyUpdated"), "success");
            setFormData(null);
            await getData();
          } else openPopup(t("unableUpdateVoice"), "error");
        });
      } else openPopup(t("insertValidYear"), "warning");
    } else openPopup(t("insertItem"), "warning");

    setIsLoading(false);
  }

  function onFormDataChange(propLabel: keyof IFormData, value: any): void {
    setFormData((prevState: any) => {
      return { ...prevState, [propLabel]: value };
    });
  }

  async function onItemKeyUp(event: any): Promise<void> {
    if (event.key === "Enter") await onEdit();
  }

  function getAutocompleteSubcategories(): IAutocompleteValue[] {
    return (
      subcategries?.map((subcategory: TSubcategory) => {
        const category: TCategory = categories?.find(
          (category: TCategory) => category.id === subcategory.category_id,
        ) as TCategory;

        return {
          id: subcategory.id,
          label: `${subcategory.label} (${category.label})`,
        };
      }) ?? []
    );
  }

  function getAutocompleteMonths(): IAutocompleteValue[] {
    return (
      MONTHS?.map((month: IAutocompleteValue) => {
        return { id: month.id, label: t(month.label) };
      }) ?? []
    );
  }

  function getSelectedSubcategory(): IAutocompleteValue {
    return getAutocompleteSubcategories().find(
      (subcategory: IAutocompleteValue) => subcategory.id === table.subcategory,
    ) as IAutocompleteValue;
  }

  function getSelectedMonth(): IAutocompleteValue {
    return getAutocompleteMonths().find(
      (month: IAutocompleteValue) =>
        month.id?.toString() === table.month.toString(),
    ) as IAutocompleteValue;
  }

  async function onResetFilters(): Promise<void> {
    setTable({
      ...table,
      subcategory: "",
      year: new Date().getFullYear(),
      type: "",
      month: "",
      value: 0,
    });
  }

  const title = (
    <span
      className={`text-[2em] mobile:text-2xl mobile:text-center transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
    >
      {t("expenses")}
    </span>
  );

  const filters = (
    <div className="w-full flex justify-start">
      <ShadowBox
        onClick={() => setIsFiltersModalOpen(true)}
        className={`flex items-center gap-5 px-5 w-fit p-2 hover:opacity-50 cursor-pointer ${isLightMode ? "bg-lightgray" : "bg-darkgray2"}`}
        noShadow
      >
        <FiltersIcon
          className={`text-xl transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
        />
        <span
          className={`transition-all duration-300 ${isLightMode ? "text-darkgray" : "text-gray"}`}
        >
          {t("openFilters")}
        </span>
      </ShadowBox>
    </div>
  );

  const tableComponent = (
    <div className="min-w-[30%] mobile:w-full">
      <Table
        data={tableData}
        columns={talbeColumns}
        total={table.total}
        onGoPreviousPage={onTableGoPreviousPage}
        onGoNextPage={onTableGoNextPage}
        info={table}
        isLoading={isLoading}
        onDelete={onTableDelete}
        onRowClick={onTableRowClick}
      />
    </div>
  );

  const deleteModalComponent = (
    <Modal
      isOpen={deleteModal.show}
      title={t("deleteItem")}
      onCancel={() => setDeleteModal(DEFAULT_DELETE_MODAL)}
      onSubmit={onDelete}
      cancelButtonText="no"
      submitButtonText="yes"
    >
      <span
        className={`opacity-80 transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
      >
        {t("confirmToDeleteVoice")}
      </span>
    </Modal>
  );

  const editModalComponent = (
    <Modal
      title={t("editItem")}
      isOpen={editModal.show}
      onCancel={() => setEditModal(DEFAULT_EDIT_MODAL)}
      onSubmit={onEdit}
      className="mobile:mt-10"
    >
      <div className="flex flex-col gap-5">
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
          noShadow
        />
        <Input
          autoFocus
          type="number"
          placeholder={t("addItem")}
          value={formData?.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFormDataChange("value", event.target.value)
          }
          inputMode="numeric"
          onKeyUp={onItemKeyUp}
          noShadow
        />
        <Input
          type="number"
          value={formData?.year}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFormDataChange("year", event.target.value)
          }
          inputMode="numeric"
          noShadow
        />
        <div className="flex items-center gap-5 justify-between">
          <ShadowBox
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

  const filtersModalComponent = (
    <Modal
      title={t("filters")}
      isOpen={isFiltersModalOpen}
      onClose={() => setIsFiltersModalOpen(false)}
      onCancel={onResetFilters}
      cancelButtonText="cancelFilters"
      onSubmit={async () => {
        await getData();
        setIsFiltersModalOpen(false);
      }}
      submitButtonText="applyFilters"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-5 mobile:gap-2 mobile:justify-between">
          <Button
            text={t("incomings")}
            className={`w-full ${tableType === "income" ? "bg-success-popup" : isLightMode ? "bg-gray" : "bg-darkgray2"}`}
            onClick={() =>
              setTable((prevState: any) => {
                return { ...prevState, type: "1" };
              })
            }
            readOnly={tableType === "income"}
          />
          <Button
            text={t("exits")}
            className={`w-full ${tableType === "exit" ? "bg-error-popup" : isLightMode ? "bg-gray" : "bg-darkgray2"}`}
            onClick={() =>
              setTable((prevState: any) => {
                return { ...prevState, type: "2" };
              })
            }
            readOnly={tableType === "exit"}
          />
          <Button
            text={t("all")}
            className={`w-full ${tableType === "" ? "bg-warning-popup" : isLightMode ? "bg-gray" : "bg-darkgray2"}`}
            onClick={() =>
              setTable((prevState: any) => {
                return { ...prevState, type: "" };
              })
            }
            readOnly={tableType === ""}
          />
        </div>
        <Grid
          container
          className="w-full"
          columnSpacing={5}
          rowSpacing={isMobile ? 2 : 0}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              placeholder={t("searchForSubcategory")}
              value={getSelectedSubcategory()}
              onChange={(value: IAutocompleteValue) =>
                setTable((prevState: any) => {
                  return { ...prevState, subcategory: value.id };
                })
              }
              data={getAutocompleteSubcategories()}
              noFullOptionsWidth
              zIndex={Z_INDEX.AUTOCOMPLETE + 10}
              noShadow
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Input
              value={table.year}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                event.target.value.length <= 4 &&
                setTable((prevState: any) => {
                  return {
                    ...prevState,
                    year: Number(event.target.value),
                  };
                })
              }
              startIcon={<CalendarIcon className="text-darkgray text-lg" />}
              noShadow
            />
          </Grid>
        </Grid>
        <Grid
          container
          className="w-full"
          columnSpacing={5}
          rowSpacing={isMobile ? 2 : 0}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              placeholder={t("searchForMonth")}
              value={getSelectedMonth()}
              onChange={(value: IAutocompleteValue) =>
                setTable((prevState: any) => {
                  return { ...prevState, month: value.id?.toString() };
                })
              }
              data={getAutocompleteMonths()}
              noFullOptionsWidth
              showAllOptions
              noShadow
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Input
              type="number"
              value={table.value}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                event.target.value.length <= 4 &&
                setTable((prevState: any) => {
                  return {
                    ...prevState,
                    value: Number(event.target.value),
                  };
                })
              }
              startIcon={<EuroIcon className="text-darkgray text-lg" />}
              noShadow
            />
          </Grid>
        </Grid>
      </div>
    </Modal>
  );

  useEffect(() => {
    if (userData?.id) {
      getData();
      setIsFirstLoad(false);
    }

    // eslint-disable-next-line
  }, [table.from, table.to, userData?.id]);

  useEffect(() => {
    setSearchParams({
      from: table.from,
      to: table.to,
      page: table.page,
      subcategory: table.subcategory,
      year: table.year,
      type: table.type,
      month: table.month,
    } as any);

    // eslint-disable-next-line
  }, [
    table.from,
    table.to,
    table.page,
    table.subcategory,
    table.year,
    table.type,
    table.month,
  ]);

  useEffect(() => {
    if (editModal.item) {
      const month: IAutocompleteValue = _MONTHS.find(
        (month: IAutocompleteValue) => month.id === editModal.item?.month_id,
      ) as IAutocompleteValue;

      setFormData({
        month,
        type: editModal.item.type === t("exit") ? "exit" : "income",
        value: editModal.item.value,
        year: editModal.item.year,
      });
    }

    // eslint-disable-next-line
  }, [editModal.item]);

  return (
    <>
      <div className="flex flex-col gap-5 justify-center items-center">
        {title}
        {filters}
        {tableComponent}
      </div>
      {deleteModalComponent}
      {editModalComponent}
      {filtersModalComponent}
    </>
  );
};

export default Expenses;
