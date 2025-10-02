import React, { useState } from 'react';
import {
  Wrench, HardHat, Shield, Clock, AlertCircle, Info,
  CheckCircle, Download, Camera, ThermometerSun, Zap,
  Ruler, Users, FileText, ChevronRight, AlertTriangle,
  Package, Truck, Calendar, Settings, Activity, WifiOff
} from 'lucide-react';
import clsx from 'clsx';

interface SafetyCheckItem {
  id: string;
  label: string;
  category: 'ppe' | 'site' | 'equipment';
  required: boolean;
  checked: boolean;
}

interface InstallationPhase {
  id: string;
  name: string;
  duration: string;
  description: string;
  icon: any;
  tasks: string[];
}

const Phase4Installation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preparation' | 'installation' | 'safety' | 'quality'>('preparation');
  const [safetyChecklist, setSafetyChecklist] = useState<SafetyCheckItem[]>([
    // PPE
    { id: 'helmet', label: 'Casco protettivo EN 397', category: 'ppe', required: true, checked: false },
    { id: 'shoes', label: 'Scarpe antinfortunistiche S3', category: 'ppe', required: true, checked: false },
    { id: 'harness', label: 'Imbracatura anticaduta EN 361', category: 'ppe', required: true, checked: false },
    { id: 'gloves', label: 'Guanti da lavoro EN 388', category: 'ppe', required: true, checked: false },
    { id: 'glasses', label: 'Occhiali protettivi', category: 'ppe', required: false, checked: false },
    // Site Safety
    { id: 'scaffolding', label: 'Ponteggio certificato', category: 'site', required: true, checked: false },
    { id: 'barriers', label: 'Delimitazione area cantiere', category: 'site', required: true, checked: false },
    { id: 'signage', label: 'Cartellonistica sicurezza', category: 'site', required: true, checked: false },
    { id: 'firstaid', label: 'Kit pronto soccorso', category: 'site', required: true, checked: false },
    // Equipment
    { id: 'ladder', label: 'Scale a norma EN 131', category: 'equipment', required: false, checked: false },
    { id: 'lifeline', label: 'Linea vita temporanea', category: 'equipment', required: true, checked: false },
    { id: 'tools', label: 'Utensili isolati 1000V', category: 'equipment', required: true, checked: false },
  ]);

  const installationPhases: InstallationPhase[] = [
    {
      id: 'structure',
      name: 'Montaggio Strutture',
      duration: '1-2 giorni',
      description: 'Installazione supporti e ancoraggi',
      icon: Settings,
      tasks: [
        'Verifica solidità superficie di appoggio',
        'Tracciamento punti di fissaggio',
        'Foratura e inserimento tasselli chimici',
        'Montaggio profili di supporto',
        'Verifica planarità e allineamento',
        'Serraggio bulloneria con chiave dinamometrica'
      ]
    },
    {
      id: 'modules',
      name: 'Posa Moduli FV',
      duration: '1-2 giorni',
      description: 'Installazione pannelli fotovoltaici',
      icon: Package,
      tasks: [
        'Trasporto moduli in copertura',
        'Controllo integrità moduli (no microcracks)',
        'Posizionamento su struttura',
        'Fissaggio con morsetti specifici',
        'Rispetto distanze di sicurezza',
        'Verifica orientamento e inclinazione'
      ]
    },
    {
      id: 'electrical',
      name: 'Collegamenti Elettrici',
      duration: '1 giorno',
      description: 'Cablaggio DC/AC e protezioni',
      icon: Zap,
      tasks: [
        'Cablaggio stringhe in serie',
        'Installazione connettori MC4',
        'Posa cavi solari DC (min 4mm²)',
        'Installazione quadro di campo DC',
        'Collegamenti equipotenziali',
        'Test isolamento cavi (>1MΩ)'
      ]
    },
    {
      id: 'inverter',
      name: 'Installazione Inverter',
      duration: '0.5 giorni',
      description: 'Montaggio e configurazione inverter',
      icon: Activity,
      tasks: [
        'Fissaggio a parete (carico >4x peso)',
        'Collegamento stringhe DC',
        'Cablaggio lato AC',
        'Installazione SPD Type 1+2',
        'Configurazione parametri rete',
        'Test messa in servizio'
      ]
    }
  ];

  const toggleSafetyItem = (id: string) => {
    setSafetyChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const safetyProgress = {
    total: safetyChecklist.filter(item => item.required).length,
    checked: safetyChecklist.filter(item => item.required && item.checked).length
  };

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg self-start">
            <Wrench className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-semibold text-orange-900 dark:text-orange-100">
              Fase 4: Installazione Impianto
            </h2>
            <p className="text-sm md:text-base text-orange-700 dark:text-orange-300 mt-2">
              Installazione fisica dell'impianto fotovoltaico seguendo le norme CEI 
              e le best practice di sicurezza. Durata media: 3-5 giorni per impianto residenziale.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Alert */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-1">
              Sicurezza Prima di Tutto
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              L'installazione deve essere eseguita esclusivamente da personale qualificato 
              con patentino FER (Fonti Energie Rinnovabili) e formazione sulla sicurezza 
              in quota secondo D.Lgs. 81/08.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Scrollable */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <nav className="flex min-w-full" aria-label="Tabs">
              {[
                { id: 'preparation', label: 'Preparazione', icon: Package },
                { id: 'installation', label: 'Installazione', icon: Wrench },
                { id: 'safety', label: 'Sicurezza', icon: Shield },
                { id: 'quality', label: 'Qualità', icon: CheckCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'flex-1 min-w-[120px] px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2',
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Preparation Tab */}
          {activeTab === 'preparation' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Preparazione Cantiere
                </h3>
                
                {/* Material Delivery */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Consegna e Verifica Materiali
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Controlli in Accettazione:
                      </p>
                      <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Corrispondenza DDT con ordine (modelli, quantità)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Integrità imballi (no danni da trasporto)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Etichette moduli FV (power, certificazioni)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Foto materiale per assicurazione</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        <strong>Tip:</strong> Conservare i moduli in luogo asciutto, 
                        mai appoggiarli sul lato vetro. Temperatura storage: -40°C/+85°C
                      </p>
                    </div>
                  </div>
                </div>

                {/* Site Preparation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Preparazione Tetto
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Pulizia superficie di posa</li>
                      <li>• Verifica integrità guaina/tegole</li>
                      <li>• Identificazione travetti portanti</li>
                      <li>• Marcatura punti ancoraggio</li>
                      <li>• Predisposizione passacavi</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Attrezzature Necessarie
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Trapano SDS con punte Ø10-12mm</li>
                      <li>• Avvitatore con coppia regolabile</li>
                      <li>• Flex per tagli profili</li>
                      <li>• Cercafase e multimetro</li>
                      <li>• Crimpatrice MC4</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Installation Tab */}
          {activeTab === 'installation' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Fasi di Installazione
              </h3>
              
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-orange-300 dark:bg-orange-700"></div>
                
                {installationPhases.map((phase, index) => (
                  <div key={phase.id} className="relative flex gap-4 mb-6">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <phase.icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-800 dark:text-gray-100">
                            {phase.name}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {phase.duration}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {phase.description}
                        </p>
                        
                        {/* Task Checklist */}
                        <div className="space-y-1">
                          {phase.tasks.map((task, taskIndex) => (
                            <label 
                              key={taskIndex}
                              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              <input type="checkbox" className="mt-0.5 h-4 w-4 text-orange-600 rounded" />
                              <span>{task}</span>
                            </label>
                          ))}
                        </div>
                        
                        {/* Phase-specific warnings */}
                        {phase.id === 'electrical' && (
                          <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>
                                Attenzione: Lavorare sempre in assenza di tensione. 
                                Utilizzare tester per verificare assenza tensione prima di operare.
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weather Considerations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <ThermometerSun className="h-5 w-5" />
                  Condizioni Meteo per Installazione
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400">Temperatura</p>
                    <p className="font-medium text-blue-800 dark:text-blue-200">5°C - 35°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400">Vento</p>
                    <p className="font-medium text-blue-800 dark:text-blue-200">{'<'} 60 km/h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400">Pioggia</p>
                    <p className="font-medium text-blue-800 dark:text-blue-200">NO</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400">Nebbia</p>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Visibilità {'>'} 50m</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safety Tab */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Checklist Sicurezza
                </h3>
                <div className="text-sm">
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {safetyProgress.checked}/{safetyProgress.total}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500 ml-1">
                    obbligatori
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(safetyProgress.checked / safetyProgress.total) * 100}%` }}
                />
              </div>

              {/* Safety Categories */}
              <div className="space-y-4">
                {/* PPE Section */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                    <HardHat className="h-5 w-5" />
                    DPI - Dispositivi Protezione Individuale
                  </h4>
                  <div className="space-y-2">
                    {safetyChecklist.filter(item => item.category === 'ppe').map(item => (
                      <label 
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleSafetyItem(item.id)}
                          className="h-4 w-4 text-yellow-600 rounded"
                        />
                        <span className={clsx(
                          "text-sm",
                          item.checked 
                            ? "text-yellow-700 dark:text-yellow-300 line-through" 
                            : "text-yellow-800 dark:text-yellow-200"
                        )}>
                          {item.label}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Site Safety */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Sicurezza Cantiere
                  </h4>
                  <div className="space-y-2">
                    {safetyChecklist.filter(item => item.category === 'site').map(item => (
                      <label 
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleSafetyItem(item.id)}
                          className="h-4 w-4 text-green-600 rounded"
                        />
                        <span className={clsx(
                          "text-sm",
                          item.checked 
                            ? "text-green-700 dark:text-green-300 line-through" 
                            : "text-green-800 dark:text-green-200"
                        )}>
                          {item.label}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Attrezzature Sicurezza
                  </h4>
                  <div className="space-y-2">
                    {safetyChecklist.filter(item => item.category === 'equipment').map(item => (
                      <label 
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleSafetyItem(item.id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className={clsx(
                          "text-sm",
                          item.checked 
                            ? "text-blue-700 dark:text-blue-300 line-through" 
                            : "text-blue-800 dark:text-blue-200"
                        )}>
                          {item.label}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">
                  Numeri Emergenza
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-red-600 dark:text-red-400">Emergenza</p>
                    <p className="font-bold text-red-800 dark:text-red-200">112</p>
                  </div>
                  <div>
                    <p className="text-red-600 dark:text-red-400">Vigili Fuoco</p>
                    <p className="font-bold text-red-800 dark:text-red-200">115</p>
                  </div>
                  <div>
                    <p className="text-red-600 dark:text-red-400">Pronto Soccorso</p>
                    <p className="font-bold text-red-800 dark:text-red-200">118</p>
                  </div>
                  <div>
                    <p className="text-red-600 dark:text-red-400">Centro Antiveleni</p>
                    <p className="font-bold text-red-800 dark:text-red-200">02-66101029</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quality Tab */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Controlli Qualità
              </h3>

              {/* Quality Standards */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">
                  Standard di Riferimento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Normative CEI
                    </p>
                    <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
                      <li>• CEI 0-21: Connessione alla rete BT</li>
                      <li>• CEI 64-8: Impianti elettrici</li>
                      <li>• CEI 82-25: Guida impianti FV</li>
                      <li>• CEI EN 62446: Collaudo impianti</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Tolleranze Accettabili
                    </p>
                    <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
                      <li>• Inclinazione moduli: ±2°</li>
                      <li>• Allineamento: ±5mm/m</li>
                      <li>• Coppia serraggio: ±10%</li>
                      <li>• Resistenza terra: {'<'}10Ω</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Inspection Points */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Punti di Ispezione
                </h4>
                
                {/* Mechanical Checks */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Verifiche Meccaniche
                  </h5>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Ancoraggio strutture (pull test {'>'}2kN)
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Serraggio morsetti moduli (8-12 Nm)
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Integrità guaina impermeabilizzante
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Passacavi sigillati (IP65)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Electrical Tests */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Test Elettrici
                  </h5>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Continuità conduttori protezione
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Resistenza isolamento DC ({'>'}1MΩ)
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Polarità stringhe (Voc)
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Test differenziale (30mA)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo Documentation */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Documentazione Fotografica Richiesta
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Vista generale impianto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Dettaglio ancoraggi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Quadri elettrici aperti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Targhette moduli/inverter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Connessioni MC4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Messa a terra</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Note Importanti per l'Installatore</p>
            <ul className="space-y-1 ml-4">
              <li>• Conservare schede tecniche e manuali per la consegna al cliente</li>
              <li>• Registrare numeri di serie moduli per garanzia produttore</li>
              <li>• Compilare registro di cantiere con ore lavorate e personale</li>
              <li>• Preparare layout as-built per DiCo e documentazione finale</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Offline Support */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Checklist Offline
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Tutte le checklist di sicurezza e qualità sono disponibili offline. 
              I dati vengono salvati localmente e sincronizzati quando torni online.
            </p>
          </div>
        </div>
      </div>

      {/* Downloads */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Modelli e Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Checklist Sicurezza Cantiere
              </span>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Modulo Valutazione Rischi
              </span>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rapporto Controllo Qualità
              </span>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cronoprogramma Lavori
              </span>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <button className="w-full sm:w-auto px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors order-2 sm:order-1">
          ← Fase 3: Connessione DSO
        </button>
        <button className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 order-1 sm:order-2">
          Procedi a Fase 5
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Phase4Installation;