"use client";
import { useState, useEffect, useRef } from 'react';
import ProductScreen from './ProductScreen';
import { Heart } from 'lucide-react';

export interface Product {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    discount: number;
    video: string;
    images: string[];
    thumbnail: string;
    userId: string;
}

export type ContentFeedProps = {
  products: Product[];
};

export default function ContentFeed({ products }: ContentFeedProps) {
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartYRef = useRef(0);
    const [showHeart, setShowHeart] = useState(false);
    const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
    const isAnimatingRef = useRef(false);

    const changeProductIndex = (newIndex: number) => {
        if (isAnimatingRef.current || newIndex < 0 || newIndex >= products.length) return;
        
        isAnimatingRef.current = true;
        setCurrentProductIndex(newIndex);
        
        // Allow animation to complete before accepting new changes
        setTimeout(() => {
            isAnimatingRef.current = false;
        }, 500);
    };

    const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        if (!products.length || isAnimatingRef.current) return;

        if (e.deltaY > 0) {
            changeProductIndex(currentProductIndex + 1);
        } else {
            changeProductIndex(currentProductIndex - 1);
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (isAnimatingRef.current) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartYRef.current;

        if (Math.abs(deltaY) > 100) {
            if (deltaY > 0) {
                changeProductIndex(currentProductIndex - 1);
            } else {
                changeProductIndex(currentProductIndex + 1);
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
    }, [products, currentProductIndex]);

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

            {products?.map((product, index) => (
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