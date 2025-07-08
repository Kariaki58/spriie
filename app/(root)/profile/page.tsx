"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NavigationBar from "@/components/app-ui/Navigation";
import { BadgeCheck, Heart, Lock, Repeat2, Upload, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentItem {
  _id: string;
  type: "image" | "video";
  thumbnail: string;
  video?: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  isPrivate?: boolean;
  isRepost?: boolean;
}

interface UserData {
  username: string;
  fullName: string | null | undefined;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isSeller: boolean;
  trustPercentage?: number;
  content: ContentItem[];
}

interface FormData {
  fullName: string | null | undefined;
  bio: string;
}

type ContentTab = "uploads" | "likes" | "saved" | "reposts";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentTab>("uploads");
  const [mockContent, setMockContent] = useState<ContentItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fullName: session?.user?.name,
    bio: "Digital creator | Photography enthusiast | Sharing my journey",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content/profile', {
          method: 'GET'
        });
        const data = await response.json();
        
        const transformedData = data.message.map((item: any) => ({
          _id: item._id.toString(),
          type: item.video ? "video" : "image",
          thumbnail: item.thumbnail,
          video: item.video,
          likes: item.likes || 0,
          comments: item.reviews?.length || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          isPrivate: Math.random() > 0.7, // 30% chance of being private
          isRepost: Math.random() > 0.8 // 20% chance of being repost
        }));
        
        setMockContent(transformedData);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      }
    };

    fetchContent();
  }, []);

  // Calculate trust percentage (mock data)
  const calculateTrustPercentage = () => {
    if (!mockContent.length) return 0;
    const base = 70; // Start with 70%
    const uploadBonus = Math.min(mockContent.length * 2, 20); // +2% per upload, max +20%
    const followerBonus = Math.min(10, 10); // +10% if they have followers (mock)
    return Math.min(base + uploadBonus + followerBonus, 95); // Cap at 95%
  };

  const isLoading = status === "loading";

  const userData: UserData = {
    username: session?.user?.email?.split('@')[0] || "user",
    fullName: formData.fullName,
    bio: formData.bio,
    followers: 0,
    following: 0,
    posts: mockContent.length,
    isSeller: session?.user?.role === "seller" || false,
    trustPercentage: calculateTrustPercentage(),
    content: mockContent,
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log("Data to be sent to backend:", {
      name: formData.fullName,
      bio: formData.bio,
    });
    setIsEditing(false);
  };

  // Filter content based on active tab
  const filteredContent = () => {
    switch (activeTab) {
      case "likes":
        return mockContent.filter(item => item.likes > 0).sort((a, b) => b.likes - a.likes);
      case "saved":
        return mockContent.filter(item => item.isPrivate);
      case "reposts":
        return mockContent.filter(item => item.isRepost);
      case "uploads":
      default:
        return mockContent;
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
      <section className="p-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-emerald-500">
              <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "U"}
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
              {isEditing ? (
                <Input
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleInputChange}
                  className="text-xl font-bold mb-1"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-600">{userData.fullName}</h2>
              )}
              {userData.isSeller && (
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <p className="text-gray-600">@{userData.username}</p>
          </div>
        </div>

        {isEditing ? (
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="mt-3"
            rows={3}
          />
        ) : (
          <p className="mt-3 text-gray-700">{userData.bio}</p>
        )}

        {userData.isSeller && (
          <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
            <BadgeCheck className="h-4 w-4" />
            <span>Verified Seller</span>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="font-bold text-gray-600">{userData.posts}</p>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-600">{userData.followers}</p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-600">{userData.following}</p>
            <p className="text-sm text-gray-600">Following</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {userData.isSeller ? (
            <Link href="/vendor" passHref>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Seller Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/store" passHref>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Become a Seller
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            className="border-emerald-600 text-emerald-800"
            onClick={isEditing ? handleSave : handleEditToggle}
          >
            {isEditing ? "Save Profile" : "Edit Profile"}
          </Button>
        </div>
      </section>

      <section className="mt-4 p-2 pb-16">
        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger 
              value="uploads" 
              onClick={() => setActiveTab("uploads")}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Video className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Uploads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              onClick={() => setActiveTab("likes")}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Heart className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Likes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              onClick={() => setActiveTab("saved")}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Lock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reposts" 
              onClick={() => setActiveTab("reposts")}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Repeat2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Reposts</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-2">
            {filteredContent().length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {filteredContent().map((item) => (
                  <Card key={item._id} className="aspect-square overflow-hidden group relative p-0">
                    {item.type === "image" ? (
                      <img
                        src={item.thumbnail}
                        alt="Post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                        <video
                          src={item.video}
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
                    </div>
                    {item.isPrivate && (
                      <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {item.isRepost && (
                      <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                        <Repeat2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  {activeTab === "uploads" && <Upload className="h-8 w-8 text-gray-400" />}
                  {activeTab === "likes" && <Heart className="h-8 w-8 text-gray-400" />}
                  {activeTab === "saved" && <Lock className="h-8 w-8 text-gray-400" />}
                  {activeTab === "reposts" && <Repeat2 className="h-8 w-8 text-gray-400" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {activeTab === "uploads" && "No uploads yet"}
                  {activeTab === "likes" && "No liked videos"}
                  {activeTab === "saved" && "No saved videos"}
                  {activeTab === "reposts" && "No reposts yet"}
                </h3>
                <p className="text-gray-500 mt-1 text-center max-w-md">
                  {activeTab === "uploads" && "When you upload photos or videos, they'll appear here."}
                  {activeTab === "likes" && "Videos you like will appear here."}
                  {activeTab === "saved" && "Save videos to watch later by tapping the bookmark icon."}
                  {activeTab === "reposts" && "Videos you repost will appear here."}
                </p>
                {activeTab === "uploads" && (
                  <Button className="mt-4" variant="outline">
                    Upload your first video
                  </Button>
                )}
              </div>
            )}
          </div>
        </Tabs>
      </section>

      <NavigationBar />
    </div>
  );
}