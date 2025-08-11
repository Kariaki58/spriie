"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AddressDisplay from "@/components/app-ui/AddressDisplay";

export type Address = {
  _id: string;
  fullName: string;
  type: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type OrderHistory = {
  totalOrders: number;
  lastOrder: string;
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  avatar: string;
  addresses: Address[];
  orderHistory: OrderHistory;
};

export default function UserDashboardSettingsDisplay() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState({
    profile: false,
    avatar: false,
    addresses: false,
  });
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    joinedDate: "",
    avatar: "",
    addresses: [],
    orderHistory: {
      totalOrders: 0,
      lastOrder: "No orders yet",
    },
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, profile: true, addresses: true }));
        
        // Fetch profile data
        const profileRes = await fetch('/api/user/profile');
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();
        
        // Fetch addresses
        const addressesRes = await fetch('/api/user/address');
        if (!addressesRes.ok) throw new Error('Failed to fetch addresses');
        const { addresses } = await addressesRes.json();
        
        // Fetch order history
        const ordersRes = await fetch('/api/user/orders');
        const orderHistory = ordersRes.ok ? await ordersRes.json() : {
          totalOrders: 0,
          lastOrder: "No orders yet"
        };
        
        setUserData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || "",
          joinedDate: profileData.joinedDate || new Date().toLocaleDateString(),
          avatar: profileData.avatar || "",
          addresses: addresses || [],
          orderHistory,
        });
        
        setFormData({
          name: profileData.name,
          phone: profileData.phone || "",
        });
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(prev => ({ ...prev, profile: false, addresses: false }));
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(prev => ({ ...prev, profile: true }));
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      
      // Update session if name changed
      if (updatedData.name !== session?.user?.name) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedData.name,
          }
        });
      }
      
      setUserData(prev => ({
        ...prev,
        name: updatedData.name,
        phone: updatedData.phone,
      }));
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsLoading(prev => ({ ...prev, avatar: true }));
      
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload avatar');
      
      const { avatar } = await response.json();
      
      // Update session with new avatar
      await update({
        ...session,
        user: {
          ...session?.user,
          image: avatar,
        }
      });
      
      setUserData(prev => ({ ...prev, avatar }));
      
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  const handleAddressUpdate = (updatedAddresses: Address[]) => {
    setUserData(prev => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account information and preferences
            </p>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            variant="outline"
            className="mt-4 md:mt-0 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Sign Out
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 dark:bg-gray-800 shadow-sm dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Profile Information</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Update your account details and personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.avatar} />
                      <AvatarFallback>
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={isLoading.avatar}
                      >
                        {isLoading.avatar ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Change Photo"
                        )}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleAvatarUpload}
                        disabled={isLoading.avatar}
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                        <Input
                          id="email"
                          value={userData.email}
                          className="mt-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Label className="dark:text-gray-300">Account Created</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(userData.joinedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4 dark:border-gray-700">
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={isLoading.profile || formData.name === userData.name && formData.phone === userData.phone}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                >
                  {isLoading.profile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Order History Summary */}
            <Card className="border-0 shadow-sm mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Order History</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Overview of your recent purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {userData.orderHistory.totalOrders}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Order
                    </p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {userData.orderHistory.lastOrder}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Actions
                    </p>
                    <Button
                      variant="link"
                      className="text-emerald-600 dark:text-emerald-400 p-0 h-auto"
                    >
                      View Order History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <AddressDisplay 
              addresses={userData.addresses} 
              onUpdate={handleAddressUpdate}
              isLoading={isLoading.addresses}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}