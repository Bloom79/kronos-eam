import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, ChevronUp, ChevronDown,
  GripVertical, Clock, AlertCircle, FileText, Building2,
  Layers, Sparkles, Info, Calendar, Zap, Package
} from 'lucide-react';
import EnhancedTaskEditor from './EnhancedTaskEditor';
import DocumentTemplateUpload from '../documents/DocumentTemplateUpload';
import PhaseTemplates from './PhaseTemplates';
import clsx from 'clsx';

interface Task {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  assignee?: string;
  duration_days?: number;
  priority?: string;
  responsible_entity?: string;
  practice_type?: string;
  documenti_richiesti?: string[];
  documents_to_generate?: string[];
  checkpoints?: string[];
  condizioni?: any;
  portal_url?: string;
  required_credentials?: string;
  regulatory_deadline?: string;
  cost_amount?: number;
  requires_human_auth?: boolean;
  requires_physical_signature?: boolean;
  requires_site_inspection?: boolean;
}

interface Stage {
  id?: string;
  name: string;
  order: number;
  duration_days?: number;
  tasks: Task[];
  entity_responsible?: string;
  document_templates?: any[];
  description?: string;
  type?: string;
  icon?: string;
  color?: string;
}

interface StageBuilderProps {
  stages: Stage[];
  onChange: (stages: Stage[]) => void;
}

