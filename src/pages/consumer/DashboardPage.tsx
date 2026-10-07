import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, History, ArrowRight, Plug, Clock, CheckCircle2, 
  ExternalLink, Square, ChevronRight, Sparkles 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { walletService } from '../../services/wallet.service';
import { sessionService } from '../../services/session.service';
import { deviceService } from '../../services/device.service';
import { getSimulator } from '../../services/simulator.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DeviceStatusBadge, Badge } from '../../components/ui/Badge';
import type { Wallet, UsageSession, Device, Pricing } from '../../types';
import { formatCurrency, formatDuration, formatEnergy, formatDateTime } from '../../utils/formatters';
import { describeTermination, calculateSessionProgress } from '../../utils/billingEngine';
import toast from 'react-hot-toast';

export function ConsumerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [activeSession, setActiveSession] = useState<UsageSession | null>(null);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [sessions, setSessions] = useState<UsageSession[]>([]);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [devicePricing, setDevicePricing] = useState<Record<string, Pricing>>({});
  const [customDeviceCode, setCustomDeviceCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [sessionProgress, setSessionProgress] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [wal, hist, activeSess, allDevs] = await Promise.all([
        walletService.getWallet(user.id),
        sessionService.getSessionHistory(user.id),
        sessionService.getUserActiveSession(user.id),
        deviceService.getAllDevices(),
      ]);

      setWallet(wal);
      setSessions(hist.slice(0, 6));
      setActiveSession(activeSess);
      setAvailableDevices(allDevs);

      // Fetch pricing for available devices
      const pricingMap: Record<string, Pricing> = {};
      await Promise.all(
        allDevs.map(async (dev) => {
          const pr = await deviceService.getPricing(dev.id);
          if (pr) pricingMap[dev.id] = pr;
        })
      );
      setDevicePricing(pricingMap);

      if (activeSess) {
        const dev = allDevs.find(d => d.id === activeSess.device_id) || null;
        setActiveDevice(dev);
      } else {
        setActiveDevice(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Live session tracker interval
  useEffect(() => {
    if (!activeSession || !activeDevice) {
      setSessionProgress(null);
      return;
    }

    const sim = getSimulator(activeDevice.id, activeDevice.device_code);
    const updateProgress = () => {
      const progress = calculateSessionProgress(
        {
          timeLimitSeconds: activeSession.time_limit_seconds,
          energyLimitKwh: activeSession.energy_limit_kwh,
          amountPaid: activeSession.amount_paid,
        },
        new Date(activeSession.started_at),
        sim.getSessionEnergyConsumed()
      );
      setSessionProgress(progress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [activeSession, activeDevice]);

  async function handleStopActiveSession() {
    if (!activeSession || !activeDevice) return;
    setStopping(true);
    try {
      const sim = getSimulator(activeDevice.id, activeDevice.device_code);
      const elapsed = Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 1000);
      const energy = sim.getSessionEnergyConsumed();
      await sessionService.endSession(
        activeSession.id,
        activeDevice.id,
        activeSession.user_id,
        elapsed,
        energy,
        'MANUAL_STOP'
      );
      sim.turnOff();
      toast.success('Session stopped. Power turned OFF.');
      setActiveSession(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to stop session');
    } finally {
      setStopping(false);
    }
  }

  function handleConnectCode(e: React.FormEvent) {
    e.preventDefault();
    const code = customDeviceCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a device code (e.g. SP-SW-00001)');
      return;
    }
    navigate(`/device/${code}`);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Wallet */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles size={12} /> Client / Consumer Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome, <span className="text-emerald-400">{user?.profile?.full_name || 'Consumer'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Prepaid electricity access · Pay only for what you use
          </p>
        </div>

        {/* Wallet Widget */}
        <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 w-full md:w-auto justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Available Balance</p>
            {loading ? (
              <div className="h-7 w-24 skeleton rounded mt-1" />
            ) : (
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
                {formatCurrency(wallet?.balance ?? 0)}
              </p>
            )}
          </div>
          <Link to="/consumer/wallet">
            <Button size="sm" variant="primary" icon={<ArrowRight size={14} />} iconRight>
              Add Money
            </Button>
          </Link>
        </div>
      </div>

      {/* ACTIVE SESSION HERO (Prominently displayed when running) */}
      {activeSession && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/30 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-xl shadow-emerald-500/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                POWER CURRENTLY ACTIVE
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Zap size={22} className="text-emerald-400 fill-emerald-400" />
                  {activeDevice?.name || 'Active SmartPay Switch'}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Device Code: <span className="text-slate-200 font-bold">{activeDevice?.device_code || activeSession.device_id}</span>
                  {activeDevice?.location && ` · Location: ${activeDevice.location}`}
                </p>
              </div>

              {/* Progress metrics */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-sky-400" /> Time Remaining
                  </p>
                  <p className="text-base font-mono font-bold text-sky-400">
                    {sessionProgress ? formatDuration(sessionProgress.timeRemainingSeconds) : formatDuration(activeSession.time_limit_seconds)}
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <Zap size={12} className="text-emerald-400" /> Energy Remaining
                  </p>
                  <p className="text-base font-mono font-bold text-emerald-400">
                    {sessionProgress ? formatEnergy(sessionProgress.energyRemainingKwh) : formatEnergy(activeSession.energy_limit_kwh)}
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-slate-400 mb-1">Amount Paid</p>
                  <p className="text-base font-mono font-bold text-slate-200">
                    {formatCurrency(activeSession.amount_paid)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions for active session */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto">
              <Link to={`/device/${activeDevice?.device_code || 'SP-SW-00001'}`} className="w-full">
                <Button fullWidth size="lg" icon={<ExternalLink size={16} />}>
                  View Live Session Controls ⚡
                </Button>
              </Link>
              <Button
                variant="danger"
                size="md"
                icon={<Square size={14} />}
                loading={stopping}
                onClick={handleStopActiveSession}
                fullWidth
              >
                Stop Electricity Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CONNECT & AVAILABLE SMARTPAY SOCKETS */}
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plug size={20} className="text-sky-400" />
              Connect to a SmartPay Socket
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any socket code or choose an available unit below to start prepaid power
            </p>
          </div>
        </div>

        {/* Direct code search input */}
        <form onSubmit={handleConnectCode} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={customDeviceCode}
              onChange={e => setCustomDeviceCode(e.target.value)}
              placeholder="Enter Socket Code (e.g. SP-SW-00001)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors uppercase tracking-wider"
            />
          </div>
          <Button type="submit" icon={<Zap size={16} />}>
            Connect & Pay
          </Button>
        </form>

        {/* Available sockets grid */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Available Power Points on Premises
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableDevices.map(device => {
              const pricing = devicePricing[device.id];
              const isCurrentActive = activeSession?.device_id === device.id;

              return (
                <div
                  key={device.id}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                    isCurrentActive
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">{device.name}</h3>
                        <p className="text-xs font-mono text-slate-400">{device.device_code}</p>
                      </div>
                      <DeviceStatusBadge status={isCurrentActive ? 'active' : device.status} />
                    </div>
                    {device.location && (
                      <p className="text-xs text-slate-500 mb-3">📍 {device.location}</p>
                    )}

                    {/* Pricing pill */}
                    {pricing && (
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs mb-3 space-y-0.5">
                        <div className="flex justify-between text-slate-400">
                          <span>Standard Rate</span>
                          <span className="font-bold text-slate-200">₹{pricing.price}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Limit:</span>
                          <span className="text-sky-400">{(pricing.time_limit_minutes / 60).toFixed(1)}h OR {pricing.energy_limit_kwh} kWh</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to={`/device/${device.device_code}`}>
                    <Button
                      size="sm"
                      fullWidth
                      variant={isCurrentActive ? 'secondary' : 'outline'}
                      icon={isCurrentActive ? <CheckCircle2 size={14} /> : <Zap size={14} />}
                    >
                      {isCurrentActive ? 'Manage Active Power' : 'Use this Socket'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* RECENT SESSIONS */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <History size={18} className="text-sky-400" />
              Recent Electricity Sessions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit log of your prepaid power usage</p>
          </div>
          <Link to="/transactions">
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />}>
              View All Transactions
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10">
            <Zap size={28} className="text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300">No sessions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Connect to any SmartPay socket above to start your first session.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(sess => {
              const dev = availableDevices.find(d => d.id === sess.device_id);
              const isActive = sess.status === 'active';

              return (
                <div
                  key={sess.id}
                  onClick={() => navigate(dev ? `/device/${dev.device_code}` : '/transactions')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30'
                      : 'border-slate-800 bg-slate-900/70 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-200 font-semibold">
                        {dev?.name || 'SmartPay Socket'}
                      </p>
                      {isActive ? (
                        <Badge variant="success" dot>IN PROGRESS</Badge>
                      ) : (
                        <Badge variant="neutral">Completed</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                      <span>{formatDateTime(sess.started_at)}</span>
                      <span>•</span>
                      <span className="font-mono">{formatDuration(sess.duration_seconds)}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{formatEnergy(sess.energy_consumed_kwh)}</span>
                      {sess.termination_reason && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">{describeTermination(sess.termination_reason)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-base font-mono font-bold text-slate-100">
                      {formatCurrency(sess.amount_paid)}
                    </p>
                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
