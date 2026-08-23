import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      const user = await login(email, password);
      // Wait a tick for state to settle
      setTimeout(() => {
        const userRole = (user as any)?.profile?.role;
        if (userRole === 'consumer') navigate('/consumer/dashboard');
        else navigate('/owner/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
      toast.error(err.message ?? 'Login failed');
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
            Monitor devices, track consumption, and manage prepaid electricity sessions in real-time.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Hybrid billing', desc: 'Time + Energy' },
              { label: 'Live monitoring', desc: 'Real-time data' },
              { label: 'AI alerts', desc: 'Anomaly detection' },
              { label: 'QR access', desc: 'Easy onboarding' },
            ].map(f => (
              <div key={f.label} className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
                <p className="text-sm font-semibold text-slate-200">{f.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600 z-10">SmartPay Switch — College Project Demo</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <Zap size={14} className="text-white" fill="white" />
                </div>
                <span className="font-bold text-slate-100">SmartPaySwitch</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
            <p className="text-slate-400 mt-1 text-sm">Sign in to your SmartPay account</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
            <p className="text-xs text-sky-400 font-medium mb-1">💡 Demo Mode Active</p>
            <p className="text-xs text-slate-400">No Supabase required. Use any email/password to log in.</p>
            <p className="text-xs text-slate-500 mt-1">Tip: include "consumer" in email for consumer role.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              Sign In
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
