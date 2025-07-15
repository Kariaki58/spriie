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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      totalSpent: 1245.99,
      lastPurchase: "2023-06-15",
    },
    {
      id: "2",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      orders: 3,
      productsBought: 8,
      totalSpent: 876.5,
      lastPurchase: "2023-06-10",
    },
    {
      id: "3",
      name: "James Wilson",
      email: "james.wilson@example.com",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      orders: 7,
      productsBought: 21,
      totalSpent: 2341.75,
      lastPurchase: "2023-06-18",
    },
    {
      id: "4",
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      orders: 2,
      productsBought: 4,
      totalSpent: 432.0,
      lastPurchase: "2023-05-28",
    },
    {
      id: "5",
      name: "David Lee",
      email: "david.lee@example.com",
      avatar: "https://randomuser.me/api/portraits/men/85.jpg",
      orders: 4,
      productsBought: 9,
      totalSpent: 987.25,
      lastPurchase: "2023-06-12",
    },
    {
      id: "6",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      orders: 6,
      productsBought: 15,
      totalSpent: 1567.8,
      lastPurchase: "2023-06-20",
    },
    {
      id: "7",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      orders: 1,
      productsBought: 2,
      totalSpent: 199.99,
      lastPurchase: "2023-05-15",
    },
    {
      id: "8",
      name: "Olivia Wilson",
      email: "olivia.wilson@example.com",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      orders: 9,
      productsBought: 27,
      totalSpent: 2987.5,
      lastPurchase: "2023-06-22",
    },
    {
      id: "9",
      name: "Daniel Taylor",
      email: "daniel.taylor@example.com",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      orders: 3,
      productsBought: 7,
      totalSpent: 765.3,
      lastPurchase: "2023-06-08",
    },
    {
      id: "10",
      name: "Sophia Martinez",
      email: "sophia.martinez@example.com",
      avatar: "https://randomuser.me/api/portraits/women/51.jpg",
      orders: 5,
      productsBought: 11,
      totalSpent: 1123.45,
      lastPurchase: "2023-06-17",
    },
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-xs"
          />
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm text-gray-800 dark:text-white dark:bg-black"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-right">Last Purchase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.length > 0 ? (
              currentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {customer.email}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">{customer.orders}</TableCell>
                  <TableCell className="text-right">
                    {customer.productsBought}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(customer.lastPurchase)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 mt-4">
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
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
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
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
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-2">...</span>
          )}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </Button>
          )}
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
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}