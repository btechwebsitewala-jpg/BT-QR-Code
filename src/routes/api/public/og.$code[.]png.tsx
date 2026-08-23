import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/og/$code.png")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const code = String((params as Record<string, string>)["code.png"] ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 16);

        const { renderQrOgPng } = await import("@/lib/qr/og-image.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let value = "https://qr-create-magic.lovable.app";
        let title = "BT-QR CODE";
        let caption = "";
        let style: Record<string, unknown> | undefined;

        if (code) {
          const { data } = await supabaseAdmin
            .from("qr_codes")
            .select("name, encoded_value, target_url, style")
            .eq("short_code", code)
            .maybeSingle();
          if (data) {
            value = data.encoded_value ?? value;
            title = (data.name ?? title).slice(0, 20);
            caption = data.target_url ?? data.encoded_value ?? "";
            style = (data.style as Record<string, unknown> | null) ?? undefined;
          }
        }

        const png = renderQrOgPng({
          value,
          title,
          caption,
          style: style as never,
        });

        return new Response(png as unknown as BodyInit, {
          headers: {
            "content-type": "image/png",
            "cache-control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});
