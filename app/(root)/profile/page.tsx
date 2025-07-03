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

interface ContentItem {
  _id: string;
  type: "image" | "video";
  thumbnail: string;
  video?: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  username: string;
  fullName: string | null | undefined;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isSeller: boolean;
  content: ContentItem[];
}

interface FormData {
  fullName: string | null | undefined;
  bio: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [mockContent, setMockContent] = useState<ContentItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fullName: session?.user?.name,
    bio: "Digital creator | Photography enthusiast | Sharing my journey",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content', {
          method: 'GET'
        });
        const data = await response.json();
        
        // Transform the API data to match our ContentItem interface
        const transformedData = data.message.map((item: any) => ({
          _id: item._id.toString(),
          type: item.video ? "video" : "image",
          thumbnail: item.thumbnail,
          video: item.video,
          likes: item.likes || 0,
          comments: item.reviews?.length || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
        
        setMockContent(transformedData);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      }
    };

    fetchContent();
  }, []);

  const isLoading = status === "loading";

  const userData: UserData = {
    username: session?.user?.email?.split('@')[0] || "user",
    fullName: formData.fullName,
    bio: formData.bio,
    followers: 0,
    following: 0,
    posts: mockContent.length,
    isSeller: session?.user?.role === "seller" || false,
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
          <Avatar className="w-20 h-20 border-2 border-emerald-500">
            <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {userData.content.map((item) => (
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
            </Card>
          ))}
        </div>
      </section>

      <NavigationBar />
    </div>
  );
}