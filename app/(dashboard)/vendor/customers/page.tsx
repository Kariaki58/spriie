"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  orders: number;
  productsBought: number;
  totalSpent: number;
  lastPurchase: string;
}

type ItemsPerPage = 5 | 10 | 20;

export default function DashboardCustomers() {
  // Mock data - replace with actual API call
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      orders: 5,
      productsBought: 12,
      totalSpent: 1245990,
      lastPurchase: "2023-06-15",
    },
    {
      id: "2",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      orders: 3,
      productsBought: 8,
      totalSpent: 876500,
      lastPurchase: "2023-06-10",
    },
    {
      id: "3",
      name: "James Wilson",
      email: "james.wilson@example.com",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      orders: 7,
      productsBought: 21,
      totalSpent: 2341750,
      lastPurchase: "2023-06-18",
    },
    {
      id: "4",
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      orders: 2,
      productsBought: 4,
      totalSpent: 432000,
      lastPurchase: "2023-05-28",
    },
    {
      id: "5",
      name: "David Lee",
      email: "david.lee@example.com",
      avatar: "https://randomuser.me/api/portraits/men/85.jpg",
      orders: 4,
      productsBought: 9,
      totalSpent: 987250,
      lastPurchase: "2023-06-12",
    },
    {
      id: "6",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      orders: 6,
      productsBought: 15,
      totalSpent: 1567800,
      lastPurchase: "2023-06-20",
    },
    {
      id: "7",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      orders: 1,
      productsBought: 2,
      totalSpent: 199990,
      lastPurchase: "2023-05-15",
    },
    {
      id: "8",
      name: "Olivia Wilson",
      email: "olivia.wilson@example.com",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      orders: 9,
      productsBought: 27,
      totalSpent: 2987500,
      lastPurchase: "2023-06-22",
    },
    {
      id: "9",
      name: "Daniel Taylor",
      email: "daniel.taylor@example.com",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      orders: 3,
      productsBought: 7,
      totalSpent: 765300,
      lastPurchase: "2023-06-08",
    },
    {
      id: "10",
      name: "Sophia Martinez",
      email: "sophia.martinez@example.com",
      avatar: "https://randomuser.me/api/portraits/women/51.jpg",
      orders: 5,
      productsBought: 11,
      totalSpent: 1123450,
      lastPurchase: "2023-06-17",
    },
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(5);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Format currency in Naira with commas
  const formatNaira = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination controls
  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: ItemsPerPage): void => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and analyze your customer data
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-full"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                {itemsPerPage} per page
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleItemsPerPageChange(5)}>
                5 per page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleItemsPerPageChange(10)}>
                10 per page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleItemsPerPageChange(20)}>
                20 per page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead className="w-[200px]">Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Last Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback>
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {customer.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{customer.orders}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{customer.productsBought}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNaira(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(customer.lastPurchase)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {currentCustomers.length > 0 ? (
            currentCustomers.map((customer) => (
              <div key={customer.id} className="border-b p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback>
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNaira(customer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(customer.lastPurchase)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="font-medium">{customer.orders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="font-medium">{customer.productsBought}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No customers found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {indexOfFirstItem + 1}-{Math.min(
              indexOfLastItem,
              filteredCustomers.length
            )}
          </span>{" "}
          of <span className="font-medium">{filteredCustomers.length}</span>{" "}
          customers
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="hidden sm:inline-flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage <= 2) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {totalPages > 3 && currentPage < totalPages - 1 && (
              <span className="px-2 text-sm">...</span>
            )}
            
            {totalPages > 3 && currentPage < totalPages - 1 && (
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:inline-flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}