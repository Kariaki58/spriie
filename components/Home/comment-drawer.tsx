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
import { MessageSquare, Star, X, Send, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  image?: string;
}

interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
  likes: string[];
  replies: Comment[];
  parentComment?: string;
}

interface Review {
  _id: string;
  user: User;
  rating: number;
  content: string;
  createdAt: string;
  likes: string[];
}

interface CommentsDrawerProps {
  productId: string;
  commentCount: number;
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Network response was not ok');
  }
  return data;
}

export default function CommentsDrawer({ productId, commentCount }: CommentsDrawerProps) {
  const [activeTab, setActiveTab] = useState("comments");
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<Record<string, boolean>>({});
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", productId],
    queryFn: async () => {
      return fetchJson<Comment[]>(`/api/comments?productId=${productId}`);
    },
    enabled: !!productId,
  });

  // Mutation for adding a comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return fetchJson<Comment>(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          productId,
          parentCommentId: replyingTo
        }),
      });
    },
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      if (replyingTo) {
        setReplyInput("");
      } else {
        setCommentInput("");
      }
      setReplyingTo(null);
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    }
  });

  // Mutation for deleting a comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      toast.success("Comment deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    }
  });

  // Mutation for liking a comment
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
    }
  });

  const toggleDescription = (commentId: string) => {
    setShowFullDescription(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addCommentMutation.mutate(commentInput);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(prev => {
      if (prev === commentId) {
        setReplyInput("");
        return null;
      }
      setReplyInput("");
      return commentId;
    });
  };

  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    addCommentMutation.mutate(replyInput);
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (!session) {
      toast.error("You need to sign in to like comments");
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Mock reviews data
  const reviews: Review[] = [
    {
      _id: "r1",
      user: {
        _id: "user4",
        name: "Sarah Williams",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
      },
      rating: 5,
      content: "Absolutely love this product! It exceeded all my expectations. The material is high quality and it arrived sooner than expected. Will definitely purchase again!",
      createdAt: "2023-05-10T14:20:00Z",
      likes: [],
    },
    {
      _id: "r2",
      user: {
        _id: "user5",
        name: "Michael Brown",
        image: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      rating: 4,
      content: "Great product overall. The only reason I'm not giving 5 stars is because the color was slightly different than shown in the pictures, but still very nice.",
      createdAt: "2023-05-12T16:45:00Z",
      likes: [],
    },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="flex flex-col items-center"
          aria-label="View comments"
        >
          <MessageSquare size={24} color="white" />
          <span className="text-white text-xs mt-1">{comments?.length || 0}</span>
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
                Comments ({comments?.length || 0})
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments?.map((comment) => (
                    <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.user.image} />
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
                            <button 
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                              onClick={() => handleLikeComment(comment._id)}
                            >
                              <Heart 
                                size={14} 
                                className={comment.likes.includes(session?.user.id as string) ? 
                                  "fill-red-500 text-red-500" : ""} 
                              />
                              ({comment.likes.length})
                            </button>
                            <button 
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              onClick={() => handleReply(comment._id)}
                            >
                              Reply
                            </button>
                            {session?.user.id === comment.user._id && (
                              <button 
                                className="text-xs text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteComment(comment._id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>

                          {/* Reply form */}
                          {replyingTo === comment._id && (
                            <form 
                              onSubmit={(e) => handleReplySubmit(e, comment._id)}
                              className="mt-3"
                            >
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder={`Replying to ${comment.user.name}...`}
                                  value={replyInput}
                                  onChange={(e) => setReplyInput(e.target.value)}
                                  className="flex-1 min-h-[40px] text-sm"
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={!replyInput.trim() || addCommentMutation.isPending}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </form>
                          )}

                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.user.image} />
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
                                      <button 
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                                        onClick={() => handleLikeComment(reply._id)}
                                      >
                                        <Heart 
                                          size={12} 
                                          className={reply.likes.includes(session?.user.id as string) ? 
                                            "fill-red-500 text-red-500" : ""} 
                                        />
                                        ({reply.likes.length})
                                      </button>
                                      {session?.user.id === reply.user._id && (
                                        <button 
                                          className="text-xs text-red-500 hover:text-red-700"
                                          onClick={() => handleDeleteComment(reply._id)}
                                        >
                                          Delete
                                        </button>
                                      )}
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
              )}

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
                        disabled={!commentInput.trim() || addCommentMutation.isPending}
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
                  <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user.image} />
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
                          <p className={`text-sm ${showFullDescription[review._id] ? "" : "line-clamp-2"}`}>
                            {review.content}
                          </p>
                          {review.content.length > 100 && (
                            <button
                              onClick={() => toggleDescription(review._id)}
                              className="text-emerald-500 dark:text-emerald-400 text-xs font-medium flex items-center mt-1"
                            >
                              {showFullDescription[review._id] ? (
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
                          <button 
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                          >
                            <Heart 
                              size={14} 
                              className={review.likes.includes(session?.user.id as string) ? 
                                "fill-red-500 text-red-500" : ""} 
                            />
                            Helpful ({review.likes.length})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}