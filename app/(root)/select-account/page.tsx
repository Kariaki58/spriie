"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, User, ChevronRight } from 'lucide-react';

type AccountType = 'vendor' | 'user' | null;

const AccountTypeSelector = () => {
  const [selectedType, setSelectedType] = useState<AccountType>(null);
  const router = useRouter();

  const handleSelect = (type: AccountType) => {
    setSelectedType(type);
    switch (type) {
      case 'vendor':
        router.push('/store');
        break;
      case 'user':
        router.push('/');
        break;
    }
  };

  return (
    <div className="max-w-md m-auto p-6 bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl h-screen overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Join as a vendor or user</h2>
        <p className="mt-2 text-gray-600">Select the account type that matches your needs</p>
      </div>

      <div className="space-y-4">
        {/* Vendor Account Option */}
        <div 
          onClick={() => handleSelect('vendor')}
          className={`flex items-center p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedType === 'vendor' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className={`p-3 rounded-full mr-4 ${
            selectedType === 'vendor' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <Store size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Vendor Account</h3>
            <p className="text-sm text-gray-600 mt-1">
              Sell products or services, manage your store, and reach customers.
            </p>
          </div>
          <ChevronRight 
            size={20} 
            className={`ml-2 ${
              selectedType === 'vendor' ? 'text-emerald-500' : 'text-gray-400'
            }`} 
          />
        </div>

        <div 
          onClick={() => handleSelect('user')}
          className={`flex items-center p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedType === 'user' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className={`p-3 rounded-full mr-4 ${
            selectedType === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <User size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">User Account</h3>
            <p className="text-sm text-gray-600 mt-1">
              Browse products, make purchases, and manage your orders.
            </p>
          </div>
          <ChevronRight 
            size={20} 
            className={`ml-2 ${
              selectedType === 'user' ? 'text-emerald-500' : 'text-gray-400'
            }`} 
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/auth/register')}
            className="text-emerald-500 hover:underline focus:outline-none"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default AccountTypeSelector;