"use client";

import { useState, useEffect } from "react";
import { 
    Home, 
    Search,
    AlignLeft,
    Compass, 
    Heart, 
    Users, 
    LayoutDashboard, 
    ShoppingCart, 
    MessageSquare, 
    User,
    X,
    ChevronRight
} from 'lucide-react';

export default function TopNavigation() {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, name: "For You" },
    { icon: <Compass className="w-5 h-5" />, name: "Explore" },
    { icon: <Heart className="w-5 h-5" />, name: "Following" },
    { icon: <Users className="w-5 h-5" />, name: "Friends" },
    { icon: <LayoutDashboard className="w-5 h-5" />, name: "Dashboard" },
    { icon: <ShoppingCart className="w-5 h-5" />, name: "Cart" },
    { icon: <MessageSquare className="w-5 h-5" />, name: "Chat" },
    { icon: <User className="w-5 h-5" />, name: "Profile" },
  ];

  const handleSearchClick = () => {
    setShowSearch(true);
    setShowMenu(false);
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    setShowSearch(false);
  };

  const closeAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowMenu(false);
    setShowSearch(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchValue); // ✅ Use input value here
    // You could also trigger an API call or route change here
    // closeAll(); // ✅ Close the search after submitting
  };


  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-72 text-white z-50 transform transition-all duration-300 ease-in-out bg-gradient-to-b from-emerald-700 overflow-y-auto to-emerald-800 shadow-xl ${
          showMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-white">
              Menu
            </h2>
            <button 
              onClick={closeAll}
              className="p-1 rounded-full hover:bg-emerald-600 transition-colors"
            >
              <X className="text-white w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-3">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    className={`
                      w-full flex items-center px-4 py-2 rounded-xl transition-all
                      hover:bg-emerald-600/50 hover:shadow-md
                      active:scale-95 group
                      ${showMenu ? "opacity-100" : "opacity-0"}
                    `}
                    style={{ transitionDelay: showMenu ? `${menuItems.indexOf(item) * 50}ms` : '0ms' }}
                  >
                    <span className="mr-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                    <ChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-emerald-600/50">
            <div className="text-emerald-200 text-sm">
              © 2023 Your App. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {(showMenu || showSearch) && (
        <div
          className="fixed inset-0 z-40 animate-fadeIn"
          onClick={closeAll}
        />
      )}

      {/* Top Navigation */}
      <nav className={`fixed sm:hidden top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'py-2 bg-emerald-800/90 backdrop-blur-md shadow-md' : 'py-4 bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between relative"> {/* Added relative positioning */}
            {/* Left side - Menu button (same as before) */}
            <button
              onClick={handleMenuClick}
              className={`p-2 rounded-full transition-all ${showSearch ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} hover:bg-emerald-700/50`}
            >
              <AlignLeft className="text-white w-6 h-6" />
            </button>

            {/* Center - Search input when active */}
            <div className="absolute left-1/2 transform -translate-x-1/2"> {/* Centered absolutely */}
              {showSearch ? (
                <form onSubmit={handleSubmit} className="flex items-center w-[90vw] max-w-lg bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-emerald-400/30 transition-all duration-300 animate-fadeIn">
                  <Search className="text-emerald-200 mr-1 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)} // ✅ Update state on input
                    className="flex-1 bg-transparent text-white placeholder-emerald-200/70 outline-none text-lg"
                    autoFocus
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAll();
                    }}
                    type="button" // ✅ Make this button type="button" to prevent form submit
                    className="ml-1 p-1 rounded-full hover:bg-emerald-700/50 transition-colors"
                  >
                    <X className="text-emerald-200 w-5 h-5" />
                  </button>
                </form>
              ) : (
                <div className={`transition-opacity ${showSearch ? 'opacity-0' : 'opacity-100'}`}>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-white">
                    Spriie
                  </h1>
                </div>
              )}
            </div>

            {/* Right side - Search button (same as before) */}
            <button
              onClick={handleSearchClick}
              className={`p-2 rounded-full transition-all ${showSearch ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} hover:bg-emerald-700/50`}
            >
              <Search className="text-white w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}