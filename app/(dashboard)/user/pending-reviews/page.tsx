"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface PendingReviewItem {
  id: string;
  productName: string;
  productImage: string;
  deliveredDate: string;
  orderId: string;
}

interface ReviewData {
  rating: number;
  comment: string;
}

export default function PendingReviewDashboard() {
  // Mock data - in a real app, this would come from your API
  const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([
    {
      id: "1",
      productName: "Premium Wireless Headphones",
      productImage: "/product.jpg",
      deliveredDate: "2023-05-15",
      orderId: "ORD-78945",
    },
    {
      id: "2",
      productName: "Organic Cotton T-Shirt",
      productImage: "/led-1.webp",
      deliveredDate: "2023-05-10",
      orderId: "ORD-78234",
    },
  ]);

  const [reviewsData, setReviewsData] = useState<Record<string, ReviewData>>({});

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

  const submitReview = (productId: string) => {
    const review = reviewsData[productId];
    
    if (!review?.rating) {
      toast.error("Please select a rating");
      return;
    }

    // In a real app, you would call your API here
    toast.success("Review submitted successfully!");
    console.log("Submitting review for product", productId, review);
    
    // Remove the reviewed product from the list
    setPendingReviews(prev => prev.filter(item => item.id !== productId));
    setReviewsData(prev => {
      const newData = { ...prev };
      delete newData[productId];
      return newData;
    });
  };

  const skipReview = (productId: string) => {
    // In a real app, you might want to track skipped reviews
    toast.info("You can review this product later");
    setPendingReviews(prev => prev.filter(item => item.id !== productId));
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Opinion Matters!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Share your experience with these products to help other shoppers make better decisions.
          Your review could be featured and help someone discover their new favorite product!
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
            <Card key={item.id} className="hover:shadow-lg transition-shadow bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">{item.productName}</CardTitle>
                <p className="text-sm text-gray-500">
                  Delivered on {new Date(item.deliveredDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">Order #{item.orderId}</p>
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
                    <h3 className="font-medium mb-2">How would you rate this product?</h3>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(item.id, star)}
                        >
                          <Star
                            className={`w-6 h-6 ${star <= (reviewsData[item.id]?.rating || 0) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300 hover:text-yellow-400"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Share your thoughts</h3>
                    <textarea
                      placeholder="What did you like or dislike about this product? Would you recommend it?"
                      className="w-full p-3 border rounded-md min-h-[100px] text-sm"
                      value={reviewsData[item.id]?.comment || ""}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => skipReview(item.id)}
                >
                  Skip for now
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => submitReview(item.id)}
                >
                  Submit Review
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Why your review matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4">
            <div className="bg-blue-100 dark:bg-blue-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4" />
                <path d="m16.24 7.76 2.83-2.83" />
                <path d="M18 12h4" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M12 18v4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="M2 12h4" />
                <path d="m4.93 4.93 2.83 2.83" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">Help Others Decide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your honest review helps future shoppers make informed choices.
            </p>
          </div>
          <div className="p-4">
            <div className="bg-blue-100 dark:bg-blue-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4" />
                <path d="m16.24 7.76 2.83-2.83" />
                <path d="M18 12h4" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M12 18v4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="M2 12h4" />
                <path d="m4.93 4.93 2.83 2.83" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">Improve Our Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We listen to feedback to make our products even better.
            </p>
          </div>
          <div className="p-4">
            <div className="bg-blue-100 dark:bg-blue-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4" />
                <path d="m16.24 7.76 2.83-2.83" />
                <path d="M18 12h4" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M12 18v4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="M2 12h4" />
                <path d="m4.93 4.93 2.83 2.83" />
              </svg>
            </div>
            <h3 className="font-medium mb-1">Earn Rewards</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get points for each review that can be redeemed for discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}