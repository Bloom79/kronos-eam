import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlantCreate } from '../../services/api';
import { PLANT_STATUS, PLANT_TYPES } from '../../constants';
import { ErrorMessage } from '../ui';
import { FormInput, FormSelect } from '../forms';

// Validation schema
const plantFormSchema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  code: z.string().min(1, 'Plant code is required'),
  power_kw: z.number().positive('Power must be positive'),
  status: z.nativeEnum(PLANT_STATUS),
  type: z.nativeEnum(PLANT_TYPES),
  location: z.string().min(1, 'Location is required'),
  municipality: z.string().min(1, 'Municipality is required'),
  province: z.string().min(1, 'Province is required').max(2, 'Province code must be 2 characters'),
  region: z.string().min(1, 'Region is required')
});

type PlantFormData = z.infer<typeof plantFormSchema>;

interface AddPlantModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: PlantCreate) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const AddPlantModalV2: React.FC<AddPlantModalV2Props> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
  error
}) => {
  const { t } = useTranslation(['plants', 'common']);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<PlantFormData>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      status: PLANT_STATUS.IN_AUTHORIZATION,
      type: PLANT_TYPES.PHOTOVOLTAIC,
      power_kw: 0
    }
  });

  const powerKw = watch('power_kw');

  if (!isOpen) return null;

  const onSubmit = async (data: PlantFormData) => {
    const submitData: PlantCreate = {
      ...data,
      power: `${data.power_kw} kW`
    };
    await onSave(submitData);
    if (!error) {
      reset();
    }
  };

  const handlePowerChange = (kw: number) => {
    setValue('power_kw', kw);
  };

  const statusOptions = Object.entries(PLANT_STATUS).map(([key, value]) => ({
    value: value,
    label: t(`status.${key.toLowerCase().replace(/_/g, '')}`)
  }));

  const typeOptions = Object.entries(PLANT_TYPES).map(([key, value]) => ({
    value: value,
    label: t(`types.${key.toLowerCase()}`)
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('addNewPlant')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-6">
              <ErrorMessage error={new Error(error)} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('fields.name')}
              name="name"
              register={register}
              error={errors.name}
              required
              placeholder={t('placeholders.name')}
            />

            <FormInput
              label={t('fields.code')}
              name="code"
              register={register}
              error={errors.code}
              required
              placeholder={t('placeholders.code')}
            />

            <FormSelect
              label={t('fields.type')}
              name="type"
              register={register}
              error={errors.type}
              required
              options={typeOptions}
            />

            <FormSelect
              label={t('fields.status')}
              name="status"
              register={register}
              error={errors.status}
              required
              options={statusOptions}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('fields.power')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  {...register('power_kw', { valueAsNumber: true })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="1000"
                />
                <span className="flex items-center px-3 text-gray-500 dark:text-gray-400">kW</span>
              </div>
              {errors.power_kw && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.power_kw.message}
                </p>
              )}
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                = {(powerKw / 1000).toFixed(2)} MW
              </div>
            </div>

            <FormInput
              label={t('fields.location')}
              name="location"
              register={register}
              error={errors.location}
              required
              placeholder={t('placeholders.location')}
            />

            <FormInput
              label={t('fields.municipality')}
              name="municipality"
              register={register}
              error={errors.municipality}
              required
            />

            <FormInput
              label={t('fields.province')}
              name="province"
              register={register}
              error={errors.province}
              required
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
            />

            <FormInput
              label={t('fields.region')}
              name="region"
              register={register}
              error={errors.region}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common:save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};