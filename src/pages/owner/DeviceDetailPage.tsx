import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Settings, Square, Zap, Wifi, WifiOff } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { deviceService } from '../../services/device.service';
import { sessionService } from '../../services/session.service';
import { getSimulator } from '../../services/simulator.service';
import { calculateSessionProgress, describeTermination } from '../../utils/billingEngine';
import { LiveReading } from '../../components/device/LiveReading';
import { HybridProgress } from '../../components/device/HybridProgress';
import { DeviceStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import type { Device, UsageSession, EnergyReading } from '../../types';
import { formatDateTime, formatDuration, formatEnergy, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.name === 'Power' ? ' W' : ' kWh'}
        </p>
      ))}
    </div>
  );
}

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [reading, setReading] = useState<EnergyReading | null>(null);
  const [activeSession, setActiveSession] = useState<UsageSession | null>(null);
  const [history, setHistory] = useState<UsageSession[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simOnline, setSimOnline] = useState(true);

  const loadDevice = useCallback(async () => {
    if (!id) return;
    const dev = await deviceService.getDevice(id);
    setDevice(dev);
    const sess = await sessionService.getActiveSession(id);
    setActiveSession(sess);
    const hist = await sessionService.getSessionHistory(sess?.user_id ?? 'demo-owner-001');
    setHistory(hist.filter(s => s.device_id === id).slice(0, 8));
    setLoading(false);
  }, [id]);

  useEffect(() => { loadDevice(); }, [loadDevice]);

  useEffect(() => {
    if (!id) return;
    const sim = getSimulator(id);
    const unsubReading = sim.onReading(r => {
      setReading(r);
      setChartData(prev => {
        const point = {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          Power: parseFloat(r.power.toFixed(1)),
          Energy: parseFloat(r.energy_kwh.toFixed(4)),
        };
        return [...prev.slice(-29), point];
      });
    });
    const unsubState = sim.onStateChange(s => setSimOnline(s.isOnline));
    return () => { unsubReading(); unsubState(); };
  }, [id]);

  async function handleStopSession() {
    if (!activeSession || !id) return;
    try {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 1000);
      const sim = getSimulator(id);
      const energy = sim.getSessionEnergyConsumed();
      await sessionService.endSession(activeSession.id, id, activeSession.user_id, elapsed, energy, 'MANUAL_STOP');
      sim.turnOff();
      setActiveSession(null);
      toast.success('Session stopped manually');
      await loadDevice();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const sessionProgress = activeSession
    ? calculateSessionProgress(
        { timeLimitSeconds: activeSession.time_limit_seconds, energyLimitKwh: activeSession.energy_limit_kwh, amountPaid: activeSession.amount_paid },
        new Date(activeSession.started_at),
        id ? getSimulator(id).getSessionEnergyConsumed() : 0
      )
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 mb-4">Device not found</p>
        <Link to="/owner/devices"><Button>Back to Devices</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-100">{device.name}</h1>
            <DeviceStatusBadge status={simOnline ? device.status : 'offline'} />
            {simOnline
              ? <Wifi size={14} className="text-emerald-400" />
              : <WifiOff size={14} className="text-slate-500" />}
          </div>
          <p className="text-sm font-mono text-slate-500">{device.device_code}{device.location ? ` · ${device.location}` : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={`/owner/devices/${id}/qr`}>
            <Button variant="outline" size="sm" icon={<QrCode size={14} />}>QR Code</Button>
          </Link>
          <Link to={`/owner/devices/${id}/pricing`}>
            <Button variant="outline" size="sm" icon={<Settings size={14} />}>Pricing</Button>
          </Link>
          {activeSession && (
            <Button variant="danger" size="sm" icon={<Square size={14} />} onClick={handleStopSession}>
              Stop Session
            </Button>
          )}
        </div>
      </div>

      {/* Live readings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={16} className="text-sky-400" /> Live Electrical Readings
          </CardTitle>
          {reading && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          )}
        </CardHeader>
        {reading ? (
          <LiveReading
            voltage={reading.voltage}
            current={reading.current}
            power={reading.power}
            energyKwh={reading.energy_kwh}
          />
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No readings — start a session to see live data.</p>
        )}
      </Card>

      {/* Active session */}
      {activeSession && sessionProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Active Session</CardTitle>
            <span className="text-sm font-mono text-sky-400">{formatCurrency(activeSession.amount_paid)} paid</span>
          </CardHeader>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Time</p>
              {[
                { label: 'Time limit', val: formatDuration(activeSession.time_limit_seconds), cls: 'text-slate-100' },
                { label: 'Elapsed', val: formatDuration(sessionProgress.elapsedSeconds), cls: 'text-slate-100' },
                { label: 'Remaining', val: formatDuration(sessionProgress.timeRemainingSeconds), cls: 'text-sky-400 font-semibold' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{r.label}</span>
                  <span className={`font-mono ${r.cls}`}>{r.val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Energy</p>
              {[
                { label: 'Energy limit', val: formatEnergy(activeSession.energy_limit_kwh), cls: 'text-slate-100' },
                { label: 'Consumed', val: formatEnergy(sessionProgress.energyConsumedKwh), cls: 'text-slate-100' },
                { label: 'Remaining', val: formatEnergy(sessionProgress.energyRemainingKwh), cls: 'text-emerald-400 font-semibold' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{r.label}</span>
                  <span className={`font-mono ${r.cls}`}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
          <HybridProgress
            timeProgressPercent={sessionProgress.timeProgressPercent}
            energyProgressPercent={sessionProgress.energyProgressPercent}
            timeRemainingSeconds={sessionProgress.timeRemainingSeconds}
            energyRemainingKwh={sessionProgress.energyRemainingKwh}
          />
        </Card>
      )}

      {/* Power chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader><CardTitle>Power Over Time</CardTitle></CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="Power" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Session history */}
      <Card>
        <CardHeader><CardTitle>Session History</CardTitle></CardHeader>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No completed sessions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Started', 'Duration', 'Energy', 'Amount', 'Ended by'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(sess => (
                  <tr key={sess.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-3 text-slate-300 text-xs">{formatDateTime(sess.started_at)}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-xs">{formatDuration(sess.duration_seconds)}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-xs">{formatEnergy(sess.energy_consumed_kwh)}</td>
                    <td className="py-3 px-3 text-slate-100 font-mono text-xs">{formatCurrency(sess.amount_paid)}</td>
                    <td className="py-3 px-3 text-xs">
                      <span className={
                        sess.termination_reason === 'ENERGY_LIMIT_REACHED' ? 'text-emerald-400' :
                        sess.termination_reason === 'TIME_LIMIT_REACHED' ? 'text-sky-400' :
                        'text-slate-400'
                      }>
                        {sess.termination_reason ? describeTermination(sess.termination_reason) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
