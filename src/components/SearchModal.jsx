import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Sparkles, ArrowRight, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND } from '../config/brand';

const POPULAR_SEARCHES = [
  'Kanchipuram Silk Saree',
  'Banarasi Bridal Saree',
  'Pure Handloom Cotton',
  'Mangalagiri Pattu',
  'Mulchanderi Dress',
  'Chiffon Floral Saree',
  'Organza Silk',
];

const QUICK_FILTERS = [
  { id: 'all', label: 'All Items' },
  { id: 'sarees', label: 'Sarees' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'silk', label: 'Pure Silk' },
  { id: 'cotton', label: 'Cotton' },
  { id: 'under2000', label: 'Under ₹2,000' },
];

export default function SearchModal() {
  const navigate = useNavigate();
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const { products } = useStoreData();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const inputRef = useRef(null);

  // Recent Searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('aalaya_recent_searches');
      return saved ? JSON.parse(saved) : ['Silk Sarees', 'Mangalagiri Pattu', 'Festive Dresses'];
    } catch {
      return ['Silk Sarees', 'Mangalagiri Pattu'];
    }
  });

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Auto-focus input on modal open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveFilter('all');
    }
  }, [isSearchOpen]);

  const saveRecentSearch = (term) => {
    const clean = (term || '').trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('aalaya_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('aalaya_recent_searches');
    } catch {}
  };

  const removeSingleRecent = (e, term) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem('aalaya_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleExecuteSearch = (searchTerm) => {
    const finalTerm = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!finalTerm) return;
    saveRecentSearch(finalTerm);
    setIsSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(finalTerm)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    }
  };

  // Amazon-style intelligent multi-attribute search & scoring
  const searchResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery && activeFilter === 'all') return [];

    let filtered = products;

    // Apply Quick Filter Tab
    if (activeFilter === 'sarees') {
      filtered = filtered.filter((p) => (p.category || '').toLowerCase() === 'sarees');
    } else if (activeFilter === 'dresses') {
      filtered = filtered.filter((p) => (p.category || '').toLowerCase() === 'dresses');
    } else if (activeFilter === 'silk') {
      filtered = filtered.filter((p) =>
        (p.fabric || '').toLowerCase().includes('silk') ||
        (p.name || '').toLowerCase().includes('silk') ||
        (p.material || '').toLowerCase().includes('silk')
      );
    } else if (activeFilter === 'cotton') {
      filtered = filtered.filter((p) =>
        (p.fabric || '').toLowerCase().includes('cotton') ||
        (p.name || '').toLowerCase().includes('cotton')
      );
    } else if (activeFilter === 'under2000') {
      filtered = filtered.filter((p) => Number(p.price) <= 2000);
    }

    if (!cleanQuery) return filtered.slice(0, 8);

    // Parse price intents like "under 2000" or "below 3000"
    const priceUnderMatch = cleanQuery.match(/(?:under|below|less than)\s*₹?\s*(\d+)/);
    const maxPriceLimit = priceUnderMatch ? Number(priceUnderMatch[1]) : null;

    return filtered
      .map((product) => {
        let score = 0;
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const subcategory = (product.subcategory || '').toLowerCase();
        const fabric = (product.fabric || '').toLowerCase();
        const material = (product.material || '').toLowerCase();
        const occasion = (product.occasion || '').toLowerCase();
        const description = (product.description || '').toLowerCase();

        // Exact name match gets highest priority
        if (name === cleanQuery) score += 100;
        else if (name.startsWith(cleanQuery)) score += 50;
        else if (name.includes(cleanQuery)) score += 30;

        // Subcategory & Category
        if (subcategory.includes(cleanQuery)) score += 25;
        if (category.includes(cleanQuery)) score += 20;

        // Fabric & Material
        if (fabric.includes(cleanQuery)) score += 25;
        if (material.includes(cleanQuery)) score += 20;

        // Occasion
        if (occasion.includes(cleanQuery)) score += 15;

        // Description
        if (description.includes(cleanQuery)) score += 10;

        // Price limit condition
        if (maxPriceLimit && Number(product.price) <= maxPriceLimit) score += 40;

        // Tokenized word matching
        const words = cleanQuery.split(/\s+/).filter(Boolean);
        if (words.length > 1) {
          const matchCount = words.filter((w) =>
            name.includes(w) || category.includes(w) || subcategory.includes(w) || fabric.includes(w)
          ).length;
          score += matchCount * 15;
        }

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, 10);
  }, [products, query, activeFilter]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-12 animate-fadeIn">
      {/* Dark Backdrop */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-3xl mx-auto rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100 animate-slideDown">
        {/* Top Amazon-Style Search Header */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#6B1518] shrink-0">
            <Search className="w-5 h-5 text-[#6B1518]" />
          </div>

          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search sarees, dresses, fabrics, pure silk, wedding collections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-sm sm:text-base font-medium outline-none text-gray-900 placeholder:text-gray-400 placeholder:font-normal pr-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-0 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button (Amazon Style) */}
          <button
            type="button"
            onClick={() => handleExecuteSearch()}
            className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer hidden sm:flex items-center gap-1.5"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Category Pills (Amazon style) */}
        <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 overflow-x-auto hide-scroll text-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider shrink-0">Filter:</span>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#6B1518] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Body Content */}
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-5 space-y-5 divide-y divide-gray-100">
          {/* STATE 1: Empty Query - Show Recent Searches & Trending Suggestions */}
          {!query.trim() && (
            <div className="space-y-5 pt-1">
              {/* Recent Searches Section */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] font-semibold text-gray-400 hover:text-red-600 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          handleExecuteSearch(term);
                        }}
                        className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-[#FAF5EE] hover:text-[#6B1518] text-gray-700 text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#6B1518]/20"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeSingleRecent(e, term)}
                          className="hover:text-red-500 ml-1 p-0.5"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches Section */}
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D3923A]" /> Trending on Aalaya Vastra
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setQuery(tag);
                        handleExecuteSearch(tag);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F3EAE0] text-gray-800 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-gray-200 transition-all cursor-pointer hover:scale-102"
                    >
                      <Sparkles className="w-3 h-3 text-[#D3923A]" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Active Query - Instant Results List */}
          {query.trim() && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-semibold">
                  Found {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'} matching "{query}"
                </p>
                <button
                  onClick={() => handleExecuteSearch()}
                  className="text-xs font-bold text-[#6B1518] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>See all in shop</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">No matching handlooms found for "{query}"</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try searching by fabric like "Silk", "Cotton", or category like "Saree", "Dress".
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    {['Sarees', 'Dresses', 'Banarasi'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-xs bg-gray-100 hover:bg-[#FAF5EE] text-[#6B1518] px-3 py-1 rounded-lg font-semibold"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((product) => {
                    const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;
                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          saveRecentSearch(product.name);
                          setIsSearchOpen(false);
                          navigate(`/product/${product.id}`);
                        }}
                        className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={product.image || '/products/saree-placeholder.png'}
                          alt={product.name}
                          className="w-14 h-16 object-cover rounded-xl border border-gray-200 bg-gray-50 shrink-0 group-hover:scale-103 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#D3923A] uppercase tracking-wider">
                              {product.subcategory || product.category}
                            </span>
                            {product.fabric && (
                              <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {product.fabric}
                              </span>
                            )}
                          </div>
                          <h5 className="font-serif font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 group-hover:text-[#6B1518] transition-colors">
                            {product.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs sm:text-sm font-extrabold text-[#6B1518]">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            {product.oldPrice && (
                              <span className="text-[11px] text-gray-400 line-through">
                                ₹{Number(product.oldPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                            {product.discount && (
                              <span className="text-[10px] font-extrabold text-emerald-600">
                                {product.discount}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B1518] group-hover:translate-x-0.5 transition-transform">
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Amazon-Style Bottom "See all results" Footer Bar */}
        {query.trim() && searchResults.length > 0 && (
          <div className="p-3 bg-[#FAF8F5] border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-500 font-medium">
              Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px]">Enter</kbd> to search full catalog
            </span>
            <button
              type="button"
              onClick={() => handleExecuteSearch()}
              className="bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>See all {searchResults.length} results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
