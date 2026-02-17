'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const Select = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Select an option',
  fullWidth = false,
  containerClassName,
  labelClassName,
  ...props
}, ref) => {
  return (
    <div className={cn(fullWidth && 'w-full', containerClassName)}>
      {label && (
        <label
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1.5',
            labelClassName
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
            'appearance-none transition-colors duration-200',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
