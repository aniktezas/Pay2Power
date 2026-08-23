import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Eye, RefreshCw } from 'lucide-react';
import { aiService } from '../../services/ai.service';
import { deviceService } from '../../services/device.service';
import { getSimulator } from '../../services/simulator.service';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import type { AIAlert, Device } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function AIAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');

  async function loadData() {
    const [als, devs] = await Promise.all([
      aiService.getAlerts(),
      user ? deviceService.getDevices(user.id) : Promise.resolve([]),
    ]);
    setAlerts(als);
    setDevices(devs);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [user]);

  async function handleAcknowledge(alertId: string) {
    await aiService.acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    toast.success('Alert acknowledged');
  }

  async function handleResolve(alertId: string) {
    await aiService.resolveAlert(alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    toast.success('Alert marked as resolved');
  }

  async function triggerTestAnomaly() {
    if (devices.length === 0) { toast.error('No devices available'); return; }
    const deviceId = devices[0].id;
    const alert = await aiService.triggerSimulatedAnomaly(deviceId);
    const sim = getSimulator(deviceId, devices[0].device_code);
    sim.setAnomalyMode(true);
    setTimeout(() => sim.setAnomalyMode(false), 30000);
    setAlerts(prev => [alert, ...prev]);
    toast.success('Simulated anomaly triggered!', { icon: '⚠️' });
  }

  const filtered = alerts.filter(a => filter === 'all' || a.status === filter);
  const activeCount = alerts.filter(a => a.status === 'active').length;

  function getDeviceName(deviceId: string) {
    return devices.find(d => d.id === deviceId)?.device_code ?? deviceId;
  }

  const severityColors: Record<string, string> = {
    critical: 'border-rose-500/30 bg-rose-500/5',
    high: 'border-amber-500/30 bg-amber-500/5',
    medium: 'border-yellow-500/20 bg-yellow-500/5',
    low: 'border-slate-600/50',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Anomaly Alerts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Intelligent consumption monitoring — {activeCount} active alert{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" icon={<AlertTriangle size={14} />} onClick={triggerTestAnomaly}>
            Simulate Anomaly
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-sky-400 mb-1">About AI Monitoring</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              SmartPay monitors consumption patterns and detects anomalies using statistical analysis.
              This prototype uses threshold-based detection. The production system will use an Isolation Forest ML model.
              Alerts are generated when power consumption deviates significantly from the normal range for a device.
              <strong className="text-slate-300"> Note:</strong> Anomalies indicate unusual consumption — not necessarily theft.
              Investigate before taking action.
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'acknowledged', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
            }`}
          >
            {f}
            {f === 'active' && activeCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-xs">{activeCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700/50 p-5 space-y-3">
              <div className="skeleton h-4 w-48 rounded" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={24} />}
          title="No alerts"
          description={filter === 'active' ? 'All devices operating normally.' : `No ${filter} alerts.`}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <Card
              key={alert.id}
              noPadding
              className={`overflow-hidden border ${severityColors[alert.severity] ?? ''}`}
            >
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    size={16}
                    className={
                      alert.severity === 'high' || alert.severity === 'critical' ? 'text-rose-400' :
                      alert.severity === 'medium' ? 'text-amber-400' :
                      'text-slate-400'
                    }
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-slate-100">{getDeviceName(alert.device_id)}</span>
                      <SeverityBadge severity={alert.severity} />
                      <Badge variant={alert.status === 'active' ? 'danger' : alert.status === 'acknowledged' ? 'warning' : 'neutral'}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={11} className="text-slate-500" />
                      <span className="text-xs text-slate-500">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Anomaly score</p>
                    <p className={`text-lg font-mono font-bold ${
                      alert.anomaly_score > 0.8 ? 'text-rose-400' :
                      alert.anomaly_score > 0.5 ? 'text-amber-400' :
                      'text-slate-300'
                    }`}>{alert.anomaly_score.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">{alert.message}</p>

                {alert.severity === 'high' || alert.severity === 'critical' ? (
                  <div className="mb-4 p-3 rounded-lg bg-slate-900">
                    <p className="text-xs text-slate-400 font-semibold mb-2">Possible causes</p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      <li>High-wattage appliance connected (heater, iron, etc.)</li>
                      <li>Multiple appliances running simultaneously</li>
                      <li>Appliance malfunction or short circuit</li>
                      <li>Unusual load — investigate before taking action</li>
                    </ul>
                  </div>
                ) : null}

                {alert.status === 'active' && (
                  <div className="flex gap-2">
                    <Button size="xs" variant="secondary" icon={<Eye size={12} />} onClick={() => handleAcknowledge(alert.id)}>
                      Acknowledge
                    </Button>
                    <Button size="xs" variant="ghost" icon={<CheckCircle size={12} />} onClick={() => handleResolve(alert.id)}>
                      Mark Resolved
                    </Button>
                  </div>
                )}
                {alert.status === 'acknowledged' && (
                  <Button size="xs" variant="ghost" icon={<CheckCircle size={12} />} onClick={() => handleResolve(alert.id)}>
                    Mark Resolved
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
