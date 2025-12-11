import React, { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

// Api
import { CATEGORY_API, SUB_CATEGORY_API } from "../api";

// Assets
import { AddIcon, SearchIcon } from "../assets/icons";

// Components
import { Input, LiquidGlass, Modal, Table } from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";

// Types
import { TCategory, THTTPResponse, TSubCategory } from "../types";
import { IColumn } from "../components/Table.component";

// Utils
import { setPageTitle } from "../utils";

interface ITableData {
  from: number;
  to: number;
  total: number;
  page: number;
  label: string;
}

interface IModal {
  show: boolean;
  item: TSubCategory | null;
}

const DEFAULT_DELETE_MODAL: IModal = {
  show: false,
  item: null,
};

const SubCategories: FC = () => {
  const { t } = useTranslation();
  const { state: isLoading, setState: setIsLoading }: TLoaderContext =
    useContext(LoaderContext) as TLoaderContext;
  const [searchParams, setSearchParams] = useSearchParams({});
  const TABLE_DEFAULT_STATE: ITableData = {
    from: parseInt(searchParams.get("from") as string) || 0,
    to: parseInt(searchParams.get("to") as string) || 4,
    total: parseInt(searchParams.get("total") as string) || 0,
    page: parseInt(searchParams.get("page") as string) || 1,
    label: searchParams.get("label") || "",
  };
  const [table, setTable] = useState<ITableData>(TABLE_DEFAULT_STATE);
  const [tableData, setTableData] = useState<TSubCategory[] | null>(null);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [deleteModal, setDeleteModal] = useState<IModal>(DEFAULT_DELETE_MODAL);
  const navigate: NavigateFunction = useNavigate();
  const { pathname } = useLocation();
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;

  const talbeColumns: IColumn[] = [
    { key: "label", value: t("name") },
    { key: "category", value: t("category") },
  ];

  setPageTitle(t("subCategories"));

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.all([
      SUB_CATEGORY_API.getAllWithFilters(
        table.from,
        table.to,
        table.label,
        userData?.id as string
      ),
      CATEGORY_API.getAll(userData?.id as string),
    ]).then((response: THTTPResponse[]) => {
      if (
        response[0] &&
        response[0].hasSuccess &&
        response[1] &&
        response[1].hasSuccess
      ) {
        const data: TSubCategory[] = response[0].data.map(
          (subCategory: TSubCategory) => {
            const category: TCategory = response[1].data.find(
              (category: TCategory) => category.id === subCategory.category_id
            );
            return { ...subCategory, category: category.label };
          }
        );
        setTableData(data);
        setTable((prevState) => {
          return { ...prevState, total: response[0]?.totalRecords as number };
        });
      } else openPopup(t("unableLoadSubCategories"), "error");
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

  async function onTableDelete(rowData: TSubCategory): Promise<void> {
    setDeleteModal({
      show: true,
      item: rowData,
    });
  }

  function onTableRowClick(rowData: any): void {
    navigate(`${pathname}/edit/${rowData.id}`);
  }

  async function onDelete(): Promise<void> {
    setDeleteModal(DEFAULT_DELETE_MODAL);
    setIsLoading(true);

    await Promise.resolve(
      SUB_CATEGORY_API.delete(deleteModal.item?.id as string)
    ).then(async (categoryRes: THTTPResponse) => {
      if (categoryRes && categoryRes.hasSuccess) {
        openPopup(t("subCategorySuccessfullyDeleted"), "success");
        getData();
      } else openPopup(t("unableDeleteSubCategory"), "error");
    });

    setIsLoading(false);
  }

  function onGoToNewPage(): void {
    navigate(`${pathname}/new`);
  }

  const title = (
    <span className="text-white text-2xl">{t("subCategories")}</span>
  );

  const header = (
    <div className="w-full flex justify-between items-center gap-5">
      <Input
        autoFocus
        placeholder={t("searchForName")}
        value={table.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          let text: string = event.target.value;
          if (text.length > 0)
            text = text.charAt(0).toUpperCase() + text.slice(1);

          setTable((prevState) => {
            return {
              ...prevState,
              label: text,
              from: 0,
              to: 4,
              page: 1,
            };
          });
        }}
        onSearch={getData}
        startIcon={<SearchIcon className="text-white text-2xl" />}
      />
      <LiquidGlass
        onClick={onGoToNewPage}
        className="p-3 cursor-pointer hover:opacity-50"
      >
        <AddIcon className="text-white text-2xl" />
      </LiquidGlass>
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

  const modalComponent = (
    <Modal
      isOpen={deleteModal.show}
      title={t("deleteCategory")}
      onCancel={() => setDeleteModal(DEFAULT_DELETE_MODAL)}
      onSubmit={onDelete}
      cancelButtonText="no"
      submitButtonText="yes"
    >
      <span className="text-white opacity-80">
        {t("confirmToDelete", { name: deleteModal.item?.label })}
      </span>
    </Modal>
  );

  useEffect(() => {
    getData();

    // eslint-disable-next-line
  }, [table.from, table.to, userData?.id]);

  useEffect(() => {
    setSearchParams({
      label: table.label,
      from: table.from,
      to: table.to,
      page: table.page,
    } as any);

    // eslint-disable-next-line
  }, [table.label, table.from, table.to, table.page]);

  return (
    <div className="flex flex-col gap-5">
      {title}
      {header}
      <LiquidGlass className="flex flex-col gap-10">
        {tableComponent}
      </LiquidGlass>
      {modalComponent}
    </div>
  );
};

export default SubCategories;
