import { createFileRoute } from "@tanstack/react-router";
import { Camera, Copy, ExternalLink, ScanLine, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";

const TITLE = "Free online QR code scanner — BT-QR";
const DESCRIPTION =
  "Scan a QR code with your camera or upload an image to read its content instantly. Decoding happens in your browser, nothing is uploaded.";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Scanner,
});

type Detector = { detect: (source: unknown) => Promise<{ rawValue: string }[]> };

function getDetector(): Detector | null {
  const ctor = (globalThis as unknown as { BarcodeDetector?: new (opts: unknown) => Detector })
    .BarcodeDetector;
  if (!ctor) return null;
  return new ctor({ formats: ["qr_code"] });
}

function Scanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(Boolean(getDetector()));
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function start() {
    const detector = getDetector();
    if (!detector) {
      toast.error("Live camera scanning is not supported in this browser — upload an image instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            setResult(codes[0].rawValue);
            toast.success("QR code detected");
            stop();
            return;
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };
      rafRef.current = requestAnimationFrame(() => void tick());
    } catch {
      toast.error("Camera access was blocked. Allow camera permission or upload an image.");
    }
  }

  async function scanFile(file: File) {
    const detector = getDetector();
    if (!detector) {
      toast.error("This browser cannot decode QR images. Try Chrome or Edge.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      if (codes[0]?.rawValue) {
        setResult(codes[0].rawValue);
        toast.success("QR code detected");
      } else {
        toast.error("No QR code found in that image.");
      }
    } catch {
      toast.error("Could not read that image.");
    }
  }

  const isLink = /^https?:\/\//i.test(result);

  return (
    <div className="min-h-screen bg-surface-gradient">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">QR code scanner</h1>
        <p className="mt-4 text-muted-foreground">
          Point your camera at a QR code or upload a screenshot. Decoding happens entirely in your
          browser — the image never leaves your device.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card p-5">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-secondary">
            <video
              ref={videoRef}
              muted
              playsInline
              className={scanning ? "size-full object-cover" : "hidden"}
            />
            {!scanning ? (
              <div className="p-6 text-center">
                <ScanLine className="mx-auto size-10 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {supported
                    ? "Camera preview appears here"
                    : "Live scanning is unavailable in this browser — use image upload"}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {scanning ? (
              <Button variant="outline" onClick={stop}>
                Stop camera
              </Button>
            ) : (
              <Button
                className="bg-brand-gradient text-primary-foreground"
                onClick={() => void start()}
              >
                <Camera className="mr-2 size-4" /> Start camera
              </Button>
            )}
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                <Upload className="mr-2 size-4" /> Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void scanFile(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </Button>
          </div>
        </div>

        {result ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Scan result</h2>
            <p className="mt-2 break-all rounded-xl bg-secondary/60 p-4 text-sm">{result}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(result);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="mr-2 size-4" /> Copy
              </Button>
              {isLink ? (
                <Button asChild className="bg-brand-gradient text-primary-foreground">
                  <a href={result} target="_blank" rel="noreferrer noopener">
                    <ExternalLink className="mr-2 size-4" /> Open link
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
