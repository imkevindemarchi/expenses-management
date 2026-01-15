import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

// Api
import { CATEGORY_API, ITEM_API, SUB_CATEGORY_API } from "../api";

// Assets
import { MONTHS } from "../assets";
import { ExitIcon, FiltersIcon, IncomeIcon } from "../assets/icons";

// Components
import { Input, LiquidGlass, Modal, Table } from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Types
import {
  TCategory,
  THTTPResponse,
  TItem,
  TItemType,
  TSubCategory,
} from "../types";
import { IColumn } from "../components/Table.component";
import Autocomplete, {
  IAutocompleteValue,
} from "../components/Autocomplete.component";

// Utils
import { setPageTitle } from "../utils";
import { Grid } from "@mui/material";

interface ITableData {
  from: number;
  to: number;
  total: number;
  page: number;
  subCategory: string;
  year: number;
  type: string;
  month: string;
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
    subCategory: searchParams.get("sub-category") || "",
    year: Number(searchParams.get("year")) || new Date().getFullYear(),
    type: searchParams.get("type") || "",
    month: searchParams.get("month") || "",
  };
  const [table, setTable] = useState<ITableData>(TABLE_DEFAULT_STATE);
  const [deleteModal, setDeleteModal] = useState<IModal>(DEFAULT_DELETE_MODAL);
  const [editModal, setEditModal] = useState<IModal>(DEFAULT_EDIT_MODAL);
  const { state: isLoading, setState: setIsLoading }: TLoaderContext =
    useContext(LoaderContext) as TLoaderContext;
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [formData, setFormData] = useState<IFormData | null>();
  const CURRENT_YEAR: number = new Date().getFullYear();
  const _MONTHS: IAutocompleteValue[] = MONTHS.map(
    (month: IAutocompleteValue) => {
      return { id: month.id, label: t(month.label) };
    }
  );
  const DEFAULT_MONTH: IAutocompleteValue = _MONTHS.find(
    (month: IAutocompleteValue) => month.id === new Date().getMonth() + 1
  ) as IAutocompleteValue;
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [categories, setCategories] = useState<TCategory[] | null>(null);
  const [subCategories, setSubCategories] = useState<TSubCategory[] | null>(
    null
  );
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false);

  setPageTitle(t("expenses"));
  const talbeColumns: IColumn[] = [
    { key: "type", value: t("type") },
    { key: "date", value: t("creationDate") },
    { key: "month", value: t("month") },
    { key: "year", value: t("year") },
    { key: "category", value: t("category") },
    { key: "sub-category", value: t("subCategory") },
    { key: "value", value: t("value") },
  ];
  const isIncomeType: boolean = formData?.type === "income";
  const isExitType: boolean = formData?.type === "exit";
  const tableType: TItemType | string =
    table?.type === "1" ? "income" : table?.type === "2" ? "exit" : "";

  async function getData(): Promise<void> {
    setIsLoading(true);

    if (isFirstLoad)
      await Promise.resolve(CATEGORY_API.getAll(userData?.id as string)).then(
        async (categoriesRes: THTTPResponse) => {
          if (categoriesRes && categoriesRes.hasSuccess) {
            await Promise.resolve(
              SUB_CATEGORY_API.getAll(userData?.id as string)
            ).then(async (subCategoriesRes: THTTPResponse) => {
              if (subCategoriesRes && subCategoriesRes.hasSuccess) {
                await Promise.resolve(
                  ITEM_API.getAllWithFilters(
                    table.from,
                    table.to,
                    table.subCategory,
                    table.year,
                    tableType,
                    table.month,
                    userData?.id as string
                  )
                ).then((itemsRes: THTTPResponse) => {
                  if (itemsRes && itemsRes.hasSuccess) {
                    const items: TItem[] = itemsRes.data.map((item: TItem) => {
                      const category: TCategory = categoriesRes.data.find(
                        (category: TCategory) =>
                          category.id === item.category_id
                      ) as TCategory;
                      const subCategory: TSubCategory =
                        subCategoriesRes.data.find(
                          (subCategory: TSubCategory) =>
                            subCategory.id === item.sub_category_id
                        ) as TSubCategory;
                      const month = MONTHS.find(
                        (month: IAutocompleteValue) =>
                          month.id === item.month_id
                      );

                      return {
                        ...item,
                        type: t(item.type),
                        category: category?.label,
                        "sub-category": subCategory?.label,
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
                setSubCategories(subCategoriesRes.data);
              } else openPopup(t("unableLoadSubCategories"), "error");
            });
            setCategories(categoriesRes.data);
          } else openPopup(t("unableLoadCategories"), "error");
        }
      );
    else
      await Promise.resolve(
        ITEM_API.getAllWithFilters(
          table.from,
          table.to,
          table.subCategory,
          table.year,
          tableType,
          table.month,
          userData?.id as string
        )
      ).then((itemsRes: THTTPResponse) => {
        if (itemsRes && itemsRes.hasSuccess) {
          const items: any[] = itemsRes.data.map((item: TItem) => {
            const category: TCategory = categories?.find(
              (category: TCategory) => category.id === item.category_id
            ) as TCategory;
            const subCategory: TSubCategory = subCategories?.find(
              (subCategory: TSubCategory) =>
                subCategory.id === item.sub_category_id
            ) as TSubCategory;
            const month = MONTHS.find(
              (month: IAutocompleteValue) => month.id === item.month_id
            );

            return {
              ...item,
              type: t(item.type),
              category: category?.label,
              "sub-category": subCategory?.label,
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
      }
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
          ITEM_API.update(payload, editModal.item?.id as string)
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

  function getAutocompleteSubCategories(): IAutocompleteValue[] {
    return (
      subCategories?.map((subCategory: TSubCategory) => {
        return { id: subCategory.id, label: subCategory.label };
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

  function getSelectedSubCategory(): IAutocompleteValue {
    return getAutocompleteSubCategories().find(
      (subCategory: IAutocompleteValue) => subCategory.id === table.subCategory
    ) as IAutocompleteValue;
  }

  function getSelectedMonth(): IAutocompleteValue {
    return getAutocompleteMonths().find(
      (month: IAutocompleteValue) =>
        month.id?.toString() === table.month.toString()
    ) as IAutocompleteValue;
  }

  async function onResetFilters(): Promise<void> {
    setTable({
      ...table,
      subCategory: "",
      year: new Date().getFullYear(),
      type: "",
      month: "",
    });
  }

  const title = (
    <span className="text-white text-2xl mobile:text-center">
      {t("expenses")}
    </span>
  );

  const filters = (
    <div className="flex items-center gap-5">
      <LiquidGlass
        onClick={() => setIsFiltersModalOpen(true)}
        className="w-fit p-2 hover:opacity-50 transition-all duration-300 cursor-pointer"
      >
        <FiltersIcon className="text-white text-3xl" />
      </LiquidGlass>
      <span className="text-white">Apri filtri</span>
    </div>
  );

  const tableComponent = (
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
      <span className="text-white opacity-80">{t("confirmToDeleteVoice")}</span>
    </Modal>
  );

  const editModalComponent = (
    <Modal
      isOpen={editModal.show}
      title={t("editItem")}
      onCancel={() => setEditModal(DEFAULT_EDIT_MODAL)}
      onSubmit={onEdit}
      className="mobile:mt-10"
    >
      <div className="flex flex-col gap-5">
        <span className="text-white text-base">{t("addItemDescription")}</span>
        <div className="flex items-center gap-5 justify-between mobile:flex-col">
          <LiquidGlass
            onClick={() => onFormDataChange("type", "income")}
            backgroundColor={isIncomeType ? "rgba(255, 255, 255, 0.5)" : ""}
            className={`p-2 px-10 w-full justify-center flex items-center gap-5 transition-all duration-300 ${
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
            className={`p-2 px-10 w-full justify-center flex items-center gap-5 transition-all duration-300 ${
              isExitType ? "cursor-default" : "hover:opacity-50 cursor-pointer"
            }`}
          >
            <ExitIcon className="text-[3em] text-red" />
            <span className="text-white">{t("exit")}</span>
          </LiquidGlass>
        </div>
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
        />
        <Input
          type="number"
          value={formData?.year}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFormDataChange("year", event.target.value)
          }
          inputMode="numeric"
        />
      </div>
    </Modal>
  );

  const filtersModalComponent = (
    <Modal
      title={t("filters")}
      isOpen={isFiltersModalOpen}
      onClose={async () => {
        await getData();
        setIsFiltersModalOpen(false);
      }}
      onSubmit={onResetFilters}
      submitButtonText={t("cancelFilters")}
    >
      <div className="flex items-center justify-center">
        <Grid
          container
          columnSpacing={5}
          rowSpacing={2}
          style={{
            width: "80%",
          }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              placeholder={t("searchForSubCategory")}
              value={getSelectedSubCategory()}
              onChange={(value: IAutocompleteValue) =>
                setTable((prevState: any) => {
                  return { ...prevState, subCategory: value.id };
                })
              }
              data={getAutocompleteSubCategories()}
              noFullOptionsWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid size={{ xs: 12 }}>
              <div>
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
                />
              </div>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid size={{ xs: 12 }}>
              <Grid container columnSpacing={2} rowSpacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <div className="mobile:flex mobile:justify-center mobile:items-center">
                    <LiquidGlass
                      backgroundColor={
                        tableType === "income"
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(255, 255, 255, 0.1)"
                      }
                      onClick={() =>
                        setTable((prevState: any) => {
                          return { ...prevState, type: "1" };
                        })
                      }
                      className="px-5 py-2 cursor-pointer hover:opacity-50 transition-all w-fit mobile:px-10 mobile:py-3"
                    >
                      <span className="text-white font-bold">
                        {t("income").toUpperCase()}
                      </span>
                    </LiquidGlass>
                  </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <div className="mobile:flex mobile:justify-center mobile:items-center">
                    <LiquidGlass
                      backgroundColor={
                        tableType === "exit"
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(255, 255, 255, 0.1)"
                      }
                      onClick={() =>
                        setTable((prevState: any) => {
                          return { ...prevState, type: "2" };
                        })
                      }
                      className="px-5 py-2 cursor-pointer hover:opacity-50 transition-all w-fit mobile:px-10 mobile:py-3"
                    >
                      <span className="text-white font-bold">
                        {t("exit").toUpperCase()}
                      </span>
                    </LiquidGlass>
                  </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <div className="mobile:flex mobile:justify-center mobile:items-center">
                    <LiquidGlass
                      backgroundColor={
                        tableType === ""
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(255, 255, 255, 0.1)"
                      }
                      onClick={() =>
                        setTable((prevState: any) => {
                          return { ...prevState, type: "3" };
                        })
                      }
                      className="px-5 py-2 cursor-pointer hover:opacity-50 transition-all w-fit mobile:px-10 mobile:py-3"
                    >
                      <span className="text-white font-bold">
                        {t("noOne").toUpperCase()}
                      </span>
                    </LiquidGlass>
                  </div>
                </Grid>
              </Grid>
              <div className="flex items-center justify-between"></div>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <div>
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
              />
            </div>
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
      "sub-category": table.subCategory,
      year: table.year,
      type: table.type,
      month: table.month,
    } as any);

    // eslint-disable-next-line
  }, [
    table.from,
    table.to,
    table.page,
    table.subCategory,
    table.year,
    table.type,
    table.month,
  ]);

  useEffect(() => {
    if (editModal.item) {
      const month: IAutocompleteValue = _MONTHS.find(
        (month: IAutocompleteValue) => month.id === editModal.item?.month_id
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
      <div className="flex flex-col gap-5">
        {title}
        {filters}
        <LiquidGlass className="flex flex-col gap-10">
          {tableComponent}
        </LiquidGlass>
      </div>
      {deleteModalComponent}
      {editModalComponent}
      {filtersModalComponent}
    </>
  );
};

export default Expenses;
