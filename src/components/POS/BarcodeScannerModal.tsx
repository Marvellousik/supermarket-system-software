"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
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
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              triggerScan(rawValue);
              clearInterval(interval);
            }
          } catch {
            // Ignored
          }
        }, 300);

        return () => clearInterval(interval);
      }
    } catch {
      setCameraError(
        "Camera feed unavailable or access declined. Enter code manually or select test code below."
      );
      setCameraActive(false);
    }
  }, [triggerScan]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setManualCode("");
      setScanStatus(null);
      setLastScannedProduct(null);
    } else {
      startCamera();
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 font-mono text-xs shrink-0">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Barcode Optical Reader
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer shrink-0"
          >
            [X]
          </button>
        </div>

        {/* Viewfinder & Controls Body */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="relative aspect-video w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center font-mono">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="text-center p-6 space-y-1 text-xs">
                <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="font-medium text-slate-300">
                  {cameraError || "Optical scanner ready"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Physical barcode gun inputs directly into active register. Click any test barcode below to simulate instant hardware scan.
                </p>
              </div>
            )}

            {/* Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-28 border border-white/70 rounded relative">
                <div className="absolute left-0 right-0 h-[1.5px] bg-red-500 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white bg-slate-900 px-2 py-0.5 rounded font-mono">
                  TARGET AREA
                </div>
              </div>
            </div>
          </div>

          {/* Scan Status */}
          {scanStatus && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-mono ${
                lastScannedProduct
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {lastScannedProduct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{scanStatus}</p>
                {lastScannedProduct && (
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                    Price: <span className="font-bold text-slate-900">{formatNaira(lastScannedProduct.price)}</span> | SKU: {lastScannedProduct.code}
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
              className="flex-1 min-w-0 bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Simulate</span>
            </button>
          </form>

          {/* Quick Click-to-Scan Sample Products */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-500 uppercase font-semibold">
              <span>Test Barcodes (Instant Scan Simulator)</span>
              <span>Click to test scan</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {popularTestProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => triggerScan(p.barcode)}
                  type="button"
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-colors font-mono cursor-pointer"
                >
                  <p className="text-[11px] font-sans font-semibold text-slate-800 truncate" title={p.name}>
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span className="truncate mr-1">{p.barcode}</span>
                    <span className="text-emerald-700 font-bold shrink-0">{formatNaira(p.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs font-mono text-slate-500 shrink-0">
          <span>Audio beep: <strong className="text-slate-700">{soundEnabled ? "ACTIVE" : "MUTED"}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-sans transition-colors font-medium cursor-pointer shrink-0"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
