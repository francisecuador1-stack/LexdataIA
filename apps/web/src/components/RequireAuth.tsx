import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { post, get, ApiError } from '@/api/client';
import { useAuth } from '@/stores/useAuth';

interface RefreshResponse {
  accessToken: string;
}

interface MeResponse {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  tenantId: string;
  mfaEnabled?: boolean;
}

/**
 * Route guard that ensures the user is authenticated.
 * On mount it attempts a silent token refresh via the httpOnly cookie.
 * While restoring the session it renders a loading indicator.
 * If the user is not authenticated it redirects to /login preserving the
 * intended destination in location state.
 */
export function RequireAuth() {
  const { isAuthenticated, login, logout } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(!isAuthenticated);

  useEffect(() => {
    // Already authenticated in-memory — nothing to restore
    if (isAuthenticated) return;

    let cancelled = false;

    async function restoreSession() {
      try {
        // Attempt to get a fresh access token via refresh cookie
        const { accessToken } = await post<RefreshResponse>('/auth/refresh');
        // Temporarily set the token so the /auth/me call is authorized
        const { setAccessToken } = await import('@/api/client');
        setAccessToken(accessToken);

        const user = await get<MeResponse>('/auth/me');

        if (!cancelled) {
          login(user, accessToken);
        }
      } catch (err) {
        // Refresh failed — user needs to log in
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, [isAuthenticated, login, logout]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Route guard that additionally checks the user's role against a list of
 * allowed roles. Must be nested inside <RequireAuth />.
 *
 * Usage:
 *   <Route element={<RequireRole allowed={['DPO_HUMANO', 'SUPERADMIN']} />}>
 *     <Route path="admin" element={<AdminPage />} />
 *   </Route>
 */
export function RequireRole({ allowed }: { allowed: string[] }) {
  const user = useAuth((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed.includes(user.rol)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-slate-700">Acceso denegado</h2>
          <p className="mt-2 text-sm text-slate-500">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
