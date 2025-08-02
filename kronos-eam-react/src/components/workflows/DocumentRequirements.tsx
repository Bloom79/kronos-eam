import React, { useState } from 'react';
import { Plus, X, FileText, Edit2, Save, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface DocumentRequirementsProps {
  documents: string[];
  onChange: (documents: string[]) => void;
}

const DocumentRequirements: React.FC<DocumentRequirementsProps> = ({ documents, onChange }) => {
  const [newDocument, setNewDocument] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const commonDocuments = [
    'Documento identità titolare',
    'Visura camerale',
    'Titolo disponibilità sito',
    'Progetto definitivo plant',
    'Relazione tecnica',
    'Schema unifilare',
    'Planimetria plant',
    'Dichiarazione di conformità',
    'Polizza assicurativa RC',
    'Certificato antimafia',
    'Procura/Delega',
    'Coordinate bancarie'
  ];

  const addDocument = () => {
    if (newDocument.trim() && !documents.includes(newDocument.trim())) {
      onChange([...documents, newDocument.trim()]);
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(documents[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...documents];
      updated[editingIndex] = editValue.trim();
      onChange(updated);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const addCommonDocument = (doc: string) => {
    if (!documents.includes(doc)) {
      onChange([...documents, doc]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Documents */}
      <div className="space-y-2">
        {documents.length === 0 && (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nessun documento richiesto
          </p>
        )}
        
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
          >
            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveEdit}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {doc}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(index)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Document */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newDocument}
          onChange={(e) => setNewDocument(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addDocument()}
          placeholder="Aggiungi documento richiesto..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={addDocument}
          disabled={!newDocument.trim()}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
            newDocument.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          )}
        >
          <Plus className="h-4 w-4" />
          Aggiungi
        </button>
      </div>

      {/* Common Documents Suggestions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Documenti Comuni
        </h4>
        <div className="flex flex-wrap gap-2">
          {commonDocuments
            .filter(doc => !documents.includes(doc))
            .map((doc) => (
              <button
                key={doc}
                type="button"
                onClick={() => addCommonDocument(doc)}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                {doc}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentRequirements;