"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import {
  Plus,
  Trash2,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { toast } from 'sonner';

type TeamMember = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
};

type ApiResponse = {
  teamMembers: any[];
  storeId: string;
};

export default function TeamTab() {
  const { data: session } = useSession();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [storeId, setStoreId] = useState("");

  // SWR fetcher function
  const fetcher = async (url: string): Promise<ApiResponse> => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('Failed to fetch team members');
      throw error;
    }
    return res.json();
  };

  // Use SWR for data fetching with caching
  const { data, error, isLoading } = useSWR<ApiResponse>('/api/team', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    onErrorRetry: (error) => {
      // Don't retry on 404 or 401 errors
      if (error.status === 404 || error.status === 401) return;
    },
  });

  // Set store ID when data is loaded
  useEffect(() => {
    if (data?.storeId) {
      setStoreId(data.storeId);
    }
  }, [data?.storeId]);

  // Transform API data to frontend format
  const teamMembers: TeamMember[] = data?.teamMembers?.map((member) => ({
    id: member._id,
    userId: member.userId?._id,
    name: member.userId?.name || member.name || member.email,
    email: member.email,
    role: member.role,
    avatar: member.userId?.image || member.avatar,
    status: member.status,
  })) || [];

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Invite new member with optimistic UI
  const handleAddTeamMember = async () => {
    if (!newMemberEmail || inviteLoading) return;
    if (!validateEmail(newMemberEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setInviteLoading(true);

    try {
      // Optimistic update
      const optimisticMember = {
        _id: `temp-${Date.now()}`,
        email: newMemberEmail,
        role: newMemberRole,
        status: 'pending',
        name: newMemberEmail.split('@')[0],
      };

      mutate('/api/team', (currentData: ApiResponse | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          teamMembers: [...currentData.teamMembers, optimisticMember],
        };
      }, false);

      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: newMemberEmail, 
          role: newMemberRole,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite member');
      }

      const response = await res.json();
      setStoreId(response.storeId);

      // Update cache with real data
      mutate('/api/team', async (currentData: ApiResponse | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          teamMembers: currentData.teamMembers.map(member => 
            member._id === optimisticMember._id ? response : member
          ),
        };
      }, false);

      setNewMemberEmail('');
      toast.success(`Invitation sent to ${newMemberEmail}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite member');
      // Revalidate to rollback optimistic update
      mutate('/api/team');
    } finally {
      setInviteLoading(false);
    }
  };

  // Update member role with optimistic UI
  const handleUpdateRole = async (id: string, newRole: TeamMember['role']) => {
    try {
      // Optimistic update
      mutate('/api/team', (currentData: ApiResponse | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          teamMembers: currentData.teamMembers.map(member => 
            member._id === id ? { ...member, role: newRole } : member
          ),
        };
      }, false);

      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memberId: id, 
          role: newRole,
          storeId
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Revalidate to ensure consistency
      mutate('/api/team');
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
      mutate('/api/team');
    }
  };

  // Remove member with optimistic UI
  const handleRemoveTeamMember = async (id: string) => {
    try {
      // Optimistic update
      mutate('/api/team', (currentData: ApiResponse | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          teamMembers: currentData.teamMembers.filter(member => member._id !== id),
        };
      }, false);

      const res = await fetch(`/api/team?memberId=${id}&storeId=${storeId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      // Revalidate to ensure consistency
      mutate('/api/team');
      toast.info('Team member removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
      mutate('/api/team');
    }
  };

  if (isLoading) {
    return (
      <TabsContent value="team">
        <Card className="dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Loading team members...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="team">
        <Card className="dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription className="text-red-500">
              Error loading team members
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Failed to load team data. Please try again.
            </p>
            <Button 
              onClick={() => mutate('/api/team')}
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  // Find the current user in the team
  const currentUser = teamMembers.find(member => 
    member.userId === session?.user?.id || member.email === session?.user?.email
  );

  return (
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
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No team members found
                </p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                        {member.userId === session?.user?.id && (
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
                    {member.role !== 'owner' && currentUser?.role && ['owner', 'admin'].includes(currentUser.role) ? (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleUpdateRole(member.id, value as TeamMember['role'])}
                          disabled={currentUser.role !== 'owner' && member.role === 'admin'}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentUser.role === 'owner' && <SelectItem value="admin">Admin</SelectItem>}
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          disabled={currentUser.role !== 'owner' && member.role === 'admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                        {member.role === 'owner' ? 'Owner' : member.role}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}

            {currentUser?.role && ['owner', 'admin'].includes(currentUser.role) && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Invite New Member</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTeamMember()}
                  />
                  <Select
                    value={newMemberRole}
                    onValueChange={(value) => setNewMemberRole(value as 'admin' | 'editor' | 'viewer')}
                    disabled={currentUser.role !== 'owner'}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUser.role === 'owner' && <SelectItem value="admin">Admin</SelectItem>}
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddTeamMember}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={inviteLoading || !newMemberEmail}
                  >
                    {inviteLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
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
  );
}