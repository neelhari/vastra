import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProducts, insertProduct, updateProductInDb, deleteProductFromDb,
  fetchCategories, insertCategory, updateCategoryInDb, deleteCategoryFromDb,
  fetchBanners, insertBanner, updateBannerInDb, deleteBannerFromDb,
  fetchCoupons, insertCoupon, updateCouponInDb, deleteCouponFromDb,
  fetchOrders, saveOrderToSupabase, updateOrderStatusInDb,
  fetchContactMessages, updateMessageStatusInDb,
  fetchSettings, updateSettingsInDb,
} from '../lib/supabase';

const StoreDataContext = createContext();

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState(() => {
    let localSaved = null;
    try {
      const raw = localStorage.getItem('aalaya_store_settings');
      if (raw) localSaved = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    let defaultLines = ['Special Festive Offer: Flat 20% Off on Pure Silk Sarees | Use Code: AV20', '', '', ''];
    if (Array.isArray(localSaved?.announcementLines)) {
      defaultLines = [
        localSaved.announcementLines[0] || '',
        localSaved.announcementLines[1] || '',
        localSaved.announcementLines[2] || '',
        localSaved.announcementLines[3] || '',
      ];
    } else if (localSaved?.announcementText) {
      try {
        const parsed = JSON.parse(localSaved.announcementText);
        if (Array.isArray(parsed)) {
          defaultLines = [parsed[0] || '', parsed[1] || '', parsed[2] || '', parsed[3] || ''];
        } else {
          defaultLines = [localSaved.announcementText, '', '', ''];
        }
      } catch {
        defaultLines = [localSaved.announcementText, '', '', ''];
      }
    }

    return {
      storeName: 'Aalaya Vastra',
      phone: '6301646462',
      email: 'contact@aalayavastra.com',
      whatsapp: '9999999999',
      ownerName: 'Jupudi Harini',
      address: 'Rajahmundry, Andhra Pradesh',
      freeShippingThreshold: 2000,
      currency: '₹',
      announcementLines: defaultLines,
      announcementText: defaultLines.filter(Boolean).join(' • '),
      announcementEnabled: true,
      announcementLink: '/shop',
      ...(localSaved || {}),
      announcementLines: defaultLines,
    };
  });
  const [loading, setLoading] = useState(true);

  // Initial load — public-readable data (products/categories/banners/coupons/settings).
  useEffect(() => {
    let active = true;
    (async () => {
      const [p, c, b, cp, s] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchBanners(), fetchCoupons(), fetchSettings(),
      ]);
      if (!active) return;
      if (p.success) setProducts(p.data);
      if (c.success) setCategories(c.data);
      if (b.success) setBanners(b.data);
      if (cp.success) setCoupons(cp.data);
      if (s.success && s.data) setSettings(s.data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  // Orders & contact messages are admin-only (blocked by RLS for anon visitors),
  // so the admin pages call these explicitly once the admin session is ready.
  const refreshOrders = useCallback(async () => {
    const res = await fetchOrders();
    if (res.success) setOrders(res.data);
    return res;
  }, []);

  const refreshMessages = useCallback(async () => {
    const res = await fetchContactMessages();
    if (res.success) setMessages(res.data);
    return res;
  }, []);

  // ---------------- Products ----------------
  const addProduct = async (newProduct) => {
    const res = await insertProduct(newProduct);
    if (res.success) setProducts((prev) => [res.data, ...prev]);
    return res;
  };

  const updateProduct = async (id, updatedData) => {
    const res = await updateProductInDb(id, updatedData);
    if (res.success) setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await deleteProductFromDb(id);
    if (res.success) setProducts((prev) => prev.filter((p) => p.id !== id));
    return res;
  };

  const batchUpdateStock = async (updatesMap) => {
    const entries = Object.entries(updatesMap);
    if (entries.length === 0) return { success: true, count: 0 };

    try {
      const promises = entries.map(([id, stock]) =>
        updateProductInDb(id, { stock: Math.max(0, Number(stock) || 0) })
      );
      await Promise.all(promises);

      // Immediately sync state locally across all components
      setProducts((prev) =>
        prev.map((p) => {
          if (updatesMap[p.id] !== undefined) {
            const newStock = Math.max(0, Number(updatesMap[p.id]) || 0);
            return { ...p, stock: newStock, inStock: newStock > 0 };
          }
          return p;
        })
      );
      return { success: true, count: entries.length };
    } catch (err) {
      console.error('Batch stock update error:', err);
      return { success: false, message: err?.message || 'Error updating stock' };
    }
  };

  // ---------------- Categories ----------------
  const addCategory = async (newCat) => {
    const res = await insertCategory(newCat);
    if (res.success) setCategories((prev) => [...prev, res.data]);
    return res;
  };

  const updateCategory = async (id, updatedData) => {
    const res = await updateCategoryInDb(id, updatedData);
    if (res.success) setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res;
  };

  const deleteCategory = async (id) => {
    const res = await deleteCategoryFromDb(id);
    if (res.success) setCategories((prev) => prev.filter((c) => c.id !== id));
    return res;
  };

  // ---------------- Orders ----------------
  const addOrder = async (orderData) => {
    const res = await saveOrderToSupabase(orderData);
    if (res.success) {
      setOrders((prev) => [res.data, ...prev]);

      // Best-effort stock decrement per ordered item. Not transactional —
      // fine at this store's scale, but two simultaneous orders for the last
      // unit of an item could both succeed. A Postgres function with row
      // locking would be needed to close that race completely.
      for (const item of orderData.items || []) {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - (item.quantity || 1));
          updateProduct(item.id, { stock: newStock });
        }
      }
    }
    return res;
  };

  const updateOrderStatus = async (id, status) => {
    const res = await updateOrderStatusInDb(id, status);
    if (res.success) setOrders((prev) => prev.map((o) => (o.id === id ? res.data : o)));
    return res;
  };

  // ---------------- Contact messages ----------------
  const updateMessageStatus = async (id, status) => {
    const res = await updateMessageStatusInDb(id, status);
    if (res.success) setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    return res;
  };

  // ---------------- Banners ----------------
  const addBanner = async (banner) => {
    const res = await insertBanner(banner);
    if (res.success) setBanners((prev) => [...prev, res.data]);
    return res;
  };

  const updateBanner = async (id, updated) => {
    const res = await updateBannerInDb(id, updated);
    if (res.success) setBanners((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    return res;
  };

  const deleteBanner = async (id) => {
    const res = await deleteBannerFromDb(id);
    if (res.success) setBanners((prev) => prev.filter((b) => b.id !== id));
    return res;
  };

  // ---------------- Coupons ----------------
  const addCoupon = async (coupon) => {
    const res = await insertCoupon(coupon);
    if (res.success) setCoupons((prev) => [res.data, ...prev]);
    return res;
  };

  const updateCoupon = async (id, updated) => {
    const res = await updateCouponInDb(id, updated);
    if (res.success) setCoupons((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res;
  };

  const deleteCoupon = async (id) => {
    const res = await deleteCouponFromDb(id);
    if (res.success) setCoupons((prev) => prev.filter((c) => c.id !== id));
    return res;
  };

  // ---------------- Settings ----------------
  const updateSettings = async (newSettings) => {
    const res = await updateSettingsInDb(newSettings);
    if (res.success) setSettings((prev) => ({ ...prev, ...res.data }));
    return res;
  };

  return (
    <StoreDataContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        orders,
        messages,
        settings,
        loading,
        refreshOrders,
        refreshMessages,
        addProduct,
        updateProduct,
        batchUpdateStock,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addOrder,
        updateOrderStatus,
        updateMessageStatus,
        addBanner,
        updateBanner,
        deleteBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSettings,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
}
