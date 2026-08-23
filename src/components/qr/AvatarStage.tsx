import { useState } from "react";

import avatarFemale from "@/assets/avatar-female.png";
import avatarMale from "@/assets/avatar-male.png";
import avatarOther from "@/assets/avatar-other.png";
import { QRPreview } from "@/components/qr/QRPreview";
import { DEFAULT_STYLE, type QRStyle } from "@/lib/qr/render";
import { cn } from "@/lib/utils";

export type AvatarId = "male" | "female" | "other";

/** Panel rect (percentages of the artwork) where each character holds the sign. */
const AVATARS: {
  id: AvatarId;
  label: string;
  src: string;
  blurb: string;
  panel: { left: number; top: number; width: number };
}[] = [
  {
    id: "male",
    label: "Male",
    src: avatarMale,
    blurb: "Aarav shows off your code",
    panel: { left: 42.2, top: 19, width: 38 },
  },
  {
    id: "female",
    label: "Female",
    src: avatarFemale,
    blurb: "Mira shows off your code",
    panel: { left: 45.2, top: 17.5, width: 34.5 },
  },
  {
    id: "other",
    label: "Other",
    src: avatarOther,
    blurb: "Bit the BT-QR bot",
    panel: { left: 49, top: 24.8, width: 36.5 },
  },
];


interface AvatarStageProps {
  value: string;
  style?: QRStyle;
  className?: string;
}

/**
 * 3D character stage: a full-body avatar holding a live QR code panel.
 * Users can switch between male, female and other (robot) avatars.
 */
export function AvatarStage({ value, style = DEFAULT_STYLE, className }: AvatarStageProps) {
  const [active, setActive] = useState<AvatarId>("male");
  const avatar = AVATARS.find((a) => a.id === active) ?? AVATARS[0]!;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col items-center">
        <div className="relative w-full max-w-[320px]">
          <img
            src={avatar.src}
            alt={`3D ${avatar.label.toLowerCase()} character holding a QR code`}
            width={768}
            height={1024}
            loading="lazy"
            className="mx-auto w-full drop-shadow-[0_28px_40px_rgba(12,35,64,0.25)]"
          />
          {/* Live QR sits exactly on the panel the character holds, hiding the printed one */}
          <div
            className="absolute aspect-square rounded-[10px] bg-white p-[6%] shadow-[0_8px_18px_rgba(12,35,64,0.18)]"
            style={{
              left: `${avatar.panel.left}%`,
              top: `${avatar.panel.top}%`,
              width: `${avatar.panel.width}%`,
            }}
          >
            <QRPreview
              value={value || "https://bt-qr.app"}
              style={style}
              size={240}
              className="size-full [&_svg]:h-full [&_svg]:w-full"
            />
          </div>

        </div>
        <div
          aria-hidden
          className="mt-[-8px] h-4 w-2/3 rounded-[100%] bg-primary/15 blur-md"
        />

        <p className="mt-4 text-sm font-medium text-muted-foreground">{avatar.blurb}</p>
        <div
          role="tablist"
          aria-label="Choose avatar"
          className="mt-3 flex gap-2 rounded-full bg-secondary/60 p-1"
        >
          {AVATARS.map((item) => (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={active === item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                active === item.id
                  ? "bg-brand-gradient text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
