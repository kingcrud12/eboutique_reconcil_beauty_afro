import React from "react";

type Column = {
  label: string;
  field: string;
};

type DataTableProps = {
  columns: Column[];
  data: Record<string, any>[];
};

function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-800 text-left text-white font-semibold block w-full">
          <tr className="table w-full table-fixed">
            {columns.map((col) => (
              <th key={col.field} className="px-4 py-2 w-[150px]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="block w-full max-h-[400px] overflow-y-auto divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr key={idx} className="table w-full table-fixed hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.field} className="px-4 py-2 w-[200px]">
                  {row[col.field] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
