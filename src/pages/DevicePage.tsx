import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Zap, Clock, AlertTriangle, LogIn, Wallet } from 'lucide-react';
import { deviceService } from '../services/device.service';
import { walletService } from '../services/wallet.service';
import { sessionService } from '../services/session.service';
import { getSimulator } from '../services/simulator.service';
import { calculateSessionProgress, describeTermination } from '../utils/billingEngine';
import { HybridProgress } from '../components/device/HybridProgress';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { DeviceStatusBadge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import type { Device, Pricing, UsageSession, Wallet as WalletType, EnergyReading } from '../types';
import { formatCurrency, formatDuration, formatEnergy, formatPower } from '../utils/formatters';
import toast from 'react-hot-toast';

type PageState = 'loading' | 'not_found' | 'offline' | 'available' | 'active_session' | 'terminated';

export function DevicePage() {
  const { deviceCode } = useParams<{ deviceCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [device, setDevice] = useState<Device | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [activeSession, setActiveSession] = useState<UsageSession | null>(null);
  const [reading, setReading] = useState<EnergyReading | null>(null);
  const [amount, setAmount] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [sessionProgress, setSessionProgress] = useState<ReturnType<typeof calculateSessionProgress> | null>(null);

  const loadDevice = useCallback(async () => {
    if (!deviceCode) return;
    try {
      const dev = await deviceService.getDeviceByCode(deviceCode);
      if (!dev) { setPageState('not_found'); return; }
      setDevice(dev);

      const pr = await deviceService.getPricing(dev.id);
      setPricing(pr);

      if (user) {
        const wal = await walletService.getWallet(user.id);
        setWallet(wal);
        const sess = await sessionService.getActiveSession(dev.id);
        if (sess && sess.user_id === user.id) {
          setActiveSession(sess);
          const sim = getSimulator(dev.id, dev.device_code);
          sim.turnOn();
          setPageState('active_session');
          return;
        }
      }

      setPageState(dev.status === 'disabled' ? 'offline' : 'available');
    } catch {
      setPageState('not_found');
    }
  }, [deviceCode, user]);

  useEffect(() => { loadDevice(); }, [loadDevice]);

  // Live readings subscription
  useEffect(() => {
    if (pageState !== 'active_session' || !device) return;
    const sim = getSimulator(device.id, device.device_code);
    const unsub = sim.onReading(r => setReading(r));
    return () => unsub();
  }, [pageState, device]);

  // Session limit checker
  useEffect(() => {
    if (pageState !== 'active_session' || !activeSession || !device) return;
    const interval = setInterval(() => {
      const sim = getSimulator(device.id);
      const progress = calculateSessionProgress(
        { timeLimitSeconds: activeSession.time_limit_seconds, energyLimitKwh: activeSession.energy_limit_kwh, amountPaid: activeSession.amount_paid },
        new Date(activeSession.started_at),
        sim.getSessionEnergyConsumed()
      );
      setSessionProgress(progress);
      if (progress.isExpired && progress.terminationReason) {
        clearInterval(interval);
        sim.turnOff();
        sessionService.endSession(
          activeSession.id, device.id, activeSession.user_id,
          progress.elapsedSeconds, progress.energyConsumedKwh, progress.terminationReason
        );
        setTerminationReason(describeTermination(progress.terminationReason));
        setPageState('terminated');
        toast.error(`Session ended: ${describeTermination(progress.terminationReason)}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pageState, activeSession, device]);

  async function handlePurchase() {
    if (!user) { navigate('/login'); return; }
    if (!device || !pricing) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!wallet || wallet.balance < amt) { toast.error('Insufficient wallet balance'); return; }

    setPurchasing(true);
    try {
      const updatedWallet = await walletService.deductBalance(user.id, amt);
      setWallet(updatedWallet);
      await walletService.recordTransaction(user.id, device.id, amt);
      const sess = await sessionService.startSession(user.id, device.id, amt, pricing);
      setActiveSession(sess);
      const sim = getSimulator(device.id, device.device_code);
      sim.resetSessionEnergy();
      sim.turnOn();
      setPageState('active_session');
      toast.success('Session started! Electricity is ON.', { icon: '⚡' });
    } catch (err: any) {
      toast.error(err.message ?? 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  }

  // ---- RENDER STATES ----

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageState === 'not_found') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-slate-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Device Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">
            The device code <span className="font-mono text-slate-200">"{deviceCode}"</span> is not registered in the SmartPay system.
          </p>
          <Link to="/"><Button variant="outline">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  if (pageState === 'terminated') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
            <Zap size={28} className="text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Session Ended</h1>
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <p className="text-rose-400 font-semibold">{terminationReason}</p>
            <p className="text-slate-400 text-xs mt-1">Your prepaid credit has been used.</p>
          </div>
          {activeSession && sessionProgress && (
            <Card>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Amount paid', val: formatCurrency(activeSession.amount_paid) },
                  { label: 'Duration', val: formatDuration(sessionProgress.elapsedSeconds) },
                  { label: 'Energy used', val: formatEnergy(sessionProgress.energyConsumedKwh) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-slate-100 font-mono">{r.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <div className="space-y-2">
            <Button fullWidth onClick={() => { setPageState('available'); setActiveSession(null); setReading(null); setSessionProgress(null); }}>
              Purchase Again
            </Button>
            <Link to="/transactions"><Button variant="outline" fullWidth>View Transactions</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'active_session' && activeSession) {
    const power = reading?.power ?? 0;
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold text-sm">ELECTRICITY ACTIVE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">⚡ Power ON</h1>
            <p className="text-slate-400 text-sm mt-1">{device?.name} · {device?.device_code}</p>
          </div>

          <Card className="text-center">
            <p className="text-xs text-slate-500 mb-1">Current Power</p>
            <p className="text-5xl font-mono font-bold text-sky-400">{formatPower(power)}</p>
          </Card>

          {sessionProgress && (
            <Card>
              <HybridProgress
                timeProgressPercent={sessionProgress.timeProgressPercent}
                energyProgressPercent={sessionProgress.energyProgressPercent}
                timeRemainingSeconds={sessionProgress.timeRemainingSeconds}
                energyRemainingKwh={sessionProgress.energyRemainingKwh}
              />
            </Card>
          )}

          <Card>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Amount paid', val: formatCurrency(activeSession.amount_paid) },
                { label: 'Time limit', val: formatDuration(activeSession.time_limit_seconds) },
                { label: 'Energy limit', val: formatEnergy(activeSession.energy_limit_kwh) },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-slate-400">{r.label}</span>
                  <span className="text-slate-100 font-mono">{r.val}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
            <p className="text-xs text-sky-400 text-center">
              ⚡ Both time and energy limits are being tracked. Electricity stops at whichever is reached first.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              variant="danger"
              fullWidth
              onClick={async () => {
                if (!activeSession || !device) return;
                try {
                  const sim = getSimulator(device.id, device.device_code);
                  const elapsed = Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 1000);
                  const energy = sim.getSessionEnergyConsumed();
                  sim.turnOff();
                  await sessionService.endSession(
                    activeSession.id,
                    device.id,
                    activeSession.user_id,
                    elapsed,
                    energy,
                    'MANUAL_STOP'
                  );
                  setTerminationReason('Session stopped manually');
                  setPageState('terminated');
                  toast.success('Session stopped. Power turned OFF.');
                } catch (err: any) {
                  toast.error(err.message ?? 'Failed to stop session');
                }
              }}
            >
              Stop Electricity & End Session
            </Button>
            <Link to={user?.profile?.role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard'}>
              <Button variant="ghost" fullWidth className="mt-1">
                ← Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Available state
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-4">
        {/* Brand header */}
        <div className="flex items-center justify-between mb-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
              <Zap size={13} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-100 text-sm">SmartPay<span className="text-sky-400">Switch</span></span>
          </Link>
          {user && (
            <Link 
              to={user.profile?.role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard'}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Dashboard →
            </Link>
          )}
        </div>

        {/* Device info */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-base font-semibold text-slate-100">{device?.name}</p>
              <p className="text-xs font-mono text-slate-500">{device?.device_code}</p>
            </div>
            <DeviceStatusBadge status={pageState === 'offline' ? 'disabled' : 'online'} />
          </div>
          {device?.location && <p className="text-xs text-slate-500 mt-1">📍 {device.location}</p>}
          {pageState === 'offline' && (
            <p className="text-xs text-rose-400 mt-2">This device is currently unavailable.</p>
          )}
        </Card>

        {/* Pricing */}
        {pricing && pageState !== 'offline' && (
          <Card>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Current Pricing</p>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-slate-100">{formatCurrency(pricing.price)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-900">
                <Clock size={14} className="text-sky-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-slate-100">{(pricing.time_limit_minutes / 60).toFixed(1)}h</p>
                <p className="text-xs text-slate-500">time</p>
              </div>
              <div className="flex items-center justify-center">
                <p className="text-slate-600 font-bold text-sm">OR</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900">
                <Zap size={14} className="text-emerald-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-slate-100">{pricing.energy_limit_kwh}</p>
                <p className="text-xs text-slate-500">kWh</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">Whichever comes first</p>
          </Card>
        )}

        {/* Purchase or login */}
        {pageState !== 'offline' && (
          !user ? (
            <Card className="text-center">
              <LogIn size={22} className="text-slate-400 mx-auto mb-3" />
              <p className="text-slate-300 text-sm mb-4">Sign in to purchase electricity</p>
              <Link to="/login"><Button fullWidth>Sign In</Button></Link>
              <Link to="/register"><Button variant="ghost" fullWidth className="mt-2">Create Account</Button></Link>
            </Card>
          ) : (
            <Card>
              {wallet && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-sky-400" />
                    <span className="text-sm text-slate-300">Wallet Balance</span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-slate-100">{formatCurrency(wallet.balance)}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Demo Payment</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[10, 20, 50].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      amount === preset.toString()
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
              <Input
                label="Or enter amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter ₹ amount"
                leftIcon={<span className="text-xs font-bold text-slate-400">₹</span>}
              />
              {amount && pricing && parseFloat(amount) > 0 && (
                <div className="my-3 p-3 rounded-lg bg-slate-900 text-xs text-slate-400">
                  ₹{amount} gives{' '}
                  <strong className="text-sky-400">{((parseFloat(amount) / pricing.price) * pricing.time_limit_minutes / 60).toFixed(1)}h</strong>{' '}
                  OR{' '}
                  <strong className="text-emerald-400">{((parseFloat(amount) / pricing.price) * pricing.energy_limit_kwh).toFixed(3)} kWh</strong>
                </div>
              )}
              <Button
                fullWidth
                loading={purchasing}
                onClick={handlePurchase}
                disabled={!amount || parseFloat(amount) <= 0}
                icon={<Zap size={16} />}
                className="mt-1"
              >
                Purchase Electricity
              </Button>
              <p className="text-xs text-center text-slate-500 mt-2">Demo Payment — uses wallet balance</p>
            </Card>
          )
        )}

        <div className="text-center">
          <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Powered by SmartPaySwitch
          </Link>
        </div>
      </div>
    </div>
  );
}
