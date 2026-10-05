import { NotificationItem } from "@/types/Entities";

export interface HourlySalesPoint {
  hour: string;
  revenue: number; // in NGN
  transactions: number;
}

export const HOURLY_SALES_DATA: HourlySalesPoint[] = [
  { hour: "08:00", revenue: 84000, transactions: 18 },
  { hour: "09:00", revenue: 145000, transactions: 34 },
  { hour: "10:00", revenue: 210000, transactions: 52 },
  { hour: "11:00", revenue: 295000, transactions: 74 },
  { hour: "12:00", revenue: 380000, transactions: 96 },
  { hour: "13:00", revenue: 340000, transactions: 88 },
  { hour: "14:00", revenue: 275000, transactions: 68 },
  { hour: "15:00", revenue: 310000, transactions: 78 },
  { hour: "16:00", revenue: 420000, transactions: 110 },
  { hour: "17:00", revenue: 580000, transactions: 145 },
  { hour: "18:00", revenue: 640000, transactions: 162 },
  { hour: "19:00", revenue: 510000, transactions: 124 },
  { hour: "20:00", revenue: 360000, transactions: 85 },
  { hour: "21:00", revenue: 190000, transactions: 44 },
];

export const CATEGORY_DISTRIBUTION = [
  { name: "Groceries & Staples", percentage: 38, amount: 1080000, color: "#059669" },
  { name: "Breakfast & Provisions", percentage: 22, amount: 625000, color: "#10b981" },
  { name: "Drinks & Beverages", percentage: 16, amount: 454000, color: "#34d399" },
  { name: "Laundry & Cleaning", percentage: 12, amount: 341000, color: "#6ee7b7" },
  { name: "Toiletries & Hygiene", percentage: 8, amount: 227000, color: "#a7f3d0" },
  { name: "Other Household", percentage: 4, amount: 115000, color: "#cbd5e1" },
];

export const PAYMENT_SPLIT = [
  { method: "POS Card", percentage: 58, count: 745, color: "#059669" },
  { method: "Cash", percentage: 27, count: 346, color: "#10b981" },
  { method: "Instant Transfer", percentage: 15, count: 193, color: "#8b5cf6" },
];

export const RECENT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    title: "Low Stock Alert: Mama Gold Rice",
    message: "Remaining stock in Aisle 4 is down to 8 bags. Below threshold of 15.",
    timestamp: "10 mins ago",
    type: "warning",
    read: false,
  },
  {
    id: "notif-02",
    title: "Terminal 02 Shift Synchronized",
    message: "Cashier Chioma closed shift with ₦102,020 in total audited receipts.",
    timestamp: "28 mins ago",
    type: "info",
    read: false,
  },
  {
    id: "notif-03",
    title: "Purchase Order #FMN-884 Approved",
    message: "Flour Mills of Nigeria confirmed dispatch for tomorrow 09:00 AM.",
    timestamp: "1 hour ago",
    type: "success",
    read: true,
  },
  {
    id: "notif-04",
    title: "Thermal Printer Fleet Online",
    message: "All 4 terminal ESC/POS receipt bridges connected and operational.",
    timestamp: "2 hours ago",
    type: "info",
    read: true,
  },
];
