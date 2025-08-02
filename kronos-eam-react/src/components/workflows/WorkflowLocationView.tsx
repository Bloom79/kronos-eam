import React from 'react';
import { MapPin, ChevronRight, ChevronDown, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Workflow } from '../../types';
import clsx from 'clsx';

interface WorkflowLocationViewProps {
  workflows: Workflow[];
  groupBy: 'region' | 'province' | 'city';
  onWorkflowClick: (workflow: Workflow) => void;
}

interface LocationGroup {
  location: string;
  workflows: Workflow[];
  stats: {
    total: number;
    active: number;
    completed: number;
    delayed: number;
  };
}

const WorkflowLocationView: React.FC<WorkflowLocationViewProps> = ({
  workflows,
  groupBy,
  onWorkflowClick
}) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  // Group workflows by location
  const groupedWorkflows = React.useMemo(() => {
    const groups: { [key: string]: Workflow[] } = {};
    
    workflows.forEach(workflow => {
      // Get location based on groupBy
      let location = 'Non specificato';
      
      // We need to get plant data to access location info
      // For now, using a placeholder approach - in real implementation, 
      // this would come from the plant data
      if (groupBy === 'region') {
        location = workflow.plantRegion || 'Non specificato';
      } else if (groupBy === 'province') {
        location = workflow.plantProvince || 'Non specificato';
      } else if (groupBy === 'city') {
        location = workflow.plantCity || 'Non specificato';
      }
      
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(workflow);
    });

    // Convert to array and calculate stats
    const locationGroups: LocationGroup[] = Object.entries(groups).map(([location, workflows]) => {
      const stats = {
        total: workflows.length,
        active: workflows.filter(w => w.progresso < 100 && w.progresso > 0).length,
        completed: workflows.filter(w => w.progresso === 100).length,
        delayed: workflows.reduce((sum, w) => {
          const delayedTasks = w.stages.flatMap(s => s.tasks).filter(t => t.status === 'Delayed').length;
          return sum + (delayedTasks > 0 ? 1 : 0);
        }, 0)
      };

      return { location, workflows, stats };
    });

    // Sort by number of workflows
    return locationGroups.sort((a, b) => b.stats.total - a.stats.total);
  }, [workflows, groupBy]);

  const toggleGroup = (location: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(location)) {
      newExpanded.delete(location);
    } else {
      newExpanded.add(location);
    }
    setExpandedGroups(newExpanded);
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWorkflowIcon = (workflow: Workflow) => {
    if (workflow.progresso === 100) return CheckCircle;
    if (workflow.stages.flatMap(s => s.tasks).some(t => t.status === 'Delayed')) return AlertCircle;
    if (workflow.progresso > 0) return Activity;
    return Clock;
  };

  const getLocationLabel = () => {
    switch (groupBy) {
      case 'region': return 'Regione';
      case 'province': return 'Provincia';
      case 'city': return 'Comune';
      default: return 'Località';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Workflow per {getLocationLabel()}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {groupedWorkflows.length} {groupedWorkflows.length === 1 ? 'località' : 'località'} • 
          {workflows.length} workflow totali
        </div>
      </div>

      {groupedWorkflows.map((group) => {
        const isExpanded = expandedGroups.has(group.location);
        
        return (
          <div key={group.location} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Group Header */}
            <div
              onClick={() => toggleGroup(group.location)}
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-1">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    {group.location}
                  </h4>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    {group.stats.total} workflow
                  </span>
                </div>

                {/* Stats Pills */}
                <div className="flex items-center gap-2">
                  {group.stats.active > 0 && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {group.stats.active} attivi
                    </span>
                  )}
                  {group.stats.completed > 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {group.stats.completed} completati
                    </span>
                  )}
                  {group.stats.delayed > 0 && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs rounded-full flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {group.stats.delayed} in ritardo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.workflows.map((workflow) => {
                    const Icon = getWorkflowIcon(workflow);
                    const iconColor = workflow.progresso === 100 
                      ? 'text-green-600 dark:text-green-400' 
                      : workflow.stages.flatMap(s => s.tasks).some(t => t.status === 'Delayed')
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400';

                    return (
                      <div
                        key={workflow.id}
                        onClick={() => onWorkflowClick(workflow)}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className={clsx('h-5 w-5 mt-1', iconColor)} />
                            <div>
                              <h5 className="font-medium text-gray-800 dark:text-gray-100">
                                {workflow.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {workflow.plantname} • {workflow.statusCorrente}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Creato: {new Date(workflow.dataCreazione!).toLocaleDateString('it-IT')}</span>
                                {workflow.dataScadenza && (
                                  <span>Scadenza: {new Date(workflow.dataScadenza).toLocaleDateString('it-IT')}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="mb-1">
                              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {workflow.progresso}%
                              </span>
                            </div>
                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div
                                className={clsx('h-1.5 rounded-full transition-all', getProgressColor(workflow.progresso))}
                                style={{ width: `${workflow.progresso}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {groupedWorkflows.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Nessun workflow trovato per i filtri selezionati
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowLocationView;