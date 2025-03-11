'use client';

import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="table-container overflow-x-auto">
      <table className={twMerge("table bg-gray-800 text-white rounded-lg w-full", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={twMerge("bg-gray-700", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={twMerge("hover:bg-gray-600", className)}>
      {children}
    </tr>
  );
}

interface TableCellProps extends TableProps {
  align?: 'left' | 'right' | 'center';
}

export function TableCell({ children, className, align = 'left' }: TableCellProps) {
  return (
    <td className={twMerge(
      "px-4 py-2",
      align === 'right' && "text-right",
      align === 'center' && "text-center",
      className
    )}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ children, className, align = 'left' }: TableCellProps) {
  return (
    <th className={twMerge(
      "px-4 py-2",
      align === 'right' && "text-right",
      align === 'center' && "text-center",
      className
    )}>
      {children}
    </th>
  );
}
