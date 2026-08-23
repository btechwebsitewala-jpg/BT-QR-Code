import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Palette, RefreshCw, ShieldCheck, Zap } from "lucide-react";

import { AvatarStage } from "@/components/qr/AvatarStage";
import { QRWizard } from "@/components/qr/QRWizard";
import { QR_TYPES, type QRTypeId } from "@/lib/qr/config";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TITLE = "BT-QR — Create & Customize QR Codes for FREE";
const DESCRIPTION =
  "Free QR code generator for links, WhatsApp, vCard, WiFi, PDF, video, location and 11 more types. Custom colours, logo, frames and PNG, SVG, PDF or EPS download.";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { type?: string } =>
    typeof search["type"] === "string" ? { type: search["type"] } : {},
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: Zap, title: "17 content types", text: "Links, WiFi, vCard, WhatsApp, PDFs, events and more." },
  { icon: Palette, title: "Full design control", text: "Colours, dot shapes, frames, templates and centre logo." },
  { icon: RefreshCw, title: "Editable after print", text: "Dynamic QR codes keep working when content changes." },
  { icon: BarChart3, title: "Live scan analytics", text: "Track scans by day, device type and location." },
];

function Index() {
  const { type } = Route.useSearch();
  const initialType = QR_TYPES.some((t) => t.id === type) ? (type as QRTypeId) : "url";

  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 text-center sm:px-6 sm:pt-16">
          <Badge variant="secondary" className="mb-4 border-0 bg-accent text-accent-foreground">
            No signup needed to generate
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Create &amp; Customize <span className="text-brand-gradient">QR Code</span> for FREE
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Pick a content type, style it to match your brand and download a print-ready QR code in
            PNG, JPG, SVG, PDF or EPS — generated instantly in your browser.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Unlimited free QR codes", "No watermark", "Works offline once loaded"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" /> {item}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="lg">
              <Link to="/types">Browse all 17 QR types</Link>
            </Button>
            <Button asChild size="lg" className="bg-brand-gradient text-primary-foreground hover:opacity-90">
              <Link to="/convert">File to link — up to 500 MB</Link>
            </Button>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl items-center gap-8 text-left md:grid-cols-2">
            <AvatarStage value="https://bt-qr.app" />
            <div>
              <Badge variant="secondary" className="border-0 bg-accent text-accent-foreground">
                Pick your avatar
              </Badge>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Your QR, held by a 3D character
              </h2>
              <p className="mt-3 text-muted-foreground">
                Choose a male, female or robot avatar — each one shown full body holding your live QR
                panel. Perfect for posters, social posts and shop signage.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "Full-body 3D renders with soft studio shadows",
                  "Male, female and other avatar options",
                  "Switch avatars instantly for posters and social posts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <QRWizard initialType={initialType} />
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-border bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-bold">{feature.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-center text-primary-foreground sm:px-12">
            <ShieldCheck className="mx-auto size-10 opacity-90" />
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Go Premium for static QR codes</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
              Unlock static codes that never expire, advanced analytics, bulk generation and an
              ad-free workspace.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
