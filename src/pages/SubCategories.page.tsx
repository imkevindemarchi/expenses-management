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
import { AddIcon, CloseIcon, SearchIcon } from "../assets/icons";

// Components
import { IconButton, Input, Modal, Table } from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Types
import { TCategory, THTTPResponse, TSubcategory } from "../types";
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
  item: TSubcategory | null;
}

const DEFAULT_DELETE_MODAL: IModal = {
  show: false,
  item: null,
};

const Subcategories: FC = () => {
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
  const [tableData, setTableData] = useState<TSubcategory[] | null>(null);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [deleteModal, setDeleteModal] = useState<IModal>(DEFAULT_DELETE_MODAL);
  const navigate: NavigateFunction = useNavigate();
  const { pathname } = useLocation();
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const talbeColumns: IColumn[] = [
    { key: "label", value: t("name") },
    { key: "category", value: t("category") },
  ];

  setPageTitle(t("subcategories"));

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.all([
      SUB_CATEGORY_API.getAllWithFilters(
        table.from,
        table.to,
        table.label,
        userData?.id as string,
      ),
      CATEGORY_API.getAll(userData?.id as string),
    ]).then((response: THTTPResponse[]) => {
      if (
        response[0] &&
        response[0].hasSuccess &&
        response[1] &&
        response[1].hasSuccess
      ) {
        const data: TSubcategory[] = response[0].data.map(
          (subcategory: TSubcategory) => {
            const category: TCategory | null = response[1].data.find(
              (category: TCategory) => category.id === subcategory.category_id,
            );
            return { ...subcategory, category: category?.label ?? "" };
          },
        );
        setTableData(data);
        setTable((prevState) => {
          return { ...prevState, total: response[0]?.totalRecords as number };
        });
      } else openPopup(t("unableLoadSubcategories"), "error");
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

  async function onTableDelete(rowData: TSubcategory): Promise<void> {
    setDeleteModal({
      show: true,
      item: rowData,
    });
  }

  function onTableRowClick(rowData: TSubcategory): void {
    navigate(`${pathname}/edit/${rowData.id}`);
  }

  async function onDelete(): Promise<void> {
    setDeleteModal(DEFAULT_DELETE_MODAL);
    setIsLoading(true);

    await Promise.resolve(
      SUB_CATEGORY_API.delete(deleteModal.item?.id as string),
    ).then(async (categoryRes: THTTPResponse) => {
      if (categoryRes && categoryRes.hasSuccess) {
        openPopup(t("subcategorySuccessfullyDeleted"), "success");
        getData();
      } else openPopup(t("unableDeleteSubcategory"), "error");
    });

    setIsLoading(false);
  }

  function onGoToNewPage(): void {
    navigate(`${pathname}/new`);
  }

  function resetFilterHandler(): void {
    setTable((prevState) => {
      return {
        ...prevState,
        label: "",
        from: 0,
        to: 4,
        page: 1,
      };
    });
  }

  const title = (
    <span
      className={`text-[2em] mobile:text-2xl mobile:text-center transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
    >
      {t("subcategories")}
    </span>
  );

  const header = (
    <div className="flex items-center gap-5 w-full px-80 mobile:px-0 mobile:flex-col">
      <Input
        placeholder={t("searchForSubcategory")}
        type="text"
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
        className="w-full"
        startIcon={<SearchIcon className="text-darkgray text-3xl" />}
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
      <IconButton
        onClick={onGoToNewPage}
        icon={<AddIcon className="text-white text-3xl" />}
        className="bg-primary"
      />
    </div>
  );

  const tableComponent = (
    <div className="min-w-[30%]">
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

  const modalComponent = (
    <Modal
      isOpen={deleteModal.show}
      title={t("deleteSubcategory")}
      onCancel={() => setDeleteModal(DEFAULT_DELETE_MODAL)}
      onSubmit={onDelete}
      cancelButtonText="no"
      submitButtonText="yes"
    >
      <span
        className={`opacity-80 transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
      >
        {t("confirmToDelete", { name: deleteModal.item?.label })}
      </span>
    </Modal>
  );

  useEffect(() => {
    userData?.id && getData();

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
    <>
      <div className="flex flex-col gap-5 justify-center items-center">
        {title}
        {header}
        {tableComponent}
      </div>
      {modalComponent}
    </>
  );
};

export default Subcategories;
