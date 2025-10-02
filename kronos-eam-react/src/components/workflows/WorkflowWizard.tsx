import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, FileText, Building2, 
  User, Zap, Info, Settings, Copy, FileSignature, 
  Calendar, AlertTriangle, Layers, Package, Eye
} from 'lucide-react';
import { Plant } from '../../types/plant-type';
import { Workflow, WorkflowTemplate, Task } from '../../types';
import { plantsService, workflowService } from '../../services/api';
import { getplantPotenzaKw, normalizeTemplateId } from '../../utils';
import { Plant as ApiPlant } from '../../services/api/plants.service';
import WorkflowTemplateGallery from './WorkflowTemplateGallery';
import clsx from 'clsx';
import { EntityEnum } from '../../types';

interface WorkflowWizardProps {
  plantId?: number;
  onComplete: (workflowData: any) => void;
  onCancel: () => void;
  preSelectedTemplate?: WorkflowTemplate;
}

interface PhasePreview {
  name: string;
  order: number;
  taskCount: number;
  duration: number;
  entities: string[];
}

const WorkflowWizard: React.FC<WorkflowWizardProps> = ({ 
  plantId, 
  onComplete, 
  onCancel,
  preSelectedTemplate 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(preSelectedTemplate || null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [phases, setPhases] = useState<PhasePreview[]>([]);
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    assignee: '',
    due_date: '',
    plantId: plantId || 0,
    plantpower: 0,
    typePlant: '',
    hasHeritageConstraints: false,
    involvedEntities: [] as string[],
    notes: '',
    createdByRole: 'administrator' as string
  });

  // Adjust steps based on whether we're in plant context or not
  const steps = plantId ? [
    { title: 'Seleziona Template', icon: FileText },
    { title: 'Rivedi Fasi e Attività', icon: Layers },
    { title: 'Configura Workflow', icon: Settings },
    { title: 'Conferma e Crea', icon: Check }
  ] : [
    { title: 'Seleziona Impianto', icon: Building2 },
    { title: 'Seleziona Template', icon: FileText },
    { title: 'Rivedi Fasi e Attività', icon: Layers },
    { title: 'Configura Workflow', icon: Settings },
    { title: 'Conferma e Crea', icon: Check }
  ];

  useEffect(() => {
    loadInitialData();
  }, [plantId]);

  useEffect(() => {
    if (preSelectedTemplate) {
      setCurrentStep(1); 
    }
  }, [preSelectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) {
      extractPhasesFromTemplate(selectedTemplate);
    }
  }, [selectedTemplate, templates]);

  const loadInitialData = async () => {
    try {
      // Load templates - use plant-specific endpoint if plantId is provided
      let templatesData;
      if (plantId) {
        templatesData = await workflowService.getApplicableTemplatesForPlant(plantId);
      } else {
        templatesData = await workflowService.getTemplates();
      }
      console.log('Loaded templates:', templatesData);
      console.log('First template stages:', templatesData[0]?.stages);
      setTemplates(templatesData as WorkflowTemplate[]);

      // If we have a plantId, load plant details
      if (plantId) {
        const apiPlant = await plantsService.getPlant(plantId);
        // Convert API plant to our Plant type
        const plant: Plant = {
          ...apiPlant,
          power: apiPlant.power,
          power_kw: apiPlant.power_kw,
          municipality: apiPlant.municipality,
          province: apiPlant.province,
          region: apiPlant.region,
          next_deadline: apiPlant.next_deadline,
          deadline_color: apiPlant.deadline_color,
          gse_integration: apiPlant.gse_integration,
          terna_integration: apiPlant.terna_integration,
          customs_integration: apiPlant.customs_integration,
          dso_integration: apiPlant.dso_integration,
        } as Plant;
        setSelectedPlant(plant);
        setWorkflowData(prev => ({
          ...prev,
          plantId: plantId,
          plantpower: getplantPotenzaKw(plant),
          typePlant: plant.type || ''
        }));
      } else {
        // Load all plants for selection
        const response = await plantsService.getPlants();
        // Convert API plants to our Plant type
        const plants = response.items.map((apiPlant: ApiPlant): Plant => ({
          ...apiPlant,
          power: apiPlant.power,
          power_kw: apiPlant.power_kw,
          municipality: apiPlant.municipality,
          province: apiPlant.province,
          region: apiPlant.region,
          next_deadline: apiPlant.next_deadline,
          deadline_color: apiPlant.deadline_color,
          gse_integration: apiPlant.gse_integration,
          terna_integration: apiPlant.terna_integration,
          customs_integration: apiPlant.customs_integration,
          dso_integration: apiPlant.dso_integration,
        } as Plant));
        setPlants(plants);
      }
    } catch (error) {
      console.error('Error loading date:', error);
    }
  };

  const extractPhasesFromTemplate = (template: WorkflowTemplate) => {
    // Extract phases from stages, not tasks
    if (!template.stages || template.stages.length === 0) {
      console.log('No stages found in template, setting phases to empty.');
      setPhases([]);
      return;
    }

    console.log(`Extracting phases from ${template.stages.length} stages.`);
    
    const phasePreviews = template.stages.map(stage => {
      // Get entities from stage itself and its tasks
      const stageEntities: string[] = [];
      
      // Add task entities if tasks are embedded
      if (stage.tasks && Array.isArray(stage.tasks)) {
        stage.tasks.forEach((task: any) => {
          if (task.responsible_entity) {
            stageEntities.push(task.responsible_entity);
          }
        });
      }
      
      // Remove duplicates
      const entities = [...new Set(stageEntities)];
      
      // Count tasks - either from embedded tasks array or from flattened tasks matching this stage
      let taskCount = 0;
      if (stage.tasks && Array.isArray(stage.tasks)) {
        taskCount = stage.tasks.length;
      } else if (template.tasks) {
        // Fallback: count from flattened tasks array if stages don't have embedded tasks
        taskCount = template.tasks.filter((task: any) => task.stage_name === stage.name).length;
      }

      return {
        name: stage.name,
        order: stage.order || 0,
        taskCount: taskCount,
        duration: stage.duration_days || 0,
        entities: entities
      };
    });

    console.log('Generated phase previews:', phasePreviews);
    setPhases(phasePreviews.sort((a, b) => a.order - b.order));
  };

  const getFilteredTemplates = () => {
    if (!selectedPlant) return templates;

    return templates.filter(template => {
      // Filter by plant type
      if (template.plant_type && template.plant_type !== 'Tutti' && template.plant_type !== selectedPlant.type) {
        return false;
      }
      
      // Filter by power range
      const powerKw = getplantPotenzaKw(selectedPlant);
      if (template.min_power && powerKw < template.min_power) return false;
      if (template.max_power && powerKw > template.max_power) return false;
      
      return true;
    });
  };

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    console.log('Template selected:', template);
    console.log('Template has stages:', template.stages?.length || 0);
    console.log('Template stages:', template.stages);
    setSelectedTemplate(template);
    
    // Determine entities based on template and plant characteristics
    const involvedEntities = [...(template.required_entities || [])];
    
    // Add conditional entities based on power
    if (workflowData.plantpower > 20 && !involvedEntities.includes(EntityEnum.CUSTOMS)) {
      involvedEntities.push(EntityEnum.CUSTOMS);
    }
    if (workflowData.hasHeritageConstraints && !involvedEntities.includes(EntityEnum.SUPERINTENDENCE)) {
      involvedEntities.push(EntityEnum.SUPERINTENDENCE);
    }
    
    // Set workflow name automatically
    const workflowName = selectedPlant 
      ? `${template.name} - ${selectedPlant.name}`
      : template.name;
    
    setWorkflowData(prev => ({
      ...prev,
      name: workflowName,
      description: template.description || '',
      involvedEntities,
      // Set deadline based on template duration
      due_date: new Date(
        Date.now() + (template.estimated_duration_days || 180) * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0]
    }));

    if (template.stages && template.stages.length > 0) {
      extractPhasesFromTemplate(template);
    }
  };

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    const potenzaKw = getplantPotenzaKw(plant);
    setWorkflowData(prev => ({
      ...prev,
      plantId: plant.id,
      plantpower: potenzaKw,
      typePlant: plant.type || ''
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete workflow creation
      onComplete({
        template_id: normalizeTemplateId(selectedTemplate?.id),
        plant_id: workflowData.plantId,
        name: workflowData.name,
        description: workflowData.description,
        power_kw: workflowData.plantpower,
        type_plant: workflowData.typePlant,
        assignee: workflowData.assignee,
        due_date: workflowData.due_date,
        involvedEntities: workflowData.involvedEntities,
        created_by_role: workflowData.createdByRole
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const stepIndex = plantId ? currentStep : currentStep;
    switch (stepIndex) {
      case 0: return selectedPlant !== null;
      case 1: return selectedTemplate !== null;
      case 2: return true; // Phase review - always can proceed
      case 3: return workflowData.name && workflowData.due_date;
      case 4: return true; // Confirmation - always can proceed
      default: return false;
    }
  };

  const renderPlantSelection = () => {
    if (plants.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Caricamento impianti...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Seleziona l'impianto per il workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {plants.map(plant => (
            <div
              key={plant.id}
              className={clsx(
                'border rounded-lg p-4 cursor-pointer transition-all',
                selectedPlant?.id === plant.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
              onClick={() => handlePlantSelect(plant)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{plant.name}</h4>
                <span className={clsx(
                  'px-2 py-1 text-xs rounded-full',
                  plant.status === 'In Operation' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                )}>
                  {plant.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Tipo:</span> {plant.type}
                </div>
                <div>
                  <span className="font-medium">Potenza:</span> {plant.power}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Ubicazione:</span> {plant.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTemplateSelection = () => {
    const filteredTemplates = getFilteredTemplates();

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Seleziona un template workflow
          </h3>
          {selectedPlant && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Template disponibili per {selectedPlant.name} ({selectedPlant.type}, {getplantPotenzaKw(selectedPlant)} kW)
            </p>
          )}
        </div>
        <WorkflowTemplateGallery
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          plantId={plantId || selectedPlant?.id}
          plantpower={selectedPlant ? getplantPotenzaKw(selectedPlant) : workflowData.plantpower}
          templates={templates}
        />
      </div>
    );
  };

  const renderPhaseReview = () => {
    if (!selectedTemplate || phases.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Nessuna fase disponibile per questo template
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Fasi e attività del workflow
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questo workflow creerà {phases.length} fasi con un totale di{' '}
            {phases.reduce((sum, p) => sum + p.taskCount, 0)} attività
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {phases.map((phase, index) => (
            <div 
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                    {phase.order}
                  </span>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {phase.name}
                  </h4>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {phase.taskCount} attività • ~{phase.duration} giorni
                </span>
              </div>
              
              {phase.entities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {phase.entities.map((entity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Nota importante:</p>
              <p>
                Tutte le attività verranno create senza assegnazione. Potrai assegnare
                i responsabili successivamente dalla scheda workflow dell'impianto.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfiguration = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Configura il workflow
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome workflow
            </label>
            <input
              type="text"
              value={workflowData.name}
              onChange={e => setWorkflowData({ ...workflowData, name: e.target.value })}
              className="input w-full"
              placeholder="Es. Attivazione Impianto FV - Nome Impianto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrizione
            </label>
            <textarea
              value={workflowData.description}
              onChange={e => setWorkflowData({ ...workflowData, description: e.target.value })}
              className="input w-full"
              rows={3}
              placeholder="Descrizione del workflow..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsabile principale
              </label>
              <input
                type="text"
                value={workflowData.assignee}
                onChange={e => setWorkflowData({ ...workflowData, assignee: e.target.value })}
                className="input w-full"
                placeholder="Nome del responsabile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data scadenza complessiva
              </label>
              <input
                type="date"
                value={workflowData.due_date}
                onChange={e => setWorkflowData({ ...workflowData, due_date: e.target.value })}
                className="input w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note aggiuntive
            </label>
            <textarea
              value={workflowData.notes}
              onChange={e => setWorkflowData({ ...workflowData, notes: e.target.value })}
              className="input w-full"
              rows={2}
              placeholder="Note o istruzioni particolari..."
            />
          </div>

          {workflowData.involvedEntities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enti coinvolti
              </label>
              <div className="flex flex-wrap gap-2">
                {workflowData.involvedEntities.map((entity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Conferma creazione workflow
        </h3>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Impianto</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {selectedPlant?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Template</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {selectedTemplate?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nome workflow</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {workflowData.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scadenza</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {workflowData.due_date ? new Date(workflowData.due_date).toLocaleDateString('it-IT') : 'N/A'}
              </p>
            </div>
          </div>

          {workflowData.description && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Descrizione</p>
              <p className="text-gray-900 dark:text-gray-100">
                {workflowData.description}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Riepilogo workflow
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {phases.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fasi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {phases.reduce((sum, p) => sum + p.taskCount, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attività</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedTemplate?.estimated_duration_days || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Giorni stimati</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">Pronto per la creazione</p>
              <p>
                Cliccando su "Crea Workflow" verranno create tutte le fasi e le attività 
                secondo il template selezionato. Potrai gestire il workflow dalla scheda 
                dell'impianto.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const stepIndex = plantId ? currentStep : currentStep;
    switch (stepIndex) {
      case 0: return plantId ? renderTemplateSelection() : renderPlantSelection();
      case 1: return plantId ? renderPhaseReview() : renderTemplateSelection();
      case 2: return plantId ? renderConfiguration() : renderPhaseReview();
      case 3: return plantId ? renderConfirmation() : renderConfiguration();
      case 4: return renderConfirmation();
      default: return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Crea nuovo workflow
        </h2>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={index} className="flex items-center">
                <div className={clsx(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="ml-3">
                  <p className={clsx(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-4 h-5 w-5 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-6 py-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="btn btn-ghost"
          >
            Annulla
          </button>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="btn btn-secondary"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Indietro
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn btn-primary"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Crea Workflow
                </>
              ) : (
                <>
                  Avanti
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowWizard;