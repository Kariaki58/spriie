"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { MessageSquare, Plus, Share2, Bell, BadgeCheck } from "lucide-react";

interface UserUpload {
  _id: string;
  userId: {
    name: string;
    avatar: string;
    bio?: string;
  };
  title: string;
  video?: string;
  thumbnail?: string;
  images?: string[];
  likes?: number;
  comments?: any[];
  discountedPrice?: number;
  basePrice?: number;
}

interface ContentItem {
  id: string;
  type: "image" | "video";
  url: string;
  likes: number;
  comments: number;
  title: string;
  price?: number;
}

interface UserData {
  username: string;
  fullName: string;
  bio: string;
  image: string;
  followers: number;
  following: number;
  posts: number;
  isSeller: boolean;
  trustPercentage?: number;
  content: ContentItem[];
}

interface ApiResponse {
  message: UserUpload[];
}

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    fullName: "",
    image: "",
    bio: "Digital creator | Photography enthusiast | Sharing my journey",
  });
  const [userUploads, setUserUploads] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const path = usePathname();
  const id = path.split('/')[2];
  const isCurrentUser = !id || session?.user?.id === id;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/profile/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data: ApiResponse = await response.json();
        
        setFormData(prev => ({
          ...prev,
          fullName: data.message[0]?.userId?.name || "",
          image: data.message[0]?.userId?.avatar || "",
          bio: data.message[0]?.userId?.bio || prev.bio
        }));

        const uploads: ContentItem[] = data.message.map((upload: UserUpload) => ({
          id: upload._id,
          type: upload.video ? "video" : "image",
          url: upload.video || upload.thumbnail || upload.images?.[0] || "",
          likes: upload.likes || 0,
          comments: upload.comments?.length || 0,
          title: upload.title,
          price: upload.discountedPrice || upload.basePrice
        }));
        
        setUserUploads(uploads);
      
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (id) {
      fetchUserInfo();
    }
  }, [id, isCurrentUser]);

  const isLoading = status === "loading" || !formData.fullName;

  // Calculate trust percentage (mock data - in a real app this would come from the API)
  const calculateTrustPercentage = () => {
    if (!userUploads.length) return 0;
    const base = 70; // Start with 70%
    const uploadBonus = Math.min(userUploads.length * 2, 20); // +2% per upload, max +20%
    const followerBonus = Math.min(10, 10); // +10% if they have followers (mock)
    return Math.min(base + uploadBonus + followerBonus, 95); // Cap at 95%
  };

  const userData: UserData = {
    username: session?.user?.username || "johndoe",
    fullName: formData.fullName,
    bio: formData.bio,
    image: formData.image,
    followers: 0,
    following: 0,
    posts: userUploads.length,
    isSeller: session?.user?.role === "seller" || false,
    trustPercentage: calculateTrustPercentage(),
    content: userUploads,
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    console.log(isFollowing ? "Unfollowing user" : "Following user");
  };

  const handleMessage = () => {
    console.log("Messaging seller");
  };

  const handleShare = () => {
    console.log("Sharing profile");
    if (navigator.share) {
      navigator.share({
        title: `${userData.fullName}'s Profile`,
        text: `Check out ${userData.fullName}'s profile on our platform`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Profile link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-screen w-full overflow-y-auto bg-gray-50">
        <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </header>

        <section className="p-4 bg-white">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>

          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-3 h-4 w-2/3 rounded-md" />

          <div className="flex gap-4 mt-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center">
                <Skeleton className="h-5 w-6 mx-auto rounded-md" />
                <Skeleton className="mt-1 h-4 w-12 mx-auto rounded-md" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </section>

        <section className="mt-4 p-2">
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="aspect-square rounded-none" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-y-auto bg-gray-50">
      {/* Header with share and notification buttons */}
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{userData.fullName}</h1>
          <div className="flex gap-2">
            {userData.isSeller && !isCurrentUser && (
              <Button variant="ghost" size="icon" onClick={() => console.log("Toggle notifications")}>
                <Bell className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="p-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-emerald-500">
              <AvatarImage src={userData.image} />
              <AvatarFallback>
                {userData.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {userData.isSeller && userData.trustPercentage && (
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${userData.trustPercentage}, 100`}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-emerald-600">
                    {userData.trustPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-bold">{userData.fullName}</h2>
              {userData.isSeller && (
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <p className="text-gray-600">@{userData.username}</p>
          </div>
        </div>

        <p className="mt-3 text-gray-700">{userData.bio}</p>

        {userData.isSeller && (
          <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
            <BadgeCheck className="h-4 w-4" />
            <span>Verified Seller</span>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="font-bold">{userData.posts}</p>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{userData.followers}</p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{userData.following}</p>
            <p className="text-sm text-gray-600">Following</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {isCurrentUser ? (
            <Link href="/settings" passHref>
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </Link>
          ) : userData.isSeller ? (
            <>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button 
                variant="outline" 
                className="border-emerald-600 text-emerald-600"
                onClick={handleMessage}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="w-full" 
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button 
                variant="outline" 
                className="border-emerald-600 text-emerald-600"
                onClick={handleMessage}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="mt-4 p-2 pb-16">
        {userData.content.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {userData.content.map((item: ContentItem) => (
              <Card key={item.id} className="aspect-square p-0 overflow-hidden group relative">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {item.likes}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {item.comments}
                    </span>
                  </div>
                  {item.price && (
                    <div className="mt-1 text-right font-medium">
                      ₦{(item.price / 100).toLocaleString()}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-500 mt-1 text-center max-w-md">
              When {isCurrentUser ? "you share" : "they share"} photos or videos, they'll appear here.
            </p>
            {isCurrentUser && (
              <Button className="mt-4" variant="outline">
                Share your first photo
              </Button>
            )}
          </div>
        )}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
        {[
          { href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { href: "/explore", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          { href: "/create", icon: "M12 4v16m8-8H4" },
          { href: "/notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
          { href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", active: true },
        ].map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`p-2 ${item.active ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={item.icon}
              />
            </svg>
          </Link>
        ))}
      </nav>
    </div>
  );
}