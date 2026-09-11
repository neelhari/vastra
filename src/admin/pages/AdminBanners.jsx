import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit3, CheckCircle2, Upload, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function AdminBanners() {
  const { banners, addBanner, updateBanner, deleteBanner } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('/shop');
  const [image, setImage] = useState('');
  const [active, setActive] = useState(true);

  // Statuses
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setLink('/shop');
    setImage('');
    setActive(true);
    setUploadError('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || '');
    setLink(banner.link || '/shop');
    setImage(banner.image || '');
    setActive(banner.active !== undefined ? banner.active : true);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const res = await uploadToCloudinary(file);
      if (res.success) {
        setImage(res.url);
      } else {
        setUploadError(res.message || 'Image upload failed.');
      }
    } catch (err) {
      setUploadError(err.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image || saving) return;

    setSaving(true);
    try {
      if (editingBanner) {
        // Edit existing banner
        const result = await updateBanner(editingBanner.id, {
          title,
          link,
          image,
          active,
        });
        if (!result.success) {
          window.alert(`Could not update banner: ${result.message || 'Unknown error'}`);
          setSaving(false);
          return;
        }
      } else {
        // Create new banner
        const result = await addBanner({
          title,
          link,
          image,
          active,
          sort_order: banners.length + 1,
        });
        if (!result.success) {
          window.alert(`Could not save banner: ${result.message || 'Unknown error'}`);
          setSaving(false);
          return;
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      window.alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    const result = await deleteBanner(id);
    if (!result.success) {
      window.alert(`Could not delete banner: ${result.message || 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (b) => {
    const result = await updateBanner(b.id, { active: !b.active });
    if (!result.success) {
      window.alert(`Could not update banner status: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Homepage Hero Banners ({banners.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Edit, upload, and control live storefront slider graphics and promotional banners</p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between group">
            <div className="relative aspect-[2.1/1] bg-gray-100 overflow-hidden">
              <img
                src={b.image}
                alt={b.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
              
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    b.active ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-900'
                  }`}
                  title={b.active ? 'Click to Hide' : 'Click to Publish'}
                >
                  {b.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{b.active ? 'Published' : 'Hidden'}</span>
                </button>
              </div>

              {/* Quick Image Change button on hover */}
              <button
                onClick={() => openEditModal(b)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Change Image / Edit Details</span>
              </button>
            </div>

            <div className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-serif text-base font-bold text-gray-900 truncate">{b.title}</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate flex items-center gap-1">
                  <span>Target: {b.link}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(b)}
                  className="px-3 py-2 rounded-xl text-[#6B1518] hover:bg-[#6B1518]/10 border border-[#6B1518]/20 flex items-center gap-1.5 font-bold text-xs transition-colors cursor-pointer"
                  title="Edit Banner Details & Image"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-100 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                {editingBanner ? <Edit3 className="w-5 h-5 text-[#6B1518]" /> : <Plus className="w-5 h-5 text-[#6B1518]" />}
                <h3 className="font-serif text-lg font-bold text-[#6B1518]">
                  {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Banarasi Silk Festival"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:ring-1 focus:ring-[#6B1518] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Navigation Target Link</label>
                <input
                  type="text"
                  placeholder="/shop?category=sarees"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:ring-1 focus:ring-[#6B1518] outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-800">Banner Visibility</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6B1518]"></div>
                  <span className="ml-2 font-bold text-[11px] text-gray-700">
                    {active ? 'Published' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Banner Graphic Image {editingBanner ? '(Upload New to Replace)' : '*'}
                </label>
                
                <div className="border-2 border-dashed border-gray-200 hover:border-[#6B1518] rounded-2xl p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <label className="bg-[#6B1518]/10 hover:bg-[#6B1518]/20 text-[#6B1518] px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>{image ? 'Replace Image' : 'Select Banner File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {uploading && <span className="text-[11px] text-amber-600 font-bold animate-pulse">Uploading to Cloudinary...</span>}
                    {!uploading && image && <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Image ready</span>}
                  </div>
                  {uploadError && <p className="text-[11px] text-red-600 font-semibold mt-2">{uploadError}</p>}
                </div>

                {image && (
                  <div className="mt-3 relative">
                    <span className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Banner Preview:</span>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-[2.1/1]">
                      <img src={image} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || !image}
                  className="bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  {saving ? 'Saving...' : (editingBanner ? 'Save Changes' : 'Publish Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
