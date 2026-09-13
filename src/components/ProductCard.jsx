import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isLiked = isInWishlist(product.id);

  const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && Number(product.stock) > 0 && Number(product.stock) <= 3;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : '';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
    addToCart(product, 1, defaultColor, defaultSize);
    toast.success(`${product.name} added to bag`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : '';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
    buyNow(product, 1, defaultColor, defaultSize);
    navigate('/checkout', { state: { from: `/product/${product.id}` } });
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative"
    >
      {/* Image Box */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center p-2 text-center">
            <span className="bg-red-600/95 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low Stock Badge */}
        {isLowStock && (
          <span className="absolute bottom-2 left-2 z-10 bg-amber-600 text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
            Only {product.stock} Left!
          </span>
        )}

        {/* Video Badge */}
        {product.video && !isOutOfStock && (
          <span className="absolute top-2 left-2 z-10 bg-[#D3923A] text-[#6B1518] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
            ▶ Video
          </span>
        )}

        {/* NEW Badge */}
        {product.isNew && !product.video && !isOutOfStock && (
          <span className="absolute top-2 left-2 z-10 bg-[#6B1518] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs">
            NEW
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center z-10 shadow-sm transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {product.discount && !isOutOfStock && (
          <span className="absolute bottom-2 right-2 z-10 bg-[#6B1518] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            {product.discount}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-2.5 flex flex-col gap-1 flex-1 justify-between">
        <div>
          <span className="text-[9px] tracking-widest font-bold text-[#D3923A] uppercase block">
            {product.subcategory || product.category || BRAND.name.toUpperCase()}
          </span>

          <h3 className="text-xs sm:text-sm font-serif font-bold text-gray-900 line-clamp-1 group-hover:text-[#6B1518] transition-colors mt-0.5">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-gray-500 text-[10px] font-semibold">({product.reviewsCount || 12})</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 pt-1.5 border-t border-gray-50 mt-1">
          <span className="text-xs sm:text-base font-extrabold text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{product.oldPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart & Buy Now Actions */}
        <div className="flex items-center gap-1.5 pt-1">
          {isOutOfStock ? (
            <div className="w-full bg-gray-100 text-gray-400 border border-gray-200 text-[10px] sm:text-xs font-bold py-2 rounded-lg text-center cursor-not-allowed">
              Out of Stock
            </div>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                title="Add to Cart"
                className="flex-1 min-w-0 bg-white hover:bg-gray-50 text-[#6B1518] border border-[#6B1518] text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <ShoppingBag className="w-3 h-3 shrink-0" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                title="Buy Now"
                className="flex-1 min-w-0 bg-[#6B1518] hover:bg-[#4B0F11] text-white text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs transition-colors"
              >
                <Zap className="w-3 h-3 shrink-0 fill-current" />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
