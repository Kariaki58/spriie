"use client";
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { 
  User,
  CreditCard,
  Users,
  Globe,
  Lock,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProfileTab from '@/components/app-ui/settings/profile-tab';
import TeamTab from '@/components/app-ui/settings/team-tab';
import DomainTab from '@/components/app-ui/settings/domain-tab';
import SecurityTab from '@/components/app-ui/settings/security-tab';
import Moneybills from '@/components/app-ui/settings/money-tab';

export default function DashboardSettingsDisplay() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Store Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your store profile, team, and billing information
            </p>
          </div>
          <Button 
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            variant="outline"
            className="mt-4 md:mt-0 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-5 bg-gray-100 dark:bg-gray-800 mb-10 md:mb-0">
            <TabsTrigger value="profile" className="py-2 text-xs">
                <User className="h-4 w-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="team" className="py-2 text-xs">
                <Users className="h-4 w-4 mr-2" /> Team
            </TabsTrigger>
            <TabsTrigger value="domains" className="py-2 text-xs">
                <Globe className="h-4 w-4 mr-2" /> Domains
            </TabsTrigger>
            <TabsTrigger value="billing" className="py-2 text-xs">
                <CreditCard className="h-4 w-4 mr-2" /> Billing
            </TabsTrigger>
            <TabsTrigger value="security" className="py-2 text-xs">
                <Lock className="h-4 w-4 mr-2" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab />
          </TabsContent>

          <TabsContent value="domains">
            <DomainTab />
          </TabsContent>

          <TabsContent value="billing">
            <Moneybills />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}