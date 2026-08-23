import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const TITLE = "Support & QR code FAQ — BT-QR";
const DESCRIPTION =
  "Answers about scanning problems, editing dynamic QR codes, file uploads, download formats, print sizes and account questions.";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Support,
});

const faqs = [
  {
    q: "Do my QR codes expire?",
    a: "No. Codes you generate keep working. Dynamic codes point at a BT-QR short link that stays live, and static codes contain your content directly so they never depend on us.",
  },
  {
    q: "Can I change where a QR code points after printing it?",
    a: "Yes, if it is a dynamic QR code saved to your dashboard. Open the dashboard, choose Edit, and set a new destination URL — the printed pattern stays identical.",
  },
  {
    q: "My QR code will not scan. What should I fix?",
    a: "Keep strong contrast between foreground and background, avoid very light colours, keep the quiet zone (white margin), set the error-correction level to Quartile or High when you add a logo, and print at least 2.5 cm wide.",
  },
  {
    q: "Which format should I download?",
    a: "Use PNG for screens and social posts, SVG for scaling to any size without quality loss, and PDF or EPS when a printer asks for vector artwork.",
  },
  {
    q: "How do image, PDF and video uploads work?",
    a: "Your file is stored securely in BT-QR cloud storage and the QR code encodes a stable link. When someone scans it, we redirect them to the file so it opens straight in their browser.",
  },
  {
    q: "Is scanning data private?",
    a: "We store only anonymous, aggregate signals: timestamp, device type, browser, and approximate country. We never store personal identifiers or precise locations.",
  },
  {
    q: "Do I need an account?",
    a: "No account is needed to generate and download QR codes. Log in only if you want to save codes, edit destinations later and see scan analytics.",
  },
];

function Support() {
  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How can we help?</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Browse the most common questions below, or reach out and we will get back to you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: MessageCircle, title: "Live chat", text: "Mon–Fri, 9:00–18:00 CET" },
            { icon: Mail, title: "Email", text: "hello@qrverse.app" },
            { icon: LifeBuoy, title: "Premium support", text: "Replies within 24 hours" },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <card.icon className="size-5" />
              </span>
              <h2 className="mt-3 font-semibold">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <div className="mt-10">
          <Button asChild className="bg-brand-gradient text-primary-foreground">
            <Link to="/">Back to the generator</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
