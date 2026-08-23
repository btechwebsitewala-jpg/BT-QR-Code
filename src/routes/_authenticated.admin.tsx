import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Crown,
  KeyRound,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAdminQrCode,
  deleteAdminUser,
  listAdminQrCodes,
  listAdminUsers,
  sendUserPasswordReset,
  setAdminRole,
  updateAdminUser,
  type AdminUserRow,
} from "@/lib/admin/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — BT-QR control centre" },
      {
        name: "description",
        content: "Manage BT-QR users, plans, admin access, password resets and every saved QR code.",
      },
      { property: "og:title", content: "Admin panel — BT-QR control centre" },
      { property: "og:description", content: "Manage BT-QR users, plans and QR codes." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listAdminUsers);
  const fetchCodes = useServerFn(listAdminQrCodes);
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin", "users"], queryFn: () => fetchUsers({}) });
  const codesQuery = useQuery({ queryKey: ["admin", "codes"], queryFn: () => fetchCodes({}) });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin"] });

  const users = usersQuery.data?.users ?? [];
  const stats = usersQuery.data?.stats;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.displayName ?? "").toLowerCase().includes(q),
    );
  }, [users, search]);

  const forbidden =
    usersQuery.isError && String(usersQuery.error).toLowerCase().includes("forbidden");

  if (forbidden) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShieldCheck className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">
          Your account does not have admin access to this control centre.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Control centre</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Admin panel</h1>
          <p className="mt-1 text-muted-foreground">
            Every user, plan, password reset and QR code in one place.
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          Refresh data
        </Button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={stats?.userCount ?? 0} />
        <StatCard icon={Crown} label="Premium users" value={stats?.premiumCount ?? 0} />
        <StatCard icon={QrCode} label="QR codes" value={stats?.qrCount ?? 0} />
        <StatCard icon={BarChart3} label="Total scans" value={stats?.totalScans ?? 0} />
      </section>

      <Tabs defaultValue="users" className="mt-10">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="codes">QR codes</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {usersQuery.isLoading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading users…
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No users match that search.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((user) => (
                <UserCard key={user.id} user={user} onDone={refresh} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="codes" className="mt-6">
          {codesQuery.isLoading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading QR codes…
            </p>
          ) : (codesQuery.data ?? []).length === 0 ? (
            <p className="text-muted-foreground">No QR codes have been saved yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Owner</th>
                    <th className="p-3 font-semibold">Short link</th>
                    <th className="p-3 font-semibold">Scans</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {(codesQuery.data ?? []).map((code) => (
                    <CodeRow key={code.id} code={code} onDone={refresh} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

function UserCard({ user, onDone }: { user: AdminUserRow; onDone: () => void }) {
  const update = useServerFn(updateAdminUser);
  const role = useServerFn(setAdminRole);
  const reset = useServerFn(sendUserPasswordReset);
  const remove = useServerFn(deleteAdminUser);

  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [notes, setNotes] = useState(user.notes ?? "");

  const save = useMutation({
    mutationFn: () =>
      update({ data: { userId: user.id, displayName, notes } }),
    onSuccess: () => {
      toast.success("User updated");
      onDone();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  const act = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      toast.success(message);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{user.displayName || "Unnamed user"}</p>
          <p className="text-sm text-muted-foreground">{user.email ?? "no email"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} · Last login{" "}
            {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "never"} ·{" "}
            {user.qrCount} QR · {user.totalScans} scans
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.isAdmin ? <Badge className="border-0 bg-brand-gradient text-primary-foreground">Admin</Badge> : null}
          <Badge variant={user.plan === "free" ? "secondary" : "default"}>{user.plan}</Badge>
          {user.isBlocked ? <Badge variant="destructive">Blocked</Badge> : null}
          {!user.emailConfirmed ? <Badge variant="outline">Email unconfirmed</Badge> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor={`name-${user.id}`}>Display name</Label>
          <Input
            id={`name-${user.id}`}
            className="mt-2"
            maxLength={120}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`notes-${user.id}`}>Internal notes</Label>
          <Textarea
            id={`notes-${user.id}`}
            className="mt-2"
            rows={2}
            maxLength={1000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={user.plan === "premium"}
            onCheckedChange={(checked) =>
              void act(
                () => update({ data: { userId: user.id, plan: checked ? "premium" : "free" } }),
                checked ? "Upgraded to premium" : "Moved to free plan",
              )
            }
          />
          Premium plan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={user.isAdmin}
            onCheckedChange={(checked) =>
              void act(
                () => role({ data: { userId: user.id, makeAdmin: checked } }),
                checked ? "Admin access granted" : "Admin access removed",
              )
            }
          />
          Admin access
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={user.isBlocked}
            onCheckedChange={(checked) =>
              void act(
                () => update({ data: { userId: user.id, isBlocked: checked } }),
                checked ? "User blocked" : "User unblocked",
              )
            }
          />
          Blocked
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Save changes
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!user.email}
          onClick={() =>
            void act(
              () =>
                reset({
                  data: {
                    email: user.email ?? "",
                    redirectTo: `${window.location.origin}/reset-password`,
                  },
                }),
              "Password reset email sent",
            )
          }
        >
          <KeyRound className="mr-2 size-4" /> Send password reset
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => {
            if (!window.confirm(`Delete ${user.email ?? "this user"} and all their QR codes?`)) return;
            void act(() => remove({ data: { userId: user.id } }), "User deleted");
          }}
        >
          <Trash2 className="mr-2 size-4" /> Delete user
        </Button>
      </div>
    </div>
  );
}

function CodeRow({
  code,
  onDone,
}: {
  code: {
    id: string;
    name: string;
    qrType: string;
    shortCode: string;
    scanCount: number;
    ownerEmail: string | null;
  };
  onDone: () => void;
}) {
  const remove = useServerFn(deleteAdminQrCode);
  return (
    <tr className="border-t border-border">
      <td className="p-3 font-medium">{code.name}</td>
      <td className="p-3 text-muted-foreground">{code.qrType}</td>
      <td className="p-3 text-muted-foreground">{code.ownerEmail ?? "—"}</td>
      <td className="p-3">
        <a
          className="text-primary hover:underline"
          href={`/r/${code.shortCode}`}
          target="_blank"
          rel="noreferrer"
        >
          /r/{code.shortCode}
        </a>
      </td>
      <td className="p-3">{code.scanCount}</td>
      <td className="p-3 text-right">
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={async () => {
            if (!window.confirm(`Delete QR "${code.name}"?`)) return;
            try {
              await remove({ data: { id: code.id } });
              toast.success("QR code deleted");
              onDone();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Delete failed");
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
