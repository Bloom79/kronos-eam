import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WorkflowTemplateEditor from '../components/workflows/WorkflowTemplateEditor';
import { workflowService } from '../services/api';
import { WorkflowTemplate } from '../types';
import { toast } from '../hooks/useToast';

const WorkflowTemplateCreator: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSave = async (templateData: Partial<WorkflowTemplate>) => {
    try {
      setSaving(true);
      await workflowService.createTemplate(templateData);
      toast.success('Template creato con successo');
      navigate('/workflows/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Errore durante la creazione del template');
      throw error; // Re-throw to let the editor component handle it
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/workflows/templates');
  };

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
          template={null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default WorkflowTemplateCreator;