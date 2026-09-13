import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, Phone, MapPin, ChevronRight, MessageCircle, User } from 'lucide-react';
import { InstagramIcon } from './BrandIcons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/categories', label: 'CATEGORIES' },
  { path: '/shop', label: 'ALL PRODUCTS' },
  { path: '/shop?category=sarees', label: 'SAREES' },
  { path: '/shop?category=dresses', label: 'DRESSES' },
  { path: '/faqs', label: 'FAQS' },
  { path: '/our-story', label: 'OUR STORY' },
  { path: '/contact', label: 'CONTACT' },
];

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen, subtotal } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { setIsSearchOpen } = useUI();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { settings } = useStoreData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUrl = location.pathname + location.search;

  const goTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative md:sticky md:top-0 z-40 bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* Top Announcement Bar */}
      {(settings?.announcementEnabled !== false) && (
        <div className="bg-[#6B1518] text-white text-[11px] sm:text-xs py-1.5 px-3 border-b border-[#4B0F11]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium tracking-wide truncate">
              <span className="hidden sm:inline-block bg-[#D3923A] text-[#6B1518] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0">Announcement</span>
              {settings?.announcementLink ? (
                <a href={settings.announcementLink} className="truncate hover:underline hover:text-[#FAF5EE] transition-colors">
                  {settings.announcementText || `✨ FREE SHIPPING on orders above ₹${(settings?.freeShippingThreshold || BRAND.freeShippingThreshold).toLocaleString('en-IN')}`}
                </a>
              ) : (
                <span className="truncate">
                  {settings?.announcementText || `✨ FREE SHIPPING on orders above ₹${(settings?.freeShippingThreshold || BRAND.freeShippingThreshold).toLocaleString('en-IN')}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-gray-200 text-[11px] shrink-0">
              <a href={`tel:${settings?.phone || BRAND.phone}`} className="hover:text-[#D3923A] transition-colors flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D3923A]" />
                <span className="hidden sm:inline">+91 {settings?.phone || BRAND.phone}</span>
              </a>
              <span className="hidden sm:inline text-[#831A1D]">|</span>
              <div className="hidden sm:flex items-center gap-2">
                <span>Follow us:</span>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#D3923A] transition-colors" title="Instagram">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a href={waLink(`Hello ${settings?.storeName || BRAND.name}, I have an inquiry.`)} target="_blank" rel="noreferrer" className="hover:text-[#D3923A] transition-colors" title="WhatsApp">
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header / Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 xl:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo — real brand asset, sized by height so it never stretches or crops.
              Compact (no tagline) below xl where the header is narrow; full lockup
              with tagline at xl+ where there's room for it to stay legible. */}
          <div
            onClick={() => goTo('/')}
            className="cursor-pointer flex items-center shrink-0 group"
          >
            <img
              src="/logo-nav-compact.png"
              alt={BRAND.name}
              className="xl:hidden h-9 sm:h-10 w-auto max-w-[160px] object-contain transition-transform group-hover:scale-105"
            />
            <img
              src="/logo-nav-full.png"
              alt={BRAND.name}
              className="hidden xl:block h-[52px] w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Desktop Navigation Links directly in header */}
          <nav className="hidden xl:flex flex-nowrap justify-center items-center gap-x-3 2xl:gap-x-4 text-[10px] 2xl:text-[11px] font-bold tracking-wider flex-1 min-w-0">
            {navLinks.map((link) => {
              const isActive = currentUrl === link.path || (link.path === '/' && currentUrl === '');
              return (
                <button
                  key={link.path}
                  onClick={() => goTo(link.path)}
                  className={`relative py-1.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-[#6B1518] font-bold'
                      : 'text-gray-700 hover:text-[#6B1518]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B1518] rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[#6B1518] hover:bg-gray-100 rounded-full transition-colors relative"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Clean Icon */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 text-gray-700 hover:text-[#6B1518] hover:bg-gray-100 rounded-full transition-colors relative"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#6B1518] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-gray-700 hover:text-[#6B1518] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            <div className="p-3 bg-[#6B1518] text-white flex items-center justify-between">
              <div className="bg-white rounded-lg px-2.5 py-1.5">
                <img src="/logo-nav-compact.png" alt={BRAND.name} className="h-8 w-auto max-w-[150px] object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = currentUrl === link.path || (link.path === '/' && currentUrl === '');
                return (
                  <button
                    key={link.path}
                    onClick={() => goTo(link.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#F8F0F0] text-[#6B1518]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#6B1518]' : 'text-gray-400'}`} />
                  </button>
                );
              })}

              <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#6B1518]" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-[#6B1518] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount} items
                    </span>
                  )}
                </button>

                <button
                  onClick={() => goTo('/account')}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-[#6B1518]" />
                  <span>My Account</span>
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 px-4 space-y-3 text-xs text-gray-600">
                <p className="font-bold uppercase tracking-wider text-[#6B1518]">Contact Us</p>
                <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 hover:text-[#6B1518]">
                  <Phone className="w-4 h-4 text-[#6B1518]" />
                  <span>+91 {BRAND.phone}</span>
                </a>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-[#6B1518]">
                  <span className="font-semibold text-[#6B1518]">@</span>
                  <span>{BRAND.email}</span>
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FAF8F5] text-center">
              <a
                href={waLink(`Hello ${BRAND.name}, I have an inquiry.`)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
