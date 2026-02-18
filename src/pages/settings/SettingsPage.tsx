import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { HouseholdAvatar } from "../../components/household/HouseholdAvatar";
import { authService } from "../../services/auth.service";
import {
  validateName,
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validation";

export function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const { households } = useHousehold();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string | null>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  function getInitials(): string {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    setProfileLoading(true);
    try {
      const updatedUser = await authService.updateProfile({ name: name.trim() });
      updateUser(updatedUser);
      addToast("success", "Profile updated");
    } catch (err) {
      addToast("error", "Update failed", (err as Error).message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();

    const errors = {
      current_password: passwordForm.current_password
        ? null
        : "Current password is required",
      new_password: validatePassword(passwordForm.new_password),
      confirm_password: validateConfirmPassword(
        passwordForm.new_password,
        passwordForm.confirm_password
      ),
    };
    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordForm);
      addToast("success", "Password changed");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      addToast("error", "Failed to change password", (err as Error).message);
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    addToast("info", "Signed out", "You've been logged out.");
  }

  function handlePasswordChange(field: string, value: string) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <h1 className="font-display font-extrabold text-3xl text-charcoal tracking-tight">
        Settings
      </h1>

      {/* Profile Section */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-charcoal mb-6">Profile</h2>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center shrink-0">
            <span className="text-primary font-semibold text-xl">
              {getInitials()}
            </span>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex-1 space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              error={nameError}
            />
            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-1.5">
                Email
              </label>
              <div className="w-full rounded-md border border-charcoal-muted/15 bg-cream-dark px-4 py-3 text-charcoal-light text-sm">
                {user?.email}
              </div>
            </div>
            <Button type="submit" size="sm" loading={profileLoading}>
              Save Changes
            </Button>
          </form>
        </div>
      </section>

      {/* Change Password Section */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-charcoal mb-6">
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.current_password}
            onChange={(e) =>
              handlePasswordChange("current_password", e.target.value)
            }
            error={passwordErrors.current_password}
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={passwordForm.new_password}
            onChange={(e) =>
              handlePasswordChange("new_password", e.target.value)
            }
            error={passwordErrors.new_password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              handlePasswordChange("confirm_password", e.target.value)
            }
            error={passwordErrors.confirm_password}
            autoComplete="new-password"
          />
          <Button type="submit" size="sm" loading={passwordLoading}>
            Update Password
          </Button>
        </form>
      </section>

      {/* Households Section */}
      <section className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          Households
        </h2>

        {households.length === 0 ? (
          <div className="flex items-center gap-3 text-charcoal-muted py-8 justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-sm">You haven't joined any households yet.</span>
          </div>
        ) : (
          <ul className="divide-y divide-charcoal-muted/10 mb-4">
            {households.map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-3">
                <HouseholdAvatar id={h.id} name={h.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-sm truncate">{h.name}</p>
                  <p className="text-xs text-charcoal-muted">
                    {h.memberCount} {h.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
                <Badge variant={h.role} />
                {h.role === "owner" && (
                  <Link
                    to="/household/settings"
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Settings
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3 flex-wrap pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/onboarding?mode=create")}
          >
            Create new
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/join")}
          >
            Join a household
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-lg border border-error/20 shadow-sm p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-error mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-charcoal font-medium text-sm">Sign out</p>
            <p className="text-charcoal-muted text-sm">
              Sign out of your HomeSync account on this device
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  );
}
