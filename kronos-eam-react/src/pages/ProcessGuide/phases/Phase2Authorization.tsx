import React, { useState } from 'react';
import {
  Building2, FileText, MapPin, AlertTriangle, Clock,
  CheckCircle, Download, ExternalLink, Shield, Home,
  Info, ChevronRight, Camera, FileCheck, AlertCircle,
  Users, Calendar, Gavel, TreePine, Mountain
} from 'lucide-react';
import clsx from 'clsx';

interface AuthorizationPath {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  complexity: 'low' | 'medium' | 'high';
  applicable: string;
}

const Phase2Authorization: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('pas');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const authorizationPaths: AuthorizationPath[] = [
    {
      id: 'pas',
      name: 'PAS - Procedura Abilitativa Semplificata',
      description: 'Per impianti fino a 200 kW su edifici esistenti',
      timeframe: '30 giorni',
      complexity: 'low',
      applicable: 'Residenziale e commerciale ≤ 200 kW'
    },
    {
      id: 'au',
      name: 'AU - Autorizzazione Unica',
      description: 'Per impianti > 200 kW o in aree vincolate',
      timeframe: '90-180 giorni',
      complexity: 'high',
      applicable: 'Grandi impianti o zone sensibili'
    },
    {
      id: 'cila',
      name: 'CILA - Comunicazione',
      description: 'Per piccoli impianti su tetto in edilizia libera',
      timeframe: 'Immediata',
      complexity: 'low',
      applicable: 'Micro impianti < 50 kW su tetto'
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
              Fase 2: Richiesta Autorizzazioni
            </h2>
            <p className="text-purple-700 dark:text-purple-300 mt-2">
              Ottenimento dei permessi necessari per l'installazione dell'impianto. 
              La procedura varia in base alla power, ubicazione e presenza di vincoli.
            </p>
          </div>
        </div>
      </div>

      {/* Authorization Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Seleziona il Tipo di Procedura
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {authorizationPaths.map((path) => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all text-left',
                selectedPath === path.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                  {path.name}
                </h4>
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  getComplexityColor(path.complexity)
                )}>
                  {path.complexity === 'low' ? 'Semplice' : path.complexity === 'medium' ? 'Media' : 'Complessa'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {path.description}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <Clock className="h-3 w-3" />
                  {path.timeframe}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <Home className="h-3 w-3" />
                  {path.applicable}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Path Details */}
      {selectedPath === 'pas' && (
        <div className="space-y-6">
          {/* PAS Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  PAS - Procedura Abilitativa Semplificata
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Introdotta dal D.Lgs. 28/2011 per velocizzare le autorizzazioni
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  Quando si applica
                </h4>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <li>• Impianti fino a 200 kW</li>
                  <li>• Edifici non vincolati</li>
                  <li>• Zone non soggette a vincoli paesaggistici</li>
                  <li>• Modifiche non sostanziali di impianti esistenti</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Quando NON si applica
                </h4>
                <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                  <li>• Centri storici (Zone A del PRG)</li>
                  <li>• Immobili vincolati (D.Lgs. 42/2004)</li>
                  <li>• Aree naturali protette</li>
                  <li>• Impianti a terra {'>'} 20 kW</li>
                </ul>
              </div>
            </div>

            {/* Key Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-2">Silenzio-Assenso dopo 30 giorni</p>
                  <p>
                    Decorsi 30 giorni dalla presentazione senza comunicazioni dal Comune, 
                    la PAS si intende accolta e si può procedere con i lavori.
                  </p>
                </div>
              </div>
            </div>

            {/* New 2025 Updates */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-2">Novità 2025 - D.Lgs. 190/2024</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Procedimenti iniziati dopo il 30/12/2024 seguono nuove disposizioni</li>
                    <li>• I lavori devono essere completati entro 3 anni dal perfezionamento</li>
                    <li>• Obbligo certificato di collaudo finale con conformità dell'opera</li>
                    <li>• Richiesta variazione catastale post-intervento obbligatoria</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Documenti Necessari per PAS
            </h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                  1. Documenti Amministrativi
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Modulo PAS compilato (disponibile su SUAP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Documento identità del richiedente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Titolo di proprietà o delega del proprietario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Visura catastale aggiornata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Marca da bollo da €16,00</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                  2. Elaborati Tecnici
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Relazione tecnica dettagliata dell'intervento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Elaborati grafici (planimetrie, sezioni, prospetti)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Schema elettrico unifilare</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Documentazione fotografica stato di fatto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Relazione di calcolo strutturale (se necessaria)</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                  3. Dichiarazioni e Asseverazioni
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Asseverazione del progettista sulla conformità urbanistica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Dichiarazione di non necessità VIA (se applicabile)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Dichiarazione rispetto normativa antisismica</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cost Information */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                Costi Amministrativi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Diritti di segreteria</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">€50-150</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Marca da bollo</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">€16,00</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Onorari tecnico</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">€800-1.500</p>
                </div>
              </div>
            </div>
          </div>

          {/* SUAP Portal Access */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Presentazione tramite SUAP
            </h3>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Dal 2025 obbligo telematico</p>
                  <p className="mt-1">
                    Tutte le pratiche PAS devono essere presentate esclusivamente 
                    in modalità telematica tramite il portale SUAP del comune.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href="https://www.impresainungiorno.gov.it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Portale Impresa in un Giorno
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Accesso unificato SUAP per tutti i comuni italiani
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </a>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Credenziali di Accesso
                  </h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• SPID (Sistema Pubblico Identità Digitale)</li>
                    <li>• CIE (Carta d'Identità Elettronica)</li>
                    <li>• CNS (Carta Nazionale Servizi)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Firma Digitale
                  </h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Obbligatoria per il tecnico</li>
                    <li>• Formato PAdES o CAdES</li>
                    <li>• Validità certificato attiva</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Special Cases */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Casi Particolari e Vincoli
            </h3>

            <div className="space-y-4">
              {/* Landscape Constraints */}
              <div 
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'landscape' ? null : 'landscape')}
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <Mountain className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      Vincoli Paesaggistici
                    </h4>
                  </div>
                  <ChevronRight className={clsx(
                    "h-5 w-5 text-gray-400 transition-transform",
                    expandedSection === 'landscape' && 'rotate-90'
                  )} />
                </div>
                {expandedSection === 'landscape' && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Per impianti in aree soggette a vincolo paesaggistico (art. 142 D.Lgs. 42/2004):
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <TreePine className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>
                          <strong>Autorizzazione Paesaggistica Semplificata</strong> - 
                          Per interventi di lieve entità (DPR 31/2017)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>Tempi: 60 giorni con silenzio-assenso (novità 2025)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Documentazione aggiuntiva: relazione paesaggistica semplificata, fotoinserimenti</span>
                      </li>
                    </ul>
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                        <strong>Esenzioni dal 2022 (L. 34/2022 e L. 41/2023):</strong>
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• Fotovoltaico su tetti piani non visibili da spazi pubblici</li>
                        <li>• Aree vincolate art. 142 D.Lgs 42/2004</li>
                        <li>• Aree art. 136 c.1 lett. a) e d) D.Lgs 42/2004</li>
                      </ul>
                    </div>
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Rimane obbligatoria per:</strong> Edifici vincolati art. 136 c.1 lett. b) e c) 
                        (complessi di cose immobili e bellezze panoramiche)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Historic Centers */}
              <div 
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'historic' ? null : 'historic')}
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      Centri Storici
                    </h4>
                  </div>
                  <ChevronRight className={clsx(
                    "h-5 w-5 text-gray-400 transition-transform",
                    expandedSection === 'historic' && 'rotate-90'
                  )} />
                </div>
                {expandedSection === 'historic' && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Per impianti in Zone A (centri storici) del PRG:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• PAS non applicabile - necessaria Autorizzazione Ordinaria</li>
                      <li>• Parere obbligatorio della Commissione Edilizia</li>
                      <li>• Possibili prescrizioni su colore moduli e sistemi di integrazione</li>
                      <li>• Tempi: 90-120 giorni</li>
                    </ul>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Suggerimento:</strong> Valutare soluzioni integrate come 
                        tegole fotovoltaiche o moduli colorati per maggiore compatibilità estetica.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Timeline Procedura PAS
            </h3>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-300 dark:bg-purple-700"></div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">G 0</span>
                  </div>
                  <div className="flex-1 pt-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      Presentazione PAS
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Invio telematico tramite SUAP con tutta la documentazione
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">G 1-30</span>
                  </div>
                  <div className="flex-1 pt-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      Istruttoria Comunale
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Il Comune può richiedere integrazioni entro 30 giorni
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 pt-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      Silenzio-Assenso
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Decorsi 30 giorni senza comunicazioni, si possono iniziare i lavori
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Templates */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Modelli e Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modello PAS Standard
                </span>
                <Download className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Relazione Tecnica Template
                </span>
                <Download className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Asseverazione Conformità
                </span>
                <Download className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Check-list Documenti PAS
                </span>
                <Download className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CILA Details */}
      {selectedPath === 'cila' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  CILA - Comunicazione di Inizio Lavori Asseverata
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Procedura semplificata per impianti in edilizia libera
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-2">Efficacia Immediata</p>
                  <p>
                    La CILA consente di iniziare i lavori immediatamente dopo la presentazione, 
                    senza attendere alcuna autorizzazione.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quando si applica la CILA
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Impianti fotovoltaici aderenti o integrati nei tetti</li>
                  <li>• Potenza nominale fino a 50 kW</li>
                  <li>• Superficie complessiva non superiore a quella del tetto</li>
                  <li>• Edifici non ricadenti in centri storici (Zone A)</li>
                  <li>• Assenza di vincoli paesaggistici o culturali</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Documenti Necessari
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Modulo CILA compilato e firmato</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Asseverazione del tecnico abilitato</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Elaborati progettuali essenziali</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Ricevuta pagamento diritti segreteria (€0-50)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AU Details */}
      {selectedPath === 'au' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Gavel className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  AU - Autorizzazione Unica
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Per grandi impianti o aree sensibili (D.Lgs. 387/2003)
                </p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  <p className="font-medium mb-2">Procedura Complessa</p>
                  <p>
                    L'AU richiede una Conferenza di Servizi con tutti gli enti coinvolti 
                    e tempi di autorizzazione fino a 180 giorni.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quando è necessaria l'AU
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Impianti fotovoltaici {'>'} 200 kW</li>
                  <li>• Impianti a terra in area agricola {'>'} 1 MW</li>
                  <li>• Installazioni in aree soggette a vincoli speciali</li>
                  <li>• Progetti che richiedono VIA (Valutazione Impatto Ambientale)</li>
                  <li>• Impianti con opere di connessione complesse</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Enti Coinvolti
                  </h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Regione/Provincia</li>
                    <li>• Comune</li>
                    <li>• ARPA</li>
                    <li>• Soprintendenza</li>
                    <li>• ASL</li>
                    <li>• Vigili del Fuoco</li>
                    <li>• Ente gestore rete</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Costi Indicativi
                  </h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Diritti istruttoria: €500-2000</li>
                    <li>• Onorari professionali: €5000-15000</li>
                    <li>• Eventuali studi ambientali: €3000-10000</li>
                    <li>• Fideiussione ripristino: variabile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          ← Fase 1: Valutazione
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          Procedi a Fase 3
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Phase2Authorization;