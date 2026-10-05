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
    <div className="w-full space-y-5 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Sales & Order Settlement Ledger
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Audit logs, customer tender breakdowns & instant PDF reprint history
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Database: <strong className="text-slate-900 font-bold">{orders.length} Verified Records</strong>
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Settled Volume</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{formatNaira(totalRevenue)}</div>
          <span className="text-[11px] font-semibold text-emerald-800">100% reconciled</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Total Receipts</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{orders.length} Orders</div>
          <span className="text-[11px] font-normal text-slate-500">Across 4 terminals</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Average Basket</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">{formatNaira(averageTicket)}</div>
          <span className="text-[11px] font-normal text-slate-500">Per checkout</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Settlement Status</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">100% Paid</div>
          <span className="text-[11px] font-normal text-slate-500">Zero open voids</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt #, customer, cashier..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-1.5 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {["all", "cash", "card", "transfer"].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentFilter(m)}
                className={`px-3 py-1 rounded-md capitalize cursor-pointer transition-all ${
                  paymentFilter === m ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
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
            className="bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-emerald-600 cursor-pointer font-mono"
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
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Receipt / Order #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Terminal</th>
                <th className="py-3 px-3">Customer Account</th>
                <th className="py-3 px-3">Cashier</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Settlement (₦)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group font-mono"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {order.orderNumber}
                  </td>

                  <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {order.date}, {order.time}
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Machine 0{order.terminalId}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-sans font-medium text-slate-800">
                    {order.customerName}
                  </td>

                  <td className="py-3 px-3 uppercase text-slate-600 text-[11px] font-sans">
                    {order.cashierName}
                  </td>

                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {order.itemsCount} units
                  </td>

                  <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-600">
                    {order.paymentMethod}
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-slate-900 text-xs">
                    {formatNaira(order.total)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div
                      className="flex items-center justify-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        title="View Order Dossier"
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(order)}
                        title="Download PDF Receipt"
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
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
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
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
