import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, LogIn, UserPlus } from "lucide-react";
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
      { title: "Staff & Staff & Partner Login | Laxmi Driving Training" },
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
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/partner-dashboard";
  return value;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const target = safePath(redirect);
  const staffLogin = target.startsWith("/admin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: target, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: target, replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, target]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), mobile: mobile.trim() },
            emailRedirectTo: `${window.location.origin}${target}`,
          },
        });
        if (error) throw error;
        toast.success("Account created. Please check your e-mail to confirm your address.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      sessionStorage.setItem("ldt_after_login", target);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
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
        title={mode === "signin" ? staffLogin ? "Admin Login" : "Partner Login" : staffLogin ? "Create Your Account" : "Create Your Partner Account"}
        description={staffLogin ? "Sign in with your authorised staff account." : "Use your partner account to apply, upload vehicle documents and track your application status."}
      />

      <section className="section-y">
        <div className="container-page max-w-lg">
          <form onSubmit={onSubmit} className="card-surface grid gap-5 p-6 sm:p-8">
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
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              {mode === "signin" ? "New vehicle partner?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Create an account" : "Sign in instead"}
              </button>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Looking for driving classes instead?{" "}
              <Link to="/book" className="font-semibold text-primary hover:underline">
                Book a lesson
              </Link>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
