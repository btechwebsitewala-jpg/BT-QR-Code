import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  Globe,
  Layers,
  Lock,
  Palette,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

import { AvatarStage } from "@/components/qr/AvatarStage";
import { QRWizard } from "@/components/qr/QRWizard";
import { QR_TYPES, type QRTypeId } from "@/lib/qr/config";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STATS = [
  { label: "QRs Generated", value: "500K+", icon: QrCode },
  { label: "Content Types", value: "17+", icon: Layers },
  { label: "Vector Quality", value: "100%", icon: Download },
  { label: "Scan Reliability", value: "99.9%", icon: Zap },
];

const STEPS = [
  {
    step: "01",
    title: "Select Content Type",
    description: "Choose from 17 supported formats including URLs, vCards, WiFi, PDFs, WhatsApp, and social profiles.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Customize & Brand",
    description: "Select dot styles, corner markers, brand colors, custom frames, and upload your central logo icon.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Download & Track",
    description: "Export ultra high-res PNG, JPG, SVG, or print-ready PDF/EPS, and monitor real-time scan analytics.",
    icon: BarChart3,
  },
];

const FEATURES = [
  {
    icon: RefreshCw,
    title: "Dynamic & Editable Codes",
    text: "Update destination URLs and content anytime without needing to reprint physical posters or merchandise.",
  },
  {
    icon: Download,
    title: "Crisp Vector Exports",
    text: "Download print-ready SVG, EPS, and PDF files that scale infinitely without pixelation or quality loss.",
  },
  {
    icon: Palette,
    title: "Custom Brand Framing",
    text: "Add eye-catching call-to-action frames like 'Scan Me', embed your logo, and apply gradient styling.",
  },
  {
    icon: BarChart3,
    title: "Live Scan Analytics",
    text: "Gain insights into scan counts, top locations, operating systems, and peak scan hours.",
  },
  {
    icon: FileText,
    title: "File Hosting up to 500 MB",
    text: "Upload PDFs, menus, and videos directly to turn them into lightning-fast QR code landing links.",
  },
  {
    icon: Lock,
    title: "Privacy & Zero Watermark",
    text: "All standard QR codes are generated directly in your browser with no forced watermarks and full privacy.",
  },
];

const FAQS = [
  {
    question: "Is BT-QR really 100% free to use?",
    answer:
      "Yes! You can generate unlimited static QR codes with custom colors, templates, and high-resolution downloads completely free without any watermark or expiration.",
  },
  {
    question: "What is the difference between Static and Dynamic QR codes?",
    answer:
      "Static QR codes directly encode data (like a URL or WiFi password) and never change. Dynamic QR codes route through a short link, allowing you to update the target link anytime and track scan metrics even after printing.",
  },
  {
    question: "Can I add my business logo to the center of the QR code?",
    answer:
      "Yes! Our customizer includes an upload tool where you can insert your logo. We automatically adjust the QR code's error correction level (up to 30%) so the code scans seamlessly without camera interference.",
  },
  {
    question: "Which file formats are supported for download?",
    answer:
      "We support high-resolution PNG, JPG, SVG (Scalable Vector Graphics), PDF, and EPS formats, making it easy to use for websites, flyers, packaging, and commercial billboard printing.",
  },
  {
    question: "Do I need an account to create QR codes?",
    answer:
      "No account is required to generate and download QR codes instantly. Creating a free account unlocks saving your codes to a private dashboard and tracking live scan analytics.",
  },
];

function Index() {
  const { type } = Route.useSearch();
  const initialType = QR_TYPES.some((t) => t.id === type) ? (type as QRTypeId) : "url";

  const scrollToGenerator = () => {
    const el = document.getElementById("generator-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-surface-gradient selection:bg-primary/20">
      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* Decorative background glow accents */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[45rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />
        <div className="pointer-events-none absolute top-96 -left-32 -z-10 h-72 w-72 rounded-full bg-chart-2/15 blur-3xl dark:bg-chart-2/10" />

        {/* Hero Section */}
        <section className="mx-auto w-full max-w-7xl px-4 pt-12 text-center sm:px-6 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md transition-colors hover:bg-primary/15">
            <Sparkles className="size-3.5" />
            <span>Smart QR Code Platform &amp; Vector Generator</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Create, Customize &amp; Track <br className="hidden sm:inline" />
            <span className="bg-brand-gradient bg-clip-text text-transparent">Smart QR Codes</span> for Free
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Generate high-precision QR codes for links, WhatsApp, WiFi, vCards, PDFs, and 12+ other types.
            Style with custom brand colors, logos, 3D character avatars, and export print-ready vector formats.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["100% Free Forever", "No Watermark", "Unlimited Scans", "High-Res Vector Export"].map((item) => (
              <span key={item} className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 text-primary" /> {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-brand-gradient px-8 text-primary-foreground shadow-brand hover:opacity-95"
              onClick={scrollToGenerator}
            >
              Create Free QR <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border/80 bg-card/60 backdrop-blur-sm">
              <Link to="/convert">File to Link (up to 500 MB)</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/types">Explore 17+ Types</Link>
            </Button>
          </div>

          {/* Quick Stats Banner */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-md sm:grid-cols-4 sm:p-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center p-2 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </div>
                <div className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Generator Section */}
        <section id="generator-section" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                QR Code Generator Studio
              </h2>
              <p className="text-sm text-muted-foreground">
                Select your content type, customize shapes and colors, and preview live.
              </p>
            </div>
            <Badge variant="secondary" className="border border-border/80 bg-secondary/70">
              Auto-updating Live Preview
            </Badge>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card/70 p-4 shadow-brand backdrop-blur-md sm:p-8">
            <QRWizard initialType={initialType} />
          </div>
        </section>

        {/* 3D Avatar Stage Spotlight */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-8 rounded-3xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-md md:grid-cols-2 sm:p-10">
            <AvatarStage value="https://bt-qr.app" />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>Signage &amp; Poster Mode</span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Your QR, Held by a 3D Character
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Grab immediate attention at store checkouts, restaurant tables, event entrances, and social posts.
                Pick male, female, or custom avatars holding your live QR code card.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Studio-quality 3D full-body renders with realistic lighting",
                  "Perfect for printable standees, table tents, and flyers",
                  "Instant one-click avatar switching with live rendering",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild variant="outline" size="sm">
                  <Link to="/types">
                    Explore all avatar designs <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Process (How It Works) */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              Simple &amp; Fast
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How BT-QR Works in 3 Easy Steps
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Generate commercial-grade QR codes ready for online sharing or large-scale print production in seconds.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="group relative rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <step.icon className="size-6" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-muted-foreground/30">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              Enterprise Grade
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Why Creators &amp; Businesses Choose BT-QR
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Engineered with modern vector standards, error tolerance algorithms, and privacy protection.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/90"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              Help &amp; Questions
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Everything you need to know about generating, styling, and tracking your QR codes.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-md">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-border/60">
                  <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom Call to Action Banner */}
        <section className="mx-auto my-12 w-full max-w-7xl px-4 sm:px-6 sm:my-16">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-center text-primary-foreground shadow-brand sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <ShieldCheck className="mx-auto size-12 opacity-95" />
              <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
                Ready to Upgrade Your QR Experience?
              </h2>
              <p className="mt-3 text-sm opacity-90 sm:text-base">
                Join thousands of creators and businesses generating custom branded QR codes with dynamic links and deep analytics.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 font-semibold shadow-md"
                  onClick={scrollToGenerator}
                >
                  Generate Free QR Now
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/pricing">Explore Pro Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
