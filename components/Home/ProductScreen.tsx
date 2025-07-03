"use client";
import { useState, useRef, useEffect } from 'react';
import { 
    Heart, MessageSquare, Bookmark, Share2, 
    Play, Pause, 
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import BuyDrawer from './buy-drawer';
import CommentsDrawer from './comment-drawer';
import LikeButton from './LikeButton';

export interface Product {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    discount: number;
    video: string;
    images: string[];
    thumbnail: string;
    like: number;
    likedBy: string[];
    userId: string;
}

export interface BuyDrawerProps {
    product: Product;
    showFullDescription: boolean;
    toggleDescription: () => void;
    setQty: (qty: number) => void;
    qty: number;
}

function HeartAnimation({ onAnimationEnd }: { onAnimationEnd: () => void }) {
    return (
        <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            onAnimationEnd={onAnimationEnd}
        >
            <div className="heart-animation">
                <Heart size={80} fill="red" color="red" />
            </div>
        </div>
    );
}

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
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [qty, setQty] = useState(1);
    const [showHeart, setShowHeart] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [autoSlide, setAutoSlide] = useState(false);

    const { data: session } = useSession();

    const mediaItems = [
        { type: 'video', url: product.video },
        ...product.images.map((img: string) => ({ type: 'image', url: img }))
    ];

    const togglePlayPause = () => {
        if (!videoRef.current) return;
        
        if (videoRef.current.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
            return;
        }

        if (videoRef.current.paused) {
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(error => {
                        console.log("Playback failed:", error);
                        videoRef.current?.load();
                        setIsPlaying(false);
                    });
            }
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    // Slider auto-advance functionality
    useEffect(() => {
        if (autoSlide && mediaItems.length > 1) {
            sliderIntervalRef.current = setInterval(() => {
                setCurrentMediaIndex(prev => (prev + 1) % mediaItems.length);
            }, 5000);
        }
        return () => {
            if (sliderIntervalRef.current) {
                clearInterval(sliderIntervalRef.current);
            }
        };
    }, [autoSlide, mediaItems.length]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const tryAutoplay = () => {
            if (isActive && currentMediaIndex === 0) {
                video.muted = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((e) => {
                        console.log("Autoplay prevented:", e);
                        setIsPlaying(false);
                    });
                }
            }
        };

        const handleCanPlay = () => {
            setIsVideoReady(true);
            tryAutoplay();
        };

        const handleError = () => {
            console.error("Video error:", video.error);
            setIsVideoReady(false);
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        video.preload = "metadata";

        tryAutoplay();

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            if (doubleTapTimeoutRef.current) {
                clearTimeout(doubleTapTimeoutRef.current);
            }
        };
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

    const handleLike = () => {
        const likeButton = document.querySelector('.like-button') as HTMLElement;
        if (likeButton) {
            likeButton.click();
        }
    };

    const handleAnimationEnd = () => {
        setShowHeart(false);
    };

    const showHeartAnimation = () => {
        setShowHeart(true);
    }

    const handleVideoTouch = (e: React.TouchEvent) => {
        e.stopPropagation();
        
        if (doubleTapTimeoutRef.current) {
            clearTimeout(doubleTapTimeoutRef.current);
            doubleTapTimeoutRef.current = null;
            return;
        }

        doubleTapTimeoutRef.current = setTimeout(() => {
            doubleTapTimeoutRef.current = null;
            togglePlayPause();
        }, 300);
    };

    const handleDoubleTap = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (doubleTapTimeoutRef.current) {
            clearTimeout(doubleTapTimeoutRef.current);
            doubleTapTimeoutRef.current = null;
        }
        
        handleLike();
        showHeartAnimation();
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
        setAutoSlide(true);
    };

    const goToSlide = (index: number) => {
        setCurrentMediaIndex(index);
        setAutoSlide(true);
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

    function formatNumberWithCommas(number: number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const initiallyLiked = session?.user?.id
    ? product.likedBy.map((id: string) => id).includes(session.user.id)
    : false;

    return (
        <div className="h-[100vh] w-full max-w-md mx-auto bg-black relative overflow-hidden snap-start">
            <div 
                ref={scrollContainerRef}
                className="relative h-full w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                onMouseDown={startDrag}
                onTouchStart={startDrag}
            >
                {showHeart && <HeartAnimation onAnimationEnd={handleAnimationEnd} />}

                {mediaItems.map((media, index) => (
                    <div 
                        key={index} 
                        className="flex-shrink-0 w-full h-full snap-center relative group"
                        onMouseEnter={() => media.type === 'video' && setShowPlayButton(true)}
                        onMouseLeave={() => media.type === 'video' && setShowPlayButton(false)}
                        onTouchStart={() => media.type === 'video' && setShowPlayButton(true)}
                        onDoubleClick={handleDoubleTap}
                    >
                        {media.type === 'video' ? (
                            <>
                                <video
                                    ref={index === 0 ? videoRef : null}
                                    src={media.url}
                                    className="h-full w-full object-cover"
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    poster={product.thumbnail}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlayPause();
                                    }}
                                    autoPlay
                                    onTouchStart={(e) => {
                                        e.stopPropagation();
                                        if (index === 0) {
                                            handleVideoTouch(e);
                                        }
                                    }}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    onDoubleClick={handleDoubleTap}
                                />
                                {(showPlayButton || !isPlaying) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePlayPause();
                                        }}
                                        onTouchEnd={(e) => {
                                            e.stopPropagation();
                                            togglePlayPause();
                                        }}
                                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full transition-opacity duration-300 ${
                                            showPlayButton || !isPlaying ? 'opacity-100' : 'opacity-0'
                                        } group-hover:opacity-100`}
                                        aria-label={isPlaying ? "Pause video" : "Play video"}
                                        disabled={!isVideoReady}
                                    >
                                        {isPlaying ? (
                                            <Pause size={32} color="white" fill="white" />
                                        ) : (
                                            <Play size={32} color="white" fill="white" />
                                        )}
                                    </button>
                                )}
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

            {/* Slider Indicators */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-10">
                {mediaItems.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentMediaIndex ? 'w-4 bg-white' : 'w-2 bg-gray-500 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Product Info */}
            <div className="absolute bottom-23 left-0 right-0 p-4 z-10 w-[80%]">
                <div className="text-white">
                    <div className="flex items-center mb-2">
                        <span className="font-bold text-3xl">₦{formatNumberWithCommas(product.basePrice)}</span>
                        {product.discount > 0 && (
                        <span className="ml-2 text-sm line-through text-gray-300">
                            ₦{formatNumberWithCommas(Number((product.basePrice / (1 - product.discount / 100)).toFixed(0)))}
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

            {/* Side Action Buttons */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <Link href={session?.user?.id === product.userId._id ? '/profile' : `/profile/${product.userId._id}`}>
                            <img 
                                src={product.userId.avatar} 
                                alt="User profile"
                                className="w-full h-full rounded-full object-cover"
                                loading="lazy"
                            />
                        </Link>
                    </div>
                    <span className="text-white text-xs mt-1">@{product.userId._id.slice(-4)}</span>
                </div>
                <LikeButton
                    productId={product._id}
                    initialLikes={product.likes}
                    initiallyLiked={initiallyLiked}
                    className="like-button"
                />

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
                <BuyDrawer product={product} showFullDescription={showFullDescription} toggleDescription={toggleDescription} setQty={setQty} qty={qty} />
            </div>
        </div>
    );
}