import { clsx } from 'clsx';

interface LiveReadingProps {
  voltage: number;
  current: number;
  power: number;
  energyKwh: number;
  compact?: boolean;
}

function ReadingItem({ label, value, unit, color }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={clsx('text-xl font-mono font-bold', color ?? 'text-slate-100')}>
        {value}
        <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

export function LiveReading({ voltage, current, power, energyKwh, compact = false }: LiveReadingProps) {
  return (
    <div className={clsx(
      'grid gap-4',
      compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
    )}>
      <ReadingItem label="Voltage" value={voltage.toFixed(1)} unit="V" color="text-amber-400" />
      <ReadingItem label="Current" value={current.toFixed(3)} unit="A" color="text-blue-400" />
      <ReadingItem label="Power" value={power.toFixed(1)} unit="W" color="text-sky-400" />
      <ReadingItem label="Energy" value={energyKwh.toFixed(3)} unit="kWh" color="text-emerald-400" />
    </div>
  );
}
