import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QR_TYPES } from "@/lib/qr/config";

const TITLE = "All Types of QR Codes — BT-QR";
const DESCRIPTION =
  "Browse every QR code type BT-QR can create: URL, PDF, image, vCard, WhatsApp, WiFi, map, event, SMS, email, social media and more.";

export const Route = createFileRoute("/types")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TypesPage,
});

const INITIAL = 12;

function TypesPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QR_TYPES;
    return QR_TYPES.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.includes(q),
    );
  }, [query]);

  const showAll = expanded || Boolean(query.trim());
  const visible = showAll ? matches : matches.slice(0, INITIAL);

  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="font-semibold text-primary hover:underline">
            BT-QR
          </Link>
          <span> / Type</span>
        </nav>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="font-display text-lg font-bold">Choose Type</p>
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/3 rounded-full bg-brand-gradient" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <h1 className="min-w-0 text-2xl font-extrabold sm:text-4xl">All Types Of QR Codes</h1>
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Insert type"
              aria-label="Search QR code types"
              className="h-11 rounded-xl pl-9 pr-9"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((type) => {
            const Icon = type.icon;
            return (
              <Link
                key={type.id}
                to="/"
                search={{ type: type.id }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary/10">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{type.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>

        {matches.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No QR type matches “{query}”. Try “wifi”, “pdf” or “contact”.
          </p>
        ) : null}

        {!showAll && matches.length > INITIAL ? (
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" onClick={() => setExpanded(true)} className="text-primary">
              View More Types <ChevronDown className="ml-1 size-4" />
            </Button>
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
