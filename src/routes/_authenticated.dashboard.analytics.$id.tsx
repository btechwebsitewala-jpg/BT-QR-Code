import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MousePointerClick, Smartphone, Globe2 } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { QRPreview } from "@/components/qr/QRPreview";
import { Button } from "@/components/ui/button";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import { getQrCode, listScans } from "@/lib/qr/store";

export const Route = createFileRoute("/_authenticated/dashboard/analytics/$id")({
  head: () => ({
    meta: [
      { title: "QR code analytics — BT-QR" },
      {
        name: "description",
        content: "Scan totals, scans over time, device types and locations for your dynamic QR code.",
      },
      { property: "og:title", content: "QR code analytics — BT-QR" },
      {
        property: "og:description",
        content: "Scan totals, scans over time, device types and locations for your dynamic QR code.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Analytics,
});

const COLORS = ["#2D8A9E", "#1A4A6E", "#2563EB", "#059669", "#D97706"];

function Analytics() {
  const { id } = Route.useParams();

  const qr = useQuery({ queryKey: ["qr-code", id], queryFn: () => getQrCode(id) });
  const scans = useQuery({ queryKey: ["qr-scans", id], queryFn: () => listScans(id) });

  const series = useMemo(() => {
    const rows = scans.data ?? [];
    const days: { date: string; scans: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key.slice(5),
        scans: rows.filter((row) => row.scanned_at.slice(0, 10) === key).length,
      });
    }
    return days;
  }, [scans.data]);

  const byKey = (key: "device_type" | "country" | "browser") => {
    const rows = scans.data ?? [];
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const value = row[key] || "Unknown";
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value,
    );
  };

  if (qr.isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  if (qr.error || !qr.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">QR code not found</h1>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  const row = qr.data;
  const style: QRStyle = { ...DEFAULT_STYLE, ...(row.style ?? {}) };
  const devices = byKey("device_type");
  const countries = byKey("country");
  const browsers = byKey("browser");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/dashboard">
          <ArrowLeft className="mr-1 size-4" /> Back to dashboard
        </Link>
      </Button>

      <div className="mt-4 flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="rounded-2xl bg-secondary/50 p-3">
          <QRPreview value={row.encoded_value} style={style} size={110} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{row.name}</h1>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {row.encoded_value} → {row.target_url ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={MousePointerClick} label="Total scans" value={String(row.scan_count)} />
        <Stat
          icon={Smartphone}
          label="Top device"
          value={devices[0]?.name ?? "No scans yet"}
        />
        <Stat icon={Globe2} label="Top country" value={countries[0]?.name ?? "No scans yet"} />
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold">Scans over the last 14 days</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D8A9E" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#2D8A9E" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="#2D8A9E"
                strokeWidth={2}
                fill="url(#scanFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-lg font-bold">Device types</h2>
          {devices.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No scans recorded yet.</p>
          ) : (
            <div className="mt-2 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={devices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {devices.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-lg font-bold">Locations &amp; browsers</h2>
          {countries.length === 0 && browsers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No scans recorded yet.</p>
          ) : (
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <BreakdownList title="Countries" rows={countries} />
              <BreakdownList title="Browsers" rows={browsers} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold capitalize">{value}</p>
    </div>
  );
}

function BreakdownList({ title, rows }: { title: string; rows: { name: string; value: number }[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-3">
        {rows.slice(0, 5).map((row) => (
          <li key={row.name}>
            <div className="flex justify-between text-sm">
              <span>{row.name}</span>
              <span className="text-muted-foreground">{row.value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-brand-gradient"
                style={{ width: `${Math.round((row.value / total) * 100)}%` }}
              />
            </div>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-sm text-muted-foreground">No data</li> : null}
      </ul>
    </div>
  );
}
