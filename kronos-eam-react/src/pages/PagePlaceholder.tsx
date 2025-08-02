import React from 'react';

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({ title, description }) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="mt-8 p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Questa pagina è in fase di sviluppo
          </p>
        </div>
      </div>
    </div>
  );
};

export default PagePlaceholder;