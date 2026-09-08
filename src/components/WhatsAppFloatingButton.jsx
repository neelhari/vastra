import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessage = `Hello ${BRAND.name}, I would like to know more about your products.`;
  const [customMsg, setCustomMsg] = useState(defaultMessage);
  const location = useLocation();

  const openWhatsApp = (msgToUse) => {
    window.open(waLink(msgToUse || defaultMessage), '_blank');
  };

  // Hide on product, checkout, order success, and cart to prevent obscuring inputs and payment buttons.
  if (
    location.pathname.startsWith('/product/') ||
    location.pathname === '/checkout' ||
    location.pathname === '/order-success' ||
    location.pathname === '/cart'
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 xl:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-2rem)]">
      {/* Interactive Quick Popup Card */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slideUp">
          <div className="bg-[#075E54] text-white p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">{BRAND.name} Support</h4>
                <p className="text-[10px] sm:text-[11px] text-emerald-200">Usually replies instantly</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-200 hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 sm:p-4 bg-[#ECE5DD] space-y-3">
            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-xs text-xs text-gray-800 space-y-1">
              <p className="font-bold text-[#075E54]">{BRAND.name} Care</p>
              <p>Hello! 👋 How can we assist you with our Sarees, Womenswear, or Fabric collections today?</p>
              <span className="text-[10px] text-gray-400 block text-right">{BRAND.ownerName}</span>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-semibold text-gray-700">Your Message:</label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#075E54] bg-white resize-none"
              />
              <button
                onClick={() => openWhatsApp(customMsg)}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none"
        title="Chat on WhatsApp"
        aria-label={`Chat on WhatsApp with ${BRAND.name}`}
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none" />

        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 fill-current relative z-10" />

        {/* Tooltip badge */}
        {!isOpen && (
          <span className="hidden md:inline-block absolute right-16 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Chat with us on WhatsApp!
          </span>
        )}
      </button>
    </div>
  );
}
