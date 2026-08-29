import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';
import { apiRequest, ApiClientError } from '../services/api-client';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const [unverified, setUnverified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      if (err instanceof ApiClientError && err.code === 'EMAIL_NOT_VERIFIED') {
        setUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      addToast('Verification email sent. Check your inbox.', 'success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
            {error}
          </div>
        )}
        {unverified && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              border: '1px solid var(--border)',
            }}
          >
            {resending && <Loader2 size={16} className="animate-spin" />}
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99]"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium underline underline-offset-2" style={{ color: 'var(--primary)' }}>
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
