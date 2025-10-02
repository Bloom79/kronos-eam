import React, { useState } from 'react';
import {
  Sun, Calculator, FileText, TrendingUp, AlertCircle, 
  CheckCircle, Download, ExternalLink, MapPin, Home,
  Zap, Euro, Clock, Info, ChevronRight, Users,
  Ruler, Camera, BarChart3, FileCheck
} from 'lucide-react';
import clsx from 'clsx';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
}

const Phase1Evaluation: React.FC = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 'energy-bills',
      label: 'Raccolta bollette ultimi 12 mesi',
      description: 'Necessarie per calcolo fabbisogno energetico',
      completed: false
    },
    {
      id: 'building-plans',
      label: 'Planimetria edificio e copertura',
      description: 'Per valutazione superficie disponibile',
      completed: false
    },
    {
      id: 'roof-photos',
      label: 'Foto dettagliate della copertura',
      description: 'Per analisi ombreggiamenti e orientamento',
      completed: false
    },
    {
      id: 'electrical-panel',
      label: 'Foto quadro elettrico esistente',
      description: 'Per valutazione integrazione impianto',
      completed: false
    },
    {
      id: 'cadastral-data',
      label: 'Dati catastali immobile',
      description: 'Foglio, particella, subalterno',
      completed: false
    }
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Sun className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Fase 1: Valutazione e Progettazione
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mt-2">
              La fase iniziale è cruciale per determinare la fattibilità tecnico-economica 
              dell'impianto fotovoltaico. Include l'analisi dei consumi, il sopralluogo 
              tecnico e la progettazione preliminare.
            </p>
          </div>
        </div>
      </div>

      {/* Key Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Energy Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                1. Analisi Fabbisogno Energetico
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Durata: 3 giorni • Responsabile: Energy Manager
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calcolo del Consumo Annuo
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Formula base per il dimensionamento:
                </p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm">
                  Potenza impianto (kWp) = Consumo annuo (kWh) / Fattore Produzione*
                </code>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    *Fattori di Produzione per Zone Climatiche:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Nord Italia</p>
                      <p className="text-blue-600 dark:text-blue-400">1.100 kWh/kWp</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                      <p className="font-medium text-green-700 dark:text-green-300">Centro Italia</p>
                      <p className="text-green-600 dark:text-green-400">1.300 kWh/kWp</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                      <p className="font-medium text-orange-700 dark:text-orange-300">Sud Italia</p>
                      <p className="text-orange-600 dark:text-orange-400">1.500 kWh/kWp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documenti Necessari
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Bollette elettriche ultimi 12 mesi (per profilo di consumo)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    POD (Point of Delivery) esistente
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Potenza impegnata attuale e disponibile
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Fattori di Correzione:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Orientamento non ottimale: -10% a -30%</li>
                    <li>• Temperature &gt;35°C: -10% a -15%</li>
                    <li>• Ombreggiamenti parziali: -5% a -20%</li>
                    <li>• Autoconsumo ideale: 60-70% della produzione</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strumenti di Calcolo Professionali
              </h4>
              <div className="space-y-2">
                <a href="https://re.jrc.ec.europa.eu/pvg_tools/it/" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-blue-600 dark:text-blue-400">PVGIS Calculator</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Database ufficiale UE per irraggiamento solare</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="https://www.enea.it/it/seguici/le-parole-dellenergia/fotovoltaico" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-blue-600 dark:text-blue-400">Database ENEA</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Dati climatici UNI 10349 per tutte le province italiane</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Site Inspection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                2. Sopralluogo Tecnico
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Durata: 1 giorno • Responsabile: Progettista
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verifiche in Sito
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Orientamento e inclinazione copertura
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Superficie disponibile e portata strutturale
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Analisi ombreggiamenti (edifici, alberi, antenne)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Valutazione punto di connessione elettrica
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verifica Strutturale Obbligatoria
              </h4>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Portata Minima Richiesta:</p>
                    <p>Sovraccarico aggiuntivo ≥ 25 kg/m² (normativa 2025)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Documentazione Strutturale:
                </p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>CIS - Certificato Idoneità Statica (validità 15 anni)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Relazione calcolo carichi per zone sismiche</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Planimetrie strutturali edificio</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strumenti Necessari
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-sm text-gray-600 dark:text-gray-400">
                  Bussola/App orientamento
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-sm text-gray-600 dark:text-gray-400">
                  Metro laser
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-sm text-gray-600 dark:text-gray-400">
                  Inclinometro digitale
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-sm text-gray-600 dark:text-gray-400">
                  Fotocamera HD
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-sm text-gray-600 dark:text-gray-400">
                  Drone (optional)
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-sm text-gray-600 dark:text-gray-400">
                  Solar Pathfinder
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Preliminary Design */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              3. Progetto Preliminare
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Durata: 5 giorni • Responsabile: Progettista
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              Documenti da Produrre
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Schema Unifilare
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rappresentazione schematica dell'impianto elettrico
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Layout Impianto
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Disposizione moduli su planimetria copertura
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Relazione Tecnica
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Descrizione dettagliata componenti e prestazioni
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              Parametri Tecnici Chiave
            </h4>
            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Potenza di picco
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    kWp
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Produzione stimata annua
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    kWh/anno
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Autoconsumo previsto
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Economic Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Euro className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              4. Preventivo Economico
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Durata: 2 giorni • Responsabile: Commerciale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Costo Medio €/kWp
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              800-1.200€
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              (IVA 10% residenziale)
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Tempo Rientro
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              4-6 anni
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              (con detrazione 50%)
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Risparmio Annuo
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              60-80%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              (sulla bolletta)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-2">Incentivi Nazionali 2025:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>Bonus Ristrutturazioni:</strong>
                  <ul className="ml-4 text-xs mt-1">
                    <li>- Prima casa: detrazione 50% (max 96.000€)</li>
                    <li>- Seconda casa: detrazione 36% (max 96.000€)</li>
                    <li>- Valido fino al 31/12/2025</li>
                  </ul>
                </li>
                <li>
                  <strong>Reddito Energetico Nazionale:</strong>
                  <ul className="ml-4 text-xs mt-1">
                    <li>- ISEE &le;15.000€ (30.000€ con 4+ figli)</li>
                    <li>- Copertura 100% costi per 2-6 kWp</li>
                    <li>- Fondo 100M€ (80% Sud Italia)</li>
                  </ul>
                </li>
                <li>
                  <strong>CER - Comunità Energetiche:</strong>
                  <ul className="ml-4 text-xs mt-1">
                    <li>- Contributo 40% PNRR (comuni &lt;5000 ab.)</li>
                    <li>- Tariffa incentivante GSE per 20 anni</li>
                    <li>- Scadenza: Dicembre 2025</li>
                  </ul>
                </li>
                <li><strong>IVA Agevolata 10%:</strong> Per uso residenziale</li>
                <li><strong>Superbonus 65%:</strong> Solo condomini (CILA ante 15/10/2024)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Incentivi Regionali Attivi
            </h5>
            <ul className="space-y-1 text-xs text-green-700 dark:text-green-300">
              <li><strong>Emilia-R.:</strong> 25-30% per CER (6M€)</li>
              <li><strong>Lazio:</strong> 35% max 1.5M€ (14M€ totali)</li>
              <li><strong>Toscana:</strong> Max 800k€ per CER</li>
              <li><strong>Valle d'Aosta:</strong> 40% comuni &ge;5000 ab.</li>
              <li><strong>Umbria:</strong> 100% costi costituzione CER</li>
              <li><strong>FVG:</strong> Contributi aziende agricole</li>
            </ul>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              Simulatore Risparmio
            </h5>
            <div className="space-y-2 text-xs">
              <p className="text-purple-700 dark:text-purple-300">
                Esempio impianto 6 kWp residenziale:
              </p>
              <ul className="space-y-1 text-purple-600 dark:text-purple-400">
                <li>• Costo: 6.000-7.200€ (IVA 10% inclusa)</li>
                <li>• Detrazione 50%: -3.600€ in 10 anni</li>
                <li>• Risparmio bolletta: 900-1.200€/anno</li>
                <li>• Rientro investimento: 3-4 anni</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Checklist Documenti Fase 1
        </h3>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <label
              key={item.id}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                item.completed
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleChecklistItem(item.id)}
                className="mt-0.5 h-4 w-4 text-blue-600 rounded"
              />
              <div className="flex-1">
                <p className={clsx(
                  'font-medium',
                  item.completed
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-gray-700 dark:text-gray-300'
                )}>
                  {item.label}
                </p>
                {item.description && (
                  <p className={clsx(
                    'text-sm mt-0.5',
                    item.completed
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {item.description}
                  </p>
                )}
              </div>
              {item.completed && (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completamento: {checklistItems.filter(item => item.completed).length} di {checklistItems.length}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Procedi alla Fase 2 <ChevronRight className="inline h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Download Templates */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Template e Risorse Utili
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Analisi Consumi Excel
            </span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Checklist Sopralluogo PDF
            </span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Schema Unifilare Template DWG
            </span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Plan Fotovoltaico Excel
            </span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Phase1Evaluation;