"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { 
  Settings,
  User,
  CreditCard,
  Users,
  Globe,
  Image as ImageIcon,
  Mail,
  Lock,
  Bell,
  LogOut,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
};

type BillingPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  isCurrent: boolean;
};

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
};

export default function DashboardSettingsDisplay() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [logo, setLogo] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [domainVerificationStatus, setDomainVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: session?.user?.name || 'You',
      email: session?.user?.email || '',
      role: 'owner',
      avatar: session?.user?.image || '',
      status: 'active'
    },
    {
      id: '2',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'admin',
      status: 'active'
    },
    {
      id: '3',
      name: 'Sam Wilson',
      email: 'sam@example.com',
      role: 'editor',
      status: 'pending'
    }
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const billingPlans: BillingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 5000,
      features: [
        'Up to 100 products',
        'Basic analytics',
        '24/7 support'
      ],
      isCurrent: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 40000,
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Custom domains',
        'Priority support'
      ],
      isCurrent: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 100000,
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        'API access',
        'Custom integrations'
      ],
      isCurrent: false
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'INV-2023-11-001',
      date: 'Nov 15, 2023',
      amount: 9000,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-10-001',
      date: 'Oct 15, 2023',
      amount: 18000,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-09-001',
      date: 'Sep 15, 2023',
      amount: 40000,
      status: 'paid',
      downloadUrl: '#'
    }
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

  const handleRemoveLogo = () => {
    setLogo(null);
    toast.info('Logo removed');
  };

  const handleAddDomain = () => {
    if (!customDomain) {
      toast.error('Please enter a domain');
      return;
    }
    setDomainVerificationStatus('pending');
    toast.success(`Domain ${customDomain} added. Please verify ownership.`);
  };

  const handleVerifyDomain = () => {
    setDomainVerificationStatus('verified');
    toast.success('Domain verified successfully!');
  };

  const handleRemoveDomain = () => {
    setCustomDomain('');
    setDomainVerificationStatus('unverified');
    toast.info('Domain removed');
  };

  const handleAddTeamMember = () => {
    if (!newMemberEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: '',
      email: newMemberEmail,
      role: newMemberRole,
      status: 'pending'
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberEmail('');
    toast.success(`Invitation sent to ${newMemberEmail}`);
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    toast.info('Team member removed');
  };

  const handleUpdateRole = (id: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, role: newRole } : member
    ));
    toast.success('Role updated successfully');
  };

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

          {/* Profile Tab */}
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

                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input
                        id="store-name"
                        defaultValue="My Awesome Store"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="store-description">Store Description</Label>
                      <Input
                        id="store-description"
                        defaultValue="Quality products for everyone"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        defaultValue={session?.user?.email || ''}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Social Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Input
                        placeholder="https://facebook.com/yourstore"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="https://instagram.com/yourstore"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="https://twitter.com/yourstore"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="https://tiktok.com/yourstore"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

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

          {/* Team Tab */}
          <TabsContent value="team">
            <Card className="dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage who has access to your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.name || member.email}
                            {member.id === '1' && (
                              <span className="ml-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                          <div className="flex items-center mt-1">
                            <Badge 
                              variant={member.status === 'pending' ? 'outline' : 'default'}
                              className={`text-xs ${
                                member.status === 'pending' 
                                  ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {member.status === 'pending' ? 'Pending' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {member.id !== '1' ? (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleUpdateRole(member.id, value as TeamMember['role'])}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                            Owner
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Invite New Member</h3>
                    <div className="flex flex-col md:flex-row gap-3">
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                      <Select
                        value={newMemberRole}
                        onValueChange={(value) => setNewMemberRole(value as 'admin' | 'editor' | 'viewer')}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddTeamMember}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Invite
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Manage what each team member can do
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Permission
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Owner
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Admin
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Editor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Viewer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          View store
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Manage products
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Manage orders
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Manage team
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Manage billing
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <X className="h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains">
            <Card className="dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Custom Domains</CardTitle>
                <CardDescription>
                  Connect your own domain to your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customDomain ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{customDomain}</h3>
                        <div className="flex items-center mt-1">
                          <Badge 
                            variant={
                              domainVerificationStatus === 'verified' 
                                ? 'default' 
                                : domainVerificationStatus === 'pending' 
                                  ? 'outline' 
                                  : 'destructive'
                            }
                            className={`text-xs ${
                              domainVerificationStatus === 'verified'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                                : domainVerificationStatus === 'pending'
                                  ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {domainVerificationStatus === 'verified'
                              ? 'Verified'
                              : domainVerificationStatus === 'pending'
                                ? 'Pending Verification'
                                : 'Unverified'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {domainVerificationStatus === 'pending' && (
                          <Button 
                            variant="outline"
                            onClick={handleVerifyDomain}
                          >
                            Verify
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={handleRemoveDomain}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    {domainVerificationStatus === 'pending' && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md text-sm">
                        <p>To verify your domain, please add the following DNS record:</p>
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-md font-mono text-sm">
                          CNAME shop.yourdomain.com → mystore.spriie.com
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-domain">Custom Domain</Label>
                      <div className="flex flex-col md:flex-row gap-3 mt-1">
                        <Input
                          id="custom-domain"
                          placeholder="shop.yourdomain.com"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                        />
                        <Button 
                          onClick={handleAddDomain}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Add Domain
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Default Domain</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        mystore.spriie.com
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Billing Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {billingPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`border rounded-lg p-4 ${
                        plan.isCurrent
                          ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(plan.price)}
                          </p>
                        </div>
                        {plan.isCurrent && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                            Current Plan
                          </Badge>
                        )}
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Button
                          variant={plan.isCurrent ? 'outline' : 'default'}
                          className={`w-full ${
                            plan.isCurrent
                              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {plan.isCurrent ? 'Manage Plan' : 'Upgrade'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Update your billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">VISA</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires 12/25
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View and download past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {invoice.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                invoice.status === 'paid'
                                  ? 'default'
                                  : invoice.status === 'pending'
                                    ? 'outline'
                                    : 'destructive'
                              }
                              className={`text-xs ${
                                invoice.status === 'paid'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                                  : invoice.status === 'pending'
                                    ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                    : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <Button variant="link" className="text-emerald-600 dark:text-emerald-400 p-0 h-auto">
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Active Sessions</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        2 active sessions
                      </p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}