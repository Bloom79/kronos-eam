import React from 'react';
import { 
  Settings, Zap, Calendar, Clock, Building2, 
  AlertCircle, Filter, Euro, Repeat 
} from 'lucide-react';
import { WorkflowTemplate } from '../../types';
import EntitySelector from './EntitySelector';
import clsx from 'clsx';

interface WorkflowTemplateConfigProps {
  formData: Partial<WorkflowTemplate>;
  errors: Record<string, string>;
  onFieldChange: (field: keyof WorkflowTemplate, value: any) => void;
}

const WorkflowTemplateConfig: React.FC<WorkflowTemplateConfigProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  const recurrences = [
    { value: 'One-time', label: 'Una tantum', icon: '1x' },
    { value: 'Annual', label: 'Annuale', icon: '1y' },
    { value: 'Semiannual', label: 'Semestrale', icon: '6m' },
    { value: 'Quarterly', label: 'Trimestrale', icon: '3m' },
    { value: 'Monthly', label: 'Mensile', icon: '1m' },
    { value: 'Quinquennial', label: 'Quinquennale', icon: '5y' }
  ];

  const plantTypes = [
    { value: 'Tutti', label: 'Tutti i tipi' },
    { value: 'Fotovoltaico', label: 'Fotovoltaico' },
    { value: 'Eolico', label: 'Eolico' },
    { value: 'Idroelettrico', label: 'Idroelettrico' },
    { value: 'Biomasse', label: 'Biomasse' },
    { value: 'Geotermico', label: 'Geotermico' }
  ];

  const powerRanges = [
    { min: 0, max: 20, label: '0 - 20 kW (Residenziale)' },
    { min: 20, max: 100, label: '20 - 100 kW (Piccolo commerciale)' },
    { min: 100, max: 500, label: '100 - 500 kW (Commerciale)' },
    { min: 500, max: 1000, label: '500 kW - 1 MW (Industriale)' },
    { min: 1000, max: 5000, label: '1 - 5 MW (Grande industriale)' },
    { min: 5000, max: null, label: '> 5 MW (Utility scale)' }
  ];

  return (
    <div className="space-y-6">
      {/* Applicability Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Applicabilità
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plant Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Zap className="inline h-4 w-4 mr-1" />
              Tipo Impianto
            </label>
            <div className="grid grid-cols-2 gap-2">
              {plantTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onFieldChange('plant_type', type.value)}
                  className={clsx(
                    'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                    formData.plant_type === type.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Power Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Euro className="inline h-4 w-4 mr-1" />
              Range di Potenza
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Potenza Minima (kW)
                </label>
                <input
                  type="number"
                  value={formData.min_power || ''}
                  onChange={(e) => onFieldChange('min_power', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Potenza Massima (kW)
                </label>
                <input
                  type="number"
                  value={formData.max_power || ''}
                  onChange={(e) => onFieldChange('max_power', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Illimitata"
                  min="0"
                />
              </div>
            </div>
            
            {/* Quick Range Selection */}
            <div className="mt-2 flex flex-wrap gap-2">
              {powerRanges.map(range => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => {
                    onFieldChange('min_power', range.min);
                    onFieldChange('max_power', range.max);
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tempistiche e Ricorrenza
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Durata Stimata
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.estimated_duration_days || ''}
                onChange={(e) => onFieldChange('estimated_duration_days', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="30"
                min="1"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                giorni
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Tempo medio per completare tutte le fasi del workflow
            </p>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Repeat className="inline h-4 w-4 mr-1" />
              Ricorrenza
            </label>
            <div className="grid grid-cols-3 gap-2">
              {recurrences.map(rec => (
                <button
                  key={rec.value}
                  type="button"
                  onClick={() => onFieldChange('recurrence', rec.value)}
                  className={clsx(
                    'p-3 rounded-lg border-2 transition-all',
                    formData.recurrence === rec.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  )}
                >
                  <span className={clsx(
                    'block text-lg font-bold mb-1',
                    formData.recurrence === rec.value
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {rec.icon}
                  </span>
                  <span className={clsx(
                    'text-xs',
                    formData.recurrence === rec.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {rec.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Deadline Warning for Recurring Workflows */}
        {formData.recurrence !== 'One-time' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Workflow Ricorrente
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Questo template genererà automaticamente nuovi workflow secondo la recurrence selezionata. 
                  Assicurati di configurare correttamente le scadenze per ogni attività.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Enti Coinvolti
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Seleziona tutti gli enti che dovranno interagire durante l'esecuzione del workflow
        </p>
        
        <EntitySelector
          selectedEntities={formData.required_entities || []}
          onChange={(entities) => onFieldChange('required_entities', entities)}
        />
      </div>

      {/* Advanced Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurazioni Avanzate
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activation Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condizioni di Attivazione
            </label>
            <textarea
              value={JSON.stringify(formData.activation_conditions || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onFieldChange('activation_conditions', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 font-mono text-xs"
              placeholder='{\n  "minPower": 20,\n  "requiresAuthorization": true\n}'
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JSON per condizioni personalizzate
            </p>
          </div>

          {/* Deadline Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Configurazione Scadenze
            </label>
            <textarea
              value={JSON.stringify(formData.deadline_config || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onFieldChange('deadline_config', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 font-mono text-xs"
              placeholder='{\n  "defaultBuffer": 5,\n  "alertDays": [30, 15, 7]\n}'
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JSON per gestione scadenze
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplateConfig;