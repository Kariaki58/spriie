"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Grid3X3, 
  Play, 
  Image, 
  Heart, 
  ShoppingBag,
  Sparkles,
  Filter,
  ChevronDown,
  X,
  Pause
} from 'lucide-react';
import NavigationBar from '@/components/app-ui/Navigation';

interface Product {
  _id: string;
  title: string;
  discountedPrice: number;
  description: string;
  video: string;
  images: string[];
  thumbnail: string;
  likes: number;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface ApiResponse {
  message: Product[];
}

export default function ExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/content');
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const data: ApiResponse = await response.json();
        setProducts(data.message || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query and category
  const filteredProducts = products.filter(product =>
    (product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === 'all' || true)
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'price-low') return a.discountedPrice - b.discountedPrice;
    if (sortBy === 'price-high') return b.discountedPrice - a.discountedPrice;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-400">Discovering amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-gray-700 backdrop-blur-lg rounded-2xl border border-gray-700/30">
          <p className="text-red-400 mb-4 text-lg">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br text-black">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          
          {/* Search Bar */}
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products, brands, and creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3  border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 backdrop-blur-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={18} className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          
          {/* Categories */}
          <div className="flex overflow-x-auto mt-4 pb-2 scrollbar-hide">
            <div className="flex space-x-2">
              {['all', 'trending', 'new', 'discounted', 'popular'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                    selectedCategory === category 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Sort Options */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end">
        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-gray-700 border text-white border-gray-700/30 rounded-xl pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-32">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-2xl mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No products found</p>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaUrl = product.video || product.images[0] || product.thumbnail;
  const isVideo = !!product.video;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered && isVideo) {
      video.currentTime = 0;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Video play failed:", err);
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isHovered, isVideo]);

  return (
    <div 
      className="group relative bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/20 transition-all duration-500 hover:border-green-400/30 hover:shadow-2xl hover:shadow-green-400/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product._id}`}>
        <div className="aspect-square relative overflow-hidden">
          {/* Media thumbnail with shimmer effect */}
          {!imageLoaded && !isVideo && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse z-10"></div>
          )}
          
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={product.video}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                poster={product.thumbnail}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play size={40} fill="white" color="white" className="opacity-80" />
                </div>
              )}
            </>
          ) : (
            <img
              src={mediaUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onLoad={() => setImageLoaded(true)}
            />
          )}
          
          {/* Media type indicator */}
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md text-white p-2 rounded-lg">
            {isVideo ? (
              <Play size={16} fill="white" />
            ) : (
              <Image size={16} />
            )}
          </div>
          
          {/* Like count */}
          <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center">
            <Heart size={14} fill="currentColor" className="text-red-400 mr-1" />
            <span className="text-xs font-medium">{product.likes}</span>
          </div>

          {/* Price tag */}
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg">
            <span className="text-sm font-semibold">₦{product.discountedPrice.toLocaleString()}</span>
          </div>

          {/* Hover overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              <h3 className="font-semibold text-white truncate">{product.title}</h3>
              <p className="text-gray-300 text-sm mt-1 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center mt-3">
                <div className="w-6 h-6 rounded-full bg-gray-600 mr-2 overflow-hidden flex items-center justify-center">
                  {product.userId.avatar ? (
                    <img 
                      src={product.userId.avatar} 
                      alt={product.userId.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-white">
                      {product.userId.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-300">@{product.userId.name.split(' ')[0]}</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}