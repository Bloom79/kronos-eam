import React, { useState, useEffect } from 'react';
import {
  Package, FileText, Calendar, Zap, Database, Euro,
  Plug, Wrench, CheckSquare, Search, Filter, ChevronDown,
  Clock, Building2, Users, AlertCircle, Info, X, Plus
} from 'lucide-react';
import clsx from 'clsx';
import phaseTemplatesData from '../../data/phaseTemplates.json';

interface TaskData {
  name: string;
  tipo_pratica?: string;
  assignee?: string;
  ente_responsabile?: string;
  durata_giorni?: number;
  priority?: string;
  [key: string]: any;
}

interface DocumentTemplateData {
  name: string;
  category: string;
  official_url?: string;
  [key: string]: any;
}

interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  entity_responsible: string;
  duration_days: number;
  icon: string;
  color: string;
  tasks: TaskData[];
  document_templates?: DocumentTemplateData[];
  condizioni?: string;
}

interface PhaseTemplatesProps {
  onSelectTemplate: (template: PhaseTemplate) => void;
  onClose: () => void;
  currentPhases?: string[]; // IDs of already added phases
}

const iconMap: { [key: string]: any } = {
  Compass: FileText,
  Building: Building2,
  Plug: Plug,
  Wrench: Wrench,
  CheckSquare: CheckSquare,
  Zap: Zap,
  Database: Database,
  Euro: Euro,
  FileText: FileText,
  Calendar: Calendar
};

const PhaseTemplates: React.FC<PhaseTemplatesProps> = ({ 
  onSelectTemplate, 
  onClose,
  currentPhases = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'solarPlantActivation' | 'recurringCompliance'>('solarPlantActivation');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const templates = (phaseTemplatesData as any)[selectedCategory].phases as PhaseTemplate[];

  const filteredTemplates = templates.filter((template: PhaseTemplate) => {
    // Filter by search term
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by type
    if (filterType !== 'all' && template.type !== filterType) {
      return false;
    }

    return true;
  });

  const phaseTypes = Array.from(new Set(templates.map(t => t.type)));

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || FileText;
    return Icon;
  };

  const isPhaseAdded = (phaseId: string) => currentPhases.includes(phaseId);

  const getColorClasses = (color: string, isDisabled: boolean = false) => {
    if (isDisabled) return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500';
    
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleSelectTemplate = (template: PhaseTemplate) => {
    if (!isPhaseAdded(template.id)) {
      onSelectTemplate(template);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Seleziona Template Fase
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory('solarPlantActivation')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedCategory === 'solarPlantActivation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              Attivazione Impianto FV
            </button>
            <button
              onClick={() => setSelectedCategory('recurringCompliance')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedCategory === 'recurringCompliance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              Adempimenti Ricorrenti
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca fase per nome o descrizione..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tutti i tipi</option>
              {phaseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nessun template trovato con i criteri selezionati.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTemplates.map((template: PhaseTemplate) => {
                const Icon = getIcon(template.icon);
                const isAdded = isPhaseAdded(template.id);
                const isExpanded = expandedTemplate === template.id;

                return (
                  <div
                    key={template.id}
                    className={clsx(
                      'border rounded-lg transition-all',
                      isAdded
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                        : 'border-gray-200 dark:border-gray-700 hover:shadow-md cursor-pointer'
                    )}
                    onClick={() => !isAdded && setExpandedTemplate(isExpanded ? null : template.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={clsx(
                          'p-3 rounded-lg',
                          getColorClasses(template.color, isAdded)
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={clsx(
                                'font-semibold text-lg',
                                isAdded 
                                  ? 'text-gray-500 dark:text-gray-400' 
                                  : 'text-gray-800 dark:text-gray-100'
                              )}>
                                {template.name}
                                {isAdded && (
                                  <span className="ml-2 text-sm font-normal text-gray-400">
                                    (Già aggiunta)
                                  </span>
                                )}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {template.description}
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template);
                              }}
                              disabled={isAdded}
                              className={clsx(
                                'ml-4 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                                isAdded
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              )}
                            >
                              <Plus className="h-4 w-4" />
                              Aggiungi
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              {template.duration_days} giorni
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Building2 className="h-4 w-4" />
                              {template.entity_responsible}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <CheckSquare className="h-4 w-4" />
                              {template.tasks.length} attività
                            </span>
                            {template.document_templates && template.document_templates.length > 0 && (
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <FileText className="h-4 w-4" />
                                {template.document_templates.length} documenti
                              </span>
                            )}
                            {template.condizioni && (
                              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                <AlertCircle className="h-4 w-4" />
                                {template.condizioni}
                              </span>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    Attività principali:
                                  </h4>
                                  <ul className="space-y-1">
                                    {template.tasks.slice(0, 3).map((task: TaskData, idx: number) => (
                                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                                        {task.name}
                                        {task.practice_type && (
                                          <span className="text-xs text-gray-500 dark:text-gray-500">
                                            ({task.practice_type})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                    {template.tasks.length > 3 && (
                                      <li className="text-sm text-gray-500 dark:text-gray-500 italic">
                                        +{template.tasks.length - 3} altre attività
                                      </li>
                                    )}
                                  </ul>
                                </div>

                                {template.document_templates && template.document_templates.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                      Template documents:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {template.document_templates?.map((doc: DocumentTemplateData, idx: number) => (
                                        <span 
                                          key={idx}
                                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                        >
                                          {doc.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTemplates.length} template disponibili
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseTemplates;