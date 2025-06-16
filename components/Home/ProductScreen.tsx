"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Heart, MessageSquare, Bookmark, Share2, 
    ShoppingCart, Play, Pause 
} from 'lucide-react';

export default function ProductScreen({ product, isActive }: any) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    
    const mediaItems = [
        { type: 'video', url: product.video },
        ...product.images.map((img: string) => ({ type: 'image', url: img }))
    ];

    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.log("Play failed:", e));
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, []);

    // Handle autoplay when component becomes active
    useEffect(() => {
        if (!videoRef.current) return;
        
        if (isActive && currentMediaIndex === 0) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.log("Autoplay prevented:", e));
            setShowPlayButton(false);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, currentMediaIndex]);

    // Handle scroll to update current media index
    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollLeft;
            const itemWidth = container.clientWidth;
            const newIndex = Math.round(scrollPosition / itemWidth);
            setCurrentMediaIndex(newIndex);
        }
    }, []);

    // Touch and drag handling
    const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e) {
            // For touch events, check if it's a vertical swipe first
            setTouchStartY(e.touches[0].clientY);
        }
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setIsDragging(true);
        setStartX(clientX);
        if (scrollContainerRef.current) {
            setScrollLeft(scrollContainerRef.current.scrollLeft);
        }
    }, []);

    const duringDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        
        // Prevent default for touch events to avoid page scroll
        if ('touches' in e) {
            const touchY = e.touches[0].clientY;
            // If vertical movement is more significant than horizontal, cancel the drag
            if (Math.abs(touchY - touchStartY) > 10) {
                setIsDragging(false);
                return;
            }
            e.preventDefault();
        }

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const walk = (clientX - startX) * 2;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    }, [isDragging, scrollLeft, startX, touchStartY]);

    const endDrag = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Snap to current media index
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = container.clientWidth;
            container.scrollTo({
                left: itemWidth * currentMediaIndex,
                behavior: 'smooth'
            });
        }
    }, [currentMediaIndex]);

    // Event listeners setup
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        container.addEventListener('mouseup', endDrag);
        container.addEventListener('mousemove', duringDrag as any);
        container.addEventListener('mouseleave', endDrag);
        container.addEventListener('touchend', endDrag);
        container.addEventListener('touchmove', duringDrag as any, { passive: false });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('mouseup', endDrag);
            container.removeEventListener('mousemove', duringDrag as any);
            container.removeEventListener('mouseleave', endDrag);
            container.removeEventListener('touchend', endDrag);
            container.removeEventListener('touchmove', duringDrag as any);
        };
    }, [handleScroll, duringDrag, endDrag]);

    // Handle video play/pause on media change
    useEffect(() => {
        if (!videoRef.current) return;
        
        if (currentMediaIndex === 0) {
            if (isActive) {
                videoRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => console.log("Autoplay prevented:", e));
            }
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [currentMediaIndex, isActive]);

    return (
        <div className="h-[100dvh] w-full bg-black relative overflow-hidden snap-start touch-none">
            {/* Media Carousel */}
            <div 
                ref={scrollContainerRef}
                className="relative h-full w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x"
                onMouseDown={startDrag}
                onTouchStart={startDrag}
            >
                {mediaItems.map((media, index) => (
                    <div 
                        key={index} 
                        className="flex-shrink-0 w-full h-full snap-center relative"
                        onTouchStart={() => media.type === 'video' && setShowPlayButton(true)}
                        onTouchEnd={() => setTimeout(() => setShowPlayButton(false), 2000)}
                    >
                        {media.type === 'video' ? (
                            <>
                                <video
                                    ref={index === 0 ? videoRef : null}
                                    src={media.url}
                                    className="h-full w-full object-cover"
                                    loop
                                    playsInline
                                    muted
                                    poster={product.thumbnail}
                                    onClick={togglePlayPause}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlayPause();
                                    }}
                                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full transition-opacity duration-300 ${
                                        showPlayButton ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    aria-label={isPlaying ? "Pause video" : "Play video"}
                                >
                                    {isPlaying ? (
                                        <Pause size={32} color="white" fill="white" />
                                    ) : (
                                        <Play size={32} color="white" fill="white" />
                                    )}
                                </button>
                            </>
                        ) : (
                            <img
                                src={media.url}
                                alt={product.name}
                                className="h-full w-full object-contain bg-black"
                                loading={index < 3 ? "eager" : "lazy"} // Only lazy load images beyond the first 3
                                decoding="async"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2 z-10 px-4">
                {mediaItems.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentMediaIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentMediaIndex ? 'w-4 bg-white' : 'w-2 bg-gray-500'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Product Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="text-white">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm line-clamp-2">{product.description}</p>
                    <div className="flex items-center mt-2">
                        <span className="font-bold">${product.basePrice}</span>
                        {product.discount > 0 && (
                            <span className="ml-2 text-sm line-through text-gray-300">
                                ${(product.basePrice / (1 - product.discount/100)).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Action Buttons */}
            <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                        <img 
                            src={product.thumbnail} 
                            alt="User profile" 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <span className="text-white text-xs mt-1">@{product.userId.slice(-4)}</span>
                </div>

                <button 
                    onClick={() => setLiked(!liked)}
                    className="flex flex-col items-center"
                    aria-label={liked ? "Unlike" : "Like"}
                >
                    <Heart 
                        size={24} 
                        fill={liked ? 'red' : 'white'} 
                        color={liked ? 'red' : 'white'} 
                    />
                    <span className="text-white text-xs mt-1">24.5K</span>
                </button>

                <button 
                    className="flex flex-col items-center"
                    aria-label="View comments"
                >
                    <MessageSquare size={24} color="white" />
                    <span className="text-white text-xs mt-1">1.2K</span>
                </button>

                <button 
                    onClick={() => setSaved(!saved)}
                    className="flex flex-col items-center"
                    aria-label={saved ? "Remove from saved" : "Save item"}
                >
                    <Bookmark 
                        size={24} 
                        fill={saved ? 'green' : 'transparent'} 
                        color="white" 
                    />
                </button>

                <button 
                    className="flex flex-col items-center"
                    aria-label="Share product"
                >
                    <Share2 size={24} color="white" />
                </button>

                <button 
                    className="flex flex-col items-center bg-emerald-500 p-2 rounded-full"
                    aria-label="Add to cart"
                >
                    <ShoppingCart size={20} color="white" />
                </button>
            </div>
        </div>
    );
}