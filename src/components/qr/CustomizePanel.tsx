import { ImagePlus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { QRPreview } from "@/components/qr/QRPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_STYLE,
  QR_TEMPLATES,
  type DotStyle,
  type EccLevel,
  type EyeStyle,
  type FrameStyle,
  type QRStyle,
} from "@/lib/qr/render";
import { cn } from "@/lib/utils";

interface CustomizePanelProps {
  style: QRStyle;
  onChange: (patch: Partial<QRStyle>) => void;
  onReset: () => void;
  mode: "classic" | "logo";
  onModeChange: (mode: "classic" | "logo") => void;
  previewValue: string;
}

const DOTS: { label: string; value: DotStyle }[] = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Dots", value: "dots" },
  { label: "Classy", value: "classy" },
];

const EYES: { label: string; value: EyeStyle }[] = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Circle", value: "circle" },
];

const FRAMES: { label: string; value: FrameStyle }[] = [
  { label: "None", value: "none" },
  { label: "Label below", value: "bottom" },
  { label: "Label above", value: "top" },
  { label: "Border only", value: "rounded" },
  { label: "Badge", value: "badge" },
];

const LEVELS: { label: string; value: EccLevel }[] = [
  { label: "Low (7%)", value: "L" },
  { label: "Medium (15%)", value: "M" },
  { label: "Quartile (25%)", value: "Q" },
  { label: "High (30%)", value: "H" },
];

export function CustomizePanel({
  style,
  onChange,
  onReset,
  mode,
  onModeChange,
  previewValue,
}: CustomizePanelProps) {
  const logoRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<string>(mode === "logo" ? "logo" : "templates");

  const selectMode = (next: "classic" | "logo") => {
    onModeChange(next);
    setTab(next === "logo" ? "logo" : "templates");
  };

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Logo must be an image");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Logo must be under 1.5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logo: String(reader.result) });
      onModeChange("logo");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => selectMode("classic")}
          className={cn(
            "rounded-2xl border p-4 text-left transition-all",
            mode === "classic" ? "border-primary bg-primary/5 shadow-brand" : "border-border hover:bg-secondary/60",
          )}
        >
          <p className="font-semibold">Classic QR</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Plain or coloured dot pattern, maximum scan reliability.
          </p>
        </button>
        <button
          type="button"
          onClick={() => selectMode("logo")}
          className={cn(
            "relative rounded-2xl border p-4 text-left transition-all",
            mode === "logo" ? "border-primary bg-primary/5 shadow-brand" : "border-border hover:bg-secondary/60",
          )}
        >
          <Badge className="absolute right-3 top-3 border-0 bg-brand-gradient text-primary-foreground">
            NEW
          </Badge>
          <p className="font-semibold">Logo QR</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop your brand mark in the centre, error correction auto-set to High.
          </p>
        </button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="frames">Frames</TabsTrigger>
          <TabsTrigger value="shapes">Shapes</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="level">Level</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QR_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onChange(template.style)}
                className="rounded-2xl border border-border p-2 transition-all hover:border-primary hover:shadow-brand"
              >
                <QRPreview
                  value={previewValue || "https://qrverse.app"}
                  style={{ ...DEFAULT_STYLE, ...template.style, logo: null }}
                  size={110}
                />
                <p className="mt-1 text-xs font-medium">{template.name}</p>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="frames" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {FRAMES.map((frame) => (
              <Button
                key={frame.value}
                type="button"
                size="sm"
                variant={style.frame === frame.value ? "default" : "outline"}
                onClick={() => onChange({ frame: frame.value })}
              >
                {frame.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="frame-text">Frame text</Label>
              <Input
                id="frame-text"
                className="mt-2"
                maxLength={24}
                value={style.frameText}
                onChange={(event) => onChange({ frameText: event.target.value })}
                disabled={style.frame === "none" || style.frame === "rounded"}
              />
            </div>
            <ColorField
              label="Frame colour"
              value={style.frameColor}
              onChange={(frameColor) => onChange({ frameColor })}
            />
          </div>
        </TabsContent>

        <TabsContent value="shapes" className="mt-4 space-y-4">
          <div>
            <Label>Dot shape</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DOTS.map((dot) => (
                <Button
                  key={dot.value}
                  type="button"
                  size="sm"
                  variant={style.dotStyle === dot.value ? "default" : "outline"}
                  onClick={() => onChange({ dotStyle: dot.value })}
                >
                  {dot.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Corner eyes</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EYES.map((eye) => (
                <Button
                  key={eye.value}
                  type="button"
                  size="sm"
                  variant={style.eyeStyle === eye.value ? "default" : "outline"}
                  onClick={() => onChange({ eyeStyle: eye.value })}
                >
                  {eye.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="QR colour" value={style.fg} onChange={(fg) => onChange({ fg })} />
            <ColorField
              label="Background colour"
              value={style.bg}
              onChange={(bg) => onChange({ bg })}
            />
          </div>
          <div>
            <Label>Quiet zone ({style.margin} modules)</Label>
            <Slider
              className="mt-3"
              min={0}
              max={6}
              step={1}
              value={[style.margin]}
              onValueChange={([margin]) => onChange({ margin: margin ?? 2 })}
            />
          </div>
        </TabsContent>

        <TabsContent value="logo" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => pickLogo(event.target.files?.[0])}
            />
            <Button type="button" variant="outline" onClick={() => logoRef.current?.click()}>
              <ImagePlus className="mr-2 size-4" /> Upload logo
            </Button>
            {style.logo ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange({ logo: null })}
              >
                <Trash2 className="mr-2 size-4" /> Remove
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">PNG or SVG, under 1.5 MB</span>
            )}
          </div>
          <div>
            <Label>Logo size ({style.logoSize}%)</Label>
            <Slider
              className="mt-3"
              min={12}
              max={30}
              step={1}
              value={[style.logoSize]}
              onValueChange={([logoSize]) => onChange({ logoSize: logoSize ?? 20 })}
              disabled={!style.logo}
            />
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" /> Error correction switches to High
            automatically while a logo is used.
          </p>
        </TabsContent>

        <TabsContent value="level" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => (
              <Button
                key={level.value}
                type="button"
                size="sm"
                variant={style.ecc === level.value ? "default" : "outline"}
                onClick={() => onChange({ ecc: level.value })}
                disabled={Boolean(style.logo)}
              >
                {level.label}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Higher levels stay scannable when the code is damaged or partly covered, at the cost of
            density.
          </p>
        </TabsContent>
      </Tabs>

      <Button type="button" variant="ghost" onClick={onReset}>
        <RotateCcw className="mr-2 size-4" /> Reset settings
      </Button>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-1"
        />
        <Input value={value} maxLength={9} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}
