import { Link } from 'react-router-dom';
import { Cpu, Settings, Square, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { DeviceStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { HybridProgress } from './HybridProgress';
import { LiveReading } from './LiveReading';
import type { DeviceWithReadings } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';
import { clsx } from 'clsx';

interface DeviceCardProps {
  device: DeviceWithReadings;
  onStop?: (deviceId: string) => void;
  timeProgress?: { timeProgressPercent: number; energyProgressPercent: number; timeRemainingSeconds: number; energyRemainingKwh: number; };
}

export function DeviceCard({ device, onStop, timeProgress }: DeviceCardProps) {
  const isActive = device.status === 'active' || device.status === 'power_on';
  const hasReading = !!device.latest_reading;

  return (
    <Card noPadding className="overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            isActive ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-700/50 text-slate-500'
          )}>
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{device.name}</h3>
            <p className="text-xs font-mono text-slate-500">{device.device_code}</p>
          </div>
        </div>
        <DeviceStatusBadge status={device.status} />
      </div>

      {/* Live readings */}
      <div className="px-5 py-4">
        {hasReading && device.latest_reading ? (
          <>
            <LiveReading
              voltage={device.latest_reading.voltage}
              current={device.latest_reading.current}
              power={device.latest_reading.power}
              energyKwh={device.latest_reading.energy_kwh}
              compact
            />

            {timeProgress && (
              <div className="mt-4">
                <HybridProgress {...timeProgress} compact />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            {device.status === 'offline' ? (
              <span>Offline • Last seen {device.last_seen_at ? formatTimeAgo(device.last_seen_at) : 'unknown'}</span>
            ) : (
              <span>No active session</span>
            )}
          </div>
        )}

        {device.active_session && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-sky-500/5 border border-sky-500/20">
            <p className="text-xs text-sky-400">
              Session active • Rs.{device.active_session.amount_paid} paid
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-700/50 flex items-center gap-2">
        <Link to={`/owner/devices/${device.id}`} className="flex-1">
          <Button variant="ghost" size="xs" icon={<Eye size={13} />} fullWidth>
            Details
          </Button>
        </Link>
        {isActive && onStop && (
          <Button variant="danger" size="xs" icon={<Square size={13} />} onClick={() => onStop(device.id)}>
            Stop
          </Button>
        )}
        <Link to={`/owner/devices/${device.id}/pricing`}>
          <Button variant="outline" size="xs" icon={<Settings size={13} />}>
            Settings
          </Button>
        </Link>
      </div>
    </Card>
  );
}
