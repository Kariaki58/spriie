"use client";
import {
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function Moneybills() {
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

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }


    return (
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
    )
}