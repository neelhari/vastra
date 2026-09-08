import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw, ShoppingBag, ChevronRight, ArrowLeft } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { BRAND } from '../config/brand';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, categories, loading } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const setSelectedCategory = (catId) => {
    if (catId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  const categoryList = [
    { id: 'all', name: 'All Products' },
    ...categories.map(c => ({ id: c.id, name: c.name }))
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCat = (product.category || '').toLowerCase().includes(query);
        const matchSub = (product.subcategory || '').toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchSub) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategoryName = categoryList.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Clean Top Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#6B1518] py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors -ml-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Back to Home</span>
        </button>
        {activeCategoryName && (
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {activeCategoryName}
          </span>
        )}
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-100 pb-3" data-aos="fade-down">
        <span className="text-[11px] uppercase font-bold tracking-widest text-[#D3923A]">Explore Our Catalog</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">
          {BRAND.name} Fashion Collection
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm mt-0.5 max-w-2xl">
          Browse sarees, dresses, and fabrics curated for quality, elegance, and affordable pricing.
        </p>
      </div>

      {/* Category Tabs & Item Counter Row */}
      <div className="space-y-3" data-aos="fade-up">
        {/* Category Tabs — Edge-to-edge scroll on mobile */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scroll">
          <div className="flex items-center gap-1.5 shrink-0">
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  (selectedCategory === cat.id || (!selectedCategory && cat.id === 'all'))
                    ? 'bg-[#6B1518] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B1518]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 text-xs font-semibold text-gray-800 py-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#6B1518]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Item Counter */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-1 border-t border-gray-100">
          <span>Showing <strong>{filteredProducts.length}</strong> of {products.length} items</span>
        </div>
      </div>

      {/* Product Grid — 2 columns on mobile, 4 columns on desktop */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-4">
          <div className="w-16 h-16 bg-[#F8F0F0] rounded-full flex items-center justify-center mx-auto text-[#6B1518]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-900">No products found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try selecting a different category filter above.
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="bg-[#6B1518] text-white px-5 py-2 rounded-xl text-xs font-bold"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
