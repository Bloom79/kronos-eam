import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  User,
  Calendar,
  FileText,
  Filter,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  Square,
  FileCheck,
  Upload,
  Search,
  Activity,
  Package,
  Layers,
  Building2,
  Eye,
  FileSignature
} from 'lucide-react';
import { Plant } from '../../types/plant-type';
import { Workflow, WorkflowTask, WorkflowTemplate, TaskStatusEnum } from '../../types';
import { workflowService, plantsService } from '../../services/api';
import WorkflowWizard from '../../components/workflows/WorkflowWizard';
import TaskCard from '../../components/workflows/TaskCard';
import clsx from 'clsx';
import { useToast } from '../../hooks/useToast';

interface WorkflowsTabProps {
  plantId: number;
}

interface WorkflowWithPhases extends Workflow {
  phases?: {
    id: string;
    name: string;
    order: number;
    tasks: WorkflowTask[];
    completedTasks: number;
    totalTasks: number;
    progress: number;
  }[];
}

const WorkflowsTab: React.FC<WorkflowsTabProps> = ({ plantId }) => {
  const [workflows, setWorkflows] = useState<WorkflowWithPhases[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowWithPhases | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showWizard, setShowWizard] = useState(false);
  const [plant, setPlant] = useState<Plant | null>(null);
  const { toast } = useToast();
  const [preSelectedTemplate, setPreSelectedTemplate] = useState<WorkflowTemplate | undefined>(undefined);
  const [userHasSelectedWorkflow, setUserHasSelectedWorkflow] = useState(false);

  useEffect(() => {
    loadData();
  }, [plantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workflowsData, templatesData, plantData] = await Promise.all([
        loadWorkflows(),
        workflowService.getApplicableTemplatesForPlant(plantId),  // Use plant-specific endpoint
        plantsService.getPlant(plantId)
      ]);
      setTemplates(templatesData as WorkflowTemplate[]);
      // Convert API plant to our Plant type
      const plant: Plant = {
        ...plantData,
        power: plantData.power,
        power_kw: plantData.power_kw,
        municipality: plantData.municipality,
        province: plantData.province,
        region: plantData.region,
        next_deadline: plantData.next_deadline,
        deadline_color: plantData.deadline_color,
        gse_integration: plantData.gse_integration,
        terna_integration: plantData.terna_integration,
        customs_integration: plantData.customs_integration,
        dso_integration: plantData.dso_integration,
      } as Plant;
      setPlant(plant);
    } catch (error) {
      console.error('Error loading date:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await workflowService.getWorkflows({ plant_id: plantId });
      const workflowsWithPhases = response.items.map(workflow => {
        const phases = organizeTasksByPhases(workflow);
        return { ...workflow, phases };
      });
      setWorkflows(workflowsWithPhases);

      // If there's only one active workflow, select it automatically
      const activeWorkflows = workflowsWithPhases.filter(w => w.progress < 100);
      if (activeWorkflows.length > 0 && !userHasSelectedWorkflow) {
        setSelectedWorkflow(activeWorkflows[0]);
      }

      return workflowsWithPhases;
    } catch (error) {
      console.error('Error loading workflows:', error);
      return [];
    }
  };

  const organizeTasksByPhases = (workflow: Workflow) => {
    if (!workflow.tasks || workflow.tasks.length === 0) {
      // If there are no tasks, but there are stages, return empty stages
      if (workflow.stages && workflow.stages.length > 0) {
        return workflow.stages.map(stage => ({
          id: `phase-${stage.order}`,
          name: stage.name,
          order: stage.order || 0,
          tasks: [],
          completedTasks: 0,
          totalTasks: 0,
          progress: 0
        })).sort((a, b) => a.order - b.order);
      }
      return [];
    }
  
    const stagesMap = new Map<string, { tasks: WorkflowTask[], order: number }>();
  
    // First, populate the map with all stages from the workflow to preserve order and include empty ones
    if (workflow.stages) {
      workflow.stages.forEach(stage => {
        if (!stagesMap.has(stage.name)) {
          stagesMap.set(stage.name, { tasks: [], order: stage.order || 0 });
        }
      });
    }
  
    // Then, group tasks into the stages
    (workflow.tasks as WorkflowTask[]).forEach(task => {
      const stageName = task.stage_name || 'General';
      if (!stagesMap.has(stageName)) {
        // This case handles tasks that might not have a corresponding stage in the workflow.stages array
        stagesMap.set(stageName, { tasks: [], order: 99 }); // Give it a high order to place it at the end
      }
      const stageEntry = stagesMap.get(stageName);
      if (stageEntry) {
        stageEntry.tasks.push(task);
      }
    });
  
    // Convert map to array and calculate progress
    return Array.from(stagesMap.entries()).map(([name, data]) => {
      const completedTasks = data.tasks.filter(task => task.status === TaskStatusEnum.COMPLETED).length;
      const totalTasks = data.tasks.length;
      return {
        id: `phase-${data.order}`,
        name: name,
        order: data.order,
        tasks: data.tasks,
        completedTasks,
        totalTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    }).sort((a, b) => a.order - b.order);
  };

  const handleCreateWorkflow = async (workflowData: any) => {
    try {
      const newWorkflow = await workflowService.createWorkflow(workflowData);
      await loadData();
      setShowWizard(false);
      toast.success('Workflow creato con successo');
      
      // Automatically select the new workflow
      const workflowWithPhases = {
        ...newWorkflow,
        phases: organizeTasksByPhases(newWorkflow)
      };
      setSelectedWorkflow(workflowWithPhases);
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Errore nella creazione del workflow');
    }
  };

  const handleTaskUpdate = (taskId: number | string, updates: Partial<WorkflowTask>) => {
    const updatedWorkflows = workflows.map(workflow => {
      if (workflow.id !== selectedWorkflow?.id) {
        return workflow;
      }
      
      const updatedPhases = workflow.phases?.map(phase => {
        const updatedTasks = phase.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updates };
          }
          return task;
        });
        return { ...phase, tasks: updatedTasks };
      });

      const updatedWorkflow = { ...workflow, phases: updatedPhases };
      
      // Recalculate progress
      const allTasks = updatedWorkflow.phases?.flatMap(p => p.tasks) || [];
      const completedTasks = allTasks.filter(t => t.status === TaskStatusEnum.COMPLETED).length;
      updatedWorkflow.progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
      
      setSelectedWorkflow(updatedWorkflow);
      return updatedWorkflow;
    });

    setWorkflows(updatedWorkflows);
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Play className="h-5 w-5 text-blue-600" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Paused':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'Blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Delayed':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 20) return 'bg-yellow-600';
    return 'bg-gray-400';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'active') return workflow.progress < 100;
    if (filter === 'completed') return workflow.progress >= 100;
    return true;
  });

  const getRelevantTemplates = () => {
    if (!plant) return templates;
    
    return templates.filter(template => {
      // Filter by plant type
      if (template.plant_type && template.plant_type !== 'Tutti' && template.plant_type !== plant.type) {
        return false;
      }
      
      // Filter by power range
      const powerKw = plant.power_kw || 0;
      if (template.min_power && powerKw < template.min_power) return false;
      if (template.max_power && powerKw > template.max_power) return false;
      
      return true;
    });
  };

  const renderWorkflowList = () => {
    if (filteredWorkflows.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'active' ? 'Nessun workflow attivo' : 
             filter === 'completed' ? 'Nessun workflow completato' :
             'Nessun workflow trovato'}
          </p>
          {filter === 'active' && (
            <button
              onClick={() => setShowWizard(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crea Workflow
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredWorkflows.map(workflow => (
          <div
            key={workflow.id}
            className={clsx(
              'border rounded-lg p-4 cursor-pointer transition-all',
              selectedWorkflow?.id === workflow.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            onClick={() => {
              setSelectedWorkflow(workflow);
              setUserHasSelectedWorkflow(true);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(workflow.currentStatus)}
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {workflow.name}
                </h4>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(workflow.created_at)}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progresso totale</span>
                <span>{workflow.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={clsx('h-2 rounded-full transition-all', getProgressColor(workflow.progress))}
                  style={{ width: `${workflow.progress}%` }}
                />
              </div>
            </div>

            {workflow.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className={clsx(
                  'text-sm',
                  new Date(workflow.due_date) < new Date() 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                )}>
                  Scadenza: {formatDate(workflow.due_date)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWorkflowDetail = () => {
    if (!selectedWorkflow) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(selectedWorkflow.currentStatus)}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedWorkflow.name}
              </h3>
            </div>
            <span className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium',
              selectedWorkflow.progress >= 100
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            )}>
              {selectedWorkflow.progress >= 100 ? 'Completato' : 'In corso'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categoria</p>
              <p className="font-medium">{selectedWorkflow.category || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Creato il</p>
              <p className="font-medium">{formatDate(selectedWorkflow.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scadenza</p>
              <p className={clsx(
                'font-medium',
                selectedWorkflow.due_date && new Date(selectedWorkflow.due_date) < new Date() 
                  ? 'text-red-600' 
                  : ''
              )}>
                {formatDate(selectedWorkflow.due_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
              <p className="font-medium">{selectedWorkflow.progress || 0}%</p>
            </div>
          </div>

          {selectedWorkflow.involved_entities && selectedWorkflow.involved_entities.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enti Coinvolti</p>
              <div className="flex flex-wrap gap-2">
                {selectedWorkflow.involved_entities.map((entity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phases with Tasks */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Fasi e Attività
          </h4>
          
          {selectedWorkflow.phases?.map((phase) => (
            <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedPhases.has(phase.id) ? 
                      <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    }
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      {phase.name}
                    </h5>
                    <span className="text-sm text-gray-500">
                      ({phase.completedTasks}/{phase.totalTasks} attività)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {phase.progress}%
                    </span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={clsx('h-2 rounded-full', getProgressColor(phase.progress))}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {expandedPhases.has(phase.id) && (
                <div className="p-4 space-y-3">
                  {phase.tasks.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Nessuna attività in questa fase
                    </p>
                  ) : (
                    phase.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Caricamento workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Workflow di Conformità
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestisci tutti i processi normativi e amministrativi per questo impianto
            </p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Workflow
          </button>
        </div>

        {/* Quick Templates */}
        {getRelevantTemplates().length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Template Disponibili
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {getRelevantTemplates().slice(0, 3).map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setPreSelectedTemplate(template);
                    setShowWizard(true);
                  }}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {template.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {template.estimated_duration_days || 0} giorni
                    </span>
                    {template.recurrence && template.recurrence !== 'One-time' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                        {template.recurrence}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('active')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === 'active'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Attivi ({workflows.filter(w => w.progress < 100).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === 'completed'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Completati ({workflows.filter(w => w.progress >= 100).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Tutti ({workflows.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-1">
          {renderWorkflowList()}
        </div>

        {/* Workflow Detail */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            renderWorkflowDetail()
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
              <Activity className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Seleziona un workflow per visualizzare i dettagli
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <WorkflowWizard
              plantId={plantId}
              onComplete={handleCreateWorkflow}
              onCancel={() => {
                setShowWizard(false);
                setPreSelectedTemplate(undefined);
              }}
              preSelectedTemplate={preSelectedTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsTab;