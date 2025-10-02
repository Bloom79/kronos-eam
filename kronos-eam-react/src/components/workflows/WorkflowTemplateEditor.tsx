import React, { useState, useEffect } from 'react';
import {
  Save, X, Plus, Trash2, AlertCircle, Info,
  FileText, Clock, Zap, Building2, Calendar,
  ChevronDown, ChevronUp, Package, Layers,
  CheckCircle, Settings, Eye
} from 'lucide-react';
import { WorkflowTemplate, WorkflowCategoryEnum } from '../../types';
import StageBuilder from './StageBuilder';
import WorkflowTemplateOverview from './WorkflowTemplateOverview';
import WorkflowTemplateConfig from './WorkflowTemplateConfig';
import WorkflowTemplateReview from './WorkflowTemplateReview';
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
    description: '',
    category: 'Activation' as WorkflowCategoryEnum,
    workflow_purpose: 'Specific Process',
    is_complete_workflow: true,
    plant_type: 'Tutti',
    min_power: 0,
    max_power: undefined,
    estimated_duration_days: 30,
    recurrence: 'One-time',
    stages: [],
    tasks: [],
    required_entities: [],
    base_documents: [],
    activation_conditions: {},
    deadline_config: {},
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'workflow' | 'review'>('overview');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        stages: template.stages || [],
        tasks: template.tasks || [],
        required_entities: template.required_entities || [],
        base_documents: template.base_documents || []
      });
    }
  }, [template]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Il name è obbligatorio';
    }

    if (!formData.category) {
      newErrors.category = 'La category è obbligatoria';
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
    // Mark current tab as having changes
    updateProgress();
  };

  const updateProgress = () => {
    const newCompleted = new Set<string>();
    
    // Check overview tab completion
    if (formData.name && formData.category) {
      newCompleted.add('overview');
    }
    
    // Check config tab completion
    if (formData.required_entities && formData.required_entities.length > 0) {
      newCompleted.add('config');
    }
    
    // Check workflow tab completion
    if (formData.stages && formData.stages.length > 0) {
      newCompleted.add('workflow');
    }
    
    setCompletedSteps(newCompleted);
  };

  const getProgressPercentage = () => {
    const totalSteps = 3; // Overview, Config, Workflow
    const completed = completedSteps.size;
    return Math.round((completed / totalSteps) * 100);
  };

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: Info },
    { id: 'config', label: 'Configurazione', icon: Settings },
    { id: 'workflow', label: 'Design Workflow', icon: Layers },
    { id: 'review', label: 'Riepilogo', icon: Eye }
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {template ? 'Modifica Template' : 'Nuovo Template Workflow'}
                </h2>
                {/* Progress Indicator */}
                <div className="hidden lg:flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getProgressPercentage()}% completo
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annulla
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

            {/* Tab Navigation */}
            <div className="flex space-x-8 mt-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isCompleted = completedSteps.has(tab.id);
                const isCurrent = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      'flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors',
                      isCurrent
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    )}
                  >
                    {isCompleted && tab.id !== 'review' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'overview' && (
              <WorkflowTemplateOverview
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            )}

            {activeTab === 'config' && (
              <WorkflowTemplateConfig
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />
            )}

            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5" />
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
              </div>
            )}

            {activeTab === 'review' && (
              <WorkflowTemplateReview
                formData={formData}
                errors={errors}
              />
            )}
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formData.name ? (
                  <span>Modifica: <strong className="text-gray-800 dark:text-gray-200">{formData.name}</strong></span>
                ) : (
                  <span>Nuovo template workflow</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annulla
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkflowTemplateEditor;