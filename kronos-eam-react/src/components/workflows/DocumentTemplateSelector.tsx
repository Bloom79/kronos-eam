import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, AlertCircle, CheckCircle, FileSignature } from 'lucide-react';
import { workflowService } from '../../services/api';
import clsx from 'clsx';

interface DocumentTemplate {
  id: number;
  name: string;
  descrizione?: string;
  task_name?: string;
  is_required: boolean;
  placeholders: Record<string, any>;
  output_formats: string[];
}

interface DocumentTemplateSelectorProps {
  workflowId?: number;
  templateId?: number;
  onDocumentGenerated?: (documentId: number) => void;
}

const DocumentTemplateSelector: React.FC<DocumentTemplateSelectorProps> = ({
  workflowId,
  templateId,
  onDocumentGenerated
}) => {
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [generationMessage, setGenerationMessage] = useState('');

  useEffect(() => {
    if (templateId) {
      loadDocumentTemplates();
    }
  }, [templateId]);

  const loadDocumentTemplates = async () => {
    if (!templateId) return;
    
    setLoading(true);
    try {
      const templates = await workflowService.getDocumentTemplates(templateId);
      setDocumentTemplates(templates);
    } catch (error) {
      console.error('Error loading document templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setGenerationStatus('idle');
    
    // Load preview data for the template
    if (workflowId) {
      try {
        const preview = await workflowService.previewDocumentTemplate(workflowId);
        setPreviewData(preview);
      } catch (error) {
        console.error('Error loading preview data:', error);
      }
    }
  };

  const handleGenerateDocument = async (format: string) => {
    if (!selectedTemplate || !workflowId) return;
    
    setGenerationStatus('loading');
    setGenerationMessage('Generazione documento in corso...');
    
    try {
      const response = await workflowService.generateDocument(workflowId, {
        template_id: selectedTemplate.id,
        format: format,
        data: previewData
      });
      
      setGenerationStatus('success');
      setGenerationMessage(`Documento generato con successo!`);
      
      if (onDocumentGenerated && response.document_id) {
        onDocumentGenerated(response.document_id);
      }
      
      // If we have a download URL, trigger download
      if (response.download_url) {
        window.open(response.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      setGenerationStatus('error');
      setGenerationMessage('Errore durante la generazione del documento');
    }
  };

  const handlePreviewDocument = () => {
    if (!selectedTemplate) return;
    
    // Open preview modal or navigate to preview page
    console.log('Preview document:', selectedTemplate, previewData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Templates List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Documenti Template Disponibili
        </h3>
        
        {documentTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Nessun template documento disponibile per questo workflow</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={clsx(
                  'border-2 rounded-lg p-4 cursor-pointer transition-all',
                  selectedTemplate?.id === template.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">
                        {template.name}
                      </h4>
                      {template.is_required && (
                        <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded">
                          Obbligatorio
                        </span>
                      )}
                    </div>
                    {template.descrizione && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.descrizione}
                      </p>
                    )}
                    {template.task_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Task: {template.task_name}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {template.output_formats.map((format) => (
                        <span
                          key={format}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          {format.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Template Actions */}
      {selectedTemplate && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-4">
            Genera Documento: {selectedTemplate.name}
          </h4>
          
          {/* Placeholder Fields Preview */}
          {Object.keys(selectedTemplate.placeholders).length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Campi che verranno compilati automaticamente:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedTemplate.placeholders).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {previewData[key] || value || '---'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Generation Status */}
          {generationStatus !== 'idle' && (
            <div className={clsx(
              'mb-4 p-3 rounded-lg flex items-center gap-2',
              generationStatus === 'loading' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
              generationStatus === 'success' && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
              generationStatus === 'error' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            )}>
              {generationStatus === 'loading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {generationStatus === 'success' && <CheckCircle className="h-4 w-4" />}
              {generationStatus === 'error' && <AlertCircle className="h-4 w-4" />}
              <span className="text-sm">{generationMessage}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePreviewDocument}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Anteprima
            </button>
            
            {selectedTemplate.output_formats.map((format) => (
              <button
                key={format}
                onClick={() => handleGenerateDocument(format)}
                disabled={generationStatus === 'loading'}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  generationStatus === 'loading'
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                <Download className="h-4 w-4" />
                Genera {format.toUpperCase()}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Il documento verrà generato con i dati attuali del workflow e dell'plant
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentTemplateSelector;