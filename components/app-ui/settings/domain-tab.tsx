// app/(dashboard)/settings/domains/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type DomainStatus = 'unverified' | 'pending' | 'verified' | 'failed';

export default function DomainTab() {
  const { data: session } = useSession();
  const [customDomain, setCustomDomain] = useState('');
  const [domainVerificationStatus, setDomainVerificationStatus] = useState<DomainStatus>('unverified');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationRecord, setVerificationRecord] = useState('');
  const [defaultDomain, setDefaultDomain] = useState('');

  // Fetch store's current domain configuration
  const fetchDomainConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/domains');
      
      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to fetch domain configuration');
      }
      
      const data = await res.json();
      if (data.domain) {
        setCustomDomain(data.domain);
        setDomainVerificationStatus(data.verified ? 'verified' : 'pending');
        setVerificationRecord(data.verificationRecord || '');
      }
      if (data.defaultDomain) {
        setDefaultDomain(data.defaultDomain);
      }
    } catch (error) {
      console.error('Failed to load domain configuration:', error);
      toast.error('Failed to load domain configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new custom domain
  const handleAddDomain = async () => {
    const domainToAdd = customDomain.trim();
    
    if (!domainToAdd) {
      toast.error('Please enter a domain');
      return;
    }

    // Basic domain validation
    if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domainToAdd)) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainToAdd }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add domain');
      }

      const data = await res.json();
      setDomainVerificationStatus('pending');
      setVerificationRecord(data.verificationRecord);
      toast.success(`Domain ${domainToAdd} added. Please verify ownership.`);
      fetchDomainConfig(); // Refresh the domain data
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast.error(error.message || 'Failed to add domain');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify domain ownership
  const handleVerifyDomain = async () => {
    if (!customDomain) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const data = await res.json();
      if (data.verified) {
        setDomainVerificationStatus('verified');
        toast.success('Domain verified successfully!');
      } else {
        setDomainVerificationStatus('pending');
        toast.error('Domain verification failed. Please check your DNS settings.');
      }
      fetchDomainConfig(); // Refresh the domain data
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      toast.error(error.message || 'Verification failed');
      setDomainVerificationStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove domain
  const handleRemoveDomain = async () => {
    if (!customDomain) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to remove domain');
      }

      setCustomDomain('');
      setDomainVerificationStatus('unverified');
      setVerificationRecord('');
      toast.success('Domain removed successfully');
      fetchDomainConfig(); // Refresh the domain data
    } catch (error: any) {
      console.error('Error removing domain:', error);
      toast.error(error.message || 'Failed to remove domain');
    } finally {
      setIsLoading(false);
    }
  };

  // Load domain config on component mount
  useEffect(() => {
    fetchDomainConfig();
  }, []);

  return (
    <Card className="dark:bg-gray-800 border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Custom Domains</CardTitle>
        <CardDescription>
          Connect your own domain to your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !customDomain ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : customDomain ? (
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
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={handleRemoveDomain}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
                </Button>
              </div>
            </div>
            {domainVerificationStatus === 'pending' && verificationRecord && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md text-sm">
                <p>To verify your domain, please add the following DNS record:</p>
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-md font-mono text-sm">
                  {verificationRecord}
                </div>
                <p className="mt-2">DNS changes may take up to 24 hours to propagate.</p>
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
                  // onKeyDown={(e) => {
                  //   if (e.key === 'Enter') {
                  //     e.preventDefault();
                  //     handleAddDomain();
                  //   }
                  // }}
                />
                <Button 
                  onClick={handleAddDomain}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Domain'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a domain like "shop.yourdomain.com" (without http://)
              </p>
            </div>
            {defaultDomain && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Default Domain</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {defaultDomain}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}