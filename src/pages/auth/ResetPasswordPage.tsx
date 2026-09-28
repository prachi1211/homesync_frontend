import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/auth.service";
import { useToast } from "../../context/ToastContext";
import { validatePassword, validateConfirmPassword } from "../../utils/validation";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { addToast } = useToast();

  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validateForm(): boolean {
    const newErrors = {
      password: validatePassword(form.password),
      confirm_password: validateConfirmPassword(form.password, form.confirm_password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      addToast("error", "Invalid link", "This password reset link is missing a token. Request a new one.");
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      addToast("success", "Password reset!", "You can now sign in with your new password.");
    } catch (err) {
      addToast("error", "Reset failed", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  if (success) {
    return (
      <AuthLayout title="Password reset!" subtitle="Your password has been updated">
        <div className="space-y-6 animate-slide-up">
          <div className="bg-sage-light/50 border border-sage/20 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <svg className="text-sage mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-charcoal text-sm leading-relaxed">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
            </div>
          </div>

          <Link to="/login">
            <Button fullWidth>Go to Sign In</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Repeat your password"
          value={form.confirm_password}
          onChange={(e) => handleChange("confirm_password", e.target.value)}
          error={errors.confirm_password}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth loading={loading}>
          Reset Password
        </Button>
      </form>

      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline mt-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
