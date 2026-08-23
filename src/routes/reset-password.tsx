import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import logoAsset from "@/assets/bt-qr-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Set a new BT-QR password";
const DESCRIPTION = "Choose a new password for your BT-QR account and get back to your QR codes.";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match" });

type LinkState = "checking" | "ready" | "invalid";

function describeLinkError(code: string | null, description: string | null) {
  if (code && /expired/i.test(code)) return "This reset link has expired. Reset links are valid for 1 hour.";
  if (code && /(invalid|not_found|used)/i.test(code))
    return "This reset link is invalid or has already been used.";
  if (description) return description.replace(/\+/g, " ");
  return "We could not verify your reset link. Please request a new one.";
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<LinkState>("checking");
  const [problem, setProblem] = useState<string>("");
  const [resendEmail, setResendEmail] = useState("");

  useEffect(() => {
    let done = false;
    const finishReady = () => {
      if (done) return;
      done = true;
      setState("ready");
    };
    const finishInvalid = (message: string) => {
      if (done) return;
      done = true;
      setProblem(message);
      setState("invalid");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) finishReady();
    });

    void (async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const errorCode = hash.get("error_code") ?? query.get("error_code") ?? hash.get("error") ?? query.get("error");
      const errorDescription = hash.get("error_description") ?? query.get("error_description");

      if (errorCode || errorDescription) {
        finishInvalid(describeLinkError(errorCode, errorDescription));
        return;
      }

      const code = query.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          finishInvalid(describeLinkError(null, error.message));
          return;
        }
        finishReady();
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        finishReady();
        return;
      }

      // Give detectSessionInUrl a moment to consume the recovery tokens in the hash.
      window.setTimeout(() => {
        void supabase.auth.getSession().then(({ data: later }) => {
          if (later.session) finishReady();
          else
            finishInvalid(
              "This page needs a valid reset link. Open the newest “Reset password” email on this device, or request a new link below.",
            );
        });
      }, 1500);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      toast.success("Password updated", { description: "You can use it next time you log in." });
      void navigate({ to: "/dashboard" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/session|jwt|expired|Auth session missing/i.test(message)) {
        setProblem("Your reset link expired before the password was saved. Please request a new link.");
        setState("invalid");
      }
      toast.error("Could not update password", {
        description: /known to be weak|pwned/i.test(message)
          ? "That password is too common. Pick something more unique."
          : message || "Please request a new reset link",
      });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    const parsedEmail = z.string().trim().email().max(255).safeParse(resendEmail);
    if (!parsedEmail.success) {
      toast.error("Enter the email address of your account");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent", {
        description: `Check ${parsedEmail.data} for a fresh password reset link.`,
      });
    } catch (error) {
      toast.error("Could not send reset link", {
        description: error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-gradient px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-brand sm:p-8">
        <Link to="/" className="flex items-center justify-center gap-2">
          <img src={logoAsset} alt="BT-QR logo" className="size-9 rounded-xl bg-white object-contain p-0.5" />
          <span className="font-display text-lg font-bold">BT-QR</span>
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold">Choose a new password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {state === "ready"
            ? "Enter a new password for your account."
            : state === "checking"
              ? "Verifying your reset link…"
              : "Reset link problem"}
        </p>

        {state === "invalid" ? (
          <div className="mt-6 space-y-4">
            <div className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p>{problem}</p>
            </div>
            <div>
              <Label htmlFor="resend-email">Send a new reset link</Label>
              <Input
                id="resend-email"
                type="email"
                className="mt-2"
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={255}
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-brand-gradient text-primary-foreground"
              disabled={busy}
              onClick={() => void resend()}
            >
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Email me a new link
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="new-password">New password</Label>
              <div className="relative mt-2">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  autoComplete="new-password"
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <div className="relative mt-2">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pr-10"
                  autoComplete="new-password"
                  maxLength={72}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button
              className="w-full bg-brand-gradient text-primary-foreground"
              disabled={busy || state !== "ready"}
              onClick={() => void submit()}
            >
              {busy || state === "checking" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Update password
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
