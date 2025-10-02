import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, FileText, Users,
  Clock, Building2, AlertTriangle, CheckCircle,
  Globe, Key, Euro, Calendar, AlertCircle, Upload
} from 'lucide-react';
import clsx from 'clsx';
import DocumentTemplateUpload from '../documents/DocumentTemplateUpload';

interface EnhancedTask {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  assignee?: string;
  duration_days?: number;
  priority?: string;
  responsible_entity?: string;
  practice_type?: string;
  required_documents?: string[];
  documents_to_generate?: string[];
  checkpoints?: string[];
  conditions?: any;
  // Bureaucratic process fields
  portal_url?: string;
  portal_login_url?: string;
  required_credentials?: string;
  regulatory_deadline?: string;
  deadline_type?: string;
  deadline_consequences?: string;
  cost_amount?: number;
  cost_description?: string;
  payment_method?: string;
  external_protocol_number?: string;
  submission_method?: string;
  official_form_fields?: Record<string, any>;
  requires_human_auth?: boolean;
  requires_physical_signature?: boolean;
  requires_site_inspection?: boolean;
  human_checkpoint_notes?: string;
}

interface EnhancedTaskEditorProps {
  tasks: EnhancedTask[];
  onChange: (tasks: EnhancedTask[]) => void;
}

