import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, AlertCircle, CheckCircle, 
  Download, ExternalLink, Search, X
} from 'lucide-react';
import { documentService } from '../../services/api';
import { toast } from '../../hooks/useToast';

interface DocumentTemplateUploadProps {
  onTemplateUploaded?: (template: any) => void;
  taskId?: number;
  category?: string;
  phaseId?: number;
  phaseName?: string;
}

interface TemplateSearchResult {
  entity: string;
  entity_name?: string;
  template_name: string;
  direct_download?: string;
  portal_page?: string;
  search_url?: string;
  alternate_sources?: Array<{ name: string; url: string }>;
  version?: string;
  last_updated?: string;
}

const DocumentTemplateUpload: React.FC<DocumentTemplateUploadProps> = ({
  onTemplateUploaded,
  taskId,
  category = 'Autorizzativo',
  phaseId,
  phaseName
}) => {
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TemplateSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('template_name', file.name.split('.')[0]);
      formData.append('template_category', category);
      if (taskId) {
        formData.append('task_associations', taskId.toString());
      }
      if (phaseId) {
        formData.append('phase_id', phaseId.toString());
      }
      if (phaseName) {
        formData.append('phase_name', phaseName);
      }

      const response = await documentService.uploadTemplate(formData);
      
      toast.success('Template caricato con successo');
      if (onTemplateUploaded) {
        onTemplateUploaded(response);
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('Errore durante il caricamento del template');
    } finally {
      setUploading(false);
    }
  }, [category, taskId, onTemplateUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  });

  const searchTemplates = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await documentService.searchTemplates(searchQuery) as any;
      setSearchResults(response.results || response.templates || []);
    } catch (error) {
      console.error('Error searching templates:', error);
      toast.error('Errore durante la ricerca dei template');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            Rilascia il file qui...
          </p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              Trascina un template qui o clicca per selezionare
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Formati supportati: PDF, DOCX, DOC
            </p>
          </>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Caricamento in corso...</p>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="relative">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Cerca template ufficiali online</span>
        </button>

        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            <div className="p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTemplates()}
                  placeholder="Cerca template (es. Modello Unico)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={searchTemplates}
                  disabled={searching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {searching ? 'Ricerca...' : 'Cerca'}
                </button>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risultati trovati: {searchResults.length}
                  </h4>
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200">
                              {result.template_name}
                            </h5>
                            {result.entity_name && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {result.entity_name}
                              </p>
                            )}
                            {result.version && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Versione: {result.version}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {result.direct_download && (
                              <a
                                href={result.direct_download}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="Download diretto"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            {result.portal_page && (
                              <a
                                href={result.portal_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                title="Vai al portale"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        {result.alternate_sources && result.alternate_sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Fonti alternative:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.alternate_sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                >
                                  {source.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTemplateUpload;