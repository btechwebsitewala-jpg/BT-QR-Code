import { supabase } from "@/integrations/supabase/client";
import type { QRTypeId } from "./config";
import type { QRStyle } from "./render";

export interface QrCodeRow {
  id: string;
  user_id: string;
  name: string;
  qr_type: string;
  content: Record<string, string>;
  encoded_value: string;
  style: QRStyle;
  short_code: string;
  is_dynamic: boolean;
  target_url: string | null;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

export function makeShortCode(length = 7) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function shortUrl(code: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/r/${code}`;
}

export interface SaveQrInput {
  name: string;
  typeId: QRTypeId;
  values: Record<string, string>;
  encodedValue: string;
  style: QRStyle;
  isDynamic: boolean;
}

export async function saveQrCode(input: SaveQrInput) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("Please log in to save QR codes");

  const shortCode = makeShortCode();
  const dynamic = input.isDynamic && /^https?:\/\//i.test(input.encodedValue);

  const { data, error } = await supabase
    .from("qr_codes")
    .insert({
      user_id: userId,
      name: input.name.slice(0, 120) || "Untitled QR",
      qr_type: input.typeId,
      content: input.values,
      encoded_value: dynamic ? shortUrl(shortCode) : input.encodedValue,
      target_url: dynamic ? input.encodedValue : null,
      style: input.style as unknown as never,
      short_code: shortCode,
      is_dynamic: dynamic,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as QrCodeRow;
}

export async function listQrCodes() {
  const { data, error } = await supabase
    .from("qr_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as QrCodeRow[];
}

export async function getQrCode(id: string) {
  const { data, error } = await supabase.from("qr_codes").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as unknown as QrCodeRow;
}

export async function updateQrCode(
  id: string,
  patch: Partial<Pick<QrCodeRow, "name" | "target_url" | "encoded_value" | "content" | "style">>,
) {
  const { error } = await supabase
    .from("qr_codes")
    .update({ ...patch, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteQrCode(id: string) {
  const { error } = await supabase.from("qr_codes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface ScanRow {
  id: string;
  qr_id: string;
  scanned_at: string;
  device_type: string | null;
  browser: string | null
  country: string | null;
  city: string | null;
  referrer: string | null;
}

export async function listScans(qrId: string) {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("qr_id", qrId)
    .order("scanned_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ScanRow[];
}
