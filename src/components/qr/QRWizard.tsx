import { Link } from "@tanstack/react-router";
import { Camera, Copy, Download, Info, Link2, Loader2, Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { ContentForm } from "@/components/qr/ContentForm";
import { CustomizePanel } from "@/components/qr/CustomizePanel";
import { QRPreview } from "@/components/qr/QRPreview";
import { TypeSelector } from "@/components/qr/TypeSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { encodeQRValue, getQRType, validateQRValues, type QRTypeId } from "@/lib/qr/config";
import {
  downloadQR,
  EXPORT_FORMATS,
  EXPORT_SIZES,
  snapshotQRCard,
  type ExportFormat,
} from "@/lib/qr/download";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import { saveQrCode, shortUrl } from "@/lib/qr/store";

function StepHeader({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground">
        {step}
      </span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function QRWizard({ initialType = "url" }: { initialType?: QRTypeId }) {
  const { user } = useAuth();
  const [typeId, setTypeId] = useState<QRTypeId>(initialType);
  const [allValues, setAllValues] = useState<Record<string, Record<string, string>>>({});
  const [style, setStyle] = useState<QRStyle>(DEFAULT_STYLE);
  const [mode, setMode] = useState<"classic" | "logo">("classic");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [size, setSize] = useState(1000);
  const [dynamic, setDynamic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [snapping, setSnapping] = useState(false);

  const values = allValues[typeId] ?? {};
  const def = getQRType(typeId);

  const patchValues = useCallback(
    (patch: Record<string, string>) => {
      setSavedCode(null);
      setAllValues((prev) => ({ ...prev, [typeId]: { ...(prev[typeId] ?? {}), ...patch } }));
    },
    [typeId],
  );

  const directValue = useMemo(() => encodeQRValue(typeId, values), [typeId, values]);
  const error = useMemo(() => validateQRValues(typeId, values), [typeId, values]);
  const encodedValue = savedCode ? shortUrl(savedCode) : directValue;

  const handleModeChange = (next: "classic" | "logo") => {
    setMode(next);
    if (next === "classic") setStyle((prev) => ({ ...prev, logo: null }));
  };

  const handleDownload = async () => {
    if (error) return;
    setDownloading(true);
    try {
      await downloadQR({
        value: encodedValue,
        style,
        format,
        size,
        filename: `qrverse-${typeId}`,
      });
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Download failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleSnapshot = async (copy: boolean) => {
    if (error) return;
    setSnapping(true);
    try {
      const result = await snapshotQRCard({
        value: encodedValue,
        style,
        title: `${def.label} QR code`,
        caption: encodedValue,
        filename: `qrverse-${typeId}-snapshot`,
        copy,
      });
      toast.success(
        result === "copied" ? "Snapshot copied to clipboard" : "Snapshot image saved",
      );
    } catch (err) {
      toast.error("Could not create the snapshot", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSnapping(false);
    }
  };

  const handleSave = async () => {
    if (error) return;
    setSaving(true);
    try {
      const row = await saveQrCode({
        name: `${def.label} QR`,
        typeId,
        values,
        encodedValue: directValue,
        style,
        isDynamic: dynamic,
      });
      if (row.is_dynamic) {
        setSavedCode(row.short_code);
        toast.success("Saved as a dynamic QR code", {
          description: "The QR now points to a trackable short link you can edit anytime.",
        });
      } else {
        toast.success("Saved to your dashboard");
      }
    } catch (err) {
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <StepHeader step={1} title="Add content" hint={def.description} />
          <div className="mt-5">
            <TypeSelector
              value={typeId}
              onChange={(id) => {
                setTypeId(id);
                setSavedCode(null);
              }}
            />
          </div>
          <div className="mt-6">
            <ContentForm typeId={typeId} values={values} onChange={patchValues} />
          </div>
          {def.isUpload && !user ? (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 text-primary" />
              <span>
                File hosting needs an account —{" "}
                <Link to="/auth" className="font-semibold text-primary hover:underline">
                  log in for free
                </Link>{" "}
                to upload and host files.
              </span>
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <StepHeader step={2} title="Customise" hint="Pick a template, colours, frame and logo." />
          <div className="mt-5">
            <CustomizePanel
              style={style}
              mode={mode}
              onModeChange={handleModeChange}
              onChange={(patch) => setStyle((prev) => ({ ...prev, ...patch }))}
              onReset={() => {
                setStyle(DEFAULT_STYLE);
                setMode("classic");
              }}
              previewValue={directValue || "https://qrverse.app"}
            />
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <StepHeader step={3} title="Generate &amp; download" />
          <div className="mt-5 flex justify-center rounded-2xl bg-secondary/40 p-4">
            <QRPreview value={encodedValue || "https://qrverse.app"} style={style} size={260} />
          </div>

          {error ? (
            <p className="mt-3 text-center text-sm text-muted-foreground">{error}</p>
          ) : (
            <p className="mt-3 break-all text-center text-xs text-muted-foreground">
              {encodedValue.length > 90 ? `${encodedValue.slice(0, 90)}…` : encodedValue}
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <SelectTrigger id="format" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size">Size</Label>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                <SelectTrigger id="size" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_SIZES.map((px) => (
                    <SelectItem key={px} value={String(px)}>
                      {px} x {px} px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="mt-4 w-full bg-brand-gradient text-primary-foreground hover:opacity-90"
            size="lg"
            disabled={Boolean(error) || downloading}
            onClick={() => void handleDownload()}
          >
            {downloading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Download QR Code
          </Button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={Boolean(error) || snapping}
              onClick={() => void handleSnapshot(false)}
            >
              {snapping ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Camera className="mr-2 size-4" />
              )}
              Snapshot
            </Button>
            <Button
              variant="outline"
              disabled={Boolean(error) || snapping}
              onClick={() => void handleSnapshot(true)}
            >
              <Copy className="mr-2 size-4" /> Copy image
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Snapshot saves a share-ready “Scan me” card. By downloading you agree to our Terms &amp;
            Conditions.
          </p>

          <div className="mt-5 space-y-3 rounded-2xl bg-secondary/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Dynamic QR code</p>
                <p className="text-xs text-muted-foreground">
                  Trackable short link, editable after printing.
                </p>
              </div>
              <Switch checked={dynamic} onCheckedChange={setDynamic} />
            </div>
            {user ? (
              <Button
                variant="outline"
                className="w-full"
                disabled={Boolean(error) || saving}
                onClick={() => void handleSave()}
              >
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save to dashboard
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">Log in to save &amp; track scans</Link>
              </Button>
            )}
            {savedCode ? (
              <div className="space-y-2">
                <p className="flex items-center gap-2 break-all text-xs text-primary">
                  <Link2 className="size-3.5 shrink-0" /> {shortUrl(savedCode)}
                </p>
                <Button asChild variant="ghost" className="h-8 w-full text-xs">
                  <a href={`/s/${savedCode}`} target="_blank" rel="noreferrer">
                    View shareable “Scan me” preview
                  </a>
                </Button>
              </div>
            ) : null}
            {!dynamic ? (
              <p className="text-xs text-muted-foreground">
                Static QR codes encode content directly — a Premium feature for print runs that must
                never depend on a redirect.
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
