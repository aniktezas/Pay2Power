import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  noPadding?: boolean;
}

export function Card({ glass = false, noPadding = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-700/50',
        glass ? 'bg-slate-800/50 backdrop-blur-sm' : 'bg-slate-800',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx('text-base font-semibold text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}
