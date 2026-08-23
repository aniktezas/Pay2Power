import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import type { DailyAnalytics, DeviceAnalytics } from '../../types';
import { formatCurrency } from '../../utils/formatters';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number'
            ? p.name === 'Revenue' ? formatCurrency(p.value) : p.value.toFixed(2)
            : p.value}
        </p>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const [daily, setDaily] = useState<DailyAnalytics[]>([]);
  const [devices, setDevices] = useState<DeviceAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 30>(30);

  useEffect(() => {
    Promise.all([
      analyticsService.getDailyAnalytics(range),
      analyticsService.getDeviceAnalytics(),
    ]).then(([d, devs]) => {
      setDaily(d);
      setDevices(devs);
      setLoading(false);
    });
  }, [range]);

  useEffect(() => {
    setLoading(true);
    analyticsService.getDailyAnalytics(range).then(d => {
      setDaily(d);
      setLoading(false);
    });
  }, [range]);

  const totalEnergy = daily.reduce((sum, d) => sum + d.energy_kwh, 0);
  const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
  const totalSessions = daily.reduce((sum, d) => sum + d.sessions, 0);
  const avgEnergy = totalSessions > 0 ? totalEnergy / totalSessions : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Energy consumption and revenue insights</p>
        </div>
        <div className="flex gap-2">
          {([7, 30] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                range === r
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Energy" value={`${totalEnergy.toFixed(2)} kWh`} icon={<Zap size={20} />} color="sky" sub={`Last ${range} days`} />
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp size={20} />} color="emerald" sub={`Last ${range} days`} />
        <MetricCard label="Total Sessions" value={totalSessions} icon={<BarChart3 size={20} />} color="amber" sub={`Last ${range} days`} />
        <MetricCard label="Avg per Session" value={`${avgEnergy.toFixed(3)} kWh`} icon={<Zap size={20} />} color="sky" sub="Energy average" />
      </div>

      {/* Energy chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Energy Consumption (kWh)</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="h-56 skeleton rounded-lg" />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={d => d.slice(5)}
                  interval={range === 30 ? 4 : 0}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="energy_kwh" name="Energy (kWh)" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue (₹)</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="h-56 skeleton rounded-lg" />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={d => d.slice(5)}
                  interval={range === 30 ? 4 : 0}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Device breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Device Performance Breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Device', 'Total Energy', 'Revenue', 'Sessions', 'Avg Duration', 'Peak Power'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map(dev => (
                <tr key={dev.device_id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-3">
                    <p className="text-sm font-medium text-slate-100">{dev.device_name}</p>
                    <p className="text-xs font-mono text-slate-500">{dev.device_id}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-sky-400">{dev.total_energy.toFixed(2)} kWh</td>
                  <td className="py-3 px-3 font-mono text-xs text-emerald-400">{formatCurrency(dev.total_revenue)}</td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-300">{dev.total_sessions}</td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-300">{dev.avg_session_duration_min} min</td>
                  <td className="py-3 px-3 font-mono text-xs text-amber-400">{dev.peak_power} W</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
