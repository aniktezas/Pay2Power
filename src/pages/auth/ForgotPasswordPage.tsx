import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl text-slate-100">SmartPay<span className="text-sky-400">Switch</span></span>
          </Link>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-100 mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                If an account exists for <strong className="text-slate-200">{email}</strong>, a password reset link has been sent.
              </p>
              <Link to="/login">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-100 mb-1">Reset password</h1>
              <p className="text-sm text-slate-400 mb-6">Enter your email to receive a password reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  required
                />
                <Button type="submit" fullWidth loading={loading}>Send Reset Link</Button>
              </form>
              <p className="text-center text-sm text-slate-400 mt-4">
                <Link to="/login" className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
