import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api-client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    token ? 'loading' : 'error',
  );
  const [message, setMessage] = useState(() =>
    token ? '' : 'No verification token provided',
  );

  useEffect(() => {
    if (!token) return;

    apiRequest<{ message: string }>(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.message ?? 'Verification failed');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="rounded-xl border p-8 max-w-sm w-full text-center"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={40} className="text-green-500" />
            <p className="font-semibold">Email verified!</p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 px-5 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Go to login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <XCircle size={40} className="text-red-500" />
            <p className="font-semibold">Verification failed</p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-medium"
              style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
