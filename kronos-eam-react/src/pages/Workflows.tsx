import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, List, Kanban, Plus, Filter, Search, ChevronDown, Activity, AlertCircle, CheckCircle, Clock, MapPin, ArrowRight, LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task, Workflow, WorkflowStage, TaskStatusEnum, WorkflowStatusEnum, WorkflowCategoryEnum, EntityEnum, TaskPriorityEnum } from '../types';
import WorkflowCard from '../components/workflows/WorkflowCard';
import WorkflowListItem from '../components/workflows/WorkflowListItem';
import WorkflowKanban from '../components/workflows/WorkflowKanban';
import WorkflowWizard from '../components/workflows/WorkflowWizard';
import WorkflowFilter from '../components/workflows/WorkflowFilter';
import WorkflowLocationView from '../components/workflows/WorkflowLocationView';
import { workflowService, plantsService } from '../services/api';
import clsx from 'clsx';

// Mock data for workflows
const initialWorkflows: Workflow[] = [
  {
    id: 1,
    name: 'Nuova Connessione DSO - FV Solare Verdi',
    plant_id: 1,
    plant_name: 'FV Solare Verdi S.p.A.',
    currentStatus: WorkflowStatusEnum.ACTIVE,
    progress: 35,
    type: 'New Connection',
    category: WorkflowCategoryEnum.ACTIVATION,
    created_at: '2024-01-15',
    due_date: '2024-03-15',
    stages: [
      {
        id: 1,
        name: 'Richiesta Connessione',
        completed: true,
        tasks: [
          { id: 1, title: 'Compilazione domanda connessione', name: 'Compilazione domanda connessione', status: TaskStatusEnum.COMPLETED, assignee: 'Mario Rossi', due_date: '2024-01-20', documents: [], comments: [], priority: TaskPriorityEnum.HIGH, estimated_hours: 4, actual_hours: 3 },
        ]
      },
      {
        id: 2,
        name: 'Gestione TICA',
        completed: false,
        tasks: [
          { id: 2, title: 'Ricezione preventivo TICA', name: 'Ricezione preventivo TICA', status: TaskStatusEnum.IN_PROGRESS, assignee: 'Mario Rossi', due_date: '2024-02-10', documents: [], comments: [], priority: TaskPriorityEnum.HIGH, estimated_hours: 2 },
          { id: 3, title: 'Analisi tecnico-economica TICA', name: 'Analisi tecnico-economica TICA', status: TaskStatusEnum.TO_START, assignee: 'Laura Neri', due_date: '2024-02-20', documents: [], comments: [], priority: TaskPriorityEnum.MEDIUM, estimated_hours: 8 },
        ]
      }
    ],
    involved_entities: [EntityEnum.DSO]
  },
  {
    id: 2,
    name: 'Dichiarazione Annuale Consumo - Eolico Vento Forte',
    plant_id: 2,
    plant_name: 'Eolico Vento Forte S.R.L.',
    currentStatus: WorkflowStatusEnum.ACTIVE,
    progress: 15,
    type: 'Customs Declaration',
    category: WorkflowCategoryEnum.FISCAL,
    created_at: '2024-02-01',
    due_date: '2024-03-31',
    stages: [
      {
        id: 3,
        name: 'Raccolta Dati',
        completed: false,
        tasks: [
          { id: 4, title: 'Lettura contatori mensili', name: 'Lettura contatori mensili', status: TaskStatusEnum.IN_PROGRESS, assignee: 'Giuseppe Verdi', due_date: '2024-03-15', documents: [], comments: [], priority: TaskPriorityEnum.HIGH, estimated_hours: 6, actual_hours: 2 },
        ]
      }
    ],
    involved_entities: [EntityEnum.CUSTOMS]
  }
];

