import React, { useState } from 'react';
import {
  MoreVertical,
  MapPin,
  Zap,
  Calendar,
  CheckCircle,
  XCircle,
  Sun,
  Wind,
  Droplets,
  Leaf,
  Flame,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Plant } from '../../services/api';
import { StatusBadge } from '../ui';

interface PlantCardProps {
  plant: Plant;
  onDelete: (id: number) => Promise<void>;
  onEdit?: (plant: Plant) => void;
  onView?: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onDelete,
  onEdit,
  onView
}) => {
  const { t } = useTranslation(['plants', 'common']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get plant type icon
  const getPlantIcon = () => {
    switch (plant.type) {
      case 'Photovoltaic':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'Wind':
        return <Wind className="h-8 w-8 text-blue-500" />;
      case 'Hydroelectric':
        return <Droplets className="h-8 w-8 text-cyan-500" />;
      case 'Biomass':
        return <Leaf className="h-8 w-8 text-green-500" />;
      case 'Geothermal':
        return <Flame className="h-8 w-8 text-red-500" />;
      default:
        return <Zap className="h-8 w-8 text-gray-500" />;
    }
  };

  // Get plant type color
  const getPlantTypeColor = () => {
    switch (plant.type) {
      case 'Photovoltaic':
        return 'from-yellow-400 to-orange-500';
      case 'Wind':
        return 'from-blue-400 to-indigo-500';
      case 'Hydroelectric':
        return 'from-cyan-400 to-blue-500';
      case 'Biomass':
        return 'from-green-400 to-emerald-500';
      case 'Geothermal':
        return 'from-red-400 to-orange-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Calculate compliance percentage
  const calculateCompliance = () => {
    if (!plant.checklist) return 0;
    const items = Object.values(plant.checklist).filter(v => typeof v === 'boolean');
    if (items.length === 0) return 0;
    const completed = items.filter(item => item).length;
    return Math.round((completed / items.length) * 100);
  };

  const compliance = calculateCompliance();
  const complianceColor = compliance === 100 ? 'text-green-600' : compliance >= 80 ? 'text-yellow-600' : 'text-red-600';

  // Format deadline
  const formatDeadline = () => {
    if (!plant.next_deadline) return null;
    const date = new Date(plant.next_deadline);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      date: date.toLocaleDateString('it-IT'),
      daysUntil,
      urgent: daysUntil <= 7,
      overdue: daysUntil < 0
    };
  };

  const deadline = formatDeadline();

  const handleDelete = async () => {
    if (window.confirm(t('deleteConfirm', { name: plant.name }))) {
      setIsDeleting(true);
      try {
        await onDelete(plant.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${getPlantTypeColor()}`} />

      <div className="p-6">
        {/* Top section with icon and actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {getPlantIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {plant.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{plant.code}</p>
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isDeleting}
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10">
                {onView && (
                  <button
                    onClick={() => {
                      onView(plant);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {t('common:view')}
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(plant);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t('common:edit')}
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('common:delete')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <StatusBadge status={plant.status} />
        </div>

        {/* Plant info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">{t('table.power')}:</span>
            <span className="font-medium text-gray-900 dark:text-white">{plant.power}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">{t('table.location')}:</span>
            <span className="font-medium text-gray-900 dark:text-white truncate" title={plant.location}>
              {plant.municipality || plant.location}
            </span>
          </div>

          {deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className={clsx(
                'h-4 w-4',
                deadline.overdue ? 'text-red-500' : deadline.urgent ? 'text-yellow-500' : 'text-gray-500'
              )} />
              <span className="text-gray-600 dark:text-gray-400">{t('table.nextDeadline')}:</span>
              <span className={clsx(
                'font-medium',
                deadline.overdue ? 'text-red-600' : deadline.urgent ? 'text-yellow-600' : 'text-gray-900 dark:text-white'
              )}>
                {deadline.date}
                {deadline.overdue && ` (${Math.abs(deadline.daysUntil)} ${t('daysOverdue')})`}
                {deadline.urgent && !deadline.overdue && ` (${deadline.daysUntil} ${t('daysLeft')})`}
              </span>
            </div>
          )}
        </div>

        {/* Compliance meter */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('table.compliance')}</span>
            <span className={clsx('text-sm font-medium', complianceColor)}>
              {compliance}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-500',
                compliance === 100 ? 'bg-green-500' :
                compliance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${compliance}%` }}
            />
          </div>
        </div>

        {/* Integration status */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('integrations')}
          </span>
          <div className="flex gap-2">
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              plant.gse_integration
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            )}>
              {plant.gse_integration ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              GSE
            </div>
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              plant.terna_integration
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            )}>
              {plant.terna_integration ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              Terna
            </div>
            <div className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              plant.customs_integration
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            )}>
              {plant.customs_integration ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              ADM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;