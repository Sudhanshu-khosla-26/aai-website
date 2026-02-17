'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
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
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'block rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
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

Input.displayName = 'Input';

export default Input;
