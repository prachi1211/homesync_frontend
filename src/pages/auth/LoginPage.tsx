import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { GoogleButton } from "../../components/auth/GoogleButton";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { validateEmail, validatePassword } from "../../utils/validation";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validateForm(): boolean {
    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(form);
      addToast("success", "Welcome back!");
      navigate("/settings", { replace: true });
    } catch (err) {
      addToast("error", "Login failed", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await googleLogin();
      addToast("success", "Welcome!", "Signed in with Google.");
      navigate("/settings", { replace: true });
    } catch (err) {
      addToast("error", "Google sign-in failed", (err as Error).message);
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your HomeSync account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-charcoal-muted/20" />
        <span className="text-sm text-charcoal-muted">or</span>
        <div className="flex-1 h-px bg-charcoal-muted/20" />
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      <p className="text-center text-sm text-charcoal-light mt-8">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