const EnhancedTaskEditor: React.FC<EnhancedTaskEditorProps> = ({ tasks, onChange }) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<EnhancedTask>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'basic' | 'portal' | 'documents' | 'deadlines' | 'checkpoints'>('basic');

  const entities = ['DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendency'];
  const priorities = ['High', 'Medium', 'Low'];
  const credentials = ['SPID', 'CIE', 'CNS', 'Digital Certificate', 'SPID/CIE', 'SPID + MFA', 'Email Registration'];
  const submissionMethods = ['Online Portal', 'PEC', 'System-to-System', 'EDI', 'Portal or PEC'];

  const addTask = () => {
    if (taskForm.name || taskForm.title) {
      const newTask: EnhancedTask = {
        ...taskForm,
        id: `task-${Date.now()}`,
        priority: taskForm.priority || 'Medium',
        duration_days: taskForm.duration_days || 7
      };
      onChange([...tasks, newTask]);
      setTaskForm({});
      setShowAddForm(false);
    }
  };

  const updateTask = (index: number, updates: Partial<EnhancedTask>) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], ...updates };
    onChange(updatedTasks);
  };

  const deleteTask = (index: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onChange(tasks.filter((_, i) => i !== index));
    }
  };

  const toggleTaskExpansion = (index: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTasks(newExpanded);
  };

  const startEditingTask = (index: number) => {
    setEditingTask(index);
    setTaskForm({ ...tasks[index] });
    setExpandedTasks(new Set([index]));
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
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const renderTaskForm = (task: Partial<EnhancedTask>, isNew: boolean = false) => (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-600 pb-2">
        {(['basic', 'portal', 'documents', 'deadlines', 'checkpoints'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            )}
          >
            {tab === 'basic' && 'Base'}
            {tab === 'portal' && 'Portale'}
            {tab === 'documents' && 'Documenti'}
            {tab === 'deadlines' && 'Scadenze'}
            {tab === 'checkpoints' && 'Controlli'}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Attività
              </label>
              <input
                type="text"
                value={task.name || task.title || ''}
                onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Es. Richiesta Connessione DSO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo Pratica
              </label>
              <input
                type="text"
                value={task.practice_type || ''}
                onChange={(e) => setTaskForm({ ...taskForm, practice_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Es. TICA, RID, Denuncia Officina"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrizione
              </label>
              <textarea
                value={task.description || ''}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Descrizione dettagliata dell'attività..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsabile
              </label>
              <input
                type="text"
                value={task.assignee || ''}
                onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Es. Asset Manager, Progettista"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ente Responsabile
              </label>
              <select
                value={task.responsible_entity || ''}
                onChange={(e) => setTaskForm({ ...taskForm, responsible_entity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Seleziona...</option>
                {entities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durata (giorni)
              </label>
              <input
                type="number"
                value={task.duration_days || ''}
                onChange={(e) => setTaskForm({ ...taskForm, duration_days: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priorità
              </label>
              <select
                value={task.priority || 'Medium'}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'portal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Portale
                </label>
                <input
                  type="url"
                  value={task.portal_url || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, portal_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="https://www.e-distribuzione.it/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Login
                </label>
                <input
                  type="url"
                  value={task.portal_login_url || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, portal_login_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="https://areaclienti.e-distribuzione.it/login"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credenziali Richieste
                </label>
                <select
                  value={task.required_credentials || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, required_credentials: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Seleziona...</option>
                  {credentials.map(cred => (
                    <option key={cred} value={cred}>{cred}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metodo Invio
                </label>
                <select
                  value={task.submission_method || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, submission_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Seleziona...</option>
                  {submissionMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documenti Richiesti
              </label>
              <textarea
                value={(task.required_documents || []).join('\n')}
                onChange={(e) => setTaskForm({ 
                  ...taskForm, 
                  required_documents: e.target.value.split('\n').filter(d => d.trim()) 
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Un documento per riga..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documenti da Generare
              </label>
              <textarea
                value={(task.documents_to_generate || []).join('\n')}
                onChange={(e) => setTaskForm({ 
                  ...taskForm, 
                  documents_to_generate: e.target.value.split('\n').filter(d => d.trim()) 
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Un documento per riga..."
              />
            </div>

            {/* Document Template Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Documenti
              </label>
              <DocumentTemplateUpload 
                taskId={task.id ? parseInt(task.id.replace('task-', '')) : undefined}
                category="Autorizzativo"
              />
            </div>
          </div>
        )}

        {activeTab === 'deadlines' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scadenza Normativa
                </label>
                <input
                  type="text"
                  value={task.regulatory_deadline || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, regulatory_deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Es. 30 giorni lavorativi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo Scadenza
                </label>
                <select
                  value={task.deadline_type || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Seleziona...</option>
                  <option value="peremptory">Perentorio</option>
                  <option value="ordinatory">Ordinatorio</option>
                  <option value="suspensive">Sospensivo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conseguenze Mancato Rispetto
                </label>
                <textarea
                  value={task.deadline_consequences || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline_consequences: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Es. Decadenza automatica del preventivo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo (€)
                </label>
                <input
                  type="number"
                  value={task.cost_amount || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, cost_amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metodo Pagamento
                </label>
                <input
                  type="text"
                  value={task.payment_method || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Es. Bonifico bancario, F24"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkpoints' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.requires_human_auth || false}
                  onChange={(e) => setTaskForm({ ...taskForm, requires_human_auth: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Richiede Auth Umano
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.requires_physical_signature || false}
                  onChange={(e) => setTaskForm({ ...taskForm, requires_physical_signature: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Richiede Firma Fisica
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.requires_site_inspection || false}
                  onChange={(e) => setTaskForm({ ...taskForm, requires_site_inspection: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Richiede Sopralluogo
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note Checkpoint Umano
              </label>
              <textarea
                value={task.human_checkpoint_notes || ''}
                onChange={(e) => setTaskForm({ ...taskForm, human_checkpoint_notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Es. MFA richiede telefono personale, Presenza obbligatoria responsabile impianto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Checkpoints
              </label>
              <textarea
                value={(task.checkpoints || []).join('\n')}
                onChange={(e) => setTaskForm({ 
                  ...taskForm, 
                  checkpoints: e.target.value.split('\n').filter(c => c.trim()) 
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Un checkpoint per riga..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={isNew ? () => { setTaskForm({}); setShowAddForm(false); } : cancelTaskEdit}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={isNew ? addTask : saveTaskEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isNew ? 'Aggiungi' : 'Salva'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Task List */}
      {tasks.map((task, index) => {
        const isEditing = editingTask === index;
        const isExpanded = expandedTasks.has(index) || isEditing;
        const taskName = task.name || task.title || 'Attività senza nome';

        return (
          <div
            key={task.id || index}
            className={clsx(
              'border rounded-lg transition-all',
              isEditing 
                ? 'border-blue-500 dark:border-blue-400 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
            )}
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => !isEditing && toggleTaskExpansion(index)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                    {taskName}
                  </h4>
                  {task.practice_type && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {task.practice_type}
                    </span>
                  )}
                  {task.priority && (
                    <span className={clsx('text-xs px-2 py-1 rounded', getPriorityColor(task.priority))}>
                      {task.priority}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {task.assignee && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {task.assignee}
                    </span>
                  )}
                  {task.duration_days && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {task.duration_days}g
                    </span>
                  )}
                  {task.responsible_entity && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {task.responsible_entity}
                    </span>
                  )}
                  {task.portal_url && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Portale
                    </span>
                  )}
                  {task.cost_amount && (
                    <span className="flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      €{task.cost_amount}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTask(index);
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(index);
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isExpanded && !isEditing && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {task.description && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 dark:text-gray-400">{task.description}</p>
                    </div>
                  )}
                  
                  {task.required_documents && task.required_documents.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Documenti Richiesti:
                      </h5>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {task.required_documents.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.documents_to_generate && task.documents_to_generate.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Documenti da Generare:
                      </h5>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                        {task.documents_to_generate.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.regulatory_deadline && (
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300">Scadenza:</h5>
                      <p className="text-gray-600 dark:text-gray-400">{task.regulatory_deadline}</p>
                      {task.deadline_consequences && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          ⚠️ {task.deadline_consequences}
                        </p>
                      )}
                    </div>
                  )}

                  {(task.requires_human_auth || task.requires_physical_signature || task.requires_site_inspection) && (
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300">Checkpoint Umani:</h5>
                      <div className="mt-1 space-y-1">
                        {task.requires_human_auth && (
                          <p className="text-gray-600 dark:text-gray-400">🔐 Autenticazione umana richiesta</p>
                        )}
                        {task.requires_physical_signature && (
                          <p className="text-gray-600 dark:text-gray-400">✍️ Firma fisica richiesta</p>
                        )}
                        {task.requires_site_inspection && (
                          <p className="text-gray-600 dark:text-gray-400">🔍 Sopralluogo richiesto</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="border-t border-gray-100 dark:border-gray-700">
                {renderTaskForm(taskForm, false)}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Task Button/Form */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => {
            setShowAddForm(true);
            setTaskForm({});
          }}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Aggiungi Attività</span>
        </button>
      )}

      {showAddForm && renderTaskForm(taskForm, true)}
    </div>
  );
};

export default EnhancedTaskEditor;