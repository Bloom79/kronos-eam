import React from 'react';
import { Grid3x3, List } from 'lucide-react';
import clsx from 'clsx';

export type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
      <button
        onClick={() => onViewChange('grid')}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
          currentView === 'grid'
            ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        )}
        aria-label="Grid view"
      >
        <Grid3x3 className="h-5 w-5" />
        <span className="text-sm font-medium">Grid</span>
      </button>

      <button
        onClick={() => onViewChange('table')}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
          currentView === 'table'
            ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        )}
        aria-label="Table view"
      >
        <List className="h-5 w-5" />
        <span className="text-sm font-medium">Table</span>
      </button>
    </div>
  );
};

export default ViewToggle;