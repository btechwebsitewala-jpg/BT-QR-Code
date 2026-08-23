import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getSharedQr = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => ({
    code: String(data?.code ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 16),
  }))
  .handler(async ({ data }) => {
    const req = getRequest();
    const url = new URL(req.url);
    const sandboxHost = url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
    const origin = sandboxHost ? `https://${sandboxHost}` : url.origin;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("qr_codes")
      .select("name, qr_type, encoded_value, target_url, is_dynamic, short_code")
      .eq("short_code", data.code)
      .maybeSingle();

    return {
      origin,
      code: data.code,
      qr: row
        ? {
            name: row.name as string,
            qrType: row.qr_type as string,
            encodedValue: row.encoded_value as string,
            targetUrl: (row.target_url as string | null) ?? null,
          }
        : null,
    };
  });
