import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WorkflowTemplateEditor from '../components/workflows/WorkflowTemplateEditor';
import { workflowService } from '../services/api';
import { WorkflowTemplate } from '../types';
import { toast } from '../hooks/useToast';

const WorkflowTemplateEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await workflowService.getTemplate(Number(id));
        setTemplate(data);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Errore durante il caricamento del template');
        navigate('/workflows/templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  const handleSave = async (templateData: Partial<WorkflowTemplate>) => {
    if (!id) return;
    
    try {
      setSaving(true);
      await workflowService.updateTemplate(Number(id), templateData);
      toast.success('Template aggiornato con successo');
      navigate('/workflows/templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Errore durante l\'aggiornamento del template');
      throw error; // Re-throw to let the editor component handle it
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/workflows/templates');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Caricamento template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/workflows/templates')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Torna ai Template</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkflowTemplateEditor
          template={template}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default WorkflowTemplateEdit;