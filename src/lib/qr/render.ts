import QRCode from "qrcode";

export type EccLevel = "L" | "M" | "Q" | "H";
export type DotStyle = "square" | "dots" | "rounded" | "classy";
export type EyeStyle = "square" | "rounded" | "circle";
export type FrameStyle = "none" | "bottom" | "top" | "rounded" | "badge";

export interface QRStyle {
  fg: string;
  bg: string;
  ecc: EccLevel;
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  frame: FrameStyle;
  frameText: string;
  frameColor: string;
  logo: string | null;
  logoSize: number; // percent of QR width
  margin: number; // modules
}

export const DEFAULT_STYLE: QRStyle = {
  fg: "#0C2340",
  bg: "#FFFFFF",
  ecc: "M",
  dotStyle: "square",
  eyeStyle: "square",
  frame: "none",
  frameText: "SCAN ME",
  frameColor: "#2D8A9E",
  logo: null,
  logoSize: 22,
  margin: 2,
};

export interface QRTemplate {
  id: string;
  name: string;
  style: Partial<QRStyle>;
}

export const QR_TEMPLATES: QRTemplate[] = [
  { id: "classic", name: "Classic", style: { fg: "#111111", bg: "#FFFFFF", dotStyle: "square", eyeStyle: "square", frame: "none" } },
  { id: "navy", name: "Navy", style: { fg: "#0C2340", bg: "#FFFFFF", dotStyle: "rounded", eyeStyle: "rounded", frame: "none" } },
  { id: "lagoon", name: "Lagoon", style: { fg: "#1A4A6E", bg: "#F1F9FB", dotStyle: "dots", eyeStyle: "circle", frame: "none" } },
  { id: "scanme", name: "Scan me", style: { fg: "#0C2340", bg: "#FFFFFF", dotStyle: "square", eyeStyle: "rounded", frame: "bottom", frameColor: "#2D8A9E" } },
  { id: "teal", name: "Teal", style: { fg: "#2D8A9E", bg: "#ECFBFB", dotStyle: "dots", eyeStyle: "circle", frame: "badge", frameColor: "#2D8A9E" } },
  { id: "midnight", name: "Midnight", style: { fg: "#5CBDB9", bg: "#08182B", dotStyle: "rounded", eyeStyle: "rounded", frame: "none" } },
  { id: "reef", name: "Reef", style: { fg: "#0F766E", bg: "#F0FDFA", dotStyle: "classy", eyeStyle: "rounded", frame: "none" } },
  { id: "harbour", name: "Harbour", style: { fg: "#1A4A6E", bg: "#FFFFFF", dotStyle: "square", eyeStyle: "circle", frame: "top", frameColor: "#1A4A6E" } },
];

const safeColor = (c: string, fallback: string) =>
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test((c ?? "").trim()) ? c.trim() : fallback;

