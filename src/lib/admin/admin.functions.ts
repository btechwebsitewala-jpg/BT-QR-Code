import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./guard.server";

export interface AdminUserRow {
  id: string;
  email: string | null;
  displayName: string | null;
  plan: string;
  isBlocked: boolean;
  notes: string | null;
  isAdmin: boolean;
  qrCount: number;
  totalScans: number;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
}


export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles }, { data: roles }, { data: codes }, authList] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, email, display_name, plan, is_blocked, notes, created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("qr_codes").select("user_id, scan_count"),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);

    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    const authUsers = new Map(authList.data.users.map((u) => [u.id, u]));

    const users: AdminUserRow[] = (profiles ?? []).map((p) => {
      const mine = (codes ?? []).filter((c) => c.user_id === p.id);
      const au = authUsers.get(p.id);
      return {
        id: p.id,
        email: p.email ?? au?.email ?? null,
        displayName: p.display_name ?? null,
        plan: p.plan,
        isBlocked: Boolean(p.is_blocked),
        notes: p.notes ?? null,
        isAdmin: adminIds.has(p.id),
        qrCount: mine.length,
        totalScans: mine.reduce((sum, c) => sum + (c.scan_count ?? 0), 0),
        createdAt: p.created_at ?? au?.created_at ?? null,
        lastSignInAt: au?.last_sign_in_at ?? null,
        emailConfirmed: Boolean(au?.email_confirmed_at),
      };
    });

    users.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    const totalScans = (codes ?? []).reduce((sum, c) => sum + (c.scan_count ?? 0), 0);
    return {
      users,
      stats: {
        userCount: users.length,
        qrCount: (codes ?? []).length,
        totalScans,
        premiumCount: users.filter((u) => u.plan !== "free").length,
      },
    };
  });

export const updateAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    userId: string;
    displayName?: string;
    plan?: string;
    isBlocked?: boolean;
    notes?: string;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: {
      display_name?: string;
      plan?: string;
      is_blocked?: boolean;
      notes?: string;
    } = {};
    if (data.displayName !== undefined) patch.display_name = data.displayName.slice(0, 120);
    if (data.plan !== undefined) patch.plan = data.plan === "premium" ? "premium" : "free";
    if (data.isBlocked !== undefined) patch.is_blocked = data.isBlocked;
    if (data.notes !== undefined) patch.notes = data.notes.slice(0, 1000);

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; makeAdmin: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && !data.makeAdmin) {
      throw new Error("You cannot remove your own admin access");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const sendUserPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; redirectTo: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account here");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAdminQrCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: codes }, { data: profiles }] = await Promise.all([
      supabaseAdmin
        .from("qr_codes")
        .select("id, user_id, name, qr_type, short_code, scan_count, is_dynamic, target_url, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin.from("profiles").select("id, email"),
    ]);
    const emails = new Map((profiles ?? []).map((p) => [p.id, p.email]));
    return (codes ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      qrType: c.qr_type,
      shortCode: c.short_code,
      scanCount: c.scan_count,
      isDynamic: c.is_dynamic,
      targetUrl: c.target_url,
      createdAt: c.created_at,
      ownerEmail: emails.get(c.user_id) ?? null,
    }));
  });

export const deleteAdminQrCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("qr_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
