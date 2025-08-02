import React, { useState } from 'react';
import {
  Link2,
  Shield,
  Activity,
  FileText,
  Key,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Bot,
  Mail,
  Code,
  Database,
  ExternalLink,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { Integrazione } from '../types';
import CredentialManager from '../components/integrations/CredentialManager';
import RPAMonitorV2 from '../components/integrations/RPAMonitorV2';
import PECManager from '../components/integrations/PECManager';
import EDIGenerator from '../components/integrations/EDIGenerator';
import clsx from 'clsx';

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const integrazioni: Integrazione[] = [
    {
      id: 'gse',
      name: 'GSE',
      status: 'Connected',
      ultimaSincronizzazione: '2024-03-15 14:30:22',
      typeConnessione: 'RPA',
      messaggiInCoda: 0,
      errori: 0
    },
    {
      id: 'terna',
      name: 'Terna',
      status: 'Connected',
      ultimaSincronizzazione: '2024-03-15 13:45:18',
      typeConnessione: 'API',
      messaggiInCoda: 2,
      errori: 0
    },
    {
      id: 'dogane',
      name: 'Customs',
      status: 'Error',
      ultimaSincronizzazione: '2024-03-15 10:15:33',
      typeConnessione: 'EDI',
      messaggiInCoda: 5,
      errori: 3
    },
    {
      id: 'e-distribuzione',
      name: 'E-Distribuzione',
      status: 'Maintenance',
      ultimaSincronizzazione: '2024-03-14 22:30:00',
      typeConnessione: 'PEC',
      messaggiInCoda: 12,
      errori: 0
    }
  ];

  const integrationDetails = {
    gse: {
      icon: Shield,
      color: 'blue',
      description: 'Gestore dei Servizi Energetici - Incentivi e convenzioni',
      endpoints: [
        { name: 'Area Clienti', url: 'https://areaclienti.gse.it', type: 'Web Portal' },
        { name: 'Pratiche RID', url: 'https://areaclienti.gse.it/rid', type: 'Web Portal' },
        { name: 'Antimafia', url: 'https://areaclienti.gse.it/antimafia', type: 'Web Portal' }
      ],
      autenticazione: 'SPID / User+Password+MFA',
      ultimiTask: [
        { id: 1, name: 'Download pagamenti Gennaio', status: 'Completato', data: '2024-03-15 14:30:00' },
        { id: 2, name: 'Invio dichiarazione Fuel Mix', status: 'In Corso', data: '2024-03-15 14:25:00' },
        { id: 3, name: 'Verifica status antimafia', status: 'Pianificato', data: '2024-03-16 09:00:00' }
      ]
    },
    terna: {
      icon: Activity,
      color: 'green',
      description: 'Rete di Trasmissione Nazionale - GAUDÌ e mercato elettrico',
      endpoints: [
        { name: 'GAUDÌ Portal', url: 'https://myterna.terna.it/gaudi', type: 'Web Portal' },
        { name: 'API Mercato', url: 'https://api.terna.it/v1/market', type: 'REST API' },
        { name: 'API Misure', url: 'https://api.terna.it/v1/measures', type: 'REST API' }
      ],
      autenticazione: 'Certificato Digitale / API Key',
      ultimiTask: [
        { id: 1, name: 'Sync dati mercato MGP', status: 'Completato', data: '2024-03-15 13:45:00' },
        { id: 2, name: 'Aggiornamento registry GAUDÌ', status: 'Completato', data: '2024-03-15 12:00:00' },
        { id: 3, name: 'Download prezzi zonali', status: 'Pianificato', data: '2024-03-15 18:00:00' }
      ]
    },
    dogane: {
      icon: FileText,
      color: 'yellow',
      description: 'Agenzia delle Dogane e dei Monopoli - Dichiarazioni e licenze',
      endpoints: [
        { name: 'PUDM Portal', url: 'https://pudm.adm.gov.it', type: 'Web Portal' },
        { name: 'Servizio Telematico', url: 'https://std.adm.gov.it', type: 'EDI S2S' },
        { name: 'Assistenza Online', url: 'https://assistenza.adm.gov.it', type: 'Web Portal' }
      ],
      autenticazione: 'SPID / CNS / CIE',
      ultimiTask: [
        { id: 1, name: 'Invio dichiarazione annuale', status: 'Errore', data: '2024-03-15 10:15:00' },
        { id: 2, name: 'Generazione file EDI', status: 'Errore', data: '2024-03-15 10:10:00' },
        { id: 3, name: 'Verifica formato Idoc', status: 'Errore', data: '2024-03-15 10:05:00' }
      ]
    },
    'e-distribuzione': {
      icon: Link2,
      color: 'purple',
      description: 'Distributore di rete - Connessioni e misure',
      endpoints: [
        { name: 'Portale Produttori', url: 'https://produttori.e-distribuzione.it', type: 'Web Portal' },
        { name: 'PEC Produttori', url: 'produttori@pec.e-distribuzione.it', type: 'PEC' },
        { name: 'Supporto Tecnico', url: 'https://support.e-distribuzione.it', type: 'Web Portal' }
      ],
      autenticazione: 'User+Password',
      ultimiTask: [
        { id: 1, name: 'Invio comunicazione fine lavori', status: 'Completato', data: '2024-03-14 18:00:00' },
        { id: 2, name: 'Download TICA', status: 'Sospeso', data: '2024-03-14 17:00:00' },
        { id: 3, name: 'Verifica status connessione', status: 'Sospeso', data: '2024-03-14 16:00:00' }
      ]
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connesso':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'Disconnesso':
        return <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case 'Errore':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'In Manutenzione':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connesso':
        return 'text-green-600 dark:text-green-400';
      case 'Disconnesso':
        return 'text-gray-600 dark:text-gray-400';
      case 'Errore':
        return 'text-red-600 dark:text-red-400';
      case 'In Manutenzione':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Completato':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Corso':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'Errore':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'Pianificato':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      case 'Sospeso':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Panoramica', icon: Link2 },
    { id: 'credentials', name: 'Credenziali', icon: Key },
    { id: 'rpa', name: 'Monitor RPA', icon: Bot },
    { id: 'pec', name: 'Gestione PEC', icon: Mail },
    { id: 'edi', name: 'EDI Generator', icon: Code }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'credentials':
        return <CredentialManager />;
      case 'rpa':
        return <RPAMonitorV2 />;
      case 'pec':
        return <PECManager />;
      case 'edi':
        return <EDIGenerator />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrazioni.map((integrazione) => {
          const details = integrationDetails[integrazione.id as keyof typeof integrationDetails];
          const Icon = details.icon;
          
          return (
            <div
              key={integrazione.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedIntegration(integrazione.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'p-3 rounded-lg',
                    details.color === 'blue' && 'bg-blue-100 dark:bg-blue-900',
                    details.color === 'green' && 'bg-green-100 dark:bg-green-900',
                    details.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900',
                    details.color === 'purple' && 'bg-purple-100 dark:bg-purple-900'
                  )}>
                    <Icon className={clsx(
                      'h-6 w-6',
                      details.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                      details.color === 'green' && 'text-green-600 dark:text-green-400',
                      details.color === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
                      details.color === 'purple' && 'text-purple-600 dark:text-purple-400'
                    )} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {integrazione.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {details.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(integrazione.status)}
                  <span className={clsx('text-sm font-medium', getStatusColor(integrazione.status))}>
                    {integrazione.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">type Connessione</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {integrazione.typeConnessione}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Ultima Sincronizzazione</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {new Date(integrazione.ultimaSincronizzazione).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Autenticazione</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {details.autenticazione}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                {integrazione.messaggiInCoda! > 0 && (
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm">
                      <span className="font-medium">{integrazione.messaggiInCoda}</span> in coda
                    </span>
                  </div>
                )}
                {integrazione.errori! > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm">
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {integrazione.errori} errori
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ultimi Task
                </p>
                <div className="space-y-2">
                  {details.ultimiTask.slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                        {task.name}
                      </span>
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium ml-2',
                        getTaskStatusColor(task.status)
                      )}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Test connection
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Test
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Configure integration
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configura
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Details Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Dettagli Integrazione {selectedIntegration.toUpperCase()}
                </h2>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {selectedIntegration && (
                <div className="space-y-6">
                  {/* Endpoints */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      Endpoints
                    </h3>
                    <div className="space-y-3">
                      {integrationDetails[selectedIntegration as keyof typeof integrationDetails].endpoints.map((endpoint, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {endpoint.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {endpoint.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded font-medium">
                              {endpoint.type}
                            </span>
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                              <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Tasks */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      Task Recenti
                    </h3>
                    <div className="space-y-3">
                      {integrationDetails[selectedIntegration as keyof typeof integrationDetails].ultimiTask.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {task.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(task.data).toLocaleString('it-IT')}
                            </p>
                          </div>
                          <span className={clsx(
                            'px-3 py-1 rounded text-sm font-medium',
                            getTaskStatusColor(task.status)
                          )}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Sincronizza Ora
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Esporta Log
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurazione Avanzata
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Gestione Integrazioni
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitora e gestisci le connessioni con i sistemi esterni
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sincronizza Tutto
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importa Config
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Integrations;