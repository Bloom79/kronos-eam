import React from 'react';
import { Building2, Zap, Activity, FileText, Home, Trees } from 'lucide-react';
import clsx from 'clsx';

interface EntitySelectorProps {
  selectedEntities: string[];
  onChange: (entities: string[]) => void;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ selectedEntities, onChange }) => {
  const entities = [
    {
      id: 'DSO',
      name: 'DSO',
      description: 'Distributore Sistema Operatore',
      icon: Activity,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      borderColor: 'border-blue-300 dark:border-blue-700'
    },
    {
      id: 'Terna',
      name: 'Terna',
      description: 'Gestore Rete Trasmissione',
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      borderColor: 'border-yellow-300 dark:border-yellow-700'
    },
    {
      id: 'GSE',
      name: 'GSE',
      description: 'Gestore Servizi Energetici',
      icon: Building2,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      borderColor: 'border-green-300 dark:border-green-700'
    },
    {
      id: 'Dogane',
      name: 'Dogane',
      description: 'Agenzia delle Dogane',
      icon: FileText,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      borderColor: 'border-red-300 dark:border-red-700'
    },
    {
      id: 'Comune',
      name: 'Comune',
      description: 'Amministrazione Comunale',
      icon: Home,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      borderColor: 'border-purple-300 dark:border-purple-700'
    },
    {
      id: 'Regione',
      name: 'Regione',
      description: 'Amministrazione Regionale',
      icon: Building2,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      borderColor: 'border-indigo-300 dark:border-indigo-700'
    },
    {
      id: 'Soprintendenza',
      name: 'Soprintendenza',
      description: 'Beni Culturali e Paesaggistici',
      icon: Trees,
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      borderColor: 'border-orange-300 dark:border-orange-700'
    }
  ];

  const toggleEntity = (entityId: string) => {
    if (selectedEntities.includes(entityId)) {
      onChange(selectedEntities.filter(id => id !== entityId));
    } else {
      onChange([...selectedEntities, entityId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entities.map((entity) => {
        const Icon = entity.icon;
        const isSelected = selectedEntities.includes(entity.id);

        return (
          <button
            key={entity.id}
            type="button"
            onClick={() => toggleEntity(entity.id)}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all text-left',
              isSelected
                ? `${entity.color} ${entity.borderColor} shadow-md`
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={clsx(
                'p-2 rounded-lg',
                isSelected ? 'bg-white/20' : entity.color.split(' ')[0]
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className={clsx(
                  'font-medium',
                  isSelected ? 'text-current' : 'text-gray-800 dark:text-gray-100'
                )}>
                  {entity.name}
                </h4>
                <p className={clsx(
                  'text-sm mt-1',
                  isSelected ? 'opacity-90' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {entity.description}
                </p>
              </div>
              <div className={clsx(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                isSelected
                  ? 'bg-white/20 border-current'
                  : 'border-gray-300 dark:border-gray-600'
              )}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-current" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default EntitySelector;