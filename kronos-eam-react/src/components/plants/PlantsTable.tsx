import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Plant } from '../../services/api';
import { StatusBadge, ConfirmDialog } from '../ui';

interface PlantsTableProps {
  plants: Plant[];
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

export const PlantsTable: React.FC<PlantsTableProps> = ({
  plants,
  onDelete,
  loading = false
}) => {
  const { t } = useTranslation(['plants', 'common']);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
    setDropdownOpenId(null);
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

  const calculateCompliance = (checklist?: any): number => {
    if (!checklist) return 0;
    const items = Object.values(checklist);
    if (items.length === 0) return 0;
    const completed = items.filter(item => item).length;
    return Math.round((completed / items.length) * 100);
  };

  const getComplianceColor = (percentage: number): string => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDeadline = (plant: Plant) => {
    const deadline = plant.next_deadline;
    if (!deadline) return '-';
    
    return (
      <span className={clsx(
        'font-semibold',
        plant.deadline_color || 'text-gray-600'
      )}>
        {new Date(deadline).toLocaleDateString('it-IT')}
      </span>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">
                {t('table.name')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('table.power')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('table.status')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('table.location')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('table.nextDeadline')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('table.compliance')}
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">{t('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => {
              const compliancePercentage = calculateCompliance(plant.checklist);
              const isDeleting = deletingId === plant.id;
              
              return (
                <tr
                  key={plant.id}
                  className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {plant.name}
                  </th>
                  <td className="px-6 py-4">
                    {plant.power}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={plant.status} />
                  </td>
                  <td className="px-6 py-4">
                    {plant.location}
                  </td>
                  <td className="px-6 py-4">
                    {formatDeadline(plant)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={clsx('h-2 rounded-full', getComplianceColor(compliancePercentage))}
                          style={{ width: `${compliancePercentage}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {compliancePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/plants/${plant.id}`}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('common.details')}
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpenId(dropdownOpenId === plant.id ? null : plant.id)}
                          className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </button>
                        {dropdownOpenId === plant.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => handleDeleteClick(plant.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('deleteConfirm.title')}
        message={t('deleteConfirm.message')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={deletingId !== null}
      />
    </>
  );
};