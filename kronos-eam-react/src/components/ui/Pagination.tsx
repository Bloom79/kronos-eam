import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange,
  canGoNext,
  canGoPrevious,
  totalItems,
  pageSize,
  className
}) => {
  if (totalPages <= 1) return null;

  const renderPageButton = (pageNum: number, index: number) => {
    if (pageNum === -1) {
      return (
        <span
          key={`dots-${index}`}
          className="px-3 py-1 text-gray-500 dark:text-gray-400"
        >
          <MoreHorizontal className="h-4 w-4" />
        </span>
      );
    }

    return (
      <button
        key={pageNum}
        onClick={() => onPageChange(pageNum)}
        className={clsx(
          'px-3 py-1 rounded transition-colors',
          pageNum === currentPage
            ? 'bg-blue-600 text-white'
            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        )}
      >
        {pageNum}
      </button>
    );
  };

  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {totalItems && pageSize && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing{' '}
          <span className="font-semibold">
            {(currentPage - 1) * pageSize + 1}
          </span>
          {' - '}
          <span className="font-semibold">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>
          {' of '}
          <span className="font-semibold">{totalItems}</span> results
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={clsx(
            'px-3 py-1 border rounded flex items-center gap-1 transition-colors',
            canGoPrevious
              ? 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => renderPageButton(pageNum, index))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={clsx(
            'px-3 py-1 border rounded flex items-center gap-1 transition-colors',
            canGoNext
              ? 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};