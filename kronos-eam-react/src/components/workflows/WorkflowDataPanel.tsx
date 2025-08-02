import React, { useState } from 'react';
import {
  Edit2,
  Save,
  X,
  Clock,
  User,
  FileText,
  Info,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '../../services/api';
import clsx from 'clsx';

interface WorkflowDataField {
  field: string;
  label: string;
  value: any;
  lastUpdate?: string;
  updatedBy?: string;
  sourceWorkflow?: string;
  sourceTask?: string;
  editable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: { value: string; label: string }[];
}

interface WorkflowDataPanelProps {
  title: string;
  fields: WorkflowDataField[];
  entity: 'dso' | 'terna' | 'gse' | 'customs';
  plantId: number;
  userRole: string;
  onUpdate?: () => void;
}

const WorkflowDataPanel: React.FC<WorkflowDataPanelProps> = ({
  title,
  fields,
  entity,
  plantId,
  userRole,
  onUpdate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  // Determine if user can edit based on role and entity
  const canEdit = () => {
    switch (entity) {
      case 'dso':
      case 'terna':
        return ['administrator', 'technician'].includes(userRole);
      case 'gse':
        return ['administrator', 'owner'].includes(userRole);
      case 'customs':
        return ['administrator', 'consultant'].includes(userRole);
      default:
        return false;
    }
  };

  const handleEdit = () => {
    const initialValues: Record<string, any> = {};
    fields.forEach(field => {
      if (field.editable !== false) {
        initialValues[field.field] = field.value;
      }
    });
    setEditedValues(initialValues);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedValues({});
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Only send changed values
      const changedValues: Record<string, any> = {};
      Object.entries(editedValues).forEach(([key, value]) => {
        const originalField = fields.find(f => f.field === key);
        if (originalField && originalField.value !== value) {
          changedValues[key] = value;
        }
      });

      if (Object.keys(changedValues).length > 0) {
        await apiClient.patch(`/plants/${plantId}/entity-data/${entity}`, changedValues);
        if (onUpdate) onUpdate();
      }

      setEditMode(false);
      setEditedValues({});
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const formatValue = (field: WorkflowDataField) => {
    if (field.value === null || field.value === undefined) return 'N/A';
    
    switch (field.type) {
      case 'date':
        return new Date(field.value).toLocaleDateString('it-IT');
      case 'boolean':
        return field.value ? 'Sì' : 'No';
      default:
        return field.value.toString();
    }
  };

  const renderField = (field: WorkflowDataField) => {
    if (editMode && field.editable !== false) {
      switch (field.type) {
        case 'boolean':
          return (
            <input
              type="checkbox"
              checked={editedValues[field.field] || false}
              onChange={(e) => handleFieldChange(field.field, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          );
        case 'select':
          return (
            <select
              value={editedValues[field.field] || ''}
              onChange={(e) => handleFieldChange(field.field, e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        case 'date':
          return (
            <input
              type="date"
              value={editedValues[field.field] || ''}
              onChange={(e) => handleFieldChange(field.field, e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          );
        case 'number':
          return (
            <input
              type="number"
              value={editedValues[field.field] || ''}
              onChange={(e) => handleFieldChange(field.field, parseFloat(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          );
        default:
          return (
            <input
              type="text"
              value={editedValues[field.field] || ''}
              onChange={(e) => handleFieldChange(field.field, e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 w-full"
            />
          );
      }
    }

    return (
      <span className={clsx(
        'font-medium',
        field.value === null || field.value === undefined
          ? 'text-gray-400 dark:text-gray-500 italic'
          : 'text-gray-800 dark:text-gray-100'
      )}>
        {formatValue(field)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h3>
        {canEdit() && !editMode && (
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Modifica dati"
          >
            <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        {editMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              title="Salva modifiche"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Annulla"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.field} className="relative group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {field.label}
                </p>
                {renderField(field)}
              </div>
              
              {/* Source indicator */}
              {field.sourceWorkflow && (
                <button
                  onClick={() => setShowHistory(
                    showHistory === field.field ? null : field.field
                  )}
                  className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                  title="Visualizza origine dati"
                >
                  <Info className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>

            {/* Data source popup */}
            {showHistory === field.field && field.sourceWorkflow && (
              <div className="absolute z-10 mt-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 text-xs w-64">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Workflow: {field.sourceWorkflow}
                    </span>
                  </div>
                  {field.sourceTask && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Task: {field.sourceTask}
                      </span>
                    </div>
                  )}
                  {field.updatedBy && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Aggiornato da: {field.updatedBy}
                      </span>
                    </div>
                  )}
                  {field.lastUpdate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {new Date(field.lastUpdate).toLocaleString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nessun dato disponibile da workflow</p>
          <p className="text-sm mt-1">
            I dati verranno popolati completando i workflow associati
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowDataPanel;