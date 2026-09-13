import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, DollarSign, Megaphone, ExternalLink } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

const parseLines = (s) => {
  if (Array.isArray(s?.announcementLines)) {
    return [
      s.announcementLines[0] || '',
      s.announcementLines[1] || '',
      s.announcementLines[2] || '',
      s.announcementLines[3] || '',
    ];
  }
  if (s?.announcementText) {
    try {
      const parsed = JSON.parse(s.announcementText);
      if (Array.isArray(parsed)) {
        return [parsed[0] || '', parsed[1] || '', parsed[2] || '', parsed[3] || ''];
      }
    } catch {}
    return [s.announcementText, '', '', ''];
  }
  return ['', '', '', ''];
};

export default function AdminSettings() {
  const { settings, updateSettings } = useStoreData();
  const [formData, setFormData] = useState(() => ({
    storeName: '',
    phone: '',
    whatsapp: '',
    email: '',
    ownerName: '',
    address: '',
    freeShippingThreshold: 2000,
    currency: '₹',
    announcementLines: parseLines(settings),
    announcementText: settings?.announcementText || '',
    announcementEnabled: settings?.announcementEnabled !== false,
    announcementLink: settings?.announcementLink || '/shop',
    ...settings,
    announcementLines: parseLines(settings),
  }));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        announcementLines: parseLines(settings),
        announcementText: settings.announcementText ?? prev.announcementText,
        announcementEnabled: settings.announcementEnabled !== undefined ? settings.announcementEnabled : prev.announcementEnabled,
        announcementLink: settings.announcementLink ?? prev.announcementLink,
      }));
    }
  }, [settings]);

  const handleLineChange = (index, value) => {
    setFormData((prev) => {
      const currentLines = Array.isArray(prev.announcementLines)
        ? [...prev.announcementLines]
        : ['', '', '', ''];
      while (currentLines.length < 4) currentLines.push('');
      currentLines[index] = value;
      return {
        ...prev,
        announcementLines: currentLines,
        announcementText: currentLines.filter(Boolean).join(' • '),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const lines = Array.isArray(formData.announcementLines)
      ? formData.announcementLines.slice(0, 4)
      : ['', '', '', ''];

    const payload = {
      ...formData,
      whatsapp: formData.whatsapp || formData.phone,
      announcementLines: lines,
      announcementText: lines.filter(Boolean).join(' • '),
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

  const previewLines = (formData.announcementLines || []).map((l) => (l || '').trim()).filter(Boolean);

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
                <p className="text-[11px] text-gray-500">Configure 4 distinct lines. Only the lines you enter here will scroll continuously across the top of the store.</p>
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

          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
              <span className="font-bold">Marquee Bar Lines:</span> Add your announcement lines below. Each field acts as a line in the bar. <strong>Only</strong> the lines you add will appear and scroll.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Announcement Line 1', placeholder: 'e.g. ✨ Special Festive Offer: Flat 20% Off on Pure Silk Sarees | Use Code: AV20' },
                { label: 'Announcement Line 2', placeholder: 'e.g. 🚚 Free Express Delivery Across India on Orders Above ₹2,000' },
                { label: 'Announcement Line 3', placeholder: 'e.g. 🎁 Complimentary Handcrafted Gift Box on Every Purchase' },
                { label: 'Announcement Line 4', placeholder: 'e.g. 🥻 Exclusive New Kanjeevaram & Banarasi Silk Sarees Available' },
              ].map((field, index) => (
                <div key={index} className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    {field.label} {index === 0 ? <span className="text-[#6B1518]">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={formData.announcementLines?.[index] ?? ''}
                    onChange={(e) => handleLineChange(index, e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:border-[#6B1518] focus:ring-1 focus:ring-[#6B1518] outline-none"
                  />
                </div>
              ))}
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
              <div className="flex items-center justify-between mb-1.5">
                <span className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  Live Storefront Header Preview (Continuous Marquee Scroll):
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">
                  {previewLines.length} active {previewLines.length === 1 ? 'line' : 'lines'} scrolling
                </span>
              </div>
              {previewLines.length > 0 ? (
                <div className="bg-[#6B1518] text-white text-xs py-2 px-3 rounded-xl overflow-hidden whitespace-nowrap shadow-xs relative">
                  <div className="flex items-center w-max animate-marquee">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center shrink-0">
                        {previewLines.map((line, idx) => (
                          <span key={idx} className="mx-6 inline-flex items-center gap-2 font-medium tracking-wide">
                            <span>{line}</span>
                            <span className="text-[#D3923A] ml-4 text-xs select-none">✦</span>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 text-xs py-2 px-3 rounded-xl border border-amber-200">
                  No announcement lines added yet. Enter at least one line above to show the scrolling announcement bar.
                </div>
              )}
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
