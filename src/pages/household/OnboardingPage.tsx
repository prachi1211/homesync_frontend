import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useHousehold } from "../../hooks/useHousehold";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Logo } from "../../components/ui/Logo";
import { CopyButton } from "../../components/ui/CopyButton";
import { validateName } from "../../utils/validation";
import type { Household } from "../../types/household.types";

type Step = "CHOICE" | "CREATE_FORM" | "SUCCESS";

export function OnboardingPage() {
  const { createHousehold, joinHousehold } = useHousehold();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("CHOICE");

  // Create form
  const [householdName, setHouseholdName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createdHousehold, setCreatedHousehold] = useState<Household | null>(null);

  // Join form (inline on choice screen)
  const [inviteCode, setInviteCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const err = validateName(householdName);
    if (err) { setNameError(err); return; }

    setCreateLoading(true);
    try {
      const household = await createHousehold({ name: householdName.trim() });
      setCreatedHousehold(household);
      setStep("SUCCESS");
    } catch (err) {
      addToast("error", "Failed to create", (err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (!code) { setCodeError("Invite code is required"); return; }
    if (code.length !== 6) { setCodeError("Must be 6 characters"); return; }

    setJoinLoading(true);
    try {
      const household = await joinHousehold({ code });
      addToast("success", "Joined household!", `Welcome to ${household.name}`);
      navigate("/", { replace: true });
    } catch (err) {
      addToast("error", "Failed to join", (err as Error).message);
    } finally {
      setJoinLoading(false);
    }
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const shareUrl = createdHousehold
    ? `${window.location.origin}/join?code=${createdHousehold.inviteCode}`
    : "";

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-charcoal-muted/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">

        {/* ── STEP 1: Choice cards ─────────────────────────────────────── */}
        {step === "CHOICE" && (
          <div className="w-full max-w-4xl animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="font-display font-extrabold text-4xl text-charcoal tracking-tight">
                Welcome to HomeSync, {firstName}!
              </h1>
              <p className="text-charcoal-muted mt-3 text-lg">
                Create a new household or join one with an invite code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Create card */}
              <div className="bg-white rounded-xl border border-charcoal-muted/10 shadow-md p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 cursor-default">
                <div>
                  <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-charcoal">Create a Household</h2>
                  <p className="text-charcoal-muted mt-2 text-sm leading-relaxed">
                    Start fresh with a new household. You'll be the owner and can invite your roommates or family with a shareable code.
                  </p>
                </div>
                <Button
                  fullWidth
                  className="mt-8"
                  onClick={() => setStep("CREATE_FORM")}
                >
                  Let's Start
                </Button>
              </div>

              {/* Join card */}
              <div className="bg-white rounded-xl border border-charcoal-muted/10 shadow-md p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 cursor-default">
                <div>
                  <div className="w-14 h-14 bg-sage-light rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-charcoal">Join a Household</h2>
                  <p className="text-charcoal-muted mt-2 text-sm leading-relaxed">
                    Got an invite code from a roommate? Enter it below to join their household and see all shared activity instantly.
                  </p>
                </div>

                <form onSubmit={handleJoin} className="mt-8 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value.toUpperCase().slice(0, 6));
                        if (codeError) setCodeError(null);
                      }}
                      placeholder="INVITE CODE"
                      className={`w-full px-4 py-4 rounded-lg font-mono font-bold text-center text-2xl tracking-[0.4em] text-charcoal bg-cream-dark border outline-none transition-all focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-charcoal-muted/40 placeholder:text-base placeholder:tracking-widest ${
                        codeError
                          ? "border-error focus:ring-error"
                          : "border-charcoal-muted/20"
                      }`}
                    />
                    {codeError && (
                      <p className="text-error text-xs mt-1.5 ml-1">{codeError}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    fullWidth
                    variant="secondary"
                    loading={joinLoading}
                  >
                    Join Household
                  </Button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ── STEP 2: Create form ──────────────────────────────────────── */}
        {step === "CREATE_FORM" && (
          <div className="w-full max-w-md animate-slide-in-right">
            <div className="bg-white rounded-xl border border-charcoal-muted/10 shadow-md p-8 space-y-7">
              <button
                type="button"
                onClick={() => setStep("CHOICE")}
                className="flex items-center gap-1.5 text-sm font-medium text-charcoal-muted hover:text-charcoal transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back
              </button>

              <div className="text-center">
                <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-charcoal">New Household</h2>
                <p className="text-charcoal-muted text-sm mt-1">
                  Give your home a name. You can always rename it later.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Household Name"
                  placeholder="e.g. Apartment 4B, The Smith Family"
                  value={householdName}
                  onChange={(e) => {
                    setHouseholdName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  error={nameError}
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  loading={createLoading}
                  disabled={!householdName.trim()}
                >
                  Create &amp; Get Invite Code
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── STEP 3: Success ──────────────────────────────────────────── */}
        {step === "SUCCESS" && createdHousehold && (
          <div className="w-full max-w-md animate-slide-up">
            <div className="bg-white rounded-xl border border-charcoal-muted/10 shadow-md p-8 space-y-6 text-center">
              {/* Animated checkmark */}
              <div className="w-20 h-20 bg-sage-light rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-sage-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-charcoal">
                  {createdHousehold.name} is ready!
                </h2>
                <p className="text-charcoal-muted text-sm mt-1">
                  Share the code below so your household can join.
                </p>
              </div>

              {/* Invite code block */}
              <div className="bg-primary-light rounded-xl border border-primary/10 p-5 space-y-4">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                  Share Invite Code
                </p>
                <div className="flex items-center justify-between gap-3 bg-white rounded-lg px-5 py-4 border border-primary/10 shadow-sm">
                  <span className="text-3xl font-black font-mono text-primary tracking-[0.35em]">
                    {createdHousehold.inviteCode}
                  </span>
                  <CopyButton text={createdHousehold.inviteCode} />
                </div>
                <CopyButton text={shareUrl} label="Copy Invite Link" className="w-full justify-center" />
              </div>

              <Button fullWidth onClick={() => navigate("/", { replace: true })}>
                Enter Dashboard
              </Button>

              <p className="text-xs text-charcoal-muted">
                You can always find this code in Household Settings.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
