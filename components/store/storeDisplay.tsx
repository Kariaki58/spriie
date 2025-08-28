"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Heart,
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronRight,
  Star,
  ChevronDown,
  Share2
} from "lucide-react";

export default function StoreDisplay({ store }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Handle scroll within the component
  useEffect(() => {
    const scrollContainer = document.getElementById('store-scroll-container');
    if (scrollContainer) {
      const handleWheel = (e: WheelEvent) => {
        if (scrollContainer) {
          scrollContainer.scrollTop += e.deltaY;
        }
      };
      
      scrollContainer.addEventListener('wheel', handleWheel);
      
      return () => {
        scrollContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  if (!store || !store.storeName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  const {
    storeName,
    colors,
    banner,
    logo,
    description,
    address,
    phone,
    email,
    openingHours,
    social,
    about,
    faq,
    products,
    category
  } = store;

  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div 
      id="store-scroll-container"
      className="h-screen overflow-y-auto bg-gray-50"
      style={{ 
        '--primary': colors.primary, 
        '--secondary': colors.secondary, 
        '--accent': colors.accent 
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logo} alt={storeName} className="h-10 w-10 object-contain" />
              <span className="ml-2 text-xl font-bold" style={{ color: colors.primary }}>{storeName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                className={`font-medium ${activeCategory === "All" ? 'border-b-2' : 'text-gray-600 hover:text-gray-900'}`}
                style={{ borderColor: activeCategory === "All" ? colors.primary : 'transparent' }}
                onClick={() => setActiveCategory("All")}
              >
                All
              </button>
              {category.map((cat: string) => (
                <button
                  key={cat}
                  className={`font-medium ${activeCategory === cat ? 'border-b-2' : 'text-gray-600 hover:text-gray-900'}`}
                  style={{ borderColor: activeCategory === cat ? colors.primary : 'transparent' }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Search size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Heart size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <ShoppingCart size={20} />
              </button>
              <button className="md:hidden p-2" onClick={toggleMenu}>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-2">
              <button
                className="block py-2 text-gray-600 hover:text-gray-900 w-full text-left"
                onClick={() => {
                  setActiveCategory("All");
                  setIsMenuOpen(false);
                }}
              >
                All
              </button>
              {category.map((cat: string) => (
                <button
                  key={cat}
                  className="block py-2 text-gray-600 hover:text-gray-900 w-full text-left"
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsMenuOpen(false);
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        
        <img
          src={banner}
          alt={storeName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{storeName}</h1>
            <p className="text-lg md:text-xl max-w-2xl">{description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Products Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Our Products</h2>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md">
                      <Heart size={18} className="text-gray-600" />
                    </button>
                    {product.discountedPrice < product.basePrice && (
                      <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: colors.accent }}>
                        {Math.round(((product.basePrice - product.discountedPrice) / product.basePrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {renderStars(product.averageRating || 0)}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discountedPrice < product.basePrice ? (
                          <>
                            <span className="font-bold text-lg" style={{ color: colors.primary }}>${product.discountedPrice}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">${product.basePrice}</span>
                          </>
                        ) : (
                          <span className="font-bold text-lg" style={{ color: colors.primary }}>${product.basePrice}</span>
                        )}
                      </div>
                      <button className="p-2 rounded-full" style={{ backgroundColor: colors.primary }}>
                        <ShoppingCart size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available yet.</p>
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">About Us</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700">{about}</p>
          </div>
        </section>

        {/* Store Info */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${colors.primary}20` }}>
                <MapPin size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-sm text-gray-600">{address}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${colors.primary}20` }}>
                <Phone size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm text-gray-600">{phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${colors.primary}20` }}>
                <Mail size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-gray-600">{email}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${colors.primary}20` }}>
                <Clock size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="font-semibold">Opening Hours</h3>
                <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {faq && faq.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {faq.map((item: any, index: number) => (
                <div key={index} className="border-b last:border-b-0">
                  <button className="flex justify-between items-center w-full p-4 text-left font-medium">
                    <span>{item.question}</span>
                    <ChevronDown size={20} className="text-gray-500" />
                  </button>
                  <div className="p-4 pt-0 text-gray-600">
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Social Media */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Follow Us</h2>
          <div className="flex space-x-4">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-600 text-white"
              >
                <Facebook size={24} />
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-400 text-white"
              >
                <Twitter size={24} />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-pink-600 text-white"
              >
                <Instagram size={24} />
              </a>
            )}
            {social.googleMaps && (
              <a
                href="#map"
                className="p-3 rounded-full bg-red-600 text-white"
              >
                <MapPin size={24} />
              </a>
            )}
          </div>
        </section>

        {/* Google Maps Section */}
       {social.googleMaps && (
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Our Location</h2>
                <div className="w-full bg-white rounded-lg shadow-md p-4">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                    <div
                    className="absolute top-0 left-0 w-full h-full"
                    dangerouslySetInnerHTML={{ __html: social.googleMaps }}
                    />
                </div>
                </div>
            </section>
        )}


      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={logo} alt={storeName} className="h-8 w-8 object-contain mr-2" />
                <span className="text-xl font-bold">{storeName}</span>
              </div>
              <p className="text-gray-400">{description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#products" className="text-gray-400 hover:text-white">Products</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <MapPin size={16} className="mr-2" />
                  {address}
                </li>
                <li className="flex items-center text-gray-400">
                  <Phone size={16} className="mr-2" />
                  {phone}
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail size={16} className="mr-2" />
                  {email}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}