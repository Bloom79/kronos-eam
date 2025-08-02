import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Upload,
  Folder,
  Search,
  Filter,
  Calendar,
  Shield,
  Building2,
  TrendingUp,
  Activity,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img';
  entity: 'GAUDÌ' | 'GSE' | 'Dogane' | 'DSO' | 'Generale';
  category: 'Autorizzazione' | 'Tecnico' | 'Amministrativo' | 'Fiscale' | 'Contratto';
  size: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
  uploadedBy: string;
}

interface DocumentsSectionProps {
  plantId: number;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ plantId }) => {
  const { user } = useAuth();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['GAUDÌ']));

  // Mock documents organized by entity
  const documentsByEntity: Record<string, Document[]> = {
    'GAUDÌ': [
      {
        id: 'gaudi-1',
        name: 'Certificato Registrazione GAUDÌ',
        type: 'pdf',
        entity: 'GAUDÌ',
        category: 'Autorizzazione',
        size: '1.2 MB',
        uploadDate: '10/03/2022',
        status: 'valid',
        uploadedBy: 'Mario Rossi'
      },
      {
        id: 'gaudi-2',
        name: 'Scheda Tecnica Impianto',
        type: 'pdf',
        entity: 'GAUDÌ',
        category: 'Tecnico',
        size: '3.5 MB',
        uploadDate: '15/01/2024',
        status: 'valid',
        uploadedBy: 'System'
      }
    ],
    'GSE': [
      {
        id: 'gse-1',
        name: 'Convenzione RID 2024',
        type: 'pdf',
        entity: 'GSE',
        category: 'Contratto',
        size: '856 KB',
        uploadDate: '01/01/2024',
        expiryDate: '31/12/2024',
        status: 'expiring',
        uploadedBy: 'Anna Verdi'
      },
      {
        id: 'gse-2',
        name: 'Dichiarazione Antimafia',
        type: 'pdf',
        entity: 'GSE',
        category: 'Amministrativo',
        size: '234 KB',
        uploadDate: '15/05/2022',
        expiryDate: '15/05/2025',
        status: 'valid',
        uploadedBy: 'Mario Rossi'
      }
    ],
    'Dogane': [
      {
        id: 'dogane-1',
        name: 'Licenza Officina Elettrica',
        type: 'pdf',
        entity: 'Dogane',
        category: 'Autorizzazione',
        size: '1.8 MB',
        uploadDate: '15/06/2022',
        expiryDate: '31/12/2025',
        status: 'valid',
        uploadedBy: 'System'
      },
      {
        id: 'dogane-2',
        name: 'Dichiarazione Consumi 2023',
        type: 'xls',
        entity: 'Dogane',
        category: 'Fiscale',
        size: '456 KB',
        uploadDate: '28/03/2024',
        status: 'valid',
        uploadedBy: 'Luigi Bianchi'
      }
    ],
    'DSO': [
      {
        id: 'dso-1',
        name: 'TICA - Preventivo Connessione',
        type: 'pdf',
        entity: 'DSO',
        category: 'Contratto',
        size: '2.1 MB',
        uploadDate: '20/02/2022',
        status: 'valid',
        uploadedBy: 'E-Distribuzione'
      },
      {
        id: 'dso-2',
        name: 'Regolamento di Esercizio',
        type: 'pdf',
        entity: 'DSO',
        category: 'Tecnico',
        size: '1.5 MB',
        uploadDate: '15/04/2022',
        status: 'valid',
        uploadedBy: 'E-Distribuzione'
      }
    ]
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'GAUDÌ':
        return Shield;
      case 'GSE':
        return TrendingUp;
      case 'Dogane':
        return Building2;
      case 'DSO':
        return Activity;
      default:
        return Folder;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 dark:text-green-400';
      case 'expiring':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const toggleCategory = (entity: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(entity)) {
      newExpanded.delete(entity);
    } else {
      newExpanded.add(entity);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredDocuments = Object.entries(documentsByEntity).reduce((acc, [entity, docs]) => {
    if (selectedEntity && entity !== selectedEntity) return acc;
    
    const filtered = docs.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc[entity] = filtered;
    }
    
    return acc;
  }, {} as Record<string, Document[]>);

  const canUpload = user?.ruolo === 'Admin' || user?.ruolo === 'Asset Manager' || user?.ruolo === 'Plant Owner';

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca documenti..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            value={selectedEntity || ''}
            onChange={(e) => setSelectedEntity(e.target.value || null)}
          >
            <option value="">Tutti gli enti</option>
            <option value="GAUDÌ">GAUDÌ</option>
            <option value="GSE">GSE</option>
            <option value="Dogane">Dogane</option>
            <option value="DSO">DSO</option>
          </select>
          
          {canUpload && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Carica Documento
            </button>
          )}
        </div>

        {/* Document Categories */}
        <div className="space-y-4">
          {Object.entries(filteredDocuments).map(([entity, documents]) => {
            const EntityIcon = getEntityIcon(entity);
            const isExpanded = expandedCategories.has(entity);
            
            return (
              <div key={entity} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleCategory(entity)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <EntityIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-100">{entity}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      ({documents.length} documenti)
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="p-4 space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {doc.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {doc.category} • {doc.size} • Caricato il {doc.uploadDate}
                              </p>
                              {doc.expiryDate && (
                                <p className={clsx('text-xs mt-1', getStatusColor(doc.status))}>
                                  <Calendar className="inline h-3 w-3 mr-1" />
                                  {doc.status === 'expired' ? 'Scaduto' : 'Scade'} il {doc.expiryDate}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              title="Visualizza"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              title="Scarica"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Templates */}
      {(user?.ruolo === 'Admin' || user?.ruolo === 'Asset Manager') && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Template Documenti 2025
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-medium text-gray-800 dark:text-gray-100">Dichiarazione Consumi Annuale</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Template Agenzia Dogane 2025</p>
            </button>
            
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-gray-800 dark:text-gray-100">Comunicazione Fuel Mix</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Template GSE 2025</p>
            </button>
            
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium text-gray-800 dark:text-gray-100">Aggiornamento Dati Tecnici</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Template GAUDÌ 2025</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;