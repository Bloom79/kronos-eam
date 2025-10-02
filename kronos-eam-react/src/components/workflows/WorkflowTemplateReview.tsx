import React from 'react';
import { 
  CheckCircle, AlertTriangle, FileText, Building2, 
  Clock, Zap, Calendar, Users, MapPin, Info,
  ChevronRight, Layers, X, Settings
} from 'lucide-react';
import { WorkflowTemplate } from '../../types';
import clsx from 'clsx';

interface WorkflowTemplateReviewProps {
  formData: Partial<WorkflowTemplate>;
  errors: Record<string, string>;
}

const WorkflowTemplateReview: React.FC<WorkflowTemplateReviewProps> = ({
  formData,
  errors
}) => {
  const validationIssues = [];
  const warnings = [];

  // Check for validation issues
  if (!formData.name?.trim()) {
    validationIssues.push('Nome template mancante');
  }
  if (!formData.category) {
    validationIssues.push('Categoria non selezionata');
  }
  if (!formData.stages || formData.stages.length === 0) {
    validationIssues.push('Nessuna fase definita');
  }

  // Check for warnings
  if (!formData.description?.trim()) {
    warnings.push('Descrizione mancante - consigliata per chiarezza');
  }
  if (formData.stages?.some(stage => !stage.tasks || stage.tasks.length === 0)) {
    warnings.push('Alcune fasi non hanno attività definite');
  }
  if ((!formData.required_entities || formData.required_entities.length === 0) && (formData.stages?.length || 0) > 0) {
    warnings.push('Nessun ente selezionato - verifica se necessario');
  }

  const getTotalTasks = () => {
    return formData.stages?.reduce((sum, stage) => sum + (stage.tasks?.length || 0), 0) || 0;
  };

  const getTotalDocuments = () => {
    return formData.stages?.reduce((sum, stage) => {
      const stageDocs = (stage as any).document_templates?.length || 0;
      const taskDocs = stage.tasks?.reduce((taskSum: number, task: any) => 
        taskSum + (task.required_documents?.length || 0) + (task.documents_to_generate?.length || 0), 0) || 0;
      return sum + stageDocs + taskDocs;
    }, 0) || 0;
  };

  const getEstimatedDuration = () => {
    if (formData.estimated_duration_days) return formData.estimated_duration_days;
    
    // Calculate from stages
    const stageDuration = formData.stages?.reduce((sum, stage) => 
      sum + (stage.duration_days || 30), 0) || 0;
    return stageDuration;
  };

  const isValid = validationIssues.length === 0;

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div className={clsx(
        'rounded-lg p-4 border',
        isValid 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      )}>
        <div className="flex items-start gap-3">
          {isValid ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Template pronto per il salvataggio
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Tutti i campi obbligatori sono stati compilati correttamente
                </p>
              </div>
            </>
          ) : (
            <>
              <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Template incompleto
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                  {validationIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full"></span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Avvisi
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Template Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Riepilogo Template
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nome Template</h4>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {formData.name || <span className="text-gray-400 italic">Non definito</span>}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</h4>
              <span className={clsx(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                formData.category ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              )}>
                {formData.category || 'Non selezionata'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo</h4>
              <p className="text-gray-800 dark:text-gray-200">
                {formData.is_complete_workflow ? 'Workflow Completo' : 'Componente di Fase'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stato</h4>
              <span className={clsx(
                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                formData.active 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              )}>
                <span className={clsx(
                  'w-2 h-2 rounded-full',
                  formData.active ? 'bg-green-600' : 'bg-gray-500'
                )} />
                {formData.active ? 'Attivo' : 'Inattivo'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Fasi</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formData.stages?.length || 0}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Attività</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {getTotalTasks()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Documenti</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {getTotalDocuments()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Enti</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formData.required_entities?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {formData.description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Descrizione</h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {formData.description}
            </p>
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurazione
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plant Type */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Tipo Impianto</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200">
              {formData.plant_type || 'Tutti'}
            </p>
          </div>

          {/* Power Range */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Range Potenza</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200">
              {formData.min_power || 0} - {formData.max_power || '∞'} kW
            </p>
          </div>

          {/* Duration & Recurrence */}
          <div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Tempistiche</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200">
              {getEstimatedDuration()} giorni • {formData.recurrence || 'One-time'}
            </p>
          </div>
        </div>

        {/* Entities */}
        {formData.required_entities && formData.required_entities.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Enti Coinvolti</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.required_entities.map(entity => (
                <span 
                  key={entity}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workflow Structure Preview */}
      {formData.stages && formData.stages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Struttura Workflow
          </h3>

          <div className="space-y-3">
            {formData.stages.map((stage, index) => (
              <div 
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">
                        {stage.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{stage.tasks?.length || 0} attività</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowTemplateReview;