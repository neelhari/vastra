import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  MessageCircle,
  Check,
  ShieldCheck,
  Truck,
  ChevronRight,
  ChevronDown,
  MapPin,
  Plus,
  RotateCcw,
  Award,
  Play,
  Film,
  ExternalLink
} from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { BRAND, waLink } from '../config/brand';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories } = useStoreData();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated, openLoginModal } = useAuth();

  const product = products.find((p) => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const galleryRef = useRef(null);
  const videoRef = useRef(null);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="text-gray-500 text-sm">This item may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-2"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const categoryMeta = categories.find((c) => c.id === product.category);
  const isSaree =
    product.category?.toLowerCase() === 'sarees' ||
    product.category?.toLowerCase().includes('saree') ||
    product.name?.toLowerCase().includes('saree');

  // Build Media Items (Photos + Video)
  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const mediaItems = [];

  // Add photos
  rawImages.forEach((img) => {
    if (img) mediaItems.push({ type: 'image', src: img });
  });

  // If video exists, add as media slide
  if (product.video) {
    mediaItems.push({ type: 'video', src: product.video });
  }

  const videoIndex = mediaItems.findIndex((m) => m.type === 'video');

  const scrollToMedia = (idx) => {
    setActiveMediaIndex(idx);
    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: idx * galleryRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleGalleryScroll = () => {
    if (galleryRef.current) {
      const scrollPos = galleryRef.current.scrollLeft;
      const width = galleryRef.current.clientWidth;
      const index = Math.round(scrollPos / width);
      if (index >= 0 && index < mediaItems.length) {
        setActiveMediaIndex(index);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, isSaree ? null : selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, isSaree ? null : selectedSize);
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setDeliveryEstimate({
        date: 'Estimated Delivery in 3-5 Business Days',
        cod: true,
        freeShipping: product.price >= 1499,
      });
    } else {
      setDeliveryEstimate({
        error: 'Please enter a valid 6-digit Pincode',
      });
    }
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pb-28 xl:pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-3 pb-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#6B1518] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link to="/shop" className="hover:text-[#6B1518] transition-colors">Shop</Link>
        {categoryMeta && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <Link to={`/shop?category=${categoryMeta.id}`} className="hover:text-[#6B1518] transition-colors">
              {categoryMeta.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-[#6B1518] font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-12">
          {/* 1. Media Gallery (Photos + 3-4s Motion Video) */}
          <div>
            <div className="relative">
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scroll aspect-[4/5] md:rounded-2xl md:overflow-hidden bg-[#FAF5EE]"
              >
                {mediaItems.map((item, idx) => (
                  <div key={idx} className="w-full h-full shrink-0 snap-start relative bg-black/5 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video
                          ref={videoRef}
                          src={item.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-[#D3923A] text-[#6B1518] font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Play className="w-3 h-3 fill-current" /> 3-4s Drape Motion Video
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Discount Badge */}
              {product.discount && (
                <span className="absolute top-3 left-3 bg-[#6B1518] text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-xs">
                  {product.discount}
                </span>
              )}

              {/* Wishlist Heart Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  isLiked ? 'bg-white text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
              </button>

              {/* Video Quick Jump Pill if video is attached */}
              {videoIndex !== -1 && (
                <button
                  onClick={() => scrollToMedia(videoIndex)}
                  className="absolute bottom-3 left-3 bg-[#6B1518]/90 hover:bg-[#6B1518] text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#D3923A]" />
                  <span>3-4s Drape Video</span>
                </button>
              )}

              {mediaItems.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {activeMediaIndex + 1} / {mediaItems.length}
                </span>
              )}
            </div>

            {/* Desktop Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 mt-4">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToMedia(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 relative ${
                      activeMediaIndex === idx ? 'border-[#6B1518]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white">
                        <Play className="w-5 h-5 text-[#D3923A] fill-current" />
                        <span className="text-[8px] font-bold text-gray-200">Video</span>
                      </div>
                    ) : (
                      <img src={item.src} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product Information Details */}
          <div className="space-y-4 px-4 sm:px-0 pt-4 md:pt-0">
            <div>
              <span className="text-[10px] tracking-widest font-bold text-[#D3923A] uppercase">
                {product.brand || BRAND.name.toUpperCase()}
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 leading-snug mt-0.5">
                {product.name}
              </h1>
            </div>

            {/* Ratings & Stock Status */}
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                {product.rating || '4.8'} <Star className="w-3 h-3 fill-white" />
              </span>
              <span className="text-gray-500 font-medium">{product.reviewsCount || 12} Ratings</span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" /> In Stock
              </span>
            </div>

            {/* Price Row */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through font-medium">
                    ₹{product.oldPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount && (
                  <span className="text-sm text-emerald-600 font-extrabold">{product.discount}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">Inclusive of all taxes. Free shipping across India.</p>
            </div>

            {/* External Video Demonstration Link if provided */}
            {product.videoUrl && (
              <a
                href={product.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#6B1518] bg-[#FAF8F5] border border-[#EADEDF] hover:bg-[#F8F0F0] px-4 py-2.5 rounded-xl transition-colors"
              >
                <Film className="w-4 h-4 text-[#6B1518]" />
                <span>Watch Video Demonstration on YouTube / Instagram</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
            )}

            {/* Sizes Selection — strictly for non-saree stitched garments */}
            {!isSaree && product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">Select Size</span>
                  <button
                    onClick={() => alert("Size Guide:\nFree Size: Fits all standard drape styles\nS: 36 | M: 38 | L: 40 | XL: 42 | XXL: 44")}
                    className="text-[#6B1518] font-bold text-[11px] hover:underline"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        selectedSize === sz
                          ? 'bg-[#6B1518] text-white border-[#6B1518] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white hover:bg-gray-50 text-[#6B1518] border-2 border-[#6B1518] py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#6B1518]" /> Check Delivery Availability
              </span>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#6B1518]"
                />
                <button
                  type="submit"
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Check
                </button>
              </form>

              {deliveryEstimate && (
                <div className="text-xs space-y-1">
                  {deliveryEstimate.error ? (
                    <p className="text-red-600 font-semibold">{deliveryEstimate.error}</p>
                  ) : (
                    <div className="space-y-1 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl">
                      <p className="font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" /> {deliveryEstimate.date}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        Cash on Delivery Available • Easy 7-Day Returns
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clothing Specifications Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 space-y-3">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Product Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Fabric</span>
                  <span className="font-bold text-gray-800">{product.fabric || 'Pure Cotton / Handloom'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Weave / Work</span>
                  <span className="font-bold text-gray-800">{product.material || 'Zari Embroidery'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Occasion</span>
                  <span className="font-bold text-gray-800">{product.occasion || 'Festive / Wedding'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Care</span>
                  <span className="font-bold text-gray-800">{product.careInstructions || 'Dry Clean Only'}</span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="space-y-1.5 pt-2">
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">About the Product</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6 px-4 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">You May Also Like</h2>
                <p className="text-xs text-gray-500">More curated pieces from {categoryMeta?.name || 'our collection'}</p>
              </div>
              <Link to={`/shop?category=${product.category}`} className="text-xs font-bold text-[#6B1518] hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bottom Bar — sits just above the persistent MobileBottomNav
          (which is also fixed bottom-0 at the same z-index), not on top of it.
          Offset accounts for the nav's own safe-area-inset-bottom padding too. */}
      <div
        className="fixed left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 sm:hidden shadow-lg flex items-center gap-3"
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-white text-[#6B1518] border-2 border-[#6B1518] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-[#6B1518] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
