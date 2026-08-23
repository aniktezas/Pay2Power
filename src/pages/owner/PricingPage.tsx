import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, Save, Info } from 'lucide-react';
import { deviceService } from '../../services/device.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import type { Device, Pricing } from '../../types';
import toast from 'react-hot-toast';

export function PricingPage() {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [form, setForm] = useState({ price: '10', timeLimitMinutes: '120', energyLimitKwh: '1.000' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([deviceService.getDevice(id), deviceService.getPricing(id)]).then(([dev, pr]) => {
      setDevice(dev);
      if (pr) {
        setPricing(pr);
        setForm({
          price: pr.price.toString(),
          timeLimitMinutes: pr.time_limit_minutes.toString(),
          energyLimitKwh: pr.energy_limit_kwh.toFixed(3),
        });
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const price = parseFloat(form.price);
    const time = parseInt(form.timeLimitMinutes);
    const energy = parseFloat(form.energyLimitKwh);
    if (isNaN(price) || price <= 0) { toast.error('Invalid price'); return; }
    if (isNaN(time) || time <= 0) { toast.error('Invalid time limit'); return; }
    if (isNaN(energy) || energy <= 0) { toast.error('Invalid energy limit'); return; }

    setSaving(true);
    try {
      const newPricing = await deviceService.setPricing(id, price, time, energy);
      setPricing(newPricing);
      toast.success('Pricing configuration saved!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  }

  const price = parseFloat(form.price) || 0;
  const timeMins = parseInt(form.timeLimitMinutes) || 0;
  const timeHours = (timeMins / 60).toFixed(2);
  const energy = parseFloat(form.energyLimitKwh) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to={`/owner/devices/${id}`}>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Pricing Configuration</h1>
          <p className="text-sm text-slate-400">{device?.name} · {device?.device_code}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Form */}
        <Card>
          <h2 className="text-base font-semibold text-slate-100 mb-5">Set Pricing Rule</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Price (₹) per unit"
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              leftIcon={<span className="text-xs font-bold text-slate-400">₹</span>}
              hint="Amount consumer pays per unit of electricity"
            />
            <Input
              label="Time Limit (minutes)"
              type="number"
              min="1"
              step="1"
              value={form.timeLimitMinutes}
              onChange={e => setForm(f => ({ ...f, timeLimitMinutes: e.target.value }))}
              leftIcon={<Clock size={15} />}
              hint={`= ${timeHours} hours per ₹${price || '?'} unit`}
            />
            <Input
              label="Energy Limit (kWh)"
              type="number"
              min="0.001"
              step="0.001"
              value={form.energyLimitKwh}
              onChange={e => setForm(f => ({ ...f, energyLimitKwh: e.target.value }))}
              leftIcon={<Zap size={15} />}
              hint={`= ${energy.toFixed(3)} kWh per ₹${price || '?'} unit`}
            />
            <Button type="submit" fullWidth loading={saving} icon={<Save size={16} />}>
              Save Pricing
            </Button>
          </form>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-slate-100 mb-4">Live Preview</h2>
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-slate-100 mb-6">₹{price.toFixed(0)}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900">
                  <Clock size={18} className="text-sky-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-100">{timeHours}h</p>
                  <p className="text-xs text-slate-500 mt-0.5">Max time</p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-slate-600 font-bold text-sm">OR</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900">
                  <Zap size={18} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-100">{energy.toFixed(3)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">kWh</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-slate-900 text-left">
                <p className="text-xs text-slate-300 leading-relaxed">
                  "₹{price.toFixed(0)} gives up to{' '}
                  <strong className="text-sky-400">{timeHours} hours</strong>{' '}
                  OR{' '}
                  <strong className="text-emerald-400">{energy.toFixed(3)} kWh</strong>.
                  The first limit reached ends the session automatically."
                </p>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-1">Hybrid Billing</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  SmartPay tracks both time and energy simultaneously. The first limit reached automatically cuts off power. This is the core SmartPay model — do not change to a single-limit approach.
                </p>
              </div>
            </div>
          </div>

          {pricing && (
            <Card>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Currently Active</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Price', val: `₹${pricing.price}` },
                  { label: 'Time limit', val: `${pricing.time_limit_minutes} min (${(pricing.time_limit_minutes / 60).toFixed(1)}h)` },
                  { label: 'Energy limit', val: `${pricing.energy_limit_kwh} kWh` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="text-slate-100 font-mono">{r.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
