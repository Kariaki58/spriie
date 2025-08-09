"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Trash2,
  Check,
  X
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

export default function TeamTab() {
  const { data: session } = useSession();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/team`);
        if (!res.ok) throw new Error('Failed to fetch team members');
        const data = await res.json();

        
        // Transform the API data to match our frontend type
        const members = data.map((member: any) => ({
          id: member._id,
          userId: member.userId?._id,
          name: member.userId?.name || member.name || member.email,
          email: member.email,
          role: member.role,
          avatar: member.userId?.image || member.avatar,
          status: member.status,
        }));
        
        setTeamMembers(members);
      } catch (error) {
        toast.error('Failed to load team members');
        console.error(error);
      } finally {
        setLoading(false);
      }
  };

  // Fetch team members
  useEffect(() => {
    fetchMembers();
  }, []);

  // Invite new member
  const handleAddTeamMember = async () => {
    if (!newMemberEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
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

      const newMember = await res.json();
      
      setTeamMembers(prev => [...prev, {
        id: newMember._id,
        name: newMember.name || newMember.email,
        email: newMember.email,
        role: newMember.role,
        status: newMember.status,
      }]);
      
      setNewMemberEmail('');
      toast.success(`Invitation sent to ${newMemberEmail}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite member');
    }
  };

  // Update member role
  const handleUpdateRole = async (id: string, newRole: TeamMember['role']) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memberId: id, 
          role: newRole, 
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update role');
      }

      setTeamMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, role: newRole } : member
        )
      );
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  // Remove member
  const handleRemoveTeamMember = async (id: string) => {
    try {
      const res = await fetch(`/api/team?memberId=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      setTeamMembers(prev => prev.filter(member => member.id !== id));
      toast.info('Team member removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <TabsContent value="team">
        <Card className="dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Loading team members...</CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    );
  }

  console.log(teamMembers)

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
            ))}

            {currentUser?.role && ['owner', 'admin'].includes(currentUser.role) && (
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
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Invite
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