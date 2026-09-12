import { create } from 'zustand';
import { setAccessToken } from '@/api/client';

interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  tenantId: string;
  mfaEnabled?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user: AuthUser, token: string) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
