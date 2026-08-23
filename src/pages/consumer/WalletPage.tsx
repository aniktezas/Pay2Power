import { useEffect, useState } from 'react';
import { Wallet, CreditCard, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { walletService } from '../../services/wallet.service';
import { Card } from '../../components/ui/Card';
import { TransactionStatusBadge } from '../../components/ui/Badge';
import type { Wallet as WalletType, Transaction } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addingAmount, setAddingAmount] = useState<number | null>(null);

  async function loadData() {
    if (!user) return;
    const [wal, txns] = await Promise.all([
      walletService.getWallet(user.id),
      walletService.getTransactions(user.id),
    ]);
    setWallet(wal);
    setTransactions(txns);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [user]);

  async function handleAddCredit(amount: number) {
    if (!user) return;
    setAdding(true);
    setAddingAmount(amount);
    try {
      const updated = await walletService.addCredit(user.id, amount);
      setWallet(updated);
      await loadData();
      toast.success(`₹${amount} added to your wallet`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
      setAddingAmount(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Wallet</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your SmartPay demo credits</p>
      </div>

      {/* Balance */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Wallet size={24} className="text-sky-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Available Balance</p>
            {loading ? (
              <div className="h-9 w-32 skeleton rounded-lg mt-1" />
            ) : (
              <p className="text-3xl font-bold font-mono text-slate-100">{formatCurrency(wallet?.balance ?? 0)}</p>
            )}
            <p className="text-xs text-sky-400 mt-1">Demo Wallet — Not real money</p>
          </div>
        </div>
      </Card>

      {/* Add credit */}
      <Card>
        <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-sky-400" />
          Add Demo Credit
        </h2>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-5">
          <p className="text-xs text-amber-400">
            ⚠️ This is a demo payment system. No real money is involved. Credits are for demonstration purposes only.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[10, 20, 50, 100, 200, 500].map(amount => (
            <button
              key={amount}
              onClick={() => handleAddCredit(amount)}
              disabled={adding}
              className={`py-4 rounded-xl border transition-all text-center disabled:opacity-50 ${
                adding && addingAmount === amount
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-slate-700 hover:border-sky-500/50 hover:bg-sky-500/5'
              }`}
            >
              <p className="text-xl font-bold text-slate-100">₹{amount}</p>
              <p className="text-xs text-slate-500 mt-1">
                {adding && addingAmount === amount ? 'Adding...' : 'Add credit'}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Transactions */}
      <Card>
        <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <History size={18} className="text-sky-400" />
          Transaction History
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-700/30 transition-colors">
                <div>
                  <p className="text-sm text-slate-200 font-mono font-medium">{txn.payment_reference}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(txn.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <TransactionStatusBadge status={txn.status} />
                  <p className={`text-sm font-mono font-semibold ${
                    txn.device_id ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {txn.device_id ? '-' : '+'}{formatCurrency(txn.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
