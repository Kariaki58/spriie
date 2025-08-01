"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Type definitions
type Address = {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
};

type PaymentMethod = {
  id: string;
  type: 'card' | 'bank';
  last4?: string;
  brand?: string;
  expiry?: string;
  bank?: string;
  account?: string;
  isDefault: boolean;
};

type OrderHistory = {
  totalOrders: number;
  lastOrder: string;
};

type NotificationSettings = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  avatar: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  orderHistory: OrderHistory;
  notifications: NotificationSettings;
};

export default function UserDashboardSettingsDisplay() {
  const { data: session } = useSession();
  
  // Sample user data with proper typing
  const userData: UserData = {
    name: session?.user?.name || "Guest User",
    email: session?.user?.email || "user@example.com",
    phone: "+234 812 345 6789",
    joinedDate: "January 15, 2023",
    avatar: session?.user?.image || "/default-avatar.jpg",
    addresses: [
      {
        id: "1",
        type: "Home",
        street: "123 Main Street",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        isDefault: true,
      },
      {
        id: "2",
        type: "Work",
        street: "456 Business Avenue",
        city: "Abuja",
        state: "FCT",
        country: "Nigeria",
        isDefault: false,
      },
    ],
    paymentMethods: [
      {
        id: "1",
        type: "card",
        last4: "4242",
        brand: "visa",
        expiry: "12/25",
        isDefault: true,
      },
      {
        id: "2",
        type: "bank",
        bank: "GTBank",
        account: "0123456789",
        isDefault: false,
      },
    ],
    orderHistory: {
      totalOrders: 12,
      lastOrder: "March 15, 2024",
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your Spriie account information and preferences
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
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 dark:bg-gray-800 shadow-sm dark:border-emerald-700">
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
                    <Button variant="outline" className="w-full">
                      Change Photo
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue={userData.name}
                          className="mt-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                        <Input
                          id="email"
                          defaultValue={userData.email}
                          className="mt-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="dark:text-gray-300">Phone Number</Label>
                      <Input
                        id="phone"
                        defaultValue={userData.phone}
                        className="mt-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>

                    <div className="pt-4">
                      <Label className="dark:text-gray-300">Account Created</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {userData.joinedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4 dark:border-gray-800">
                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            {/* Order History Summary */}
            <Card className="border-0 shadow-sm mt-6 dark:bg-gray-800 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Order History</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Overview of your recent purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {userData.orderHistory.totalOrders}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Order
                    </p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {userData.orderHistory.lastOrder}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 dark:border-gray-800">
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
            <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Saved Addresses</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Manage your shipping addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 ${
                        address.isDefault
                          ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {address.type}
                            </h3>
                            {address.isDefault && (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.street}, {address.city}, {address.state},{" "}
                            {address.country}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-200">
                            Edit
                          </Button>
                          {!address.isDefault && (
                            <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-200">
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-start border-t px-6 py-4 dark:border-gray-800">
                <Button 
                  variant="outline" 
                  className="border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                >
                  + Add New Address
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Payment Methods</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Manage your saved payment options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 ${
                        method.isDefault
                          ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {method.type === "card" ? (
                            <div className="w-10 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <span className="text-xs font-medium dark:text-gray-200">
                                {method.brand?.toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <div className="w-10 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <span className="text-xs font-medium dark:text-gray-200">BANK</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {method.type === "card"
                                ? `•••• •••• •••• ${method.last4}`
                                : `${method.bank} •••• ${method.account?.slice(-4)}`}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {method.type === "card"
                                ? `Expires ${method.expiry}`
                                : "Bank Account"}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {method.isDefault ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Default
                            </Badge>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-200">
                                Make Default
                              </Button>
                              <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-200">
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-start border-t px-6 py-4 dark:border-gray-800">
                <Button 
                  variant="outline" 
                  className="border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                >
                  + Add Payment Method
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Notification Preferences</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Order updates, promotions, and account notifications
                      </p>
                    </div>
                    <Switch
                      checked={userData.notifications.email}
                      className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <Separator className="dark:bg-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Order and delivery updates via text message
                      </p>
                    </div>
                    <Switch
                      checked={userData.notifications.sms}
                      className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <Separator className="dark:bg-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        App notifications for important updates
                      </p>
                    </div>
                    <Switch
                      checked={userData.notifications.push}
                      className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4 dark:border-gray-800">
                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}