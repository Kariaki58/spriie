"use client";

import { useState } from 'react';
import { SquarePen, Trash2, Save, X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

type Review = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  date: string;
  comment: string;
};

export default function UserDashboardReview() {
  const [reviews, setReviews] = useState<Review[]>([
    // ... (previous dummy data remains the same)
    // Adding more items for pagination demo
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `rev${i + 4}`,
      productId: `prod${i + 4}`,
      productName: `Product ${i + 4}`,
      productImage: 'https://via.placeholder.com/80',
      rating: Math.floor(Math.random() * 5) + 1,
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      comment: `This is a sample review comment for product ${i + 4}.`
    }))
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedReview, setEditedReview] = useState<Partial<Review>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Calculate pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditedReview({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleSave = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, ...editedReview }
        : review
    ));
    setEditingId(null);
    setEditedReview({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedReview({});
  };

  const handleDelete = (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    // Reset to first page if current page becomes empty
    if (currentReviews.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setEditedReview(prev => ({ ...prev, rating: newRating }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedReview(prev => ({ ...prev, comment: e.target.value }));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Maximum pages to show before using ellipsis

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Determine if we should show ellipsis after first page
      if (currentPage > maxVisiblePages - 2) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start or end
      if (currentPage <= maxVisiblePages - 2) {
        endPage = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - (maxVisiblePages - 3)) {
        startPage = totalPages - (maxVisiblePages - 2);
      }

      // Push the calculated range
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pageNumbers.push(i);
        }
      }

      // Determine if we should show ellipsis before last page
      if (currentPage < totalPages - (maxVisiblePages - 3)) {
        pageNumbers.push(-1); // -1 represents ellipsis
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((number, index) => {
      if (number === -1) {
        return (
          <span key={`ellipsis-${index}`} className="px-2 py-1">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </span>
        );
      }
      return (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`px-3 py-1 rounded-md ${
            currentPage === number
              ? 'bg-emerald-600 text-white dark:bg-emerald-700'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {number}
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-emerald-100">Your Reviews</h1>
          <p className="text-gray-600 dark:text-emerald-200">
            Showing {indexOfFirstReview + 1}-{Math.min(indexOfLastReview, reviews.length)} of {reviews.length} reviews
          </p>
        </div>

        {currentReviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-emerald-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-emerald-100">
              No reviews yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-emerald-300">
              Your product reviews will appear here once you submit them.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {currentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
                >
                    <div
                        key={review.id}
                        className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
                    >
                        <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <img
                                className="h-16 w-16 rounded-md object-cover"
                                src={review.productImage}
                                alt={review.productName}
                                />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                                <a href={`/products/${review.productId}`}>{review.productName}</a>
                                </h3>
                                
                                {editingId === review.id ? (
                                <div className="mt-1">
                                    <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(star)}
                                        className="focus:outline-none"
                                        >
                                        <svg
                                            className={`h-6 w-6 ${
                                            star <= (editedReview.rating || review.rating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-500'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        </button>
                                    ))}
                                    </div>
                                </div>
                                ) : (
                                <div className="flex items-center mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={`h-5 w-5 ${
                                        star <= review.rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-500'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    ))}
                                </div>
                                )}
                                
                                <p className="mt-1 text-sm text-gray-500 dark:text-emerald-300">
                                Reviewed on {new Date(review.date).toLocaleDateString()}
                                </p>
                            </div>
                            </div>
                            <div className="flex space-x-2">
                            {editingId === review.id ? (
                                <>
                                <button
                                    onClick={() => handleSave(review.id)}
                                    className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                    aria-label="Save review"
                                >
                                    <Save className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    aria-label="Cancel edit"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                </>
                            ) : (
                                <>
                                <button
                                    onClick={() => handleEdit(review)}
                                    className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    aria-label="Edit review"
                                >
                                    <SquarePen className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    aria-label="Delete review"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                                </>
                            )}
                            </div>
                        </div>
                        <div className="mt-4">
                            {editingId === review.id ? (
                            <textarea
                                value={editedReview.comment || review.comment}
                                onChange={handleCommentChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                                rows={3}
                            />
                            ) : (
                            <p className="text-sm text-gray-700 dark:text-emerald-200">{review.comment}</p>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{indexOfFirstReview + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastReview, reviews.length)}</span> of{' '}
                    <span className="font-medium">{reviews.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {renderPageNumbers()}
                    
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}