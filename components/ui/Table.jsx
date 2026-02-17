'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export const Table = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full text-left border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

Table.displayName = 'Table';

export const TableHead = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <thead
      ref={ref}
      className={cn('bg-gray-50', className)}
      {...props}
    >
      {children}
    </thead>
  );
});

TableHead.displayName = 'TableHead';

export const TableBody = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn('divide-y divide-gray-100', className)}
      {...props}
    >
      {children}
    </tbody>
  );
});

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef(({
  children,
  className,
  hover = true,
  ...props
}, ref) => {
  return (
    <tr
      ref={ref}
      className={cn(
        hover && 'hover:bg-gray-50 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export const TableHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
});

TableHeader.displayName = 'TableHeader';

export const TableCell = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 text-sm text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
});

TableCell.displayName = 'TableCell';

export default Table;
