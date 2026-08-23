import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  CheckCircle2,
  Globe,
  Heart,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import logoAsset from "@/assets/bt-qr-logo.png";
import { Button } from "@/components/ui/button";

const QR_TYPE_LINKS = [
  { to: "/types?type=url", label: "Website URL" },
  { to: "/types?type=wifi", label: "WiFi Password" },
  { to: "/types?type=vcard", label: "vCard Digital Contact" },
  { to: "/types?type=whatsapp", label: "WhatsApp Direct Chat" },
  { to: "/types?type=pdf", label: "PDF & Documents" },
  { to: "/types?type=social", label: "Social Media Hub" },
  { to: "/types", label: "Explore all 17+ Types →" },
] as const;

const FEATURE_LINKS = [
  { to: "/", label: "QR Code Generator" },
  { to: "/scanner", label: "Web QR Scanner" },
  { to: "/convert", label: "File to Link (500 MB)" },
  { to: "/compare", label: "Static vs Dynamic Codes" },
  { to: "/pricing", label: "Vector Exports (SVG/PDF)" },
  { to: "/dashboard", label: "Live Scan Analytics" },
] as const;

const INDUSTRY_LINKS = [
  { to: "/types?type=url", label: "Restaurants & Menus" },
  { to: "/types?type=url", label: "Retail & E-Commerce" },
  { to: "/types?type=location", label: "Real Estate & Maps" },
  { to: "/types?type=event", label: "Events & Ticketing" },
  { to: "/types?type=pdf", label: "Education & Campus" },
  { to: "/types?type=vcard", label: "Healthcare & Clinics" },
] as const;

const COMPANY_LINKS = [
  { to: "/pricing", label: "Pricing in INR (₹)" },
  { to: "/compare", label: "Feature Comparison" },
  { to: "/support", label: "Support & FAQs" },
  { to: "/auth", label: "Login / Sign up" },
  { to: "/dashboard", label: "Workspace Dashboard" },
] as const;

export function SiteFooter() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-20 border-t border-border/70 bg-card/60 backdrop-blur-md">
      {/* Top Value Strip */}
      <div className="border-b border-border/60 bg-secondary/30 py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="size-4 text-primary" /> 100% Watermark-Free
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Zap className="size-4 text-primary" /> Instant Vector Downloads (SVG/PDF/EPS)
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Sparkles className="size-4 text-primary" /> 3D Avatar Standee Mode
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Globe className="size-4 text-primary" /> UPI &amp; RuPay Supported
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="gap-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            <span>Back to top</span>
            <ArrowUp className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Footer Links Matrix */}
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-5 sm:grid-cols-2">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logoAsset}
              alt="BT-QR logo"
              className="size-9 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-border"
            />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              BT-QR
            </span>
          </Link>

          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            The next-generation smart QR code platform. Generate, customize, and track commercial-grade QR codes with vector printing, full-body 3D character avatars, and live scan analytics.
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Support
            </h4>
            <a
              href="mailto:support.btqrcodegenerate@gmail.com"
              className="mt-1.5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Mail className="size-4" />
              <span>support.btqrcodegenerate@gmail.com</span>
            </a>
            <p className="mt-1 text-xs text-muted-foreground">
              Response within 24 hours · Monday to Saturday
            </p>
          </div>
        </div>

        {/* QR Types */}
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">Popular QR Types</h3>
          <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            {QR_TYPE_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Features & Tools */}
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">Features &amp; Tools</h3>
          <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            {FEATURE_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Industries & Pricing */}
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">Solutions &amp; Pricing</h3>
          <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            {COMPANY_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Trust Bar */}
      <div className="border-t border-border/70 py-6 bg-background/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} BT-QR Platform. Built with</span>
            <Heart className="size-3.5 text-rose-500 fill-rose-500" />
            <span>for creators &amp; businesses worldwide.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/support" className="hover:text-foreground hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-foreground hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-foreground hover:underline">
              Help Center
            </Link>
            <span>•</span>
            <Link to="/pricing" className="hover:text-foreground hover:underline">
              GST Invoicing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
