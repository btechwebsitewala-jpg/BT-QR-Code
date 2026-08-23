# QR Code Generator Platform

A Me-QR style QR generator: purple/violet SaaS look, white background, live QR preview, 17 content types, 3-step wizard, plus pricing, dashboard, analytics and support pages. Backed by Lovable Cloud for login, file uploads, saved QR codes and scan tracking.

## Phase 1 — Generator (the core, built first)

Home page `/` with:
- Navbar: logo, QR Scanner, Pricing, Compare, Support, "Create QR Code" (primary), Login.
- Hero: "Create & Customize QR Code for FREE" + subheading, soft lavender gradient.
- Type selector: grid of icon cards with "View All" toggle (first row visible, rest expand).
- Step 1 Add Content — form swaps per type:
  URL, Text, Image, PDF, Video, Contact (vCard), Phone, WhatsApp, Email, SMS, Location, WiFi, Social Media, Google Forms, App Store, File Upload, Event (vCalendar). Each type validated before download is enabled.
- Step 2 Customize — Classic QR vs Logo QR (with pink/magenta "NEW" badge), sub-tabs for Frames, Shapes, Logo upload, error-correction Level (L/M/Q/H), foreground/background color pickers, template gallery of preset styles, Reset Settings.
- Step 3 Generate & Download — live preview updating as you type, format dropdown (PNG, JPG, SVG, PDF, EPS), size dropdown (500/1000/2000/3000 px), Download button disabled until content is valid, terms line under it.

QR rendering is client-side, so downloads are real files in the chosen format.

## Phase 2 — Accounts, storage, dynamic QR

- Email/password login and signup via Lovable Cloud.
- File types (Image, PDF, Video, generic File) upload to cloud storage; the QR encodes the hosted public file URL.
- Dynamic QR: every saved QR gets a short code and the QR encodes `/r/<code>`, which redirects to the real target and logs a scan. Editing content later keeps the same QR working.
- Static QR (encodes content directly) is marked Premium.
- Saved QR data: owner, type, content, style settings, short code, static/dynamic flag, scan count, created date.

## Phase 3 — Dashboard, analytics, marketing pages

- `/dashboard` (login required): list of your QR codes with preview, type, scan count, created date; edit content, re-download, delete.
- `/dashboard/analytics/<id>`: total scans, scans over time chart, device type breakdown, country/region breakdown, all from logged scan events.
- `/pricing`: Free vs Premium comparison (Premium: static QR, no ads, advanced analytics, bulk generation).
- `/support`: FAQ accordion + contact form.
- `/scanner`: camera-based QR scanner. `/compare`: feature comparison table.

## Design

Primary violet ~#7B2FF7, white / very light lavender gradient background, pink-magenta gradient accents for premium. All colors go in the design system as tokens; rounded cards, soft shadows, generous spacing. Fully responsive: type cards become a scrollable grid and the wizard stacks on mobile.

## Technical notes

- TanStack Start routes: `index`, `pricing`, `support`, `compare`, `scanner`, `r.$code`, `_authenticated/dashboard`, `_authenticated/dashboard.analytics.$id`.
- `qrcode.react` (SVG) for preview + PNG/JPG/SVG export via canvas; `jspdf` for PDF; EPS generated from the SVG path.
- Content encoders per type in one shared module (vCard, WIFI:, MATMSG/mailto, SMSTO:, geo:, VEVENT, wa.me).
- Redirect route resolves the short code server-side, records the scan (user agent, referrer, timestamp, coarse geo from request headers), then 302s.
- Row-level security so each user sees only their own QR codes; scan inserts allowed from the public redirect path only, aggregate reads restricted to the owner.
- Uploads validated for type and size limits before storing.

## Build order

Phase 1 first so the generator is usable immediately, then Phase 2 accounts/storage/dynamic links, then Phase 3 dashboard, analytics and marketing pages.
