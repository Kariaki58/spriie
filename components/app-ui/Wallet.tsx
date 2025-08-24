"use client";
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, History, Eye, EyeOff, Loader2, ChevronsRight, ChevronsLeft, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

type TransactionStatus = 'pending' | 'completed' | 'failed';
type WalletType = 'naira' | 'dollar';
type PaymentMethod = 'card' | 'bank' | '';
type SortField = 'createdAt' | 'amount';
type SortOrder = 'asc' | 'desc';


type TransactionType = 'fund' | 'withdraw' | 'buy' | 'sale' | 'refund' | 'held' | 'released';

interface ApiTransaction {
  _id: string;
  fromUserId: {
    _id: string;
    name?: string;
    email?: string;
  };
  toUserId: {
    _id: string;
    name?: string;
    email?: string;
  };
  type: TransactionType;
  amount: number;
  platformFee: number;
  status: TransactionStatus;
  paymentMethod: 'wallet' | 'paystack';
  createdAt: string;
  updatedAt: string;
}

export default function WalletDisplay() {
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'balance' | 'withdraw' | 'deposit'>('balance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [apiTransactions, setApiTransactions] = useState<ApiTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { data: session } = useSession();

  // Deposit state
  const [amount, setAmount] = useState<string>('');
  const [walletType, setWalletType] = useState<WalletType>('naira');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Withdrawal state
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "GET"
        });
        const data = await res.json();
        setBalance(data.message.wallet);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load wallet balance");
      }
    };

    fetchUserProfile();
  }, []);

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const res = await fetch(
        `/api/transactions?page=${currentPage}&limit=${itemsPerPage}&sortField=${sortField}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      
      if (res.ok) {
        setApiTransactions(data.transactions);
        setTotalTransactions(data.pagination.total);
      } else {
        toast.error(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error(error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'balance') {
      fetchTransactions();
    }
  }, [currentPage, sortField, sortOrder, activeTab]);

  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when changing sort
  };
  
  const isSeller = (transaction: ApiTransaction) => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) {}
    else
      return transaction.toUserId._id === currentUserId;
  };

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
      setBalance(prev => prev - amountValue);
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

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'fund':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'withdraw':
        return <ArrowUpRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'buy':
      case 'sale':
      case 'refund':
        return <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'held':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'released':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default:
        return <Banknote className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTransactionBgColor = (type: TransactionType) => {
    switch (type) {
      case 'fund':
        return 'bg-emerald-100 dark:bg-emerald-900/50';
      case 'withdraw':
        return 'bg-rose-100 dark:bg-rose-900/50';
      case 'buy':
      case 'sale':
      case 'refund':
        return 'bg-amber-100 dark:bg-amber-900/50';
      case 'held':
        return 'bg-yellow-100 dark:bg-yellow-900/50';
      case 'released':
        return 'bg-green-100 dark:bg-green-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400';
      case 'failed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400';
    }
  };

  const getPaginationItems = () => {
    const pages = [];
    const maxVisiblePages = 10;
    
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

      {/* Action Tabs */}
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
                    <TableHead 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortField === 'amount' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === 'createdAt' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
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
                  {isLoadingTransactions ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : apiTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction._id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getTransactionBgColor(transaction.type)} flex items-center justify-center mr-3`}>
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${
                            transaction.type === 'fund' || transaction.type === 'sale' || transaction.type === 'refund' || transaction.type === 'released'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : transaction.type === 'held'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {transaction.type === 'withdraw' || transaction.type === 'buy' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </span>
                          {transaction.type === 'released' && isSeller(transaction) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Fee: {formatCurrency(transaction.platformFee)} (5%)
                            </div>
                          )}
                        </div>
                      </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {transaction.paymentMethod === 'paystack' ? 'Paystack Payment' : 'Wallet Transfer'}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoadingTransactions}
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
                disabled={isLoadingTransactions}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isLoadingTransactions}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <Card className='bg-gray-900'>
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

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <Card className='bg-gray-900'>
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
                    <SelectItem value="dollar">Dollar Wallet</SelectItem>
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