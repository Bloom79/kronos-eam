import React, { useState, useMemo } from 'react';
import { 
  Building2, Zap, Activity, FileText, MapPin, Home, Trees,
  ChevronRight, Clock, CheckCircle, AlertCircle, ExternalLink,
  User, Calendar, Shield, Key, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { Task, EntityEnum } from '../../types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface EntitySwimlanesProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onEntityFilter?: (entity: EntityEnum) => void;
  showIntegrationStatus?: boolean;
}

interface EntityLane {
  entity: EntityEnum;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  darkBgColor: string;
  portalUrl?: string;
  integrationStatus?: 'connected' | 'disconnected' | 'partial';
  credentials?: {
    type: string;
    configured: boolean;
  };
}

const EntitySwimlanes: React.FC<EntitySwimlanesProps> = ({
  tasks,
  onTaskClick,
  onEntityFilter,
  showIntegrationStatus = true
}) => {
  const [expandedLanes, setExpandedLanes] = useState<Set<EntityEnum>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Task['status'] | 'all'>('all');

  const entityLanes: EntityLane[] = [
    {
      entity: 'DSO' as EntityEnum,
      name: 'DSO (Distributore)',
      description: 'E-Distribuzione, Areti, A2A, etc.',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900',
      portalUrl: 'https://www.e-distribuzione.it',
      integrationStatus: 'partial',
      credentials: { type: 'Username/Password', configured: true }
    },
    {
      entity: 'Terna' as EntityEnum,
      name: 'Terna',
      description: 'GAUDÌ - Gestione registry Unica',
      icon: Zap,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900',
      portalUrl: 'https://www.terna.it/gaudi',
      integrationStatus: 'connected',
      credentials: { type: 'User ID/Password', configured: true }
    },
    {
      entity: 'GSE' as EntityEnum,
      name: 'GSE',
      description: 'Gestore Servizi Energetici',
      icon: Building2,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100',
      darkBgColor: 'dark:bg-orange-900',
      portalUrl: 'https://areaclienti.gse.it',
      integrationStatus: 'disconnected',
      credentials: { type: 'SPID + MFA', configured: false }
    },
    {
      entity: 'Customs' as EntityEnum,
      name: 'Agenzia Dogane',
      description: 'PUDM - Portale Unico Dogane e Monopoli',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900',
      portalUrl: 'https://pudm.adm.gov.it',
      integrationStatus: 'connected',
      credentials: { type: 'SPID/CNS/CIE', configured: true }
    },
    {
      entity: 'Comune' as EntityEnum,
      name: 'Comune',
      description: 'Autorizzazioni edilizie e paesaggistiche',
      icon: Home,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-900',
      integrationStatus: 'disconnected',
      credentials: { type: 'PEC', configured: true }
    },
    {
      entity: 'Soprintendenza' as EntityEnum,
      name: 'Soprintendenza',
      description: 'Autorizzazioni vincoli paesaggistici',
      icon: Trees,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100',
      darkBgColor: 'dark:bg-teal-900',
      integrationStatus: 'disconnected',
      credentials: { type: 'PEC', configured: false }
    }
  ];

  // Group tasks by entity
  const tasksByEntity = useMemo(() => {
    const grouped = new Map<EntityEnum, Task[]>();
    
    entityLanes.forEach(lane => {
      grouped.set(lane.entity, []);
    });

    tasks.forEach(task => {
      if (task.ente_responsabile) {
        const entityTasks = grouped.get(task.ente_responsabile) || [];
        entityTasks.push(task);
        grouped.set(task.ente_responsabile, entityTasks);
      }
    });

    return grouped;
  }, [tasks]);

  const toggleLane = (entity: EntityEnum) => {
    const newExpanded = new Set(expandedLanes);
    if (newExpanded.has(entity)) {
      newExpanded.delete(entity);
    } else {
      newExpanded.add(entity);
    }
    setExpandedLanes(newExpanded);
  };

  const getTaskIcon = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return CheckCircle;
      case 'In Progress': return Clock;
      case 'Delayed': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getTaskColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return 'text-green-600 dark:text-green-400';
      case 'In Progress': return 'text-blue-600 dark:text-blue-400';
      case 'Delayed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getIntegrationIcon = (status?: string) => {
    switch (status) {
      case 'connected': return Wifi;
      case 'partial': return RefreshCw;
      default: return WifiOff;
    }
  };

  const getIntegrationColor = (status?: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  const filteredTasksByEntity = useMemo(() => {
    if (selectedStatus === 'all') return tasksByEntity;
    
    const filtered = new Map<EntityEnum, Task[]>();
    tasksByEntity.forEach((tasks, entity) => {
      filtered.set(entity, tasks.filter(t => t.status === selectedStatus));
    });
    return filtered;
  }, [tasksByEntity, selectedStatus]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtra per status:
          </span>
          <div className="flex gap-2">
            {(['all', 'To Do', 'In Progress', 'Delayed', 'Completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status as any)}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                {status === 'all' ? 'Tutti' : status}
              </button>
            ))}
          </div>
        </div>

        {showIntegrationStatus && (
          <div className="flex items-center gap-2 text-sm">
            <Wifi className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Status integrazioni
            </span>
          </div>
        )}
      </div>

      {/* Swimlanes */}
      <div className="space-y-4">
        {entityLanes.map(lane => {
          const entityTasks = filteredTasksByEntity.get(lane.entity) || [];
          const isExpanded = expandedLanes.has(lane.entity);
          const Icon = lane.icon;
          const IntegrationIcon = getIntegrationIcon(lane.integrationStatus);
          
          return (
            <div
              key={lane.entity}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              {/* Lane Header */}
              <div
                className={clsx(
                  'p-4 cursor-pointer transition-colors',
                  lane.bgColor,
                  lane.darkBgColor
                )}
                onClick={() => {
                  toggleLane(lane.entity);
                  onEntityFilter?.(lane.entity);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'p-2 rounded-lg bg-white/80 dark:bg-gray-800/80',
                      lane.color
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className={clsx('font-semibold', lane.color)}>
                        {lane.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lane.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Task Count */}
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-sm font-medium bg-white/80 dark:bg-gray-800/80',
                        lane.color
                      )}>
                        {entityTasks.length} task
                      </span>
                    </div>

                    {/* Integration Status */}
                    {showIntegrationStatus && (
                      <div className="flex items-center gap-2">
                        <IntegrationIcon className={clsx(
                          'h-5 w-5',
                          getIntegrationColor(lane.integrationStatus)
                        )} />
                        {lane.credentials && (
                          <div className="flex items-center gap-1">
                            {lane.credentials.configured ? (
                              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Key className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {lane.credentials.type}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Portal Link */}
                    {lane.portalUrl && (
                      <a
                        href={lane.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </a>
                    )}

                    <ChevronRight className={clsx(
                      'h-5 w-5 transition-transform',
                      lane.color,
                      isExpanded ? 'rotate-90' : ''
                    )} />
                  </div>
                </div>
              </div>

              {/* Expanded Tasks */}
              {isExpanded && (
                <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-700/50">
                  {entityTasks.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Nessun task per questo ente
                    </p>
                  ) : (
                    entityTasks.map(task => {
                      const TaskIcon = getTaskIcon(task.status);
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick?.(task)}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <TaskIcon className={clsx(
                                'h-5 w-5 mt-0.5',
                                getTaskColor(task.status)
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
                                  {task.tipo_pratica && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                                      <FileText className="h-3 w-3" />
                                      {task.tipo_pratica}
                                    </span>
                                  )}
                                  
                                  {task.assignee && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      <User className="h-3 w-3" />
                                      {task.assignee}
                                    </span>
                                  )}
                                  
                                  {task.dueDate && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                                    </span>
                                  )}

                                  {task.estimatedHours && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedHours}h
                                    </span>
                                  )}
                                </div>

                                {/* Dependencies */}
                                {task.dipendenze && task.dipendenze.length > 0 && (
                                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Dipende da: {task.dipendenze.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Priority Badge */}
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

                          {/* Progress Bar for In Progress tasks */}
                          {task.status === 'In Progress' && task.estimatedHours && task.actualHours && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Progresso</span>
                                <span>{task.actualHours}/{task.estimatedHours}h</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.min(100, (task.actualHours / task.estimatedHours) * 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Riepilogo Attività per Ente
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {entityLanes.map(lane => {
            const entityTasks = tasksByEntity.get(lane.entity) || [];
            const completedTasks = entityTasks.filter(t => t.status === 'Completed').length;
            const Icon = lane.icon;
            
            return (
              <div key={lane.entity} className="text-center">
                <div className={clsx(
                  'inline-flex items-center justify-center w-12 h-12 rounded-full mb-2',
                  lane.bgColor,
                  lane.darkBgColor
                )}>
                  <Icon className={clsx('h-6 w-6', lane.color)} />
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {lane.entity}
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {completedTasks}/{entityTasks.length}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EntitySwimlanes;