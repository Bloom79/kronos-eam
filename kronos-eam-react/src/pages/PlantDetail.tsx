import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Activity,
  FileText,
  Shield,
  AlertCircle,
  TrendingUp,
  Calendar,
  Download,
  Edit,
  MoreVertical
} from 'lucide-react';
import { Plant } from '../services/api';
import DSOTab from './ImpiantoDetail/DSOTab';
import TernaTab from './ImpiantoDetail/TernaTab';
import GSETab from './ImpiantoDetail/GSETab';
import DoganeTab from './ImpiantoDetail/DoganeTab';
import WorkflowsTab from './ImpiantoDetail/WorkflowsTab';
import ComplianceTab from './ImpiantoDetail/ComplianceTab';
import clsx from 'clsx';

const PlantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app would fetch based on ID
  // Mock performance data
  const performanceData = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
    attesa: [120, 140, 160, 180, 200, 210],
    effettiva: [115, 138, 155, 175, 195, 205],
    pr: 98.1
  };

  // Mock maintenance data
  const maintenanceData = [
    { id: 1, data: '15/01/2024', tipo: 'Ordinaria', desc: 'Pulizia moduli', status: 'Completato', costo: '€2,500' },
    { id: 2, data: '20/03/2024', tipo: 'Straordinaria', desc: 'Sostituzione inverter #3', status: 'Pianificato', costo: '€8,000' }
  ];

  const plant: Plant = {
    id: Number(id),
    name: 'FV Solare Verdi S.p.A.',
    code: 'FV-BR-001',
    power: '1.2 MWp',
    power_kw: 1200,
    status: 'In Operation' as const,
    type: 'Photovoltaic' as const,
    location: 'Brindisi (BR)',
    municipality: 'Brindisi',
    province: 'BR',
    region: 'Puglia',
    next_deadline: new Date('2025-12-16').toISOString(),
    deadline_color: 'text-red-600',
    gse_integration: true,
    terna_integration: true,
    customs_integration: true,
    dso_integration: true,
    registry: {
      pod: 'IT001E12345678',
      gaudi: 'IM_A123B456',
      data_esercizio: '22/05/2022',
      regime: 'Ritiro Dedicato',
      responsabile: 'Mario Rossi',
      assicurazione: 'Polizza #123-ALL-RISK',
      numero_moduli: 3000,
      numero_inverter: 10,
      superficie_occupata: 24000
    },
    checklist: {
      dso_connection: true,
      terna_registration: true,
      gse_activation: true,
      customs_license: true,
      spi_verification: false,
      consumption_declaration: true,
      compliance_score: 83
    }
  };

  const tabs = [
    { id: 'overview', name: 'Panoramica', icon: Building2 },
    { id: 'compliance', name: 'Conformità', icon: Shield },
    { id: 'workflows', name: 'Workflow', icon: Activity },
    { id: 'dso', name: 'DSO', icon: Activity },
    { id: 'terna', name: 'Terna', icon: Shield },
    { id: 'gse', name: 'GSE', icon: TrendingUp },
    { id: 'dogane', name: 'Dogane', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'compliance':
        return <ComplianceTab plant={plant} />;
      case 'workflows':
        return <WorkflowsTab plantId={plant.id} />;
      case 'dso':
        return <DSOTab plant={plant} />;
      case 'terna':
        return <TernaTab plant={plant} />;
      case 'gse':
        return <GSETab plant={plant} />;
      case 'dogane':
        return <DoganeTab plant={plant} />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Produzione Annua</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">1,825 MWh</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+5.2% YoY</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Performance Ratio</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{performanceData.pr}%</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Ottimo</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Disponibilità</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">98.5%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ultimo mese</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ricavi Annui</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">€182,500</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+3.1% YoY</p>
        </div>
      </div>

      {/* registry Dettagliata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Dati Tecnici dell'plant
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type plant</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Potenza Nominale</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.power_kw || 0} kWp</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Superficie Occupata</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.registry?.superficie_occupata || 0} m²</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Numero Moduli</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.registry?.numero_moduli || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Numero Inverter</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.registry?.numero_inverter || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Esercizio</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.registry?.data_esercizio || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Checklist Conformità */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Checklist Conformità
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(plant.checklist || {}).map(([key, value]) => {
            const labels: Record<string, string> = {
              connessione_dso: 'Connessione DSO',
              registrazione_terna: 'Registrazione Terna',
              attivazione_gse: 'Attivazione GSE',
              licenza_dogane: 'Licenza Dogane',
              verifica_spi: 'Verifica SPI',
              dichiarazione_consumo: 'Dichiarazione Consumo',
              antimafia: 'Dichiarazione Antimafia',
              fuel_mix: 'Comunicazione Fuel Mix'
            };
            
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={clsx(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  value ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                )}>
                  {value ? (
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 text-xs">✗</span>
                  )}
                </div>
                <span className={clsx(
                  'text-sm',
                  value ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400 font-medium'
                )}>
                  {labels[key] || key}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prossime Scadenze */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Prossime Scadenze
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Pagamento Diritto Licenza Dogane</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Scadenza annuale</p>
              </div>
            </div>
            <span className="text-red-600 dark:text-red-400 font-semibold">16/12/2025</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Verifica SPI</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verifica quinquennale</p>
              </div>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">22/05/2027</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/plants"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{plant.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {plant.location} • {plant.power} • POD: {plant.registry?.pod || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Esporta</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Edit className="h-5 w-5" />
              <span className="hidden sm:inline">Modifica</span>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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

export default PlantDetail;