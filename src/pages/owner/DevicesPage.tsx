import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Cpu, QrCode, Settings, Eye, Power, PowerOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { deviceService } from '../../services/device.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DeviceStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Device } from '../../types';
import { formatDateTime, formatTimeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function DevicesPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ deviceCode: '', name: '', location: '' });
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function loadDevices() {
    if (!user) return;
    try {
      const devs = await deviceService.getDevices(user.id);
      setDevices(devs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDevices(); }, [user]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.deviceCode.trim()) e.deviceCode = 'Device code required';
    if (!form.name.trim()) e.name = 'Device name required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !user) return;
    setAdding(true);
    try {
      const dev = await deviceService.addDevice(user.id, form.deviceCode.toUpperCase(), form.name, form.location);
      setDevices(prev => [dev, ...prev]);
      toast.success(`Device ${dev.device_code} added!`);
      setAddOpen(false);
      setForm({ deviceCode: '', name: '', location: '' });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add device');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleDisable(deviceId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'disabled' ? 'offline' : 'disabled';
      await deviceService.updateDevice(deviceId, { status: newStatus as any });
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: newStatus as any } : d));
      toast.success(newStatus === 'disabled' ? 'Device disabled' : 'Device enabled');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Devices</h1>
          <p className="text-sm text-slate-400 mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>Add Device</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 space-y-3 border border-slate-700/50">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-8 w-full rounded" />
            </div>
          ))}
        </div>
      ) : devices.length === 0 ? (
        <EmptyState
          icon={<Cpu size={24} />}
          title="No devices yet"
          description="Add your first SmartPay device. Each device needs a unique code (e.g. SP-SW-00001)."
          action={{ label: 'Add Device', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => (
            <Card key={device.id} noPadding className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-700/50 flex items-center justify-center">
                    <Cpu size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{device.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{device.device_code}</p>
                    {device.location && <p className="text-xs text-slate-600 mt-0.5">{device.location}</p>}
                  </div>
                </div>
                <DeviceStatusBadge status={device.status} />
              </div>
              <div className="px-5 py-3 text-xs text-slate-500 space-y-0.5">
                <p>Added {formatDateTime(device.created_at)}</p>
                {device.last_seen_at && <p>Last seen {formatTimeAgo(device.last_seen_at)}</p>}
              </div>
              <div className="px-5 py-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                <Link to={`/owner/devices/${device.id}`} className="flex-1">
                  <Button variant="ghost" size="xs" icon={<Eye size={13} />} fullWidth>Details</Button>
                </Link>
                <Link to={`/owner/devices/${device.id}/qr`}>
                  <Button variant="outline" size="xs" icon={<QrCode size={13} />}>QR</Button>
                </Link>
                <Link to={`/owner/devices/${device.id}/pricing`}>
                  <Button variant="outline" size="xs" icon={<Settings size={13} />}>Pricing</Button>
                </Link>
                <Button
                  variant={device.status === 'disabled' ? 'secondary' : 'ghost'}
                  size="xs"
                  icon={device.status === 'disabled' ? <Power size={13} /> : <PowerOff size={13} />}
                  onClick={() => handleToggleDisable(device.id, device.status)}
                >
                  {device.status === 'disabled' ? 'Enable' : 'Disable'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add device modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add SmartPay Device">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Device Code"
            value={form.deviceCode}
            onChange={e => setForm(f => ({ ...f, deviceCode: e.target.value.toUpperCase() }))}
            placeholder="SP-SW-00001"
            error={errors.deviceCode}
            hint="Unique identifier printed on the device label"
          />
          <Input
            label="Device Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Room 101 Socket"
            error={errors.name}
          />
          <Input
            label="Location (optional)"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="Hostel Block A"
          />
          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
            <p className="text-xs text-sky-400">
              The device code uniquely identifies this SmartPay device and will appear on the QR code. 
              After adding, configure pricing before sharing the QR with consumers.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={adding}>Add Device</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
