import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, BarChart3, AlertTriangle,
  Wallet, History, X, Zap, Building2, ShoppingCart, Plug
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const ownerNav: NavItem[] = [
  { to: '/owner/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/owner/devices', icon: <Cpu size={18} />, label: 'Device Management' },
  { to: '/owner/analytics', icon: <BarChart3 size={18} />, label: 'Energy Analytics' },
  { to: '/owner/ai-alerts', icon: <AlertTriangle size={18} />, label: 'AI Anomaly Alerts' },
  { to: '/transactions', icon: <History size={18} />, label: 'All Transactions' },
];

const consumerNav: NavItem[] = [
  { to: '/consumer/dashboard', icon: <LayoutDashboard size={18} />, label: 'My Dashboard' },
  { to: '/consumer/wallet', icon: <Wallet size={18} />, label: 'Prepaid Wallet' },
  { to: '/device/SP-SW-00001', icon: <Plug size={18} />, label: 'Power Point (QR)' },
  { to: '/transactions', icon: <History size={18} />, label: 'Payment History' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { role } = useAuth();
  const isOwner = role === 'owner';
  const nav = isOwner ? ownerNav : consumerNav;

  return (
    <aside className={clsx(
      'flex flex-col bg-slate-900 border-r border-slate-700/50',
      mobile ? 'w-64 fixed inset-y-0 left-0 z-50 shadow-2xl' : 'w-64 hidden md:flex'
    )}>
      {mobile && (
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-100 text-sm">SmartPaySwitch</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Role Header Banner in Sidebar */}
      <div className="p-4 border-b border-slate-800">
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
          isOwner ? 'bg-sky-500/10 border-sky-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isOwner ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isOwner ? <Building2 size={16} /> : <ShoppingCart size={16} />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100 tracking-wide uppercase">
              {isOwner ? 'Owner Panel' : 'Client Portal'}
            </p>
            <p className="text-[11px] text-slate-400">
              {isOwner ? 'Fleet & Pricing Control' : 'Prepaid Power & Usage'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? isOwner
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-slate-700/50">
        <div className="px-3 py-2 rounded-lg bg-slate-800/50">
          <p className="text-xs text-slate-400 font-semibold">SmartPay Switch</p>
          <p className="text-[11px] text-slate-500 mt-0.5">IoT Retrofit Prepaid Electricity</p>
        </div>
      </div>
    </aside>
  );
}
