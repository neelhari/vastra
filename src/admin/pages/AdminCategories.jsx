import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Upload, AlertCircle } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setImage('');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.tagline || cat.description || '');
    setImage(cat.image || '');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadError('');

    const res = await uploadToCloudinary(file);
    if (res.success) {
      setImage(res.url);
    } else {
      setUploadError(`Failed to upload photo: ${res.message}`);
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || saving || uploadingImage) return;

    setSaving(true);
    const categoryImage = image || editingCat?.image || '/products/saree-placeholder.png';

    const result = editingCat
      ? await updateCategory(editingCat.id, {
          name: name.trim(),
          tagline: description.trim(),
          image: categoryImage,
        })
      : await addCategory({
          id: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: name.trim(),
          tagline: description.trim(),
          image: categoryImage,
          active: true,
        });
    setSaving(false);

    if (!result.success) {
      window.alert(`Could not save category: ${result.message || 'Unknown error'}`);
      return;
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products already assigned to it will keep the old category value.')) return;
    const result = await deleteCategory(id);
    if (!result.success) {
      window.alert(`Could not delete category: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Categories & Collections ({categories.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Control live storefront categories and navigation tiles</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-video bg-gray-100">
              <img src={cat.image || '/slider/image copy 2.png'} alt={cat.name} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" /> Live Storefront
              </span>
            </div>

            <div className="p-5 space-y-2">
              <h3 className="font-serif text-lg font-bold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{cat.tagline || cat.description || 'Curated clothing items'}</p>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400">ID: {cat.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 border border-blue-100"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-100"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#6B1518]">
                {editingCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-800 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handloom Sarees"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Tagline / Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Timeless Weaves & Elegant Drapes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                />
              </div>

              {/* Category Cover Photo Upload */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="block font-bold text-gray-800">Category Cover Photo</label>
                
                {image ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-gray-200 bg-gray-50 group">
                    <img src={image} alt="Category Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="change-category-photo"
                      />
                      <label
                        htmlFor="change-category-photo"
                        className="bg-white text-gray-900 font-bold px-3 py-1.5 rounded-xl cursor-pointer text-xs hover:bg-gray-100 shadow-md"
                      >
                        {uploadingImage ? 'Uploading...' : 'Change Photo'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-red-700 shadow-md"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center hover:border-[#6B1518] transition-colors bg-gray-50">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                    <p className="font-bold text-gray-800">Upload Category Cover Photo</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">JPG, PNG or WEBP up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="category-photo-input"
                    />
                    <label
                      htmlFor="category-photo-input"
                      className="mt-2.5 inline-block bg-[#6B1518] text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-[#4B0F11] shadow-xs"
                    >
                      {uploadingImage ? 'Uploading Photo...' : 'Select Cover Photo'}
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save & Publish Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
