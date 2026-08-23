import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Zap, TrendingUp, Activity, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { deviceService } from '../../services/device.service';
import { analyticsService } from '../../services/analytics.service';
import { aiService } from '../../services/ai.service';
import { getSimulator } from '../../services/simulator.service';
import { MetricCard } from '../../components/ui/MetricCard';
import { DeviceCard } from '../../components/device/DeviceCard';
import { Badge, SeverityBadge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCardSkeleton } from '../../components/ui/Skeleton';
import type { DeviceWithReadings, OwnerDashboardStats, AIAlert } from '../../types';
import { formatTimeAgo, formatCurrency } from '../../utils/formatters';

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceWithReadings[]>([]);
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [devs, st, als] = await Promise.all([
        deviceService.getDevices(user.id),
        analyticsService.getOwnerStats(),
        aiService.getAlerts(),
      ]);

      const devsWithReadings: DeviceWithReadings[] = devs.map(dev => {
        const sim = getSimulator(dev.id, dev.device_code);
        const state = sim.getState();
        return {
          ...dev,
          status: !state.isOnline ? 'offline' : state.isPowerOn ? 'active' : dev.status,
          latest_reading: state.isPowerOn ? {
            id: 'live-' + dev.id,
            device_id: dev.id,
            timestamp: new Date().toISOString(),
            voltage: parseFloat(state.voltage.toFixed(1)),
            current: parseFloat(state.current.toFixed(3)),
            power: parseFloat(state.power.toFixed(1)),
            energy_kwh: parseFloat(state.energyKwh.toFixed(5)),
          } : undefined,
        };
      });

      setDevices(devsWithReadings);
      setStats(st);
      setAlerts(als.filter(a => a.status === 'active').slice(0, 5));
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 bg-slate-800 rounded-lg w-48 mb-2 skeleton" />
          <div className="h-4 bg-slate-800 rounded w-64 skeleton" />
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Good {greeting},{' '}
            <span className="text-sky-400">{user?.profile?.full_name?.split(' ')[0] ?? 'Owner'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            SmartPay Network · Updated {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={loadData}>
          Refresh
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard label="Total Devices" value={stats?.total_devices ?? 0} icon={<Cpu size={20} />} color="sky" sub="Registered" />
        <MetricCard label="Online" value={stats?.online_devices ?? 0} icon={<Activity size={20} />} color="emerald" sub="Currently online" />
        <MetricCard label="Active Sessions" value={devices.filter(d => d.status === 'active').length} icon={<Zap size={20} />} color="amber" sub="Live now" />
        <MetricCard label="Energy Today" value={`${stats?.energy_today_kwh ?? 0} kWh`} icon={<TrendingUp size={20} />} color="sky" sub="Total consumption" />
        <MetricCard label="Revenue Today" value={formatCurrency(stats?.revenue_today ?? 0)} icon={<TrendingUp size={20} />} color="emerald" sub="From sessions" />
      </div>

      {/* Devices + Alerts */}
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Devices</h2>
            <Link to="/owner/devices">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />}>Manage all</Button>
            </Link>
          </div>
          {devices.length === 0 ? (
            <Card className="text-center py-12">
              <Cpu size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">No devices yet</p>
              <Link to="/owner/devices">
                <Button size="sm">Add your first device</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {devices.map(dev => (
                <DeviceCard key={dev.id} device={dev} />
              ))}
            </div>
          )}
        </div>

        {/* Alerts panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">AI Alerts</h2>
            {alerts.length > 0 && <Badge variant="danger" dot>{alerts.length} active</Badge>}
          </div>

          {alerts.length === 0 ? (
            <Card className="text-center py-8">
              <Activity size={24} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No active alerts</p>
              <p className="text-xs text-slate-500 mt-1">All devices operating normally</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <Card key={alert.id} noPadding className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span className="text-xs font-mono text-slate-400">
                        {devices.find(d => d.id === alert.device_id)?.device_code ?? alert.device_id}
                      </span>
                    </div>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{formatTimeAgo(alert.timestamp)}</span>
                      <Link to="/owner/ai-alerts">
                        <button className="text-xs text-sky-400 hover:text-sky-300">View →</button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
              <Link to="/owner/ai-alerts">
                <Button variant="outline" size="sm" fullWidth iconRight={<ArrowRight size={14} />}>
                  View all alerts
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
