import { Link } from "@tanstack/react-router";

import logoAsset from "@/assets/bt-qr-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logoAsset.url} alt="BT-QR logo" className="size-8 rounded-xl bg-white object-contain p-0.5" />
            <span className="font-display font-bold">BT-QR</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Free QR code generator with 17 content types, custom styles and live scan analytics.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                QR generator
              </Link>
            </li>
            <li>
              <Link to="/scanner" className="hover:text-foreground">
                QR scanner
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-foreground">
                Compare plans
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/support" className="hover:text-foreground">
                Support &amp; FAQ
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Popular QR types</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            URL, WhatsApp, vCard, WiFi, PDF, Location, Event, SMS, Email, Social media and more —
            all free, no signup required.
          </p>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BT-QR. All QR codes are generated in your browser.
      </div>
    </footer>
  );
}
