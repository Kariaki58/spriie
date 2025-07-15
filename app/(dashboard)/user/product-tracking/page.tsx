"use client";

import { useState } from 'react';

type TrackingStatus = 
  | 'Order Processed'
  | 'Ready for Shipment'
  | 'Shipped'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Exception';

interface Product {
  name: string;
  image: string;
  price: string;
  orderDate: string;
}

interface ShippingInfo {
  carrier: string;
  service: string;
  weight: string;
  dimensions: string;
}

interface TrackingHistoryItem {
  date: string;
  status: string;
  location: string;
}

interface TrackingData {
  id: string;
  status: TrackingStatus;
  estimatedDelivery: string;
  product: Product;
  shipping: ShippingInfo;
  history: TrackingHistoryItem[];
}

export default function ProductTrackingDashboard() {
  const [trackingId, setTrackingId] = useState<string>('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sample tracking data
  const dummyTrackingData: TrackingData = {
    id: "EMB789456123",
    status: "Out for Delivery",
    estimatedDelivery: "Today by 9:00 PM",
    product: {
      name: "Wireless Noise-Cancelling Headphones",
      image: "https://via.placeholder.com/80",
      price: "$199.99",
      orderDate: "June 15, 2023"
    },
    shipping: {
      carrier: "FedEx",
      service: "Standard Shipping",
      weight: "0.5 kg",
      dimensions: "20 × 15 × 10 cm"
    },
    history: [
      {
        date: "June 18, 2023 9:30 AM",
        status: "Out for Delivery",
        location: "Your City, ST"
      },
      {
        date: "June 18, 2023 5:15 AM",
        status: "Arrived at Local Facility",
        location: "Your City, ST"
      },
      {
        date: "June 17, 2023 11:20 PM",
        status: "Departed Regional Facility",
        location: "Nearby City, ST"
      },
      {
        date: "June 16, 2023 3:45 PM",
        status: "Processed at Origin Facility",
        location: "Origin City, ST"
      },
      {
        date: "June 15, 2023 6:30 PM",
        status: "Order Processed: Ready for Shipment",
        location: "Warehouse"
      }
    ]
  };

  const handleTrack = () => {
    if (!trackingId.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData(dummyTrackingData);
      setIsLoading(false);
    }, 1000);
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingData?.id || '');
    // You might want to add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-emerald-100 mb-2">Track Your Product</h1>
          <p className="text-gray-600 dark:text-emerald-200">Enter your tracking ID to check the status of your order</p>
          <p className="text-sm text-gray-500 dark:text-emerald-300 mt-2">
            Try this sample ID: <span 
              className="font-mono cursor-pointer text-emerald-600 dark:text-emerald-400 hover:underline"
              onClick={() => setTrackingId("EMB789456123")}
            >
              EMB789456123
            </span>
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label htmlFor="tracking-id" className="block text-sm font-medium text-gray-700 dark:text-emerald-100 mb-1">
              Tracking ID
            </label>
            <div className="flex">
              <input
                type="text"
                id="tracking-id"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g. EMB789456123"
              />
              <button
                type="button"
                onClick={handleTrack}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:focus:ring-emerald-500 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tracking...
                  </>
                ) : 'Track'}
              </button>
            </div>
          </div>
        </div>

        {trackingData ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-emerald-100">Tracking Information</h2>
              <div className="mt-1 flex items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  trackingData.status === "Delivered" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : trackingData.status === "Out for Delivery"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}>
                  {trackingData.status}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-emerald-300">
                  {trackingData.estimatedDelivery}
                </span>
              </div>
            </div>
            
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Info */}
                <div className="col-span-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-emerald-300 mb-2">PRODUCT</h3>
                  <div className="flex items-center">
                    <img 
                      src="/product.jpg" 
                      alt={trackingData.product.name} 
                      className="w-16 h-16 rounded-md object-cover mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-emerald-100">{trackingData.product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-emerald-300">{trackingData.product.price}</p>
                      <p className="text-xs text-gray-400 dark:text-emerald-400">Ordered: {trackingData.product.orderDate}</p>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Info */}
                <div className="col-span-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-emerald-300 mb-2">SHIPPING DETAILS</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900 dark:text-emerald-100">
                      <span className="font-medium">Carrier:</span> {trackingData.shipping.carrier}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-emerald-100">
                      <span className="font-medium">Service:</span> {trackingData.shipping.service}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-emerald-100">
                      <span className="font-medium">Weight:</span> {trackingData.shipping.weight}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-emerald-100">
                      <span className="font-medium">Dimensions:</span> {trackingData.shipping.dimensions}
                    </p>
                  </div>
                </div>
                
                {/* Tracking Info */}
                <div className="col-span-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-emerald-300 mb-2">TRACKING NUMBER</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="font-mono text-sm text-gray-900 dark:text-emerald-100">{trackingData.id}</p>
                    <button 
                      onClick={copyTrackingNumber}
                      className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Copy Tracking Number
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tracking History */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-500 dark:text-emerald-300 mb-4">SHIPPING UPDATES</h3>
                <div className="space-y-4">
                  {trackingData.history.map((item, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 
                            ? "bg-emerald-500 ring-2 ring-emerald-300"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}></div>
                        {index !== trackingData.history.length - 1 && (
                          <div className="w-px h-full bg-gray-200 dark:bg-gray-600"></div>
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-emerald-100">{item.status}</p>
                        <p className="text-xs text-gray-500 dark:text-emerald-300">{item.date}</p>
                        <p className="text-xs text-gray-400 dark:text-emerald-400">{item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-emerald-100">Tracking Information</h2>
            </div>
            
            <div className="px-6 py-5">
              <div className="flex justify-center py-8">
                <div className="text-center text-gray-500 dark:text-emerald-200">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-emerald-100">
                    {isLoading ? 'Tracking your package...' : 'Enter a tracking ID'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-emerald-200">
                    {isLoading ? 'Fetching your tracking details' : 'Your tracking details will appear here once you submit a valid ID.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}