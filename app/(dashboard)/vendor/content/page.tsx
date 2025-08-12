"use client";

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountedPrice: number;
  inventory: number;
  thumbnail: string;
  hasVariants: boolean;
  attributes: {
    name: string;
    values: { value: string; label: string }[];
  }[];
  createdAt: string;
}

export default function DashboardContentDisplay() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("here")
        const response = await fetch('/api/content/upload');
        const data = await response.json();

        console.log(data);
        setProducts(data.message);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(product => product._id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const calculateDiscountPercentage = (basePrice: number, discountedPrice: number) => {
    return Math.round(((basePrice - discountedPrice) / basePrice) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[100px]">Thumbnail</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Inventory</TableHead>
            <TableHead className="text-center">Variants</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <React.Fragment key={product._id}>
                <TableRow key={product._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <TableCell>
                    <div className="relative h-16 w-16">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="rounded-md object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{product.title}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className="font-medium">₦{product.discountedPrice.toLocaleString()}</span>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                          ₦{product.basePrice.toLocaleString()}
                        </span>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full">
                          {calculateDiscountPercentage(product.basePrice, product.discountedPrice)}%
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={product.inventory > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {product.inventory.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.hasVariants ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(product._id)}
                        className="flex items-center gap-1"
                      >
                        {expandedProduct === product._id ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            <span>Show</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/vendor/content/${product._id}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={() => deleteProduct(product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedProduct === product._id && product.hasVariants && (
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableCell colSpan={6}>
                      <div className="p-4">
                        <h4 className="font-medium mb-2">Product Variants</h4>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {product.attributes.map((attribute, index) => (
                            <div key={index} className="border rounded-lg p-3 dark:border-gray-700">
                              <h5 className="font-medium mb-2">{attribute.name}</h5>
                              <div className="flex flex-wrap gap-2">
                                {attribute.values.map((value, valueIndex) => (
                                  <span
                                    key={valueIndex}
                                    className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-200"
                                  >
                                    {value.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}