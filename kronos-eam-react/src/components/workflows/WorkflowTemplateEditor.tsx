import React, { useState, useEffect } from 'react';
import {
  Save, X, Plus, Trash2, AlertCircle, Info,
  FileText, Clock, Zap, Building2, Calendar,
  ChevronDown, ChevronUp, Package, Layers
} from 'lucide-react';
import { WorkflowTemplate, WorkflowCategoryEnum } from '../../types';
import StageBuilder from './StageBuilder';
import EntitySelector from './EntitySelector';
import DocumentRequirements from './DocumentRequirements';
import clsx from 'clsx';

interface WorkflowTemplateEditorProps {
  template?: WorkflowTemplate | null;
  onSave: (template: Partial<WorkflowTemplate>) => Promise<void>;
  onCancel: () => void;
}

const WorkflowTemplateEditor: React.FC<WorkflowTemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<WorkflowTemplate>>({
    name: '',
    descrizione: '',
    categoria: 'Activation' as WorkflowCategoryEnum,
    workflow_purpose: 'Specific Process',
    is_complete_workflow: true,
    type_plant: 'Tutti',
    min_power: 0,
    max_power: undefined,
    durata_stimata_giorni: 30,
    ricorrenza: 'One-time',
    stages: [],
    tasks: [],
    enti_richiesti: [],
    documenti_base: [],
    condizioni_attivazione: {},
    scadenza_config: {},
    attivo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        stages: template.stages || [],
        tasks: template.tasks || [],
        enti_richiesti: template.enti_richiesti || [],
        documenti_base: template.documenti_base || []
      });
    }
  }, [template]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Il name è obbligatorio';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoria è obbligatoria';
    }

    if (formData.stages?.length === 0 && formData.tasks?.length === 0) {
      newErrors.stages = 'Aggiungi almeno una fase o attività';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors({ submit: 'Errore durante il salvataggio del template' });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof WorkflowTemplate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const categories: WorkflowCategoryEnum[] = [
    'Activation', 'Fiscal', 'Incentives', 
    'Changes', 'Maintenance', 'Compliance'
  ];

  const purposes = [
    { value: 'Complete Activation', label: 'Complete Activation', icon: Package },
    { value: 'Specific Process', label: 'Specific Process', icon: FileText },
    { value: 'Recurring Compliance', label: 'Recurring Compliance', icon: Calendar },
    { value: 'Custom', label: 'Custom', icon: Building2 },
    { value: 'Phase Component', label: 'Phase Component', icon: Layers }
  ];

  const recurrences = [
    'One-time', 'Annual', 'Semiannual', 
    'Quarterly', 'Monthly', 'Quinquennial'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {template ? 'Modifica Template' : 'Nuovo Template Workflow'}
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={saving}
                className={clsx(
                  'px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                  saving
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                )}
              >
                <Save className="h-5 w-5" />
                {saving ? 'Salvataggio...' : 'Salva Template'}
              </button>
            </div>
          </div>

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Informazioni Base
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                name Template *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={clsx(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100',
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="es. Connessione DSO Standard"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleFieldChange('categoria', e.target.value)}
                className={clsx(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100',
                  errors.categoria ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoria}</p>
              )}
            </div>

            {/* Descrizione */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrizione
              </label>
              <textarea
                value={formData.descrizione}
                onChange={(e) => handleFieldChange('descrizione', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Descrivi lo scopo e il contenuto del template..."
              />
            </div>

            {/* Workflow Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scopo del Workflow
              </label>
              <div className="grid grid-cols-2 gap-2">
                {purposes.map(purpose => {
                  const Icon = purpose.icon;
                  return (
                    <button
                      key={purpose.value}
                      type="button"
                      onClick={() => handleFieldChange('workflow_purpose', purpose.value)}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                        formData.workflow_purpose === purpose.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{purpose.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Is Complete Workflow */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                type Template
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.is_complete_workflow === true}
                    onChange={() => handleFieldChange('is_complete_workflow', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Workflow Completo
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.is_complete_workflow === false}
                    onChange={() => handleFieldChange('is_complete_workflow', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Componente di Fase
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Applicability */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Applicabilità
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* type plant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                type plant
              </label>
              <select
                value={formData.type_plant}
                onChange={(e) => handleFieldChange('type_plant', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="Tutti">Tutti</option>
                <option value="Fotovoltaico">Fotovoltaico</option>
                <option value="Eolico">Eolico</option>
                <option value="Idroelettrico">Idroelettrico</option>
                <option value="Biomasse">Biomasse</option>
              </select>
            </div>

            {/* Potenza Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Potenza Minima (kW)
              </label>
              <input
                type="number"
                value={formData.min_power || ''}
                onChange={(e) => handleFieldChange('min_power', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Potenza Massima (kW)
              </label>
              <input
                type="number"
                value={formData.max_power || ''}
                onChange={(e) => handleFieldChange('max_power', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Illimitata"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Durata */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durata Stimata (giorni)
              </label>
              <input
                type="number"
                value={formData.durata_stimata_giorni || ''}
                onChange={(e) => handleFieldChange('durata_stimata_giorni', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="30"
                min="1"
              />
            </div>

            {/* Ricorrenza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ricorrenza
              </label>
              <select
                value={formData.ricorrenza}
                onChange={(e) => handleFieldChange('ricorrenza', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                {recurrences.map(rec => (
                  <option key={rec} value={rec}>{rec}</option>
                ))}
              </select>
            </div>

            {/* Attivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <label className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  checked={formData.attivo}
                  onChange={(e) => handleFieldChange('attivo', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Template Attivo
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Entities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Enti Coinvolti
          </h3>
          <EntitySelector
            selectedEntities={formData.enti_richiesti || []}
            onChange={(entities) => handleFieldChange('enti_richiesti', entities)}
          />
        </div>

        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Documenti Richiesti
          </h3>
          <DocumentRequirements
            documents={formData.documenti_base || []}
            onChange={(docs) => handleFieldChange('documenti_base', docs)}
          />
        </div>

        {/* Stages and Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Fasi e Attività
          </h3>
          {errors.stages && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errors.stages}</p>
            </div>
          )}
          <StageBuilder
            stages={formData.stages || []}
            onChange={(stages) => handleFieldChange('stages', stages)}
          />
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Impostazioni Avanzate
            </h3>
            {showAdvanced ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Le impostazioni avanzate permettono di configurare condizioni di attivazione
                      e scadenze personalizzate. Questa funzionalità sarà disponibile prossimamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkflowTemplateEditor;