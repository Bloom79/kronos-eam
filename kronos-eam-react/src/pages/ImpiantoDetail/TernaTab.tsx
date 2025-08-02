import React from 'react';
import { Shield, FileText, Activity, AlertCircle, CheckCircle, ExternalLink, Download, RefreshCw } from 'lucide-react';
import { Plant } from '../../services/api';
import { PORTAL_URLS } from '../../config/portalUrls';
import clsx from 'clsx';

interface TernaTabProps {
  plant: Plant;
}

const TernaTab: React.FC<TernaTabProps> = ({ plant }) => {
  // Mock Terna-specific data
  const ternaData = {
    codiceGaudi: plant.registry?.gaudi || 'N/A',
    statusRegistrazione: 'Validato',
    dataRegistrazione: '25/02/2022',
    dataValidazione: '10/03/2022',
    typeplant: 'IAFR',
    codiceUP: 'UP_123456',
    zonaRete: 'Sud',
    typeServizio: 'Immissione',
    mercatoPartecipazione: 'MGP',
    responsabileDispacciamento: 'GSE S.p.A.'
  };

  const flussiGaudi = [
    {
      id: 1,
      codice: 'G01',
      descrizione: 'Richiesta registrazione plant',
      mittente: 'DSO',
      destinatario: 'Terna',
      data: '25/02/2022',
      status: 'Completato',
      esito: 'Positivo'
    },
    {
      id: 2,
      codice: 'G02',
      descrizione: 'Conferma ricezione dati',
      mittente: 'Terna',
      destinatario: 'DSO',
      data: '26/02/2022',
      status: 'Completato',
      esito: 'Positivo'
    },
    {
      id: 3,
      codice: 'G04',
      descrizione: 'Validazione registry',
      mittente: 'Terna',
      destinatario: 'DSO/Produttore',
      data: '10/03/2022',
      status: 'Completato',
      esito: 'Positivo'
    },
    {
      id: 4,
      codice: 'G05',
      descrizione: 'Attivazione commerciale',
      mittente: 'DSO',
      destinatario: 'Terna',
      data: '22/05/2022',
      status: 'Completato',
      esito: 'Positivo'
    }
  ];

  const datiMercato = [
    { mese: 'Gennaio', mgp: 85.2, mi: 2.1, msd: 0.5, prezzoMedio: 87.3 },
    { mese: 'Febbraio', mgp: 92.4, mi: 1.8, msd: 0.8, prezzoMedio: 91.5 },
    { mese: 'Marzo', mgp: 78.6, mi: 2.3, msd: 0.4, prezzoMedio: 82.1 },
    { mese: 'Aprile', mgp: 71.2, mi: 1.9, msd: 0.6, prezzoMedio: 75.8 },
    { mese: 'Maggio', mgp: 68.4, mi: 2.2, msd: 0.3, prezzoMedio: 72.3 },
    { mese: 'Giugno', mgp: 75.8, mi: 2.5, msd: 0.7, prezzoMedio: 79.2 }
  ];

  const certificatiVerdi = {
    annoRiferimento: 2024,
    produzioneLorda: 1825.4,
    coefficiente: 1.0,
    certificatiMaturati: 1825,
    certificatiRitirati: 1800,
    certificatiDisponibili: 25,
    valoreMercato: 68.50
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validato':
      case 'Completato':
      case 'Positivo':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Attesa':
      case 'In Corso':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'Negativo':
      case 'Sospeso':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informazioni GAUDÌ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Registrazione GAUDÌ
          </h3>
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(ternaData.statusRegistrazione)
          )}>
            {ternaData.statusRegistrazione}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Codice GAUDÌ</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.codiceGaudi}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Codice UP</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.codiceUP}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Registrazione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.dataRegistrazione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type plant</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.typeplant}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Zona Rete</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.zonaRete}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type Servizio</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.typeServizio}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mercato Partecipazione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.mercatoPartecipazione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">RdD</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.responsabileDispacciamento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Validazione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{ternaData.dataValidazione}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <a 
            href={PORTAL_URLS.GAUDI.login}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
            Accedi a GAUDÌ
          </a>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sincronizza Dati
          </button>
        </div>
      </div>

      {/* Flussi di Validazione */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Flussi di Validazione GAUDÌ
        </h3>
        <div className="space-y-3">
          {flussiGaudi.map((flusso) => (
            <div key={flusso.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {flusso.codice} - {flusso.descrizione}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flusso.mittente} → {flusso.destinatario} • {flusso.data}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  getStatusColor(flusso.esito)
                )}>
                  {flusso.esito}
                </span>
                {flusso.status === 'Completato' && (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dati Mercato Elettrico */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Prezzi Mercato Elettrico (€/MWh)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Mese</th>
                <th className="px-4 py-3 text-right">MGP</th>
                <th className="px-4 py-3 text-right">MI</th>
                <th className="px-4 py-3 text-right">MSD</th>
                <th className="px-4 py-3 text-right">Prezzo Medio</th>
              </tr>
            </thead>
            <tbody>
              {datiMercato.map((dato, idx) => (
                <tr key={idx} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {dato.mese}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    €{dato.mgp.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    €{dato.mi.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    €{dato.msd.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100">
                    €{dato.prezzoMedio.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                  Media
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  €{(datiMercato.reduce((sum, d) => sum + d.mgp, 0) / datiMercato.length).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  €{(datiMercato.reduce((sum, d) => sum + d.mi, 0) / datiMercato.length).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  €{(datiMercato.reduce((sum, d) => sum + d.msd, 0) / datiMercato.length).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                  €{(datiMercato.reduce((sum, d) => sum + d.prezzoMedio, 0) / datiMercato.length).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Certificati Verdi / GO */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Certificati Verdi / Garanzie d'Origine
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Certificati Maturati</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {certificatiVerdi.certificatiMaturati}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Anno {certificatiVerdi.annoRiferimento}</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Certificati Disponibili</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {certificatiVerdi.certificatiDisponibili}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pronti per vendita</p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Valore di Mercato</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              €{certificatiVerdi.valoreMercato}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">per MWh</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Produzione Lorda Annua:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">{certificatiVerdi.produzioneLorda} MWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Coefficiente Moltiplicativo:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">{certificatiVerdi.coefficiente}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Certificati Ritirati:</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">{certificatiVerdi.certificatiRitirati}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Valore Potenziale:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              €{(certificatiVerdi.certificatiDisponibili * certificatiVerdi.valoreMercato).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Richiedi Emissione GO
          </button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Esporta Report
          </button>
        </div>
      </div>

      {/* Alert e Notifiche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Comunicazioni Terna
        </h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                Aggiornamento Codice di Rete
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nuove disposizioni per la partecipazione al MSD dal 01/01/2025
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                Validazione Misure Completata
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Misure del mese di Novembre validate correttamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TernaTab;