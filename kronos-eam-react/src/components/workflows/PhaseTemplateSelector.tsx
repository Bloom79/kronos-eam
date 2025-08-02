import React, { useState, useEffect } from 'react';
import {
  FileText, Clock, Building2, Zap,
  AlertCircle, DollarSign,
  CheckCircle, Check,
  Layers, Package, ArrowRight
} from 'lucide-react';
import { WorkflowTemplate } from '../../types';
import { workflowService } from '../../services/api';
import clsx from 'clsx';

interface PhaseTemplateSelectorProps {
  onPhaseTemplatesSelect: (phaseTemplates: Record<string, number>) => void;
  plantId?: number;
  plantpower?: number;
  selectedPhaseTemplates?: Record<string, number>;
}

const phases = [
  {
    key: 'Progettazione',
    name: 'Progettazione',
    description: 'Fase di progettazione e autorizzazioni iniziali',
    icon: FileText,
    color: 'blue'
  },
  {
    key: 'Connessione',
    name: 'Connessione',
    description: 'Richiesta e realizzazione della connessione alla rete',
    icon: Zap,
    color: 'green'
  },
  {
    key: 'Registrazione',
    name: 'Registrazione',
    description: 'Registrazione su GAUDÌ e attivazione GSE',
    icon: Building2,
    color: 'purple'
  },
  {
    key: 'Fiscale',
    name: 'Fiscale',
    description: 'Adempimenti fiscali e doganali',
    icon: DollarSign,
    color: 'yellow'
  }
];

const PhaseTemplateSelector: React.FC<PhaseTemplateSelectorProps> = ({
  onPhaseTemplatesSelect,
  plantId,
  plantpower = 0,
  selectedPhaseTemplates = {}
}) => {
  const [phaseTemplates, setPhaseTemplates] = useState<Record<string, WorkflowTemplate[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, number>>(selectedPhaseTemplates);
  const [expandedPhase, setExpandedPhase] = useState<string | null>('PROGETTAZIONE');

  useEffect(() => {
    loadPhaseTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPhaseTemplates = async () => {
    try {
      setLoading(true);
      const templatesData: Record<string, WorkflowTemplate[]> = {};
      
      // Load templates for each phase
      for (const phase of phases) {
        const templates = await workflowService.getTemplates({
          phase: phase.key,
          potenza_kw: plantpower
        });
        templatesData[phase.key] = templates;
      }
      
      setPhaseTemplates(templatesData);
    } catch (error) {
      console.error('Error loading phase templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (phase: string, templateId: number) => {
    const newSelected = {
      ...selectedTemplates,
      [phase]: templateId
    };
    setSelectedTemplates(newSelected);
    onPhaseTemplatesSelect(newSelected);
  };

  const getPhaseColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getSelectedCount = () => {
    return Object.keys(selectedTemplates).length;
  };

  const isTemplateApplicable = (template: WorkflowTemplate): boolean => {
    if (template.min_power && plantpower < template.min_power) {
      return false;
    }
    if (template.max_power && plantpower > template.max_power) {
      return false;
    }
    return true;
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Composizione Workflow per Fasi
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Seleziona un template specifico per ogni fase del processo di attivazione.
          Hai selezionato {getSelectedCount()} su {phases.length} fasi.
        </p>
      </div>

      {/* Phase Selection */}
      <div className="space-y-4">
        {phases.map((phase, index) => {
          const PhaseIcon = phase.icon;
          const templates = phaseTemplates[phase.key] || [];
          const selectedTemplate = selectedTemplates[phase.key];
          const isExpanded = expandedPhase === phase.key;
          
          return (
            <div key={phase.key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Phase Header */}
              <div 
                onClick={() => setExpandedPhase(isExpanded ? null : phase.key)}
                className={clsx(
                  'p-4 cursor-pointer transition-colors',
                  selectedTemplate
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      'p-3 rounded-lg',
                      getPhaseColor(phase.color).replace('text-', 'bg-').split(' ')[0]
                    )}>
                      <PhaseIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                          Fase {index + 1}: {phase.name}
                        </h4>
                        {selectedTemplate && (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  {index < phases.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Phase Templates */}
              {isExpanded && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.filter(isTemplateApplicable).map(template => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(phase.key, typeof template.id === 'number' ? template.id : parseInt(template.id as string))}
                        className={clsx(
                          'p-4 border-2 rounded-lg cursor-pointer transition-all',
                          selectedTemplate === template.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800 dark:text-gray-100">
                            {template.name}
                          </h5>
                          {selectedTemplate === template.id && (
                            <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {template.descrizione}
                        </p>
                        
                        <div className="space-y-2">
                          {/* Duration */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{template.durata_stimata_giorni || 10} giorni</span>
                          </div>
                          
                          {/* Entities */}
                          {template.enti_richiesti && template.enti_richiesti.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {template.enti_richiesti.map(entity => (
                                <span
                                  key={entity}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                >
                                  {entity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {templates.filter(isTemplateApplicable).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nessun template disponibile per questa fase</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {getSelectedCount() === phases.length && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Tutte le fasi sono state configurate!
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Il workflow composto includerà tutti i task delle {phases.length} fasi selezionate.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Come funziona la composizione per fasi?</p>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Ogni fase può essere configurata con un template specifico</li>
              <li>• I task di tutte le fasi selezionate verranno combinati in un unico workflow</li>
              <li>• Le dipendenze tra fasi vengono gestite automaticamente</li>
              <li>• Puoi personalizzare ulteriormente il workflow dopo la creazione</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseTemplateSelector;