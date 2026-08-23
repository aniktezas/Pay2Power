import { clsx } from 'clsx';
import { Clock, Zap } from 'lucide-react';
import { formatDuration, formatEnergy } from '../../utils/formatters';

interface HybridProgressProps {
  timeProgressPercent: number;
  energyProgressPercent: number;
  timeRemainingSeconds: number;
  energyRemainingKwh: number;
  compact?: boolean;
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-1000', color)}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

export function HybridProgress({
  timeProgressPercent,
  energyProgressPercent,
  timeRemainingSeconds,
  energyRemainingKwh,
  compact = false,
}: HybridProgressProps) {
  return (
    <div className={clsx('space-y-3', compact && 'space-y-2')}>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} />
            <span>Time remaining</span>
          </div>
          <span className={clsx(
            'text-xs font-mono font-semibold',
            timeProgressPercent > 80 ? 'text-rose-400' : timeProgressPercent > 60 ? 'text-amber-400' : 'text-sky-400'
          )}>
            {formatDuration(timeRemainingSeconds)}
          </span>
        </div>
        <ProgressBar
          percent={timeProgressPercent}
          color={timeProgressPercent > 80 ? 'bg-rose-500' : timeProgressPercent > 60 ? 'bg-amber-500' : 'bg-sky-500'}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap size={12} />
            <span>Energy remaining</span>
          </div>
          <span className={clsx(
            'text-xs font-mono font-semibold',
            energyProgressPercent > 80 ? 'text-rose-400' : energyProgressPercent > 60 ? 'text-amber-400' : 'text-emerald-400'
          )}>
            {formatEnergy(energyRemainingKwh)}
          </span>
        </div>
        <ProgressBar
          percent={energyProgressPercent}
          color={energyProgressPercent > 80 ? 'bg-rose-500' : energyProgressPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'}
        />
      </div>
    </div>
  );
}
