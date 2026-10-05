"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Barcode,
  Camera,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  ReceiptText,
  Search,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";
import { Product, CartItem, Receipt, ReceiptItem } from "@/types/Entities";
import { formatNaira, playScannerBeep } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";
import BarcodeScannerModal from "./BarcodeScannerModal";
import ReceiptModal from "../Receipts/ReceiptModal";

interface POSCheckoutProps {
  products: Product[];
  initialProductToAdd?: Product | null;
  onClearInitialProduct?: () => void;
  onAddTransaction?: (receipt: Receipt) => void;
}

export default function POSCheckout({
  products,
  initialProductToAdd,
  onClearInitialProduct,
  onAddTransaction,
}: POSCheckoutProps) {
  const {
    activeMachineId,
    machines,
    switchMachine,
    addMachine,
    activeShift,
    currentUser,
    soundEnabled,
  } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [scanFeedback, setScanFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Handle external product selection
  useEffect(() => {
    if (initialProductToAdd) {
      addToCart(initialProductToAdd);
      if (soundEnabled) {
        playScannerBeep();
      }
      setScanFeedback({
        type: "success",
        message: `Added: ${initialProductToAdd.name} (${formatNaira(initialProductToAdd.price)})`,
      });
      onClearInitialProduct?.();
    }
  }, [initialProductToAdd, onClearInitialProduct, soundEnabled]);

  // Product search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSearchResults(matches);
  }, [searchQuery, products]);

  const handleScanOrSubmit = (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === clean.toLowerCase() ||
        p.code.toLowerCase() === clean.toLowerCase()
    );

    if (found) {
      addToCart(found);
      if (soundEnabled) {
        playScannerBeep();
      }
      setScanFeedback({
        type: "success",
        message: `Added: ${found.name} [${found.code}] (${formatNaira(found.price)})`,
      });
      setBarcodeInput("");
      setSearchQuery("");
      setSearchResults([]);
    } else {
      setScanFeedback({
        type: "error",
        message: `Item not found for code: "${clean}"`,
      });
    }

    setTimeout(() => {
      setScanFeedback(null);
    }, 4000);
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAmountTendered("");
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxEnabled ? taxableAmount * 0.075 : 0;
  const totalAmount = taxableAmount + taxAmount;

  const tenderedNumber = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedNumber - totalAmount);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setAmountTendered(totalAmount.toString());
    setIsPaymentModalOpen(true);
  };

  const handleProcessSale = async () => {
    const cashierName =
      activeShift?.cashierName || currentUser?.username || "admin";
    const cashierId = activeShift?.cashierId || currentUser?.id || 1;
    const machineId = activeMachineId || 1;

    const receiptNumber = `RCP-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const receiptItems: ReceiptItem[] = cart.map((ci) => ({
      id: ci.product.id,
      barcode: ci.product.barcode,
      name: ci.product.name,
      unit: ci.product.unit,
      price: ci.product.price,
      quantity: ci.quantity,
      total: ci.product.price * ci.quantity,
    }));

    const finalReceipt: Receipt = {
      id: `rec-${Date.now()}`,
      receiptNumber,
      date: new Date().toLocaleString(),
      cashierName,
      cashierId,
      machineId,
      items: receiptItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: totalAmount,
      paymentMethod,
      amountTendered:
        paymentMethod === "cash" ? tenderedNumber : totalAmount,
      change: paymentMethod === "cash" ? changeDue : 0,
    };

    // Save to SQLite database backend
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalReceipt),
      });
    } catch (e) {
      console.error("Backend transaction log failure", e);
    }

    if (onAddTransaction) {
      onAddTransaction(finalReceipt);
    }

    setActiveReceipt(finalReceipt);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    setCart([]);
    setAmountTendered("");
  };

  const handleAddNewTerminal = () => {
    const nextId =
      machines.length > 0 ? Math.max(...machines.map((m) => m.id)) + 1 : 1;
    addMachine(nextId);
    switchMachine(nextId);
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">
      {/* DIRECT MACHINE / TERMINAL SWITCHER BAR */}
      <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 font-bold tracking-wider mr-1 shrink-0">
            Active Register:
          </span>
          {machines.map((m) => {
            const isSelected = activeMachineId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMachine(m.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>Machine 0{m.id}</span>
                {isSelected ? (
                  <span className="ml-1.5 text-[9px] bg-emerald-600 text-white px-1 py-0.2 rounded font-sans uppercase font-semibold">
                    ACTIVE
                  </span>
                ) : null}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAddNewTerminal}
            className="px-2.5 py-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-mono transition-colors cursor-pointer shrink-0"
          >
            + Add Terminal
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <span className="text-slate-500">
            Cashier: <strong className="text-slate-900 uppercase">{currentUser?.username || "admin"}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded shadow-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Camera Scanner</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE: SCANNER & CART (LEFT) | RECEIPT TOTALS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Barcode Scanning & Itemized Table */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Scanner Input Strip */}
          <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-lg space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleScanOrSubmit(barcodeInput);
                    }
                  }}
                  placeholder="Scan barcode with scanner or enter code (e.g. 89010001001)..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-9 pr-3 py-2 rounded text-slate-900 placeholder-slate-400 text-xs font-mono focus:outline-none transition-colors"
                />
              </div>

              <div className="relative sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter catalog..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-2 rounded text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => handleScanOrSubmit(barcodeInput)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shrink-0 transition-colors shadow-xs cursor-pointer"
              >
                Scan Code
              </button>
            </div>

            {/* Instant Catalog Match Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-1 space-y-0.5 shadow-xl">
                <div className="text-[10px] text-slate-400 font-mono uppercase px-2 py-1 font-semibold">
                  Catalog Match ({searchResults.length})
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      addToCart(product);
                      if (soundEnabled) playScannerBeep();
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-slate-50 flex items-center justify-between transition-colors font-mono text-xs cursor-pointer border-b border-slate-50 last:border-b-0"
                  >
                    <div>
                      <span className="text-slate-900 font-sans font-medium">
                        {product.name}
                      </span>
                      <span className="ml-2 text-slate-500 text-[11px]">
                        [{product.barcode}]
                      </span>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      {formatNaira(product.price)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Status feedback */}
            {scanFeedback && (
              <div
                className={`p-2 rounded border text-xs font-mono flex items-center gap-2 ${
                  scanFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {scanFeedback.type === "success" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{scanFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Itemized Order Table */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden flex-1 min-h-[360px] flex flex-col">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono uppercase font-bold text-slate-800">
                <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                <span>Line Items ({cart.length})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500 font-semibold">
                  {cart.reduce((total, i) => total + i.quantity, 0)} Units
                </span>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="text-slate-500 hover:text-slate-900 disabled:opacity-30 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
                <Barcode className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-slate-800 font-sans font-bold text-sm mb-1">
                  Terminal Register Empty
                </p>
                <p className="text-slate-500 max-w-sm mb-4">
                  Scan barcode with gun, enter product code, or select quick items below.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
                  {products.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        addToCart(p);
                        if (soundEnabled) playScannerBeep();
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs transition-colors flex items-center gap-1 font-mono cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                      <span>{p.name.substring(0, 18)}..</span>
                      <span className="text-slate-900 font-bold">{formatNaira(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto divide-y divide-slate-100 max-h-[460px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Ext Total</th>
                      <th className="py-2.5 px-2 text-center">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <tr key={item.product.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 min-w-[150px] max-w-[240px]">
                          <div className="font-semibold text-slate-900 truncate" title={item.product.name}>
                            {item.product.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            CODE: {item.product.code} | BARCODE: {item.product.barcode}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700 shrink-0">
                          {formatNaira(item.product.price)}
                        </td>
                        <td className="py-2.5 px-3 shrink-0">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-5 h-5 bg-white border border-slate-300 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer shrink-0"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-5 h-5 bg-white border border-slate-300 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 shrink-0">
                          {formatNaira(item.product.price * item.quantity)}
                        </td>
                        <td className="py-2.5 px-2 text-center shrink-0">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Totals & Finalize */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="bg-white border border-slate-200 shadow-xs rounded-lg p-4 space-y-3 font-mono text-xs">
            <div className="pb-2 border-b border-slate-200 flex justify-between items-center">
              <span className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                Summary
              </span>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Terminal 0{activeMachineId}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="text-slate-900 font-bold">{formatNaira(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Discount (%):</span>
              <div className="flex gap-1 font-sans">
                {[0, 5, 10].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setDiscountPercent(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                      discountPercent === rate
                        ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({discountPercent}%):</span>
                <span>-{formatNaira(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-sans">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>VAT (7.5%):</span>
              </label>
              <span className="text-slate-900 font-semibold">
                {taxEnabled ? formatNaira(taxAmount) : "₦0.00"}
              </span>
            </div>

            {/* Total Due Callout Box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider font-sans">
                Total Amount Due (NGN)
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight tabular-nums mt-1">
                {formatNaira(totalAmount)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-sans font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Process Payment</span>
            </button>
          </div>

          {/* Machine Station Details */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-lg p-3 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Terminal Station:</span>
              <strong className="text-slate-900 font-bold">Machine 0{activeMachineId}</strong>
            </div>
            <div className="flex justify-between">
              <span>Operator On Duty:</span>
              <strong className="text-slate-900 uppercase font-bold">{currentUser?.username || "admin"}</strong>
            </div>
            <div className="flex justify-between">
              <span>Currency:</span>
              <strong className="text-slate-800">NGN (₦)</strong>
            </div>
            <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
              All sales processed on this terminal are persisted into SQLite and tied to Machine 0{activeMachineId}.
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT PROCESSING MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-md overflow-hidden shadow-2xl font-sans flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Complete Transaction
              </span>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer shrink-0 ml-2"
              >
                [X]
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex justify-between items-baseline font-mono">
                <span className="text-xs text-emerald-800 font-semibold font-sans uppercase">Total Due:</span>
                <span className="text-xl font-bold text-emerald-950">
                  {formatNaira(totalAmount)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-500 font-bold">
                  Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("cash");
                      setAmountTendered(totalAmount.toString());
                    }}
                    className={`p-2.5 rounded-md border text-center font-bold transition-all cursor-pointer ${
                      paymentMethod === "cash"
                        ? "bg-emerald-50 border-2 border-emerald-600 text-emerald-800 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("card");
                      setAmountTendered(totalAmount.toString());
                    }}
                    className={`p-2.5 rounded-md border text-center font-bold transition-all cursor-pointer ${
                      paymentMethod === "card"
                        ? "bg-emerald-50 border-2 border-emerald-600 text-emerald-800 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    POS Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("transfer");
                      setAmountTendered(totalAmount.toString());
                    }}
                    className={`p-2.5 rounded-md border text-center font-bold transition-all cursor-pointer ${
                      paymentMethod === "transfer"
                        ? "bg-emerald-50 border-2 border-emerald-600 text-emerald-800 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono text-xs">
                  <label className="text-slate-600 font-semibold block">
                    Cash Tendered (₦):
                  </label>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-md px-3 py-2 text-slate-900 font-mono text-base font-bold focus:outline-none shadow-xs"
                    placeholder="Enter customer cash..."
                  />

                  <div className="flex flex-wrap gap-1 pt-1">
                    {[1000, 2000, 5000, 10000, 20000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountTendered(amt.toString())}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] text-slate-700 rounded shadow-2xs cursor-pointer font-medium"
                      >
                        +{formatNaira(amt)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmountTendered(totalAmount.toString())}
                      className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded cursor-pointer"
                    >
                      Exact
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-600">Change Due:</span>
                    <span
                      className={`text-sm font-bold ${
                        changeDue >= 0 ? "text-emerald-700 font-mono font-bold" : "text-rose-600"
                      }`}
                    >
                      {formatNaira(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              <div className="text-[11px] font-mono text-slate-500 flex justify-between border-t border-slate-100 pt-2">
                <span>Terminal Destination:</span>
                <span className="text-slate-900 font-bold">
                  Machine 0{activeMachineId}
                </span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 font-sans shrink-0">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-mono cursor-pointer shrink-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessSale}
                disabled={paymentMethod === "cash" && tenderedNumber < totalAmount}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ReceiptText className="w-3.5 h-3.5 shrink-0" />
                <span>Confirm Sale & Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScan={handleScanOrSubmit}
        products={products}
        soundEnabled={soundEnabled}
      />

      {/* RECEIPT MODAL */}
      <ReceiptModal
        receipt={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveReceipt(null);
        }}
      />
    </div>
  );
}
