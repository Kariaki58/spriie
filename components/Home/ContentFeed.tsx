"use client";
import { useState, useEffect, useRef } from 'react';
import ProductScreen from './ProductScreen';
import { Heart } from 'lucide-react';

export default function ContentFeed() {
    const [products, setProducts] = useState<any[]>([]);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartYRef = useRef(0);
    const [showHeart, setShowHeart] = useState(false);
    const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/content');
                const data = await res.json();
                setProducts(data.message);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        if (!products.length) return;

        if (e.deltaY > 0) {
            setCurrentProductIndex(prev => 
                Math.min(prev + 1, products.length - 1)
            );
        } else {
            setCurrentProductIndex(prev => Math.max(prev - 1, 0))
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartYRef.current;

        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                setCurrentProductIndex(prev => Math.max(prev - 1, 0));
            } else {
                setCurrentProductIndex(prev => 
                    Math.min(prev + 1, products.length - 1)
                );
            }
            touchStartYRef.current = touchY;
        }
    };

    const handleDoubleTap = (e: React.TouchEvent) => {
        const touch = e.touches[0] || e.changedTouches[0];
        setHeartPosition({
            x: touch.clientX,
            y: touch.clientY
        });
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
    };

    useEffect(() => {
        const container = containerRef.current;
        
        if (container) {
            container.addEventListener('wheel', handleScroll, { passive: false });
            container.addEventListener('touchstart', handleTouchStart as any, { passive: false });
            container.addEventListener('touchmove', handleTouchMove as any, { passive: false });
            
            return () => {
                container.removeEventListener('wheel', handleScroll);
                container.removeEventListener('touchstart', handleTouchStart as any);
                container.removeEventListener('touchmove', handleTouchMove as any);
            };
        }
    }, [products]);

    if (products.length === 0) {
        return <div className="flex-1 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden snap-y snap-mandatory touch-none"
        >
            {showHeart && (
                <div 
                    className="absolute z-50 text-red-500 animate-ping"
                    style={{
                        left: `${heartPosition.x - 24}px`,
                        top: `${heartPosition.y - 24}px`,
                    }}
                >
                    <Heart size={48} fill="red" />
                </div>
            )}

            {products.map((product, index) => (
                <div 
                    key={product._id}
                    className={`absolute inset-0 transition-transform duration-500 ease-in-out
                        ${index === currentProductIndex ? 'translate-y-0' : 
                        index < currentProductIndex ? '-translate-y-full' : 'translate-y-full'}`}
                >
                    <ProductScreen 
                        product={product} 
                        isActive={index === currentProductIndex}
                        onDoubleTap={handleDoubleTap}
                    />
                </div>
            ))}
        </div>
    );
}