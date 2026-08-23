import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { getSharedQr } from "@/lib/qr/share.functions";

export const Route = createFileRoute("/s/$code")({
  loader: ({ params }) => getSharedQr({ data: { code: params.code } }),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "https://github.com/btechwebsitewala-jpg/BT-QR-Code";
    const code = loaderData?.code ?? "";
    const name = loaderData?.qr?.name ?? "BT-QR code";
    const image = `${origin}/api/public/og/${code}.png`;
    const pageUrl = `${origin}/s/${code}`;
    const description = `Scan this QR code to open ${name}. Created with BT-QR.`;
    return {
      meta: [
        { title: `Scan me — ${name} | BT-QR` },
        { name: "description", content: description },
        { property: "og:title", content: `Scan me — ${name}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
    };
  },
  component: SharePage,
});

function SharePage() {
  const { origin, code, qr } = Route.useLoaderData();
  const image = `${origin}/api/public/og/${code}.png`;
  const target = qr?.targetUrl ?? qr?.encodedValue ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold">
          {qr ? `Scan me — ${qr.name}` : "QR code not found"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {qr
            ? "Share this link anywhere — social platforms will show the preview card below."
            : "This short link is no longer available."}
        </p>
        {qr ? (
          <>
            <img
              src={image}
              alt={`Scan me preview card for ${qr.name}`}
              width={1200}
              height={630}
              className="mt-8 w-full rounded-2xl border border-border shadow-sm"
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-brand-gradient text-primary-foreground hover:opacity-90">
                <a href={`/r/${code}`}>
                  Open destination <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={image} download={`bt-qr-${code}-preview.png`}>
                  Download preview image
                </a>
              </Button>
            </div>
            {target ? (
              <p className="mt-4 break-all text-xs text-muted-foreground">{target}</p>
            ) : null}
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
