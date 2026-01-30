import React, { FC } from "react";
import { useTranslation } from "react-i18next";

// Assets
import { ArrowLeftIcon, ArrowRightIcon, DeleteIcon } from "../assets/icons";
import LiquidGlass from "./LiquidGlass.component";
import { format, parse } from "date-fns";

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
        <span className="text-white opacity-80">{t("total")}:</span>
        <span className="text-white font-bold">{total}</span>
      </div>
      <div className="flex flex-row desktop:w-[7%] w-[12%] justify-between mobile:w-[35%]">
        <LiquidGlass
          className={`transition-all duration-300 ${
            !canGoPrevious ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <button
            disabled={!canGoPrevious}
            onClick={async () => onGoPreviousPage && (await onGoPreviousPage())}
            className={`flex justify-center items-center w-10 h-10 p-2 rounded-lg ${
              !canGoPrevious ? "opacity-50 cursor-default" : ""
            }`}
          >
            <ArrowLeftIcon className="text-3xl text-white" />
          </button>
        </LiquidGlass>
        <LiquidGlass
          className={`transition-all duration-300 ${
            !canGoNext ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <button
            disabled={!canGoNext}
            onClick={async () => onGoNextPage && (await onGoNextPage())}
            className={`flex justify-center items-center w-10 h-10 p-2 rounded-lg ${
              !canGoNext ? "opacity-50 cursor-default" : ""
            }`}
          >
            <ArrowRightIcon className="text-3xl text-white" />
          </button>
        </LiquidGlass>
      </div>
    </div>
  );

  return data && data?.length > 0 ? (
    <div className="mobile:overflow-x-scroll relative px-10 py-10">
      <table className="w-full">
        <thead className="w-full">
          <tr>
            {onDelete && <th />}
            {columns.map((column: IColumn, index: number) => {
              return (
                <th key={index} className="p-2 text-left">
                  <span className="text-white whitespace-nowrap">
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
                    isLastElement && noFooter
                      ? ""
                      : "1px solid rgba(255, 255, 255, 0.25)",
                }}
                className={`${
                  onRowClick
                    ? "cursor-pointer hover:opacity-50 transition-all duration-300"
                    : ""
                }`}
              >
                {onDelete && (
                  <td className="mobile:p-2">
                    <LiquidGlass
                      onClick={(event: any) => {
                        event.stopPropagation();
                        onDelete(item);
                      }}
                      className="w-10 h-10 flex justify-center items-center"
                    >
                      <DeleteIcon className="text-white text-2xl" />
                    </LiquidGlass>
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
                          !smallPadding ? "p-5" : "p-3"
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
                      <td>
                        <span className="text-white">{elabDate}</span>
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
                      <td />
                    ) : (
                      <td
                        className={`whitespace-nowrap ${
                          !smallPadding ? "p-5" : "p-3"
                        }`}
                      >
                        <LiquidGlass
                          backgroundColor="rgba(0, 0, 0, 0.5)"
                          className="flex justify-center items-center w-fit px-3 py-2"
                        >
                          <span className="text-incomings">
                            {`€ ${item[column.key]}`}
                          </span>
                        </LiquidGlass>
                      </td>
                    );

                  if (isExitColumn)
                    return isValueZero ? (
                      <td />
                    ) : (
                      <td
                        className={`whitespace-nowrap ${
                          !smallPadding ? "p-5" : "p-3"
                        }`}
                      >
                        <LiquidGlass
                          backgroundColor="rgba(0, 0, 0, 0.5)"
                          className="flex justify-center items-center w-fit px-3 py-2"
                        >
                          <span className="text-exits">
                            {`€ ${item[column.key]}`}
                          </span>
                        </LiquidGlass>
                      </td>
                    );

                  if (isTypeColumn) {
                    return (
                      <td
                        className={`whitespace-nowrap ${
                          !smallPadding ? "p-5" : "p-3"
                        }`}
                      >
                        <LiquidGlass
                          backgroundColor="rgba(0, 0, 0, 0.5)"
                          className="flex justify-center items-center w-fit px-5 py-2"
                        >
                          <span
                            className={`${
                              item[column.key] === "Entrata"
                                ? "text-incomings"
                                : "text-exits"
                            } `}
                          >
                            {item[column.key]}
                          </span>
                        </LiquidGlass>
                      </td>
                    );
                  }

                  if (isMonthColumn)
                    return (
                      <td
                        className={`whitespace-nowrap ${
                          !smallPadding ? "p-5" : "p-3"
                        }`}
                      >
                        <span className="text-white">
                          {t(item[column.key])}
                        </span>
                      </td>
                    );

                  return (
                    <td
                      className={`whitespace-nowrap ${
                        !smallPadding ? "p-5" : "p-3"
                      }`}
                    >
                      <span className="text-white">
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
    </div>
  ) : !isLoading && data ? (
    <div className="flex justify-center p-5">
      <span className="text-white">{t("noData")}</span>
    </div>
  ) : null;
};

export default Table;
