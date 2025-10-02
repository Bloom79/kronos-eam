import React from 'react';
import { 
  FileText, Package, Calendar, Building2, Layers, 
  Info, CheckCircle, Clock, Zap 
} from 'lucide-react';
import { WorkflowTemplate, WorkflowCategoryEnum } from '../../types';
import clsx from 'clsx';

interface WorkflowTemplateOverviewProps {
  formData: Partial<WorkflowTemplate>;
  errors: Record<string, string>;
  onFieldChange: (field: keyof WorkflowTemplate, value: any) => void;
}

const WorkflowTemplateOverview: React.FC<WorkflowTemplateOverviewProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  const categories: WorkflowCategoryEnum[] = [
    WorkflowCategoryEnum.ACTIVATION, 
    WorkflowCategoryEnum.FISCAL, 
    WorkflowCategoryEnum.INCENTIVES, 
    WorkflowCategoryEnum.CHANGES, 
    WorkflowCategoryEnum.MAINTENANCE, 
    WorkflowCategoryEnum.COMPLIANCE
  ];

  const purposes = [
    { value: 'Complete Activation', label: 'Attivazione Completa', icon: Package },
    { value: 'Specific Process', label: 'Processo Specifico', icon: FileText },
    { value: 'Recurring Compliance', label: 'Conformità Ricorrente', icon: Calendar },
    { value: 'Custom', label: 'Personalizzato', icon: Building2 },
    { value: 'Phase Component', label: 'Componente di Fase', icon: Layers }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Activation': return Zap;
      case 'Fiscal': return FileText;
      case 'Incentives': return CheckCircle;
      case 'Changes': return Clock;
      case 'Maintenance': return Building2;
      case 'Compliance': return Calendar;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Activation': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Fiscal': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Incentives': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Changes': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Compliance': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fasi</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formData.stages?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attività</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formData.stages?.reduce((sum, stage) => sum + (stage.tasks?.length || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enti</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formData.required_entities?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Informazioni Base
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Name */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Template *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              className={clsx(
                'w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100',
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              )}
              placeholder="es. Connessione DSO Standard per Impianti Fotovoltaici"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Category Selection - Visual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Categoria *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => {
                const Icon = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onFieldChange('category', cat)}
                    className={clsx(
                      'p-3 rounded-lg border-2 transition-all flex items-center gap-2',
                      formData.category === cat
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    )}
                  >
                    <Icon className={clsx(
                      'h-5 w-5',
                      formData.category === cat
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )} />
                    <span className={clsx(
                      'text-sm font-medium',
                      formData.category === cat
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo Template
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/30"
                style={{
                  borderColor: formData.is_complete_workflow === true ? '#2563eb' : '#e5e7eb',
                  backgroundColor: formData.is_complete_workflow === true ? '#eff6ff' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  checked={formData.is_complete_workflow === true}
                  onChange={() => onFieldChange('is_complete_workflow', true)}
                  className="h-5 w-5 text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    Workflow Completo
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Include tutte le fasi necessarie per completare il processo
                  </p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/30"
                style={{
                  borderColor: formData.is_complete_workflow === false ? '#2563eb' : '#e5e7eb',
                  backgroundColor: formData.is_complete_workflow === false ? '#eff6ff' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  checked={formData.is_complete_workflow === false}
                  onChange={() => onFieldChange('is_complete_workflow', false)}
                  className="h-5 w-5 text-blue-600 mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    Componente di Fase
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Una singola fase riutilizzabile in workflow più complessi
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="Descrivi lo scopo e il contenuto del template, quando utilizzarlo e quali sono i prerequisiti..."
            />
          </div>
        </div>
      </div>

      {/* Workflow Purpose */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Scopo del Workflow
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {purposes.map(purpose => {
            const Icon = purpose.icon;
            return (
              <button
                key={purpose.value}
                type="button"
                onClick={() => onFieldChange('workflow_purpose', purpose.value)}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all',
                  formData.workflow_purpose === purpose.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                )}
              >
                <Icon className={clsx(
                  'h-8 w-8 mb-2 mx-auto',
                  formData.workflow_purpose === purpose.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                )} />
                <span className={clsx(
                  'block text-sm font-medium',
                  formData.workflow_purpose === purpose.value
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}>
                  {purpose.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Stato Template
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              I template attivi sono disponibili per la creazione di nuovi workflow
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => onFieldChange('active', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {formData.active ? 'Attivo' : 'Inattivo'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplateOverview;