import React from 'react';
import {
  Clock, Users, Building2, ArrowRight, AlertCircle,
  CheckCircle, FileText, Activity, Zap
} from 'lucide-react';
import clsx from 'clsx';

interface WorkflowStage {
  name: string;
  order: number;
  duration_days?: number;
  tasks: WorkflowTask[];
}

interface WorkflowTask {
  name?: string;
  title?: string;
  description?: string;
  assignee?: string;
  duration_days?: number;
  responsible_entity?: string;
  practice_type?: string;
  required_documents?: string[];
  checkpoints?: string[];
  conditions?: any;
  priority?: string;
  // New fields for bureaucratic process
  portal_url?: string;
  portal_login_url?: string;
  required_credentials?: string;
  documents_to_generate?: string[];
  regulatory_deadline?: string;
  deadline_type?: string;
  deadline_consequences?: string;
  cost_amount?: number;
  cost_description?: string;
  payment_method?: string;
  external_protocol_number?: string;
  submission_method?: string;
  requires_human_auth?: boolean;
  requires_physical_signature?: boolean;
  requires_site_inspection?: boolean;
  template_download_url?: string;
}

interface WorkflowDiagramProps {
  stages: WorkflowStage[];
  className?: string;
}

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ stages, className }) => {
  const getEntityColor = (entity?: string) => {
    switch (entity) {
      case 'DSO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      case 'Terna': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'GSE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'Customs': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'Municipality': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700';
      case 'Superintendency': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  const getEntityIcon = (entity?: string) => {
    switch (entity) {
      case 'DSO': return Activity;
      case 'Terna': return Zap;
      case 'GSE': return Building2;
      case 'Customs': return FileText;
      default: return Building2;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <div className="min-w-[800px] p-4">
        {/* Stage Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600" />
          
          {/* Stages */}
          <div className="relative flex justify-between">
            {stages.map((stage, stageIndex) => (
              <div key={stageIndex} className="flex flex-col items-center">
                {/* Stage Circle */}
                <div className="relative z-10 w-16 h-16 bg-white dark:bg-gray-800 border-4 border-blue-600 dark:border-blue-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {stageIndex + 1}
                  </span>
                </div>
                
                {/* Stage Name */}
                <div className="mt-2 text-center">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 max-w-[150px]">
                    {stage.name}
                  </h3>
                  {stage.duration_days && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ~{stage.duration_days} giorni
                    </p>
                  )}
                </div>
                
                {stageIndex < stages.length - 1 && (
                  <ArrowRight className="absolute top-8 -right-8 h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, stageIndex) => (
            <div key={stageIndex} className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                Fase {stageIndex + 1}
              </h4>
              {stage.tasks.map((task, taskIndex) => {
                const taskName = task.name || task.title || 'Task';
                const taskType = task.practice_type;
                const EntityIcon = getEntityIcon(task.responsible_entity);
                
                return (
                  <div
                    key={taskIndex}
                    className={clsx(
                      'border-2 rounded-lg p-3 transition-all hover:shadow-md',
                      getEntityColor(task.responsible_entity)
                    )}
                  >
                    {/* Task Header */}
                    <div className="mb-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-sm flex-1 pr-2 text-gray-900 dark:text-gray-100">
                          {taskName}
                        </h5>
                        {task.responsible_entity && (
                          <EntityIcon className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Task Details */}
                    <div className="space-y-2">
                      {taskType && (
                        <div className="text-xs bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                          {taskType}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs mb-1">
                        {task.assignee && (
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">{task.assignee}</span>
                          </span>
                        )}
                        {task.duration_days && (
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{task.duration_days}g</span>
                          </span>
                        )}
                      </div>

                      {task.priority && (
                        <div className={clsx('text-xs font-medium', getPriorityColor(task.priority))}>
                          Priorità {task.priority}
                        </div>
                      )}

                      {task.required_documents && task.required_documents.length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                            <FileText className="h-3 w-3 inline mr-1" />
                            📄 Documenti richiesti ({task.required_documents.length})
                          </summary>
                          <ul className="ml-4 mt-1 space-y-0.5">
                            {task.required_documents.map((doc, idx) => (
                              <li key={idx} className="text-gray-600 dark:text-gray-400">• {doc}</li>
                            ))}
                          </ul>
                        </details>
                      )}

                      {task.conditions && (
                        <div className="text-xs bg-orange-100/50 dark:bg-orange-900/50 rounded px-2 py-1 mt-1">
                          <div className="flex items-center text-orange-800 dark:text-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span className="font-medium">⚠️ Condizionale</span>
                          </div>
                          {task.conditions.se && (
                            <div className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                              Se: {task.conditions.se}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Portal and credentials info */}
                      {task.portal_url && (
                        <div className="text-xs bg-blue-100/50 dark:bg-blue-900/50 rounded px-2 py-1 mt-1">
                          <div className="font-medium text-blue-800 dark:text-blue-200">🌐 Portale</div>
                          <div className="text-gray-700 dark:text-gray-300 truncate">
                            {task.portal_url.split('//')[1]?.split('/')[0] || task.portal_url}
                          </div>
                        </div>
                      )}
                      
                      {task.required_credentials && (
                        <div className="text-xs bg-purple-100/50 dark:bg-purple-900/50 rounded px-2 py-1 mt-1">
                          <span className="font-medium text-purple-800 dark:text-purple-200">🔐 Accesso:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{task.required_credentials}</span>
                        </div>
                      )}

                      {/* Documents to generate */}
                      {task.documents_to_generate && task.documents_to_generate.length > 0 && (
                        <details className="text-xs mt-1">
                          <summary className="cursor-pointer text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            ✅ Genera ({task.documents_to_generate.length})
                          </summary>
                          <ul className="ml-4 mt-1 space-y-0.5">
                            {task.documents_to_generate.map((doc, idx) => (
                              <li key={idx} className="text-gray-600 dark:text-gray-400">• {doc}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      
                      {/* Template download links */}
                      {task.template_download_url && (
                        <div className="text-xs mt-1">
                          <a 
                            href={task.template_download_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            📥 Scarica template ufficiale
                          </a>
                        </div>
                      )}

                      {/* Regulatory deadline */}
                      {task.regulatory_deadline && (
                        <div className="text-xs bg-red-100/50 dark:bg-red-900/50 rounded px-2 py-1 mt-1">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="font-medium text-red-800 dark:text-red-200">⏰ Scadenza</span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">{task.regulatory_deadline}</div>
                          {task.deadline_type && (
                            <div className="text-red-700 dark:text-red-300 text-xs">
                              Tipo: {task.deadline_type === 'peremptory' ? 'Perentorio' : 'Ordinatorio'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cost info */}
                      {task.cost_amount && (
                        <div className="text-xs bg-yellow-100/50 dark:bg-yellow-900/50 rounded px-2 py-1 mt-1">
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">💰 Costo:</span>
                          <span className="ml-1 text-gray-700 dark:text-gray-300">€{task.cost_amount}</span>
                          {task.payment_method && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">({task.payment_method})</div>
                          )}
                        </div>
                      )}

                      {/* Human checkpoints */}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {task.requires_human_auth && (
                          <div className="text-xs bg-yellow-100/50 dark:bg-yellow-900/50 rounded px-2 py-0.5">
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">🔑 Auth Umano</span>
                          </div>
                        )}
                        {task.requires_physical_signature && (
                          <div className="text-xs bg-yellow-100/50 dark:bg-yellow-900/50 rounded px-2 py-0.5">
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">✍️ Firma Fisica</span>
                          </div>
                        )}
                        {task.requires_site_inspection && (
                          <div className="text-xs bg-yellow-100/50 dark:bg-yellow-900/50 rounded px-2 py-0.5">
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">🔍 Sopralluogo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legenda</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded" />
              <span>DSO</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded" />
              <span>Terna</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded" />
              <span>GSE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded" />
              <span>Dogane</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700 rounded" />
              <span>Comune</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded" />
              <span>Soprintendenza</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagram;