import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | null | undefined);
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowClassName?: string;
  onRowClick?: (item: T) => void;
}

function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'Nenhum item encontrado',
  rowClassName = '',
  onRowClick
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`${rowClassName} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => {
                const cellContent = typeof column.accessor === 'function'
                  ? column.accessor(item)
                  : item[column.accessor as keyof T];
                  
                return (
                  <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}>
                    {column.cell ? column.cell(item) : cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
