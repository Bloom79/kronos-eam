import React from 'react';
import clsx from 'clsx';

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'button' | 'avatar' | 'thumbnail' | 'card' | 'table-row';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  width,
  height,
  className,
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const typeClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    button: 'h-10 w-24',
    avatar: 'h-10 w-10 rounded-full',
    thumbnail: 'h-32 w-32',
    card: 'h-48 w-full',
    'table-row': 'h-16 w-full'
  };

  const skeletonClass = clsx(
    baseClasses,
    typeClasses[type],
    className
  );

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={style}
        />
      ))}
    </>
  );
};

// Table skeleton component
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 5 
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader
            key={`header-${i}`}
            type="text"
            className="h-5"
            width={i === 0 ? '150px' : '100px'}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader
              key={`cell-${rowIndex}-${colIndex}`}
              type="text"
              width={colIndex === 0 ? '150px' : '100px'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card skeleton component
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <SkeletonLoader type="title" width="60%" />
            <SkeletonLoader type="button" />
          </div>
          <SkeletonLoader type="text" count={3} className="mb-2" />
          <div className="flex gap-4 mt-4">
            <SkeletonLoader type="button" />
            <SkeletonLoader type="button" />
          </div>
        </div>
      ))}
    </>
  );
};