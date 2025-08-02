import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, FileText, Building2, User, Zap, Info, Settings, Copy, FileSignature } from 'lucide-react';
import { WorkflowTemplate } from '../../types';
import { plantsService } from '../../services/api';
import type { Plant } from '../../services/api';
import { getplantPotenzaKw, normalizeTemplateId } from '../../utils';
import WorkflowTemplateGallery from './WorkflowTemplateGallery';
import PhaseTemplateSelector from './PhaseTemplateSelector';
import DocumentTemplateSelector from './DocumentTemplateSelector';
import clsx from 'clsx';

interface WorkflowWizardProps {
  plantId?: number;
  onComplete: (workflowData: any) => void;
  onCancel: () => void;
}

const WorkflowWizard: React.FC<WorkflowWizardProps> = ({ plantId, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [workflowData, setWorkflowData] = useState({
    name: '',
    descrizione: '',
    responsabile: '',
    dataScadenza: '',
    plantId: plantId || 0,
    plantpower: 0,
    typePlant: '',
    hasHeritageConstraints: false,
    useSimplifiedProcess: false,
    taskAssignments: {} as Record<string, string>,
    taskDueDates: {} as Record<string, string>,
    documentsUploaded: {} as Record<string, boolean>,
    entiCoinvolti: [] as string[],
    notes: '',
    // Default settings for bulk assignment
    defaultAssignee: '',
    defaultDueDateOffset: 30, // days from workflow start
    useDefaultSettings: false,
    // Workflow type selection
    workflowType: 'REGISTRAZIONE_STANDARD' as string,
    usePhaseTemplates: false,
    phaseTemplates: {} as Record<string, number>,
    // User role tracking
    createdByRole: 'administrator' as string
  });

  const steps = [
    { title: 'Seleziona plant', icon: Building2 },
    { title: 'Seleziona Template', icon: FileText },
    { title: 'Configura Workflow', icon: Building2 },
    { title: 'Assegna Task', icon: User },
    { title: 'Documenti Template', icon: FileSignature },
    { title: 'Revisione e Conferma', icon: Check }
  ];

  // Load plants on mount
  useEffect(() => {
    if (!plantId) {
      loadPlants();
    } else {
      loadPlantDetails(plantId);
    }
  }, [plantId]);

  const loadPlants = async () => {
    try {
      const response = await plantsService.getPlants();
      setPlants(response.items);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const loadPlantDetails = async (id: number) => {
    try {
      const plant = await plantsService.getPlant(id);
      setSelectedPlant(plant);
      setWorkflowData(prev => ({
        ...prev,
        plantId: id,
        plantpower: getplantPotenzaKw(plant),
        tipoPlant: plant.type || ''
      }));
    } catch (error) {
      console.error('Error loading plant details:', error);
    }
  };

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    
    // Determine entities based on template and plant characteristics
    const entiCoinvolti = [...(template.enti_richiesti || [])];
    
    // Add conditional entities
    if (workflowData.plantpower > 20 && !entiCoinvolti.includes('Customs')) {
      entiCoinvolti.push('Customs');
    }
    if (workflowData.hasHeritageConstraints && !entiCoinvolti.includes('Superintendency')) {
      entiCoinvolti.push('Superintendency');
    }
    
    setWorkflowData({
      ...workflowData,
      name: `${template.name} - ${selectedPlant?.name || ''}`,
      descrizione: template.descrizione,
      entiCoinvolti,
      // Set some sensible defaults
      defaultAssignee: workflowData.responsabile || 'Mario Rossi',
      defaultDueDateOffset: 30
    });
  };

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    const potenzaKw = getplantPotenzaKw(plant);
    setWorkflowData(prev => ({
      ...prev,
      plantId: plant.id,
      plantpower: potenzaKw,
      typePlant: plant.type || '',
      useSimplifiedProcess: plant.type === 'Photovoltaic' && potenzaKw <= 50
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Auto-apply defaults when entering task assignment step
      if (nextStep === 2 && (workflowData.defaultAssignee || workflowData.defaultDueDateOffset > 0)) {
        // Small delay to ensure the step transition is complete
        setTimeout(() => {
          applyDefaultSettings();
        }, 100);
      }
    } else {
      // Complete workflow creation
      if (workflowData.usePhaseTemplates) {
        // Use phase-based composition
        onComplete({
          use_phase_templates: true,
          phase_templates: workflowData.phaseTemplates,
          plant_id: workflowData.plantId,
          name: workflowData.name,
          descrizione: workflowData.descrizione,
          potenza_plant: workflowData.plantpower,
          type_plant: workflowData.typePlant,
          responsabile: workflowData.responsabile,
          data_scadenza: workflowData.dataScadenza,
          task_assignments: workflowData.taskAssignments,
          task_due_dates: workflowData.taskDueDates,
          enti_coinvolti: workflowData.entiCoinvolti,
          created_by_role: workflowData.createdByRole
        });
      } else {
        // Use single template
        const filteredTasks = getFilteredTasks();
        onComplete({
          template_id: normalizeTemplateId(selectedTemplate?.id),
          plant_id: workflowData.plantId,
          name: workflowData.name,
          descrizione: workflowData.descrizione,
          potenza_plant: workflowData.plantpower,
          type_plant: workflowData.typePlant,
          responsabile: workflowData.responsabile,
          data_scadenza: workflowData.dataScadenza,
          task_assignments: workflowData.taskAssignments,
          task_due_dates: workflowData.taskDueDates,
          enti_coinvolti: workflowData.entiCoinvolti,
          created_by_role: workflowData.createdByRole
        });
      }
    }
  };

  // Filter tasks based on conditions
  const getFilteredTasks = () => {
    if (!selectedTemplate || !selectedTemplate.tasks) return [];
    
    return selectedTemplate.tasks.filter(task => {
      // Filter out Dogane tasks if power <= 20kW
      if (task.ente_responsabile === 'Customs' && workflowData.plantpower <= 20) {
        return false;
      }
      // Filter out Soprintendenza tasks if no heritage constraints
      if (task.ente_responsabile === 'Superintendency' && !workflowData.hasHeritageConstraints) {
        return false;
      }
      return true;
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Apply default settings to all tasks
  const applyDefaultSettings = () => {
    if (!workflowData.defaultAssignee && workflowData.defaultDueDateOffset === 0) {
      return;
    }

    const filteredTasks = getFilteredTasks();
    const newTaskAssignments = { ...workflowData.taskAssignments };
    const newTaskDueDates = { ...workflowData.taskDueDates };

    // Calculate base date for due dates (start from today)
    const baseDate = new Date();
    
    filteredTasks.forEach((task, index) => {
      const taskKey = task.id || `task-${index}`;
      
      // Apply default assignee if specified and task doesn't have one
      if (workflowData.defaultAssignee && !newTaskAssignments[taskKey]) {
        newTaskAssignments[taskKey] = workflowData.defaultAssignee;
      }
      
      // Apply default due date if specified and task doesn't have one
      if (workflowData.defaultDueDateOffset > 0 && !newTaskDueDates[taskKey]) {
        const dueDate = new Date(baseDate);
        dueDate.setDate(dueDate.getDate() + workflowData.defaultDueDateOffset);
        newTaskDueDates[taskKey] = dueDate.toISOString().split('T')[0];
      }
    });

    setWorkflowData(prev => ({
      ...prev,
      taskAssignments: newTaskAssignments,
      taskDueDates: newTaskDueDates
    }));
  };

  // Apply defaults to all tasks (overwrites existing)
  const applyDefaultsToAll = () => {
    if (!workflowData.defaultAssignee && workflowData.defaultDueDateOffset === 0) {
      return;
    }

    const filteredTasks = getFilteredTasks();
    const newTaskAssignments: Record<string, string> = {};
    const newTaskDueDates: Record<string, string> = {};

    // Calculate base date for due dates (start from today)
    const baseDate = new Date();
    
    filteredTasks.forEach((task, index) => {
      const taskKey = task.id || `task-${index}`;
      
      // Apply default assignee to all tasks
      if (workflowData.defaultAssignee) {
        newTaskAssignments[taskKey] = workflowData.defaultAssignee;
      }
      
      // Apply default due date to all tasks
      if (workflowData.defaultDueDateOffset > 0) {
        const dueDate = new Date(baseDate);
        dueDate.setDate(dueDate.getDate() + workflowData.defaultDueDateOffset);
        newTaskDueDates[taskKey] = dueDate.toISOString().split('T')[0];
      }
    });

    setWorkflowData(prev => ({
      ...prev,
      taskAssignments: { ...prev.taskAssignments, ...newTaskAssignments },
      taskDueDates: { ...prev.taskDueDates, ...newTaskDueDates }
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Select Plant
        return selectedPlant !== null || plantId !== undefined;
      case 1: // Select Template
        return workflowData.usePhaseTemplates ? 
          Object.keys(workflowData.phaseTemplates).length > 0 : 
          selectedTemplate !== null;
      case 2: // Configure Workflow
        return workflowData.name && workflowData.responsabile && workflowData.dataScadenza;
      case 3: // Assign Tasks
        if (workflowData.usePhaseTemplates) {
          // For phase templates, task assignment is skipped
          return true;
        }
        const filteredTasks = getFilteredTasks();
        return filteredTasks.every((task, index) => {
          const taskKey = task.id || `task-${index}`;
          return workflowData.taskAssignments[taskKey] && workflowData.taskDueDates[taskKey];
        });
      case 4: // Document Templates
        return true; // Optional step
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Select Plant
        if (plantId) {
          return (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                plant selezionato per il workflow
              </p>
              {selectedPlant && (
                <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    {selectedPlant.name}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Tipo: {selectedPlant.type}</p>
                    <p>Potenza: {getplantPotenzaKw(selectedPlant)} kW</p>
                    <p>Località: {selectedPlant.municipality}, {selectedPlant.province}</p>
                  </div>
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seleziona l'plant per cui vuoi creare il workflow
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => handlePlantSelect(plant)}
                  className={clsx(
                    'border-2 rounded-lg p-4 cursor-pointer transition-all',
                    selectedPlant?.id === plant.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                        {plant.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {plant.type} • {getplantPotenzaKw(plant)} kW
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {plant.municipality}, {plant.province}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getplantPotenzaKw(plant)} kW
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 1: // Select Template
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {workflowData.usePhaseTemplates 
                  ? `Seleziona i template per ogni fase del workflow per ${selectedPlant?.name}`
                  : `Seleziona il template più adatto per ${selectedPlant?.name}`}
              </p>
              {workflowData.plantpower > 0 && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-gray-500">Potenza plant: {workflowData.plantpower} kW</span>
                  {workflowData.useSimplifiedProcess && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                      Iter semplificato disponibile
                    </span>
                  )}
                </div>
              )}
            </div>
            {workflowData.usePhaseTemplates ? (
              <PhaseTemplateSelector
                onPhaseTemplatesSelect={(templates) => {
                  setWorkflowData({ ...workflowData, phaseTemplates: templates });
                }}
                plantId={workflowData.plantId}
                plantpower={workflowData.plantpower}
                selectedPhaseTemplates={workflowData.phaseTemplates}
              />
            ) : (
              <WorkflowTemplateGallery
                onTemplateSelect={handleTemplateSelect}
                plantId={workflowData.plantId}
                plantpower={workflowData.plantpower}
                selectedTemplate={selectedTemplate}
              />
            )}
          </div>
        );

      case 2: // Configure Workflow
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                name Workflow
              </label>
              <input
                type="text"
                value={workflowData.name}
                onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsabile Principale
              </label>
              <select
                value={workflowData.responsabile}
                onChange={(e) => setWorkflowData({ ...workflowData, responsabile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Seleziona responsabile</option>
                <option value="Mario Rossi">Mario Rossi - Asset Manager</option>
                <option value="Laura Neri">Laura Neri - Tecnico</option>
                <option value="Giuseppe Verdi">Giuseppe Verdi - Fiscalista</option>
                <option value="Anna Bianchi">Anna Bianchi - Legale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ruolo Creatore Workflow
              </label>
              <select
                value={workflowData.createdByRole}
                onChange={(e) => setWorkflowData({ ...workflowData, createdByRole: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="installer">Installatore Impianto</option>
                <option value="administrator">Amministratore Impianto</option>
                <option value="owner">Proprietario Impianto</option>
                <option value="technician">Tecnico</option>
                <option value="consultant">Consulente</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Indica chi sta creando questo workflow per tracciare il punto di origine
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Scadenza Workflow
              </label>
              <input
                type="date"
                value={workflowData.dataScadenza}
                onChange={(e) => setWorkflowData({ ...workflowData, dataScadenza: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Conditional Settings */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-4">
                Opzioni Specifiche plant
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={workflowData.hasHeritageConstraints}
                    onChange={(e) => setWorkflowData({ ...workflowData, hasHeritageConstraints: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    L'area è soggetta a vincoli paesaggistici o storico-artistici
                  </span>
                </label>
                
                {workflowData.hasHeritageConstraints && (
                  <div className="ml-7 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-800 dark:text-yellow-200">
                    <Info className="inline h-4 w-4 mr-1" />
                    Sarà richiesto il parere della Soprintendenza
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note Aggiuntive
              </label>
              <textarea
                value={workflowData.notes}
                onChange={(e) => setWorkflowData({ ...workflowData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Inserisci eventuali note o requisiti specifici..."
              />
            </div>
          </div>
        );

      case 3: // Assign Tasks
        if (workflowData.usePhaseTemplates) {
          // For phase templates, skip task assignment
          return (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Assegnazione Task Automatica
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      I task saranno creati automaticamente dalle fasi selezionate.
                      Potrai assegnare responsabili e scadenze dopo la creazione del workflow.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Procedi per completare la creazione del workflow composto
                </p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Assegna i responsabili e le scadenze per ogni task del workflow
            </p>

            {/* Default Settings Panel */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Impostazioni Predefinite
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Responsabile Predefinito
                  </label>
                  <select
                    value={workflowData.defaultAssignee}
                    onChange={(e) => setWorkflowData({ ...workflowData, defaultAssignee: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-blue-900/50 dark:text-blue-100"
                  >
                    <option value="">Seleziona responsabile</option>
                    <option value="Mario Rossi">Mario Rossi - Asset Manager</option>
                    <option value="Laura Neri">Laura Neri - Tecnico</option>
                    <option value="Giuseppe Verdi">Giuseppe Verdi - Fiscalista</option>
                    <option value="Anna Bianchi">Anna Bianchi - Legale</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Scadenza Task (giorni da oggi)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={workflowData.defaultDueDateOffset}
                    onChange={(e) => setWorkflowData({ ...workflowData, defaultDueDateOffset: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-blue-900/50 dark:text-blue-100"
                    placeholder="30"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Giorni dalla data odierna
                  </p>
                </div>
                
                <div className="flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={applyDefaultSettings}
                      disabled={!workflowData.defaultAssignee && workflowData.defaultDueDateOffset === 0}
                      className={clsx(
                        'flex-1 px-3 py-1 text-xs rounded flex items-center justify-center gap-1',
                        workflowData.defaultAssignee || workflowData.defaultDueDateOffset > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                      title="Applica solo a task senza assegnazione"
                    >
                      <Copy className="h-3 w-3" />
                      Applica
                    </button>
                    <button
                      type="button"
                      onClick={applyDefaultsToAll}
                      disabled={!workflowData.defaultAssignee && workflowData.defaultDueDateOffset === 0}
                      className={clsx(
                        'flex-1 px-3 py-1 text-xs rounded flex items-center justify-center gap-1',
                        workflowData.defaultAssignee || workflowData.defaultDueDateOffset > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                      title="Applica a tutti i task (sovrascrive esistenti)"
                    >
                      <Settings className="h-3 w-3" />
                      Tutti
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Suggerimento:</strong> Imposta i valori predefiniti e usa "Applica" per assegnare solo ai task vuoti, 
                  oppure "Tutti" per sovrascrivere tutte le assegnazioni esistenti.
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {getFilteredTasks().length} task totali
                </div>
              </div>
            </div>
            
            {/* Entity Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                Enti Coinvolti nel Workflow
              </h4>
              <div className="flex flex-wrap gap-2">
                {workflowData.entiCoinvolti.map((ente) => (
                  <span
                    key={ente}
                    className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600"
                  >
                    {ente}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getFilteredTasks().map((task, index) => (
                <div key={task.id || `task-${index}`} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">{task.name}</h4>
                    <div className="flex gap-2">
                      {task.ente_responsabile && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {task.ente_responsabile}
                        </span>
                      )}
                      {task.suggested_assignee_role && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          Suggerito: {task.suggested_assignee_role}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.descrizione}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assegnato a
                      </label>
                      <select
                        value={workflowData.taskAssignments[task.id || `task-${index}`] || ''}
                        onChange={(e) => setWorkflowData({
                          ...workflowData,
                          taskAssignments: {
                            ...workflowData.taskAssignments,
                            [task.id || `task-${index}`]: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Seleziona</option>
                        <option value="Mario Rossi">Mario Rossi - Asset Manager</option>
                        <option value="Laura Neri">Laura Neri - Tecnico</option>
                        <option value="Giuseppe Verdi">Giuseppe Verdi - Fiscalista</option>
                        <option value="Anna Bianchi">Anna Bianchi - Legale</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Scadenza
                      </label>
                      <input
                        type="date"
                        value={workflowData.taskDueDates[task.id || `task-${index}`] || ''}
                        onChange={(e) => setWorkflowData({
                          ...workflowData,
                          taskDueDates: {
                            ...workflowData.taskDueDates,
                            [task.id || `task-${index}`]: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  {task.documentiRichiesti && task.documentiRichiesti.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Documenti richiesti:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                        {task.documentiRichiesti.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // Document Templates
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Seleziona i template di documento che vuoi generare automaticamente per questo workflow
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                I documenti possono essere generati in formato PDF o Word con i dati dell'plant e del workflow
              </p>
            </div>
            
            {selectedTemplate ? (
              <DocumentTemplateSelector
                templateId={normalizeTemplateId(selectedTemplate.id)}
                onDocumentGenerated={(documentId) => {
                  console.log('Document generated:', documentId);
                }}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileSignature className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Nessun template selezionato</p>
                <p className="text-sm mt-2">
                  I template di documento saranno disponibili dopo la selezione del workflow
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Generazione Documenti
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    I documenti selezionati saranno disponibili dopo la creazione del workflow.
                    Potrai generarli e scaricarli dalla pagina di dettaglio del workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Review and Confirm
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Workflow Pronto per l'Avvio
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Tutti i task sono stati configurati correttamente. Rivedi il riepilogo prima di confermare.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                  Riepilogo Workflow
                </h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">name:</dt>
                    <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {workflowData.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Template:</dt>
                    <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {workflowData.usePhaseTemplates 
                        ? 'Composizione per Fasi' 
                        : selectedTemplate?.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">plant:</dt>
                    <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {selectedPlant?.name} ({workflowData.plantpower} kW)
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Responsabile:</dt>
                    <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {workflowData.responsabile}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Scadenza:</dt>
                    <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {new Date(workflowData.dataScadenza).toLocaleDateString('it-IT')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Numero Task:</dt>
                    <dd className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {getFilteredTasks().length}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Entities Involved */}
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                  Enti Coinvolti
                </h4>
                <div className="flex flex-wrap gap-2">
                  {workflowData.entiCoinvolti.map((ente) => (
                    <span
                      key={ente}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {ente}
                    </span>
                  ))}
                </div>
              </div>

              {workflowData.notes && (
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Note</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {workflowData.notes}
                  </p>
                </div>
              )}

              {workflowData.usePhaseTemplates ? (
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Fasi Selezionate
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(workflowData.phaseTemplates).map(([phase, templateId]) => (
                      <div key={phase} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {phase.charAt(0) + phase.slice(1).toLowerCase()}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          Template ID: {templateId}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    I task saranno creati automaticamente dalle fasi selezionate
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Task Assegnati ({getFilteredTasks().length})
                  </h4>
                  <div className="space-y-2">
                    {getFilteredTasks().map((task, index) => (
                      <div key={task.id || `review-task-${index}`} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{task.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {workflowData.taskAssignments[task.id || `task-${index}`]}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(workflowData.taskDueDates[task.id || `task-${index}`]).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div className={clsx(
                  'flex items-center justify-center w-12 h-12 rounded-full',
                  index < currentStep
                    ? 'bg-blue-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}>
                  {index < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={clsx(
                    'w-full h-1 mx-2',
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  )} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <p className={clsx(
                'text-sm font-medium',
                index <= currentStep
                  ? 'text-gray-800 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 0 ? onCancel : handleBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          {currentStep === 0 ? 'Annulla' : 'Indietro'}
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className={clsx(
            'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
            isStepValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          )}
        >
          {currentStep === steps.length - 1 ? 'Avvia Workflow' : 'Avanti'}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default WorkflowWizard;