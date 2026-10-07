import { useState, useEffect } from 'react';
import { 
  Settings, Zap, ZapOff, TrendingUp, FastForward, AlertTriangle, 
  Wifi, WifiOff, X, ChevronDown, ChevronUp, Info, HelpCircle, EyeOff 
} from 'lucide-react';
import { getSimulator } from '../../services/simulator.service';
import { aiService } from '../../services/ai.service';
import toast from 'react-hot-toast';

const AVAILABLE_SIM_DEVICES = [
  { id: 'dev-001', code: 'SP-SW-00001', name: 'Room 101 Socket' },
  { id: 'dev-002', code: 'SP-SW-00002', name: 'Common Room TV' },
  { id: 'dev-003', code: 'SP-SW-00003', name: 'Laundry Machine' },
];

export function DemoControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('dev-001');

  const selectedDevice = AVAILABLE_SIM_DEVICES.find(d => d.id === selectedDeviceId) || AVAILABLE_SIM_DEVICES[0];

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
    const sim = getSimulator(selectedDevice.id, selectedDevice.code);
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
  }, [isDemoMode, selectedDevice]);

  if (!isDemoMode || isDismissed) return null;

  const sim = getSimulator(selectedDevice.id, selectedDevice.code);

  function handleTurnOn() {
    sim.turnOn();
    toast.success(`[ESP32 Simulator] Relay clicked ON: ${selectedDevice.code}`);
  }

  function handleTurnOff() {
    sim.turnOff();
    toast.success(`[ESP32 Simulator] Relay clicked OFF: ${selectedDevice.code}`);
  }

  function handleSetPower(watts: number) {
    sim.setTargetPower(watts);
    toast(`[ESP32 Simulator] Load set to ${watts}W (simulating appliance)`);
  }

  function handleFastForwardEnergy(kwh: number) {
    sim.fastForwardEnergy(kwh);
    toast.success(`Fast-forwarded ${kwh} kWh on ${selectedDevice.code} (testing limit cutoff)`);
  }

  function handleFastForwardTime(minutes: number) {
    sim.fastForwardTime(minutes * 60);
    toast.success(`Fast-forwarded ${minutes} minutes on ${selectedDevice.code} (testing time cutoff)`);
  }

  async function handleTriggerAnomaly() {
    sim.setAnomalyMode(true);
    const alert = await aiService.triggerSimulatedAnomaly(selectedDevice.id);
    setTimeout(() => sim.setAnomalyMode(false), 20000);
    toast.error(`[AI Alert] Anomaly injected on ${selectedDevice.code}! Score: ${alert.anomaly_score.toFixed(2)}`, { icon: '⚠️', duration: 5000 });
  }

  function handleToggleOnline() {
    sim.setOnline(!simState.isOnline);
    toast(simState.isOnline ? `[Simulator] ${selectedDevice.code} went offline (Wi-Fi dropped)` : `[Simulator] ${selectedDevice.code} connected to Wi-Fi`);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating trigger button */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-purple-500/40 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md"
        >
          <Settings size={14} className={simState.isPowerOn ? 'animate-spin' : ''} />
          <span>ESP32 Hardware Simulator</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-slate-200 text-xs"
          title="Hide simulator panel for this session"
        >
          <EyeOff size={14} />
        </button>
      </div>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 sm:w-88 bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-950/70 to-slate-900 border-b border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Settings size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-300">Virtual ESP32 Simulator</p>
                <p className="text-[10px] text-purple-400/80">Hardware mock layer for testing</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowInfo(v => !v)}
                className="p-1 text-purple-400 hover:text-purple-200"
                title="What is this panel?"
              >
                <HelpCircle size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Educational Note / What is this? */}
          {showInfo && (
            <div className="px-4 py-3 bg-purple-950/40 border-b border-purple-500/20 text-[11px] text-slate-300 space-y-1.5">
              <p className="font-semibold text-purple-300 flex items-center gap-1">
                <Info size={13} /> Why does this panel exist?
              </p>
              <p className="text-slate-400 leading-relaxed">
                SmartPay Switch is an IoT product designed for physical ESP32 microcontrollers with relay switches and energy sensors.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Because physical hardware isn't attached to your computer right now, this panel acts as the <strong>virtual device</strong>. You can simulate plugging in appliances, fast-forwarding time to test automatic cutoff, or simulating power tampering.
              </p>
            </div>
          )}

          {/* Device Selector */}
          <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/50 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Target Device:</span>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-purple-400"
            >
              {AVAILABLE_SIM_DEVICES.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Current Live Status */}
          <div className="p-3.5 border-b border-slate-800">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/40">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Wi-Fi Link</p>
                <p className={`font-semibold mt-0.5 ${simState.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {simState.isOnline ? '● Online' : '○ Offline'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/40">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Relay Switch</p>
                <p className={`font-semibold mt-0.5 ${simState.isPowerOn ? 'text-sky-400' : 'text-slate-500'}`}>
                  {simState.isPowerOn ? '⚡ Power ON' : '◯ Relay OFF'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/40">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Load (Watts)</p>
                <p className="text-amber-400 font-mono font-bold mt-0.5">{simState.power.toFixed(1)} W</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/40">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Energy Used</p>
                <p className="text-emerald-400 font-mono font-bold mt-0.5">{simState.energyKwh.toFixed(4)} kWh</p>
              </div>
            </div>
          </div>

          {/* Control Actions */}
          <div className="p-3.5 space-y-3 max-h-[300px] overflow-y-auto">
            {/* Physical switch relay */}
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                1. Relay Control (Switch ON / OFF)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTurnOn}
                  disabled={!simState.isOnline || simState.isPowerOn}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40 transition-all shadow-sm"
                >
                  <Zap size={13} /> Turn Power ON
                </button>
                <button
                  onClick={handleTurnOff}
                  disabled={!simState.isPowerOn}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-40 transition-all shadow-sm"
                >
                  <ZapOff size={13} /> Cutoff Power
                </button>
              </div>
            </div>

            {/* Load levels */}
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                2. Simulate Appliance Load (Watts)
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { w: 50, label: '50W (Bulb)' },
                  { w: 100, label: '100W (Laptop)' },
                  { w: 200, label: '200W (TV)' },
                  { w: 400, label: '400W (Heater)' },
                ].map(item => (
                  <button
                    key={item.w}
                    onClick={() => handleSetPower(item.w)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:border-purple-500/50 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] font-mono transition-all text-center"
                    title={item.label}
                  >
                    {item.w}W
                  </button>
                ))}
              </div>
            </div>

            {/* Fast-forwarding limits */}
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                3. Fast-Forward (Test Automatic Cutoff)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Time Elapsed</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleFastForwardTime(30)}
                      className="py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/40 text-sky-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1"
                    >
                      <FastForward size={10} /> +30m
                    </button>
                    <button
                      onClick={() => handleFastForwardTime(60)}
                      className="py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/40 text-sky-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1"
                    >
                      <FastForward size={10} /> +60m
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Energy Consumed</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleFastForwardEnergy(0.5)}
                      className="py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/40 text-emerald-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1"
                    >
                      <TrendingUp size={10} /> +0.5k
                    </button>
                    <button
                      onClick={() => handleFastForwardEnergy(1.0)}
                      className="py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/40 text-emerald-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1"
                    >
                      <TrendingUp size={10} /> +1.0k
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Anomaly & Connection simulation */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleTriggerAnomaly}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
              >
                <AlertTriangle size={12} /> Inject Anomaly
              </button>
              <button
                onClick={handleToggleOnline}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                {simState.isOnline ? <><WifiOff size={12} /> Drop Wi-Fi</> : <><Wifi size={12} /> Reconnect</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
