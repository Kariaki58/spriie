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
import { useState, useEffect } from 'react';

export default function HomeLeftBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    const menuItems = [
        { icon: <Home className="w-5 h-5" />, name: "For You" },
        { icon: <Search className="w-5 h-5" />, name: "Search" },
        { icon: <Compass className="w-5 h-5" />, name: "Explore" },
        { icon: <Heart className="w-5 h-5" />, name: "Following" },
        { icon: <Users className="w-5 h-5" />, name: "Friends" },
        { icon: <LayoutDashboard className="w-5 h-5" />, name: "Dashboard" },
        { icon: <ShoppingCart className="w-5 h-5" />, name: "Cart" },
        { icon: <MessageSquare className="w-5 h-5" />, name: "Chat" },
        { icon: <User className="w-5 h-5" />, name: "Profile" },
    ];

    useEffect(() => {
        setIsMounted(true);
        setIsMobile(window.innerWidth < 1024);
        setIsOpen(window.innerWidth >= 1024);
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
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isMounted]);

    const handleSearchClick = () => {
        if (!isOpen) {
            setIsOpen(true);
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                searchInput?.focus();
            }, 100);
        }
        setShowSearchInput(true);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Search submitted:", searchQuery);
        setSearchQuery('');
        if (isMobile) {
            setIsOpen(false);
        }
        setShowSearchInput(false);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            setShowSearchInput(false);
        }
    };

    return (
        <aside className={`
            lg:relative hidden sm:block top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out 
            bg-gradient-to-b from-emerald-800 to-emerald-900
            border-r border-emerald-700/50 shadow-lg lg:shadow-none text-white
            ${isOpen ? 'w-64' : 'w-20'}
        `}>
            <div className="h-full flex flex-col p-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-full hover:bg-emerald-600/50 mb-4 self-end lg:self-start text-white"
                    aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isOpen ? (
                        isMobile ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>
                
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                {item.name === "Search" ? (
                                    <div className="relative">
                                        {isOpen && showSearchInput ? (
                                        <form onSubmit={handleSearchSubmit} className="w-full">
                                            <div className="relative flex items-center">
                                            <input
                                                id="search-input"
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search..."
                                                className="w-full pl-4 pr-10 py-2 text-sm rounded-lg bg-emerald-700/50 border border-emerald-500/30 text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                className="absolute right-2 text-emerald-300 hover:text-white"
                                                aria-label="Search"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                            </div>
                                        </form>
                                        ) : (
                                        <button
                                            onClick={handleSearchClick}
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
                                        </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
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
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}