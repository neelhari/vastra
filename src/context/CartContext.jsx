import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStoreData } from './StoreDataContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { settings, coupons } = useStoreData();

  const DEFAULT_COUPONS = [
    {
      id: 'cpn_av20',
      code: 'AV20',
      type: 'percentage',
      discountValue: 20,
      minOrder: 1000,
      maxDiscount: 2000,
      active: true,
      description: 'Special Festive Offer: Flat 20% Off',
    },
    {
      id: 'cpn_vastra10',
      code: 'VASTRA10',
      type: 'percentage',
      discountValue: 10,
      minOrder: 500,
      maxDiscount: 1000,
      active: true,
      description: '10% Off on your order',
    },
    {
      id: 'cpn_first100',
      code: 'FIRST100',
      type: 'flat',
      discountValue: 100,
      minOrder: 999,
      maxDiscount: 100,
      active: true,
      description: 'Flat ₹100 Off on your first purchase',
    },
  ];

  // Merge store coupons with default known coupons (giving precedence to admin coupons)
  const allCoupons = (() => {
    const map = new Map();
    DEFAULT_COUPONS.forEach((c) => map.set(c.code.toUpperCase(), c));
    (coupons || []).forEach((c) => {
      if (c && c.code) map.set(c.code.toUpperCase(), c);
    });
    return Array.from(map.values());
  })();

  const activeCoupons = allCoupons.filter((c) => c.active);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [couponCode, setCouponCode] = useState(() => {
    try {
      return localStorage.getItem('sv_applied_coupon') || '';
    } catch (e) {
      return '';
    }
  });

  useEffect(() => {
    try {
      if (couponCode) localStorage.setItem('sv_applied_coupon', couponCode);
      else localStorage.removeItem('sv_applied_coupon');
    } catch (e) {
      // ignore
    }
  }, [couponCode]);

  useEffect(() => {
    try {
      localStorage.setItem('sv_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    let color = selectedColor;
    let size = selectedSize;
    if (color && !size && ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', 'Standard', '40', '42', '44'].includes(color)) {
      size = color;
      color = null;
    }
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));

    setCartItems(prev => {
      const itemKey = `${product.id}-${color || 'default'}-${size || 'default'}`;
      const existingIndex = prev.findIndex(item => item.itemKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = (Number(updated[existingIndex].quantity) || 1) + safeQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            price: Math.max(0, Number(product.price) || 0),
            itemKey,
            quantity: safeQty,
            selectedColor: color,
            selectedSize: size
          }
        ];
      }
    });

    showToast(`Added "${product.name}" to your cart!`);
  };

  // Buy Now: Sets exact quantity for this item in the cart instead of incrementing,
  // preventing any quantity jumping or doubling bug.
  const buyNow = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    let color = selectedColor;
    let size = selectedSize;
    if (color && !size && ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', 'Standard', '40', '42', '44'].includes(color)) {
      size = color;
      color = null;
    }
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));

    setCartItems(prev => {
      const itemKey = `${product.id}-${color || 'default'}-${size || 'default'}`;
      const existingIndex = prev.findIndex(item => item.itemKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = safeQty; // Exact set, not +=
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            price: Math.max(0, Number(product.price) || 0),
            itemKey,
            quantity: safeQty,
            selectedColor: color,
            selectedSize: size
          }
        ];
      }
    });
  };

  const removeFromCart = (itemKey) => {
    setCartItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, newQuantity) => {
    const safeQty = Math.max(0, Math.floor(Number(newQuantity) || 0));
    if (safeQty <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCartItems(prev => prev.map(item => item.itemKey === itemKey ? { ...item, quantity: safeQty } : item));
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + Math.max(1, Math.floor(Number(item.quantity) || 1)), 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const p = Math.max(0, Number(item.price) || 0);
    const q = Math.max(1, Math.floor(Number(item.quantity) || 1));
    return acc + (p * q);
  }, 0);
  
  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 2000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const appliedCoupon = couponCode
    ? activeCoupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
    : null;
  const couponMinOrderMet = appliedCoupon ? subtotal >= (appliedCoupon.minOrder || 0) : false;

  const discountAmount = (() => {
    if (!appliedCoupon || !couponMinOrderMet) return 0;
    const val = Math.max(0, Number(appliedCoupon.discountValue) || 0);
    let amount = appliedCoupon.type === 'percentage'
      ? Math.round((subtotal * val) / 100)
      : val;
    if (appliedCoupon.maxDiscount) {
      amount = Math.min(amount, Math.max(0, Number(appliedCoupon.maxDiscount) || 0));
    }
    return Math.max(0, Math.min(amount, subtotal));
  })();

  const applyCoupon = (code) => {
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    const match = activeCoupons.find((c) => c.code.toUpperCase() === normalized);
    if (!match) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }
    if (subtotal < (match.minOrder || 0)) {
      return { success: false, message: `This code requires a minimum order of ₹${(match.minOrder || 0).toLocaleString('en-IN')}.` };
    }
    setCouponCode(normalized);
    return { success: true, coupon: match };
  };

  const removeCoupon = () => setCouponCode('');

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      buyNow,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItemsCount,
      subtotal,
      freeShippingThreshold,
      isFreeShipping,
      amountNeededForFreeShipping,
      toastMessage,
      showToast,
      appliedCoupon: appliedCoupon && couponMinOrderMet ? appliedCoupon : null,
      availableCoupons: activeCoupons,
      discountAmount,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
