import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHousehold } from "../../hooks/useHousehold";
import { useToast } from "../../context/ToastContext";
import { householdService } from "../../services/household.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Logo } from "../../components/ui/Logo";
import { HouseholdAvatar } from "../../components/household/HouseholdAvatar";
import type { Household } from "../../types/household.types";

export function JoinPage() {
  const { joinHousehold } = useHousehold();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(urlCode.toUpperCase().slice(0, 6));
  const [codeError, setCodeError] = useState<string | null>(null);

  const [preview, setPreview] = useState<Household | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [joining, setJoining] = useState(false);

  // Auto-preview if code comes from URL
  useEffect(() => {
    if (urlCode.length === 6) {
      fetchPreview(urlCode.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPreview(c: string) {
    setPreviewing(true);
    setPreviewError(null);
    setPreview(null);
    try {
      const h = await householdService.getHouseholdByCode(c);
      if (!h) {
        setPreviewError("No household found with this code.");
      } else {
        setPreview(h);
      }
    } catch {
      setPreviewError("Could not look up that code. Try again.");
    } finally {
      setPreviewing(false);
    }
  }

  async function handlePreviewSubmit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) { setCodeError("Code is required"); return; }
    if (c.length !== 6) { setCodeError("Must be 6 characters"); return; }
    await fetchPreview(c);
  }

  async function handleJoin() {
    if (!preview) return;
    setJoining(true);
    try {
      await joinHousehold({ code: preview.inviteCode });
      addToast("success", "Joined!", `Welcome to ${preview.name}`);
      navigate("/", { replace: true });
    } catch (err) {
      addToast("error", "Failed to join", (err as Error).message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-line">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Logo size="sm" />
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-[2rem] sm:text-4xl leading-[1.1] text-charcoal">
              Join a Household
            </h1>
            <p className="text-charcoal-muted mt-2 text-sm">
              Enter the 6-character invite code you received.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-line shadow-card p-6 space-y-6">
            {/* Code entry */}
            <form onSubmit={handlePreviewSubmit} className="flex gap-2">
              <Input
                placeholder="A B 3 X 7 M"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 6));
                  setCodeError(null);
                  setPreview(null);
                  setPreviewError(null);
                }}
                error={codeError}
                className="font-mono tracking-widest text-lg text-center"
                autoFocus={!urlCode}
              />
              <Button type="submit" loading={previewing} className="shrink-0">
                Look Up
              </Button>
            </form>

            {/* Preview */}
            {previewing && (
              <div className="flex items-center justify-center py-6 text-charcoal-muted text-sm gap-2">
                <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Looking up household…
              </div>
            )}

            {previewError && !previewing && (
              <div className="flex items-center gap-2 text-error text-sm bg-error-light rounded-lg px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {previewError}
              </div>
            )}

            {preview && !previewing && (
              <div className="rounded-lg bg-cream border border-line p-4 animate-slide-up">
                <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-3">
                  Household Found
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <HouseholdAvatar id={preview.id} name={preview.name} size="md" />
                  <div>
                    <p className="font-semibold text-charcoal">{preview.name}</p>
                    <p className="text-xs text-charcoal-muted">
                      {preview.memberCount} {preview.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                </div>
                <Button fullWidth onClick={handleJoin} loading={joining}>
                  Join {preview.name}
                </Button>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-charcoal-muted hover:text-charcoal transition-colors"
              >
                ← Go back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
