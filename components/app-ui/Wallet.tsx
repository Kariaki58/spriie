"use client";
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, History, Eye, EyeOff, Loader2, ChevronsRight, ChevronsLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner';

const transactions = [
  {
    id: 1,
    type: 'deposit',
    amount: 50000,
    date: '2023-10-15T14:30:00',
    status: 'completed',
    reference: 'Bank Transfer',
    currency: 'NGN'
  },
  {
    id: 2,
    type: 'withdrawal',
    amount: 20000,
    date: '2023-10-14T10:15:00',
    status: 'completed',
    reference: 'Withdrawal to Bank',
    currency: 'NGN'
  },
  {
    id: 3,
    type: 'sale',
    amount: 15000,
    date: '2023-10-12T16:45:00',
    status: 'completed',
    reference: 'Order #12345',
    currency: 'NGN'
  },
  {
    id: 4,
    type: 'deposit',
    amount: 30000,
    date: '2023-10-10T09:20:00',
    status: 'pending',
    reference: 'Card Payment',
    currency: 'NGN'
  },
  {
    id: 5,
    type: 'withdrawal',
    amount: 10000,
    date: '2023-10-08T11:30:00',
    status: 'failed',
    reference: 'Withdrawal to Bank',
    currency: 'NGN'
  },
  {
    id: 6,
    type: 'sale',
    amount: 25000,
    date: '2023-10-05T13:15:00',
    status: 'completed',
    reference: 'Order #12344',
    currency: 'NGN'
  },
  {
    id: 7,
    type: 'deposit',
    amount: 45000,
    date: '2023-10-03T08:00:00',
    status: 'completed',
    reference: 'USSD Payment',
    currency: 'NGN'
  },
  {
    id: 8,
    type: 'sale',
    amount: 18000,
    date: '2023-10-01T17:25:00',
    status: 'completed',
    reference: 'Order #12343',
    currency: 'NGN'
  },
  {
    id: 9,
    type: 'withdrawal',
    amount: 5000,
    date: '2023-09-29T10:00:00',
    status: 'pending',
    reference: 'Bank Transfer',
    currency: 'NGN'
  },
  {
    id: 10,
    type: 'deposit',
    amount: 60000,
    date: '2023-09-27T12:10:00',
    status: 'completed',
    reference: 'Bank Transfer',
    currency: 'NGN'
  },
  {
    id: 11,
    type: 'sale',
    amount: 22000,
    date: '2023-09-25T09:45:00',
    status: 'completed',
    reference: 'Order #12342',
    currency: 'NGN'
  },
  
];

type WalletType = 'naira' | 'dollar';

