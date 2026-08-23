import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";

const TITLE = "Static vs dynamic QR codes — BT-QR comparison";
const DESCRIPTION =
  "Understand the difference between static and dynamic QR codes, when to use each, and how BT-QR compares with other QR code generators.";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Compare,
});

const rows: { feature: string; dynamic: boolean | string; staticQr: boolean | string }[] = [
  { feature: "Editable destination after printing", dynamic: true, staticQr: false },
  { feature: "Scan tracking & analytics", dynamic: true, staticQr: false },
  { feature: "Works without our servers", dynamic: false, staticQr: true },
  { feature: "Smaller, simpler QR pattern", dynamic: true, staticQr: false },
  { feature: "Best for long content (vCard, WiFi)", dynamic: false, staticQr: true },
  { feature: "Available on Free Plan", dynamic: "5 Codes", staticQr: "Unlimited" },
  { feature: "3D Character Avatar Mode", dynamic: "Lite / Premium", staticQr: false },
];

const competitors = [
  { feature: "17 content types", btqr: true, others: "Usually 8–10" },
  { feature: "Live customisation preview", btqr: true, others: true },
  { feature: "Logo QR at no cost", btqr: true, others: "Paid" },
  { feature: "PNG, JPG, SVG, PDF, EPS export", btqr: true, others: "PNG only on free" },
  { feature: "Watermark-free downloads", btqr: true, others: false },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm text-muted-foreground">{value}</span>;
  return value ? (
    <Check className="mx-auto size-5 text-primary" />
  ) : (
    <Minus className="mx-auto size-5 text-muted-foreground" />
  );
}

function Compare() {
  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Static vs dynamic QR codes
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A dynamic QR code encodes a short BT-QR link that redirects to your content, so you can
          change the destination later and count every scan. A static QR code encodes your content
          directly — nothing to maintain, but nothing to edit or measure either.
        </p>

        <section className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-sm">
              <tr>
                <th className="p-4 font-semibold">Feature</th>
                <th className="p-4 text-center font-semibold">Dynamic</th>
                <th className="p-4 text-center font-semibold">Static</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-t border-border">
                  <td className="p-4 text-sm">{row.feature}</td>
                  <td className="p-4 text-center">
                    <Cell value={row.dynamic} />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.staticQr} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <h2 className="mt-14 text-2xl font-bold">BT-QR vs other generators</h2>
        <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-sm">
              <tr>
                <th className="p-4 font-semibold">Feature</th>
                <th className="p-4 text-center font-semibold">BT-QR</th>
                <th className="p-4 text-center font-semibold">Typical free tools</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((row) => (
                <tr key={row.feature} className="border-t border-border">
                  <td className="p-4 text-sm">{row.feature}</td>
                  <td className="p-4 text-center">
                    <Cell value={row.btqr} />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.others} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild className="bg-brand-gradient text-primary-foreground">
            <Link to="/">Create a QR code</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/pricing">See pricing</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
