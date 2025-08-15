"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // Get orderId from path parameter
  const orderId = params?.id as string
  // Get confirmToken from query parameter
  const confirmToken = searchParams.get('comfirmToken')
  
  const [isConfirming, setIsConfirming] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [problemDescription, setProblemDescription] = useState('')
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!orderId || !confirmToken) {
        setIsValidToken(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/orders/${orderId}/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confirmToken }),
        })

        if (!response.ok) throw new Error('Token verification failed')
        
        const data = await response.json()
        setIsValidToken(data.isValid)
      } catch (error) {
        console.error('Verification error:', error)
        setIsValidToken(false)
        toast.error('Failed to verify confirmation link')
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [orderId, confirmToken])

  const handleConfirmDelivery = async () => {
    if (!orderId || !confirmToken || !isValidToken) {
      toast.error('Invalid confirmation link')
      return
    }

    try {
      setIsConfirming(true)
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmToken }),
      })

      if (!response.ok) throw new Error('Confirmation failed')

      toast.success('Order confirmed successfully! Funds will be released to the seller.')
      router.push('/user/orders')
    } catch (error) {
      console.error('Confirmation error:', error)
      toast.error('Failed to confirm order. Please try again.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleReportProblem = async () => {
    if (!orderId || !confirmToken || !isValidToken) {
      toast.error('Invalid confirmation link')
      return
    }

    try {
      if (!problemDescription.trim()) {
        toast.warning('Please describe the problem')
        return
      }

      setIsReporting(true)
      const response = await fetch(`/api/orders/${orderId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          confirmToken,
          problem: problemDescription 
        }),
      })

      if (!response.ok) throw new Error('Report submission failed')

      toast.success('Problem reported successfully! Our team will contact you shortly.')
      router.push('/user/orders')
    } catch (error) {
      console.error('Report error:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!orderId || !confirmToken || isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-200">
            {!orderId || !confirmToken ? 'Invalid Confirmation Link' : 'Expired Confirmation Link'}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {!orderId || !confirmToken 
              ? 'Please use the link from your email to confirm your order delivery.'
              : 'This confirmation link has expired or is invalid. Please contact support if you need assistance.'}
          </p>
          <div className="mt-5">
            <Link
              href="/user/orders"
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Go to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Order Confirmation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Order #{orderId}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          {/* Order Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Delivered</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your order has been delivered successfully
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-sm rounded-full">
              Completed
            </span>
          </div>

          {/* Confirmation Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              Confirm your delivery
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please confirm that you've received your order in good condition. 
              This will release the payment to the seller.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmDelivery}
                disabled={isConfirming || isReporting}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isConfirming ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming...
                  </span>
                ) : (
                  'Confirm Delivery'
                )}
              </button>
              
              <button
                onClick={() => setIsReporting(true)}
                disabled={isReporting || isConfirming}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Report a Problem
              </button>
            </div>
          </div>

          {/* Problem Report Form (Conditional) */}
          {isReporting && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Describe the problem
              </h3>
              
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                rows={4}
                placeholder="Please describe any issues with your order..."
              />
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleReportProblem}
                  disabled={!problemDescription.trim() || isConfirming}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about your order, our support team is here to help.
            </p>
            <Link 
              href="/support" 
              className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Contact support
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Order Details Link */}
        <div className="mt-4 text-center">
          <Link 
            href={`/user/orders/${orderId}`}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View full order details
          </Link>
        </div>
      </div>
    </div>
  )
}