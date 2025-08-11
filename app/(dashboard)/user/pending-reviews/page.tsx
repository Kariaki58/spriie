"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface PendingReviewItem {
  id: string;
  productId: string;
  orderId: string;
  productName: string;
  productImage: string;
  deliveredDate: string;
}

interface ReviewData {
  rating: number;
  comment: string;
  reviewImage?: string;
}

export default function PendingReviewDashboard() {
  const { data: session } = useSession();
  const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([]);
  const [reviewsData, setReviewsData] = useState<Record<string, ReviewData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      try {
        const response = await fetch('/api/reviews/pending');
        const data = await response.json();
        if (response.ok) {
          setPendingReviews(data.pendingReviews);
        } else {
          toast.error(data.error || "Failed to fetch pending reviews");
        }
      } catch (error) {
        toast.error("Failed to fetch pending reviews");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchPendingReviews();
    }
  }, [session]);

  const handleRatingChange = (productId: string, rating: number) => {
    setReviewsData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviewsData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }));
  };

  const handleImageUpload = async (productId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setReviewsData(prev => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            reviewImage: data.secure_url
          }
        }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const submitReview = async (productId: string) => {
    const review = reviewsData[productId];
    
    if (!review?.rating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const product = pendingReviews.find(p => p.productId === productId);
      if (!product) return;

      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          orderId: product.orderId,
          rating: review.rating,
          comment: review.comment,
          reviewImage: review.reviewImage
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setPendingReviews(prev => prev.filter(item => item.productId !== productId));
        setReviewsData(prev => {
          const newData = { ...prev };
          delete newData[productId];
          return newData;
        });
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const skipReview = (productId: string) => {
    toast.info("You can review this product later");
    setPendingReviews(prev => prev.filter(item => item.productId !== productId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Opinion Matters!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Share your experience with these products to help other shoppers make better decisions.
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            No pending reviews at the moment
          </h2>
          <p className="text-gray-500 mt-2">
            When you have products waiting for your review, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingReviews.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.productName}</CardTitle>
                <p className="text-sm text-gray-500">
                  Delivered on {new Date(item.deliveredDate).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square mb-4">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Rating</h3>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(item.productId, star)}
                        >
                          <Star
                            className={`w-6 h-6 ${star <= (reviewsData[item.productId]?.rating || 0) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300 hover:text-yellow-400"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Your Review</h3>
                    <textarea
                      placeholder="Share your thoughts about this product..."
                      className="w-full p-3 border rounded-md min-h-[100px] text-sm"
                      value={reviewsData[item.productId]?.comment || ""}
                      onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Add Photo (Optional)</h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(item.productId, e.target.files[0])}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-emerald-50 file:text-emerald-700
                        hover:file:bg-emerald-100"
                    />
                    {reviewsData[item.productId]?.reviewImage && (
                      <div className="mt-2 relative w-20 h-20">
                        <Image
                          src={reviewsData[item.productId].reviewImage}
                          alt="Review image"
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => skipReview(item.productId)}
                >
                  Skip
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => submitReview(item.productId)}
                >
                  Submit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}