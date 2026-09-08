import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function PolicyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const tabs = [
    { id: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: '/return-policy', label: 'Return & Refund Policy', icon: RefreshCw },
    { id: '/shipping-policy', label: 'Shipping & Delivery', icon: Truck },
    { id: '/terms', label: 'Terms & Conditions', icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

      {/* Header Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 hide-scroll">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = path === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#6B1518] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        {path === '/privacy-policy' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold text-gray-900 border-b pb-3">Privacy Policy</h1>
            <p>At <strong>{BRAND.name}</strong>, owned and operated by <strong>{BRAND.ownerFullName}</strong>, protecting your privacy is our top priority. This Privacy Policy outlines how your personal details are collected, used, and safeguarded.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Information We Collect</h3>
            <p>We collect essential information required to fulfill your orders, including your name, contact phone number, shipping address, and email address when you place an order or contact us over WhatsApp.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. How We Use Your Details</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>To process and deliver your saree and apparel orders promptly.</li>
              <li>To provide order updates and tracking links via WhatsApp or SMS.</li>
              <li>To answer customer support inquiries.</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">3. Data Security</h3>
            <p>We never sell or trade customer information to third parties. All transactions and personal contact details are encrypted and kept strictly confidential.</p>
          </div>
        )}

        {path === '/return-policy' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold text-gray-900 border-b pb-3">7-Day Easy Return & Replacement Policy</h1>
            <p>We want you to love every piece you purchase from <strong>{BRAND.name}</strong>! If you receive a damaged or incorrect product, our easy return and replacement policy is designed for your peace of mind.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Return Window</h3>
            <p>You can request a replacement or exchange within <strong>7 days</strong> of receiving your delivery.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Conditions for Exchange</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>The saree, dress, or fabric must be unused, unwashed, and in its original packaging with tags intact.</li>
              <li>Items damaged during transit or defective products qualify for immediate 100% free replacement.</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">3. How to Request an Exchange</h3>
            <p>Simply message us on WhatsApp (+91 {BRAND.phone}) with your Order Reference ID and an unboxing picture/video. Our team will arrange a quick pickup or exchange!</p>
          </div>
        )}

        {path === '/shipping-policy' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold text-gray-900 border-b pb-3">Shipping & Delivery Policy</h1>
            <p>We deliver sarees, womenswear, and fabrics to pin codes all across India with fast, reliable courier partners.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Shipping Charges</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong className="text-emerald-700">100% FREE Delivery</strong> on all orders above ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')}.</li>
              <li>A flat shipping fee of ₹99 applies for orders below ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')}.</li>
            </ul>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Delivery Timelines</h3>
            <p>Orders are dispatched within 24 business hours. Standard express courier delivery takes between <strong>3 to 5 business days</strong> across metro and non-metro cities in India.</p>
          </div>
        )}

        {path === '/terms' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold text-gray-900 border-b pb-3">Terms & Conditions</h1>
            <p>Welcome to <strong>{BRAND.name}</strong>. By accessing our website and placing orders, you agree to comply with the terms and conditions outlined below.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">1. Product Representation</h3>
            <p>We strive to portray product colors, fabric weaves, and designs as accurately as possible. Slight color variations may occur due to photography lighting or screen resolutions.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">2. Pricing & Payments</h3>
            <p>All prices listed on the site are in INR (₹) and inclusive of applicable taxes. Prices are subject to revision without prior notice, but orders already placed will remain unaffected.</p>

            <h3 className="font-serif text-xl font-bold text-gray-900 pt-2">3. Contact & Ownership</h3>
            <p><strong>{BRAND.name}</strong> is owned by <strong>{BRAND.ownerFullName}</strong>, located at {BRAND.address.full}. Contact phone: +91 {BRAND.phone}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
