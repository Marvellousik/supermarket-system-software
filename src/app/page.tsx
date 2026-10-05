"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppShell, { NavTabKey } from "@/components/Layout/AppShell";
import DashboardView from "@/components/Dashboard/DashboardView";
import InventoryView from "@/components/Inventory/InventoryView";
import ProductCatalog from "@/components/Products/ProductCatalog";
import POSCheckout from "@/components/POS/POSCheckout";
import OrdersView from "@/components/Orders/OrdersView";
import SuppliersView from "@/components/Suppliers/SuppliersView";
import CustomersView from "@/components/Customers/CustomersView";
import StaffManagement from "@/components/Staff/StaffManagement";
import ReportsView from "@/components/Reports/ReportsView";
import SettingsView from "@/components/Settings/SettingsView";
import NewProductModal from "@/components/Products/NewProductModal";
import ProductDetailDrawer from "@/components/Products/ProductDetailDrawer";
import { INITIAL_PRODUCTS } from "@/data/products";
import { Product, Receipt } from "@/types/Entities";

function SupermarketMainApp() {
  const { machines } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabKey>("dashboard");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Load products & transactions from SQLite database API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.receipts)) {
          setReceipts(data.receipts);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddTransaction = (newReceipt: Receipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const handleQuickAddToCart = (product: Product) => {
    setSelectedProductToAdd(product);
    setActiveTab("pos");
  };

  const handleSaveNewProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      products={products}
      onSelectProduct={(p) => setInspectingProduct(p)}
      cartCount={0}
    >
      {/* 1. Dashboard View */}
      {activeTab === "dashboard" && (
        <DashboardView
          products={products}
          receipts={receipts}
          machines={machines}
          onNavigate={(tab) => setActiveTab(tab as NavTabKey)}
          onSelectProduct={(p) => setInspectingProduct(p)}
          onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
        />
      )}

      {/* 2. Fast POS Checkout Register */}
      {activeTab === "pos" && (
        <POSCheckout
          products={products}
          initialProductToAdd={selectedProductToAdd}
          onClearInitialProduct={() => setSelectedProductToAdd(null)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      {/* 3. Inventory Stock Control */}
      {activeTab === "inventory" && (
        <InventoryView
          products={products}
          onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
          onAddToCart={handleQuickAddToCart}
          onUpdateStock={handleUpdateStock}
        />
      )}

      {/* 4. Products Master Registry */}
      {activeTab === "products" && (
        <ProductCatalog
          products={products}
          onAddToCart={handleQuickAddToCart}
        />
      )}

      {/* 5. Sales & Orders Ledger */}
      {activeTab === "orders" && <OrdersView receipts={receipts} />}

      {/* 6. FMCG Suppliers */}
      {activeTab === "suppliers" && <SuppliersView />}

      {/* 7. Customer Loyalty CRM */}
      {activeTab === "customers" && <CustomersView />}

      {/* 8. Staff & Physical Tills */}
      {activeTab === "staff" && <StaffManagement />}

      {/* 9. Reports & Audits */}
      {activeTab === "reports" && <ReportsView />}

      {/* 10. Settings */}
      {activeTab === "settings" && <SettingsView />}

      {/* Slide-over Product Inspector */}
      <ProductDetailDrawer
        product={inspectingProduct}
        isOpen={!!inspectingProduct}
        onClose={() => setInspectingProduct(null)}
        onAddToCart={handleQuickAddToCart}
        onUpdateStock={handleUpdateStock}
      />

      {/* New Product Creation Modal */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSaveProduct={handleSaveNewProduct}
        existingCount={products.length}
      />
    </AppShell>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <SupermarketMainApp />
    </AuthProvider>
  );
}
