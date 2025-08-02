import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, ExternalLink, Download, Calendar } from 'lucide-react';
import { Plant } from '../../services/api';
import { getDSOPortalUrls } from '../../config/portalUrls';
import clsx from 'clsx';

interface DSOTabProps {
  plant: Plant;
}

const DSOTab: React.FC<DSOTabProps> = ({ plant }) => {
  // Mock DSO-specific data
  const dsoData = {
    distributore: 'E-Distribuzione S.p.A.',
    codicePratica: 'T0123456',
    dataRichiesta: '15/01/2022',
    dataConnessione: '22/05/2022',
    typeConnessione: 'Trifase BT',
    potenzaDisponibile: '1,500 kW',
    tensione: '400 V',
    contatore: 'CEI-0-21',
    tariffaConnessione: 'BTA6',
    statusConnessione: 'Attiva'
  };

  const documentiDSO = [
    {
      id: 1,
      name: 'TICA - Testo Integrato Connessioni Attive',
      type: 'Preventivo',
      data: '20/02/2022',
      status: 'Accettato',
      dimensione: '1.2 MB'
    },
    {
      id: 2,
      name: 'Regolamento di Esercizio',
      type: 'Contratto',
      data: '15/04/2022',
      status: 'Firmato',
      dimensione: '856 KB'
    },
    {
      id: 3,
      name: 'Comunicazione Fine Lavori',
      type: 'Comunicazione',
      data: '20/05/2022',
      status: 'Protocollato',
      dimensione: '2.3 MB'
    },
    {
      id: 4,
      name: 'Verbale di Attivazione',
      type: 'Verbale',
      data: '22/05/2022',
      status: 'Completato',
      dimensione: '432 KB'
    }
  ];

  const comunicazioniDSO = [
    {
      id: 1,
      data: '15/11/2024',
      oggetto: 'Programmazione manutenzione cabina',
      type: 'Manutenzione',
      letta: true
    },
    {
      id: 2,
      data: '02/10/2024',
      oggetto: 'Aggiornamento tariffe distribuzione 2025',
      type: 'Amministrativo',
      letta: true
    },
    {
      id: 3,
      data: '18/09/2024',
      oggetto: 'Verifica annuale protezioni di interfaccia',
      type: 'Tecnico',
      letta: false
    }
  ];

  const flussiDati = [
    { mese: 'Gennaio', immesso: 95.2, prelevato: 2.1, autoconsumo: 18.7 },
    { mese: 'Febbraio', immesso: 112.5, prelevato: 1.8, autoconsumo: 22.3 },
    { mese: 'Marzo', immesso: 134.8, prelevato: 1.5, autoconsumo: 25.6 },
    { mese: 'Aprile', immesso: 156.2, prelevato: 1.2, autoconsumo: 28.9 },
    { mese: 'Maggio', immesso: 178.4, prelevato: 0.9, autoconsumo: 31.2 },
    { mese: 'Giugno', immesso: 189.6, prelevato: 0.8, autoconsumo: 33.5 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Attiva':
      case 'Completato':
      case 'Accettato':
      case 'Firmato':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Attesa':
      case 'Protocollato':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'Scaduto':
      case 'Rifiutato':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informazioni Connessione */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Dati Connessione DSO
          </h3>
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(dsoData.statusConnessione)
          )}>
            {dsoData.statusConnessione}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Distributore</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.distributore}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Codice POD</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{plant.registry?.pod || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Codice Pratica</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.codicePratica}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type Connessione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.typeConnessione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Potenza Disponibile</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.potenzaDisponibile}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tensione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.tensione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type Contatore</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.contatore}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tariffa Connessione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.tariffaConnessione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Attivazione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{dsoData.dataConnessione}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <a
            href={(() => {
              const dsoUrls = getDSOPortalUrls(dsoData.distributore);
              if (!dsoUrls) return '#';
              if ('areaClienti' in dsoUrls) return dsoUrls.areaClienti;
              if ('portale' in dsoUrls) return dsoUrls.portale;
              if ('main' in dsoUrls) return dsoUrls.main;
              return '#';
            })()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
            Accedi al Portale DSO
          </a>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Scarica Report
          </button>
        </div>
      </div>

      {/* Documenti DSO */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Documentazione DSO
        </h3>
        <div className="space-y-3">
          {documentiDSO.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{doc.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {doc.type} • {doc.data} • {doc.dimensione}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  getStatusColor(doc.status)
                )}>
                  {doc.status}
                </span>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                  <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flussi Energetici */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Flussi Energetici Mensili (MWh)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Mese</th>
                <th className="px-4 py-3 text-right">Energia Immessa</th>
                <th className="px-4 py-3 text-right">Energia Prelevata</th>
                <th className="px-4 py-3 text-right">Autoconsumo</th>
                <th className="px-4 py-3 text-right">Totale Prodotto</th>
              </tr>
            </thead>
            <tbody>
              {flussiDati.map((flusso, idx) => (
                <tr key={idx} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {flusso.mese}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {flusso.immesso.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {flusso.prelevato.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {flusso.autoconsumo.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100">
                    {(flusso.immesso + flusso.autoconsumo).toFixed(1)}
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
                  {flussiDati.reduce((sum, f) => sum + f.immesso, 0).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {flussiDati.reduce((sum, f) => sum + f.prelevato, 0).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {flussiDati.reduce((sum, f) => sum + f.autoconsumo, 0).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  {flussiDati.reduce((sum, f) => sum + f.immesso + f.autoconsumo, 0).toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Comunicazioni Recenti */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Comunicazioni DSO
        </h3>
        <div className="space-y-3">
          {comunicazioniDSO.map((com) => (
            <div key={com.id} className={clsx(
              'flex items-center justify-between p-3 border rounded-lg',
              com.letta
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
            )}>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className={clsx(
                    'font-medium',
                    com.letta ? 'text-gray-800 dark:text-gray-100' : 'text-blue-800 dark:text-blue-200'
                  )}>
                    {com.oggetto}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {com.type} • {com.data}
                  </p>
                </div>
              </div>
              {!com.letta && (
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  Nuovo
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prossime Scadenze DSO */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Scadenze DSO
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Verifica Protezioni di Interfaccia
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scadenza annuale per plants BT
                </p>
              </div>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
              22/05/2025
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Rinnovo Regolamento Esercizio
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prossimo rinnovo previsto
                </p>
              </div>
            </div>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              22/05/2032
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSOTab;