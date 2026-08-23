import { createFileRoute } from "@tanstack/react-router";

function detectDevice(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (!ua) return "unknown";
  return "desktop";
}

function detectBrowser(ua: string) {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

export const Route = createFileRoute("/r/$code")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const code = String(params.code ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 16);
        if (!code) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: qr } = await supabaseAdmin
          .from("qr_codes")
          .select("id, target_url, encoded_value, scan_count")
          .eq("short_code", code)
          .maybeSingle();

        if (!qr) return new Response("This QR code is no longer available", { status: 404 });

        const ua = request.headers.get("user-agent") ?? "";
        await supabaseAdmin.from("qr_scans").insert({
          qr_id: qr.id,
          device_type: detectDevice(ua),
          browser: detectBrowser(ua),
          country: request.headers.get("cf-ipcountry") ?? null,
          city: request.headers.get("cf-ipcity") ?? null,
          referrer: request.headers.get("referer")?.slice(0, 300) ?? null,
        });
        await supabaseAdmin
          .from("qr_codes")
          .update({ scan_count: (qr.scan_count ?? 0) + 1 })
          .eq("id", qr.id);

        // Social crawlers get a preview page with the "Scan me" OG card
        // instead of being redirected to the destination.
        if (/bot|crawler|spider|facebookexternalhit|twitterbot|slackbot|whatsapp|telegrambot|discordbot|linkedinbot|embedly|pinterest|preview/i.test(ua)) {
          return new Response(null, {
            status: 302,
            headers: { location: `/s/${code}`, "cache-control": "no-store" },
          });
        }

        const target = qr.target_url ?? qr.encoded_value;
        if (!/^https?:\/\//i.test(target ?? "")) {
          return new Response("This QR code has no destination", { status: 404 });
        }
        return new Response(null, {
          status: 302,
          headers: { location: target!, "cache-control": "no-store" },
        });
      },
    },
  },
});
