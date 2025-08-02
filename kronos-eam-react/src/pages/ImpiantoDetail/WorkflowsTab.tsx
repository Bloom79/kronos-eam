import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Plus,
  Filter
} from 'lucide-react';
import { Workflow, WorkflowTask } from '../../types';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface WorkflowsTabProps {
  plantId: number;
}

const WorkflowsTab: React.FC<WorkflowsTabProps> = ({ plantId }) => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadWorkflows();
  }, [plantId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/workflows?impianto_id=${plantId}`);
      setWorkflows(response.data.items || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 20) return 'bg-yellow-600';
    return 'bg-gray-400';
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'active') return workflow.progresso < 100;
    if (filter === 'completed') return workflow.progresso >= 100;
    return true;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const renderWorkflowDetails = (workflow: Workflow) => {
    return (
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
          Dettagli Workflow
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Categoria</p>
            <p className="font-medium">{workflow.categoria || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
            <p className="font-medium">{workflow.type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Creazione</p>
            <p className="font-medium">{formatDate(workflow.dataCreazione)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Scadenza</p>
            <p className="font-medium">{formatDate(workflow.dataScadenza)}</p>
          </div>
        </div>

        {workflow.enti_coinvolti && workflow.enti_coinvolti.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enti Coinvolti</p>
            <div className="flex flex-wrap gap-2">
              {workflow.enti_coinvolti.map((ente, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                >
                  {ente}
                </span>
              ))}
            </div>
          </div>
        )}

        {workflow.stages && workflow.stages.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Task ({workflow.stages.flatMap(s => s.tasks).filter(t => t.status === 'Completed').length}/{workflow.stages.flatMap(s => s.tasks).length} completati)
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {workflow.stages.flatMap(s => s.tasks).map((task, idx) => (
                <div
                  key={task.id || idx}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded"
                >
                  <div className="flex items-center gap-2">
                    {task.status === 'Completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : task.status === 'In Progress' ? (
                      <Clock className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">{task.title}</span>
                  </div>
                  {task.assignee && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {task.assignee}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/workflows/${workflow.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Visualizza Dettagli
          </button>
          {workflow.progresso < 100 && (
            <button
              onClick={() => navigate(`/workflows/${workflow.id}/tasks`)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Gestisci Task
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Workflow dell'Impianto
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestisci i processi amministrativi e di conformità
          </p>
        </div>
        <button
          onClick={() => navigate(`/workflows/new?plantId=${plantId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuovo Workflow
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={clsx(
            'pb-2 px-1 border-b-2 font-medium text-sm transition-colors',
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Tutti ({workflows.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={clsx(
            'pb-2 px-1 border-b-2 font-medium text-sm transition-colors',
            filter === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Attivi ({workflows.filter(w => w.progresso < 100).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={clsx(
            'pb-2 px-1 border-b-2 font-medium text-sm transition-colors',
            filter === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Completati ({workflows.filter(w => w.progresso >= 100).length})
        </button>
      </div>

      {/* Workflow List */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? 'Nessun workflow presente per questo impianto'
              : `Nessun workflow ${filter === 'active' ? 'attivo' : 'completato'}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(workflow.statusCorrente || 'Active')}
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {workflow.name}
                    </h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {workflow.descrizione || 'Nessuna descrizione disponibile'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Progresso
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(workflow.progresso || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={clsx(
                          'h-2 rounded-full transition-all',
                          getProgressColor(workflow.progresso || 0)
                        )}
                        style={{ width: `${workflow.progresso || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    {workflow.created_by_role && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        <span>Creato da: {workflow.created_by_role}</span>
                      </div>
                    )}
                    {workflow.dataScadenza && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Scadenza: {formatDate(workflow.dataScadenza)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedWorkflow(
                    selectedWorkflow?.id === workflow.id ? null : workflow
                  )}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight 
                    className={clsx(
                      'h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform',
                      selectedWorkflow?.id === workflow.id && 'rotate-90'
                    )}
                  />
                </button>
              </div>

              {/* Expanded Details */}
              {selectedWorkflow?.id === workflow.id && renderWorkflowDetails(workflow)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Fix missing import
const Circle = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
  </svg>
);

export default WorkflowsTab;