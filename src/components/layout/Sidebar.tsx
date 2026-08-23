import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, BarChart3, AlertTriangle,
  Wallet, History, X, Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const ownerNav: NavItem[] = [
  { to: '/owner/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/owner/devices', icon: <Cpu size={18} />, label: 'Devices' },
  { to: '/owner/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
  { to: '/owner/ai-alerts', icon: <AlertTriangle size={18} />, label: 'AI Alerts' },
  { to: '/transactions', icon: <History size={18} />, label: 'Transactions' },
];

const consumerNav: NavItem[] = [
  { to: '/consumer/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/consumer/wallet', icon: <Wallet size={18} />, label: 'Wallet' },
  { to: '/transactions', icon: <History size={18} />, label: 'Transactions' },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { role } = useAuth();
  const nav = role === 'owner' ? ownerNav : consumerNav;

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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          {role === 'owner' ? 'Owner Panel' : 'My Account'}
        </p>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
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
          <p className="text-xs text-slate-500">SmartPay Switch v1.0</p>
          <p className="text-xs text-sky-500 mt-0.5">College Project • Demo Mode</p>
        </div>
      </div>
    </aside>
  );
}
