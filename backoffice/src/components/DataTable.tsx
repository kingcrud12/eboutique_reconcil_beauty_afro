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
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 text-left text-gray-700 font-semibold">
          <tr>
            {columns.map((col) => (
              <th key={col.field} className="px-4 py-2">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.field} className="px-4 py-2">
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
