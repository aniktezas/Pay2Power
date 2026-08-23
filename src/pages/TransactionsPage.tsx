import { useEffect, useState } from 'react';
import { History, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { walletService } from '../services/wallet.service';
import { Card } from '../components/ui/Card';
import { TransactionStatusBadge } from '../components/ui/Badge';
import type { Transaction } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (!user) return;
    walletService.getTransactions(user.id).then(txns => {
      setTransactions(txns);
      setLoading(false);
    });
  }, [user]);

  const filtered = transactions.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          {(['all', 'success', 'pending', 'failed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <History size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/50">
                <tr>
                  {['Reference', 'Device', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(txn => (
                  <tr key={txn.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-slate-200 font-medium">{txn.payment_reference}</td>
                    <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                      {txn.device_id ? txn.device_id.slice(0, 12) + '...' : <span className="text-slate-600">Wallet top-up</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-mono font-semibold ${
                        txn.device_id ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {txn.device_id ? '-' : '+'}{formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4"><TransactionStatusBadge status={txn.status} /></td>
                    <td className="py-4 px-4 text-xs text-slate-400">{formatDateTime(txn.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
