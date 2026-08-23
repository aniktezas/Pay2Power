import { clsx } from 'clsx';
import type { DeviceStatus, AlertSeverity, TransactionStatus } from '../../types';

type BadgeVariant = 'online' | 'offline' | 'active' | 'disabled' | 'fault' | 'warning' | 'info' | 'success' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  offline: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  active: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  disabled: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  fault: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  neutral: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
};

export function Badge({ variant = 'neutral', children, dot = false, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
      variants[variant],
      className
    )}>
      {dot && (
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full',
          variant === 'online' || variant === 'success' ? 'bg-emerald-400' :
          variant === 'active' ? 'bg-sky-400 animate-pulse' :
          variant === 'fault' || variant === 'danger' ? 'bg-rose-400' :
          variant === 'warning' ? 'bg-amber-400' :
          'bg-slate-400'
        )} />
      )}
      {children}
    </span>
  );
}

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const config: Record<DeviceStatus, { variant: BadgeVariant; label: string }> = {
    online: { variant: 'online', label: 'Online' },
    offline: { variant: 'offline', label: 'Offline' },
    active: { variant: 'active', label: 'Active' },
    power_on: { variant: 'active', label: 'Power ON' },
    power_off: { variant: 'neutral', label: 'Power OFF' },
    disabled: { variant: 'disabled', label: 'Disabled' },
    fault: { variant: 'fault', label: 'Fault' },
  };
  const { variant, label } = config[status] ?? { variant: 'neutral', label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const config: Record<AlertSeverity, { variant: BadgeVariant }> = {
    low: { variant: 'info' },
    medium: { variant: 'warning' },
    high: { variant: 'danger' },
    critical: { variant: 'fault' },
  };
  return <Badge variant={config[severity].variant}>{severity.toUpperCase()}</Badge>;
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const config: Record<TransactionStatus, { variant: BadgeVariant }> = {
    pending: { variant: 'warning' },
    success: { variant: 'success' },
    failed: { variant: 'danger' },
    refunded: { variant: 'info' },
  };
  return <Badge variant={config[status].variant}>{status.toUpperCase()}</Badge>;
}
