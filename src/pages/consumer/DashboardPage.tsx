import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Zap, History, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { walletService } from '../../services/wallet.service';
import { sessionService } from '../../services/session.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Wallet, UsageSession } from '../../types';
import { formatCurrency, formatDuration, formatEnergy, formatDateTime } from '../../utils/formatters';
import { describeTermination } from '../../utils/billingEngine';

export function ConsumerDashboardPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [sessions, setSessions] = useState<UsageSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      walletService.getWallet(user.id),
      sessionService.getSessionHistory(user.id),
    ]).then(([wal, hist]) => {
      setWallet(wal);
      setSessions(hist.slice(0, 5));
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome, <span className="text-sky-400">{user?.profile?.full_name?.split(' ')[0] ?? 'Consumer'}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your SmartPay electricity account</p>
      </div>

      {/* Wallet card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-800/70">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Wallet Balance</p>
            {loading ? (
              <div className="h-9 w-28 skeleton rounded-lg mt-1" />
            ) : (
              <p className="text-4xl font-bold font-mono text-slate-100 mt-1">{formatCurrency(wallet?.balance ?? 0)}</p>
            )}
            <p className="text-xs text-sky-400 mt-2">Demo Wallet — Not real money</p>
          </div>
          <div className="text-right space-y-2">
            <Link to="/consumer/wallet">
              <Button size="sm" icon={<ArrowRight size={14} />} iconRight>Add Credit</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick action */}
      <Card className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-4">
          <QrCode size={28} className="text-sky-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-100 mb-2">Purchase Electricity</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
          Scan the QR code on a SmartPay device to access pricing and purchase electricity credit.
        </p>
        <div className="p-3 rounded-lg bg-slate-900 mb-5 max-w-xs mx-auto">
          <p className="text-xs text-slate-400 mb-1">Or enter a device URL directly:</p>
          <p className="text-xs font-mono text-sky-400">yoursite.com/device/SP-SW-00001</p>
        </div>
        <Link to="/device/SP-SW-00001">
          <Button icon={<Zap size={16} />}>Try Demo Device</Button>
        </Link>
      </Card>

      {/* Recent sessions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <History size={18} className="text-sky-400" />
            Recent Sessions
          </h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />}>View all</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Zap size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No sessions yet</p>
            <p className="text-xs text-slate-500 mt-1">Your session history will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(sess => (
              <div key={sess.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-700/30 transition-colors">
                <div>
                  <p className="text-sm text-slate-200 font-mono">{formatDateTime(sess.started_at)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{formatDuration(sess.duration_seconds)}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{formatEnergy(sess.energy_consumed_kwh)}</span>
                    {sess.termination_reason && (
                      <>
                        <span className="text-xs text-slate-600">·</span>
                        <span className={`text-xs ${
                          sess.termination_reason === 'ENERGY_LIMIT_REACHED' ? 'text-emerald-400' :
                          sess.termination_reason === 'TIME_LIMIT_REACHED' ? 'text-sky-400' :
                          'text-slate-400'
                        }`}>
                          {describeTermination(sess.termination_reason)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm font-mono font-semibold text-slate-100">{formatCurrency(sess.amount_paid)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
