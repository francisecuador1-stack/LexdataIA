import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { post, ApiError } from '@/api/client';

interface MfaSetupResponse {
  secret: string;
  otpauthUrl: string;
}

export function MfaSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch MFA setup data on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchSetup() {
      try {
        const data = await post<MfaSetupResponse>('/auth/mfa/setup');
        if (!cancelled) {
          setSecret(data.secret);
          setOtpauthUrl(data.otpauthUrl);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof ApiError ? err.message : 'Error al configurar MFA.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setSetupLoading(false);
      }
    }

    fetchSetup();
    return () => { cancelled = true; };
  }, []);

  async function handleCopy() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text — user can copy manually
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await post('/auth/mfa/verify', { code });
      // MFA configured successfully — redirect to login
      navigate('/login', { state: { mfaConfigured: true }, replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
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
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-900">LEXDATA IA</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Configuración de autenticación en dos pasos
          </p>
        </div>

        {setupLoading && (
          <div className="py-8 text-center text-sm text-slate-500">
            Generando clave de autenticación...
          </div>
        )}

        {!setupLoading && secret && (
          <>
            {/* Instructions */}
            <div className="mb-6 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Paso 1:</span> Abre tu aplicación de autenticación
                (Google Authenticator, Authy, etc.) y agrega una nueva cuenta.
              </p>
              <p>
                <span className="font-semibold">Paso 2:</span> Ingresa la siguiente clave secreta
                manualmente:
              </p>
            </div>

            {/* Secret key display */}
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Clave secreta
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all font-mono text-sm font-bold text-blue-900 select-all">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* OTPAuth URL for advanced users */}
            {otpauthUrl && (
              <details className="mb-6">
                <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
                  Mostrar URI otpauth (avanzado)
                </summary>
                <code className="mt-2 block break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-600 select-all">
                  {otpauthUrl}
                </code>
              </details>
            )}

            {/* Step 3: Verification */}
            <div className="mb-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Paso 3:</span> Ingresa el código de 6 dígitos
                que muestra tu aplicación para verificar la configuración.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="mfaCode" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Código de verificación
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg font-mono tracking-[0.3em] text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  placeholder="000000"
                  disabled={loading}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'Activar MFA'}
              </button>
            </form>
          </>
        )}

        {/* Error during setup fetch */}
        {!setupLoading && !secret && error && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          LOPDP Ecuador &middot; SGPDP &middot; COGNITEX
        </p>
      </div>
    </div>
  );
}
