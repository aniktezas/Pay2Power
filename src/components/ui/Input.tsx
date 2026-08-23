import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, hint, leftIcon, rightElement, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-lg border bg-slate-900 text-slate-100 placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
            'transition-all duration-200',
            leftIcon ? 'pl-10' : 'pl-4',
            rightElement ? 'pr-12' : 'pr-4',
            'py-2.5 text-sm',
            error ? 'border-rose-500' : 'border-slate-700',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, children, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full rounded-lg border bg-slate-900 text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
          'transition-all duration-200 px-4 py-2.5 text-sm',
          error ? 'border-rose-500' : 'border-slate-700',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
