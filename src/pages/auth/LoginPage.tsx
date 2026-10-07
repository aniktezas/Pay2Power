import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, Building2, ShoppingCart, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';
import type { UserRole } from '../../types';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authenticatedUser = await login(email, password, role);
      const userRole = authenticatedUser.profile?.role || role;
      toast.success(`Signed in as ${userRole === 'owner' ? 'Owner' : 'Client / Consumer'}`);
      navigate(userRole === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
      toast.error(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // Quick 1-click demo login helpers
  async function handleQuickDemo(demoRole: UserRole) {
    setLoading(true);
    try {
      const demoEmail = demoRole === 'owner' ? 'owner@smartpay.com' : 'client@smartpay.com';
      await login(demoEmail, '123456', demoRole);
      toast.success(`Quick demo sign in as ${demoRole === 'owner' ? 'Owner' : 'Client / Consumer'}`);
      navigate(demoRole === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Quick demo login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.15)_0%,_transparent_60%)]" />
        <Link to="/" className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-xl text-slate-100">SmartPay<span className="text-sky-400">Switch</span></span>
        </Link>
        <div className="z-10">
          <h2 className="text-4xl font-bold text-slate-100 mb-4 leading-tight">
            Intelligent prepaid<br />electricity management
          </h2>
          <p className="text-slate-400 text-lg max-w-sm">
            Two distinct portals for Owners and Clients with hybrid time+energy billing and real-time IoT controls.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
              <p className="text-sm font-semibold text-sky-400 flex items-center gap-1.5">
                <ShieldCheck size={16} /> Owner Portal
              </p>
              <p className="text-xs text-slate-400 mt-1">Manage sockets, set hybrid pricing rates, inspect AI alerts & revenue.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <UserCheck size={16} /> Client / Consumer Portal
              </p>
              <p className="text-xs text-slate-400 mt-1">Prepaid wallet, scan QR code, activate electricity with live cutoff.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 z-10">SmartPay Switch — College Project 2026</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <Zap size={14} className="text-white" fill="white" />
                </div>
                <span className="font-bold text-slate-100">SmartPaySwitch</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Sign In</h1>
            <p className="text-slate-400 mt-1 text-sm">Choose your portal to access your dashboard</p>
          </div>

          {/* Role selector distinction */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Portal</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={clsx(
                  'p-3 rounded-xl border text-left transition-all',
                  role === 'owner'
                    ? 'border-sky-500 bg-sky-500/10 text-slate-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={16} className={role === 'owner' ? 'text-sky-400' : 'text-slate-500'} />
                  <span className="text-xs font-bold uppercase tracking-wide">Owner</span>
                </div>
                <p className="text-[11px] text-slate-400">Manage sockets & rates</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('consumer')}
                className={clsx(
                  'p-3 rounded-xl border text-left transition-all',
                  role === 'consumer'
                    ? 'border-emerald-500 bg-emerald-500/10 text-slate-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart size={16} className={role === 'consumer' ? 'text-emerald-400' : 'text-slate-500'} />
                  <span className="text-xs font-bold uppercase tracking-wide">Client / Consumer</span>
                </div>
                <p className="text-[11px] text-slate-400">Prepaid power & usage</p>
              </button>
            </div>
          </div>

          {/* Quick 1-click login buttons for instant demo */}
          <div className="mb-5 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ 1-Click Instant Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemo('owner')}
                className="py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Building2 size={13} /> Demo Owner
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemo('consumer')}
                className="py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <ShoppingCart size={13} /> Demo Client
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === 'owner' ? 'owner@example.com' : 'client@example.com'}
              required
              leftIcon={<Mail size={16} />}
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              leftIcon={<Lock size={16} />}
              rightElement={
                <button type="button" onClick={() => setShowPass(v => !v)} className="text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300">Forgot password?</Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In as {role === 'owner' ? 'Owner' : 'Client'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
