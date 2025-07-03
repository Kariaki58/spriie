"use client";
import { 
    Home, 
    Search, 
    Compass, 
    Heart, 
    Users, 
    LayoutDashboard, 
    ShoppingCart, 
    MessageSquare,
    User,
    ChevronLeft,
    ChevronRight,
    X,
    Menu
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomeLeftBar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    const menuItems = [
        { icon: <Home className="w-5 h-5" />, name: "For You", href: "/" },
        { icon: <Compass className="w-5 h-5" />, name: "Explore", href: "/explore" },
        { icon: <Heart className="w-5 h-5" />, name: "Following", href: "/following" },
        { icon: <Users className="w-5 h-5" />, name: "Friends", href: "/friends" },
        { 
          icon: <LayoutDashboard className="w-5 h-5" />, 
          name: "Dashboard", 
          href: session?.user?.role === "seller" ? "/vendor" : "/user" 
        },
        { icon: <ShoppingCart className="w-5 h-5" />, name: "Cart", href: "/cart" },
        { icon: <MessageSquare className="w-5 h-5" />, name: "Chat", href: "/chat" },
        { icon: <User className="w-5 h-5" />, name: "Profile", href: "/profile" },
    ];

    useEffect(() => {
        setIsMounted(true);
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        setIsOpen(!mobile);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsOpen(!mobile);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted || !isMobile) return;

        const handleClickOutside = (e: MouseEvent) => {
            const sidebar = document.querySelector('aside');
            if (sidebar && !sidebar.contains(e.target as Node)) {
                setIsOpen(false);
                setShowSearchInput(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isMounted]);

    const handleSearchClick = () => {
        if (!isOpen) {
            setIsOpen(true);
            setTimeout(() => {
                document.getElementById('search-input')?.focus();
            }, 100);
        }
        setShowSearchInput(true);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Search submitted:", searchQuery);
        setSearchQuery('');
        setShowSearchInput(false);
        if (isMobile) setIsOpen(false);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        setShowSearchInput(false);
    };

    return (
        <aside className={`
            fixed lg:relative hidden sm:block top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out 
            bg-gradient-to-b from-emerald-800 to-emerald-900
            border-r border-emerald-700/50 shadow-lg lg:shadow-none text-white
            ${isOpen ? 'w-64' : 'w-20'}
        `}>
            <div className="h-full flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    {isOpen && (
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-white">
                            Spriie
                        </h1>
                    )}
                    <button 
                        onClick={toggleSidebar}
                        className="p-2 rounded-full hover:bg-emerald-600/50 text-white"
                        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isOpen ? (
                            isMobile ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
                
                {/* Search Bar - Always visible when expanded */}
                {isOpen && (
                    <div className="mb-6">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 text-emerald-300 w-4 h-4" />
                                <input
                                    id="search-input"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-emerald-700/50 border border-emerald-500/30 text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                    autoFocus={showSearchInput}
                                />
                            </div>
                        </form>
                    </div>
                )}

                <nav className="flex-1">
                    <ul className="space-y-2">
                        {/* Search button for collapsed state */}
                        {!isOpen && (
                            <li>
                                <button
                                    onClick={handleSearchClick}
                                    className="w-full flex items-center justify-center p-3 rounded-lg transition-colors hover:bg-emerald-600/50 relative"
                                    onMouseEnter={() => setHoveredItem("Search")}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Search className="w-5 h-5 text-emerald-200" />
                                    {hoveredItem === "Search" && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-emerald-800 text-white text-sm rounded-md whitespace-nowrap shadow-lg border border-emerald-700/50">
                                            Search
                                        </div>
                                    )}
                                </button>
                            </li>
                        )}

                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <div
                                        className={`
                                            w-full flex items-center p-3 rounded-lg transition-colors
                                            hover:bg-emerald-600/50 relative
                                            ${isOpen ? 'justify-start space-x-4' : 'justify-center'}
                                        `}
                                        onMouseEnter={() => setHoveredItem(item.name)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <span className="text-emerald-200">{item.icon}</span>
                                        {isOpen && <span className="font-medium text-sm text-white">{item.name}</span>}
                                    
                                        {!isOpen && hoveredItem === item.name && (
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-emerald-800 text-white text-sm rounded-md whitespace-nowrap shadow-lg border border-emerald-700/50">
                                                {item.name}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}