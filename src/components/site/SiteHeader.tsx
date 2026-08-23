import { Link } from "@tanstack/react-router";

import logoAsset from "@/assets/bt-qr-logo.png.asset.json";
import { Menu, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const NAV = [
  { to: "/types", label: "QR Types" },
  { to: "/scanner", label: "QR Scanner" },
  { to: "/convert", label: "File to Link" },
  { to: "/pricing", label: "Pricing" },
  { to: "/compare", label: "Compare" },
  { to: "/support", label: "Support" },
] as const;

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="BT-QR logo" className="size-9 rounded-xl bg-white object-contain p-0.5" />
          <span className="font-display text-lg font-bold tracking-tight">BT-QR</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild className="bg-brand-gradient text-primary-foreground hover:opacity-90">
            <Link to="/">Create QR Code</Link>
          </Button>
          {user ? (
            <>
              <Button asChild variant="outline">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1 size-4" /> Dashboard
                </Link>
              </Button>
              {isAdmin ? (
                <Button asChild variant="outline">
                  <Link to="/admin">
                    <ShieldCheck className="mr-1 size-4" /> Admin
                  </Link>
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <Button
                asChild
                className="mt-2 bg-brand-gradient text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                <Link to="/">Create QR Code</Link>
              </Button>
              {user ? (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  {isAdmin ? (
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/admin">Admin panel</Link>
                    </Button>
                  ) : null}
                  <Button variant="ghost" onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/auth">Login</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
