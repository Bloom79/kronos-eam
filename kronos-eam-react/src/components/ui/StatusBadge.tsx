import React from 'react';
import clsx from 'clsx';
import { STATUS_COLORS } from '../../constants';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span
      className={clsx(
        'font-medium rounded-full',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
};