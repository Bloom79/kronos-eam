import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, List, Clock, AlertCircle, CheckCircle, Activity, MapPin } from 'lucide-react';
import { Workflow, Task, Plant } from '../types';
import WorkflowKanban from '../components/workflows/WorkflowKanban';
import WorkflowWizard from '../components/workflows/WorkflowWizard';
import WorkflowFilter from '../components/workflows/WorkflowFilter';
import WorkflowLocationView from '../components/workflows/WorkflowLocationView';
import { workflowService, plantsService } from '../services/api';
import clsx from 'clsx';

const Workflows: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'location'>('location');
  const [locationGroupBy, setLocationGroupBy] = useState<'region' | 'province' | 'city'>('region');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    region: 'all',
    province: 'all',
    city: 'all',
    plantType: 'all',
    powerRange: 'all',
    workflowCategory: 'all',
    dateRange: 'all'
  });

  // Extract unique locations from plants data
  const [locations, setLocations] = useState({
    regions: [] as string[],
    provinces: [] as string[],
    cities: [] as string[]
  });

  useEffect(() => {
    loadWorkflows();
    loadStats();
    loadPlants();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowService.getWorkflows();
      setWorkflows(response.items);
    } catch (error) {
      console.error('Error loading workflows:', error);
      // Fallback to mock data for demonstration
      setWorkflows([
    {
      id: 1,
      name: 'Nuova Connessione DSO - FV Solare Verdi',
      plantId: 1,
      plantname: 'FV Solare Verdi S.p.A.',
      plantRegion: 'Puglia',
      plantProvince: 'BR',
      plantCity: 'Brindisi',
      statusCorrente: 'Gestione TICA',
      progresso: 35,
      type: 'New Connection',
      categoria: 'Activation',
      dataCreazione: '2024-01-15',
      dataScadenza: '2024-03-15',
      stages: [
        {
          name: 'Richiesta Connessione',
          completato: true,
          tasks: [
            {
              id: 1,
              title: 'Compilazione domanda connessione',
              status: 'Completed',
              assignee: 'Mario Rossi',
              dueDate: '2024-01-20',
              documents: [
                { name: 'Domanda_Connessione.pdf', type: 'inviato', date: '2024-01-18' },
                { name: 'Schema_Unifilare.pdf', type: 'inviato', date: '2024-01-18' }
              ],
              comments: [
                { user: 'Mario Rossi', text: 'Documentazione completa inviata', date: '2024-01-18' }
              ],
              priority: 'High',
              estimatedHours: 4,
              actualHours: 3
            }
          ]
        },
        {
          name: 'Gestione TICA',
          completato: false,
          tasks: [
            {
              id: 2,
              title: 'Ricezione preventivo TICA',
              status: 'In Progress',
              assignee: 'Mario Rossi',
              dueDate: '2024-02-10',
              documents: [],
              comments: [
                { user: 'Sistema', text: 'In attesa ricezione TICA dal DSO', date: '2024-01-25' }
              ],
              priority: 'High',
              estimatedHours: 2
            },
            {
              id: 3,
              title: 'Analisi tecnico-economica TICA',
              status: 'To Do',
              assignee: 'Laura Neri',
              dueDate: '2024-02-20',
              documents: [],
              comments: [],
              priority: 'Medium',
              estimatedHours: 8
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Dichiarazione Annuale Consumo - Eolico Vento Forte',
      plantId: 2,
      plantname: 'Eolico Vento Forte S.R.L.',
      plantRegion: 'Sicilia',
      plantProvince: 'PA',
      plantCity: 'Palermo',
      statusCorrente: 'Raccolta Dati',
      progresso: 15,
      type: 'Customs Declaration',
      categoria: 'Fiscal',
      dataCreazione: '2024-02-01',
      dataScadenza: '2024-03-31',
      stages: [
        {
          name: 'Raccolta Dati',
          completato: false,
          tasks: [
            {
              id: 4,
              title: 'Lettura contatori mensili',
              status: 'In Progress',
              assignee: 'Giuseppe Verdi',
              dueDate: '2024-03-15',
              documents: [],
              comments: [],
              priority: 'High',
              estimatedHours: 6,
              actualHours: 2
            }
          ]
        }
      ]
    }
  ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await workflowService.getWorkflowStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadPlants = async () => {
    try {
      const response = await plantsService.getPlants();
      const apiPlants = response.items || [];
      
      // Map API plants to our Plant type with proper status and checklist mapping
      const plantData: Plant[] = apiPlants.map(p => ({
        ...p,
        potenza: p.power,
        potenza_kw: p.power_kw,
        comune: p.municipality,
        provincia: p.province,
        regione: p.region,
        // Map API status to our PlantStatusEnum
        status: p.status === 'Under Authorization' ? 'In Authorization' : p.status as any,
        // Map checklist properties from English to Italian
        checklist: p.checklist ? {
          connessione_dso: p.checklist.dso_connection,
          registrazione_terna: p.checklist.terna_registration,
          attivazione_gse: p.checklist.gse_activation,
          licenza_dogane: p.checklist.customs_license,
          verifica_spi: p.checklist.spi_verification,
          dichiarazione_consumo: p.checklist.consumption_declaration,
          compliance_score: p.checklist.compliance_score
        } : undefined
      }));
      
      setPlants(plantData);
      
      // Extract unique locations
      const regions = [...new Set(apiPlants.map(p => p.region).filter(Boolean))].sort() as string[];
      const provinces = [...new Set(apiPlants.map(p => p.province).filter(Boolean))].sort() as string[];
      const cities = [...new Set(apiPlants.map(p => p.municipality).filter(Boolean))].sort() as string[];
      
      setLocations({ regions, provinces, cities });
      
      // Update workflows with plant location data
      setWorkflows(prev => prev.map(workflow => {
        const plant = apiPlants.find(p => p.id === workflow.plantId);
        if (plant) {
          return {
            ...workflow,
            plantRegion: plant.region || 'Non specificato',
            plantProvince: plant.province || 'Non specificato',
            plantCity: plant.municipality || 'Non specificato',
            plantType: plant.type,
            plantPower: plant.power_kw
          };
        }
        return workflow;
      }));
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  // Extract all tasks from workflows for Kanban view
  const allTasks: Task[] = workflows.flatMap(workflow =>
    workflow.stages.flatMap(stage => stage.tasks)
  );

  const filteredWorkflows = workflows.filter(workflow => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.plantname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.plantCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.plantProvince?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.plantRegion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Template filter
    const matchesTemplate = filterTemplate === 'all' || workflow.type === filterTemplate;
    
    // Location filters
    const matchesRegion = filters.region === 'all' || workflow.plantRegion === filters.region;
    const matchesProvince = filters.province === 'all' || workflow.plantProvince === filters.province;
    const matchesCity = filters.city === 'all' || workflow.plantCity === filters.city;
    
    // Plant type filter
    const matchesPlantType = filters.plantType === 'all' || workflow.plantType === filters.plantType;
    
    // Power range filter
    const matchesPowerRange = filters.powerRange === 'all' || (() => {
      const power = workflow.plantPower || 0;
      switch (filters.powerRange) {
        case '0-20': return power <= 20;
        case '20-100': return power > 20 && power <= 100;
        case '100-500': return power > 100 && power <= 500;
        case '500-1000': return power > 500 && power <= 1000;
        case '1000+': return power > 1000;
        default: return true;
      }
    })();
    
    // Workflow category filter
    const matchesCategory = filters.workflowCategory === 'all' || workflow.categoria === filters.workflowCategory;
    
    // Date range filter
    const matchesDateRange = filters.dateRange === 'all' || (() => {
      if (!workflow.dataCreazione) return true;
      const createdDate = new Date(workflow.dataCreazione);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          return createdDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return createdDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return createdDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return createdDate >= quarterAgo;
        case 'year':
          return createdDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesTemplate && matchesRegion && matchesProvince && 
           matchesCity && matchesPlantType && matchesPowerRange && matchesCategory && matchesDateRange;
  });

  const handleTaskUpdate = (taskId: number, status: Task['status']) => {
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
                    placeholder="Cerca workflow per nome, impianto o località..."
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
                      {stats?.active_workflows || workflows.filter(w => w.progresso < 100).length}
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
                      {stats?.overdue_tasks || allTasks.filter(t => t.status === 'Delayed').length}
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
                      {stats?.completed_tasks || allTasks.filter(t => t.status === 'Completed').length}
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
                              workflow.progresso === 100 ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
                            )}>
                              <Icon className={clsx(
                                'h-6 w-6',
                                workflow.progresso === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                              )} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                {workflow.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {workflow.plantname} • {workflow.statusCorrente}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>Creato: {new Date(workflow.dataCreazione!).toLocaleDateString('it-IT')}</span>
                                <span>Scadenza: {new Date(workflow.dataScadenza!).toLocaleDateString('it-IT')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="mb-2">
                              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {workflow.progresso}%
                              </span>
                            </div>
                            <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={clsx('h-2 rounded-full transition-all', getProgressColor(workflow.progresso))}
                                style={{ width: `${workflow.progresso}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Task Summary */}
                        <div className="mt-4 flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {workflow.stages.flatMap(s => s.tasks).filter(t => t.status === 'Completed').length} Completati
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {workflow.stages.flatMap(s => s.tasks).filter(t => t.status === 'In Progress').length} In Corso
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {workflow.stages.flatMap(s => s.tasks).filter(t => t.status === 'Delayed').length} In Ritardo
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