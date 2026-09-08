import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Truck, Calendar, MessageCircle, Phone, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  const defaultOrderId = `AV-${Math.floor(100000 + Math.random() * 900000)}`;

  const orderId = orderData?.orderId || defaultOrderId;
  const items = orderData?.items || [];
  const customer = orderData?.customer || {};
  const totalAmount = orderData?.totalAmount || 0;
  const paymentId = orderData?.paymentId || null;
  const paymentStatus = orderData?.paymentStatus || 'Pending';
  const paymentMethod = orderData?.paymentMethod || 'Online';

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Celebration Header Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-xl text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D3923A]">Order Confirmed</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Thank You For Your Order!
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto">
            Your order has been received by <strong className="text-gray-900">{BRAND.name}</strong>. We are preparing your products for fast delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 bg-[#FAF8F5] border border-gray-200 px-5 py-2.5 rounded-2xl text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Order Reference ID:</span>
            <span className="font-mono font-extrabold text-[#6B1518] text-base sm:text-lg">{orderId}</span>
          </div>

          {paymentId ? (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Paid via Razorpay:</span>
              <span className="font-mono font-bold text-emerald-950">{paymentId}</span>
            </div>
          ) : paymentStatus === 'Paid' ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment Confirmed</span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left pt-2">
          <div className="bg-[#F8F0F0] p-4 rounded-2xl border border-[#EADEDF] flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#6B1518] shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Estimated Delivery</span>
              <span className="text-xs font-bold text-gray-900">{formattedDeliveryDate}</span>
            </div>
          </div>

          <div className="bg-[#F8F0F0] p-4 rounded-2xl border border-[#EADEDF] flex items-center gap-3">
            <Truck className="w-6 h-6 text-[#6B1518] shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Shipping Partner</span>
              <span className="text-xs font-bold text-gray-900">Express Courier (3-5 Days)</span>
            </div>
          </div>
        </div>

        {/* Visual Order Progress Bar */}
        <div className="max-w-xl mx-auto pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 text-center relative">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#6B1518] text-white flex items-center justify-center text-xs font-bold z-10 shadow-xs">
                ✓
              </div>
              <span className="text-[10px] font-bold text-gray-900 mt-1.5">Placed</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#6B1518] text-[#D3923A] flex items-center justify-center text-xs font-bold z-10 shadow-xs">
                2
              </div>
              <span className="text-[10px] font-bold text-[#6B1518] mt-1.5">Confirmed</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold z-10">
                3
              </div>
              <span className="text-[10px] font-medium text-gray-400 mt-1.5">Shipped</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold z-10">
                4
              </div>
              <span className="text-[10px] font-medium text-gray-400 mt-1.5">Delivered</span>
            </div>
            {/* Connecting line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0">
              <div className="h-full bg-[#6B1518] w-1/3" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href={waLink(`Hello ${BRAND.name}, I want to track my Order ID: ${orderId}${paymentId ? ` (Payment ID: ${paymentId})` : ''}`)}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>Track Order on WhatsApp</span>
          </a>

          <Link
            to="/shop"
            className="w-full sm:w-auto bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Order Details Card */}
      {items.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
            Order Items Summary
          </h3>

          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                  <span className="text-[11px] text-gray-500">Qty: {item.quantity} x ₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-xs font-bold text-[#6B1518]">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {totalAmount > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm font-bold text-gray-900">
              <span>Total Amount Paid / Due:</span>
              <span className="text-[#6B1518] text-lg font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
