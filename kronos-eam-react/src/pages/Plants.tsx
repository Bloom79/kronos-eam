import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { plantsService, PlantCreate } from '../services/api';
import type { Plant, PlantFilters, PlantListResponse } from '../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState, Pagination } from '../components/ui';
import { AddPlantModal } from '../components/plants/AddPlantModal';
import { PlantsTable } from '../components/plants/PlantsTable';
import ComplianceStats from '../components/plants/ComplianceStats';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { exportToCSV, preparePlantDataForExport } from '../utils/exportUtils';
import { PLANT_STATUS, PAGINATION } from '../constants';
import { toast } from '../hooks/useToast';

const Plants: React.FC = () => {
  const { t } = useTranslation('plants');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  
  // State for plants data
  const [plantsData, setPlantsData] = useState<PlantListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch plants function
  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: PlantFilters = {};
      if (debouncedSearchTerm) {
        filters.search = debouncedSearchTerm;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const data = await plantsService.getPlants(
        currentPage,
        pageSize,
        filters,
        'name',
        'asc'
      );
      
      setPlantsData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load plants'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, filterStatus]);

  // Update pagination when data changes
  const plants = plantsData?.items || [];
  const totalItems = plantsData?.total || 0;

  // Pagination hook with actual total items
  const {
    totalPages,
    canGoNext,
    canGoPrevious,
    pageNumbers,
    goToFirstPage
  } = usePagination({
    totalItems: totalItems,
    initialPage: currentPage,
    initialPageSize: pageSize
  });

  // Fetch plants when dependencies change
  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Reset to first page on search/filter change
  useEffect(() => {
    if (debouncedSearchTerm || filterStatus !== 'all') {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, filterStatus]);

  // Handle create new plant
  const handleCreatePlant = async (data: PlantCreate) => {
    try {
      setSaving(true);
      setAddError(null);
      
      await plantsService.createPlant(data);
      
      toast.success(t('messages.createSuccess'));
      setShowAddModal(false);
      
      // Refresh list
      await fetchPlants();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common:errors.generic');
      setAddError(errorMessage);
      throw err; // Re-throw to keep modal open
    } finally {
      setSaving(false);
    }
  };

  // Handle delete plant
  const handleDeletePlant = async (id: number) => {
    try {
      await plantsService.deletePlant(id);
      toast.success(t('messages.deleteSuccess'));
      await fetchPlants();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common:errors.generic');
      toast.error(errorMessage);
      throw err;
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      // Get all plants without pagination for export
      const filters: PlantFilters = {};
      if (debouncedSearchTerm) {
        filters.search = debouncedSearchTerm;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const response = await plantsService.getPlants(
        1,
        1000, // Get all records for export
        filters,
        'name',
        'asc'
      );

      const exportData = preparePlantDataForExport(response.items);
      exportToCSV(exportData, {
        filename: 'plants_export',
        includeTimestamp: true
      });
      
      toast.success(t('messages.exportSuccess'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common:errors.generic');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Compliance Statistics */}
      {!loading && plants.length > 0 && (
        <ComplianceStats plants={plants} />
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('filters.allStatuses')}</option>
                {Object.entries(PLANT_STATUS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {t(`status.${key.toLowerCase().replace(/_/g, '')}`)}
                  </option>
                ))}
              </select>
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={t('common:filter')}
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={t('common:export')}
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">{t('addPlant')}</span>
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6">
              <ErrorMessage error={error} />
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner text={t('loading')} />
            </div>
          ) : plants.length === 0 ? (
            <EmptyState
              title={
                searchTerm || filterStatus !== 'all'
                  ? t('noResultsFound')
                  : t('noPlantsFound')
              }
              description={
                searchTerm || filterStatus !== 'all'
                  ? t('tryDifferentFilters')
                  : t('addFirstPlant')
              }
              action={
                !searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    {t('addPlant')}
                  </button>
                )
              }
            />
          ) : (
            <>
              <PlantsTable
                plants={plants}
                onDelete={handleDeletePlant}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageNumbers={pageNumbers}
                    onPageChange={setCurrentPage}
                    canGoNext={canGoNext}
                    canGoPrevious={canGoPrevious}
                    totalItems={totalItems}
                    pageSize={pageSize}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError(null);
        }}
        onSave={handleCreatePlant}
        loading={saving}
        error={addError}
      />
    </div>
  );
};

export default Plants;