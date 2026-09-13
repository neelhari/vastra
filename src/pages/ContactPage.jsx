import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send, CheckCircle2, User, HelpCircle, ChevronDown, AlertTriangle } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';
import { saveContactMessageToSupabase } from '../lib/supabase';
import { useStoreData } from '../context/StoreDataContext';

export default function ContactPage() {
  const { settings } = useStoreData();
  const storeName = settings?.storeName || BRAND.name;
  const storePhone = settings?.phone || BRAND.phone;
  const storeWhatsApp = settings?.whatsapp || settings?.phone || BRAND.phone;
  const storeEmail = settings?.email || BRAND.email;
  const storeOwner = settings?.ownerName || BRAND.ownerFullName;
  const storeAddress = settings?.address || BRAND.address.full;
  const storeFreeShipping = settings?.freeShippingThreshold || BRAND.freeShippingThreshold;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.message.trim()) errs.message = 'Please enter your message';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    const result = await saveContactMessageToSupabase(formData);
    setSubmitting(false);
    setSaveFailed(!result.success);
    setSubmitted(true);
  };

  const contactCards = [
    {
      icon: <Phone className="w-6 h-6 text-[#6B1518]" />,
      title: "Phone Support",
      detail: `+91 ${storePhone}`,
      subdetail: "Available 9:00 AM - 9:00 PM IST",
      href: `tel:${storePhone}`,
      actionText: "Call Us Now"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
      title: "WhatsApp Chat",
      detail: `+91 ${storeWhatsApp}`,
      subdetail: "Instant response for product inquiries",
      href: waLink(`Hello ${storeName}, I have an inquiry.`, storeWhatsApp),
      actionText: "Chat on WhatsApp"
    },
    {
      icon: <Mail className="w-6 h-6 text-[#6B1518]" />,
      title: "Email Us",
      detail: storeEmail,
      subdetail: "Send your detailed questions",
      href: `mailto:${storeEmail}`,
      actionText: "Send Email"
    }
  ];

  const faqs = [
    {
      q: "How can I place an order for sarees or womenswear?",
      a: `You can easily add items to your cart on this website and click 'Place Order via WhatsApp', or reach out to us directly at +91 ${storePhone}.`
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept UPI (GPay, PhonePe, Paytm), Net Banking, direct Bank Transfer, and cash on delivery where available."
    },
    {
      q: "What is the delivery time across India?",
      a: "Orders are usually dispatched within 24 hours. Standard delivery takes 3 to 5 business days across India."
    },
    {
      q: "Is there free shipping available?",
      a: `Yes! All orders above ₹${Number(storeFreeShipping).toLocaleString('en-IN')} qualify for 100% Free Express Shipping.`
    },
    {
      q: "Do you have a physical store I can visit?",
      a: `Yes — you're welcome to visit us at ${storeAddress}.`
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-down">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D3923A]">We Are Here To Help</span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Contact {storeName}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Have a question about a product, order tracking, or saree draping guidance? Reach out to {storeOwner} directly.
        </p>
      </section>


      {/* Contact Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
        {contactCards.map((card, idx) => (
          <a
            key={idx}
            href={card.href}
            target={card.href.startsWith('http') ? '_blank' : '_self'}
            rel="noreferrer"
            className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 text-center"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F8F0F0] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="text-base font-extrabold text-[#6B1518] mt-1">{card.detail}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subdetail}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-xs font-bold text-[#6B1518] group-hover:underline">
                {card.actionText} →
              </span>
            </div>
          </a>
        ))}
      </section>

      {/* Main Form & Business Information Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12" data-aos="fade-up">
        {/* Left Side: Business Info */}
        <div className="lg:col-span-5 bg-[#6B1518] text-white p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#FAF5EE] ring-2 ring-[#D3923A]/60 shadow-md flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                <img src="/logo-icon.png" alt={storeName} className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="font-serif font-bold text-2xl text-white tracking-wide">
                  {storeName}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#D3923A] font-semibold">
                  {BRAND.tagline}
                </div>
              </div>
            </div>

            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
              We look forward to serving you with stylish and affordable fashion. Feel free to contact us anytime for customized saree inquiries or order assistance.
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-gray-200 pt-4 border-t border-[#831A1D]">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#D3923A]" />
                <span>Owner: <strong className="text-white">{storeOwner}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D3923A]" />
                <a href={`tel:${storePhone}`} className="hover:text-white underline">
                  +91 {storePhone}
                </a>
              </div>


              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <a href={waLink(`Hello ${storeName}, I have an inquiry.`, storeWhatsApp)} target="_blank" rel="noreferrer" className="hover:text-white underline">
                  WhatsApp: +91 {storeWhatsApp}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D3923A]" />
                <a href={`mailto:${storeEmail}`} className="hover:text-white underline">
                  {storeEmail}
                </a>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D3923A] mt-0.5 shrink-0" />
                <span>{storeAddress}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#831A1D] text-xs text-gray-300">
            <p><strong>Note:</strong> Submitting this contact form does not require any payment.</p>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">Send Us a Message</h3>
            <p className="text-xs text-gray-500 mt-1">Fill out the form below and we will get back to you promptly.</p>
          </div>

          {submitted ? (
            saveFailed ? (
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-amber-900">We couldn't save your message</h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  Something went wrong on our end. Please reach out directly on WhatsApp or phone instead so your message isn't lost.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={waLink(`Hello ${storeName}, my message: ${formData.message}`, storeWhatsApp)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Us
                  </a>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSaveFailed(false);
                    }}
                    className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-emerald-900">Message Received!</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Thank you for contacting <strong>{storeName}</strong>. {storeOwner} will respond to your message shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', message: '' });
                  }}
                  className="bg-[#6B1518] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
                >
                  Send Another Message
                </button>
              </div>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder={storePhone}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder={storeEmail}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.email}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you are looking for..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none resize-none ${
                    errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending...' : 'Submit Contact Message'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="space-y-6" data-aos="fade-up">
        <div className="text-center space-y-2">
          <HelpCircle className="w-6 h-6 text-[#6B1518] mx-auto" />
          <h2 className="font-serif text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isFaqOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isFaqOpen ? null : idx)}
                  className="w-full text-left p-4 font-serif font-bold text-base text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#6B1518] transition-transform ${isFaqOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFaqOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
