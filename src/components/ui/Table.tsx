'use client';

import { ReactNode, CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Table({ children, className, style }: TableProps) {
  return (
    <div className="table-container overflow-x-auto">
      <table className={twMerge("w-full", className)} style={style}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={className}>
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

export function TableRow({ children, className, style }: TableProps) {
  return (
    <tr className={twMerge(className)} style={style}>
      {children}
    </tr>
  );
}

interface TableCellProps extends TableProps {
  align?: 'left' | 'right' | 'center';
}

export function TableCell({ children, className, align = 'left', style }: TableCellProps) {
  return (
    <td className={twMerge(
      align === 'right' && "text-right",
      align === 'center' && "text-center",
      className
    )}
    style={style}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ children, className, align = 'left', style }: TableCellProps) {
  return (
    <th className={twMerge(
      align === 'right' && "text-right",
      align === 'center' && "text-center",
      className
    )}
    style={style}>
      {children}
    </th>
  );
}
