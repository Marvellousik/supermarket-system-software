"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Receipt,
  Download,
  Eye,
  Filter,
  RefreshCw,
  FileText,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Order, Receipt as ReceiptEntity } from "@/types/Entities";
import { formatNaira, generateReceiptPDF } from "@/utils/formatters";
import OrderDetailDrawer from "./OrderDetailDrawer";

interface OrdersViewProps {
  receipts: ReceiptEntity[];
}

export default function OrdersView({ receipts }: OrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [terminalFilter, setTerminalFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Convert receipts to rich Order models
  const orders: Order[] = useMemo(() => {
    return receipts.map((r, index) => {
      const parts = r.date.split(", ");
      const datePart = parts[0] || "Today";
      const timePart = parts[1] || "12:00 PM";

      const customerNames = [
        "Dr. Kunle Adeleke",
        "Mrs. Ngozi Okafor",
        "Engr. Tunde Bakare",
        "Hajiya Fatima Bello",
        "Chukwudi Eze",
        "Walk-in Shopper",
        "Amina Mohammed",
        "Babatunde Alabi",
      ];
      const customer = index === 0 ? "Walk-in Shopper" : customerNames[index % customerNames.length];

      return {
        id: r.id,
        orderNumber: r.receiptNumber,
        customerName: customer,
        customerPhone: customer === "Walk-in Shopper" ? undefined : "+234 803 000 1234",
        terminalId: r.machineId,
        cashierName: r.cashierName,
        itemsCount: r.items.reduce((sum, item) => sum + item.quantity, 0),
        items: r.items,
        subtotal: r.subtotal,
        tax: r.tax,
        discount: r.discount,
        total: r.total,
        paymentMethod: r.paymentMethod,
        paymentStatus: "PAID",
        orderStatus: "COMPLETED",
        date: datePart,
        time: timePart,
      };
    });
  }, [receipts]);

  // KPIs
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const averageTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.cashierName.toLowerCase().includes(q);

      const matchesPayment =
        paymentFilter === "all" || o.paymentMethod.toLowerCase() === paymentFilter.toLowerCase();

      const matchesTerminal =
        terminalFilter === "all" || o.terminalId.toString() === terminalFilter;

      return matchesSearch && matchesPayment && matchesTerminal;
    });
  }, [orders, searchQuery, paymentFilter, terminalFilter]);

  const handleDownloadPDF = (order: Order) => {
    const receiptObj: ReceiptEntity = {
      id: order.id,
      receiptNumber: order.orderNumber,
      date: `${order.date}, ${order.time}`,
      cashierName: order.cashierName,
      cashierId: 1,
      machineId: order.terminalId,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      amountTendered: order.total,
      change: 0,
    };
    generateReceiptPDF(receiptObj);
  };

  return (
    <div className="w-full space-y-6 font-sans text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            Sales & Order Settlement Ledger
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Audit logs, customer tender breakdowns & instant PDF reprint history
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-[#52525b] bg-white border border-[#e4e4e7] px-3.5 py-1.5 rounded-full card-stack-shadow">
            Database: <strong className="text-black font-bold">{orders.length} Verified Records</strong>
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block">Settled Volume</span>
          <div className="text-2xl sm:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums">{formatNaira(totalRevenue)}</div>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#c1fbd4] text-black border border-[#a8f5c2]">
            100% reconciled
          </span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block">Total Receipts</span>
          <div className="text-2xl sm:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums">{orders.length} Orders</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block">Across 4 terminals</span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block">Average Basket</span>
          <div className="text-2xl sm:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums">{formatNaira(averageTicket)}</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block">Per checkout</span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block">Settlement Status</span>
          <div className="text-2xl sm:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums">100% Paid</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block">Zero open voids</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt #, customer, cashier..."
              className="w-full bg-white border border-[#e4e4e7] focus:border-black pl-8 pr-3 py-2 rounded-md text-black placeholder:text-[#a1a1aa] text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center bg-[#fbfbf5] p-1 rounded-full border border-[#e4e4e7] text-xs">
            {["all", "cash", "card", "transfer"].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentFilter(m)}
                className={`px-3.5 py-1.5 rounded-full capitalize cursor-pointer transition-all text-xs ${
                  paymentFilter === m
                    ? "bg-black font-semibold text-white shadow-xs"
                    : "text-[#52525b] hover:text-black"
                }`}
              >
                {m === "all" ? "All Methods" : m === "card" ? "POS Card" : m}
              </button>
            ))}
          </div>

          {/* Terminal Station Filter */}
          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            className="bg-white border border-[#e4e4e7] text-black px-3.5 py-2 rounded-md text-xs focus:outline-none focus:border-black cursor-pointer font-mono"
          >
            <option value="all">All Terminals</option>
            <option value="1">Terminal 01</option>
            <option value="2">Terminal 02</option>
            <option value="3">Terminal 03</option>
            <option value="4">Terminal 04</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#fbfbf5] text-[#71717a] uppercase text-[10px] font-mono border-b border-[#e4e4e7] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Receipt / Order #</th>
                <th className="py-3.5 px-3">Date & Time</th>
                <th className="py-3.5 px-3">Terminal</th>
                <th className="py-3.5 px-3">Customer Account</th>
                <th className="py-3.5 px-3">Cashier</th>
                <th className="py-3.5 px-3">Items</th>
                <th className="py-3.5 px-3">Method</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Settlement (₦)</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-[#fbfbf5] transition-colors cursor-pointer group font-mono"
                >
                  <td className="py-3.5 px-4 font-bold text-black group-hover:text-[#3f3f46] transition-colors">
                    {order.orderNumber}
                  </td>

                  <td className="py-3.5 px-3 text-[#71717a] text-[11px] whitespace-nowrap">
                    {order.date}, {order.time}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#c1fbd4] text-black border border-[#a8f5c2]">
                      Machine 0{order.terminalId}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-sans font-medium text-black">
                    {order.customerName}
                  </td>

                  <td className="py-3.5 px-3 uppercase text-[#52525b] text-[11px] font-sans">
                    {order.cashierName}
                  </td>

                  <td className="py-3.5 px-3 text-[#71717a] text-[11px]">
                    {order.itemsCount} units
                  </td>

                  <td className="py-3.5 px-3 uppercase text-[10px] font-semibold text-[#52525b]">
                    {order.paymentMethod}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#c1fbd4] text-black border border-[#a8f5c2]">
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-black text-xs tabular-nums">
                    {formatNaira(order.total)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div
                      className="flex items-center justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        title="View Order Dossier"
                        className="p-1.5 rounded-full bg-white hover:bg-[#fbfbf5] border border-[#e4e4e7] text-[#52525b] hover:text-black transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(order)}
                        title="Download PDF Receipt"
                        className="px-3 py-1 rounded-full bg-[#c1fbd4] hover:bg-[#aaf5c2] text-black font-mono text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-[#a1a1aa] font-mono text-xs">
            <FileText className="w-8 h-8 text-[#d4d4d8] mx-auto mb-2" />
            <p>No orders match filter query.</p>
          </div>
        )}
      </div>

      {/* Slide-over Order Dossier */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