const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'location'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [apiPlants, setApiPlants] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all',
    province: 'all',
    city: 'all',
    plantType: 'all',
    powerRange: 'all',
    workflowCategory: 'all',
    dateRange: 'all',
  });
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [locations, setLocations] = useState<{ regions: string[]; provinces: string[]; cities: string[] }>({ regions: [], provinces: [], cities: [] });
  const [locationGroupBy, setLocationGroupBy] = useState<'region' | 'province' | 'city'>('region');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    loadWorkflows();
    loadStats();
    loadLocations();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    // const data = await workflowService.getWorkflows();
    // setWorkflows(data.items);
    setLoading(false);
  };

  const loadStats = async () => {
    // const data = await workflowService.getWorkflowStats();
    // setStats(data);
  };

  const loadLocations = async () => {
    // In a real app, this would fetch from an API
    setLocations({
      regions: ['Lombardia', 'Lazio', 'Campania'],
      provinces: ['Milano', 'Roma', 'Napoli'],
      cities: ['Milano', 'Roma', 'Napoli']
    });
  };

  useEffect(() => {
    if (apiPlants.length > 0) {
      // Update workflows with plant location data
      setWorkflows(prev => prev.map(workflow => {
        const plant = apiPlants.find((p: any) => p.id === workflow.plant_id);
        if (plant) {
          return {
            ...workflow
          };
        }
        return workflow;
      }));
    }
  }, [apiPlants]);

  // Extract all tasks from workflows for Kanban view
  const allTasks: Task[] = workflows.flatMap(workflow =>
    workflow.stages?.flatMap(stage => stage.tasks) || []
  );

  const filteredWorkflows = workflows.filter(workflow => {
    // Basic search
    const matchesSearch = searchTerm === '' || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.plant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Template filter
    const matchesTemplate = filterTemplate === 'all' || workflow.type === filterTemplate;

    // Status filter
    const matchesStatus = filters.status === 'all' || workflow.currentStatus === filters.status;
    
    return matchesSearch && matchesTemplate && matchesStatus;
  });

  const workflowGroups = filteredWorkflows.reduce((groups, workflow) => {
    const status = workflow.currentStatus || 'Unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(workflow);
    return groups;
  }, {} as Record<WorkflowStatusEnum, Workflow[]>);

  const handleCreateWorkflow = (data: any) => {
    console.log('Creating workflow:', data);
    // Here you would typically call a service to create the workflow
    // For now, we just add it to the local state
    const newWorkflow: Workflow = {
      id: workflows.length + 1,
      name: data.name,
      plant_id: data.plant_id,
      plant_name: 'Nuovo Impianto', // Placeholder
      currentStatus: WorkflowStatusEnum.ACTIVE,
      progress: 0,
      type: data.type_plant,
      category: data.category,
      created_at: new Date().toISOString(),
      due_date: data.due_date,
      stages: [], // Simplified for this example
      involved_entities: data.involvedEntities,
      plant_power: data.power_kw,
    };
    setWorkflows(prev => [newWorkflow, ...prev]);
    setShowWizard(false);
  };

  const handleTaskUpdate = (taskId: number | string, status: Task['status']) => {
    console.log('Updating task', taskId, 'to status', status);
    // Implementation would update the task status in the backend
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    // Implementation would open task detail modal
  };

  const handleWizardComplete = async (workflowData: any) => {
    try {
      console.log('Creating new workflow:', workflowData);
      const newWorkflow = await workflowService.createWorkflow(workflowData);
      console.log('Workflow created:', newWorkflow);
      
      // Reload workflows to show the new one
      await loadWorkflows();
      await loadStats();
      
      setShowWizard(false);
      
      // TODO: Show success notification
    } catch (error) {
      console.error('Error creating workflow:', error);
      // TODO: Show error notification
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWorkflowIcon = (type?: string) => {
    switch (type) {
      case 'Nuova Connessione':
        return Activity;
      case 'Dichiarazione Dogane':
        return AlertCircle;
      case 'Verifica SPI':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Workflow Gestiti per Impianto
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-3">
              I workflow sono ora gestiti direttamente dalle pagine degli impianti per una migliore 
              organizzazione e contesto. Per creare o gestire workflow:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
              <li>Vai alla sezione <strong>Impianti</strong> dal menu laterale</li>
              <li>Seleziona l'impianto desiderato</li>
              <li>Clicca sulla scheda <strong>Workflow</strong> per vedere e gestire tutti i workflow dell'impianto</li>
            </ol>
            <div className="mt-4">
              <Link
                to="/plants"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vai agli Impianti
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {showWizard ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Nuovo Workflow
          </h2>
          <WorkflowWizard
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca workflow per name, impianto o località..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={clsx(
                    'px-4 py-2 border rounded-lg transition-colors flex items-center gap-2',
                    showFilters 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <Filter className="h-5 w-5" />
                  <span className="hidden sm:inline">Filtri</span>
                </button>

                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('location')}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      viewMode === 'location'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                    title="Vista per località"
                  >
                    <MapPin className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      viewMode === 'kanban'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                    title="Vista Kanban"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                    title="Vista lista"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowWizard(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Nuovo Workflow</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Workflow Attivi</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {stats?.active_workflows || workflows.filter(w => w.progress < 100).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Task in Ritardo</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats?.overdue_tasks || allTasks.filter(t => t.status === TaskStatusEnum.DELAYED).length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Task Completati</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats?.completed_tasks || allTasks.filter(t => t.status === TaskStatusEnum.COMPLETED).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Template Disponibili</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {12}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <WorkflowFilter
              filters={filters}
              onFilterChange={setFilters}
              regions={locations.regions}
              provinces={filters.region !== 'all' 
                ? locations.provinces.filter(p => {
                    // In real app, would filter provinces by selected region
                    return true;
                  }) 
                : []}
              cities={filters.province !== 'all'
                ? locations.cities.filter(c => {
                    // In real app, would filter cities by selected province
                    return true;
                  })
                : []}
            />
          )}

          {/* Location View Controls */}
          {viewMode === 'location' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Raggruppa per:
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLocationGroupBy('region')}
                    className={clsx(
                      'px-3 py-1 rounded-lg transition-colors',
                      locationGroupBy === 'region'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    Regione
                  </button>
                  <button
                    onClick={() => setLocationGroupBy('province')}
                    className={clsx(
                      'px-3 py-1 rounded-lg transition-colors',
                      locationGroupBy === 'province'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    Provincia
                  </button>
                  <button
                    onClick={() => setLocationGroupBy('city')}
                    className={clsx(
                      'px-3 py-1 rounded-lg transition-colors',
                      locationGroupBy === 'city'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    Comune
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {viewMode === 'location' ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <WorkflowLocationView
                workflows={filteredWorkflows}
                groupBy={locationGroupBy}
                onWorkflowClick={setSelectedWorkflow}
              />
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Vista Kanban - Tutti i Task
              </h3>
              <WorkflowKanban
                tasks={allTasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskClick={handleTaskClick}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  Lista Workflow
                </h3>
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => {
                    const Icon = getWorkflowIcon(workflow.type);
                    return (
                      <div
                        key={workflow.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={clsx(
                              'p-3 rounded-lg',
                              workflow.progress === 100 ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
                            )}>
                              <Icon className={clsx(
                                'h-6 w-6',
                                workflow.progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                              )} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                {workflow.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {workflow.plant_name} • {workflow.currentStatus}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>Creato: {new Date(workflow.created_at!).toLocaleDateString('it-IT')}</span>
                                <span>Scadenza: {new Date(workflow.due_date!).toLocaleDateString('it-IT')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="mb-2">
                              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {workflow.progress}%
                              </span>
                            </div>
                            <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={clsx('h-2 rounded-full transition-all', getProgressColor(workflow.progress))}
                                style={{ width: `${workflow.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Task Summary */}
                        <div className="mt-4 flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {workflow.stages?.flatMap(s => s.tasks).filter(t => t.status === TaskStatusEnum.COMPLETED).length} Completati
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {workflow.stages?.flatMap(s => s.tasks).filter(t => t.status === TaskStatusEnum.IN_PROGRESS).length} In Corso
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {workflow.stages?.flatMap(s => s.tasks).filter(t => t.status === TaskStatusEnum.DELAYED).length} In Ritardo
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Workflows;
