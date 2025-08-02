import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, ChevronUp, ChevronDown,
  GripVertical, Clock, AlertCircle
} from 'lucide-react';
import TaskEditor from './TaskEditor';
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

interface Stage {
  name: string;
  ordine: number;
  durata_giorni?: number;
  tasks: Task[];
}

interface StageBuilderProps {
  stages: Stage[];
  onChange: (stages: Stage[]) => void;
}

const StageBuilder: React.FC<StageBuilderProps> = ({ stages, onChange }) => {
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [stageForm, setStageForm] = useState<Partial<Stage>>({});
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set([0]));

  const addStage = () => {
    const newStage: Stage = {
      name: `Fase ${stages.length + 1}`,
      ordine: stages.length + 1,
      durata_giorni: 30,
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
      // Update ordine for remaining stages
      updatedStages.forEach((stage, i) => {
        stage.ordine = i + 1;
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
      stage.ordine = i + 1;
    });

    onChange(updatedStages);
  };

  const startEditingStage = (index: number) => {
    setEditingStage(index);
    setStageForm({
      name: stages[index].name,
      durata_giorni: stages[index].durata_giorni
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
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4">
            {editingStage === index ? (
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
                  value={stageForm.durata_giorni || ''}
                  onChange={(e) => setStageForm({ ...stageForm, durata_giorni: Number(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Giorni"
                  min="1"
                />
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
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      {stage.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>Ordine: {stage.ordine}</span>
                      {stage.durata_giorni && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {stage.durata_giorni} giorni
                        </span>
                      )}
                      <span>{stage.tasks.length} attività</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveStage(index, 'up')}
                    disabled={index === 0}
                    className={clsx(
                      'p-1.5 rounded-lg transition-colors',
                      index === 0
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    )}
                    title="Sposta su"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStage(index, 'down')}
                    disabled={index === stages.length - 1}
                    className={clsx(
                      'p-1.5 rounded-lg transition-colors',
                      index === stages.length - 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    )}
                    title="Sposta giù"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
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
                    className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {expandedStages.has(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stage Tasks */}
          {expandedStages.has(index) && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <TaskEditor
                tasks={stage.tasks}
                onChange={(tasks) => updateStageTasks(index, tasks)}
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addStage}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Aggiungi Fase</span>
      </button>
    </div>
  );
};

export default StageBuilder;