export interface Cashier {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface Machine {
  id: number;
}

export type Employee = Cashier;

export type StaffItem = Employee | Machine;

export interface Product {
  id: string;
  barcode: string;
  code: string;
  name: string;
  category: string;
  price: number; // In Naira (NGN)
  costPrice?: number;
  unit: string;
  stock: number;
  minThreshold?: number;
  supplierName?: string;
  lastRestocked?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ReceiptItem {
  id: string;
  barcode: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  cashierName: string;
  cashierId: number | string;
  machineId: number;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  amountTendered: number;
  change: number;
}

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: "admin" | "cashier";
  machineId: number;
  shiftStartTime: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  fulfillmentRate: number; // percentage, e.g. 98.4
  activeOrders: number;
  leadTimeDays: number;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "Diamond" | "Platinum" | "Gold" | "Silver";
  totalSpend: number;
  visitCount: number;
  lastVisit: string;
  loyaltyPoints: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  terminalId: number;
  cashierName: string;
  itemsCount: number;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  orderStatus: "COMPLETED" | "PROCESSING" | "CANCELLED";
  date: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "alert" | "info" | "success" | "warning";
  read: boolean;
}
