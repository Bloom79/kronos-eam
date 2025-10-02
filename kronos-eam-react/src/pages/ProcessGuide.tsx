import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Sun, FileText, Building2, Plug, Wrench, CheckSquare,
  Zap, Database, Euro, FileCheck, Calendar, AlertCircle,
  Search, ChevronRight, Download, ExternalLink, Clock,
  Info, BookOpen, HelpCircle, Phone, Mail, MapPin, Menu, X,
  Calculator, TrendingUp, Users, Shield, Lightbulb
} from 'lucide-react';
import clsx from 'clsx';

// Lazy load phase components
const Phase1Evaluation = lazy(() => import('./ProcessGuide/phases/Phase1Evaluation'));
const Phase2Authorization = lazy(() => import('./ProcessGuide/phases/Phase2Authorization'));
const Phase3DSOConnection = lazy(() => import('./ProcessGuide/phases/Phase3DSOConnection'));
const Phase4Installation = lazy(() => import('./ProcessGuide/phases/Phase4Installation'));

interface Phase {
  id: string;
  number: number;
  name: string;
  description: string;
  duration: string;
  entity: string;
  icon: any;
  color: string;
  requiredPower?: string;
}

const phases: Phase[] = [
  {
    id: 'evaluation-design',
    number: 1,
    name: 'Valutazione e Progettazione',
    description: 'Studio di fattibilità e progettazione tecnica dell\'impianto',
    duration: '15 giorni',
    entity: 'Progettista',
    icon: Sun,
    color: 'blue'
  },
  {
    id: 'authorization',
    number: 2,
    name: 'Richiesta Autorizzazioni',
    description: 'Ottenimento permessi comunali e autorizzazioni necessarie',
    duration: '30 giorni',
    entity: 'Comune/SUAP',
    icon: Building2,
    color: 'purple'
  },
  {
    id: 'dso-connection',
    number: 3,
    name: 'Richiesta Connessione DSO',
    description: 'Presentazione domanda di connessione alla rete elettrica',
    duration: '20 giorni',
    entity: 'E-Distribuzione',
    icon: Plug,
    color: 'green'
  },
  {
    id: 'installation',
    number: 4,
    name: 'Installazione Impianto',
    description: 'Installazione fisica dei componenti fotovoltaici',
    duration: '5 giorni',
    entity: 'Installatore',
    icon: Wrench,
    color: 'orange'
  },
  {
    id: 'testing',
    number: 5,
    name: 'Collaudo e Dichiarazione Conformità',
    description: 'Verifiche tecniche e rilascio DiCo DM 37/08',
    duration: '3 giorni',
    entity: 'Installatore',
    icon: CheckSquare,
    color: 'teal'
  },
  {
    id: 'activation',
    number: 6,
    name: 'Attivazione Connessione DSO',
    description: 'Installazione contatore e attivazione produzione',
    duration: '10 giorni',
    entity: 'E-Distribuzione',
    icon: Zap,
    color: 'yellow'
  },
  {
    id: 'terna-registration',
    number: 7,
    name: 'Registrazione GAUDÌ Terna',
    description: 'Censimento impianto nel sistema nazionale',
    duration: '5 giorni',
    entity: 'Terna',
    icon: Database,
    color: 'indigo'
  },
  {
    id: 'gse-activation',
    number: 8,
    name: 'Attivazione Servizi GSE',
    description: 'Attivazione contratto per remunerazione energia',
    duration: '60 giorni',
    entity: 'GSE',
    icon: Euro,
    color: 'green'
  },
  {
    id: 'customs',
    number: 9,
    name: 'Denuncia Officina Elettrica',
    description: 'Dichiarazione per impianti superiori a 20 kW',
    duration: '15 giorni',
    entity: 'Agenzia Dogane',
    icon: FileCheck,
    color: 'red',
    requiredPower: '> 20 kW'
  }
];

