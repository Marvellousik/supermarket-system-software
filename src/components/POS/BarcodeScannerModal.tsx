"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Zap, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Product } from "@/types/Entities";
import { formatNaira, playScannerBeep } from "@/utils/formatters";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
  soundEnabled: boolean;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  products,
  soundEnabled,
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const popularTestProducts = products.slice(0, 8);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const triggerScan = useCallback(
    (codeToScan: string) => {
      const clean = codeToScan.trim();
      if (!clean) return;

      if (soundEnabled) {
        playScannerBeep();
      }

      const matched = products.find(
        (p) =>
          p.barcode.toLowerCase() === clean.toLowerCase() ||
          p.code.toLowerCase() === clean.toLowerCase()
      );

      if (matched) {
        setLastScannedProduct(matched);
        setScanStatus(`Scanned: ${matched.name}`);
        onScan(matched.barcode);
      } else {
        setScanStatus(`Product code "${clean}" not recognized.`);
        onScan(clean);
      }

      setManualCode("");
    },
    [products, soundEnabled, onScan]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Camera stream not supported by browser. Enter barcode or pick sample test code below."
      );
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
        setCameraActive(true);
      }

      if ("BarcodeDetector" in window) {
        const BarcodeDetectorClass = (
          window as unknown as {
            BarcodeDetector: new (opts?: { formats: string[] }) => {
              detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
            };
          }
        ).BarcodeDetector;

        const barcodeDetector = new BarcodeDetectorClass({
          formats: ["ean_13", "ean_8", "upc_a", "code_128", "code_39", "qr_code"],
        });

        const interval = setInterval(async () => {
          if (!videoRef.current || !streamRef.current) {
            clearInterval(interval);
            return;
          }
          try {
            const detected = await barcodeDetector.detect(videoRef.current);
            if (detected.length > 0 && detected[0].rawValue) {
              triggerScan(detected[0].rawValue);
              clearInterval(interval);
            }
          } catch {}
        }, 500);
      }
    } catch {
      setCameraError("Camera permission denied or camera device in use.");
      setCameraActive(false);
    }
  }, [triggerScan]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      triggerScan(manualCode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-black">
      <div className="bg-white border border-[#e4e4e7] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e4e7] bg-[#fbfbf5] shrink-0">
          <span className="font-semibold text-sm text-black tracking-tight">
            Barcode Optical Reader
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#71717a] hover:text-black cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder & Controls Body */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-[#1e2c31] flex items-center justify-center font-mono">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="text-center p-6 space-y-1.5 text-xs">
                <Camera className="w-8 h-8 text-[#71717a] mx-auto mb-2" />
                <p className="font-medium text-white">
                  {cameraError || "Optical scanner ready"}
                </p>
                <p className="text-[11px] text-[#a1a1aa] max-w-md mx-auto">
                  Physical barcode guns input directly into active register. Click any test barcode below to simulate instant hardware scan.
                </p>
              </div>
            )}

            {/* Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-28 border border-white/60 rounded-lg relative">
                <div className="absolute left-0 right-0 h-[1.5px] bg-[#c1fbd4] top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(193,251,212,0.8)]" />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-black bg-[#c1fbd4] px-2 py-0.5 rounded-full font-mono font-bold">
                  TARGET AREA
                </div>
              </div>
            </div>
          </div>

          {/* Scan Status */}
          {scanStatus && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono ${
                lastScannedProduct
                  ? "bg-[#c1fbd4] border-[#c1fbd4] text-black"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {lastScannedProduct ? (
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{scanStatus}</p>
                {lastScannedProduct && (
                  <p className="text-[11px] text-[#52525b] mt-0.5 truncate">
                    Price: <span className="font-bold text-black">{formatNaira(lastScannedProduct.price)}</span> | SKU: {lastScannedProduct.code}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2 font-mono text-xs">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode or SKU (e.g. 89010001023 or HH-1023)"
              className="flex-1 min-w-0 bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black placeholder-[#a1a1aa] focus:outline-none focus:border-black"
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary-pill px-5 py-2.5 text-xs font-semibold shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Simulate</span>
            </button>
          </form>

          {/* Quick Click-to-Scan Sample Products */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-[11px] text-[#71717a] uppercase font-semibold">
              <span>Test Barcodes (Instant Scan Simulator)</span>
              <span>Click to test scan</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {popularTestProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => triggerScan(p.barcode)}
                  type="button"
                  className="p-2.5 bg-[#fbfbf5] hover:bg-white border border-[#e4e4e7] hover:border-black rounded-xl text-left transition-colors font-mono cursor-pointer card-stack-shadow"
                >
                  <p className="text-[11px] font-sans font-semibold text-black truncate" title={p.name}>
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#71717a]">
                    <span className="truncate mr-1">{p.barcode}</span>
                    <span className="text-black font-bold shrink-0">{formatNaira(p.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#e4e4e7] bg-[#fbfbf5] flex justify-between items-center text-xs font-mono text-[#71717a] shrink-0">
          <span>Audio beep: <strong className="text-black">{soundEnabled ? "ACTIVE" : "MUTED"}</strong></span>
          <button
            onClick={onClose}
            className="btn-outline-light px-4 py-1.5 text-xs font-medium cursor-pointer shrink-0"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
