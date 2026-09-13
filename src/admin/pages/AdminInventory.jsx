import React, { useState } from 'react';
import { PackageCheck, Plus, Minus, Search, AlertTriangle, CheckCircle2, XCircle, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminInventory() {
  const { products, batchUpdateStock } = useStoreData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'out', 'modified'
  const [pendingStocks, setPendingStocks] = useState({}); // { [productId]: number }
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const pendingCount = Object.keys(pendingStocks).length;

  const handleSetStock = (productId, val, originalStock) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPendingStocks((prev) => {
      const copy = { ...prev };
      if (num === originalStock) {
        delete copy[productId];
      } else {
        copy[productId] = num;
      }
      return copy;
    });
  };

  const handleStockDelta = (productId, delta, currentStock, originalStock) => {
    const nextVal = Math.max(0, currentStock + delta);
    handleSetStock(productId, nextVal, originalStock);
  };

  const handleDiscardChanges = () => {
    setPendingStocks({});
    setErrorMessage('');
  };

  const handleSaveAll = async () => {
    if (pendingCount === 0 || saving) return;
    setSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    const res = await batchUpdateStock(pendingStocks);
    setSaving(false);

    if (res.success) {
      setSaveSuccessMessage(`✓ Successfully saved ${res.count || pendingCount} inventory update(s) to database! All changes are now live across the website.`);
      setPendingStocks({});
      setTimeout(() => setSaveSuccessMessage(''), 5000);
    } else {
      setErrorMessage(res.message || 'Failed to update inventory. Please try again.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const origStock = p.stock ?? 0;
    const currentStock = pendingStocks[p.id] !== undefined ? pendingStocks[p.id] : origStock;

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'low') return currentStock > 0 && currentStock <= 3;
    if (filter === 'out') return currentStock === 0;
    if (filter === 'modified') return pendingStocks[p.id] !== undefined;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Inventory & Stock Controls</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Modify quantities across multiple products, then click the <strong>Save All Inventory Changes</strong> button to sync to the live website.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, item, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
            />
          </div>

          {/* Quick Category / Stock Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700"
          >
            <option value="all">All Items ({products.length})</option>
            <option value="low">Low Stock (≤ 3)</option>
            <option value="out">Out of Stock (0)</option>
            <option value="modified">Modified Unsaved ({pendingCount})</option>
          </select>
        </div>
      </div>

      {/* Floating / Sticky Save Action Bar */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-900 text-xs sm:text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              You have <span className="underline decoration-amber-600 font-extrabold">{pendingCount} pending inventory change(s)</span>. Click Save to push to the database and update storefront.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : `Save All Inventory Changes (${pendingCount})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold animate-fadeIn">
          {errorMessage}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Item & Image</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Count</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-center">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 font-serif text-sm">
                    No products matched your search or filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const origStock = p.stock ?? 0;
                  const isModified = pendingStocks[p.id] !== undefined;
                  const currentStock = isModified ? pendingStocks[p.id] : origStock;

                  const isOut = currentStock === 0;
                  const isLow = currentStock > 0 && currentStock <= 3;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isModified ? 'bg-amber-50/70' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">₹{p.price?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-gray-500 text-[11px]">{p.sku || p.id}</td>
                      <td className="p-4 uppercase text-[10px] font-bold text-gray-500">{p.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleSetStock(p.id, e.target.value, origStock)}
                            className={`w-20 p-1.5 rounded-lg border font-extrabold text-sm text-center focus:outline-none ${
                              isModified
                                ? 'border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-400/40'
                                : 'border-gray-300 focus:border-[#6B1518]'
                            }`}
                          />
                          {isModified && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                              (was {origStock})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Low Stock ({currentStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> In Stock ({currentStock})
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockDelta(p.id, -1, currentStock, origStock)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                            title="Decrease Stock"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockDelta(p.id, 1, currentStock, origStock)}
                            className="w-8 h-8 rounded-lg bg-[#6B1518] hover:bg-[#4B0F11] font-bold text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                            title="Increase Stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Action Bar if pending */}
        {pendingCount > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">
              {pendingCount} product(s) modified and awaiting save.
            </span>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : `Save All Inventory Changes (${pendingCount})`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
