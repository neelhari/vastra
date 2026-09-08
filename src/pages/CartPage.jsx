import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Truck, Check, ShieldCheck, ArrowLeft, MessageCircle, Sparkles, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRAND, waLink } from '../config/brand';

export default function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const {
    cartItems,
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

  const deliveryCharge = isFreeShipping ? 0 : 99;
  const finalTotal = subtotal - discountAmount + deliveryCharge;

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    let text = `*New Order Request - ${BRAND.name}*\n`;
    text += `-----------------------------------\n`;
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}*\n   Qty: ${item.quantity} x ₹${item.price.toLocaleString('en-IN')} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    });
    text += `-----------------------------------\n`;
    text += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (appliedCoupon) {
      text += `*Discount (${appliedCoupon.code}):* -₹${discountAmount.toLocaleString('en-IN')}\n`;
    }
    text += `*Delivery:* ${isFreeShipping ? 'FREE' : '₹99'}\n`;
    text += `*Total Amount:* ₹${finalTotal.toLocaleString('en-IN')}\n\n`;
    text += `Please confirm item availability and shipping details. Thank you!`;

    window.open(waLink(text), '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Clean Top Navigation Bar with Back Button (Replacing clunky breadcrumb & duplicate continue shopping) */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#6B1518] py-1.5 px-3 rounded-xl hover:bg-gray-100 transition-colors -ml-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Continue Shopping</span>
        </button>

        <div className="text-xs font-bold text-gray-900">
          Shopping Bag ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto text-center py-16 px-4 bg-[#FAF8F5] rounded-3xl border border-gray-100 space-y-5">
          <div className="w-20 h-20 bg-[#F8F0F0] rounded-full flex items-center justify-center mx-auto text-[#6B1518]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore our handloom sarees, designer dresses, and fine fabrics to find something special!
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-8 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-colors"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Main Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Indicator */}
            <div className="bg-[#F8F0F0] p-4 rounded-2xl border border-[#EADEDF] text-xs text-[#6B1518] space-y-2">
              {isFreeShipping ? (
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Truck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>🎉 Congratulations! You unlocked 100% FREE Express Shipping across India!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Add <strong className="font-bold">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE Shipping</span>
                    <span>₹{subtotal.toLocaleString('en-IN')} / ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6B1518] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / BRAND.freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-xs">
              {cartItems.map((item) => (
                <div key={item.itemKey} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 sm:w-28 sm:h-32 object-cover rounded-xl shrink-0 cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#D3923A] uppercase tracking-wider block">
                          {item.subcategory || item.category}
                        </span>
                        <h3
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="font-serif font-bold text-sm sm:text-base text-gray-900 hover:text-[#6B1518] cursor-pointer line-clamp-2"
                        >
                          {item.name}
                        </h3>
                        {item.selectedSize && (
                          <span className="inline-block text-[11px] text-gray-500 font-medium mt-0.5">
                            Size: <strong>{item.selectedSize}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.itemKey)}
                        className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block sm:hidden">Total:</span>
                        <span className="font-extrabold text-sm sm:text-base text-[#6B1518]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs text-gray-500 hover:text-red-600 font-semibold underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="text-xs font-bold text-[#6B1518] hover:underline"
              >
                + Add More Items
              </button>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#D3923A]" /> Promo Code
                </label>
                {appliedCoupon ? (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      Promo code <strong>{appliedCoupon.code}</strong> applied!
                    </span>
                    <button type="button" onClick={removeCoupon} className="font-bold underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518] uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && (
                  <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl">
                    {couponError}
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Promo Discount ({appliedCoupon.code}):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping & Delivery:</span>
                  <span className="font-semibold text-gray-900">
                    {isFreeShipping ? <strong className="text-emerald-600 font-bold">FREE</strong> : '₹99'}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total Payable:</span>
                  <span className="text-[#6B1518] text-xl font-extrabold">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login?redirect=/checkout');
                    } else {
                      navigate('/checkout');
                    }
                  }}
                  className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-[1.01]"
                >
                  <span>Proceed to Online Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#6B1518]" />
                  <span>100% Authentic Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#6B1518]" />
                  <span>3-5 Days Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