export default function WalletDisplay() {
  const [balance, setBallance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'balance' | 'withdraw' | 'deposit'>('balance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [balanceVisible, setBalanceVisible] = useState(false);

  // Calculate paginated transactions
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Deposit state
  const [amount, setAmount] = useState<string>('');
  const [walletType, setWalletType] = useState<WalletType>('naira');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Withdrawal state
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  
  useEffect(() => {
    const fetchUserProfile = async () => {
        console.log('inside')
        const res = await fetch("/api/profile", {
            method: "GET"
        })
        const data = (await res.json()).message;

        setBallance(data.wallet)
    }

    fetchUserProfile();
  }, [])

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/wallet/funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          walletType,
          paymentMethod,
          callbackUrl: `${window.location.origin}/wallet/verify`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate deposit');
      }

      const data = await response.json();

      console.log("DATA------------>", data)
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!bank || !accountNumber || !withdrawalAmount) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    const amountValue = parseFloat(withdrawalAmount);
    if (isNaN(amountValue)) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (amountValue > balance) {
      setError('Insufficient balance');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/wallets/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        //   'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          amount: amountValue,
          bank,
          accountNumber
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Withdrawal failed');
      }

      const data = await response.json();
      toast.success('Withdrawal successful!');
    //   setBalance(prev => prev - amountValue);
      setActiveTab('balance');
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getPaginationItems = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    pages.push(1);
    
    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage > maxVisiblePages - 1) {
        pages.push('...');
      }
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= maxVisiblePages - 1) {
        end = maxVisiblePages;
      } else if (currentPage >= totalPages - (maxVisiblePages - 2)) {
        start = totalPages - (maxVisiblePages - 1);
      }
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - (maxVisiblePages - 2)) {
        pages.push('...');
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Wallet Balance Card */}
      <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-900/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Wallet Balance
          </CardTitle>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {balanceVisible ? formatCurrency(balance) : '•••••••'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Available balance
          </p>
        </CardContent>
      </Card>
      {/* Action Tabs - Made responsive */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant={activeTab === 'balance' ? 'default' : 'outline'}
          className={`${activeTab === 'balance' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''} w-full sm:w-auto`}
          onClick={() => setActiveTab('balance')}
        >
          <History className="w-4 h-4 mr-2" />
          <span className="truncate">Transactions</span>
        </Button>
        <Button
          variant={activeTab === 'withdraw' ? 'default' : 'outline'}
          className={`${activeTab === 'withdraw' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''} w-full sm:w-auto`}
          onClick={() => setActiveTab('withdraw')}
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          <span className="truncate">Withdraw</span>
        </Button>
        <Button
          variant={activeTab === 'deposit' ? 'default' : 'outline'}
          className={`${activeTab === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''} w-full sm:w-auto`}
          onClick={() => setActiveTab('deposit')}
        >
          <ArrowDownLeft className="w-4 h-4 mr-2" />
          <span className="truncate">Deposit</span>
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'balance' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Transaction History</h3>
          <div className="rounded-lg border dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Type
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Amount
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Reference
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.type === 'deposit' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3">
                              <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          )}
                          {transaction.type === 'withdrawal' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mr-3">
                              <ArrowUpRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                          )}
                          {transaction.type === 'sale' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mr-3">
                              <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          transaction.type === 'deposit' || transaction.type === 'sale'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {transaction.type === 'withdrawal' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {transaction.reference}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400'
                              : transaction.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-400'
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination remains the same */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronsLeft />
            </Button>
            
            {getPaginationItems().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className={page === '...' ? 'pointer-events-none' : ''}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      )}

      {/* Withdraw and Deposit sections remain the same but with responsive improvements */}
      {activeTab === 'withdraw' && (
        <Card className='bg-gray-800'>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="bank">
                  Select Bank
                </label>
                <Select 
                  value={bank}
                  onValueChange={setBank}
                  required
                >
                  <SelectTrigger id="bank" className="w-full">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zenith">Zenith Bank</SelectItem>
                    <SelectItem value="gtb">GTBank</SelectItem>
                    <SelectItem value="access">Access Bank</SelectItem>
                    <SelectItem value="uba">UBA</SelectItem>
                    <SelectItem value="firstbank">First Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-number">
                  Account Number
                </label>
                <Input 
                  id="account-number" 
                  placeholder="Enter account number" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="amount">
                  Amount (NGN)
                </label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-6"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Withdraw Funds'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'deposit' && (
        <Card className='bg-gray-800'>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="deposit-amount">
                  Amount (NGN)
                </label>
                <Input 
                  id="deposit-amount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wallet Type</label>
                <Select
                  value={walletType}
                  onValueChange={(value: WalletType) => setWalletType(value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select wallet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="naira">Naira Wallet</SelectItem>
                    {/* <SelectItem value="dollar">Dollar Wallet</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className={`h-16 ${paymentMethod === 'card' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Card Payment
                  </Button>
                  <Button 
                    type="button"
                    variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                    className={`h-16 ${paymentMethod === 'bank' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <Banknote className="w-5 h-5 mr-2" />
                    Bank Transfer
                  </Button>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading || !paymentMethod}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}