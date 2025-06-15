"use client";
import { useState, useEffect, useRef } from 'react';
import ProductScreen from './ProductScreen';


export default function ContentFeed() {
    const [products, setProducts] = useState<any[]>([]);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const container = containerRef.current;
        
        if (container) {
            container.addEventListener('wheel', handleScroll, { passive: false });
            return () => container.removeEventListener('wheel', handleScroll);
        }
    }, [products]);

    if (products.length === 0) {
        return <div className="flex-1 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden snap-y snap-mandatory mt-10"
        >
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
                    />
                </div>
            ))}
        </div>
    );
}