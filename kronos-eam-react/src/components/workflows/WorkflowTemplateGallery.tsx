import React, { useState, useEffect } from 'react';
import {
  FileText, Clock, Building2, Zap, Home, Trees,
  ChevronRight, Activity, AlertCircle, DollarSign,
  Settings, CheckCircle, Calendar, TrendingUp, Check,
  Package, Wrench, FileCheck, Puzzle, Layers, Eye
} from 'lucide-react';
import { WorkflowTemplate } from '../../types';
import { workflowService } from '../../services/api';
import WorkflowTemplatePreview from './WorkflowTemplatePreview';
import clsx from 'clsx';

interface WorkflowTemplateGalleryProps {
  onTemplateSelect: (template: WorkflowTemplate) => void;
  plantId?: number;
  plantpower?: number;
  selectedTemplate?: WorkflowTemplate | null;
}

const WorkflowTemplateGallery: React.FC<WorkflowTemplateGalleryProps> = ({
  onTemplateSelect,
  plantId,
  plantpower = 0,
  selectedTemplate = null
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'Activation': return Activity;
      case 'Fiscal': return DollarSign;
      case 'Incentives': return TrendingUp;
      case 'Changes': return Settings;
      case 'Maintenance': return Settings;
      case 'Compliance': return CheckCircle;
      default: return FileText;
    }
  };

  const getPurposeIcon = (purpose?: string) => {
    switch (purpose) {
      case 'Complete Activation': return Package;
      case 'Specific Process': return Wrench;
      case 'Recurring Compliance': return Calendar;
      case 'Custom': return Puzzle;
      case 'Phase Component': return Layers;
      default: return FileText;
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Activation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Fiscal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Incentives': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Changes': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Compliance': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPurposeColor = (purpose?: string) => {
    switch (purpose) {
      case 'Complete Activation': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Specific Process': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Recurring Compliance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Custom': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'Phase Component': return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'DSO': return Activity;
      case 'Terna': return Zap;
      case 'GSE': return Building2;
      case 'Customs': return FileText;
      case 'Municipality': return Home;
      case 'Superintendency': return Trees;
      default: return Building2;
    }
  };

  const isTemplateApplicable = (template: WorkflowTemplate): boolean => {
    // Check if template is applicable based on plant power
    if (template.min_power && plantpower < template.min_power) {
      return false;
    }
    if (template.max_power && plantpower > template.max_power) {
      return false;
    }
    return true;
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory !== 'all' && template.categoria !== selectedCategory) {
      return false;
    }
    return isTemplateApplicable(template);
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.categoria)))];

  const handlePreview = (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewTemplate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {category === 'all' ? 'Tutti' : category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.categoria);
          const isApplicable = isTemplateApplicable(template);
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <div
              key={template.id}
              onClick={() => isApplicable && onTemplateSelect(template)}
              className={clsx(
                'border-2 rounded-lg p-6 transition-all relative',
                isApplicable
                  ? 'cursor-pointer hover:shadow-lg'
                  : 'opacity-50 cursor-not-allowed',
                isSelected
                  ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : isApplicable
                    ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700'
              )}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                  'p-3 rounded-lg',
                  getCategoryColor(template.categoria).replace('text-', 'bg-').split(' ')[0]
                )}>
                  <CategoryIcon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  {template.workflow_purpose && (
                    <span className={clsx(
                      'text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1',
                      getPurposeColor(template.workflow_purpose)
                    )}>
                      {React.createElement(getPurposeIcon(template.workflow_purpose), { className: 'h-3 w-3' })}
                      {template.workflow_purpose}
                    </span>
                  )}
                  <span className={clsx(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    getCategoryColor(template.categoria)
                  )}>
                    {template.categoria}
                  </span>
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">
                {template.name}
                {template.is_complete_workflow === false && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Fase)</span>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {template.descrizione}
              </p>

              {/* Metadata */}
              <div className="space-y-3">
                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Durata: ~{template.durata_stimata_giorni || template.durataStimataDays} giorni</span>
                </div>

                {/* Power Range */}
                {(template.min_power || template.max_power) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Zap className="h-4 w-4" />
                    <span>
                      Potenza: {template.min_power || 0} - {template.max_power || '∞'} kW
                    </span>
                  </div>
                )}

                {/* Recurrence */}
                {template.ricorrenza && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Ricorrenza: {template.ricorrenza}</span>
                  </div>
                )}

                {/* Entities Involved */}
                {template.enti_richiesti && template.enti_richiesti.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.enti_richiesti.map(entity => {
                      const EntityIcon = getEntityIcon(entity);
                      return (
                        <div
                          key={entity}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                          title={entity}
                        >
                          <EntityIcon className="h-3 w-3" />
                          <span>{entity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Task Count and Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {template.tasks?.length || 0} attività
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handlePreview(template, e)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Visualizza dettagli"
                    >
                      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    {isApplicable && (
                      <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>

                {/* Not Applicable Warning */}
                {!isApplicable && plantpower > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>Non applicabile per {plantpower} kW</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Nessun template disponibile per i criteri selezionati
          </p>
        </div>
      )}

      {/* Recommendation for Renewable Energy */}
      {selectedCategory === 'all' && (
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Consigliato: Complete Renewable Plant Activation
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Il workflow completo per l'attivazione di un plant a fonti rinnovabili include tutte le fasi necessarie:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Fase 1: Progettazione e Autorizzazione (Comune, Soprintendenza)</li>
                <li>• Fase 2: Connessione alla Rete (DSO)</li>
                <li>• Fase 3: Registrazione e Attivazione (Terna GAUDÌ, GSE)</li>
                <li>• Fase 4: Adempimenti Fiscali (Agenzia Dogane per plants &gt; 20kW)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <WorkflowTemplatePreview
          template={previewTemplate}
          isOpen={showPreview}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

export default WorkflowTemplateGallery;