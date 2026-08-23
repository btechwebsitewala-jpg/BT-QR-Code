import { deflateSync } from "node:zlib";

import { qrModules, type QRStyle } from "./render";

/** Minimal 5x7 pixel font, row-major, used to letter the social preview card. */
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10011", "01111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
  "#": ["01010", "11111", "01010", "01010", "01010", "11111", "01010"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

type RGB = [number, number, number];

function hexToRgb(hex: string, fallback: RGB = [0, 0, 0]): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) return fallback;
  const v = m[1];
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

class Bitmap {
  readonly data: Uint8Array;
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8Array(width * height * 3);
  }

  fill(color: RGB) {
    this.rect(0, 0, this.width, this.height, color);
  }

  set(x: number, y: number, color: RGB) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 3;
    this.data[i] = color[0];
    this.data[i + 1] = color[1];
    this.data[i + 2] = color[2];
  }

  rect(x0: number, y0: number, w: number, h: number, color: RGB) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, color);
  }

  roundedRect(x0: number, y0: number, w: number, h: number, r: number, color: RGB) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x < r ? r - x : x >= w - r ? x - (w - r - 1) : 0;
        const dy = y < r ? r - y : y >= h - r ? y - (h - r - 1) : 0;
        if (dx * dx + dy * dy > r * r) continue;
        this.set(x0 + x, y0 + y, color);
      }
    }
  }

  verticalGradient(from: RGB, to: RGB) {
    for (let y = 0; y < this.height; y++) {
      const t = y / Math.max(1, this.height - 1);
      const color: RGB = [
        Math.round(from[0] + (to[0] - from[0]) * t),
        Math.round(from[1] + (to[1] - from[1]) * t),
        Math.round(from[2] + (to[2] - from[2]) * t),
      ];
      this.rect(0, y, this.width, 1, color);
    }
  }

  diagonalGradient(from: RGB, mid: RGB, to: RGB) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = (x / this.width + y / this.height) / 2;
        const [a, b, k] = t < 0.5 ? [from, mid, t * 2] : [mid, to, (t - 0.5) * 2];
        this.set(x, y, [
          Math.round(a[0] + (b[0] - a[0]) * k),
          Math.round(a[1] + (b[1] - a[1]) * k),
          Math.round(a[2] + (b[2] - a[2]) * k),
        ]);
      }
    }
  }
}

function textWidth(text: string, scale: number, tracking: number) {
  return text.length * (5 * scale + tracking) - tracking;
}

function drawText(
  bmp: Bitmap,
  text: string,
  centerX: number,
  y: number,
  scale: number,
  color: RGB,
  tracking = scale,
) {
  const upper = text.toUpperCase();
  let x = Math.round(centerX - textWidth(upper, scale, tracking) / 2);
  for (const ch of upper) {
    const glyph = FONT[ch] ?? FONT[" "]!;
    glyph.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] !== "1") continue;
        bmp.rect(x + rx * scale, y + ry * scale, scale, scale, color);
      }
    });
    x += 5 * scale + tracking;
  }
}

function crc32(buf: Uint8Array) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(data.length + 12);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

function encodePng(bmp: Bitmap) {
  const raw = new Uint8Array(bmp.height * (bmp.width * 3 + 1));
  for (let y = 0; y < bmp.height; y++) {
    const dst = y * (bmp.width * 3 + 1);
    raw[dst] = 0;
    raw.set(bmp.data.subarray(y * bmp.width * 3, (y + 1) * bmp.width * 3), dst + 1);
  }
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, bmp.width);
  view.setUint32(4, bmp.height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  const compressed = new Uint8Array(deflateSync(Buffer.from(raw), { level: 9 }));
  const parts = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", new Uint8Array(0)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const png = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    png.set(p, offset);
    offset += p.length;
  }
  return png;
}

export interface OgCardOptions {
  value: string;
  style?: Partial<QRStyle>;
  title?: string;
  caption?: string;
}

/**
 * Renders a 1200x630 "Scan me" social preview card containing the QR code,
 * as a PNG. Pure JS so it runs inside the edge runtime.
 */
export function renderQrOgPng({ value, style, title, caption }: OgCardOptions): Uint8Array {
  const W = 1200;
  const H = 630;
  const fg = hexToRgb(style?.fg ?? "#0C2340", [12, 35, 64]);
  const bg = hexToRgb(style?.bg ?? "#FFFFFF", [255, 255, 255]);
  const white: RGB = [255, 255, 255];

  const bmp = new Bitmap(W, H);
  bmp.diagonalGradient([12, 35, 64], [26, 74, 110], [45, 138, 158]);

  // QR card on the left
  const cardSize = 430;
  const cardX = 80;
  const cardY = Math.round((H - cardSize) / 2);
  bmp.roundedRect(cardX, cardY, cardSize, cardSize, 36, white);

  const rows = qrModules(value || " ", (style?.ecc as QRStyle["ecc"]) ?? "M");
  const modules = rows.length;
  const quiet = 34;
  const scale = Math.max(1, Math.floor((cardSize - quiet * 2) / modules));
  const qrPixels = modules * scale;
  const qrX = cardX + Math.round((cardSize - qrPixels) / 2);
  const qrY = cardY + Math.round((cardSize - qrPixels) / 2);
  bmp.rect(qrX - 12, qrY - 12, qrPixels + 24, qrPixels + 24, bg);
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (!rows[y]?.[x]) continue;
      bmp.rect(qrX + x * scale, qrY + y * scale, scale, scale, fg);
    }
  }

  // Copy on the right
  const textX = cardX + cardSize + 90;
  const colCenter = textX + (W - textX - 70) / 2;
  drawText(bmp, "SCAN ME", colCenter, 178, 9, white, 10);
  bmp.rect(Math.round(colCenter - 130), 268, 260, 5, [92, 189, 185]);

  const heading = (title ?? "BT-QR CODE").slice(0, 20);
  drawText(bmp, heading, colCenter, 306, 5, white, 5);

  if (caption) {
    const short = caption.replace(/^https?:\/\//i, "").slice(0, 30);
    drawText(bmp, short, colCenter, 372, 3, [176, 214, 226], 3);
  }

  drawText(bmp, "MADE WITH BT-QR", colCenter, 470, 3, [140, 196, 212], 3);

  return encodePng(bmp);
}
