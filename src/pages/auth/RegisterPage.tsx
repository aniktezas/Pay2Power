import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, Building2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [role, setRole] = useState<'owner' | 'consumer'>('owner');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.password, form.fullName, role);
      toast.success('Account created! Welcome to SmartPay.');
      navigate(role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl text-slate-100">SmartPay<span className="text-sky-400">Switch</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join SmartPay Switch to get started</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-300 mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {(['owner', 'consumer'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    role === r
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 hover:border-slate-500'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {r === 'owner' ? <Building2 size={16} className="text-sky-400" /> : <ShoppingCart size={16} className="text-emerald-400" />}
                    <span className="text-sm font-semibold text-slate-100 capitalize">{r}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {r === 'owner' ? 'Manage SmartPay devices & pricing' : 'Purchase & use electricity credits'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              error={errors.fullName}
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email}
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min. 6 characters"
              leftIcon={<Lock size={16} />}
              error={errors.password}
              rightElement={
                <button type="button" onClick={() => setShowPass(v => !v)} className="text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirm password"
              type={showPass ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword}
            />

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
