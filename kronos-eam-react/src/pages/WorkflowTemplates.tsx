import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, FileText, 
  Edit2, Copy, Trash2, Activity, DollarSign, TrendingUp,
  Settings, CheckCircle, Calendar, Eye, Package
} from 'lucide-react';
import { workflowService } from '../services/api';
import { WorkflowTemplate } from '../types';
import WorkflowTemplatePreview from '../components/workflows/WorkflowTemplatePreview';
import clsx from 'clsx';

const WorkflowTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showActions, setShowActions] = useState<string | number | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'Activation': return Activity;
      case 'Fiscal': return DollarSign;
      case 'Incentives': return TrendingUp;
      case 'Changes': return Settings;
      case 'Maintenance': return Settings;
      case 'Compliance': return CheckCircle;
      default: return FileText;
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Activation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Fiscal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Incentives': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Changes': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Compliance': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handlePreview = (template: WorkflowTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleDuplicate = async (template: WorkflowTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copia)`,
        id: undefined
      };
      await workflowService.createTemplate(duplicatedTemplate);
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleDelete = async (templateId: string | number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo template?')) {
      try {
        await workflowService.deleteTemplate(Number(templateId));
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.descrizione.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.categoria === selectedCategory;
    const matchesPurpose = selectedPurpose === 'all' || template.workflow_purpose === selectedPurpose;
    
    return matchesSearch && matchesCategory && matchesPurpose;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.categoria)))];
  const purposes = ['all', ...Array.from(new Set(templates.map(t => t.workflow_purpose).filter(Boolean)))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Template Workflow
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestisci i template per la creazione di workflow
          </p>
        </div>
        <Link
          to="/workflow-templates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuovo Template
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">Tutte le categorie</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Purpose Filter */}
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">Tutti gli scopi</option>
            {purposes.filter(purpose => purpose !== 'all').map(purpose => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nessun template trovato
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Scopo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attività
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ricorrenza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.categoria);
                return (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'p-2 rounded-lg',
                          getCategoryColor(template.categoria).replace('text-', 'bg-').split(' ')[0]
                        )}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {template.descrizione}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex px-2 py-1 text-xs rounded-full font-medium',
                        getCategoryColor(template.categoria)
                      )}>
                        {template.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {template.workflow_purpose && (
                        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {template.workflow_purpose}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {template.tasks?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {template.ricorrenza || 'Una tantum'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(template)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Visualizza"
                        >
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <Link
                          to={`/workflow-templates/${template.id}/edit`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifica"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === template.id ? null : template.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          {showActions === template.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <button
                                onClick={() => {
                                  handleDuplicate(template);
                                  setShowActions(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                Duplica
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(template.id);
                                  setShowActions(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                                Elimina
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {templates.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Template Totali
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {templates.filter(t => t.attivo !== false).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Template Attivi
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {templates.filter(t => t.ricorrenza && t.ricorrenza !== 'One-time').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Template Ricorrenti
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {templates.reduce((total, t) => total + (t.tasks?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Attività Totali
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <WorkflowTemplatePreview
          template={previewTemplate}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default WorkflowTemplates;