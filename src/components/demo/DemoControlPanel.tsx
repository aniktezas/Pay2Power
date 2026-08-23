import { useState, useEffect } from 'react';
import { Settings, Zap, ZapOff, TrendingUp, FastForward, AlertTriangle, Wifi, WifiOff, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getSimulator } from '../../services/simulator.service';
import { aiService } from '../../services/ai.service';
import toast from 'react-hot-toast';

/**
 * Demo Control Panel — DEVELOPMENT ONLY
 * This component is only rendered when VITE_DEMO_MODE=true
 * It allows the presenter to control the device simulator during a live demo.
 * NEVER expose this in production.
 */

const DEMO_DEVICE_ID = 'dev-001';
const DEMO_DEVICE_CODE = 'SP-SW-00001';

export function DemoControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [simState, setSimState] = useState<{
    isOnline: boolean;
    isPowerOn: boolean;
    power: number;
    energyKwh: number;
    anomalyMode: boolean;
  }>({ isOnline: true, isPowerOn: false, power: 0, energyKwh: 0, anomalyMode: false });

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  useEffect(() => {
    if (!isDemoMode) return;
    const sim = getSimulator(DEMO_DEVICE_ID, DEMO_DEVICE_CODE);
    const unsub = sim.onStateChange(state => {
      setSimState({
        isOnline: state.isOnline,
        isPowerOn: state.isPowerOn,
        power: state.power,
        energyKwh: state.energyKwh,
        anomalyMode: state.anomalyMode,
      });
    });
    return () => unsub();
  }, [isDemoMode]);

  if (!isDemoMode) return null;

  const sim = getSimulator(DEMO_DEVICE_ID, DEMO_DEVICE_CODE);

  function handleTurnOn() {
    sim.turnOn();
    toast.success('Device simulator: Power ON');
  }

  function handleTurnOff() {
    sim.turnOff();
    toast.success('Device simulator: Power OFF');
  }

  function handleSetPower(watts: number) {
    sim.setTargetPower(watts);
    toast(`Target power set to ${watts}W`);
  }

  function handleFastForwardEnergy(kwh: number) {
    sim.fastForwardEnergy(kwh);
    toast.success(`Energy fast-forwarded by ${kwh} kWh`);
  }

  function handleFastForwardTime(minutes: number) {
    sim.fastForwardTime(minutes * 60);
    toast.success(`Session time fast-forwarded by ${minutes} minutes`);
  }

  async function handleTriggerAnomaly() {
    sim.setAnomalyMode(true);
    const alert = await aiService.triggerSimulatedAnomaly(DEMO_DEVICE_ID);
    setTimeout(() => sim.setAnomalyMode(false), 20000);
    toast.error(`Anomaly triggered! Score: ${alert.anomaly_score}`, { icon: '⚠️', duration: 5000 });
  }

  function handleToggleOnline() {
    sim.setOnline(!simState.isOnline);
    toast(simState.isOnline ? 'Device went offline' : 'Device came online');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition-all"
      >
        <Settings size={14} />
        Demo Control
        {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-72 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-purple-600/20 border-b border-purple-500/30 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-300">Demo Control Panel</p>
              <p className="text-xs text-purple-400/70">Development only — not shown to users</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-purple-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          {/* Status */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Device Status ({DEMO_DEVICE_CODE})</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-800">
                <p className="text-slate-500">Connection</p>
                <p className={simState.isOnline ? 'text-emerald-400' : 'text-slate-500'}>
                  {simState.isOnline ? '● Online' : '● Offline'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800">
                <p className="text-slate-500">Power</p>
                <p className={simState.isPowerOn ? 'text-sky-400' : 'text-slate-500'}>
                  {simState.isPowerOn ? '⚡ ON' : '◯ OFF'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800">
                <p className="text-slate-500">Current power</p>
                <p className="text-amber-400 font-mono">{simState.power.toFixed(1)} W</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800">
                <p className="text-slate-500">Energy</p>
                <p className="text-emerald-400 font-mono">{simState.energyKwh.toFixed(4)} kWh</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 py-3 space-y-3">
            {/* Power on/off */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Switch Control</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTurnOn}
                  disabled={!simState.isOnline || simState.isPowerOn}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40 transition-all"
                >
                  <Zap size={12} /> Turn ON
                </button>
                <button
                  onClick={handleTurnOff}
                  disabled={!simState.isPowerOn}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-40 transition-all"
                >
                  <ZapOff size={12} /> Turn OFF
                </button>
              </div>
            </div>

            {/* Power levels */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Set Power Level</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[50, 100, 200, 400].map(w => (
                  <button
                    key={w}
                    onClick={() => handleSetPower(w)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all"
                  >
                    {w}W
                  </button>
                ))}
              </div>
            </div>

            {/* Fast forward */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Fast Forward</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Time</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[30, 60].map(m => (
                      <button
                        key={m}
                        onClick={() => handleFastForwardTime(m)}
                        className="py-1.5 rounded-lg bg-sky-900/50 hover:bg-sky-800/50 text-sky-300 text-xs transition-all flex items-center justify-center gap-1"
                      >
                        <FastForward size={10} /> {m}m
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Energy</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[0.5, 1.0].map(kwh => (
                      <button
                        key={kwh}
                        onClick={() => handleFastForwardEnergy(kwh)}
                        className="py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-300 text-xs transition-all flex items-center justify-center gap-1"
                      >
                        <TrendingUp size={10} /> {kwh}kWh
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Anomaly + Offline */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTriggerAnomaly}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-900/50 hover:bg-amber-800/50 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all"
              >
                <AlertTriangle size={12} /> Anomaly
              </button>
              <button
                onClick={handleToggleOnline}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-all"
              >
                {simState.isOnline ? <><WifiOff size={12} /> Go Offline</> : <><Wifi size={12} /> Go Online</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
