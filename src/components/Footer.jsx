import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Heart, ArrowUp, MapPin } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from './BrandIcons';
import { BRAND, waLink } from '../config/brand';
import { useStoreData } from '../context/StoreDataContext';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Categories', path: '/categories' },
  { label: 'Products', path: '/shop' },
  { label: 'My Account & Orders', path: '/account' },
  { label: 'Shopping Cart', path: '/cart' },
  { label: 'My Wishlist', path: '/wishlist' },
  { label: 'FAQs & Help', path: '/faqs' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Contact Us', path: '/contact' },
];

const policyLinks = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Return & Refund Policy', path: '/return-policy' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Terms & Conditions', path: '/terms' },
];

export default function Footer() {
  const navigate = useNavigate();
  const { settings } = useStoreData();

  // Dynamic store configuration with fallbacks
  const storeName = settings?.storeName || BRAND.name;
  const storePhone = settings?.phone || BRAND.phone;
  const storeWhatsApp = settings?.whatsapp || settings?.phone || BRAND.phone;
  const storeEmail = settings?.email || BRAND.email;
  const storeOwner = settings?.ownerName || BRAND.ownerFullName;
  const storeAddress = settings?.address || BRAND.address.full;


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <footer className="bg-[#360B0C] text-gray-200 border-t-4 border-[#D3923A] font-sans relative mb-14 xl:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            {/* Header style Logo */}
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-full bg-[#FAF5EE] ring-2 ring-[#D3923A]/60 shadow-md flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform p-0.5">
                <img src="/logo-icon.png" alt={storeName} className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide group-hover:text-[#D3923A] transition-colors">
                  {storeName}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#D3923A] font-semibold">
                  {BRAND.tagline}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Bringing you timeless sarees, womenswear, and fine fabrics crafted with tradition, quality, and affordability. Owned with pride by <span className="text-[#D3923A] font-semibold">{storeOwner}</span>.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#4B0F11] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#6B1518] transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#4B0F11] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#6B1518] transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href={waLink(`Hello ${storeName}, I have an inquiry.`, storeWhatsApp)} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#4B0F11] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#25D366] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#6B1518] pb-2 inline-block">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNav(item.path)}
                    className="text-gray-300 hover:text-[#D3923A] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-[#D3923A]">›</span> {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Policies */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#6B1518] pb-2 inline-block">
              POLICIES & LEGAL
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {policyLinks.map((policy) => (
                <li key={policy.path}>
                  <button
                    onClick={() => handleNav(policy.path)}
                    className="text-gray-300 hover:text-[#D3923A] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-[#D3923A]">›</span> {policy.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#6B1518] pb-2 inline-block">
              CONTACT US
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D3923A] shrink-0 mt-0.5" />
                <a href={`tel:${storePhone}`} className="hover:text-white transition-colors">
                  +91 {storePhone}
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <a href={waLink(`Hello ${storeName}, I have an inquiry.`, storeWhatsApp)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  +91 {storeWhatsApp} (WhatsApp)
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D3923A] shrink-0 mt-0.5" />
                <a href={`mailto:${storeEmail}`} className="hover:text-white transition-colors break-all">
                  {storeEmail}
                </a>
              </p>
              <div className="pt-2 text-xs text-gray-400 border-t border-[#4B0F11] mt-3 space-y-1.5">
                <div>
                  <span>Owner: </span>
                  <span className="text-white font-medium">{storeOwner}</span>
                </div>
                {storeAddress && (
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-400 pt-0.5">
                    <MapPin className="w-3 h-3 text-[#D3923A] shrink-0 mt-0.5" />
                    <span>{storeAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & scroll to top */}
        <div className="pt-6 border-t border-[#4B0F11] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 {BRAND.name}. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#D3923A] fill-[#D3923A]" />
            <span>for timeless style & affordability.</span>
          </div>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 bg-[#6B1518] hover:bg-[#831A1D] text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