const ProcessGuide: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<string>('evaluation-design');
  const [searchTerm, setSearchTerm] = useState('');
  const [showComplianceCalendar, setShowComplianceCalendar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-700'
      },
      teal: {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-700 dark:text-teal-400',
        border: 'border-teal-300 dark:border-teal-700'
      },
      yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-300 dark:border-indigo-700'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const calculateTotalDuration = () => {
    const totalDays = phases.reduce((sum, phase) => {
      const days = parseInt(phase.duration.split(' ')[0]);
      return sum + days;
    }, 0);
    return totalDays;
  };

  const renderPhaseContent = () => {
    const phase = phases.find(p => p.id === selectedPhase);
    if (!phase) return null;

    // Render specific phase components
    switch (phase.id) {
      case 'evaluation-design':
        return (
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          }>
            <Phase1Evaluation />
          </Suspense>
        );
      
      case 'authorization':
        return (
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          }>
            <Phase2Authorization />
          </Suspense>
        );
      
      case 'dso-connection':
        return (
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          }>
            <Phase3DSOConnection />
          </Suspense>
        );
      
      case 'installation':
        return (
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          }>
            <Phase4Installation />
          </Suspense>
        );
      
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className={clsx('inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium', getColorClasses(phase.color).bg, getColorClasses(phase.color).text)}>
                <phase.icon className="h-4 w-4" />
                Fase {phase.number}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-3">
                {phase.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {phase.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Durata Stimata</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {phase.duration}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Ente Responsabile</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {phase.entity}
                </p>
              </div>
              {phase.requiredPower && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Potenza Richiesta</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {phase.requiredPower}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Contenuto dettagliato in fase di implementazione
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    La guida completa per questa fase sarà disponibile a breve con tutti i dettagli, 
                    documenti necessari, link ai portali e procedure step-by-step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                Guida Completa Processo Fotovoltaico
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                Dalla progettazione alla manutenzione: tutto il percorso burocratico italiano
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setShowComplianceCalendar(!showComplianceCalendar)}
                className={clsx(
                  'px-3 md:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm md:text-base',
                  showComplianceCalendar
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Scadenze</span>
              </button>
              <button className="px-3 md:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm md:text-base">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Esporta PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Menu className="h-5 w-5" />
          Navigazione Fasi
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation - Mobile Collapsible */}
          <div className={clsx(
            "lg:col-span-1 lg:block",
            mobileMenuOpen ? "block" : "hidden lg:block"
          )}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:sticky lg:top-4">
              {/* Mobile Close Button */}
              <div className="flex lg:hidden items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Fasi del Processo</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cerca procedura..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {phases.map((phase) => {
                  const colors = getColorClasses(phase.color);
                  return (
                    <button
                      key={phase.id}
                      onClick={() => {
                        setSelectedPhase(phase.id);
                        setMobileMenuOpen(false);
                      }}
                      className={clsx(
                        'w-full text-left p-3 rounded-lg transition-all',
                        selectedPhase === phase.id
                          ? `${colors.bg} ${colors.border} border-2`
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          'p-2 rounded-lg',
                          selectedPhase === phase.id ? colors.bg : 'bg-gray-100 dark:bg-gray-700'
                        )}>
                          <phase.icon className={clsx(
                            'h-4 w-4',
                            selectedPhase === phase.id ? colors.text : 'text-gray-600 dark:text-gray-400'
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              'text-xs font-medium',
                              selectedPhase === phase.id ? colors.text : 'text-gray-500 dark:text-gray-500'
                            )}>
                              Fase {phase.number}
                            </span>
                            {phase.requiredPower && (
                              <span className="text-xs text-orange-600 dark:text-orange-400">
                                {phase.requiredPower}
                              </span>
                            )}
                          </div>
                          <h3 className={clsx(
                            'font-medium text-sm mt-0.5',
                            selectedPhase === phase.id
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-700 dark:text-gray-300'
                          )}>
                            {phase.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {phase.duration} • {phase.entity}
                          </p>
                        </div>
                        {selectedPhase === phase.id && (
                          <ChevronRight className={clsx('h-4 w-4 mt-1', colors.text)} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Durata Totale Stimata
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateTotalDuration()} giorni
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    (~{Math.round(calculateTotalDuration() / 30)} mesi)
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      FAQ & Supporto
                    </span>
                  </div>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contatti Utili
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderPhaseContent()}

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Portali Principali
                </h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Distribuzione</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GAUDÌ Terna</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GSE Area Clienti</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SUAP Impresa in un Giorno</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documenti Essenziali
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modello Unico Semplificato</span>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DiCo DM 37/08</span>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modello AD-1 Dogane</span>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schema Unifilare Template</span>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Compliance Calendar (shown when toggled) */}
            {showComplianceCalendar && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scadenze e Adempimenti Ricorrenti
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">
                        Dichiarazione Annuale Consumi
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Agenzia delle Dogane - Impianti &gt; 20 kW
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-800 dark:text-red-200">31 Marzo</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Ogni anno</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">
                        Pagamento Diritti Licenza UTF
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Agenzia delle Dogane - F24
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-800 dark:text-orange-200">16 Dicembre</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Ogni anno</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Taratura Periodica Contatori
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Camera di Commercio competente
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-800 dark:text-blue-200">Ogni 3 anni</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Da installazione</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Tools Section */}
            <div className="mt-8 space-y-6">
              {/* Cost Estimator */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcolatore Costi Rapido
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Potenza Impianto (kW)
                    </label>
                    <input
                      type="number"
                      value="6"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo Installazione
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="residential">Residenziale</option>
                      <option value="commercial">Commerciale</option>
                    </select>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Materiali (moduli, inverter, strutture)</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">€4.200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Manodopera installazione</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">€1.800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pratiche burocratiche</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">€800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Connessione rete (TICA)</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">€265</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-800 dark:text-gray-100">Totale (IVA 10% inclusa)</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">€7.765</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Con detrazione 50%:</strong> Recupero €3.882 in 10 anni
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      ROI stimato: 4-5 anni con risparmio bolletta €1.200/anno
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Timeline Processo Completo
                </h3>
                
                <div className="relative overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Timeline Bar */}
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
                      {phases.map((phase, index) => {
                        const percentage = ((index + 1) / phases.length) * 100;
                        const isCompleted = phases.findIndex(p => p.id === selectedPhase) >= index;
                        return (
                          <div
                            key={phase.id}
                            className={clsx(
                              "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2",
                              isCompleted
                                ? "bg-green-500 border-green-600"
                                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            )}
                            style={{ left: `${percentage - 5}%` }}
                          >
                            {isCompleted && (
                              <CheckSquare className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                            {/* Phase Label */}
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                F{phase.number}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {phase.duration}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg shadow-sm p-4 md:p-6 border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Consigli degli Esperti
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                          Timing Ottimale
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Inizia il processo a febbraio-marzo per essere operativo in estate quando la produzione è massima.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                          Assicurazione
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Attiva subito una polizza all-risk. Costa ~€100/anno e copre danni da eventi atmosferici.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                          Scelta Installatore
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Verifica sempre: patentino FER, certificazione F-GAS, e referenze di almeno 50 impianti.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                          Monitoraggio
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Installa sempre un sistema di monitoraggio. Ti avvisa subito di guasti risparmiando perdite di produzione.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frequent Mistakes */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm p-4 md:p-6 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Errori Frequenti da Evitare
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Sottodimensionare l'impianto per risparmiare</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Non verificare i vincoli paesaggistici prima</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Dimenticare la denuncia UTF per impianti {'>'} 20kW</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Pagare tutto prima del collaudo finale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Non conservare le fatture per la detrazione</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Installare senza verifica strutturale tetto</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessGuide;