import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, Video, Play, AlertCircle, Film } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function ClothingProductModal({ isOpen, onClose, onSave, initialProduct, categories = [], saving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'sarees',
    subcategory: '',
    price: '',
    oldPrice: '',
    stock: 10,
    fabric: 'Pure Cotton',
    material: 'Zari Weave',
    occasion: 'Festive Wear',
    careInstructions: 'Dry Clean Only',
    sizes: [],
    description: '',
    video: '',
    videoUrl: '',
    images: [],
  });
  const [uploadError, setUploadError] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const isSareeCategory = (catId) => {
    if (!catId) return false;
    const lower = String(catId).toLowerCase();
    return lower === 'sarees' || lower.includes('saree');
  };

  const isCurrentSaree = isSareeCategory(formData.category);

  useEffect(() => {
    if (initialProduct) {
      const isSaree = isSareeCategory(initialProduct.category);
      setFormData({
        name: initialProduct.name || '',
        sku: initialProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: initialProduct.category || 'sarees',
        subcategory: initialProduct.subcategory || '',
        price: initialProduct.price || '',
        oldPrice: initialProduct.oldPrice || '',
        stock: initialProduct.stock || 10,
        fabric: initialProduct.fabric || 'Pure Cotton',
        material: initialProduct.material || 'Handloom',
        occasion: initialProduct.occasion || 'Festive Wear',
        careInstructions: initialProduct.careInstructions || 'Dry Clean Only',
        sizes: isSaree ? [] : (initialProduct.sizes || ['S', 'M', 'L', 'XL']),
        description: initialProduct.description || '',
        video: initialProduct.video || '',
        videoUrl: initialProduct.videoUrl || '',
        images: initialProduct.images || (initialProduct.image ? [initialProduct.image] : []),
      });
    } else {
      const defaultCat = categories[0]?.id || 'sarees';
      const isSaree = isSareeCategory(defaultCat);
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: defaultCat,
        subcategory: '',
        price: '',
        oldPrice: '',
        stock: 10,
        fabric: 'Mulchanderi / Pure Cotton',
        material: 'Handloom Zari Work',
        occasion: 'Festive & Wedding Wear',
        careInstructions: 'Dry Clean Only',
        sizes: isSaree ? [] : ['S', 'M', 'L', 'XL'],
        description: '',
        video: '',
        videoUrl: '',
        images: ['/products/saree-placeholder.png'],
      });
    }
  }, [initialProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingImage(true);
    setUploadError('');

    const uploadedUrls = [];
    const failures = [];
    for (const file of files) {
      const res = await uploadToCloudinary(file);
      if (res.success) {
        uploadedUrls.push(res.url);
      } else {
        failures.push(`${file.name}: ${res.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    }
    if (failures.length > 0) {
      // Never fall back to a blob: URL here — it only exists in this browser
      // tab and would render as a broken image for every other visitor and
      // after the next refresh, which is worse than surfacing the failure.
      setUploadError(`Some photos failed to upload:\n${failures.join('\n')}`);
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    setUploadError('');

    const res = await uploadToCloudinary(file);
    if (res.success) {
      setFormData((prev) => ({ ...prev, video: res.url }));
    } else {
      setUploadError(`Video upload failed: ${res.message}`);
    }
    setUploadingVideo(false);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({ ...prev, video: '' }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const newSizes = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const discountStr =
      formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
        ? `${Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100)}% OFF`
        : null;

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
      costPrice: null,
      sizes: isCurrentSaree ? [] : formData.sizes,
      discount: discountStr,
      image: formData.images[0] || '/products/saree-placeholder.png',
      video: formData.video || null,
      videoUrl: formData.videoUrl || null,
    };

    const ok = await onSave(payload);
    if (ok !== false) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#6B1518] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold">
              {initialProduct ? 'Edit Clothing Product' : 'Add New Clothing Product'}
            </h3>
            <p className="text-[11px] text-gray-300">
              Aalaya Vastra Clothing CMS • Live Storefront & Video Synchronization
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'basic' ? 'border-[#6B1518] text-[#6B1518]' : 'border-transparent text-gray-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Basic Info, Pricing & Media</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attributes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'attributes' ? 'border-[#6B1518] text-[#6B1518]' : 'border-transparent text-gray-500'
            }`}
          >
            <span>2. Fabric & Specifications {!isCurrentSaree && '& Sizes'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mulchanderi 3 Piece Dress With Embroidery"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const isSaree = isSareeCategory(newCat);
                      setFormData((prev) => ({
                        ...prev,
                        category: newCat,
                        sizes: isSaree ? [] : (prev.sizes.length > 0 ? prev.sizes : ['S', 'M', 'L', 'XL']),
                      }));
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none bg-white"
                  >
                    {categories.length === 0 && <option value={formData.category}>{formData.category}</option>}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Subcategory</label>
                <input
                  type="text"
                  list="subcategory-suggestions"
                  placeholder="e.g. Banarasi Tissue, Mulchanderi Sets"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                />
                <datalist id="subcategory-suggestions">
                  {(categories.find((c) => c.id === formData.category)?.subcategories || []).map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
                <p className="text-[10px] text-gray-400 mt-1">Used for search and category subfiltering on the storefront.</p>
              </div>

              {/* Pricing Grid — Clean 2-column: Selling Price & Original MRP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block font-bold text-gray-900 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none font-bold text-sm bg-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">The price customers pay on the store.</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="3499"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Strikethrough tag price to display discount.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed fabric specifications, embroidery style, length, and drape guidance..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none resize-none"
                />
              </div>

              {/* Media Section: Photos, Videos & Social Links directly here */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#6B1518]" />
                  <h4 className="font-serif text-sm font-bold text-gray-900">Product Photography & Media</h4>
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl whitespace-pre-line flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* 1. Photo Upload Box */}
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Product Images (Upload photos)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center hover:border-[#6B1518] transition-colors bg-gray-50">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="font-bold text-gray-800">Upload Product Photos</p>
                    <p className="text-gray-400 text-[11px]">JPG, PNG or WEBP up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="cloudinary-upload-input"
                    />
                    <label
                      htmlFor="cloudinary-upload-input"
                      className="mt-2.5 inline-block bg-[#6B1518] text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-[#4B0F11]"
                    >
                      {uploadingImage ? 'Uploading Photos...' : 'Select Photos'}
                    </label>
                  </div>

                  {/* Uploaded Images List */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {idx === 0 ? 'Main' : `${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 shadow-md"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Direct Video File Upload (3-4s motion video) */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <label className="block font-bold text-gray-900 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-[#D3923A]" /> 3-4s Drape Motion Video (Optional)
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Short motion video showing fabric drape and sheen in real life.
                  </p>

                  {formData.video ? (
                    <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden bg-black relative shrink-0">
                        <video
                          src={formData.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-[#D3923A] text-[#6B1518] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          ▶ Video
                        </span>
                      </div>
                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <p className="font-bold text-gray-900">Product Video Attached</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          ✓ Appears in product page gallery
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="text-xs text-red-600 hover:text-red-800 font-bold inline-flex items-center gap-1 pt-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-[#D3923A] transition-colors bg-[#FAF8F5]">
                      <Video className="w-6 h-6 text-[#D3923A] mx-auto mb-1" />
                      <p className="font-bold text-gray-800">Upload Drape Motion Video</p>
                      <p className="text-gray-400 text-[11px]">MP4, WEBM or MOV up to 50MB</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="cloudinary-video-upload-input"
                      />
                      <label
                        htmlFor="cloudinary-video-upload-input"
                        className="mt-2 inline-block bg-[#D3923A] hover:bg-[#B37C31] text-[#6B1518] font-extrabold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                      >
                        {uploadingVideo ? 'Uploading Video...' : 'Select Video File'}
                      </label>
                    </div>
                  )}
                </div>

                {/* 3. External Video Demonstration Link */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-[#6B1518]" /> Video Demonstration Link (YouTube / Instagram Reel URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Displays a "Watch Video Demonstration on YouTube / Instagram" button directly on the product detail page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Fabric Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Cotton, Mulchanderi, Banarasi Silk"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Material / Weave</label>
                  <input
                    type="text"
                    placeholder="e.g. Zari Embroidery, Handloom Weave"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Occasion</label>
                  <input
                    type="text"
                    placeholder="e.g. Festive, Wedding, Daily Wear"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Care Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Dry Clean Only / Gentle Handwash"
                    value={formData.careInstructions}
                    onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>
              </div>

              {/* Sizes Available — Conditionally rendered for non-saree garments */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {!isCurrentSaree ? (
                  <>
                    <label className="block font-bold text-gray-900 uppercase">Available Sizes</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((sz) => {
                        const selected = formData.sizes.includes(sz);
                        return (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => toggleSize(sz)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[#6B1518] text-white border-[#6B1518]'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-gray-100 flex items-center gap-3">
                    <span className="text-xl">🥻</span>
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 block text-xs">Sizes Not Applicable for Sarees</span>
                      <p className="text-[11px] text-gray-500">
                        Sarees are standard 5.5m – 6.3m unstitched drapes. Size options are disabled and will not be displayed to customers on the storefront.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingVideo}
              className="bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
