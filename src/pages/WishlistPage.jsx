import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Clean Top Navigation Bar with Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#6B1518] py-1.5 px-3 rounded-xl hover:bg-gray-100 transition-colors -ml-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Continue Shopping</span>
        </button>

        <div className="text-xs font-bold text-gray-900">
          Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
        </div>
      </div>



      {wishlistItems.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto text-center py-16 px-4 bg-[#FAF8F5] rounded-3xl border border-gray-100 space-y-5">
          <div className="w-20 h-20 bg-[#F8F0F0] rounded-full flex items-center justify-center mx-auto text-[#6B1518]">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore our sarees, dresses, and fabrics. Click the heart icon on any product to save it here for later!
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-8 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-colors"
          >
            <span>Browse Products Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Main Wishlist Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="relative aspect-4/5 cursor-pointer bg-gray-50 overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-md hover:bg-white transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {item.discount && (
                    <span className="absolute top-3 left-3 bg-[#D3923A] text-[#6B1518] font-bold text-[10px] px-2 py-0.5 rounded">
                      {item.discount}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#D3923A] uppercase tracking-wider block">
                      {item.subcategory || item.category}
                    </span>
                    <h3
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="font-serif font-bold text-sm text-gray-900 hover:text-[#6B1518] cursor-pointer line-clamp-1 mt-0.5"
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-extrabold text-sm text-[#6B1518]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      {item.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.oldPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Clear Wishlist Button */}
          {clearWishlist && (
            <div className="text-right pt-2">
              <button
                onClick={clearWishlist}
                className="text-xs text-gray-500 hover:text-red-600 font-semibold underline"
              >
                Clear Entire Wishlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
