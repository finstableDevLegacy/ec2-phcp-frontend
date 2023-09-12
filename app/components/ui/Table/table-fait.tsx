import { FC } from "react";
import LoadingIcon from "~/components/loading-icon";
import { getTimestampDiff } from "~/components/countdown";

export type ColumnsProps = {
  title: any;
  titleClass?: string;
  dataIndex: string;
  key: string;
  widthColumn?: string;
  render?: (value: any) => React.ReactNode;
  renderColumn?: (value: any) => React.ReactNode;
};

export type TableProps<T> = {
  dataSource: T[];
  columns: ColumnsProps[];
  customClassName?: string;
  onEntries: (per: number) => void;
  isLoading?: boolean;
  dataEmptyMessage?: string;
};

const TableFait = <T,>({
  dataSource,
  columns,
  customClassName,
  onEntries,
  isLoading,
  dataEmptyMessage,
}: TableProps<T>) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start">
        </div>
        <div className="flex items-center justify-end">
        <div className="text-white">Show</div>
        <select
          className="mx-2 rounded-md py-1 text-sm lg:text-lg"
          defaultValue={10}
          onChange={(e) => onEntries(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
        <div className="text-white">Entries</div>
        </div>
      </div>
      <div className="wallet-pay mt-3 overflow-x-auto overflow-y-auto rounded-xl border-primary-black-gary bg-white px-4 pb-4 shadow-pay-wallet">
        <table
          className={`w-full table-auto ${
            customClassName ? customClassName : ""
          }`}
        >
          <thead>
            <tr
              className={`md:text-md border-b-2 text-white border-[#F1F1F1] text-center text-sm`}
            >
              {columns?.map((column, index) => {
                return (
                  <th
                    key={`${column.title}${index}`}
                    className={`${dataSource?.length === 0 ? "p-5" : "py-5"} ${
                      column.titleClass ? column.titleClass : ""
                    }`}
                  >
                    {column.renderColumn
                      ? column.renderColumn(column.title)
                      : column.title}
                  </th>
                );
              })}
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <tr className="w-full">
                <td
                  className="py-6 text-center text-sm font-semibold text-white"
                  colSpan={columns.length}
                >
                  Loading . . .
                </td>
              </tr>
            </tbody>
          ) : dataSource?.length > 0 ? (
            <tbody>
              {dataSource?.map((data: any, index) => {
                return (
                  <tr key={`${JSON.stringify(data)}${index}`}>
                    {columns?.map((column, idx) => (
                      <td
                        key={`${column.key}${idx}`}
                        className={`relative border-[#C4C4C4] text-white px-2 py-4 text-sm md:px-6 md:text-center md:text-base ${
                          dataSource.length - 1 === index
                            ? "border-none"
                            : "border-b"
                        } ${column.titleClass ? column.titleClass : ""}`}
                      >
                        {column.render
                          ? column.render(data[`${column.dataIndex}`])
                          : data[`${column.dataIndex}`]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody>
              <tr className="w-full">
                <td colSpan={columns.length}>
                  <div className="mt-2 rounded border bg-slate-100 py-6 text-center text-xl font-semibold text-gray-500">
                    <div>{dataEmptyMessage ? dataEmptyMessage : "No item"}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};

export default TableFait;