const StageBuilder: React.FC<StageBuilderProps> = ({ stages, onChange }) => {
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [stageForm, setStageForm] = useState<Partial<Stage>>({});
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set([0]));
  const [activeTab, setActiveTab] = useState<{ [key: number]: 'tasks' | 'documents' }>({});
  const [showPhaseTemplates, setShowPhaseTemplates] = useState(false);

  const entities = ['DSO', 'Terna', 'GSE', 'Dogane', 'Comune', 'Regione', 'Soprintendenza'];

  const phaseTypeColors: { [key: string]: string } = {
    DESIGN: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    AUTHORIZATION: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    CONNECTION: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    INSTALLATION: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    TESTING: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    REGISTRATION: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    INCENTIVE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    FISCAL: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  };

  const phaseHeaderColors: { [key: string]: string } = {
    DESIGN: 'bg-blue-50 dark:bg-blue-900/10',
    AUTHORIZATION: 'bg-purple-50 dark:bg-purple-900/10',
    CONNECTION: 'bg-green-50 dark:bg-green-900/10',
    INSTALLATION: 'bg-orange-50 dark:bg-orange-900/10',
    TESTING: 'bg-teal-50 dark:bg-teal-900/10',
    REGISTRATION: 'bg-indigo-50 dark:bg-indigo-900/10',
    INCENTIVE: 'bg-yellow-50 dark:bg-yellow-900/10',
    FISCAL: 'bg-red-50 dark:bg-red-900/10'
  };

  const addStage = () => {
    setShowPhaseTemplates(true);
  };

  const handlePhaseTemplateSelect = (template: any) => {
    const newStage: Stage = {
      id: template.id,
      name: template.name,
      order: stages.length + 1,
      duration_days: template.duration_days,
      entity_responsible: template.entity_responsible,
      description: template.description,
      type: template.type,
      icon: template.icon,
      color: template.color,
      tasks: template.tasks.map((task: any, index: number) => ({
        ...task,
        id: `task-${Date.now()}-${index}`,
        name: task.name,
        practice_type: task.practice_type,
        assignee: task.assignee,
        responsible_entity: task.responsible_entity,
        duration_days: task.duration_days,
        priority: task.priority,
        documenti_richiesti: task.required_documents || [],
        documents_to_generate: task.documents_to_generate || [],
        checkpoints: task.checklist_items || []
      })),
      document_templates: template.document_templates || []
    };
    onChange([...stages, newStage]);
    setExpandedStages(new Set([...expandedStages, stages.length]));
  };

  const addManualStage = () => {
    const newStage: Stage = {
      name: `Fase ${stages.length + 1}`,
      order: stages.length + 1,
      duration_days: 30,
      tasks: []
    };
    onChange([...stages, newStage]);
    setExpandedStages(new Set([...expandedStages, stages.length]));
  };

  const updateStage = (index: number, updates: Partial<Stage>) => {
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], ...updates };
    onChange(updatedStages);
  };

  const deleteStage = (index: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questa fase e tutte le sue attività?')) {
      const updatedStages = stages.filter((_, i) => i !== index);
      // Update order for remaining stages
      updatedStages.forEach((stage, i) => {
        stage.order = i + 1;
      });
      onChange(updatedStages);
    }
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedStages = [...stages];
    const [movedStage] = updatedStages.splice(index, 1);
    updatedStages.splice(newIndex, 0, movedStage);

    // Update ordine
    updatedStages.forEach((stage, i) => {
      stage.order = i + 1;
    });

    onChange(updatedStages);
  };

  const startEditingStage = (index: number) => {
    setEditingStage(index);
    setStageForm({
      name: stages[index].name,
      duration_days: stages[index].duration_days,
      entity_responsible: stages[index].entity_responsible,
      document_templates: stages[index].document_templates
    });
  };

  const saveStageEdit = () => {
    if (editingStage !== null && stageForm.name) {
      updateStage(editingStage, stageForm);
      setEditingStage(null);
      setStageForm({});
    }
  };

  const cancelStageEdit = () => {
    setEditingStage(null);
    setStageForm({});
  };

  const toggleStageExpansion = (index: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStages(newExpanded);
  };

  const updateStageTasks = (stageIndex: number, tasks: Task[]) => {
    updateStage(stageIndex, { tasks });
  };

  const handleTemplateUploaded = (stageIndex: number, template: any) => {
    const stage = stages[stageIndex];
    const currentTemplates = stage.document_templates || [];
    updateStage(stageIndex, { 
      document_templates: [...currentTemplates, template]
    });
  };

  const removeTemplate = (stageIndex: number, templateIndex: number) => {
    const stage = stages[stageIndex];
    const updatedTemplates = [...(stage.document_templates || [])];
    updatedTemplates.splice(templateIndex, 1);
    updateStage(stageIndex, { document_templates: updatedTemplates });
  };

  return (
    <div className="space-y-4">
      {stages.length === 0 && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nessuna fase definita. Aggiungi una fase per iniziare.
          </p>
        </div>
      )}

      {stages.map((stage, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          {/* Stage Header */}
          <div className={clsx(
            'p-4 transition-colors',
            stage.type && phaseHeaderColors[stage.type] 
              ? phaseHeaderColors[stage.type]
              : 'bg-gray-50 dark:bg-gray-700/50'
          )}>
            {editingStage === index ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={stageForm.name || ''}
                    onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                    placeholder="name fase"
                    autoFocus
                  />
                  <input
                    type="number"
                    value={stageForm.duration_days || ''}
                    onChange={(e) => setStageForm({ ...stageForm, duration_days: Number(e.target.value) })}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Giorni"
                    min="1"
                  />
                  <select
                    value={stageForm.entity_responsible || ''}
                    onChange={(e) => setStageForm({ ...stageForm, entity_responsible: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Ente Responsabile</option>
                    {entities.map(entity => (
                      <option key={entity} value={entity}>{entity}</option>
                    ))}
                  </select>
                  <button
                    onClick={saveStageEdit}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={cancelStageEdit}
                    className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-move"
                    title="Trascina per riordinare"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {/* Phase number badge */}
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {stage.order}
                    </span>
                  </div>
                  
                  {/* Phase type indicator */}
                  {stage.type && (
                    <div className={clsx(
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      phaseTypeColors[stage.type] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    )}>
                      {stage.type}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {stage.name}
                      </h4>
                      {stage.id && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          ID: {stage.id}
                        </span>
                      )}
                    </div>
                    
                    {stage.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {stage.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {stage.duration_days && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {stage.duration_days} giorni
                        </span>
                      )}
                      {stage.entity_responsible && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Building2 className="h-3 w-3" />
                          {stage.entity_responsible}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Layers className="h-3 w-3" />
                        {stage.tasks.length} attività
                      </span>
                      {stage.document_templates && stage.document_templates.length > 0 && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FileText className="h-3 w-3" />
                          {stage.document_templates.length} template
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1 gap-0.5 mr-1">
                    <button
                      type="button"
                      onClick={() => moveStage(index, 'up')}
                      disabled={index === 0}
                      className={clsx(
                        'p-1 rounded transition-all',
                        index === 0
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-sm'
                      )}
                      title="Sposta fase su"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <div className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    <button
                      type="button"
                      onClick={() => moveStage(index, 'down')}
                      disabled={index === stages.length - 1}
                      className={clsx(
                        'p-1 rounded transition-all',
                        index === stages.length - 1
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-sm'
                      )}
                      title="Sposta fase giù"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditingStage(index)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStage(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStageExpansion(index)}
                    className={clsx(
                      "p-1.5 rounded-lg transition-all border",
                      expandedStages.has(index)
                        ? "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    title={expandedStages.has(index) ? "Comprimi fase" : "Espandi fase"}
                  >
                    {expandedStages.has(index) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stage Content */}
          {expandedStages.has(index) && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveTab({ ...activeTab, [index]: 'tasks' })}
                  className={clsx(
                    'px-6 py-3 text-sm font-medium transition-colors',
                    (!activeTab[index] || activeTab[index] === 'tasks')
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  )}
                >
                  Attività ({stage.tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab({ ...activeTab, [index]: 'documents' })}
                  className={clsx(
                    'px-6 py-3 text-sm font-medium transition-colors',
                    activeTab[index] === 'documents'
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  )}
                >
                  Template Documenti ({stage.document_templates?.length || 0})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {(!activeTab[index] || activeTab[index] === 'tasks') ? (
                  <EnhancedTaskEditor
                    tasks={stage.tasks}
                    onChange={(tasks) => updateStageTasks(index, tasks)}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Document Templates List */}
                    {stage.document_templates && stage.document_templates.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Template Caricati
                        </h5>
                        {stage.document_templates.map((template, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                  {template.template_name || template.name}
                                </p>
                                {template.template_category && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Categoria: {template.template_category}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTemplate(index, idx)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Document Template Upload */}
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Carica Template Documenti per {stage.name}
                      </h5>
                      <DocumentTemplateUpload
                        category={stage.entity_responsible || 'Generale'}
                        phaseName={stage.name}
                        onTemplateUploaded={(template) => handleTemplateUploaded(index, template)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Phase Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={addStage}
          className="flex-1 p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Usa Template Fase</span>
        </button>
        <button
          type="button"
          onClick={addManualStage}
          className="flex-1 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Crea Fase Manuale</span>
        </button>
      </div>

      {/* Phase Templates Modal */}
      {showPhaseTemplates && (
        <PhaseTemplates
          onSelectTemplate={handlePhaseTemplateSelect}
          onClose={() => setShowPhaseTemplates(false)}
          currentPhases={stages.map(s => s.id).filter(Boolean) as string[]}
        />
      )}
    </div>
  );
};

export default StageBuilder;