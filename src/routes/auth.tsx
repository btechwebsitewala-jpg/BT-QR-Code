import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const TITLE = "Log in to BT-QR — Save & track your QR codes";
const DESCRIPTION =
  "Create a free BT-QR account to save QR codes, host files, edit dynamic links and see scan analytics.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const friendly = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    if (/invalid login credentials/i.test(message))
      return "Incorrect email or password. Forgot it? Tap “Forgot password?” below.";
    if (/known to be weak|pwned/i.test(message))
      return "That password is too common. Pick something unique (letters + numbers + a symbol).";
    if (/already registered|already been registered|user already/i.test(message))
      return "An account with this email already exists — use the “Log in” tab.";
    if (/email not confirmed/i.test(message))
      return "Please open the confirmation link in your email first, then log in.";
    if (/rate limit|too many/i.test(message))
      return "Too many attempts. Please try again in a few minutes.";
    return message || "Please try again";
  };

  const submit = async (kind: "login" | "signup") => {
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    setBusy(true);
    try {
      if (kind === "login") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { data, error } = await supabase.auth.signUp({
          ...parsed.data,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created", { description: "You're all set — start saving QR codes." });
        } else {
          toast.success("Confirm your email", {
            description: `We sent a confirmation link to ${parsed.data.email}. Open it, then log in.`,
          });
        }
      }
    } catch (error) {
      toast.error(kind === "login" ? "Log in failed" : "Sign up failed", {
        description: friendly(error),
      });
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    const parsedEmail = z.string().trim().email().max(255).safeParse(email);
    if (!parsedEmail.success) {
      toast.error("Enter your account email first, then tap “Forgot password?”");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent", {
        description: `We sent a password reset link to ${parsedEmail.data}. Open it to set a new password (the link expires in 1 hour).`,
      });
    } catch (error) {
      toast.error("Could not send reset link", { description: friendly(error) });
    } finally {
      setBusy(false);
    }
  };


  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-gradient px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-brand sm:p-8">
        <Link to="/" className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground">
            <QrCode className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">BT-QR</span>
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold">Your QR workspace</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Save QR codes, host files and track every scan.
        </p>

        <Tabs defaultValue="login" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          {(["login", "signup"] as const).map((kind) => (
            <TabsContent key={kind} value={kind} className="mt-4 space-y-4">
              <div>
                <Label htmlFor={`${kind}-email`}>Email</Label>
                <Input
                  id={`${kind}-email`}
                  type="email"
                  className="mt-2"
                  autoComplete="email"
                  maxLength={255}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`${kind}-password`}>Password</Label>
                <Input
                  id={`${kind}-password`}
                  type="password"
                  className="mt-2"
                  autoComplete={kind === "login" ? "current-password" : "new-password"}
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button
                className="w-full bg-brand-gradient text-primary-foreground"
                disabled={busy}
                onClick={() => void submit(kind)}
              >
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {kind === "login" ? "Log in" : "Create free account"}
              </Button>
              {kind === "login" ? (
                <button
                  type="button"
                  className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  disabled={busy}
                  onClick={() => void forgot()}
                >
                  Forgot password?
                </button>
              ) : null}

            </TabsContent>
          ))}
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" disabled={busy} onClick={() => void google()}>
          Continue with Google
        </Button>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Back to the QR generator
          </Link>
        </p>
      </div>
    </div>
  );
}
