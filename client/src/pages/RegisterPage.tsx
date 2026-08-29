import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';
import { apiRequest } from '../services/api-client';
import { Loader2, MailCheck } from 'lucide-react';

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const register = useAuthStore((s) => s.register);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(email, password, displayName);
      if (res.accessToken) {
        addToast('Account created! Welcome to Kriya.', 'success');
        navigate('/', { replace: true });
      } else {
        setPendingVerification(email);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingVerification) return;
    setResending(true);
    setError('');
    try {
      await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: pendingVerification }),
      });
      addToast('Verification email sent. Check your inbox.', 'success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  if (pendingVerification) {
    return (
      <AuthLayout title="Verify your email" subtitle="Almost there">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <MailCheck size={24} />
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            We sent a verification link to <strong style={{ color: 'var(--foreground)' }}>{pendingVerification}</strong>.
            Click it to activate your account, then sign in.
          </p>

          {error && (
            <div className="w-full text-sm p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {resending && <Loader2 size={16} className="animate-spin" />}
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>

          <Link
            to="/login"
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Get started with Kriya">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="Your name"
          />
        </div>
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
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            placeholder="At least 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99]"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium underline underline-offset-2" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
