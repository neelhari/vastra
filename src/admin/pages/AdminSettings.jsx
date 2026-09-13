import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, DollarSign, Megaphone, ExternalLink } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminSettings() {
  const { settings, updateSettings } = useStoreData();
  const [formData, setFormData] = useState({
    storeName: '',
    phone: '',
    whatsapp: '',
    email: '',
    ownerName: '',
    address: '',
    freeShippingThreshold: 2000,
    currency: '₹',
    announcementText: 'Special Festive Offer: Flat 20% Off on Pure Silk Sarees | Use Code: AV20',
    announcementEnabled: true,
    announcementLink: '/shop',
    ...settings,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        announcementText: settings.announcementText ?? prev.announcementText,
        announcementEnabled: settings.announcementEnabled !== undefined ? settings.announcementEnabled : prev.announcementEnabled,
        announcementLink: settings.announcementLink ?? prev.announcementLink,
      }));
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // Ensure whatsapp defaults to phone if empty
    const payload = {
      ...formData,
      whatsapp: formData.whatsapp || formData.phone,
    };

    const result = await updateSettings(payload);
    setSaving(false);

    if (!result?.success) {
      setError(result?.message || 'Could not save settings.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Store Configuration & Announcement Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage store contact details, announcement bar, and shipping thresholds</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Store configuration saved successfully! All storefront pages and top announcement bar reflect the updated settings.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xs space-y-6 text-xs">
        {/* SECTION 1: ANNOUNCEMENT BANNER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#6B1518]" />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#6B1518]">
                  1. Top Announcement Bar
                </h3>
                <p className="text-[11px] text-gray-500">Notice bar shown at the very top of all store pages</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.announcementEnabled)}
                onChange={(e) => setFormData({ ...formData, announcementEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B1518]"></div>
              <span className="ml-2.5 text-xs font-bold text-gray-700">
                {formData.announcementEnabled ? 'Active (Visible)' : 'Disabled (Hidden)'}
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Announcement Message Text</label>
              <input
                type="text"
                placeholder="e.g. ✨ FESTIVE SALE: Flat 20% OFF on all Pure Silk Sarees! Use Code: AV20"
                value={formData.announcementText || ''}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:ring-1 focus:ring-[#6B1518] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Target Link (Optional)</label>
              <input
                type="text"
                placeholder="/shop?category=sarees"
                value={formData.announcementLink || ''}
                onChange={(e) => setFormData({ ...formData, announcementLink: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:ring-1 focus:ring-[#6B1518] outline-none font-mono text-[11px]"
              />
            </div>

            {/* Live Preview Box */}
            <div className="mt-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1.5 tracking-wider">Live Storefront Header Preview:</span>
              <div className="bg-[#6B1518] text-white text-xs py-2 px-4 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="bg-[#D3923A] text-[#6B1518] text-[9px] uppercase font-black px-1.5 py-0.5 rounded shrink-0">Announcement</span>
                  <span className="truncate font-medium">
                    {formData.announcementText || 'Special Festive Offer: Flat 20% Off on Pure Silk Sarees | Use Code: AV20'}
                  </span>
                </div>
                <span className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-0.5 rounded ml-2 shrink-0 transition-colors">
                  Shop Now →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BRAND & CONTACT INFO */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-serif text-lg font-bold text-[#6B1518] border-b border-gray-100 pb-2">
            2. Brand & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.storeName || ''}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Founder / Owner Name</label>
              <input
                type="text"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Store Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                value={formData.whatsapp || formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Physical Store Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
            />
          </div>
        </div>

        {/* SECTION 3: FINANCIAL & SHIPPING */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-serif text-lg font-bold text-[#6B1518] border-b border-gray-100 pb-2">
            3. Currency & Shipping Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={formData.freeShippingThreshold || 0}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency || '₹'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] font-bold outline-none"
              />
            </div>
          </div>
        </div>


        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Store Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
