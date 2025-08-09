'use client';

import { useSession } from 'next-auth/react';
import { ImageIcon, Trash2, Edit2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from '@/components/ui/textarea';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProfileTab() {
  const { data: session } = useSession();
  const { data: storeData, error, isLoading, mutate } = useSWR('/api/store', fetcher);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (storeData?.store) {
      setLogo(storeData.store.logo || null);
    }
  }, [storeData]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  if (isLoading) {
    return <p className="p-4 text-gray-500">Loading store info...</p>;
  }

  if (error || !storeData?.store) {
    return <p className="p-4 text-red-500">Error loading store data.</p>;
  }

  const store = storeData.store;

  if (!store) {
    return <p className="p-4 text-red-500">Store not found.</p>;
  }

  return (
    <TabsContent value="profile">
      <Card className="dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Store Profile</CardTitle>
          <CardDescription>
            Update your store information and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {logo ? (
                    <AvatarImage src={logo} alt="Store logo" />
                  ) : (
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <ImageIcon className="h-8 w-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="logo-upload"
                  className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Change logo"
                >
                  <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              {logo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Logo
                </Button>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  defaultValue={store.storeName}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea
                  id="store-description"
                  defaultValue={store.description}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  defaultValue={store.email}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <Label>Social Links</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <Input
                placeholder="https://facebook.com/yourstore"
                defaultValue={store.social?.facebook || ""}
              />
              <Input
                placeholder="https://instagram.com/yourstore"
                defaultValue={store.social?.instagram || ""}
              />
              <Input
                placeholder="https://twitter.com/yourstore"
                defaultValue={store.social?.twitter || ""}
              />
              <Input
                placeholder="https://tiktok.com/yourstore"
                defaultValue={store.social?.tiktok || ""}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications Card */}
      <Card className="dark:bg-gray-800 border-0 shadow-sm mt-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive important updates via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Alerts</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified for new orders
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Promotional Emails</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive marketing and promotional emails
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
