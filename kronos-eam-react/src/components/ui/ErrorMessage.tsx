import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  error: string | Error | null;
  title?: string;
  onDismiss?: () => void;
  variant?: 'inline' | 'banner' | 'toast';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title = 'Error',
  onDismiss,
  variant = 'inline',
  className
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  const baseClasses = 'flex items-start gap-3';
  
  const variantClasses = {
    inline: 'p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
    banner: 'p-4 bg-red-600 text-white',
    toast: 'p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-red-200 dark:border-red-800'
  };

  const iconColorClasses = {
    inline: 'text-red-600 dark:text-red-400',
    banner: 'text-white',
    toast: 'text-red-600 dark:text-red-400'
  };

  const textColorClasses = {
    inline: 'text-red-700 dark:text-red-300',
    banner: 'text-white',
    toast: 'text-gray-700 dark:text-gray-300'
  };

  return (
    <div className={clsx(baseClasses, variantClasses[variant], className)}>
      <AlertCircle className={clsx('h-5 w-5 flex-shrink-0', iconColorClasses[variant])} />
      <div className="flex-1">
        {title && variant !== 'inline' && (
          <h3 className={clsx('font-semibold mb-1', textColorClasses[variant])}>
            {title}
          </h3>
        )}
        <p className={textColorClasses[variant]}>{errorMessage}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={clsx(
            'flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10',
            iconColorClasses[variant]
          )}
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};