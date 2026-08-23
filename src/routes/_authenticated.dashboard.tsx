import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Download,
  ExternalLink,
  Loader2,
  Pencil,
  QrCode,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { QRPreview } from "@/components/qr/QRPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getQRType, type QRTypeId } from "@/lib/qr/config";
import { downloadQR } from "@/lib/qr/download";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import {
  deleteQrCode,
  listQrCodes,
  updateQrCode,
  type QrCodeRow,
} from "@/lib/qr/store";

const TITLE = "Your QR codes — BT-QR Dashboard";
const DESCRIPTION =
  "Manage saved QR codes: edit destinations, download again, review scan counts and open analytics.";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const styleOf = (row: QrCodeRow): QRStyle => ({ ...DEFAULT_STYLE, ...(row.style ?? {}) });

function Dashboard() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<QrCodeRow | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["qr-codes"],
    queryFn: listQrCodes,
  });

  const remove = useMutation({
    mutationFn: deleteQrCode,
    onSuccess: async () => {
      toast.success("QR code deleted");
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      await updateQrCode(editing.id, {
        name: name.slice(0, 120),
        ...(editing.is_dynamic ? { target_url: target.trim() } : {}),
      });
    },
    onSuccess: async () => {
      toast.success("QR code updated");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const totalScans = codes.reduce((sum, row) => sum + (row.scan_count ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your QR codes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {codes.length} saved · {totalScans} total scans
          </p>
        </div>
        <Button asChild className="bg-brand-gradient text-primary-foreground">
          <Link to="/">
            <QrCode className="mr-2 size-4" /> Create new QR
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : codes.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <QrCode className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">No saved QR codes yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a QR code and hit “Save to dashboard” to track its scans.
          </p>
          <Button asChild className="mt-6 bg-brand-gradient text-primary-foreground">
            <Link to="/">Create your first QR code</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {codes.map((row) => {
            const def = getQRType(row.qr_type as QRTypeId);
            return (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="shrink-0 rounded-2xl bg-secondary/50 p-2">
                  <QRPreview value={row.encoded_value} style={styleOf(row)} size={96} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold">{row.name}</h2>
                    <Badge variant="secondary">{def.label}</Badge>
                    <Badge
                      className={
                        row.is_dynamic
                          ? "border-0 bg-brand-gradient text-primary-foreground"
                          : "border-0 bg-secondary text-secondary-foreground"
                      }
                    >
                      {row.is_dynamic ? "Dynamic" : "Static"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {row.target_url ?? row.encoded_value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.scan_count} scans · created{" "}
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.is_dynamic ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/analytics/$id" params={{ id: row.id }}>
                        <BarChart3 className="mr-1 size-4" /> Analytics
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(row);
                      setName(row.name);
                      setTarget(row.target_url ?? "");
                    }}
                  >
                    <Pencil className="mr-1 size-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void downloadQR({
                        value: row.encoded_value,
                        style: styleOf(row),
                        format: "png",
                        size: 1000,
                        filename: row.name.replace(/\s+/g, "-").toLowerCase(),
                      })
                    }
                  >
                    <Download className="mr-1 size-4" /> PNG
                  </Button>
                  {row.is_dynamic ? (
                    <Button asChild variant="ghost" size="icon" aria-label="Open link">
                      <a href={row.encoded_value} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete QR code"
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit QR code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="qr-name">Name</Label>
              <Input
                id="qr-name"
                className="mt-2"
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            {editing?.is_dynamic ? (
              <div>
                <Label htmlFor="qr-target">Destination URL</Label>
                <Input
                  id="qr-target"
                  className="mt-2"
                  maxLength={2000}
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  The printed QR code stays the same — only where it points changes.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Static QR codes encode content directly, so the destination cannot be changed.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gradient text-primary-foreground"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
