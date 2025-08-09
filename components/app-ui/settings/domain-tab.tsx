"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';


export default function DomainTab() {
    const [customDomain, setCustomDomain] = useState('');
    const [domainVerificationStatus, setDomainVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
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
    return (
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
    )
}