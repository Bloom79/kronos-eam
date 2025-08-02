import React from 'react';
import { FileText, AlertTriangle, Calendar, Euro, Download, ExternalLink, Upload, Clock, CheckCircle } from 'lucide-react';
import { Plant } from '../../services/api';
import { PORTAL_URLS } from '../../config/portalUrls';
import clsx from 'clsx';

interface DoganeTabProps {
  plant: Plant;
}

const DoganeTab: React.FC<DoganeTabProps> = ({ plant }) => {
  // Mock Dogane-specific data
  const doganeData = {
    numeroLicenza: 'IT12BR000123E',
    dataRilascio: '15/06/2022',
    dataScadenza: '31/12/2025',
    statusLicenza: 'Attiva',
    ufficioDogane: 'UTF Brindisi',
    typeOfficina: 'Officina Elettrica',
    classificazione: 'Produttore > 20 kW',
    codiceDitta: 'BR/EL/2022/00123',
    codiceAccisa: 'ITBR00123456789',
    responsabileFiscale: 'Dott. Marco Verdi'
  };

  const registriMensili = [
    {
      mese: 'Gennaio 2024',
      produzioneLorda: 118.7,
      autoconsumo: 18.7,
      immessa: 100.0,
      contatoreFiscale: 125432,
      dataLettura: '31/01/2024',
      status: 'Vidimato'
    },
    {
      mese: 'Febbraio 2024',
      produzioneLorda: 135.8,
      autoconsumo: 22.3,
      immessa: 113.5,
      contatoreFiscale: 126789,
      dataLettura: '29/02/2024',
      status: 'Vidimato'
    },
    {
      mese: 'Marzo 2024',
      produzioneLorda: 160.4,
      autoconsumo: 25.6,
      immessa: 134.8,
      contatoreFiscale: 128234,
      dataLettura: '31/03/2024',
      status: 'Vidimato'
    },
    {
      mese: 'Aprile 2024',
      produzioneLorda: 185.1,
      autoconsumo: 28.9,
      immessa: 156.2,
      contatoreFiscale: 129876,
      dataLettura: '30/04/2024',
      status: 'Vidimato'
    },
    {
      mese: 'Maggio 2024',
      produzioneLorda: 209.6,
      autoconsumo: 31.2,
      immessa: 178.4,
      contatoreFiscale: 131543,
      dataLettura: '31/05/2024',
      status: 'Da Vidimare'
    },
    {
      mese: 'Giugno 2024',
      produzioneLorda: 223.1,
      autoconsumo: 33.5,
      immessa: 189.6,
      contatoreFiscale: 133210,
      dataLettura: '30/06/2024',
      status: 'Da Vidimare'
    }
  ];

  const dichiarazioniAnnuali = [
    {
      anno: 2022,
      produzioneTotale: 850.5,
      autoconsumoTotale: 142.3,
      energiaImponibile: 142.3,
      aliquota: 0.0125,
      accisaDovuta: 1.78,
      dataInvio: '28/03/2023',
      protocollo: 'ADM/2023/BR/00456',
      status: 'Accettata'
    },
    {
      anno: 2023,
      produzioneTotale: 1756.3,
      autoconsumoTotale: 298.7,
      energiaImponibile: 298.7,
      aliquota: 0.0125,
      accisaDovuta: 3.73,
      dataInvio: '25/03/2024',
      protocollo: 'ADM/2024/BR/00789',
      status: 'Accettata'
    },
    {
      anno: 2024,
      produzioneTotale: 1033.6,
      autoconsumoTotale: 158.2,
      energiaImponibile: 158.2,
      aliquota: 0.0125,
      accisaDovuta: 1.98,
      dataInvio: '-',
      protocollo: '-',
      status: 'Da Inviare'
    }
  ];

  const pagamentiDiritti = [
    {
      anno: 2022,
      type: 'Diritto Annuale',
      importo: 23.24,
      scadenza: '16/12/2022',
      dataPagamento: '14/12/2022',
      modelloF24: 'F24/2022/123456',
      status: 'Pagato'
    },
    {
      anno: 2023,
      type: 'Diritto Annuale',
      importo: 23.24,
      scadenza: '16/12/2023',
      dataPagamento: '12/12/2023',
      modelloF24: 'F24/2023/234567',
      status: 'Pagato'
    },
    {
      anno: 2024,
      type: 'Diritto Annuale',
      importo: 23.24,
      scadenza: '16/12/2024',
      dataPagamento: '-',
      modelloF24: '-',
      status: 'Da Pagare'
    }
  ];

  const contatoriTaratura = {
    ultimaTaratura: '15/05/2022',
    prossimaTaratura: '15/05/2025',
    laboratorioCertificato: 'LAB-CERT-123',
    numeroContatore: 'CEI-2022-BR-00123',
    classeAccuratezza: '0.5S',
    certificato: 'CERT/2022/LAB123/456'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Attiva':
      case 'Accettata':
      case 'Pagato':
      case 'Vidimato':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'Da Inviare':
      case 'Da Pagare':
      case 'Da Vidimare':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'Scaduta':
      case 'Respinta':
      case 'Non Pagato':
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
      {/* Informazioni Licenza */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Licenza Officina Elettrica
          </h3>
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(doganeData.statusLicenza)
          )}>
            {doganeData.statusLicenza}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Numero Licenza</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.numeroLicenza}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Codice Ditta</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.codiceDitta}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Codice Accisa</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.codiceAccisa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">type Officina</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.typeOfficina}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Classificazione</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.classificazione}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ufficio Competente</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.ufficioDogane}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Rilascio</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.dataRilascio}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data Scadenza</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.dataScadenza}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Responsabile Fiscale</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{doganeData.responsabileFiscale}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <a 
            href={PORTAL_URLS.DOGANE.telematico}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
            Accedi al Portale PUDM
          </a>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scarica Licenza
          </button>
        </div>
      </div>

      {/* Registri Mensili */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Registri Mensili Produzione
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <Download className="h-4 w-4" />
            Esporta Registro
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Mese</th>
                <th className="px-4 py-3 text-right">Produzione (MWh)</th>
                <th className="px-4 py-3 text-right">Autoconsumo</th>
                <th className="px-4 py-3 text-right">Immessa</th>
                <th className="px-4 py-3 text-right">Contatore</th>
                <th className="px-4 py-3 text-center">Lettura</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {registriMensili.map((registro, idx) => (
                <tr key={idx} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {registro.mese}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {registro.produzioneLorda.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {registro.autoconsumo.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {registro.immessa.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {registro.contatoreFiscale.toLocaleString('it-IT')}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                    {registro.dataLettura}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(registro.status)
                    )}>
                      {registro.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Nota:</span> Dal 1° aprile 2025 non è più richiesta la vidimazione preventiva annuale dei registri.
              È sufficiente la tenuta corretta con annotazioni mensili.
            </p>
          </div>
        </div>
      </div>

      {/* Dichiarazioni Annuali */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Dichiarazioni Annuali di Consumo
          </h3>
          <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" />
            Genera EDI
          </button>
        </div>

        <div className="space-y-3">
          {dichiarazioniAnnuali.map((dichiarazione) => (
            <div key={dichiarazione.anno} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Anno {dichiarazione.anno}
                </h4>
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  getStatusColor(dichiarazione.status)
                )}>
                  {dichiarazione.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Produzione</p>
                  <p className="font-medium">{dichiarazione.produzioneTotale.toFixed(1)} MWh</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Autoconsumo</p>
                  <p className="font-medium">{dichiarazione.autoconsumoTotale.toFixed(1)} MWh</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Accisa Dovuta</p>
                  <p className="font-medium">{formatCurrency(dichiarazione.accisaDovuta)}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Data Invio</p>
                  <p className="font-medium">{dichiarazione.dataInvio}</p>
                </div>
              </div>
              
              {dichiarazione.protocollo !== '-' && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Protocollo: {dichiarazione.protocollo}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              La dichiarazione annuale deve essere inviata telematicamente entro il <span className="font-medium">31 marzo</span> di ogni anno
              tramite il canale EDI (System-to-System) con file in formato Idoc.
            </p>
          </div>
        </div>
      </div>

      {/* Pagamenti Diritti */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Pagamenti Diritti di Licenza
        </h3>

        <div className="space-y-3">
          {pagamentiDiritti.map((pagamento) => (
            <div key={pagamento.anno} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {pagamento.type} - Anno {pagamento.anno}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scadenza: {pagamento.scadenza} • Codice tributo: 2813
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {formatCurrency(pagamento.importo)}
                </p>
                <span className={clsx(
                  'text-xs font-medium',
                  getStatusColor(pagamento.status)
                )}>
                  {pagamento.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Genera F24
          </button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Scarica Ricevute
          </button>
        </div>
      </div>

      {/* Taratura Contatori */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Taratura Contatori Fiscali
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Numero Contatore</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {contatoriTaratura.numeroContatore}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Classe Accuratezza</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {contatoriTaratura.classeAccuratezza}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Laboratorio Certificato</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {contatoriTaratura.laboratorioCertificato}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="font-medium text-gray-800 dark:text-gray-100">
                Prossima Taratura
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {contatoriTaratura.prossimaTaratura}
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Ultima taratura: {contatoriTaratura.ultimaTaratura}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Certificato: {contatoriTaratura.certificato}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              La taratura periodica dei contatori fiscali è obbligatoria ogni <span className="font-medium">3 anni</span> per i contatori elettronici statici.
              La mancata taratura può comportare sanzioni amministrative.
            </p>
          </div>
        </div>
      </div>

      {/* Scadenze Dogane */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Scadenze Agenzia Dogane
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Pagamento Diritto Annuale
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Versamento con F24 - Codice tributo 2813
                </p>
              </div>
            </div>
            <span className="text-red-600 dark:text-red-400 font-semibold">
              16/12/2024
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Dichiarazione Annuale Consumo
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invio telematico tramite EDI
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
                  Taratura Contatori Fiscali
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifica triennale obbligatoria
                </p>
              </div>
            </div>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              15/05/2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoganeTab;