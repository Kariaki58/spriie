"use client";
import { useState, useRef, useEffect } from 'react';
import { 
    Heart, MessageSquare, Bookmark, Share2, 
    ShoppingCart, Play, Pause, 
    Minus, CreditCard,
    Plus,
    ArrowRight,
    Eye,
    ChevronUp,
    ChevronDown
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
} from "@/components/ui/drawer";
import Image from 'next/image';



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
    const [showFullDescription, setShowFullDescription] = useState(false);
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

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

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
                    <div className="relative">
                        <p className={`text-sm ${showFullDescription ? '' : 'line-clamp-2'}`}>
                            {product.description}
                        </p>
                        {product.description.length > 100 && (
                            <button 
                                onClick={toggleDescription}
                                className="text-emerald-300 text-xs font-medium flex items-center mt-1"
                            >
                                {showFullDescription ? (
                                    <>
                                        <ChevronUp size={14} className="mr-1" /> Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={14} className="mr-1" /> Read more
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <button>
                view more
            </button>

            <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <Link href="/profile">

                            <Image 
                                src={!session?.user?.image ? '/default.jpg': session?.user.image} 
                                alt="User profile"
                                width={100}
                                height={100}
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
                    <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
                        <DrawerContent className="max-h-[90vh]">
                            <div className="mx-auto w-full max-w-sm px-4 pb-6 overflow-y-auto">
                                <DrawerHeader>
                                    <DrawerTitle className="text-xl font-bold text-gray-800">Complete Your Purchase</DrawerTitle>
                                    <DrawerDescription className="text-gray-600">
                                        Review your selection before proceeding
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="flex gap-4 items-center border border-gray-200 p-4 rounded-xl bg-white my-4 shadow-sm">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-lg font-bold text-emerald-600">${product.basePrice}</span>
                                            {product.discount > 0 && (
                                                <span className="ml-2 text-sm line-through text-gray-500">
                                                    ${(product.basePrice / (1 - product.discount/100)).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="my-4">
                                    <p className="text-gray-700 mb-2">Description</p>
                                    <div className="relative">
                                        <p className={`text-sm ${showFullDescription ? '' : 'line-clamp-2'}`}>
                                            {product.description}
                                        </p>
                                        {product.description.length > 100 && (
                                            <button 
                                                onClick={toggleDescription}
                                                className="text-emerald-300 text-xs font-medium flex items-center mt-1"
                                            >
                                                {showFullDescription ? (
                                                    <>
                                                        <ChevronUp size={14} className="mr-1" /> Show less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown size={14} className="mr-1" /> Read more
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center my-6">
                                    <span className="text-gray-700 font-medium">Quantity</span>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setQty(Math.max(1, qty - 1))} 
                                            className="border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-medium">{qty}</span>
                                        <button 
                                            onClick={() => setQty(qty + 1)} 
                                            className="border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mb-6">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-gray-700">Total</span>
                                        <span className="text-emerald-600">${(product.basePrice * qty).toFixed(2)}</span>
                                    </div>
                                </div>

                                <DrawerFooter className="px-0">
                                    <div className='flex flex-col gap-3'>
                                        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3 rounded-xl font-semibold transition-all shadow-md">
                                            <CreditCard className="w-5 h-5" />
                                            Proceed to Checkout
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl font-semibold transition-all shadow-md">
                                            <ShoppingCart className="w-5 h-5" />
                                            Add to Cart
                                        </button>
                                    </div>
                                    <DrawerClose asChild>
                                        <div className='flex gap-3 mt-4'>
                                            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors text-sm">
                                                <ArrowRight className="w-4 h-4" />
                                                Explore More
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm">
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </DrawerClose>
                                </DrawerFooter>
                            </div>
                        </DrawerContent>
                    </div>
                </Drawer>
            </div>
        </div>
    );
}