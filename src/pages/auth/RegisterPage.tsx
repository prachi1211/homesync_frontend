import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { GoogleButton } from "../../components/auth/GoogleButton";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validation";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validateForm(): boolean {
    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm_password: validateConfirmPassword(form.password, form.confirm_password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(form);
      addToast("success", "Welcome to HomeSync!", "Your account has been created.");
      navigate("/settings", { replace: true });
    } catch (err) {
      addToast("error", "Registration failed", (err as Error).message);
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
    <AuthLayout title="Create your account" subtitle="Start managing your household together">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          value={form.confirm_password}
          onChange={(e) => handleChange("confirm_password", e.target.value)}
          error={errors.confirm_password}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-charcoal-muted/20" />
        <span className="text-sm text-charcoal-muted">or</span>
        <div className="flex-1 h-px bg-charcoal-muted/20" />
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      <p className="text-center text-sm text-charcoal-light mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
