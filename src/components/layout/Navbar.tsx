import { Link, useNavigate } from 'react-router-dom';
import { Zap, Menu, LogOut, User, LayoutDashboard, Building2, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export function PublicNavbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-100 text-lg tracking-tight">SmartPay<span className="text-sky-400">Switch</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/#how-it-works" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">How It Works</Link>
            <Link to="/#features" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Features</Link>
            <Link to="/#use-cases" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Use Cases</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to={user.profile?.role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard'}>
                <Button size="sm" icon={<LayoutDashboard size={14} />}>
                  {user.profile?.role === 'owner' ? 'Owner Dashboard' : 'Client Dashboard'}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function AppNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    navigate('/');
  }

  async function handleToggleDemoRole() {
    const isCurrentlyOwner = user?.profile?.role === 'owner';
    const targetRole = isCurrentlyOwner ? 'consumer' : 'owner';
    const targetEmail = isCurrentlyOwner ? 'client@smartpay.com' : 'owner@smartpay.com';
    try {
      await login(targetEmail, '123456', targetRole);
      toast.success(`Switched to ${targetRole === 'owner' ? 'Owner' : 'Client'} Portal`);
      navigate(targetRole === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
    } catch {
      toast.error('Failed to switch role');
    }
  }

  const role = user?.profile?.role || 'owner';

  return (
    <header className="h-14 border-b border-slate-700/50 bg-slate-900 flex items-center px-4 gap-4">
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
          <Zap size={12} className="text-white" fill="white" />
        </div>
        <span className="font-bold text-slate-100 text-sm">SmartPay<span className="text-sky-400">Switch</span></span>
      </div>

      {/* Role badge */}
      <div className="hidden sm:flex items-center ml-2">
        {role === 'owner' ? (
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-xs text-sky-400 border border-sky-500/20 font-semibold flex items-center gap-1.5">
            <Building2 size={13} /> Owner Portal
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
            <ShoppingCart size={13} /> Client Portal
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Quick Demo Switcher button */}
        <button
          onClick={handleToggleDemoRole}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all"
          title="Switch view between Owner and Client in demo mode"
        >
          <ArrowLeftRight size={12} className="text-sky-400" />
          <span>Switch to {role === 'owner' ? 'Client View' : 'Owner View'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
          <User size={14} />
          <span className="max-w-[120px] truncate">{user?.profile?.full_name ?? user?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
