import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { fetchOrdersByPhone } from '../lib/supabase';
import { BRAND, waLink } from '../config/brand';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openLoginModal, addAddress } = useAuth();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    pincode: '',
    type: 'Home',
  });

  // The order table is RLS-locked to admins (see supabase/schema.sql) since
  // there's no real per-customer login here — a phone-scoped RPC is used
  // instead of exposing every customer's orders through the shared anon key.
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (!user?.phone) {
      setUserOrders([]);
      return;
    }
    let active = true;
    fetchOrdersByPhone(user.phone).then((res) => {
      if (active && res.success) setUserOrders(res.data);
    });
    return () => { active = false; };
  }, [user?.phone]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.addressLine || !newAddr.pincode) return;
    addAddress(newAddr);
    setShowAddressModal(false);
    setNewAddr({
      name: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      pincode: '',
      type: 'Home',
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
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

      {/* 1. Header Banner */}
      {isAuthenticated && user ? (
        <div className="bg-[#6B1518] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 sm:gap-5 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-[#D3923A] flex items-center justify-center text-2xl font-serif font-bold text-[#D3923A] shrink-0 shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold">{user.name || 'Valued Patron'}</h1>
                <span className="bg-[#D3923A] text-[#6B1518] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Member
                </span>
              </div>
              <p className="text-xs text-gray-200 font-mono">+91 {user.phone}</p>
              <p className="text-[11px] text-gray-300">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="z-10 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto border border-white/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>LOG OUT</span>
          </button>

          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-[#D3923A]/10 pointer-events-none" />
        </div>
      ) : (
        /* Myntra-style Login CTA Box */
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Account
            </span>
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Login to view your Orders & Saved Addresses
            </h2>
            <p className="text-xs text-gray-500 max-w-md">
              Experience fast 1-click checkout, track your silk saree orders, and manage saved delivery addresses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/login?redirect=/account')}
              className="w-full sm:w-auto bg-[#6B1518] hover:bg-[#4B0F11] text-white px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              LOG IN
            </button>
            <button
              onClick={() => navigate('/signup?redirect=/account')}
              className="w-full sm:w-auto bg-[#FAF8F5] hover:bg-[#F8F0F0] text-[#6B1518] border-2 border-[#6B1518] px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-transform hover:scale-105 active:scale-95"
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      )}

      {/* 2. Account Tabs (If Logged In) */}
      {isAuthenticated && (
        <div className="flex border-b border-gray-200 gap-8 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#6B1518] text-[#6B1518]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({userOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'border-[#6B1518] text-[#6B1518]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({user?.addresses?.length || 0})</span>
          </button>
        </div>
      )}

      {/* 3. Tab Contents */}
      {isAuthenticated ? (
        <div className="space-y-6">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border border-gray-100 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#6B1518]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">No Orders Placed Yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Explore our handpicked sarees, dress collections, and fabrics.
                  </p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="bg-[#6B1518] text-white text-xs font-bold px-6 py-2.5 rounded-xl inline-block mt-2 shadow-sm"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#6B1518]">{ord.id}</span>
                        <span className="text-[11px] text-gray-400 block sm:inline sm:ml-3">
                          Placed on {ord.date}
                        </span>
                      </div>
                      <span className={`self-start sm:self-auto text-[10px] font-extrabold px-3 py-1 rounded-full ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900">{item.name} × {item.quantity}</span>
                          <span className="font-extrabold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Total Paid: <strong className="text-gray-900">₹{ord.totalAmount.toLocaleString('en-IN')}</strong></span>
                      <a
                        href={waLink(`Hello ${BRAND.name}, I want to track my order ${ord.id}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#25D366] hover:underline font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Track on WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Delivery Addresses
                </h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.addresses?.map((addr, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {addr.type || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] text-emerald-700 font-bold">Default</span>
                      )}
                    </div>
                    <p className="font-bold text-xs text-gray-900">{addr.name}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">Mobile: +91 {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 4. Quick Shortcuts */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
        <Link to="/wishlist" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-xs font-bold text-gray-900 transition-colors">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-[#6B1518]" />
            <span>My Wishlist ({wishlistItems.length})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link to="/cart" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-xs font-bold text-gray-900 transition-colors">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-[#6B1518]" />
            <span>Shopping Cart ({cartItems.length})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link to="/faqs" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-xs font-bold text-gray-900 transition-colors">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-4 h-4 text-[#6B1518]" />
            <span>Customer Help & FAQs</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#6B1518]">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#6B1518]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#6B1518]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Address / Street</label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No., Road Name"
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#6B1518]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#6B1518]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#6B1518]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B1518] text-white px-5 py-2 rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
