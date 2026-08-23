import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, X } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TITLE = "Pricing — Free QR codes & BT-QR Premium plans";
const DESCRIPTION =
  "Compare the free BT-QR plan with Premium: static QR codes, unlimited dynamic codes, advanced scan analytics, bulk generation and no ads.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Pricing,
});

const free = [
  { label: "Unlimited dynamic QR codes", ok: true },
  { label: "All 17 QR content types", ok: true },
  { label: "PNG, JPG & SVG downloads", ok: true },
  { label: "Colors, shapes, frames & logo", ok: true },
  { label: "Basic scan counter", ok: true },
  { label: "Static QR codes (never expire)", ok: false },
  { label: "Advanced analytics & exports", ok: false },
  { label: "Bulk QR generation", ok: false },
  { label: "Ad-free experience", ok: false },
];

const premium = [
  "Everything in Free",
  "Static QR codes encoded directly",
  "PDF & EPS print-ready exports",
  "Advanced analytics: location, device, time",
  "Bulk QR generation from CSV",
  "Custom branded short links",
  "Ad-free experience",
  "Priority support within 24h",
];

function Pricing() {
  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="border-0 bg-primary/10 text-primary">Simple pricing</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Start free, upgrade when you scale
          </h1>
          <p className="mt-4 text-muted-foreground">
            Every QR code you create on the free plan works forever. Premium adds static codes,
            deeper analytics and bulk tools for teams printing at volume.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="text-xl font-bold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For personal projects and quick one-off codes.
            </p>
            <p className="mt-6 text-4xl font-bold">
              $0<span className="text-base font-medium text-muted-foreground">/month</span>
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/">Create a QR code</Link>
            </Button>
            <ul className="mt-7 space-y-3 text-sm">
              {free.map((row) => (
                <li key={row.label} className="flex items-start gap-3">
                  {row.ok ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={row.ok ? "" : "text-muted-foreground"}>{row.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-card p-7 shadow-glow">
            <Badge className="absolute right-6 top-6 border-0 bg-brand-gradient text-primary-foreground">
              Most popular
            </Badge>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="size-5 text-primary" /> Premium
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For businesses, print campaigns and agencies.
            </p>
            <p className="mt-6 text-4xl font-bold">
              $9<span className="text-base font-medium text-muted-foreground">/month</span>
            </p>
            <Button asChild className="mt-6 w-full bg-brand-gradient text-primary-foreground">
              <Link to="/auth">Get Premium</Link>
            </Button>
            <ul className="mt-7 space-y-3 text-sm">
              {premium.map((label) => (
                <li key={label} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Questions about billing? Visit the{" "}
          <Link to="/support" className="font-medium text-primary hover:underline">
            support centre
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
