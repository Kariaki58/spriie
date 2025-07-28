"use client";
import { useState, useRef, useEffect } from 'react';
import { 
    Heart, Bookmark, Share2, 
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
    const [lastTap, setLastTap] = useState(0);
    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const lastTapRef = useRef(0);

    const { data: session } = useSession();


    console.log(session);
    
    const mediaItems = [
        { type: 'video', url: product.video },
        ...product.images.map((img: string) => ({ type: 'image', url: img }))
    ];

    // const togglePlayPause = () => {
    //     if (videoRef.current) {
    //         if (videoRef.current.paused) {
    //             videoRef.current.play()
    //             .then(() => setIsPlaying(true))
    //             .catch(e => console.log("Play failed:", e));
    //         } else {
    //             videoRef.current.pause();
    //             setIsPlaying(false);
    //         }
    //     }
    // };

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused || video.ended) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch((err) => {
                console.log("Play failed:", err);
                });
            }
        } else {
            video.pause();
            setIsPlaying(false);
        }
        };




    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive && currentMediaIndex === 0) {
            // video.muted = true;
            const playPromise = video.play();
            if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch((err) => {
                console.log("Autoplay blocked on mobile:", err);
                setIsPlaying(false);
                });
            }
        } else {
            video.pause();
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

    const handleLike = () => {
        // Find the like button in the DOM and click it
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

    const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapRef.current;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            e.preventDefault();
            handleLike();
            showHeartAnimation();
        }
        lastTapRef.current = currentTime;
    };


    const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapRef.current;
        
        if (tapLength < 300 && tapLength > 0) {
            handleLike();
            showHeartAnimation();
            lastTapRef.current = 0; // Reset after successful double-tap
        } else {
            lastTapRef.current = currentTime;
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
                onClick={handleTap}
            >
                {showHeart && <HeartAnimation onAnimationEnd={handleAnimationEnd} />}

                {mediaItems.map((media, index) => (
                    <div 
                        key={index} 
                        className="flex-shrink-0 w-full h-full snap-center relative group"
                        onMouseEnter={() => media.type === 'video' && setShowPlayButton(true)}
                        onMouseLeave={() => media.type === 'video' && setShowPlayButton(false)}
                        // onTouchStart={() => media.type === 'video' && setShowPlayButton(true)}
                        // onDoubleClick={handleDoubleTap}
                        onTouchEnd={handleDoubleTap}
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
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        togglePlayPause();
                                    }}
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
            <button>
                view more
            </button>

            <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 z-10">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <Link href={session?.user?.id === product.userId._id ? '/profile' : `/profile/${product.userId._id}`}>

                            <img 
                                src={product.userId.avatar || "/default.jpg"} 
                                alt="User profile"
                                // width={100}
                                // height={100}
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


                <CommentsDrawer productId={product._id} commentCount={50}/>

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