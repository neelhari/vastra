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
  ChevronLeft,
  ChevronDown,
  MapPin,
  Plus,
  Minus,
  RotateCcw,
  Award,
  Play,
  Film,
  ExternalLink,
  ArrowLeft,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Zap,
  AlertTriangle,
  XCircle
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
  const { addToCart, buyNow } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const product = products.find((p) => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  // Zoom Lightbox State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTapTimeRef = useRef(0);
  const pinchDistRef = useRef(null);

  // Mobile Swipe Gesture State
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isHorizontalSwipe = useRef(false);
  const videoRef = useRef(null);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="text-gray-500 text-sm">This item may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
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

  const nextMedia = () => {
    setActiveMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    resetZoom();
  };

  const prevMedia = () => {
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    resetZoom();
  };

  const scrollToMedia = (idx) => {
    setActiveMediaIndex(idx);
    resetZoom();
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (!isHorizontalSwipe.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      if (Math.abs(dx) > Math.abs(dy)) {
        isHorizontalSwipe.current = true;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!isHorizontalSwipe.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dt = Date.now() - touchStartRef.current.time;

    if (Math.abs(dx) > 35 || (Math.abs(dx) > 20 && dt < 250)) {
      if (dx < 0) {
        nextMedia();
      } else {
        prevMedia();
      }
    }
  };

  // Zoom Lightbox Handlers
  const resetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomScale((s) => Math.min(3.5, s + 0.5));
  };

  const handleZoomOut = () => {
    setZoomScale((s) => {
      const next = Math.max(1, s - 0.5);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleImageDoubleTap = () => {
    if (zoomScale > 1) {
      resetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  const handleLightboxTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        handleImageDoubleTap();
      }
      lastTapTimeRef.current = now;

      if (zoomScale > 1) {
        isDraggingRef.current = true;
        dragStartRef.current = {
          x: e.touches[0].clientX - panOffset.x,
          y: e.touches[0].clientY - panOffset.y,
        };
      } else {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: now };
      }
    }
  };

  const handleLightboxTouchMove = (e) => {
    if (e.touches.length === 2 && pinchDistRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / pinchDistRef.current;
      setZoomScale((prev) => Math.min(3.5, Math.max(1, prev * ratio)));
      pinchDistRef.current = dist;
    } else if (e.touches.length === 1 && isDraggingRef.current && zoomScale > 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleLightboxTouchEnd = (e) => {
    pinchDistRef.current = null;
    isDraggingRef.current = false;
    if (zoomScale === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      if (Math.abs(dx) > 40) {
        if (dx < 0) nextMedia();
        else prevMedia();
      }
    }
  };

  const isOutOfStock = product?.stock !== undefined && Number(product.stock) <= 0;
  const isLowStock = !isOutOfStock && product?.stock !== undefined && Number(product.stock) > 0 && Number(product.stock) <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, isSaree ? null : selectedSize);
  };

  // Buy Now: Sets exact quantity in cart to avoid the 1 -> 2, 2 -> 4 jumping bug,
  // and navigates directly to checkout as requested by user.
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    buyNow(product, quantity, isSaree ? null : selectedSize);
    navigate('/checkout');
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
      {/* Top Back Navigation (Replacing clunky breadcrumbs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#6B1518] py-1 px-2.5 rounded-lg hover:bg-gray-100 transition-colors -ml-2.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Back</span>
        </button>
        {categoryMeta && (
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {categoryMeta.name}
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-12">
          {/* 1. Media Gallery (Photos + 3-4s Motion Video) */}
          <div>
            <div className="relative">
              {/* Stable, gesture-driven touch carousel with zero vertical jitter */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#FAF5EE] select-none touch-pan-y shadow-xs"
              >
                <div
                  className="flex w-full h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${activeMediaIndex * 100}%)` }}
                >
                  {mediaItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full h-full shrink-0 relative bg-black/5 flex items-center justify-center overflow-hidden"
                    >
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
                          <span className="absolute top-3 left-3 bg-[#D3923A] text-[#6B1518] font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-md z-10">
                            <Play className="w-3 h-3 fill-current" /> 3-4s Drape Motion Video
                          </span>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full relative flex items-center justify-center cursor-zoom-in group"
                          onClick={() => setIsZoomOpen(true)}
                        >
                          <img
                            src={item.src}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover select-none"
                            loading={idx === 0 ? "eager" : "lazy"}
                            draggable={false}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Left & Right Arrow Chevrons */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevMedia();
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all z-20 cursor-pointer active:scale-95"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4.5 h-4.5 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextMedia();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all z-20 cursor-pointer active:scale-95"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4.5 h-4.5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Tap to Zoom indicator pill */}
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs shadow-xs z-20 cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#D3923A]" />
                  <span>Tap to Zoom</span>
                </button>

                {/* Counter Badge */}
                {mediaItems.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs z-20">
                    {activeMediaIndex + 1} / {mediaItems.length}
                  </span>
                )}

                {/* Pagination Dots */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {mediaItems.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToMedia(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          activeMediaIndex === idx ? 'w-5 bg-[#6B1518]' : 'w-1.5 bg-white/70 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Discount Badge */}
              {product.discount && (
                <span className="absolute top-3 left-3 bg-[#6B1518] text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-xs z-20">
                  {product.discount}
                </span>
              )}

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors z-20 cursor-pointer ${
                  isLiked ? 'bg-white text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
              </button>

              {/* Video Quick Jump Pill if video is attached */}
              {videoIndex !== -1 && (
                <button
                  type="button"
                  onClick={() => scrollToMedia(videoIndex)}
                  className="absolute top-12 left-3 bg-[#6B1518]/90 hover:bg-[#6B1518] text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform active:scale-95 z-20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#D3923A]" />
                  <span>3-4s Drape Video</span>
                </button>
              )}
            </div>

            {/* Desktop Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 mt-4">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToMedia(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 relative cursor-pointer ${
                      activeMediaIndex === idx ? 'border-[#6B1518] ring-1 ring-[#6B1518]' : 'border-transparent opacity-70 hover:opacity-100'
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
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                  <XCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" /> Only {product.stock} Left in Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              )}
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
              {isOutOfStock ? (
                <div className="w-full bg-gray-100 border border-gray-200 text-gray-500 py-3.5 rounded-xl font-bold text-sm text-center cursor-not-allowed">
                  Currently Out of Stock
                </div>
              ) : (
                <>
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
                </>
              )}
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

      {/* Sticky Mobile Bottom Bar (sits flush at bottom with safe area padding) */}
      <div
        className="fixed left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden shadow-lg flex items-center gap-3"
        style={{ bottom: 0, paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {isOutOfStock ? (
          <div className="w-full bg-gray-100 border border-gray-200 text-gray-500 py-3 rounded-xl font-bold text-xs text-center cursor-not-allowed">
            Currently Out of Stock
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-white hover:bg-gray-50 text-[#6B1518] border-2 border-[#6B1518] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#D3923A] fill-[#D3923A]" />
              <span>Buy Now</span>
            </button>
          </>
        )}
      </div>


      {/* Fullscreen Interactive Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none animate-fadeIn backdrop-blur-sm">
          {/* Lightbox Top Navigation Bar */}
          <div className="p-3 sm:p-4 flex items-center justify-between text-white z-20 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setIsZoomOpen(false);
                  resetZoom();
                }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white"
                title="Close Viewer"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold truncate text-gray-200">
                  {product.name}
                </h4>
                <p className="text-[10px] text-gray-400">
                  {activeMediaIndex + 1} of {mediaItems.length} • {zoomScale > 1 ? `${Math.round(zoomScale * 100)}% Zoom (Drag to Pan)` : 'Double-tap or pinch to zoom'}
                </p>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold text-gray-300 w-10 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 3.5}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  className="px-2 py-1 rounded-lg bg-[#6B1518] hover:bg-[#831A1D] text-white text-[10px] font-bold transition-colors cursor-pointer ml-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Lightbox Main Image Display Area */}
          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {mediaItems[activeMediaIndex].type === 'video' ? (
              <div className="w-full max-w-2xl max-h-[80vh] flex items-center justify-center">
                <video
                  src={mediaItems[activeMediaIndex].src}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className="max-h-[80vh] max-w-full rounded-xl"
                />
              </div>
            ) : (
              <img
                src={mediaItems[activeMediaIndex].src}
                alt={product.name}
                style={{
                  transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                  transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out',
                }}
                className="max-h-[85vh] max-w-full object-contain pointer-events-auto"
                draggable={false}
              />
            )}

            {/* Left / Right Nav Arrows inside Lightbox */}
            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevMedia();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer active:scale-95 border border-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextMedia();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer active:scale-95 border border-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails & Hint */}
          <div className="p-3 bg-black/50 border-t border-white/10 backdrop-blur-md z-20 space-y-2">
            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-xl mx-auto py-1">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToMedia(idx)}
                  className={`w-12 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeMediaIndex === idx ? 'border-[#D3923A] ring-2 ring-[#D3923A]/50 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white text-[9px] font-bold">
                      ▶ Video
                    </div>
                  ) : (
                    <img src={item.src} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-400">
              Pinch or double-tap to inspect fabric details & embroidery • Swipe left/right to browse
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
