import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Tag, Heart, Award, CheckCircle2, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { InstagramIcon } from '../components/BrandIcons';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import CategoryTile from '../components/CategoryTile';
import { BRAND } from '../config/brand';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, categories, banners, loading } = useStoreData();

  const activeBanners = banners.filter((b) => b.active);
  const sliderImages = activeBanners.length > 0
    ? activeBanners.map((b) => b.image)
    : ['/slider/image.png', '/slider/image copy 2.png'];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, [sliderImages.length]);

  const featuredProducts = products.filter(p => p.isFeatured || p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.rating >= 4.5 && !p.isNew).slice(0, 4);
  const trendingProducts = [...products].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0)).slice(0, 4);

  const instagramPosts = [
    { id: 1, image: "/products/generic-product.png" },
    { id: 2, image: "/products/generic-product.png" },
    { id: 3, image: "/products/generic-product.png" },
    { id: 4, image: "/products/generic-product.png" },
    { id: 5, image: "/products/generic-product.png" },
    { id: 6, image: "/products/generic-product.png" },
    { id: 7, image: "/products/generic-product.png" }
  ];

  const customerReviews = [
    { id: 1, name: "Sneha Reddy", location: "Hyderabad", text: "Absolutely loved the Banarasi tissue saree! The quality is amazing for the price.", rating: 5 },
    { id: 2, name: "Priya Kumar", location: "Bangalore", text: "The sarees are so elegant and affordable. Fast delivery too!", rating: 5 },
    { id: 3, name: "Anjali Rao", location: "Chennai", text: "Best place to buy fabric for custom stitching. Very unique collections.", rating: 4 },
    { id: 4, name: "Kavya Menon", location: "Kochi", text: "I bought a Manipuri kota saree and it looks so premium. Highly recommended.", rating: 5 },
    { id: 5, name: "Divya Sharma", location: "Mumbai", text: "Great customer service on WhatsApp. They helped me choose the right fit.", rating: 5 },
    { id: 6, name: "Meera Patel", location: "Ahmedabad", text: "The dress collection has so many cute options! Will definitely shop again.", rating: 4 },
    { id: 7, name: "Lakshmi Iyer", location: "Pune", text: "Very happy with the jandani pure cotton set. It looks exactly like the pictures.", rating: 5 },
    { id: 8, name: "Shruti Desai", location: "Delhi", text: "The dresses are very comfortable and stylish. Perfect for daily wear.", rating: 5 },
    { id: 9, name: "Nandini Verma", location: "Jaipur", text: "Good quality materials and honest pricing just like they promised.", rating: 4 },
    { id: 10, name: "Geetha Krishnan", location: "Vijayawada", text: `${BRAND.name} never disappoints. My go-to store for affordable fashion.`, rating: 5 },
  ];

  return (
    <div className="pb-12 space-y-8 sm:space-y-12">
      {/* 1. HERO SECTION (IMAGE SLIDER) */}
      <section className="w-full">
        <div
          onClick={() => navigate('/shop')}
          className="relative overflow-hidden w-full aspect-[1.85/1] sm:aspect-auto sm:h-[480px] md:h-[560px] lg:h-[640px] bg-[#FAF5EE] cursor-pointer group"
        >
          {sliderImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-contain sm:object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          ))}
          {/* Slider Indicators */}
          <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2">
            {sliderImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-6 bg-[#D3923A]' : 'w-2 bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY ("EXPLORE OUR COLLECTIONS") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 mb-12 sm:mb-16" data-aos="fade-up">
        {/* Centered Premium Header with Side Lines (Always Visible on Mobile) */}
        <div className="text-center space-y-1.5 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A] shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> BROWSE BY CATEGORY
            </span>
            <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
          </div>
          <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-[#6B1518] uppercase tracking-wider">
            EXPLORE OUR COLLECTIONS
          </h2>
        </div>

        {/* 2-column grid, wraps inline — no horizontal scroll */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <CategoryTile
              key={cat.id}
              category={cat}
              variant="compact"
              onClick={() => navigate(`/shop?category=${cat.id}`)}
            />
          ))}
        </div>

        <div className="flex justify-center pt-1">
          <button
            onClick={() => navigate('/categories')}
            className="bg-[#F8F0F0] hover:bg-[#EADEDF] text-[#6B1518] text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            View All Categories →
          </button>
        </div>
      </section>

      <div className="space-y-12 sm:space-y-16">
      {/* 4. FEATURED PRODUCTS / NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-8" data-aos="fade-up">
        {/* Centered Premium Header with Side Lines */}
        <div className="text-center space-y-1.5 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A] shrink-0">
              Fresh Styles Just Added
            </span>
            <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
          </div>
          <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-[#6B1518] uppercase tracking-wider">
            New Arrivals
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        <div className="flex justify-center pt-1">
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#F8F0F0] hover:bg-[#EADEDF] text-[#6B1518] text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            View All New Arrivals →
          </button>
        </div>
      </section>

      {/* 4.5 BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8" data-aos="fade-up">
        {/* Centered Premium Header with Side Lines */}
        <div className="text-center space-y-1.5 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A] shrink-0">
              <Award className="w-3.5 h-3.5" /> Customer Favourites
            </span>
            <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
          </div>
          <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-[#6B1518] uppercase tracking-wider">
            Best Sellers
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* 4.7 TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8" data-aos="fade-up">
        {/* Centered Premium Header with Side Lines */}
        <div className="text-center space-y-1.5 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A] shrink-0">
              <TrendingUp className="w-3.5 h-3.5" /> Trending Now
            </span>
            <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#D3923A]/60 to-[#D3923A] shrink-0"></span>
          </div>
          <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-[#6B1518] uppercase tracking-wider">
            Trending Products
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BRAND INTRODUCTION */}
      <section className="max-w-4xl mx-auto text-center px-4 space-y-4" data-aos="fade-up">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A]">Welcome to {BRAND.name}</span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Bringing You Elegance, Quality & Honest Pricing
        </h2>
        <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
          Founded by <strong className="text-gray-900">{BRAND.ownerFullName}</strong>, {BRAND.name} was built on a simple belief: <em>everyone deserves to wear beautiful, high-quality fashion without paying high prices.</em> From graceful sarees and beautiful ethnic wear to stylish contemporary outfits, we curate every piece with care.
        </p>
      </section>

      {/* 7. WHY CHOOSE SRI VASTRALAYA */}
      <section className="bg-[#FAF8F5] py-12 border-y border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="flex items-center justify-center gap-3 w-full max-w-2xl mx-auto px-4">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D3923A]/50 to-[#D3923A]"></span>
            <div className="text-center shrink-0 space-y-0.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D3923A] block">The {BRAND.name} Promise</span>
              <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-wider">WHY SHOP WITH US?</h2>
            </div>
            <span className="flex-1 h-px bg-gradient-to-l from-transparent via-[#D3923A]/50 to-[#D3923A]"></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F8F0F0] text-[#6B1518] flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">Quality Products</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                We select fabrics and accessories combining everyday durability, elegance, and soft comfort.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F8F0F0] text-[#6B1518] flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">Affordable Prices</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fashion should be accessible. We offer honest, direct pricing without high retail markups.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F8F0F0] text-[#6B1518] flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">Elegant Designs</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Carefully picked traditional motifs, modern colors, and trendy accessories to make you shine.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F8F0F0] text-[#6B1518] flex items-center justify-center font-bold">
                04
              </div>
              <h4 className="font-serif font-bold text-lg text-gray-900">For Every Occasion</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Whether for daily wear, festive poojas, weddings, or gifting, find perfect picks right here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INSTAGRAM SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
        <div className="text-center space-y-1">
          <InstagramIcon className="w-6 h-6 text-[#6B1518] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-gray-900">FOLLOW US ON INSTAGRAM</h3>
          <p className="text-xs font-semibold text-[#D3923A]">{BRAND.instagramHandle}</p>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 hide-scroll snap-x">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square w-40 sm:w-48 lg:w-56 shrink-0 snap-start rounded-xl overflow-hidden group">
              <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <InstagramIcon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-3xl font-bold text-[#1a202c]">WHAT OUR CUSTOMERS SAY</h2>
          <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
        </div>

        <div className="overflow-hidden relative w-full pt-2 pb-6">
          <div className="animate-marquee gap-4 sm:gap-6 pb-2">
            {/* First Set */}
            {customerReviews.map((review) => (
              <div key={`set1-${review.id}`} className="w-72 sm:w-80 shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col space-y-4 hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic flex-1">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#F8F0F0] text-[#6B1518] flex items-center justify-center font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate Set for infinite loop */}
            {customerReviews.map((review) => (
              <div key={`set2-${review.id}`} className="w-72 sm:w-80 shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col space-y-4 hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic flex-1">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#F8F0F0] text-[#6B1518] flex items-center justify-center font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL MAROON CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="bg-[#6B1518] rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A]">Discover Your Style</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Find Your Perfect Style Today</h2>
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
              Explore our latest saree drapings, womenswear, and fabrics. Simple ordering and direct WhatsApp assistance!
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#D3923A] hover:bg-[#B37C31] text-[#6B1518] px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2 transform hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOP NOW</span>
            </button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
