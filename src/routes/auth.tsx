import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, LogIn, UserPlus, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Staff Registration & Partner Login | Laxmi Driving Training" },
      {
        name: "description",
        content:
          "Sign in to manage Laxmi Driving Training staff operations or track your vehicle partner application.",
      },
      { property: "og:title", content: "Staff & Partner Login | Laxmi Driving Training" },
      {
        property: "og:description",
        content: "Sign in to your Laxmi Driving Training vehicle partner account.",
      },
    ],
  }),
  component: AuthPage,
});

const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/30";

function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return "/partner-dashboard";
  return value;
}

const ownerEmail = "inofdriving@gmail.com";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [resendAfter, setResendAfter] = useState(0);

  const target = safePath(redirect);
  const staffLogin = target.startsWith("/admin");

  useEffect(() => {
    let active = true;
    async function continueAfterVerification() {
      const { data, error } = await supabase.auth.getUser();
      if (!active || error || !data.user) return;
      if (!data.user.email_confirmed_at) {
        setFormError("Please confirm your email before signing in.");
        return;
      }
      if (staffLogin) {
        const { data: allowed, error: roleError } = await supabase.rpc("is_staff", { _user_id: data.user.id });
        if (!active) return;
        if (roleError || !allowed) {
          setFormError("This account does not have staff access. Sign out to use your authorised staff account.");
          return;
        }
      }
      if (active) await navigate({ to: target, replace: true });
    }
    void continueAfterVerification();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        // Defer Auth calls until this callback releases the auth client's lock.
        window.setTimeout(() => { if (active) void continueAfterVerification(); }, 0);
      }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [navigate, target, staffLogin]);

  function confirmationUrl() {
    return `${window.location.origin}/auth?redirect=${encodeURIComponent(target)}`;
  }

  async function resendConfirmation() {
    const address = confirmationEmail ?? (staffLogin ? ownerEmail : email.trim());
    if (!address) { setFormError("Enter your email address first."); return; }
    if (Date.now() < resendAfter) { toast.info("Please wait one minute before requesting another confirmation email."); return; }
    setBusy(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: address, options: { emailRedirectTo: confirmationUrl() } });
      if (error) throw error;
      setResendAfter(Date.now() + 60_000);
      toast.success("Confirmation requested. Check your inbox and spam folder.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not resend the confirmation email.");
    } finally { setBusy(false); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      if (mode === "signup") {
        if (staffLogin && email.trim().toLowerCase() !== ownerEmail) throw new Error(`Admin registration is reserved for ${ownerEmail}.`);
        if (!fullName.trim() || !/^(?:\+91[ -]?)?[6-9]\d{9}$/.test(mobile.trim())) throw new Error("Enter your name and a valid 10-digit Indian mobile number.");
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), mobile: mobile.trim() },
            emailRedirectTo: confirmationUrl(),
          },
        });
        if (error) throw error;
        setConfirmationEmail(email.trim());
        setPassword("");
        setResendAfter(Date.now() + 60_000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      sessionStorage.setItem("ldt_after_login", target);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: confirmationUrl(),
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow={staffLogin ? "Staff workspace" : "Partner account"}
        title={confirmationEmail ? "Check Your Email" : mode === "signin" ? staffLogin ? "Admin Login" : "Partner Login" : staffLogin ? "Register Admin Account" : "Create Your Partner Account"}
        description={staffLogin ? "Sign in with your authorised staff account." : "Use your partner account to apply, upload vehicle documents and track your application status."}
      />

      <section className="section-y">
        <div className="container-page max-w-lg">
          {confirmationEmail ? (
            <div className="card-surface grid gap-5 p-6 sm:p-8" role="status">
              <MailCheck className="size-10 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Confirm your email address</h2>
              <p className="text-sm text-muted-foreground">Check <strong className="break-all text-foreground">{confirmationEmail}</strong> for a confirmation link, including your spam folder. {staffLogin ? "Staff access activates only after your email is verified." : "Confirm your email to activate your account."}</p>
              <Button variant="outline" onClick={resendConfirmation} disabled={busy}>Resend confirmation email</Button>
              <Button onClick={() => { setConfirmationEmail(null); setMode("signin"); }}>Back to sign in</Button>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            </div>
          ) : <form onSubmit={onSubmit} className="card-surface grid gap-5 p-6 sm:p-8">
            {staffLogin && <p className="text-sm text-muted-foreground">Owner email: <strong className="break-all text-foreground">{ownerEmail}</strong>{mode === "signup" ? ". Choose your own password. Email verification is required." : ""}</p>}
            {formError && <div role="alert" className="grid gap-2 text-sm text-destructive"><p>{formError}</p><Button type="button" variant="outline" onClick={async () => { await supabase.auth.signOut(); setFormError(""); }}>Sign out of current account</Button></div>}
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    className={fieldClass}
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-sm font-semibold">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    className={fieldClass}
                    required
                    inputMode="numeric"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold">
                E-mail ID
              </label>
              <input
                id="email"
                type="email"
                className={fieldClass}
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={fieldClass}
                required
                minLength={mode === "signup" ? 12 : 6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 12 characters" : "Your password"}
              />
            </div>

            <Button type="submit" variant="cta" size="xl" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> Please wait…
                </>
              ) : mode === "signin" ? (
                <>
                  <LogIn aria-hidden="true" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus aria-hidden="true" /> Create Account
                </>
              )}
            </Button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button type="button" variant="outline" size="xl" onClick={onGoogle} disabled={busy}>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "signin" ? staffLogin ? "First time signing in?" : "New vehicle partner?" : "Already have an account?"}{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setFormError(""); if (staffLogin) setEmail(ownerEmail); }}
              >
                {mode === "signin" ? staffLogin ? "Register admin account" : "Create an account" : "Sign in instead"}
              </Button>
            </p>
            {mode === "signin" && <Button type="button" variant="link" disabled={busy} onClick={resendConfirmation}>Resend verification email</Button>}
            <p className="text-center text-xs text-muted-foreground">
              Looking for driving classes instead?{" "}
              <Link to="/book" className="font-semibold text-primary hover:underline">
                Book a lesson
              </Link>
            </p>
          </form>}
        </div>
      </section>
    </>
  );
}
