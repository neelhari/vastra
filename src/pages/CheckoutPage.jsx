import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, MessageCircle, ShieldCheck, Plus, Check, X, ShoppingBag, Zap, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, addAddress } = useAuth();
  const { addOrder } = useStoreData();
  const { cartItems, subtotal, isFreeShipping, clearCart } = useCart();

  const savedAddresses = user?.addresses || [];
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;

  // Selected delivery address
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr?.id || null);
  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || defaultAddr;

  // Payment Method: 'razorpay' | 'cod' | 'whatsapp'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Address Modals
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isChangeAddressModalOpen, setIsChangeAddressModalOpen] = useState(false);

  // New Address Form State
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    pincode: '',
    type: 'Home',
  });
  const [addrError, setAddrError] = useState('');

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F8F0F0] text-[#6B1518] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Your bag is empty</h1>
        <p className="text-xs text-gray-500">Explore our sarees and dresses to proceed with your order.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  // Calculate pricing (Myntra style)
  const totalMrp = cartItems.reduce((sum, item) => {
    const originalPrice = item.oldPrice || item.originalPrice || Math.round(item.price * 1.35);
    return sum + (originalPrice * item.quantity);
  }, 0);

  const deliveryCharge = isFreeShipping ? 0 : 99;
  const discountOnMrp = Math.max(0, totalMrp - subtotal);
  const totalAmount = subtotal + deliveryCharge;

  // Save new address handler
  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddr.name.trim() || !newAddr.phone.trim() || !newAddr.addressLine.trim() || !newAddr.pincode.trim()) {
      setAddrError('Please fill all required fields (Name, Phone, Address, Pincode).');
      return;
    }

    setAddrError('');
    const created = addAddress(newAddr);
    if (created?.id) {
      setSelectedAddressId(created.id);
    }
    setIsAddressModalOpen(false);
    setIsChangeAddressModalOpen(false);
  };

  const sendWhatsAppCopy = (orderId, paymentId = null) => {
    const currentAddr = selectedAddress || newAddr;
    let text = `*New Order ${orderId} - ${BRAND.name}*\n`;
    text += `Customer: ${currentAddr.name} (${currentAddr.phone})\n`;
    text += `Address: ${currentAddr.addressLine}, ${currentAddr.city} - ${currentAddr.pincode}, ${currentAddr.state}\n`;
    text += `-----------------------------------\n`;
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (x${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    });
    text += `-----------------------------------\n`;
    text += `*Total Amount:* ₹${totalAmount.toLocaleString('en-IN')} (${paymentMethod.toUpperCase()})\n`;
    if (paymentId) {
      text += `*Payment Reference ID:* ${paymentId} (PAID)\n`;
    }
    window.open(waLink(text), '_blank');
  };

  const finalizeOrder = async ({ orderId, paymentId, paymentStatus = 'Pending', status = 'Pending', paymentMethodName = null }) => {
    const currentAddr = selectedAddress || newAddr;
    const methodToSave = paymentMethodName || (paymentMethod === 'razorpay' ? 'Razorpay' : paymentMethod.toUpperCase());

    const orderData = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customer: {
        fullName: currentAddr.name,
        phone: currentAddr.phone,
        email: user?.email || '',
        address: currentAddr.addressLine,
        city: currentAddr.city,
        state: currentAddr.state,
        pincode: currentAddr.pincode,
      },
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
      customerName: currentAddr.name,
      customerPhone: currentAddr.phone,
      customerEmail: user?.email || null,
      address: currentAddr.addressLine,
      city: currentAddr.city,
      state: currentAddr.state,
      pincode: currentAddr.pincode,
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
      couponCode: null,
    });

    setPlacingOrder(false);

    if (!result.success) {
      setOrderError(
        `We couldn't record your order automatically (${result.message || 'connection issue'}). ` +
        `Please send it via WhatsApp so your order is processed immediately.`
      );
      return;
    }

    if (paymentMethod === 'whatsapp') {
      sendWhatsAppCopy(orderId);
    }

    clearCart();
    navigate('/order-success', { state: { orderData } });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    if (placingOrder) return;
    setOrderError('');

    const orderId = `AV-${Math.floor(100000 + Math.random() * 900000)}`;

    if (paymentMethod === 'razorpay') {
      setPlacingOrder(true);

      openRazorpayCheckout({
        orderId,
        amount: totalAmount,
        customer: {
          fullName: selectedAddress.name,
          phone: selectedAddress.phone,
          email: user?.email || '',
          address: selectedAddress.addressLine,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        description: `Order ${orderId} - ${BRAND.name}`,
        onSuccess: async (response) => {
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
          setOrderError('Checkout was closed. You can retry anytime or select another payment option.');
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
    <div className="bg-[#FAF8F5]/60 min-h-screen pb-28 sm:pb-32">
      {/* 1. Header (Myntra Style: Back arrow + Review Order) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="p-1.5 -ml-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              title="Back to Cart"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">Review Order</h1>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-3.5">
        {/* 2. Delivery Details (Myntra Card) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[#6B1518]" />
            <span>Delivery Details</span>
          </div>

          {selectedAddress ? (
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm text-gray-900">{selectedAddress.name}</div>
                  <div className="text-gray-600 leading-relaxed">
                    {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.state} - <span className="font-semibold text-gray-900">{selectedAddress.pincode}</span>
                  </div>
                  <div className="text-gray-500 text-[11px] pt-0.5">
                    Mobile: <span className="text-gray-800 font-semibold">{selectedAddress.phone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChangeAddressModalOpen(true)}
                  className="text-[#6B1518] hover:text-[#4B0F11] font-bold text-xs shrink-0 pt-0.5 hover:underline"
                >
                  Change Address &gt;
                </button>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center space-y-2 border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-700">No delivery address selected</p>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Delivery Address
              </button>
            </div>
          )}

          {/* Product Preview Items inside the Delivery Card (Myntra Pattern) */}
          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            {cartItems.map((item) => (
              <div key={item.itemKey} className="flex items-center gap-3 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                <img
                  src={item.image || '/products/saree-placeholder.png'}
                  alt={item.name}
                  className="w-12 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span className="text-emerald-700 font-medium">Delivery in 3-5 Days</span>
                    <span>•</span>
                    <span>Qty: {item.quantity}</span>
                    {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            {/* Add More Products Link */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="text-[#6B1518] hover:text-[#4B0F11] text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Items</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Payment Method (Clean, compact selection) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-[#6B1518]" />
              <span>Payment Method</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Encrypted</span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Razorpay Online */}
            <label
              onClick={() => setPaymentMethod('razorpay')}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-[#6B1518] bg-[#FAF5EE]/70 ring-1 ring-[#6B1518]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                className="text-[#6B1518] focus:ring-[#6B1518]"
              />
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-900">Online Payment (UPI, Cards, NetBanking)</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                  Recommended
                </span>
              </div>
            </label>

            {/* COD */}
            <label
              onClick={() => setPaymentMethod('cod')}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-[#6B1518] bg-[#FAF5EE]/70 ring-1 ring-[#6B1518]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="text-[#6B1518] focus:ring-[#6B1518]"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-gray-900">Cash on Delivery (Cash / UPI at Doorstep)</span>
              </div>
            </label>

            {/* WhatsApp */}
            <label
              onClick={() => setPaymentMethod('whatsapp')}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'whatsapp'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'whatsapp'}
                onChange={() => setPaymentMethod('whatsapp')}
                className="text-emerald-600 focus:ring-emerald-600"
              />
              <div className="flex-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="text-xs font-bold text-gray-900">Direct WhatsApp Instant Order</span>
              </div>
            </label>
          </div>
        </div>

        {/* 4. Price Details (Myntra Layout) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-2.5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pb-1">Price Details</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total MRP</span>
              <span className="font-medium text-gray-900">₹{totalMrp.toLocaleString('en-IN')}</span>
            </div>
            {discountOnMrp > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount on MRP</span>
                <span>- ₹{discountOnMrp.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{isFreeShipping ? <strong className="text-emerald-700 font-semibold">FREE</strong> : '₹99'}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Amount</span>
              <span className="text-base font-extrabold text-[#6B1518]">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {discountOnMrp > 0 && (
            <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold p-2.5 rounded-xl text-center">
              🎉 You're saving ₹{discountOnMrp.toLocaleString('en-IN')} on this order!
            </div>
          )}
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
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Send Order via WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* 5. Sticky Bottom Action Bar (Exact Myntra Pattern) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Payable</div>
            <div className="text-base sm:text-lg font-extrabold text-[#6B1518] leading-tight">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="flex-1 max-w-xs bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white font-bold text-xs sm:text-sm py-3.5 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {paymentMethod === 'razorpay' ? (
              <>
                <Zap className="w-4 h-4 text-[#D3923A] fill-[#D3923A]" />
                <span>{placingOrder ? 'Connecting...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} with Razorpay`}</span>
              </>
            ) : paymentMethod === 'whatsapp' ? (
              <>
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{placingOrder ? 'Opening WhatsApp...' : `Place WhatsApp Order`}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#D3923A]" />
                <span>{placingOrder ? 'Confirming...' : `Confirm & Place Order`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal 1: Add New Address */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-[#6B1518]">Add Delivery Address</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addrError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] p-2.5 rounded-xl font-semibold">
                {addrError}
              </div>
            )}

            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dachepally Nikhil"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Street Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="House No, Building, Colony / Area name"
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="6 digits"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-5 py-2 rounded-xl font-bold shadow-sm"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Change Address / Select Saved Address */}
      {isChangeAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-[#6B1518]">Select Delivery Address</h3>
              <button onClick={() => setIsChangeAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {savedAddresses.map((addr) => {
                const isSelected = (selectedAddress?.id === addr.id);
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setIsChangeAddressModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#6B1518] bg-[#FAF5EE]/70 ring-1 ring-[#6B1518]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <span>{addr.name}</span>
                        {addr.type && (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {addr.type}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">
                        {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-gray-500 text-[11px]">Mobile: {addr.phone}</p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#6B1518] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsChangeAddressModalOpen(false);
                  setIsAddressModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-[#6B1518]/40 hover:border-[#6B1518] text-[#6B1518] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FAF5EE]/50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Delivery Address</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
