import React from 'react';
import { TrendingUp, FileText, Euro, Calendar, AlertCircle, CheckCircle, Download, ExternalLink, BarChart3 } from 'lucide-react';
import { Plant } from '../../services/api';
import { PORTAL_URLS } from '../../config/portalUrls';
import clsx from 'clsx';

interface GSETabProps {
  plant: Plant;
}

const GSETab: React.FC<GSETabProps> = ({ plant }) => {
  // Mock GSE-specific data
  const gseData = {
    numeroConvenzione: 'RID/2022/00123456',
    typeConvenzione: 'Ritiro Dedicato',
    dataAttivazione: '01/06/2022',
    dataScadenza: '31/05/2042',
    statusConvenzione: 'Attiva',
    prezzoMinimo: 42.0,
    prezzoRiconosciuto: 'Prezzo Zonale Orario',
    modalitaPagamento: 'Bonifico Mensile',
    ibanAccredito: 'IT60X0542811101000000123456',
    referenteGSE: 'Ing. Paolo Bianchi'
  };

  const pagamentiGSE = [
    {
      id: 1,
      periodo: 'Gennaio 2024',
      energiaRitirata: 95.2,
      prezzoMedio: 72.5,
      importoLordo: 6902.0,
      ritenuta: 1380.4,
      importoNetto: 5521.6,
      dataPagamento: '15/02/2024',
      status: 'Pagato'
    },
    {
      id: 2,
      periodo: 'Febbraio 2024',
      energiaRitirata: 112.5,
      prezzoMedio: 68.3,
      importoLordo: 7683.75,
      ritenuta: 1536.75,
      importoNetto: 6147.0,
      dataPagamento: '15/03/2024',
      status: 'Pagato'
    },
    {
      id: 3,
      periodo: 'Marzo 2024',
      energiaRitirata: 134.8,
      prezzoMedio: 65.2,
      importoLordo: 8788.96,
      ritenuta: 1757.79,
      importoNetto: 7031.17,
      dataPagamento: '15/04/2024',
      status: 'Pagato'
    },
    {
      id: 4,
      periodo: 'Aprile 2024',
      energiaRitirata: 156.2,
      prezzoMedio: 62.8,
      importoLordo: 9809.36,
      ritenuta: 1961.87,
      importoNetto: 7847.49,
      dataPagamento: '15/05/2024',
      status: 'Pagato'
    },
    {
      id: 5,
      periodo: 'Maggio 2024',
      energiaRitirata: 178.4,
      prezzoMedio: 58.9,
      importoLordo: 10507.76,
      ritenuta: 2101.55,
      importoNetto: 8406.21,
      dataPagamento: '15/06/2024',
      status: 'In Elaborazione'
    },
    {
      id: 6,
      periodo: 'Giugno 2024',
      energiaRitirata: 189.6,
      prezzoMedio: 61.2,
      importoLordo: 11603.52,
      ritenuta: 2320.70,
      importoNetto: 9282.82,
      dataPagamento: '15/07/2024',
      status: 'In Attesa'
    }
  ];

  const documentiAntimafia = {
    ultimaDichiarazione: '15/03/2024',
    prossimaScadenza: '15/03/2025',
    status: 'Valida',
    protocollo: 'GSE/ANT/2024/00123',
    importoSoglia: 186420.0,
    importoCumulato: 165432.0
  };

  const incentiviStorici = [
    { anno: 2022, type: 'Ritiro Dedicato', energia: 850.5, importo: 58234.25 },
    { anno: 2023, type: 'Ritiro Dedicato', energia: 1756.3, importo: 125832.45 },
    { anno: 2024, type: 'Ritiro Dedicato', energia: 866.7, importo: 54094.35 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Attiva':
      case 'Pagato':
      case 'Valida':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Elaborazione':
      case 'In Attesa':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'Sospesa':
      case 'Non Pagato':
      case 'Scaduta':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Informazioni Convenzione */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Convenzione GSE
          </h3>
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(gseData.statusConvenzione)
          )}>
            {gseData.statusConvenzione}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Numero Convenzione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.numeroConvenzione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type Convenzione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.typeConvenzione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Attivazione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.dataAttivazione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Scadenza</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.dataScadenza}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prezzo Riconosciuto</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.prezzoRiconosciuto}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prezzo Minimo Garantito</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(gseData.prezzoMinimo)}/MWh</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Modalità Pagamento</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.modalitaPagamento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">IBAN Accredito</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.ibanAccredito}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Referente GSE</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{gseData.referenteGSE}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <a 
            href={PORTAL_URLS.GSE.areaClienti}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
            Accedi Area Clienti GSE
          </a>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scarica Convenzione
          </button>
        </div>
      </div>

      {/* Pagamenti e Fatturazione */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Pagamenti Ritiro Dedicato
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <Download className="h-4 w-4" />
            Esporta CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Periodo</th>
                <th className="px-4 py-3 text-right">Energia (MWh)</th>
                <th className="px-4 py-3 text-right">Prezzo Medio</th>
                <th className="px-4 py-3 text-right">Importo Lordo</th>
                <th className="px-4 py-3 text-right">Ritenuta 20%</th>
                <th className="px-4 py-3 text-right">Netto</th>
                <th className="px-4 py-3 text-center">Data Pag.</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagamentiGSE.map((pagamento) => (
                <tr key={pagamento.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {pagamento.periodo}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {pagamento.energiaRitirata.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(pagamento.prezzoMedio)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(pagamento.importoLordo)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(pagamento.ritenuta)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100">
                    {formatCurrency(pagamento.importoNetto)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                    {pagamento.dataPagamento}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(pagamento.status)
                    )}>
                      {pagamento.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                  Totale
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {pagamentiGSE.reduce((sum, p) => sum + p.energiaRitirata, 0).toFixed(1)}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(pagamentiGSE.reduce((sum, p) => sum + p.importoLordo, 0))}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(pagamentiGSE.reduce((sum, p) => sum + p.ritenuta, 0))}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(pagamentiGSE.reduce((sum, p) => sum + p.importoNetto, 0))}
                </td>
                <td className="px-4 py-3" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Dichiarazione Antimafia */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Dichiarazione Antimafia
          </h3>
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(documentiAntimafia.status)
          )}>
            {documentiAntimafia.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ultima Dichiarazione</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {documentiAntimafia.ultimaDichiarazione}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prossima Scadenza</p>
                <p className="font-medium text-red-600 dark:text-red-400">
                  {documentiAntimafia.prossimaScadenza}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Numero Protocollo</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {documentiAntimafia.protocollo}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Monitoraggio Soglia
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Soglia Obbligo:</span>
                  <span className="font-medium">{formatCurrency(150000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Importo Cumulato:</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(documentiAntimafia.importoCumulato)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Importo Previsto:</span>
                  <span className="font-medium">{formatCurrency(documentiAntimafia.importoSoglia)}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(documentiAntimafia.importoCumulato / documentiAntimafia.importoSoglia) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {((documentiAntimafia.importoCumulato / documentiAntimafia.importoSoglia) * 100).toFixed(1)}% della soglia
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rinnova Dichiarazione
          </button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Scarica Modulo
          </button>
        </div>
      </div>

      {/* Storico Incentivi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Storico Incentivi
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Visualizza Grafico
          </button>
        </div>

        <div className="space-y-3">
          {incentiviStorici.map((anno) => (
            <div key={anno.anno} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Anno {anno.anno}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{anno.type}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {formatCurrency(anno.importo)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {anno.energia.toFixed(1)} MWh
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Totale Incentivi Ricevuti</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(incentiviStorici.reduce((sum, i) => sum + i.importo, 0))}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Prossime Scadenze GSE */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Scadenze GSE
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Dichiarazione Antimafia
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rinnovo annuale obbligatorio
                </p>
              </div>
            </div>
            <span className="text-red-600 dark:text-red-400 font-semibold">
              15/03/2025
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Comunicazione Fuel Mix
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dichiarazione composizione mix energetico
                </p>
              </div>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
              31/03/2025
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Aggiornamento Dati Tecnici
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifica annuale caratteristiche plant
                </p>
              </div>
            </div>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              Completato
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSETab;