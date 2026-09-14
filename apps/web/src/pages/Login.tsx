import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { post, setAccessToken, ApiError } from '@/api/client';
import { useAuth } from '@/stores/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

interface LoginResponse {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    tenantId: string;
    mfaEnabled?: boolean;
  };
  accessToken: string;
  mfaSetupRequired?: boolean;
  /** Partial token issued when MFA verification is still needed */
  partialToken?: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(() => {
    const state = location.state as { mfaConfigured?: boolean } | null;
    return state?.mfaConfigured
      ? 'MFA configurado correctamente. Inicia sesión nuevamente.'
      : null;
  });

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Google Sign-In callback
  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const data = await post<LoginResponse>('/auth/google', { idToken: response.credential });

      if (data.mfaSetupRequired) {
        if (data.accessToken) setAccessToken(data.accessToken);
        navigate('/mfa-setup', { state: {} });
        return;
      }

      // If MFA required (user has MFA enabled), need TOTP code
      if ((data as any).mfaRequired) {
        if (data.accessToken) setAccessToken(data.accessToken);
        setNeedsMfa(true);
        setError('Ingresa el código de tu aplicación de autenticación.');
        return;
      }

      login(data.user, data.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  }, [from, login, navigate]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        locale: 'es',
      });
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [handleGoogleCredential]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const body: Record<string, string> = { email, password };
      if (needsMfa && totpCode) {
        body.totpCode = totpCode;
      }

      const data = await post<LoginResponse>('/auth/login', body);

      // Backend indicates the user must configure MFA before proceeding
      if (data.mfaSetupRequired) {
        if (data.partialToken) {
          setAccessToken(data.partialToken);
        }
        navigate('/mfa-setup', { state: { email, password } });
        return;
      }

      // Successful login
      login(data.user, data.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        // Server requires TOTP code — switch to MFA input
        if (err.statusCode === 401 && err.message === 'Código MFA requerido') {
          setNeedsMfa(true);
          setTotpCode('');
          setError('Ingresa el código de tu aplicación de autenticación.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Error de conexión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-900">LEXDATA IA</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Sistema de Gestión de Protección de Datos Personales
          </p>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMsg}
          </div>
        )}

        {/* Error banner */}
        {error && !needsMfa && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="usuario@empresa.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* TOTP code (shown when MFA is required) */}
          {needsMfa && (
            <div>
              <label htmlFor="totpCode" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Código de verificación (6 dígitos)
              </label>
              <input
                id="totpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg font-mono tracking-[0.3em] text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                placeholder="000000"
                disabled={loading}
                autoFocus
                autoComplete="one-time-code"
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verificando...' : needsMfa ? 'Verificar código' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">o</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div ref={googleBtnRef} className="flex justify-center" />
          </>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          LOPDP Ecuador &middot; SGPDP &middot; COGNITEX
        </p>
      </div>
    </div>
  );
}
