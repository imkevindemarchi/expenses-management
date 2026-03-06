import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";

// Icons
import { ArrowLeftIcon, ArrowRightIcon, DeleteIcon } from "../assets/icons";

// Components
import LiquidGlass from "./LiquidGlass.component";
import ShadowBox from "./ShadowBox.component";
import IconButton from "./IconButton.component";

export interface IColumn {
  key: string;
  value: string;
}

interface IInfo {
  page: number;
  total: number;
}

interface IProps {
  data: any[] | null;
  onDelete?: (data: any) => void;
  columns: IColumn[];
  info?: IInfo;
  onRowClick?: (data: any) => void;
  onGoPreviousPage?: () => Promise<void>;
  onGoNextPage?: () => Promise<void>;
  total?: number;
  isLoading: boolean;
  noFooter?: boolean;
  smallPadding?: boolean;
}

function approximateByExcess(number: number): number {
  return Math.ceil(number);
}

const Table: FC<IProps> = ({
  data,
  onDelete,
  info,
  columns,
  onRowClick,
  onGoPreviousPage,
  onGoNextPage,
  total,
  isLoading,
  noFooter,
  smallPadding,
}) => {
  const { t } = useTranslation();

  const canGoPrevious: boolean = Number(info?.page ?? 0) > 1;
  const totalPages: number = approximateByExcess(Number(info?.total ?? 0) / 5);
  const canGoNext: boolean = Number(info?.page ?? 0) < totalPages;

  const footer = !noFooter && (
    <div className="py-5 px-2 flex justify-between items-center sticky bottom-0 left-0 right-0">
      <div className="flex gap-1">
        <span className="text-black opacity-80">{t("total")}:</span>
        <span className="text-black">{total}</span>
      </div>
      <div className="flex flex-row gap-5">
        <ShadowBox
          noBorder
          noShadow
          className={`transition-all duration-300 bg-lightgray ${
            !canGoPrevious ? "opacity-60" : "hover:opacity-50"
          }`}
        >
          <button
            disabled={!canGoPrevious}
            onClick={async () => onGoPreviousPage && (await onGoPreviousPage())}
            className={`flex justify-center items-center w-10 h-10 p-2 rounded-lg ${
              !canGoPrevious ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeftIcon className="text-3xl text-darkgray" />
          </button>
        </ShadowBox>
        <ShadowBox
          noBorder
          noShadow
          className={`transition-all duration-300 bg-lightgray ${
            !canGoNext ? "opacity-60" : "hover:opacity-50"
          }`}
        >
          <button
            disabled={!canGoNext}
            onClick={async () => onGoNextPage && (await onGoNextPage())}
            className={`flex justify-center items-center w-10 h-10 p-2 rounded-lg ${
              !canGoNext ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ArrowRightIcon className="text-3xl text-darkgray" />
          </button>
        </ShadowBox>
      </div>
    </div>
  );

  return data && data?.length > 0 ? (
    <ShadowBox
      borderRadius={20}
      className="mobile:overflow-x-scroll relative px-10 py-10 mobile:px-0 mobile:py-5"
      noBorder
    >
      <table className="w-full">
        <thead className="w-full">
          <tr>
            {onDelete && <th />}
            {columns.map((column: IColumn, index: number) => {
              return (
                <th key={index} className="px-5 text-left">
                  <span className="text-black font-normal whitespace-nowrap">
                    {column.value}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data?.map((item: any, index: number) => {
            const isLastElement: boolean = index === data.length - 1;

            return (
              <tr
                key={index}
                onClick={() => onRowClick && onRowClick(item)}
                style={{
                  borderBottom:
                    isLastElement && noFooter ? "" : "1px solid #ececec",
                }}
                className={`${
                  onRowClick
                    ? "cursor-pointer hover:bg-lightgray transition-all duration-300"
                    : ""
                }`}
              >
                {onDelete && (
                  <td className="px-5">
                    <IconButton
                      onClick={(event: any) => {
                        event.stopPropagation();
                        onDelete(item);
                      }}
                      icon={<DeleteIcon className="text-white text-2xl" />}
                      className="w-10 h-10 flex justify-center items-center bg-primary-red"
                      noBorder
                      noShadow
                    />
                  </td>
                )}
                {columns.map((column: IColumn, index2: number) => {
                  const isEmailColumn: boolean = column.key === "email";
                  const isDateColumn: boolean = column.key === "date";
                  const isImageColumn: boolean = column.key === "image";
                  const isIncomingColumn: boolean = column.key === "incomings";
                  const isExitColumn: boolean = column.key === "exits";
                  const isValueZero: boolean = Number(item[column.key]) === 0;
                  const isTypeColumn: boolean = column.key === "type";
                  const isValueColumn: boolean = column.key === "value";
                  const isMonthColumn: boolean = column.key === "month";

                  if (isEmailColumn) {
                    const value: string = item[column.key];
                    return (
                      <td
                        key={index2}
                        className={`whitespace-nowrap ${
                          !smallPadding ? "p-5" : "p-1"
                        }`}
                      >
                        <span className="transition-all duration-300 text-primary">
                          <LiquidGlass
                            backgroundColor="rgba(0, 0, 0, 0.5)"
                            className="flex justify-center items-center w-fit px-5 py-2"
                          >
                            {value}
                          </LiquidGlass>
                        </span>
                      </td>
                    );
                  }

                  if (isDateColumn) {
                    const dateValue: Date | null = item[column.key]?.includes(
                      "-",
                    )
                      ? parse(item[column.key], "yyyy-MM-dd", new Date())
                      : null;
                    const elabDate: string | null = dateValue
                      ? format(dateValue, "dd/MM/yyyy")
                      : null;

                    return (
                      <td key={index2} className="p-5">
                        <span className="text-black">{elabDate}</span>
                      </td>
                    );
                  }

                  if (isImageColumn)
                    return (
                      <td key={index2} className="p-5">
                        <LiquidGlass className="w-40 flex justify-center items-center p-5">
                          <img
                            src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/images/${item?.id}`}
                            alt={t("imgNotFound")}
                            style={{ borderRadius: 30 }}
                            className="h-24 w-full object-cover"
                          />
                        </LiquidGlass>
                      </td>
                    );

                  if (isIncomingColumn)
                    return isValueZero ? (
                      <td key={index2} />
                    ) : (
                      <td
                        key={index2}
                        className={`whitespace-nowrap px-5 ${
                          !smallPadding ? "p-5" : "p-1"
                        }`}
                      >
                        <span className="text-primary text-lg">
                          {`€ ${item[column.key]}`}
                        </span>
                      </td>
                    );

                  if (isExitColumn)
                    return isValueZero ? (
                      <td key={index2} />
                    ) : (
                      <td
                        key={index2}
                        className={`whitespace-nowrap px-5 ${
                          !smallPadding ? "p-5" : "p-1"
                        }`}
                      >
                        <span className="text-primary-red text-lg">
                          {`€ ${item[column.key]}`}
                        </span>
                      </td>
                    );

                  if (isTypeColumn) {
                    return (
                      <td
                        key={index2}
                        className={`whitespace-nowrap ${
                          !smallPadding ? "p-5" : "p-1"
                        }`}
                      >
                        <span
                          className={`${
                            item[column.key] === "Entrata"
                              ? "text-primary"
                              : "text-primary-red"
                          } `}
                        >
                          {item[column.key]}
                        </span>
                      </td>
                    );
                  }

                  if (isMonthColumn)
                    return (
                      <td
                        key={index2}
                        className={`whitespace-nowrap px-5 ${
                          !smallPadding ? "py-5" : "py-1"
                        }`}
                      >
                        <span className="text-black">
                          {t(item[column.key])}
                        </span>
                      </td>
                    );

                  return (
                    <td
                      key={index2}
                      className={`whitespace-nowrap ${
                        !smallPadding ? "p-5" : "p-1"
                      }`}
                    >
                      <span className="text-black">
                        {isValueColumn
                          ? `€ ${item[column.key]}`
                          : item[column.key]}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {footer}
    </ShadowBox>
  ) : !isLoading && data ? (
    <div className="flex justify-center p-5">
      <span className="text-black">{t("noData")}</span>
    </div>
  ) : null;
};

export default Table;
