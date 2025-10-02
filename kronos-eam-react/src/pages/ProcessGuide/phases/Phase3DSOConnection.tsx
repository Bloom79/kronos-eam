import React, { useState } from 'react';
import {
  Plug, FileText, Euro, Clock, AlertCircle, Info,
  CheckCircle, Download, ExternalLink, Calculator, Zap,
  MapPin, Shield, ChevronRight, Building2, Calendar,
  CreditCard, FileCheck, Monitor, Smartphone, WifiOff
} from 'lucide-react';
import clsx from 'clsx';

interface ConnectionType {
  id: string;
  name: string;
  power: string;
  cost: string;
  timeline: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const Phase3DSOConnection: React.FC = () => {
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>('bassa-tensione');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'account', label: 'Account portale E-Distribuzione creato', completed: false },
    { id: 'project', label: 'Progetto definitivo impianto pronto', completed: false },
    { id: 'documents', label: 'Documenti identità e catastali raccolti', completed: false },
    { id: 'payment', label: 'Modalità pagamento TICA preparata', completed: false },
  ]);

  const connectionTypes: ConnectionType[] = [
    {
      id: 'bassa-tensione',
      name: 'Bassa Tensione',
      power: '≤ 100 kW',
      cost: '€100 + IVA',
      timeline: '20 giorni lavorativi',
      description: 'Connessione standard per impianti residenziali e piccole attività'
    },
    {
      id: 'media-tensione',
      name: 'Media Tensione',
      power: '> 100 kW',
      cost: '€2.500 + IVA',
      timeline: '45 giorni lavorativi',
      description: 'Per impianti commerciali e industriali di media taglia'
    }
  ];

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const completionPercentage = (completedItems / checklist.length) * 100;

  return (
    <div className="space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg self-start">
            <Plug className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-semibold text-green-900 dark:text-green-100">
              Fase 3: Richiesta Connessione DSO
            </h2>
            <p className="text-sm md:text-base text-green-700 dark:text-green-300 mt-2">
              Presentazione della domanda di connessione alla rete elettrica tramite il 
              Modello Unico. Il DSO (Distribution System Operator) valuterà la richiesta 
              e fornirà il preventivo TICA.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Tracker - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Preparazione Documenti
          </h3>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="space-y-3">
          {checklist.map(item => (
            <label 
              key={item.id}
              className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleChecklist(item.id)}
                className="mt-0.5 h-4 w-4 text-green-600 rounded"
              />
              <span className={clsx(
                "text-sm",
                item.completed 
                  ? "text-gray-600 dark:text-gray-400 line-through" 
                  : "text-gray-800 dark:text-gray-200"
              )}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Connection Type Selector - Mobile Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Tipo di Connessione
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectionTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedConnectionType(type.id)}
              className={clsx(
                'p-4 rounded-lg border-2 text-left transition-all',
                selectedConnectionType === type.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    {type.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.power}
                  </p>
                </div>
                <Zap className={clsx(
                  "h-5 w-5",
                  selectedConnectionType === type.id 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-400"
                )} />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {type.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Euro className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{type.cost}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{type.timeline}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* The Three Steps Process */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Processo in 3 Fasi
        </h3>
        
        {/* Step 1 */}
        <div className="space-y-6">
          <div 
            className="cursor-pointer"
            onClick={() => setExpandedSection(expandedSection === 'step1' ? null : 'step1')}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                <span className="font-bold text-green-600 dark:text-green-400">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Compilazione Modello Unico - Parte I
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Presentazione richiesta online su portale E-Distribuzione
                </p>
                {expandedSection === 'step1' && (
                  <div className="mt-4 space-y-4">
                    {/* Portal Access Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Accesso Portale E-Distribuzione
                      </h5>
                      <a href="https://www.e-distribuzione.it" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        www.e-distribuzione.it
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Credenziali richieste:</strong>
                        </p>
                        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 ml-4">
                          <li>• Registrazione con email valida</li>
                          <li>• Codice fiscale/P.IVA</li>
                          <li>• Numero cellulare per OTP</li>
                        </ul>
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Documenti Necessari:
                      </h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <FileCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Progetto definitivo impianto (PDF max 10MB)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Schema elettrico unifilare firmato
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Documento identità richiedente
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Visura catastale aggiornata
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Coordinate GPS punto di connessione
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Technical Data */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                        Dati Tecnici da Inserire:
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Potenza richiesta:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 ml-2">kW</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Tensione:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 ml-2">BT/MT</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">POD esistente:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 ml-2">IT001E...</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Uso:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 ml-2">Domestico/Altri usi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            className="cursor-pointer"
            onClick={() => setExpandedSection(expandedSection === 'step2' ? null : 'step2')}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                <span className="font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Ricezione e Valutazione TICA
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Preventivo tecnico-economico dal DSO entro 20 giorni
                </p>
                {expandedSection === 'step2' && (
                  <div className="mt-4 space-y-4">
                    {/* TICA Content */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Cosa contiene il TICA
                      </h5>
                      <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <li className="flex items-start gap-2">
                          <Calculator className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Costo di connessione:</strong> Corrispettivo per allaccio
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Punto di consegna:</strong> Ubicazione contatore
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Soluzione tecnica:</strong> Modalità di connessione
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Tempistiche:</strong> Date previste per i lavori
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 text-gray-800 dark:text-gray-200">Voce di Costo</th>
                            <th className="text-right py-2 text-gray-800 dark:text-gray-200">BT ≤6kW</th>
                            <th className="text-right py-2 text-gray-800 dark:text-gray-200">BT {'>'}6kW</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-gray-400">
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2">Quota distanza (€/m)</td>
                            <td className="text-right">€0</td>
                            <td className="text-right">€185/kW</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2">Quota potenza</td>
                            <td className="text-right">€27,59/kW</td>
                            <td className="text-right">€6,94/kW</td>
                          </tr>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2">Quota fissa</td>
                            <td className="text-right">€100</td>
                            <td className="text-right">€100</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800 dark:text-red-200">
                          <p className="font-medium mb-1">Scadenza Accettazione: 45 giorni</p>
                          <p>
                            Il preventivo TICA decade automaticamente se non accettato 
                            entro 45 giorni dalla data di ricevimento. Prestare attenzione 
                            alla scadenza per evitare di dover ripresentare la domanda.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            className="cursor-pointer"
            onClick={() => setExpandedSection(expandedSection === 'step3' ? null : 'step3')}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                <span className="font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Accettazione e Pagamento
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Conferma preventivo e versamento corrispettivo
                </p>
                {expandedSection === 'step3' && (
                  <div className="mt-4 space-y-4">
                    {/* Payment Methods */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-green-800 dark:text-green-200 mb-3">
                        Modalità di Pagamento
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">
                              Bonifico Bancario
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              IBAN fornito nel preventivo TICA<br />
                              Causale: "Codice TICA - Nome richiedente"
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">
                              Bollettino Postale
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              C/C postale indicato nel TICA
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* After Acceptance */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Dopo l'Accettazione
                      </h5>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li>• E-Distribuzione programma i lavori di connessione</li>
                        <li>• Riceverai comunicazione con date intervento</li>
                        <li>• Preparare documentazione per Modello Unico Parte II</li>
                        <li>• Il contatore sarà installato dopo il collaudo impianto</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips and Common Issues */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Suggerimenti e Problemi Comuni
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
              Consigli Utili
            </h4>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Verifica sempre la potenza disponibile sul POD esistente</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Considera un margine del 10% sulla potenza richiesta</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Salva sempre la ricevuta di invio del Modello Unico</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Monitora la PEC per comunicazioni urgenti</span>
              </li>
            </ul>
          </div>

          {/* Common Issues */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3">
              Problemi Frequenti
            </h4>
            <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Errore upload:</strong> Ridurre dimensione PDF a max 10MB
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>TICA elevato:</strong> Valutare connessione trifase vs monofase
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Ritardi:</strong> Contattare numero verde 803 500
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Connection Simulator */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulatore Costi Connessione
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Potenza Impianto (kW)
            </label>
            <input 
              type="number" 
              placeholder="es. 6"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Distanza dalla rete (m)
            </label>
            <input 
              type="number" 
              placeholder="es. 50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Calcola Costo Indicativo
        </button>
      </div>

      {/* Offline Support Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Supporto Offline
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Questa guida è disponibile offline. I link esterni richiedono connessione internet.
              Salva i modelli scaricati per l'uso offline.
            </p>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Modelli e Risorse
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Guida Modello Unico PDF
              </span>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Excel Calcolo Costi
              </span>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <button className="w-full sm:w-auto px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors order-2 sm:order-1">
          ← Fase 2: Autorizzazioni
        </button>
        <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 order-1 sm:order-2">
          Procedi a Fase 4
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Phase3DSOConnection;