import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, AlertCircle, Activity, 
  ChevronRight, FileText, Users, Building2, ExternalLink,
  Info, AlertTriangle, MapPin, Zap
} from 'lucide-react';
import { WorkflowStage, Task, EntityEnum } from '../../types';
import clsx from 'clsx';
import { format, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';
import { it } from 'date-fns/locale';

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  tasks: Task[];
  startDate?: Date;
  onTaskClick?: (task: Task) => void;
  onStageClick?: (stage: WorkflowStage) => void;
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  stages,
  tasks,
  startDate = new Date(),
  onTaskClick,
  onStageClick
}) => {
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<EntityEnum | 'all'>('all');
  const [timelineView, setTimelineView] = useState<'gantt' | 'list'>('list');

  // Calculate timeline data
  const calculateTimeline = () => {
    let currentDate = startDate;
    const timelineData: any[] = [];

    stages.forEach((stage, stageIndex) => {
      const stageTasks = tasks.filter(t => t.stage?.id === stage.id);
      const stageStartDate = currentDate;
      const stageDuration = stage.durata_giorni || 30;
      const stageEndDate = addDays(stageStartDate, stageDuration);

      timelineData.push({
        type: 'stage',
        data: stage,
        startDate: stageStartDate,
        endDate: stageEndDate,
        tasks: stageTasks
      });

      currentDate = stageEndDate;
    });

    return timelineData;
  };

  const timelineData = calculateTimeline();

  const getEntityColor = (entity?: EntityEnum) => {
    switch (entity) {
      case 'DSO': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'Terna': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'GSE': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'Customs': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'Municipality': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEntityIcon = (entity?: EntityEnum) => {
    switch (entity) {
      case 'DSO': return Activity;
      case 'Terna': return Zap;
      case 'GSE': return Building2;
      case 'Customs': return FileText;
      case 'Municipality': return Building2;
      default: return Users;
    }
  };

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return CheckCircle;
      case 'In Progress': return Clock;
      case 'Delayed': return AlertTriangle;
      default: return AlertCircle;
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return 'text-green-600 dark:text-green-400';
      case 'In Progress': return 'text-blue-600 dark:text-blue-400';
      case 'Delayed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const toggleStage = (stageId: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const filteredTasks = selectedEntity === 'all' 
    ? tasks 
    : tasks.filter(t => t.ente_responsabile === selectedEntity);

  const entities = ['all', 'DSO', 'Terna', 'GSE', 'Dogane', 'Comune'] as const;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtra per Ente:
          </span>
          <div className="flex flex-wrap gap-2">
            {entities.map(entity => {
              const Icon = entity === 'all' ? Users : getEntityIcon(entity as EntityEnum);
              return (
                <button
                  key={entity}
                  onClick={() => setSelectedEntity(entity as any)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1',
                    selectedEntity === entity
                      ? entity === 'all' 
                        ? 'bg-gray-600 text-white'
                        : getEntityColor(entity as EntityEnum)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {entity === 'all' ? 'Tutti' : entity}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimelineView('list')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              timelineView === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            Lista
          </button>
          <button
            onClick={() => setTimelineView('gantt')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              timelineView === 'gantt'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            Gantt
          </button>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {timelineView === 'list' ? (
          <div className="p-6">
            <div className="space-y-6">
              {timelineData.map((item, index) => {
                const stage = item.data as WorkflowStage;
                const isExpanded = expandedStages.has(stage.id!);
                const stageTasks = selectedEntity === 'all' 
                  ? item.tasks 
                  : item.tasks.filter((t: Task) => t.ente_responsabile === selectedEntity);

                return (
                  <div key={stage.id} className="relative">
                    {/* Stage Header */}
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        toggleStage(stage.id!);
                        onStageClick?.(stage);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Timeline Line */}
                        <div className="relative">
                          <div className={clsx(
                            'w-12 h-12 rounded-full flex items-center justify-center',
                            stage.completato 
                              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          )}>
                            {stage.completato ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <span className="font-bold">{index + 1}</span>
                            )}
                          </div>
                          {index < timelineData.length - 1 && (
                            <div className={clsx(
                              'absolute top-12 left-6 w-0.5 h-24',
                              stage.completato 
                                ? 'bg-green-300 dark:bg-green-700'
                                : 'bg-gray-300 dark:bg-gray-600'
                            )} />
                          )}
                        </div>

                        {/* Stage Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {stage.name}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(item.startDate, 'dd MMM yyyy', { locale: it })} - 
                                    {format(item.endDate, 'dd MMM yyyy', { locale: it })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{stage.durata_giorni || 30} giorni</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{stageTasks.length} task</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={clsx(
                              'h-5 w-5 text-gray-400 transition-transform',
                              isExpanded ? 'rotate-90' : ''
                            )} />
                          </div>

                          {/* Stage Progress */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${stage.completato ? 100 : 
                                    (stageTasks.filter((t: Task) => t.status === 'Completed').length / 
                                    stageTasks.length * 100) || 0}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Tasks */}
                    {isExpanded && (
                      <div className="ml-16 mt-4 space-y-3">
                        {stageTasks.map((task: Task) => {
                          const TaskIcon = getTaskStatusIcon(task.status);
                          const EntityIcon = getEntityIcon(task.ente_responsabile);

                          return (
                            <div
                              key={task.id}
                              onClick={() => onTaskClick?.(task)}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3">
                                    <TaskIcon className={clsx(
                                      'h-5 w-5 mt-0.5',
                                      getTaskStatusColor(task.status)
                                    )} />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800 dark:text-gray-100">
                                        {task.title}
                                      </h4>
                                      {task.descrizione && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {task.descrizione}
                                        </p>
                                      )}
                                      
                                      <div className="flex flex-wrap items-center gap-3 mt-2">
                                        {task.ente_responsabile && (
                                          <span className={clsx(
                                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                            getEntityColor(task.ente_responsabile)
                                          )}>
                                            <EntityIcon className="h-3 w-3" />
                                            {task.ente_responsabile}
                                          </span>
                                        )}
                                        
                                        {task.tipo_pratica && (
                                          <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {task.tipo_pratica}
                                          </span>
                                        )}
                                        
                                        {task.assignee && (
                                          <span className="text-xs text-gray-600 dark:text-gray-400">
                                            <Users className="inline h-3 w-3 mr-1" />
                                            {task.assignee}
                                          </span>
                                        )}
                                        
                                        {task.dueDate && (
                                          <span className="text-xs text-gray-600 dark:text-gray-400">
                                            <Clock className="inline h-3 w-3 mr-1" />
                                            {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                                          </span>
                                        )}
                                      </div>

                                      {task.url_portale && (
                                        <a
                                          href={task.url_portale}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          Vai al portale
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {task.priority && (
                                  <span className={clsx(
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    task.priority === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300' :
                                    task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' :
                                    'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                                  )}>
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Gantt Chart View
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Gantt Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Vista Gantt - {format(startDate, 'MMMM yyyy', { locale: it })}
                </h3>
              </div>

              {/* Gantt Chart */}
              <div className="space-y-2">
                {timelineData.map((item, index) => {
                  const stage = item.data as WorkflowStage;
                  const totalDays = differenceInDays(
                    addDays(timelineData[timelineData.length - 1].endDate, 30),
                    startDate
                  );
                  const startOffset = differenceInDays(item.startDate, startDate);
                  const duration = differenceInDays(item.endDate, item.startDate);
                  const startPercent = (startOffset / totalDays) * 100;
                  const widthPercent = (duration / totalDays) * 100;

                  return (
                    <div key={stage.id} className="relative h-16">
                      <div className="absolute left-0 top-0 w-40 h-full flex items-center px-2 bg-gray-50 dark:bg-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {stage.name}
                        </span>
                      </div>
                      <div className="ml-40 relative h-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className={clsx(
                            'absolute h-10 top-3 rounded-lg flex items-center px-2',
                            stage.completato
                              ? 'bg-green-500 dark:bg-green-600'
                              : 'bg-blue-500 dark:bg-blue-600'
                          )}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {duration}g
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Scale */}
              <div className="ml-40 mt-4 relative h-8 bg-gray-50 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600">
                <div className="absolute inset-x-0 flex justify-between px-2">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const date = addDays(startDate, i * 30);
                    return (
                      <span key={i} className="text-xs text-gray-600 dark:text-gray-400">
                        {format(date, 'dd/MM')}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Legenda
        </h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-600 dark:text-gray-400">Completato</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-400">In Corso</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-gray-600 dark:text-gray-400">In Ritardo</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Da Iniziare</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTimeline;