import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../constants';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  pageNumbers: number[];
  startIndex: number;
  endIndex: number;
}

/**
 * Hook for managing pagination state
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => 
    Math.ceil(totalItems / pageSize), 
    [totalItems, pageSize]
  );

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const goToFirstPage = useCallback(() => setCurrentPage(1), []);
  const goToLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);
  
  const goToNextPage = useCallback(() => {
    if (canGoNext) setCurrentPage(prev => prev + 1);
  }, [canGoNext]);

  const goToPreviousPage = useCallback(() => {
    if (canGoPrevious) setCurrentPage(prev => prev - 1);
  }, [canGoPrevious]);

  // Calculate visible page numbers for pagination UI
  const pageNumbers = useMemo(() => {
    const delta = 2; // Pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i, index) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // -1 represents dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }, [currentPage, totalPages]);

  // Calculate start and end indices for current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // Reset to first page when page size changes
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    pageNumbers,
    startIndex,
    endIndex
  };
}