import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, Truck, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRAND, waLink } from '../config/brand';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    isFreeShipping,
    amountNeededForFreeShipping,
    clearCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const finalTotal = subtotal - discountAmount;

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    let text = `*New Order Request - ${BRAND.name}*\n`;
    text += `-----------------------------------\n`;
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}*\n   Qty: ${item.quantity} x ₹${item.price} = ₹${item.price * item.quantity}\n`;
    });
    text += `-----------------------------------\n`;
    text += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (appliedCoupon) {
      text += `*Discount (${appliedCoupon.code}):* -₹${discountAmount.toLocaleString('en-IN')}\n`;
    }
    text += `*Estimated Shipping:* ${isFreeShipping ? 'FREE' : '₹99'}\n`;
    text += `*Total Amount:* ₹${(finalTotal + (isFreeShipping ? 0 : 99)).toLocaleString('en-IN')}\n\n`;
    text += `Please confirm availability and payment instructions. Thank you!`;

    window.open(waLink(text), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#6B1518] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D3923A]" />
              <h3 className="font-serif font-bold text-lg text-white">Your Shopping Cart</h3>
              <span className="bg-[#4B0F11] text-[#D3923A] text-xs font-bold px-2 py-0.5 rounded-full border border-[#831A1D]">
                {cartItems.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-gray-200 hover:text-white rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F8F0F0] p-3 px-5 border-b border-[#EADEDF] text-xs text-[#6B1518]">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>🎉 You qualify for FREE Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE shipping</span>
                  <span>₹{subtotal}/₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6B1518] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / BRAND.freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="font-serif text-xl font-bold text-gray-800">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our sarees, womenswear & fabric collections to discover beautiful products.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.itemKey}
                    className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 relative group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-lg shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start pr-6">
                          <h4 className="font-serif text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-[#D3923A] font-bold uppercase tracking-wider block">
                          {item.subcategory || item.category}
                        </span>
                        <div className="text-xs font-bold text-[#6B1518] mt-1">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-xs text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.itemKey)}
                      className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Clear Cart link */}
                <div className="text-right pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-gray-500 hover:text-red-600 underline"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer / Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 space-y-3">
              {/* Promo Code Form */}
              {appliedCoupon ? (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Promo code <strong>{appliedCoupon.code}</strong> applied!
                  </span>
                  <button type="button" onClick={removeCoupon} className="font-bold underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#6B1518] uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded">
                  {couponError}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold">{isFreeShipping ? <strong className="text-emerald-600">FREE</strong> : '₹99'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-[#6B1518] text-lg font-extrabold">
                    ₹{(finalTotal + (isFreeShipping ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    const origin = location.pathname.startsWith('/product/') ? location.pathname : (cartItems[0]?.id ? `/product/${cartItems[0].id}` : '/shop');
                    navigate('/checkout', { state: { from: origin } });
                  }}
                  className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Proceed to Online Checkout</span>
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/cart');
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-[#6B1518] underline"
                  >
                    View Full Cart Page →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
