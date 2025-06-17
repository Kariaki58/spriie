"use client";
import { useState, useRef, useEffect } from 'react';
import { 
    Heart, MessageSquare, Bookmark, Share2, 
    ShoppingCart, Play, Pause, 
    Minus,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"



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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [qty, setQty] = useState(1);

    const { data: session } = useSession();


    console.log(session);
    
    const mediaItems = [
        { type: 'video', url: product.video },
        ...product.images.map((img: string) => ({ type: 'image', url: img }))
    ];

    const togglePlayPause = () => {
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
    };

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

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollLeft;
            const itemWidth = container.clientWidth;
            const newIndex = Math.round(scrollPosition / itemWidth);
            setCurrentMediaIndex(newIndex);
        }
    };

    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setIsDragging(true);
        setStartX(clientX);
        if (scrollContainerRef.current) {
            setScrollLeft(scrollContainerRef.current.scrollLeft);
        }
    };

    const duringDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const walk = (clientX - startX) * 2;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const endDrag = () => {
        setIsDragging(false);
    };

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

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        container.addEventListener('mouseup', endDrag);
        container.addEventListener('mousemove', duringDrag as any);
        container.addEventListener('mouseleave', endDrag);
        container.addEventListener('touchend', endDrag);
        container.addEventListener('touchmove', duringDrag as any);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('mouseup', endDrag);
            container.removeEventListener('mousemove', duringDrag as any);
            container.removeEventListener('mouseleave', endDrag);
            container.removeEventListener('touchend', endDrag);
            container.removeEventListener('touchmove', duringDrag as any);
        };
    }, [isDragging, startX, scrollLeft]);

    return (
        <div className="h-[100vh] w-full max-w-md mx-auto bg-black relative overflow-hidden snap-start">
            <div 
                ref={scrollContainerRef}
                className="relative h-full w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                onMouseDown={startDrag}
                onTouchStart={startDrag}
            >
                {mediaItems.map((media, index) => (
                    <div 
                        key={index} 
                        className="flex-shrink-0 w-full h-full snap-center relative group"
                        onMouseEnter={() => media.type === 'video' && setShowPlayButton(true)}
                        onMouseLeave={() => media.type === 'video' && setShowPlayButton(false)}
                        onTouchStart={() => media.type === 'video' && setShowPlayButton(true)}
                    >
                        {media.type === 'video' ? (
                            <>
                                <video
                                    ref={index === 0 ? videoRef : null}
                                    src={media.url}
                                    className="h-full w-full object-cover"
                                    loop
                                    playsInline
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
                                    } group-hover:opacity-100`}
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
                                loading="lazy"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-10">
                {mediaItems.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentMediaIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentMediaIndex ? 'w-4 bg-white' : 'w-2 bg-gray-500 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            <div className="absolute bottom-23 left-0 right-0 p-4 z-10 w-[80%]">
                <div className="text-white">
                    <div className="flex items-center mb-2">
                        <span className="font-bold text-3xl">${product.basePrice}</span>
                            {product.discount > 0 && (
                        <span className="ml-2 text-sm line-through text-gray-300">
                            ${(product.basePrice / (1 - product.discount/100)).toFixed(2)}
                        </span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                    <p className="text-sm line-clamp-2">{product.description}</p>
                </div>
            </div>
            <button>
                view more
            </button>

            <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <Link href="/profile">
                            <img 
                                src={session?.user.image} 
                                alt="User profile" 
                                className="w-full h-full rounded-full object-cover"
                                loading="lazy"
                            />
                        </Link>
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
                    <MessageSquare size={24} color="white" fill='white' />
                    <span className="text-white text-xs mt-1">1.2K</span>
                </button>

                <button 
                    onClick={() => setSaved(!saved)}
                    className="flex flex-col items-center"
                    aria-label={saved ? "Remove from saved" : "Save item"}
                >
                    <Bookmark 
                        size={24} 
                        fill={saved ? 'green' : 'white'} 
                        color="white" 
                    />
                </button>

                <button 
                    className="flex flex-col items-center"
                    aria-label="Share product"
                >
                    <Share2 size={24} color="white" />
                </button>
                <Drawer>
                    <div>
                        <DrawerTrigger asChild>
                            <button
                                className="flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md p-3 rounded-2xl w-16 h-16"
                                aria-label="Add to cart"
                            >
                                <ShoppingCart size={20} color="white" />
                                <span className="text-xs font-semibold text-white">Buy</span>
                            </button>
                        </DrawerTrigger>
                    </div>
                    <DrawerContent>
                        <div className="mx-auto w-full max-w-sm px-4 pb-6">
                            <DrawerHeader>
                                <DrawerTitle className="text-xl font-semibold">You're buying</DrawerTitle>
                                <p className="text-sm text-muted-foreground">Review your selection and proceed.</p>
                            </DrawerHeader>

                            <div className="flex gap-4 items-center border p-3 rounded-lg shadow-sm bg-white my-4">
                                <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-md border" />
                                <div className="flex flex-col">
                                <p className="font-semibold text-base truncate">{product.name}</p>
                                <p className="text-sm text-gray-500">${product.basePrice}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center my-4">
                                <span className="text-sm">Quantity</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="border rounded-full w-8 h-8 flex items-center justify-center">-</button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(qty + 1)} className="border rounded-full w-8 h-8 flex items-center justify-center">+</button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-lg font-bold my-4">
                                <span>Total</span>
                                <span>${(product.basePrice * qty).toFixed(2)}</span>
                            </div>

                            <DrawerFooter>
                                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium">
                                    Continue to Checkout
                                </button>
                                <DrawerClose asChild>
                                    <button className="w-full bg-gray-200 text-gray-700 py-2 mt-2 rounded-md hover:bg-gray-300 transition">
                                        Keep exploring
                                    </button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
                {/* <button
                    className="flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md p-3 rounded-2xl w-16 h-16"
                    aria-label="Add to cart"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <ShoppingCart size={20} color="white" />
                    <span className="text-xs font-semibold text-white">Buy</span>
                </button> */}
            </div>
        </div>
    );
}