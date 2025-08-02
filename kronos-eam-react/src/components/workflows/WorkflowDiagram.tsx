import React from 'react';
import {
  Clock, Users, Building2, ArrowRight, AlertCircle,
  CheckCircle, FileText, Activity, Zap
} from 'lucide-react';
import clsx from 'clsx';

interface WorkflowStage {
  name: string;
  ordine: number;
  durata_giorni?: number;
  tasks: WorkflowTask[];
}

interface WorkflowTask {
  name?: string;
  title?: string;
  descrizione?: string;
  responsabile?: string;
  durata_giorni?: number;
  ente_responsabile?: string;
  type_pratica?: string;
  documenti_richiesti?: string[];
  checkpoints?: string[];
  condizioni?: any;
  priorita?: string;
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
      case 'Dogane': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'Comune': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700';
      case 'Soprintendenza': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  const getEntityIcon = (entity?: string) => {
    switch (entity) {
      case 'DSO': return Activity;
      case 'Terna': return Zap;
      case 'GSE': return Building2;
      case 'Dogane': return FileText;
      default: return Building2;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 dark:text-red-400';
      case 'Media': return 'text-yellow-600 dark:text-yellow-400';
      case 'Bassa': return 'text-green-600 dark:text-green-400';
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
                  {stage.durata_giorni && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ~{stage.durata_giorni} giorni
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
                const EntityIcon = getEntityIcon(task.ente_responsabile);
                
                return (
                  <div
                    key={taskIndex}
                    className={clsx(
                      'border-2 rounded-lg p-3 transition-all hover:shadow-md',
                      getEntityColor(task.ente_responsabile)
                    )}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm flex-1 pr-2">
                        {taskName}
                      </h5>
                      {task.ente_responsabile && (
                        <EntityIcon className="h-4 w-4 flex-shrink-0" />
                      )}
                    </div>

                    {/* Task Details */}
                    <div className="space-y-2">
                      {task.type_pratica && (
                        <div className="text-xs bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                          {task.type_pratica}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        {task.responsabile && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.responsabile}
                          </span>
                        )}
                        {task.durata_giorni && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.durata_giorni}g
                          </span>
                        )}
                      </div>

                      {task.priorita && (
                        <div className={clsx('text-xs font-medium', getPriorityColor(task.priorita))}>
                          Priorità {task.priorita}
                        </div>
                      )}

                      {task.documenti_richiesti && task.documenti_richiesti.length > 0 && (
                        <div className="text-xs">
                          <FileText className="h-3 w-3 inline mr-1" />
                          {task.documenti_richiesti.length} documenti
                        </div>
                      )}

                      {task.condizioni && (
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Condizionale
                        </div>
                      )}
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