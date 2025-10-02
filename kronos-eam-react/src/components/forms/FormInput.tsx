import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import clsx from 'clsx';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  register,
  error,
  required,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        {...register(name)}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg shadow-sm',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
          {
            'border-red-500 dark:border-red-500': error,
            'border-gray-300': !error,
          },
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
};