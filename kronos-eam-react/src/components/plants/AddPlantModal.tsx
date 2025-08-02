import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlantCreate } from '../../services/api';
import { PLANT_STATUS, PLANT_TYPES } from '../../constants';
import { ErrorMessage } from '../ui';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlantCreate) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: PlantCreate = {
  name: '',
  code: '',
  power: '',
  power_kw: 0,
  status: PLANT_STATUS.IN_AUTHORIZATION,
  type: PLANT_TYPES.PHOTOVOLTAIC,
  location: '',
  municipality: '',
  province: '',
  region: ''
};

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
  error
}) => {
  const { t } = useTranslation(['plants', 'common']);
  const [formData, setFormData] = useState<PlantCreate>(initialFormData);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // Reset form on successful save (handled by parent)
    if (!error) {
      setFormData(initialFormData);
    }
  };

  const handlePowerChange = (kw: number) => {
    const power = kw >= 1000 ? `${(kw / 1000).toFixed(1)} MW` : `${kw} kW`;
    setFormData(prev => ({
      ...prev,
      power_kw: kw,
      power: power
    }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {t('addNewPlant')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name and Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder={t('placeholders.name')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.code')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder={t('placeholders.code')}
                />
              </div>
            </div>

            {/* Power and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.power')} (kW) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.power_kw || ''}
                  onChange={(e) => handlePowerChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
                {formData.power_kw > 0 && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formData.power}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.type')} *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  {Object.entries(PLANT_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {t(`types.${key.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('fields.location')} *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('placeholders.location')}
              />
            </div>

            {/* Municipality, Province, Region */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.municipality')}
                </label>
                <input
                  type="text"
                  value={formData.municipality || ''}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.province')}
                </label>
                <input
                  type="text"
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="BR"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('fields.region')}
                </label>
                <input
                  type="text"
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('fields.status')} *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                {Object.entries(PLANT_STATUS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {t(`status.${key.toLowerCase().replace(/_/g, '')}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4">
              <ErrorMessage error={error} />
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};