"use client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  rating: number;
  content: string;
  createdAt: string;
  likes: number;
}

export default function CommentsDrawer() {
  const [activeTab, setActiveTab] = useState("comments");
  const [commentInput, setCommentInput] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { data: session } = useSession();

  // Mock data - replace with your actual data fetching
  const comments: Comment[] = [
    {
      id: "1",
      user: {
        id: "user1",
        name: "Jane Doe",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      content: "This product is amazing! I've been using it for a week now and the quality is outstanding.",
      createdAt: "2023-05-15T10:30:00Z",
      likes: 24,
      replies: [
        {
          id: "1-1",
          user: {
            id: "user2",
            name: "John Smith",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          content: "I agree! The quality is much better than I expected.",
          createdAt: "2023-05-15T11:45:00Z",
          likes: 8,
          replies: [],
        },
      ],
    },
    {
      id: "2",
      user: {
        id: "user3",
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      },
      content: "How long does shipping usually take? I'm thinking of ordering but need it by next weekend.",
      createdAt: "2023-05-16T09:15:00Z",
      likes: 5,
      replies: [],
    },
  ];

  const reviews: Review[] = [
    {
      id: "r1",
      user: {
        id: "user4",
        name: "Sarah Williams",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
      rating: 5,
      content: "Absolutely love this product! It exceeded all my expectations. The material is high quality and it arrived sooner than expected. Will definitely purchase again!",
      createdAt: "2023-05-10T14:20:00Z",
      likes: 32,
    },
    {
      id: "r2",
      user: {
        id: "user5",
        name: "Michael Brown",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      rating: 4,
      content: "Great product overall. The only reason I'm not giving 5 stars is because the color was slightly different than shown in the pictures, but still very nice.",
      createdAt: "2023-05-12T16:45:00Z",
      likes: 12,
    },
  ];

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    // Handle comment submission
    console.log("Comment submitted:", commentInput);
    setCommentInput("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="flex flex-col items-center"
          aria-label="View comments"
        >
          <MessageSquare size={24} color="white" />
          <span className="text-white text-xs mt-1">1.2K</span>
        </button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-md px-4 pb-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pt-4">
            <DrawerTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Comments & Reviews
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X size={20} />
              </Button>
            </DrawerClose>
          </div>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="comments"
                onClick={() => setActiveTab("comments")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                onClick={() => setActiveTab("reviews")}
              >
                <Star className="w-4 h-4 mr-2" />
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{comment.user.name}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Like ({comment.likes})
                          </button>
                          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Reply
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reply.user.avatar} />
                                  <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-xs">{reply.user.name}</h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs mt-1">{reply.content}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                      Like ({reply.likes})
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment form */}
              {session && (
                <form onSubmit={handleCommentSubmit} className="mt-6">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 min-h-[40px]"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        disabled={!commentInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{review.user.name}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="relative mt-1">
                          <p className={`text-sm ${showFullDescription ? "" : "line-clamp-2"}`}>
                            {review.content}
                          </p>
                          {review.content.length > 100 && (
                            <button
                              onClick={toggleDescription}
                              className="text-emerald-500 dark:text-emerald-400 text-xs font-medium flex items-center mt-1"
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
                        <div className="mt-2">
                          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Helpful ({review.likes})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6" variant="outline">
                Write a Review
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}