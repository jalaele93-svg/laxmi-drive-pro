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
  if (!value) return "/partner-dashboard";
  let path = value;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname;
    } catch {
      // ignore
    }
  }
  if (path === "admin" || path.startsWith("/admin")) return "/admin";
  // eslint-disable-next-line no-control-regex
  if (!path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u001f]/.test(path))
    return "/partner-dashboard";
  return path;
}

const ownerEmail = "inofdriving@gmail.com";

function formatPartnerPassword(pwd: string): string {
  // Pad and transform 4-6 char PIN/password deterministically so Supabase Auth's >= 6 length & complexity rules are satisfied
  if (pwd.length >= 4 && pwd.length <= 6) {
    return `Ldt#${pwd}@P2026`;
  }
  return pwd;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const target = safePath(redirect);
  const staffLogin = target.startsWith("/admin");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(staffLogin ? ownerEmail : "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [resendAfter, setResendAfter] = useState(0);

  useEffect(() => {
    if (staffLogin && !email) {
      setEmail(ownerEmail);
    }
  }, [staffLogin, email]);

  useEffect(() => {
    let active = true;
    async function continueAfterVerification() {
      const { data, error } = await supabase.auth.getUser();
      if (!active || error || !data.user) return;
      if (staffLogin && !data.user.email_confirmed_at) {
        setFormError("Please confirm your email before signing in to the staff workspace.");
        return;
      }
      if (staffLogin) {
        const { data: allowed, error: roleError } = await supabase.rpc("is_staff", {
          _user_id: data.user.id,
        });
        if (!active) return;
        if (roleError || !allowed) {
          const { data: roleRow } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .in("role", ["admin", "staff"])
            .maybeSingle();

          if (!roleRow) {
            setFormError(
              `You are currently signed in as "${data.user.email || "User"}". This account does not have Admin / Staff access. Please click "Sign out of current account" below to log in with your Admin account (${ownerEmail}).`,
            );
            return;
          }
        }
      }
      if (active) await navigate({ to: target, replace: true });
    }
    void continueAfterVerification();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        // Defer Auth calls until this callback releases the auth client's lock.
        window.setTimeout(() => {
          if (active) void continueAfterVerification();
        }, 0);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, target, staffLogin]);

  function confirmationUrl() {
    return `${window.location.origin}/auth?redirect=${encodeURIComponent(target)}`;
  }

  async function resendConfirmation() {
    const address = confirmationEmail ?? (staffLogin ? ownerEmail : email.trim());
    if (!address) {
      setFormError("Enter your email address first.");
      return;
    }
    if (Date.now() < resendAfter) {
      toast.info("Please wait one minute before requesting another confirmation email.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: address,
        options: { emailRedirectTo: confirmationUrl() },
      });
      if (error) throw error;
      setResendAfter(Date.now() + 60_000);
      toast.success("Confirmation requested. Check your inbox and spam folder.");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not resend the confirmation email.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    const address = staffLogin ? ownerEmail : email.trim();
    if (!address) {
      setFormError("Enter your email address first.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(address, {
        redirectTo: confirmationUrl(),
      });
      if (error) throw error;
      toast.success(`Password reset email sent to ${address}. Please check your inbox and spam folder.`);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not send password reset email.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      if (mode === "signup") {
        if (staffLogin && email.trim().toLowerCase() !== ownerEmail)
          throw new Error(`Admin registration is reserved for ${ownerEmail}.`);

        const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
        if (!staffLogin && cleanMobile.length !== 10) {
          throw new Error("Enter a valid 10-digit Indian mobile number.");
        }
        if (!fullName.trim()) {
          throw new Error("Enter your full name.");
        }

        if (!staffLogin) {
          if (password.length < 4 || password.length > 6) {
            throw new Error("Partner password / PIN must be between 4 and 6 characters.");
          }
        }

        const targetEmail = staffLogin
          ? ownerEmail
          : email.trim() || `${cleanMobile}@partner.laxmidriving.com`;

        // Cache mapping in local storage so this browser can resolve phone to email
        if (!staffLogin && cleanMobile) {
          try {
            localStorage.setItem(`ldt_partner_phone_${cleanMobile}`, targetEmail);
            if (email.trim()) {
              localStorage.setItem(`ldt_partner_email_${cleanMobile}`, email.trim());
            }
          } catch {
            // Ignore storage errors
          }
        }

        const authPassword = !staffLogin ? formatPartnerPassword(password) : password;

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: targetEmail,
          password: authPassword,
          options: {
            data: {
              full_name: fullName.trim(),
              mobile: cleanMobile || mobile.trim(),
              is_partner: !staffLogin,
            },
            emailRedirectTo: confirmationUrl(),
          },
        });
        if (error) throw error;

        // If email was provided, ask user to check their email
        if (email.trim() || staffLogin) {
          setConfirmationEmail(targetEmail);
          setPassword("");
          setResendAfter(Date.now() + 60_000);
        } else {
          // Partner account created with phone number
          const { data: signInData, error: autoSignInError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: authPassword,
          });
          if (signInData?.session) {
            toast.success("Partner account created and logged in successfully!");
            await navigate({ to: target, replace: true });
            return;
          }
          if (autoSignInError?.message?.toLowerCase().includes("email not confirmed")) {
            throw new Error(
              "Account created! To sign in directly with your mobile number without email verification, disable 'Confirm email' in Supabase Dashboard (Authentication -> Providers -> Email), or provide your real email above to receive a verification link.",
            );
          }
          toast.success("Partner account created! You can now sign in with your mobile number.");
          setMode("signin");
          setPassword("");
        }
      } else {
        // Sign in mode
        let targetEmail = "";
        if (staffLogin) {
          targetEmail = email.trim();
          if (!targetEmail) throw new Error("Enter your staff email address.");
        } else {
          // Partner Login by Phone number
          const rawInput = mobile.trim() || email.trim();
          if (!rawInput) throw new Error("Enter your 10-digit mobile number.");

          if (rawInput.includes("@")) {
            targetEmail = rawInput.toLowerCase();
          } else {
            const cleanMobile = rawInput.replace(/\D/g, "").slice(-10);
            if (cleanMobile.length !== 10) {
              throw new Error("Enter a valid 10-digit mobile number.");
            }
            const cachedEmail =
              localStorage.getItem(`ldt_partner_email_${cleanMobile}`) ||
              localStorage.getItem(`ldt_partner_phone_${cleanMobile}`);
            targetEmail = cachedEmail || `${cleanMobile}@partner.laxmidriving.com`;
          }
        }

        const authPassword = !staffLogin ? formatPartnerPassword(password) : password;

        let signInRes = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: authPassword,
        });

        // If 6-character PIN failed with transformed password, try raw password for backwards compatibility
        if (signInRes.error && !staffLogin && password.length === 6 && authPassword !== password) {
          const fallbackRes = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password,
          });
          if (!fallbackRes.error) {
            signInRes = fallbackRes;
          }
        }

        // Friendly error if phone is not found or user registered with email
        if (signInRes.error && !staffLogin && targetEmail.endsWith("@partner.laxmidriving.com")) {
          const msg = signInRes.error.message.toLowerCase();
          if (msg.includes("invalid") || msg.includes("not found")) {
            throw new Error(
              "Account not found or password incorrect. Please verify your 10-digit mobile number and PIN.",
            );
          }
        }

        if (signInRes.error) {
          const msg = signInRes.error.message.toLowerCase();
          if (msg.includes("email not confirmed")) {
            throw new Error(
              targetEmail.endsWith("@partner.laxmidriving.com")
                ? "Your mobile partner account needs email confirmation. In Supabase Dashboard, disable 'Confirm email' under Authentication -> Providers -> Email, or sign in using your verified email address."
                : "Please check your inbox and click the confirmation link before signing in.",
            );
          }
          throw signInRes.error;
        }
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
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
        title={
          confirmationEmail
            ? "Check Your Email"
            : mode === "signin"
              ? staffLogin
                ? "Admin Login"
                : "Partner Login"
              : staffLogin
                ? "Register Admin Account"
                : "Create Your Partner Account"
        }
        description={
          staffLogin
            ? "Sign in with your authorised staff account."
            : mode === "signin"
              ? "Sign in with your 10-digit mobile number to track or manage your vehicle partner application."
              : "Register your vehicle partner account with your mobile number and a 4 to 6 character password / PIN."
        }
      />

      <section className="section-y">
        <div className="container-page max-w-lg">
          {confirmationEmail ? (
            <div className="card-surface grid gap-5 p-6 sm:p-8" role="status">
              <MailCheck className="size-10 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Confirm your email address</h2>
              <p className="text-sm text-muted-foreground">
                Check <strong className="break-all text-foreground">{confirmationEmail}</strong> for
                a confirmation link, including your spam folder.{" "}
                {staffLogin
                  ? "Staff access activates only after your email is verified."
                  : "Confirm your email to activate your account."}
              </p>
              <Button variant="outline" onClick={resendConfirmation} disabled={busy}>
                Resend confirmation email
              </Button>
              <Button
                onClick={() => {
                  setConfirmationEmail(null);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="card-surface grid gap-5 p-6 sm:p-8">
              {staffLogin && (
                <p className="text-sm text-muted-foreground">
                  Owner email: <strong className="break-all text-foreground">{ownerEmail}</strong>
                  {mode === "signup"
                    ? ". Choose your own password. Email verification is required."
                    : ""}
                </p>
              )}
              {formError && (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 grid gap-3 text-sm text-destructive">
                  <p className="font-medium leading-relaxed">{formError}</p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto font-semibold cursor-pointer"
                    onClick={async () => {
                      setBusy(true);
                      await supabase.auth.signOut();
                      setFormError("");
                      setBusy(false);
                      toast.info("Signed out of current account. You can now log in as Admin.");
                    }}
                  >
                    Sign out of current account & Log In as Admin
                  </Button>
                </div>
              )}

              {/* Full Name field on Signup */}
              {mode === "signup" && (
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
              )}

              {/* Mobile Number field:
                  - In Partner Login: Prominent phone number login
                  - In Signup: Required 10-digit mobile number
              */}
              {(!staffLogin || mode === "signup") && (
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-sm font-semibold">
                    {mode === "signin" ? "Mobile Number" : "Mobile Number"}
                  </label>
                  <input
                    id="mobile"
                    className={fieldClass}
                    required={!staffLogin || mode === "signup"}
                    inputMode="numeric"
                    type="tel"
                    autoComplete={mode === "signin" ? "tel" : "tel"}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                  {mode === "signin" && !staffLogin && (
                    <p className="text-xs text-muted-foreground">
                      Enter your 10-digit registered mobile number.
                    </p>
                  )}
                </div>
              )}

              {/* Email field:
                  - In Staff mode: Required email
                  - In Partner Signup: Optional email
                  - In Partner Signin: Hidden (partner logs in with Phone)
              */}
              {(staffLogin || mode === "signup") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="email" className="block text-sm font-semibold">
                      {staffLogin ? "Staff E-mail ID" : "E-mail ID (Optional)"}
                    </label>
                    {!staffLogin && mode === "signup" && (
                      <span className="text-xs text-muted-foreground">Optional</span>
                    )}
                  </div>
                  <input
                    id="email"
                    type="email"
                    className={fieldClass}
                    required={staffLogin}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={staffLogin ? "name@example.com" : "Optional (for password reset)"}
                  />
                </div>
              )}

              {/* Password / PIN field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold">
                    {!staffLogin ? "Password / PIN" : "Password"}
                  </label>
                  {!staffLogin && (
                    <span className="text-xs text-muted-foreground">4 to 6 characters</span>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  className={fieldClass}
                  required
                  minLength={staffLogin ? (mode === "signup" ? 12 : 6) : 4}
                  maxLength={!staffLogin ? 6 : undefined}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    !staffLogin
                      ? "4 to 6 character password or PIN"
                      : mode === "signup"
                        ? "At least 12 characters"
                        : "Your password"
                  }
                />
                {!staffLogin && (
                  <p className="text-xs text-muted-foreground">
                    {mode === "signup"
                      ? "Choose a 4 to 6 digit PIN or password for your partner account."
                      : "Enter your 4 to 6 digit partner PIN or password."}
                  </p>
                )}
                {staffLogin && mode === "signin" && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      disabled={busy}
                      className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Forgot / Need to set password? Send reset link
                    </button>
                  </div>
                )}
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
                {mode === "signin"
                  ? staffLogin
                    ? "First time signing in?"
                    : "New vehicle partner?"
                  : "Already have an account?"}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setFormError("");
                    if (staffLogin) setEmail(ownerEmail);
                  }}
                >
                  {mode === "signin"
                    ? staffLogin
                      ? "Register admin account"
                      : "Create partner account"
                    : "Sign in instead"}
                </Button>
              </p>
              {mode === "signin" && staffLogin && (
                <Button type="button" variant="link" disabled={busy} onClick={resendConfirmation}>
                  Resend verification email
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Looking for driving classes instead?{" "}
                <Link to="/book" className="font-semibold text-primary hover:underline">
                  Book a lesson
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
