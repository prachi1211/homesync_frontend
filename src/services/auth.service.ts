import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "../types/auth.types";
import { api, setTokens, clearTokens, getStoredRefreshToken } from "./api.client";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/auth/register", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/auth/login", payload);
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async googleAuth(): Promise<AuthResponse> {
    throw new Error("Google sign-in is not yet available.");
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return api.post<{ message: string }>("/auth/reset-password", { token, password });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const data = await api.patch<{ user: User }>("/auth/me", payload);
    return data.user;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    return api.patch<{ message: string }>("/auth/me/password", {
      current_password: payload.current_password,
      new_password: payload.new_password,
    });
  },

  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
      const data = await api.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken });
      setTokens(data.access_token, data.refresh_token);
      return data;
    } catch {
      clearTokens();
      return null;
    }
  },

  logout(): void {
    const refreshToken = getStoredRefreshToken();
    // Fire the request BEFORE clearing — apiRequest reads accessToken synchronously
    // when called, so the Authorization header is captured before clearTokens() runs.
    if (refreshToken) {
      api.post("/auth/logout", { refresh_token: refreshToken }).catch(() => {});
    }
    clearTokens();
  },
};
