"use client";
import { useState, useRef } from 'react';
import { 
    Heart, MessageSquare, Bookmark, Share2, ArrowUp, ArrowDown, 
    ChevronLeft, ChevronRight, ShoppingCart 
} from 'lucide-react';
import UserProfile from './UserProfile';
import Image from 'next/image';

export default function ContentItem({ content, onNext, onPrev }: any) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const mediaItems = [
        { type: 'video', url: content.video },
        ...content.images.map((img: string) => ({ type: 'image', url: img }))
    ];

    console.log(content);

    const handleNextSlide = () => {
        if (currentSlide < mediaItems.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onNext();
            setCurrentSlide(0);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        } else {
            onPrev();
            setCurrentSlide(mediaItems.length - 1);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    return (
        <div className="relative h-screen max-h-[90vh] bg-black rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
                {mediaItems[currentSlide].type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={mediaItems[currentSlide].url}
                        className="h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        onClick={togglePlay}
                    />
                ) : (
                    <img
                        src={mediaItems[currentSlide].url}
                        // width={100}
                        // height={100}
                        alt={content.name}
                        className="h-full w-full object-contain bg-black"
                    />
                )}
                
                <div className="absolute inset-0 flex items-center justify-between p-4">
                    <button 
                        onClick={handlePrevSlide}
                        className="p-2 rounded-full bg-black/50 text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={handleNextSlide}
                        className="p-2 rounded-full bg-black/50 text-white"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
                
                <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-2">
                    {mediaItems.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 rounded-full ${currentSlide === index ? 'bg-white w-4' : 'bg-gray-500 w-2'}`}
                        />
                    ))}
                </div>
            </div>
        
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-white">
                    <h3 className="font-bold text-lg">{content.name}</h3>
                    <p className="text-sm line-clamp-2">{content.description}</p>
                    <div className="flex items-center mt-2">
                        <span className="font-bold">${content.basePrice}</span>
                        {content.discount > 0 && (
                            <span className="ml-2 text-sm line-through text-gray-300">
                                ${(content.basePrice / (1 - content.discount/100)).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        
            <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-4">
                <UserProfile userId={content.userId} />
                
                <button 
                    onClick={() => setLiked(!liked)}
                    className="flex flex-col items-center"
                >
                    <Heart 
                        size={24} 
                        fill={liked ? 'red' : 'none'} 
                        color={liked ? 'red' : 'white'} 
                    />
                    <span className="text-white text-xs mt-1">24.5K</span>
                </button>
                
                <button className="flex flex-col items-center">
                    <MessageSquare size={24} color="white" />
                    <span className="text-white text-xs mt-1">1.2K</span>
                </button>
                
                <button 
                    onClick={() => setSaved(!saved)}
                    className="flex flex-col items-center"
                >
                    <Bookmark 
                        size={24} 
                        fill={saved ? 'white' : 'none'} 
                        color="white" 
                    />
                </button>
                
                <button className="flex flex-col items-center">
                    <Share2 size={24} color="white" />
                </button>
                
                <button className="flex flex-col items-center bg-emerald-500 p-2 rounded-full">
                    <ShoppingCart size={20} color="white" />
                </button>
            </div>
        </div>
    );
}