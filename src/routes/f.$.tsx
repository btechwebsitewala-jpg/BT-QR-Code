import { createFileRoute } from "@tanstack/react-router";

/**
 * Public file link for uploads. The storage bucket is private, so this route
 * mints a short-lived signed URL server-side and redirects to it. The QR code
 * itself always encodes this stable /f/... link.
 */
export const Route = createFileRoute("/f/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = String((params as Record<string, string>)['_splat'] ?? "");
        const path = raw.replace(/\.\./g, "").replace(/^\/+/, "");
        if (!/^[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/.test(path)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("qr-files")
          .createSignedUrl(path, 60 * 60);

        if (error || !data?.signedUrl) {
          return new Response("File not found", { status: 404 });
        }
        return new Response(null, {
          status: 302,
          headers: { location: data.signedUrl, "cache-control": "no-store" },
        });
      },
    },
  },
});
