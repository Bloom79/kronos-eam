import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Building2,
  Filter,
  ChevronRight,
  Play,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Task } from '../types';
import clsx from 'clsx';

interface TaskWithWorkflow extends Task {
  workflow?: {
    id: number;
    nome: string;
    impianto_nome: string;
    impianto_id: number;
  };
}

const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskWithWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'overdue' | 'completed'>('todo');
  const [selectedTask, setSelectedTask] = useState<TaskWithWorkflow | null>(null);

  useEffect(() => {
    loadMyTasks();
  }, [filter]);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      let endpoint = '/workflows/users/me/tasks';
      if (filter === 'todo') {
        endpoint += '?status=To Start';
      } else if (filter === 'completed') {
        endpoint += '?status=Completed';
      }
      
      const response = await apiClient.get(endpoint);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: number) => {
    navigate(`/tasks/${taskId}/complete`);
  };

  const getTaskIcon = (task: TaskWithWorkflow) => {
    if (task.status === 'Completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (isOverdue(task)) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    if (task.status === 'In Progress') {
      return <Clock className="h-5 w-5 text-blue-600" />;
    }
    return <Play className="h-5 w-5 text-gray-400" />;
  };

  const isOverdue = (task: TaskWithWorkflow) => {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const days = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Oggi';
    if (days === 1) return 'Domani';
    if (days === -1) return 'Ieri';
    if (days > 0) return `tra ${days} giorni`;
    return `${Math.abs(days)} giorni fa`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'overdue') return isOverdue(task);
    return true;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => isOverdue(t)).length,
    completed: tasks.filter(t => t.status === 'Completed').length
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          I Miei Task
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestisci le attività assegnate a te nei workflow
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Da Fare</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats.todo}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Corso</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats.inProgress}
              </p>
            </div>
            <Play className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scaduti</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.overdue}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completati</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completed}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <Filter className="h-5 w-5 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Tutti
          </button>
          <button
            onClick={() => setFilter('todo')}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filter === 'todo'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Da Fare
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filter === 'overdue'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Scaduti
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            Completati
          </button>
        </div>

        {/* Task List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun task trovato</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={clsx(
                  'p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
                  selectedTask?.id === task.id && 'bg-gray-50 dark:bg-gray-700'
                )}
                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
              >
                <div className="flex items-start gap-4">
                  {getTaskIcon(task)}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-100">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.descrizione}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {task.workflow && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <FileText className="h-4 w-4" />
                              <span>{task.workflow.nome}</span>
                            </div>
                          )}
                          {task.workflow?.impianto_nome && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Building2 className="h-4 w-4" />
                              <span>{task.workflow.impianto_nome}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className={clsx(
                              'flex items-center gap-1',
                              isOverdue(task) ? 'text-red-600' : 'text-gray-500'
                            )}>
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.priority && (
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            getPriorityColor(task.priority)
                          )}>
                            {task.priority}
                          </span>
                        )}
                        <ChevronRight className={clsx(
                          'h-5 w-5 text-gray-400 transition-transform',
                          selectedTask?.id === task.id && 'rotate-90'
                        )} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedTask?.id === task.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {task.ente_responsabile && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ente Responsabile
                              </p>
                              <p className="font-medium">{task.ente_responsabile}</p>
                            </div>
                          )}
                          {task.tipo_pratica && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tipo Pratica
                              </p>
                              <p className="font-medium">{task.tipo_pratica}</p>
                            </div>
                          )}
                          {task.url_portale && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Portale
                              </p>
                              <a 
                                href={task.url_portale}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Accedi al portale
                              </a>
                            </div>
                          )}
                          {task.credenziali_richieste && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Credenziali Richieste
                              </p>
                              <p className="font-medium">{task.credenziali_richieste}</p>
                            </div>
                          )}
                        </div>

                        {task.instructions && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Istruzioni
                            </p>
                            <p className="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              {task.instructions}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {task.status !== 'Completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                completeTask(Number(task.id));
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Completa Task
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/workflows/${task.workflow?.id}`);
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Vai al Workflow
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;