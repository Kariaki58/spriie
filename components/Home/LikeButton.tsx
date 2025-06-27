"use client";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function LikeButton({ 
  productId, 
  initialLikes, 
  initiallyLiked 
}: {
  productId: string;
  initialLikes: number;
  initiallyLiked: boolean;
}) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);

  // Verify the like status when session changes or on mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session?.user?.id) {
        setLiked(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/product/likes/check?productId=${productId}`);
        const data = await res.json();
        if (res.ok) {
            console.log({data})
          setLiked(data.liked);
        }
      } catch (error) {
        console.error("Error checking like status", error);
      }
    };

    checkLikeStatus();
  }, [productId, session]);

  const formatLikeCount = (count: number): string => {
    if (count >= 1000000000) return `${(count / 1000000000).toFixed(1)}B`;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleToggleLike = async () => {
    if (loading || !session?.user?.id) return;
    setLoading(true);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes(wasLiked ? likes - 1 : likes + 1);

    try {
      const res = await fetch("/api/product/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Revert if error
        setLiked(wasLiked);
        setLikes(wasLiked ? likes : likes - 1);
        console.error(data.error || "Failed to toggle like");
      }
    } catch (error) {
      // Revert if error
      setLiked(wasLiked);
      setLikes(wasLiked ? likes : likes - 1);
      console.error("Error toggling like", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleLike}
      className="flex flex-col like-button items-center"
      aria-label={liked ? "Unlike" : "Like"}
      disabled={loading || !session?.user?.id}
    >
      <Heart
        size={24} 
        fill={liked ? 'red' : 'none'}
        color={liked ? 'red' : 'white'}
        className={loading ? 'opacity-70' : ''}
      />
      <span className="text-white text-xs mt-1">
        {formatLikeCount(likes)}
      </span>
    </button> 
  );
}