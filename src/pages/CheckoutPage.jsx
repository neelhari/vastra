import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, CreditCard, MessageCircle, MapPin, User, Phone, Mail, ShoppingBag, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addOrder } = useStoreData();
  const { cartItems, subtotal, isFreeShipping, clearCart, appliedCoupon, discountAmount } = useCart();

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: defaultAddr?.addressLine || '',
    city: defaultAddr?.city || 'Rajahmundry',
    pincode: defaultAddr?.pincode || '',
    state: defaultAddr?.state || 'Andhra Pradesh',
    paymentMethod: 'razorpay', // 'razorpay' | 'cod' | 'whatsapp'
  });

  const [errors, setErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F8F0F0] text-[#6B1518] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] text-white px-6 py-2.5 rounded-xl text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const deliveryCharge = isFreeShipping ? 0 : 99;
  const totalAmount = subtotal - discountAmount + deliveryCharge;

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.pincode.trim()) errs.pincode = 'Pincode is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const sendWhatsAppCopy = (orderId, paymentId = null) => {
    let text = `*New Order ${orderId} - ${BRAND.name}*\n`;
    text += `Customer: ${formData.fullName} (${formData.phone})\n`;
    text += `Address: ${formData.address}, ${formData.city} - ${formData.pincode}, ${formData.state}\n`;
    text += `-----------------------------------\n`;
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (x${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    });
    text += `-----------------------------------\n`;
    text += `*Total Amount:* ₹${totalAmount.toLocaleString('en-IN')} (${formData.paymentMethod.toUpperCase()})\n`;
    if (paymentId) {
      text += `*Payment Reference ID:* ${paymentId} (PAID)\n`;
    }
    window.open(waLink(text), '_blank');
  };

  const finalizeOrder = async ({ orderId, paymentId, paymentStatus = 'Pending', status = 'Pending', paymentMethodName = null }) => {
    const methodToSave = paymentMethodName || (formData.paymentMethod === 'razorpay' ? 'Razorpay' : formData.paymentMethod.toUpperCase());

    const orderData = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customer: { ...formData },
      items: [...cartItems],
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: methodToSave,
      paymentStatus,
      paymentId: paymentId || null,
      status,
    };

    const result = await addOrder({
      id: orderId,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedSize: item.selectedSize || null,
      })),
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: methodToSave,
      paymentStatus,
      paymentId: paymentId || null,
      status,
      couponCode: appliedCoupon?.code || null,
    });

    setPlacingOrder(false);

    if (!result.success) {
      setOrderError(
        `We couldn't record your order automatically (${result.message || 'connection issue'}). ` +
        `Please send it via WhatsApp instead so we don't lose your order.`
      );
      return;
    }

    if (formData.paymentMethod === 'whatsapp') {
      sendWhatsAppCopy(orderId);
    }

    clearCart();
    navigate('/order-success', { state: { orderData } });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate() || placingOrder) return;

    setOrderError('');
    const orderId = `AV-${Math.floor(100000 + Math.random() * 900000)}`;

    if (formData.paymentMethod === 'razorpay') {
      setPlacingOrder(true);

      openRazorpayCheckout({
        orderId,
        amount: totalAmount,
        customer: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        description: `Order ${orderId} - ${BRAND.name}`,
        onSuccess: async (response) => {
          setPaymentSuccessInfo(response.razorpay_payment_id);
          await finalizeOrder({
            orderId,
            paymentId: response.razorpay_payment_id,
            paymentStatus: 'Paid',
            status: 'Confirmed',
            paymentMethodName: 'Razorpay',
          });
        },
        onFailure: (error) => {
          setPlacingOrder(false);
          const errorMsg = error?.description || error?.message || 'Payment could not be completed. Please try again.';
          setOrderError(`Payment Failed: ${errorMsg}`);
        },
        onDismiss: () => {
          setPlacingOrder(false);
          setOrderError('Payment checkout was closed. You can retry anytime or select another payment option.');
        },
      });
      return;
    }

    // COD or WhatsApp
    setPlacingOrder(true);
    await finalizeOrder({
      orderId,
      paymentStatus: 'Pending',
      status: 'Pending',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#6B1518] transition-colors">Home</Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-[#6B1518] transition-colors">Cart</Link>
        <span>/</span>
        <span className="text-[#6B1518] font-semibold">Checkout</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D3923A]">Secure Payment & Delivery</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Complete Your Order</h1>
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#6B1518]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer & Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-5 h-5 text-[#6B1518]" />
              <h2 className="font-serif text-xl font-bold text-gray-900">Shipping & Delivery Details</h2>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full text-xs pl-9 pr-4 py-3 rounded-xl border focus:outline-none ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full text-xs pl-9 pr-4 py-3 rounded-xl border focus:outline-none ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                    />
                  </div>
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Delivery Address *</label>
                <textarea
                  rows={3}
                  placeholder="House No., Building Name, Street / Colony Area..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none resize-none ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* City, State, Pincode Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">City / Town *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Pincode *</label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                    }`}
                  />
                  {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#6B1518]" />
                <h2 className="font-serif text-xl font-bold text-gray-900">Select Payment Method</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#6B1518]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Razorpay Secured</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Razorpay Online Payment Option */}
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'razorpay'
                    ? 'border-[#6B1518] bg-[#F8F0F0]/60 ring-2 ring-[#6B1518]/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={formData.paymentMethod === 'razorpay'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                  className="mt-1 text-[#6B1518] focus:ring-[#6B1518]"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">Online Payment via Razorpay</span>
                      <span className="bg-[#6B1518] text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      0% Payment Fees
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Pay instantly using <strong>UPI (Google Pay, PhonePe, Paytm, BHIM)</strong>, <strong>Credit/Debit Cards</strong> (Visa, Mastercard, RuPay), <strong>NetBanking (50+ banks)</strong>, or <strong>Wallets</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md shadow-2xs">
                      UPI / QR
                    </span>
                    <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md shadow-2xs">
                      Google Pay
                    </span>
                    <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md shadow-2xs">
                      PhonePe
                    </span>
                    <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md shadow-2xs">
                      Credit / Debit Cards
                    </span>
                    <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md shadow-2xs">
                      NetBanking
                    </span>
                  </div>
                </div>
              </label>

              {/* COD Option */}
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'cod'
                    ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className="mt-1 text-[#6B1518] focus:ring-[#6B1518]"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs sm:text-sm text-gray-900">Cash on Delivery (COD)</span>
                  <p className="text-xs text-gray-500 mt-0.5">Pay in cash or UPI when your parcel is delivered at your doorstep.</p>
                </div>
              </label>

              {/* WhatsApp Option */}
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'whatsapp'
                    ? 'border-[#25D366] bg-emerald-50/50 ring-1 ring-[#25D366]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={formData.paymentMethod === 'whatsapp'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })}
                  className="mt-1 text-[#25D366] focus:ring-[#25D366]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span className="font-bold text-xs sm:text-sm text-gray-900">Direct WhatsApp Instant Order</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Send order copy to WhatsApp for direct chat verification & payment assistance.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Items ({cartItems.length})
            </h3>

            {/* Product items mini list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.itemKey} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charge:</span>
                <span>{isFreeShipping ? <strong className="text-emerald-600">FREE</strong> : '₹99'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-[#6B1518] text-xl font-extrabold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {orderError && (
              <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl space-y-2">
                <p className="font-semibold">{orderError}</p>
                <button
                  type="button"
                  onClick={() => {
                    const orderId = `AV-${Math.floor(100000 + Math.random() * 900000)}`;
                    sendWhatsAppCopy(orderId);
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Send Order via WhatsApp
                </button>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              {formData.paymentMethod === 'razorpay' ? (
                <>
                  <Zap className="w-4 h-4 text-[#D3923A] fill-[#D3923A]" />
                  <span>
                    {placingOrder
                      ? 'Connecting to Razorpay...'
                      : `Pay with Razorpay (₹${totalAmount.toLocaleString('en-IN')})`}
                  </span>
                </>
              ) : formData.paymentMethod === 'whatsapp' ? (
                <>
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>
                    {placingOrder
                      ? 'Placing WhatsApp Order...'
                      : `Place Order via WhatsApp (₹${totalAmount.toLocaleString('en-IN')})`}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#D3923A]" />
                  <span>
                    {placingOrder
                      ? 'Placing Order...'
                      : `Confirm COD Order (₹${totalAmount.toLocaleString('en-IN')})`}
                  </span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Encrypted & Bank-Grade Security via Razorpay</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