const escapeXml = (s: string) =>
  (s ?? "").replace(/[<>&"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

interface Matrix {
  size: number;
  get: (x: number, y: number) => boolean;
}

function buildMatrix(value: string, ecc: EccLevel): Matrix {
  const qr = QRCode.create(value, { errorCorrectionLevel: ecc });
  const size = qr.modules.size;
  const data = qr.modules.data;
  return { size, get: (x, y) => Boolean(data[y * size + x]) };
}

const isEyeModule = (x: number, y: number, size: number) => {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
  return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
};

function eyeShapes(size: number, unit: number, fg: string, eyeStyle: EyeStyle) {
  const corners = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  const r = eyeStyle === "circle" ? unit * 3.5 : eyeStyle === "rounded" ? unit * 2 : 0;
  return corners
    .map(([cx = 0, cy = 0]) => {
      const x = cx * unit;
      const y = cy * unit;
      const outer = `<rect x="${x}" y="${y}" width="${unit * 7}" height="${unit * 7}" rx="${r}" ry="${r}" fill="${fg}"/>`;
      const inner = `<rect x="${x + unit}" y="${y + unit}" width="${unit * 5}" height="${unit * 5}" rx="${Math.max(0, r - unit)}" ry="${Math.max(0, r - unit)}" fill="var(--qr-bg)"/>`;
      const ir = eyeStyle === "circle" ? unit * 1.5 : eyeStyle === "rounded" ? unit : 0;
      const pupil = `<rect x="${x + unit * 2}" y="${y + unit * 2}" width="${unit * 3}" height="${unit * 3}" rx="${ir}" ry="${ir}" fill="${fg}"/>`;
      return outer + inner + pupil;
    })
    .join("");
}

export interface BuildSvgOptions {
  value: string;
  style: QRStyle;
  size?: number;
}

/** Builds a standalone, self-contained SVG string for the QR code. */
export function buildQRSvg({ value, style, size = 480 }: BuildSvgOptions): string {
  const fg = safeColor(style.fg, DEFAULT_STYLE.fg);
  const bg = safeColor(style.bg, DEFAULT_STYLE.bg);
  const frameColor = safeColor(style.frameColor, DEFAULT_STYLE.frameColor);
  const ecc: EccLevel = style.logo ? "H" : style.ecc;
  const matrix = buildMatrix(value || " ", ecc);
  const margin = Math.max(0, Math.min(8, style.margin));
  const total = matrix.size + margin * 2;
  const unit = 1000 / total;
  const hasFrameText = style.frame !== "none" && style.frame !== "rounded";
  const frameSpace = hasFrameText ? 180 : 0;
  const outerPad = style.frame === "none" ? 0 : 40;
  const vbW = 1000 + outerPad * 2;
  const vbH = 1000 + outerPad * 2 + frameSpace;
  const qrY = style.frame === "top" ? outerPad + frameSpace : outerPad;
  const textY = style.frame === "top" ? outerPad + 120 : outerPad * 2 + 1000 + 110;

  const cells: string[] = [];
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (!matrix.get(x, y)) continue;
      if (isEyeModule(x, y, matrix.size)) continue;
      const px = (x + margin) * unit;
      const py = (y + margin) * unit;
      if (style.dotStyle === "dots") {
        cells.push(
          `<circle cx="${(px + unit / 2).toFixed(2)}" cy="${(py + unit / 2).toFixed(2)}" r="${(unit * 0.44).toFixed(2)}" fill="${fg}"/>`,
        );
      } else {
        const rx =
          style.dotStyle === "rounded"
            ? unit * 0.32
            : style.dotStyle === "classy"
              ? unit * 0.5
              : 0;
        cells.push(
          `<rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${unit.toFixed(2)}" height="${unit.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${rx.toFixed(2)}" fill="${fg}"/>`,
        );
      }
    }
  }

  const eyeGroup = eyeShapes(matrix.size, unit, fg, style.eyeStyle)
    .replace(/var\(--qr-bg\)/g, bg)
    .replace(
      /(<rect x="|<rect x=")/g,
      "$1",
    );
  // shift eyes by margin
  const eyes = `<g transform="translate(${(margin * unit).toFixed(2)}, ${(margin * unit).toFixed(2)})">${eyeGroup}</g>`;

  let logo = "";
  if (style.logo) {
    const lw = (Math.max(12, Math.min(30, style.logoSize)) / 100) * 1000;
    const lx = (1000 - lw) / 2;
    const pad = lw * 0.12;
    logo =
      `<rect x="${(lx - pad).toFixed(2)}" y="${(lx - pad).toFixed(2)}" width="${(lw + pad * 2).toFixed(2)}" height="${(lw + pad * 2).toFixed(2)}" rx="${(lw * 0.16).toFixed(2)}" fill="${bg}"/>` +
      `<image href="${escapeXml(style.logo)}" x="${lx.toFixed(2)}" y="${lx.toFixed(2)}" width="${lw.toFixed(2)}" height="${lw.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const frameRect =
    style.frame === "none"
      ? ""
      : `<rect x="6" y="6" width="${vbW - 12}" height="${vbH - 12}" rx="${style.frame === "badge" ? 90 : 48}" fill="${frameColor}"/>`;

  const label = hasFrameText
    ? `<text x="${vbW / 2}" y="${textY}" text-anchor="middle" font-family="Inter, Manrope, Arial, sans-serif" font-size="104" font-weight="700" fill="#FFFFFF">${escapeXml(
        (style.frameText || "SCAN ME").slice(0, 24),
      )}</text>`
      : "";

  const qrBackdrop = `<rect x="${qrY === outerPad ? outerPad : outerPad}" y="${qrY}" width="1000" height="1000" rx="${style.frame === "none" ? 0 : 24}" fill="${bg}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${(size * vbH) / vbW}" viewBox="0 0 ${vbW} ${vbH}" shape-rendering="geometricPrecision">${frameRect}${qrBackdrop}<g transform="translate(${outerPad}, ${qrY})">${cells.join(
    "",
  )}${eyes}${logo}</g>${label}</svg>`;
}

export function svgAspect(style: QRStyle) {
  const hasFrameText = style.frame !== "none" && style.frame !== "rounded";
  const outerPad = style.frame === "none" ? 0 : 40;
  const w = 1000 + outerPad * 2;
  const h = 1000 + outerPad * 2 + (hasFrameText ? 180 : 0);
  return w / h;
}

/** Raw module matrix, used by the EPS exporter. */
export function qrModules(value: string, ecc: EccLevel) {
  const m = buildMatrix(value || " ", ecc);
  const rows: boolean[][] = [];
  for (let y = 0; y < m.size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < m.size; x++) row.push(m.get(x, y));
    rows.push(row);
  }
  return rows;
}
