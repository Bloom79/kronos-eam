import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, LayoutGrid, List, Clock, AlertCircle, 
  CheckCircle, Activity, Building2, Zap, FileText, Home, Trees,
  Calendar, TrendingUp, Users, MapPin
} from 'lucide-react';
import { Workflow, Task, EntityEnum, WorkflowTemplate } from '../types';
import WorkflowKanban from '../components/workflows/WorkflowKanban';
import WorkflowWizard from '../components/workflows/WorkflowWizard';
import WorkflowTimeline from '../components/workflows/WorkflowTimeline';
import EntitySwimlanes from '../components/workflows/EntitySwimlanes';
import clsx from 'clsx';
import { apiClient } from '../services/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type ViewMode = 'kanban' | 'timeline' | 'entities' | 'list';

const RenewableWorkflows: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Load workflows and templates
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workflowsRes, templatesRes, statsRes] = await Promise.all([
        apiClient.get('/workflow/'),
        apiClient.get('/workflow/templates'),
        apiClient.get('/workflow/stats/dashboard')
      ]);

      setWorkflows(workflowsRes.data.items || []);
      setTemplates(templatesRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract all tasks from workflows
  const allTasks: Task[] = workflows.flatMap(workflow =>
    workflow.stages.flatMap(stage => stage.tasks || [])
  );

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.plantname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || workflow.categoria === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleTaskUpdate = async (taskId: number, status: Task['status']) => {
    try {
      await apiClient.put(`/workflow/tasks/${taskId}`, { status });
      loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail modal
  };

  const handleWizardComplete = async (workflowData: any) => {
    try {
      await apiClient.post('/workflow/', workflowData);
      setShowWizard(false);
      loadData();
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEntityIcon = (entity: EntityEnum) => {
    switch (entity) {
      case 'DSO': return Activity;
      case 'Terna': return Zap;
      case 'GSE': return Building2;
      case 'Customs': return FileText;
      case 'Municipality': return Home;
      case 'Superintendency': return Trees;
      default: return MapPin;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {showWizard ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Nuovo Workflow Energie Rinnovabili
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Gestione Workflow Energie Rinnovabili
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestisci i processi autorizzativi e di compliance per plants rinnovabili
              </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca workflow per name o plant..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Tutte le categorie</option>
                  <option value="Attivazione">Attivazione</option>
                  <option value="Fiscale">Fiscale</option>
                  <option value="Incentivi">Incentivi</option>
                  <option value="Variazioni">Variazioni</option>
                  <option value="Manutenzione">Manutenzione</option>
                  <option value="Compliance">Compliance</option>
                </select>

                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      viewMode === 'timeline'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                    title="Vista Timeline"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('entities')}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      viewMode === 'entities'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                    title="Vista per Ente"
                  >
                    <Building2 className="h-5 w-5" />
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
                    title="Vista Lista"
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
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Workflow Attivi</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {stats.active_workflows || 0}
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
                        {stats.overdue_tasks || 0}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Task In Corso</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.in_progress_tasks || 0}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completati</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.completed_workflows || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Template</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {templates.length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Entity Summary */}
            <div className="mt-6 flex flex-wrap gap-2">
              {(['DSO', 'Terna', 'GSE', 'Dogane', 'Comune'] as EntityEnum[]).map(entity => {
                const Icon = getEntityIcon(entity);
                const entityTasks = allTasks.filter(t => t.ente_responsabile === entity);
                
                return (
                  <div
                    key={entity}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {entity}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({entityTasks.length})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          {viewMode === 'timeline' && selectedWorkflow && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-6">
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-blue-600 dark:text-blue-400 hover:underline mb-2"
                >
                  ← Torna alla lista
                </button>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {selectedWorkflow.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedWorkflow.plantname} • Progresso: {selectedWorkflow.progresso}%
                </p>
              </div>
              <WorkflowTimeline
                stages={selectedWorkflow.stages}
                tasks={selectedWorkflow.stages.flatMap(s => s.tasks || [])}
                startDate={selectedWorkflow.dataCreazione ? new Date(selectedWorkflow.dataCreazione) : new Date()}
                onTaskClick={handleTaskClick}
              />
            </div>
          )}

          {viewMode === 'timeline' && !selectedWorkflow && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  Workflow Attivi
                </h3>
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => {
                    const entiInvolti = workflow.enti_coinvolti || [];
                    return (
                      <div
                        key={workflow.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                              {workflow.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {workflow.plantname} • {workflow.categoria}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>Creato: {workflow.dataCreazione && format(new Date(workflow.dataCreazione), 'dd/MM/yyyy')}</span>
                              {workflow.dataScadenza && (
                                <span>Scadenza: {format(new Date(workflow.dataScadenza), 'dd/MM/yyyy')}</span>
                              )}
                            </div>
                            
                            {/* Entity badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {entiInvolti.map(entity => {
                                const Icon = getEntityIcon(entity);
                                return (
                                  <span
                                    key={entity}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    <Icon className="h-3 w-3" />
                                    {entity}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'entities' && (
            <EntitySwimlanes
              tasks={allTasks}
              onTaskClick={handleTaskClick}
              showIntegrationStatus={true}
            />
          )}

          {viewMode === 'kanban' && (
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
          )}

          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  Lista Workflow
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Workflow
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          plant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Enti
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Progresso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Scadenza
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredWorkflows.map((workflow) => (
                        <tr
                          key={workflow.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {workflow.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {workflow.plantname}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {workflow.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex -space-x-1">
                              {(workflow.enti_coinvolti || []).slice(0, 3).map(entity => {
                                const Icon = getEntityIcon(entity);
                                return (
                                  <div
                                    key={entity}
                                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800"
                                    title={entity}
                                  >
                                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                );
                              })}
                              {(workflow.enti_coinvolti || []).length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    +{(workflow.enti_coinvolti || []).length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={clsx('h-2 rounded-full', getProgressColor(workflow.progresso))}
                                    style={{ width: `${workflow.progresso}%` }}
                                  />
                                </div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                {workflow.progresso}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {workflow.dataScadenza && format(new Date(workflow.dataScadenza), 'dd/MM/yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RenewableWorkflows;