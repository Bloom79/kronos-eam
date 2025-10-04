import React, { useState } from 'react';
import { Plant } from '../../services/api';
import PlantCard from './PlantCard';
import { ConfirmDialog } from '../ui';
import { useTranslation } from 'react-i18next';

interface PlantsGridProps {
  plants: Plant[];
  onDelete: (id: number) => Promise<void>;
  onEdit?: (plant: Plant) => void;
  onView?: (plant: Plant) => void;
  loading?: boolean;
}

export const PlantsGrid: React.FC<PlantsGridProps> = ({
  plants,
  onDelete,
  onEdit,
  onView,
  loading = false
}) => {
  const { t } = useTranslation(['plants', 'common']);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId === null) return;

    try {
      setDeletingId(deleteConfirmId);
      await onDelete(deleteConfirmId);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const handleDelete = async (id: number) => {
    handleDeleteClick(id);
  };

  if (loading) {
    // Loading skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-2 bg-gray-300 dark:bg-gray-700" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div>
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="flex gap-2">
                    <div className="h-5 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onDelete={handleDelete}
            onEdit={onEdit}
            onView={onView}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('deleteTitle')}
        message={t('deleteMessage')}
        confirmText={t('common:delete')}
        cancelText={t('common:cancel')}
        loading={deletingId !== null}
        variant="danger"
      />
    </>
  );
};

export default PlantsGrid;