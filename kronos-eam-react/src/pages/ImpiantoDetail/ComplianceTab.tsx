import React, { useState } from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  Download,
  ChevronRight,
  Info
} from 'lucide-react';
import { Plant } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

interface ComplianceTabProps {
  plant: Plant;
}

interface ComplianceItem {
  id: string;
  entity: 'GAUDÌ' | 'GSE' | 'Dogane' | 'DSO';
  requirement: string;
  status: 'compliant' | 'warning' | 'critical' | 'pending';
  lastUpdate?: string;
  nextDeadline?: string;
  documents?: number;
  notes?: string;
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({ plant }) => {
  const { user } = useAuth();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Calculate compliance score based on plant data
  const calculateComplianceScore = () => {
    const checks = [
      plant.checklist?.dso_connection,
      plant.checklist?.terna_registration,
      plant.checklist?.gse_activation,
      plant.checklist?.customs_license,
      plant.checklist?.spi_verification,
      plant.checklist?.consumption_declaration
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  };

  const complianceScore = plant.checklist?.compliance_score || calculateComplianceScore();

  // Mock compliance data based on 2025 requirements
  const complianceItems: ComplianceItem[] = [
    // GAUDÌ Requirements
    {
      id: 'gaudi-1',
      entity: 'GAUDÌ',
      requirement: 'Registrazione impianto su portale GAUDÌ',
      status: plant.registry?.gaudi ? 'compliant' : 'critical',
      lastUpdate: '10/03/2022',
      documents: 3,
      notes: `Codice Censimp: ${plant.registry?.gaudi || 'Non disponibile'}`
    },
    {
      id: 'gaudi-2',
      entity: 'GAUDÌ',
      requirement: 'Aggiornamento dati tecnici annuale',
      status: 'compliant',
      lastUpdate: '15/01/2024',
      nextDeadline: '15/01/2025',
      documents: 2
    },
    // GSE Requirements
    {
      id: 'gse-1',
      entity: 'GSE',
      requirement: 'Convenzione Ritiro Dedicato (RID)',
      status: 'compliant',
      lastUpdate: '01/06/2022',
      documents: 5,
      notes: 'Transizione da SSP completata'
    },
    {
      id: 'gse-2',
      entity: 'GSE',
      requirement: 'Comunicazione annuale Fuel Mix',
      status: 'warning',
      nextDeadline: '31/03/2025',
      documents: 1,
      notes: 'Da presentare entro il 31 marzo'
    },
    // Customs Requirements
    {
      id: 'dogane-1',
      entity: 'Dogane',
      requirement: 'Licenza Officina Elettrica (>20kW)',
      status: plant.power_kw && plant.power_kw > 20 ? 'compliant' : 'pending',
      lastUpdate: '15/06/2022',
      documents: 4,
      notes: plant.power_kw && plant.power_kw > 20 ? 'Licenza attiva' : 'Non richiesta per potenza < 20kW'
    },
    {
      id: 'dogane-2',
      entity: 'Dogane',
      requirement: 'Dichiarazione annuale consumi',
      status: plant.checklist?.consumption_declaration ? 'compliant' : 'critical',
      nextDeadline: '31/03/2025',
      documents: 2,
      notes: 'Scadenza fissa annuale'
    },
    {
      id: 'dogane-3',
      entity: 'Dogane',
      requirement: 'Pagamento diritto annuale licenza',
      status: 'warning',
      nextDeadline: '16/12/2024',
      documents: 1,
      notes: 'Importo fisso €23,24'
    },
    // DSO Requirements
    {
      id: 'dso-1',
      entity: 'DSO',
      requirement: 'Regolamento di esercizio',
      status: plant.checklist?.dso_connection ? 'compliant' : 'critical',
      lastUpdate: '22/05/2022',
      documents: 3
    },
    {
      id: 'dso-2',
      entity: 'DSO',
      requirement: 'Verifica protezioni interfaccia (SPI)',
      status: plant.checklist?.spi_verification ? 'compliant' : 'warning',
      nextDeadline: '22/05/2027',
      documents: 2,
      notes: 'Ogni 5 anni dalla connessione'
    }
  ];

  const getStatusColor = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'pending':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertCircle;
      case 'pending':
        return Clock;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const entityStats = {
    'GAUDÌ': complianceItems.filter(item => item.entity === 'GAUDÌ'),
    'GSE': complianceItems.filter(item => item.entity === 'GSE'),
    'Dogane': complianceItems.filter(item => item.entity === 'Dogane'),
    'DSO': complianceItems.filter(item => item.entity === 'DSO')
  };

  const filteredItems = selectedEntity
    ? complianceItems.filter(item => item.entity === selectedEntity)
    : complianceItems;

  // Critical deadlines in the next 30 days
  const urgentDeadlines = complianceItems.filter(item => {
    if (!item.nextDeadline) return false;
    const deadline = new Date(item.nextDeadline.split('/').reverse().join('-'));
    const daysUntil = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Conformità Normativa 2025
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Punteggio Conformità</p>
              <p className={clsx('text-3xl font-bold', getScoreColor(complianceScore))}>
                {complianceScore}%
              </p>
            </div>
            <div className={clsx('p-3 rounded-full', getScoreColor(complianceScore).replace('text-', 'bg-').replace('600', '100').replace('400', '900'))}>
              <Shield className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Entity Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(entityStats).map(([entity, items]) => {
            const compliant = items.filter(i => i.status === 'compliant').length;
            const total = items.length;
            return (
              <button
                key={entity}
                onClick={() => setSelectedEntity(selectedEntity === entity ? null : entity)}
                className={clsx(
                  'p-4 rounded-lg border transition-all',
                  selectedEntity === entity
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{entity}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {compliant}/{total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Conformi</p>
              </button>
            );
          })}
        </div>

        {/* Urgent Deadlines Alert */}
        {urgentDeadlines.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Scadenze Imminenti
                </p>
                <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {urgentDeadlines.map(item => (
                    <li key={item.id}>
                      • {item.requirement} - {item.nextDeadline}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Dettaglio Requisiti {selectedEntity && `- ${selectedEntity}`}
            </h3>
            {selectedEntity && (
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mostra tutti
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredItems.map((item) => {
            const Icon = getStatusIcon(item.status);
            return (
              <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={clsx('p-2 rounded-lg', getStatusColor(item.status))}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">
                          {item.requirement}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.entity}
                        </p>
                      </div>
                      
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(item.status)
                      )}>
                        {item.status === 'compliant' && 'Conforme'}
                        {item.status === 'warning' && 'Attenzione'}
                        {item.status === 'critical' && 'Critico'}
                        {item.status === 'pending' && 'In attesa'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      {item.lastUpdate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Aggiornato: {item.lastUpdate}</span>
                        </div>
                      )}
                      {item.nextDeadline && (
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Clock className="h-4 w-4" />
                          <span>Scadenza: {item.nextDeadline}</span>
                        </div>
                      )}
                      {item.documents && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{item.documents} documenti</span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {item.notes}
                        </p>
                      </div>
                    )}

                    {/* Role-specific actions */}
                    {(user?.ruolo === 'Admin' || user?.ruolo === 'Asset Manager' || user?.ruolo === 'Plant Owner') && (
                      <div className="mt-3 flex items-center gap-3">
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Visualizza documenti
                        </button>
                        {item.status !== 'compliant' && (
                          <button className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
                            <ChevronRight className="h-4 w-4" />
                            Avvia workflow
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export Report */}
        {(user?.ruolo === 'Admin' || user?.ruolo === 'Asset Manager' || user?.ruolo === 'Plant Owner') && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full md:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Esporta Report Conformità
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceTab;