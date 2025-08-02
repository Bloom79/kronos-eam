import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, FileText, Users,
  Clock, Building2, AlertTriangle, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';

interface Task {
  id?: string;
  name?: string;
  title?: string;
  descrizione?: string;
  responsabile?: string;
  durata_giorni?: number;
  priorita?: string;
  ente_responsabile?: string;
  type_pratica?: string;
  documenti_richiesti?: string[];
  checkpoints?: string[];
  condizioni?: any;
}

interface TaskEditorProps {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ tasks, onChange }) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const entities = ['DSO', 'Terna', 'GSE', 'Dogane', 'Comune', 'Regione', 'Soprintendenza'];
  const priorities = ['Alta', 'Media', 'Bassa'];

  const addTask = () => {
    if (taskForm.name || taskForm.title) {
      const newTask: Task = {
        ...taskForm,
        id: `task-${Date.now()}`,
        priorita: taskForm.priorita || 'Media',
        durata_giorni: taskForm.durata_giorni || 7
      };
      onChange([...tasks, newTask]);
      setTaskForm({});
      setShowAddForm(false);
    }
  };

  const updateTask = (index: number, updates: Partial<Task>) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], ...updates };
    onChange(updatedTasks);
  };

  const deleteTask = (index: number) => {
    onChange(tasks.filter((_, i) => i !== index));
  };

  const startEditingTask = (index: number) => {
    setEditingTask(index);
    setTaskForm({ ...tasks[index] });
  };

  const saveTaskEdit = () => {
    if (editingTask !== null && (taskForm.name || taskForm.title)) {
      updateTask(editingTask, taskForm);
      setEditingTask(null);
      setTaskForm({});
    }
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setTaskForm({});
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'Media': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Bassa': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'Alta': return AlertTriangle;
      case 'Media': return Clock;
      case 'Bassa': return CheckCircle;
      default: return Clock;
    }
  };

  const renderTaskForm = (task: Partial<Task>, isNew: boolean = false) => (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            name Attività *
          </label>
          <input
            type="text"
            value={task.name || task.title || ''}
            onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            placeholder="es. Presentazione domanda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ente Responsabile
          </label>
          <select
            value={task.ente_responsabile || ''}
            onChange={(e) => setTaskForm({ ...taskForm, ente_responsabile: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">Nessuno</option>
            {entities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrizione
        </label>
        <textarea
          value={task.descrizione || ''}
          onChange={(e) => setTaskForm({ ...taskForm, descrizione: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          placeholder="Descrizione dell'attività..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Responsabile Default
          </label>
          <input
            type="text"
            value={task.responsabile || ''}
            onChange={(e) => setTaskForm({ ...taskForm, responsabile: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            placeholder="es. Asset Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Durata (giorni)
          </label>
          <input
            type="number"
            value={task.durata_giorni || ''}
            onChange={(e) => setTaskForm({ ...taskForm, durata_giorni: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            placeholder="7"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priorità
          </label>
          <select
            value={task.priorita || 'Media'}
            onChange={(e) => setTaskForm({ ...taskForm, priorita: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          type Pratica
        </label>
        <input
          type="text"
          value={task.type_pratica || ''}
          onChange={(e) => setTaskForm({ ...taskForm, type_pratica: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          placeholder="es. TICA, GAUDÌ, RID"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={isNew ? () => { setTaskForm({}); setShowAddForm(false); } : cancelTaskEdit}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={isNew ? addTask : saveTaskEdit}
          disabled={!task.name && !task.title}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
            (!task.name && !task.title)
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
        >
          <Save className="h-4 w-4" />
          {isNew ? 'Aggiungi' : 'Salva'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {tasks.length === 0 && !showAddForm && (
        <p className="text-center py-4 text-gray-500 dark:text-gray-400">
          Nessuna attività definita
        </p>
      )}

      {tasks.map((task, index) => (
        <div key={task.id || index}>
          {editingTask === index ? (
            renderTaskForm(taskForm)
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-medium text-gray-800 dark:text-gray-100">
                      {task.name || task.title}
                    </h5>
                    {task.priorita && (
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                        getPriorityColor(task.priorita)
                      )}>
                        {React.createElement(getPriorityIcon(task.priorita), { className: 'h-3 w-3' })}
                        {task.priorita}
                      </span>
                    )}
                  </div>

                  {task.descrizione && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {task.descrizione}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {task.ente_responsabile && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {task.ente_responsabile}
                      </span>
                    )}
                    {task.responsabile && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.responsabile}
                      </span>
                    )}
                    {task.durata_giorni && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.durata_giorni} giorni
                      </span>
                    )}
                    {task.type_pratica && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {task.type_pratica}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => startEditingTask(index)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddForm ? (
        renderTaskForm(taskForm, true)
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Aggiungi Attività</span>
        </button>
      )}
    </div>
  );
};

export default TaskEditor;