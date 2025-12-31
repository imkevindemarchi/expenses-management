import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

// Api
import { CATEGORY_API, ITEM_API, SUB_CATEGORY_API } from "../api";

// Assets
import { MONTHS } from "../assets";
import { ExitIcon, IncomeIcon } from "../assets/icons";

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

interface ITableData {
  from: number;
  to: number;
  total: number;
  page: number;
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

  setPageTitle(t("expenses"));
  const talbeColumns: IColumn[] = [
    { key: "type", value: t("type") },
    { key: "category", value: t("category") },
    { key: "sub-category", value: t("subCategory") },
    { key: "value", value: t("value") },
  ];
  const isIncomeType: boolean = formData?.type === "income";
  const isExitType: boolean = formData?.type === "exit";

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(CATEGORY_API.getAll(userData?.id as string)).then(
      async (categoriesRes: THTTPResponse) => {
        if (categoriesRes && categoriesRes.hasSuccess)
          await Promise.resolve(
            SUB_CATEGORY_API.getAll(userData?.id as string)
          ).then(async (subCategoriesRes: THTTPResponse) => {
            if (subCategoriesRes && subCategoriesRes.hasSuccess)
              await Promise.resolve(
                ITEM_API.getAllWithFilters(
                  table.from,
                  table.to,
                  userData?.id as string
                )
              ).then((itemsRes: THTTPResponse) => {
                if (itemsRes && itemsRes.hasSuccess) {
                  const items: any[] = itemsRes.data.map((item: TItem) => {
                    const category: TCategory = categoriesRes.data.find(
                      (category: TCategory) => category.id === item.category_id
                    ) as TCategory;
                    const subCategory: TSubCategory =
                      subCategoriesRes.data.find(
                        (subCategory: TSubCategory) =>
                          subCategory.id === item.sub_category_id
                      ) as TSubCategory;

                    return {
                      ...item,
                      type: t(item.type),
                      category: category?.label,
                      "sub-category": subCategory?.label,
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
            else openPopup(t("unableLoadSubCategories"), "error");
          });
        else openPopup(t("unableLoadCategories"), "error");
      }
    );

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

  const title = <span className="text-white text-2xl">{t("expenses")}</span>;

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

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [table.from, table.to, userData?.id]);

  useEffect(() => {
    setSearchParams({
      from: table.from,
      to: table.to,
      page: table.page,
    } as any);

    // eslint-disable-next-line
  }, [table.from, table.to, table.page]);

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
        <LiquidGlass blur={100} className="flex flex-col gap-10">
          {tableComponent}
        </LiquidGlass>
      </div>
      {deleteModalComponent}
      {editModalComponent}
    </>
  );
};

export default Expenses;
