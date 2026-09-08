import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Search, ChevronDown, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function FaqPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      category: "Ordering & Delivery",
      q: "How can I place an order on Aalaya Vastra?",
      a: `You can easily add sarees or dresses to your cart and click 'Proceed to Checkout', or place your order directly via WhatsApp at +91 ${BRAND.phone}.`
    },
    {
      category: "Ordering & Delivery",
      q: "What is the delivery time across India?",
      a: "Orders are dispatched within 24 hours. Express courier delivery usually takes 3 to 5 business days anywhere in India."
    },
    {
      category: "Ordering & Delivery",
      q: "Is free shipping available?",
      a: `Yes! Orders worth ₹${BRAND.freeShippingThreshold.toLocaleString('en-IN')} or more get 100% FREE express shipping!`
    },
    {
      category: "Payments & Offers",
      q: "What payment methods are supported?",
      a: "We support UPI (GPay, PhonePe, Paytm), Cash on Delivery (COD), Net Banking, and direct WhatsApp payment links."
    },
    {
      category: "Payments & Offers",
      q: "Are there any promo codes available for first-time buyers?",
      a: "Yes! Use promo code 'AV10' at checkout to receive an instant 10% discount on your subtotal."
    },
    {
      category: "Sarees & Fabric Care",
      q: "Are your Banarasi and handloom sarees authentic?",
      a: `Yes, 100%! Every saree at ${BRAND.name} is hand-picked for quality, softness, and rich finish directly curated by ${BRAND.ownerName}.`
    },
    {
      category: "Sarees & Fabric Care",
      q: "What are the washing & care instructions for tissue and silk sarees?",
      a: "We recommend gentle dry cleaning for tissue, Banarasi, and pure silk sarees to preserve their weave, zari work, and sheen for years."
    },
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Clean Top Navigation */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#6B1518] py-1 px-2.5 rounded-lg hover:bg-gray-100 transition-colors -ml-2.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 bg-[#F8F0F0] text-[#6B1518] rounded-full flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">How Can We Help You?</h1>
        <p className="text-xs sm:text-sm text-gray-600">Find quick answers to common questions about orders, payments, shipping, and saree care.</p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search questions (e.g. shipping, payment, sarees)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#6B1518] shadow-xs"
        />
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3 pt-2">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-700">No questions matched your search.</p>
            <a
              href={waLink(`Hello ${BRAND.name}, I have a question.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
            >
              <MessageCircle className="w-4 h-4" /> Ask us on WhatsApp instead →
            </a>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 font-serif font-bold text-sm sm:text-base text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#D3923A] uppercase tracking-wider block">
                      {faq.category}
                    </span>
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[#6B1518] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact Banner */}
      <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-gray-100 text-center space-y-3">
        <h3 className="font-serif text-xl font-bold text-gray-900">Still Have Questions?</h3>
        <p className="text-xs text-gray-500">We are happy to answer any questions about saree weaves, sizing, or custom orders.</p>
        <a
          href={waLink(`Hello ${BRAND.name}, I have an inquiry.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat Live on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
