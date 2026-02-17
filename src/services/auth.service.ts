import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "../types/auth.types";

const REFRESH_TOKEN_KEY = "homesync_refresh_token";
const MOCK_USER_KEY = "homesync_mock_user";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateToken(): string {
  return `mock_${generateId()}_${Date.now()}`;
}

function getStoredUser(): User | null {
  const raw = localStorage.getItem(MOCK_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function storeUser(user: User): void {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

function storeRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function clearTokens(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay(1000);

    const existingUser = getStoredUser();
    if (existingUser && existingUser.email === payload.email) {
      throw new Error("An account with this email already exists");
    }

    const user: User = {
      id: generateId(),
      name: payload.name,
      email: payload.email,
      avatar_url: null,
      google_id: null,
      created_at: new Date().toISOString(),
    };

    const accessToken = generateToken();
    const refreshToken = generateToken();

    storeUser(user);
    storeRefreshToken(refreshToken);

    return { user, access_token: accessToken, refresh_token: refreshToken };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay(1000);

    const storedUser = getStoredUser();

    if (!storedUser || storedUser.email !== payload.email) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateToken();
    const refreshToken = generateToken();
    storeRefreshToken(refreshToken);

    return {
      user: storedUser,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  },

  async googleAuth(): Promise<AuthResponse> {
    await delay(1500);

    let user = getStoredUser();

    if (!user) {
      user = {
        id: generateId(),
        name: "Google User",
        email: "google.user@gmail.com",
        avatar_url: null,
        google_id: `g_${generateId()}`,
        created_at: new Date().toISOString(),
      };
      storeUser(user);
    }

    const accessToken = generateToken();
    const refreshToken = generateToken();
    storeRefreshToken(refreshToken);

    return { user, access_token: accessToken, refresh_token: refreshToken };
  },

  async forgotPassword(_email: string): Promise<{ message: string }> {
    await delay(1000);
    return {
      message:
        "If an account with that email exists, we've sent password reset instructions.",
    };
  },

  async resetPassword(
    _token: string,
    _password: string
  ): Promise<{ message: string }> {
    await delay(1000);
    return { message: "Your password has been reset successfully." };
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    await delay(800);

    const user = getStoredUser();
    if (!user) throw new Error("Not authenticated");

    const updatedUser: User = { ...user, name: payload.name };
    storeUser(updatedUser);
    return updatedUser;
  },

  async changePassword(_payload: ChangePasswordPayload): Promise<{ message: string }> {
    await delay(1000);
    return { message: "Password changed successfully." };
  },

  async refreshToken(): Promise<AuthResponse | null> {
    const token = getRefreshToken();
    if (!token) return null;

    await delay(300);

    const user = getStoredUser();
    if (!user) {
      clearTokens();
      return null;
    }

    const accessToken = generateToken();
    const newRefreshToken = generateToken();
    storeRefreshToken(newRefreshToken);

    return {
      user,
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  },

  logout(): void {
    clearTokens();
  },
};
