import React from 'react';
import {
  X, Clock, Users, FileText, Building2, AlertCircle, 
  CheckCircle, Calendar, Zap, Activity, DollarSign,
  Settings, TrendingUp, Package, Wrench, Puzzle, Layers
} from 'lucide-react';
import { WorkflowTemplate, EntityEnum } from '../../types';
import WorkflowDiagram from './WorkflowDiagram';
import clsx from 'clsx';

interface WorkflowTemplatePreviewProps {
  template: WorkflowTemplate;
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowTemplatePreview: React.FC<WorkflowTemplatePreviewProps> = ({
  template,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'Attivazione': return Activity;
      case 'Fiscale': return DollarSign;
      case 'Incentivi': return TrendingUp;
      case 'Variazioni': return Settings;
      case 'Manutenzione': return Settings;
      case 'Compliance': return CheckCircle;
      default: return FileText;
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Attivazione': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Fiscale': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Incentivi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Variazioni': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Manutenzione': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Compliance': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPurposeIcon = (purpose?: string) => {
    switch (purpose) {
      case 'Attivazione Completa': return Package;
      case 'Processo Specifico': return Wrench;
      case 'Compliance Ricorrente': return Calendar;
      case 'Personalizzato': return Puzzle;
      case 'Componente Fase': return Layers;
      default: return FileText;
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'DSO': return Activity;
      case 'Terna': return Zap;
      case 'GSE': return Building2;
      case 'Dogane': return FileText;
      case 'Comune': return Building2;
      case 'Soprintendenza': return Building2;
      default: return Building2;
    }
  };

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'DSO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Terna': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'GSE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Dogane': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Comune': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Soprintendenza': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const CategoryIcon = getCategoryIcon(template.categoria);
  const PurposeIcon = getPurposeIcon(template.workflow_purpose);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'p-3 rounded-lg',
              getCategoryColor(template.categoria).replace('text-', 'bg-').split(' ')[0]
            )}>
              <CategoryIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {template.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  getCategoryColor(template.categoria)
                )}>
                  {template.categoria}
                </span>
                {template.workflow_purpose && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <PurposeIcon className="h-3 w-3" />
                    {template.workflow_purpose}
                  </span>
                )}
                {template.is_complete_workflow === false && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                    Componente Fase
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Descrizione
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {template.descrizione}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Durata Stimata</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {template.durata_stimata_giorni || template.durataStimataDays} giorni
                </p>
              </div>

              {template.ricorrenza && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Ricorrenza</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {template.ricorrenza}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Potenza Applicabile</span>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {template.min_power || 0} - {template.max_power || '∞'} kW
                </p>
              </div>
            </div>

            {/* Entities Involved */}
            {template.enti_richiesti && template.enti_richiesti.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Enti Coinvolti
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.enti_richiesti.map(entity => {
                    const EntityIcon = getEntityIcon(entity);
                    return (
                      <div
                        key={entity}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 rounded-lg font-medium',
                          getEntityColor(entity)
                        )}
                      >
                        <EntityIcon className="h-4 w-4" />
                        <span>{entity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Base Documents */}
            {template.documenti_base && template.documenti_base.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Documenti Richiesti
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    {template.documenti_base.map((doc, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Workflow Diagram */}
            {template.stages && template.stages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Diagramma del Workflow
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6">
                  <WorkflowDiagram stages={template.stages} />
                </div>
              </div>
            )}

            {/* Stages and Tasks Details */}
            {template.stages && template.stages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Dettagli delle Fasi
                </h3>
                <div className="space-y-4">
                  {template.stages.map((stage: any, stageIndex: number) => (
                    <div key={stageIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">
                          {stage.name}
                        </h4>
                        {stage.durata_giorni && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ~{stage.durata_giorni} giorni
                          </span>
                        )}
                      </div>
                      {stage.tasks && stage.tasks.length > 0 && (
                        <div className="p-4 space-y-3">
                          {stage.tasks.map((task: any, taskIndex: number) => (
                            <div key={taskIndex} className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {taskIndex + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800 dark:text-gray-100">
                                  {task.name || task.title}
                                </h5>
                                {task.descrizione && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {task.descrizione}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {task.responsabile && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {task.responsabile}
                                    </span>
                                  )}
                                  {task.durata_giorni && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.durata_giorni} giorni
                                    </span>
                                  )}
                                  {task.ente_responsabile && (
                                    <span className={clsx(
                                      'px-2 py-1 rounded-full',
                                      getEntityColor(task.ente_responsabile)
                                    )}>
                                      {task.ente_responsabile}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks (if no stages) */}
            {(!template.stages || template.stages.length === 0) && template.tasks && template.tasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Attività del Workflow ({template.tasks.length})
                </h3>
                <div className="space-y-3">
                  {template.tasks.map((task: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800 dark:text-gray-100">
                            {task.name || task.title}
                          </h5>
                          {task.descrizione && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {task.descrizione}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {task.responsabile && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {task.responsabile}
                              </span>
                            )}
                            {task.durata_giorni && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.durata_giorni} giorni
                              </span>
                            )}
                            {task.ente_responsabile && (
                              <span className={clsx(
                                'px-2 py-1 rounded-full',
                                getEntityColor(task.ente_responsabile)
                              )}>
                                {task.ente_responsabile}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplatePreview;