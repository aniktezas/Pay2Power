import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { deviceService } from '../../services/device.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Device } from '../../types';
import toast from 'react-hot-toast';

export function DeviceQRPage() {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    deviceService.getDevice(id).then(async dev => {
      setDevice(dev);
      if (dev) {
        const deviceUrl = `${window.location.origin}/device/${dev.device_code}`;
        try {
          const dataUrl = await QRCode.toDataURL(deviceUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#0f172a', light: '#f8fafc' },
            errorCorrectionLevel: 'H',
          });
          setQrDataUrl(dataUrl);
        } catch (err) {
          console.error('QR generation failed', err);
        }
      }
      setLoading(false);
    });
  }, [id]);

  function handleDownload() {
    if (!qrDataUrl || !device) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `smartpay-qr-${device.device_code}.png`;
    a.click();
    toast.success('QR code downloaded');
  }

  function handlePrint() {
    if (!qrDataUrl || !device) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>SmartPay QR - ${device.device_code}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Inter,sans-serif;background:#0f172a;color:#f1f5f9;margin:0;padding:32px;box-sizing:border-box;">
          <h2 style="margin:0 0 4px;font-size:22px;">SmartPay<span style="color:#38bdf8">Switch</span></h2>
          <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;">${device.name}</p>
          <img src="${qrDataUrl}" style="border-radius:16px;width:300px;height:300px;" />
          <p style="margin:20px 0 4px;font-size:22px;letter-spacing:4px;font-weight:bold;">${device.device_code}</p>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0;">Scan to purchase electricity · SmartPay Switch</p>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

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
        <p className="text-slate-400">Device not found</p>
      </div>
    );
  }

  const deviceUrl = `${window.location.origin}/device/${device.device_code}`;

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link to={`/owner/devices/${id}`}>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Device QR Code</h1>
          <p className="text-sm text-slate-400">{device.name}</p>
        </div>
      </div>

      <Card className="text-center">
        <div className="mb-6">
          <p className="text-lg font-bold text-slate-100">SmartPay<span className="text-sky-400">Switch</span></p>
          <p className="text-sm text-slate-400 mt-1">{device.name}</p>
        </div>

        {qrDataUrl ? (
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-50 rounded-2xl inline-block shadow-lg">
              <img src={qrDataUrl} alt={`QR Code for ${device.device_code}`} className="w-64 h-64" />
            </div>
          </div>
        ) : (
          <div className="w-64 h-64 bg-slate-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <QrIcon size={48} className="text-slate-500" />
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 mb-5">
          <QrIcon size={16} className="text-sky-400" />
          <span className="font-mono text-lg font-bold text-slate-100 tracking-widest">{device.device_code}</span>
        </div>

        <div className="mb-5 p-3 rounded-lg bg-slate-900 border border-slate-700 text-left">
          <p className="text-xs text-slate-500 mb-1">Consumer access URL</p>
          <p className="text-xs font-mono text-sky-400 break-all">{deviceUrl}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" icon={<Download size={16} />} fullWidth onClick={handleDownload}>
            Download QR
          </Button>
          <Button variant="outline" icon={<Printer size={16} />} onClick={handlePrint}>
            Print
          </Button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
          <p className="text-xs text-sky-400">
            💡 This QR only contains the device identifier. No passwords or sensitive credentials are stored in the QR code.
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-100 mb-3">How consumers use this QR</h3>
        <ol className="space-y-2.5">
          {[
            'Consumer scans QR code with any smartphone camera',
            'Browser opens this device\'s purchase page',
            'Consumer logs in or creates a SmartPay account',
            'Consumer sees current pricing and purchases electricity credit',
            'Session starts immediately — electricity turns ON',
            'Electricity stops automatically when time OR energy limit is reached',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
