import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthState,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth.types";
import { authService } from "../services/auth.service";

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function tryRefresh() {
      try {
        const result = await authService.refreshToken();
        if (!cancelled && result) {
          setState({
            user: result.user,
            accessToken: result.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // refresh failed — user stays logged out
      }
      if (!cancelled) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    tryRefresh();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setState({
      user: result.user,
      accessToken: result.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    setState({
      user: result.user,
      accessToken: result.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const googleLogin = useCallback(async () => {
    const result = await authService.googleAuth();
    setState({
      user: result.user,
      accessToken: result.access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext
      value={{
        ...state,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
