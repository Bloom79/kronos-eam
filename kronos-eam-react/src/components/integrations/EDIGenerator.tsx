import React, { useState } from 'react';
import { FileText, Download, Upload, Send, Settings, AlertCircle, CheckCircle, Clock, Package, Calendar, BarChart3, Code, FileCode } from 'lucide-react';
import clsx from 'clsx';

interface EDIFile {
  id: string;
  name: string;
  type: 'Dichiarazione Annuale' | 'Registro Mensile' | 'Comunicazione Variazione' | 'Richiesta Licenza';
  formato: 'Idoc' | 'EDIFACT' | 'X12' | 'XML';
  dimensione: string;
  dataCreazione: string;
  status: 'Generato' | 'Validato' | 'Inviato' | 'Accettato' | 'Respinto' | 'In Errore';
  protocollo?: string;
  ente: 'Dogane' | 'GSE' | 'Terna' | 'DSO';
  contenuto?: {
    plant: string;
    periodo: string;
    produzione?: number;
    autoconsumo?: number;
    immissione?: number;
  };
}

const EDIGenerator: React.FC = () => {
  const [ediFiles] = useState<EDIFile[]>([
    {
      id: '1',
      name: 'DICH_ANNUALE_2023_SOLAREVERDI.idoc',
      type: 'Dichiarazione Annuale',
      formato: 'Idoc',
      dimensione: '124 KB',
      dataCreazione: '2024-03-25 10:30:00',
      status: 'Accettato',
      protocollo: 'ADM/2024/BR/00789',
      ente: 'Dogane',
      contenuto: {
        plant: 'Solare Verdi 1',
        periodo: '2023',
        produzione: 1756.3,
        autoconsumo: 298.7,
        immissione: 1457.6
      }
    },
    {
      id: '2',
      name: 'REG_MENSILE_032024_SOLAREVERDI.xml',
      type: 'Registro Mensile',
      formato: 'XML',
      dimensione: '45 KB',
      dataCreazione: '2024-04-01 09:15:00',
      status: 'Validato',
      ente: 'Dogane',
      contenuto: {
        plant: 'Solare Verdi 1',
        periodo: 'Marzo 2024',
        produzione: 223.1,
        autoconsumo: 33.5,
        immissione: 189.6
      }
    },
    {
      id: '3',
      name: 'COMM_VAR_POTENZA_EOLICOPUGLIA.idoc',
      type: 'Comunicazione Variazione',
      formato: 'Idoc',
      dimensione: '89 KB',
      dataCreazione: '2024-03-15 14:45:00',
      status: 'In Errore',
      ente: 'Dogane',
      contenuto: {
        plant: 'Eolico Puglia',
        periodo: 'Q1 2024'
      }
    },
    {
      id: '4',
      name: 'GSE_FUELFIX_2024_BIOMASSE.xml',
      type: 'Dichiarazione Annuale',
      formato: 'XML',
      dimensione: '156 KB',
      dataCreazione: '2024-03-20 11:20:00',
      status: 'Inviato',
      ente: 'GSE',
      contenuto: {
        plant: 'Biomasse Toscana',
        periodo: '2024',
        produzione: 450.8
      }
    },
    {
      id: '5',
      name: 'TERNA_GAUDI_UPDATE_MARZO.edifact',
      type: 'Comunicazione Variazione',
      formato: 'EDIFACT',
      dimensione: '67 KB',
      dataCreazione: '2024-03-10 16:30:00',
      status: 'Generato',
      ente: 'Terna',
      contenuto: {
        plant: 'Solare Verdi 2',
        periodo: 'Marzo 2024'
      }
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<EDIFile | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accettato':
      case 'Validato':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'Inviato':
      case 'Generato':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'Respinto':
      case 'In Errore':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getFormatoColor = (formato: string) => {
    switch (formato) {
      case 'Idoc':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'XML':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'EDIFACT':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'X12':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getEnteColor = (ente: string) => {
    switch (ente) {
      case 'Dogane':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'GSE':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Terna':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'DSO':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const filteredFiles = filter === 'all' 
    ? ediFiles 
    : ediFiles.filter(file => file.ente === filter);

  const stats = {
    totali: ediFiles.length,
    accettati: ediFiles.filter(f => f.status === 'Accettato').length,
    inviati: ediFiles.filter(f => f.status === 'Inviato').length,
    errori: ediFiles.filter(f => f.status === 'In Errore' || f.status === 'Respinto').length,
    dogane: ediFiles.filter(f => f.ente === 'Dogane').length,
    gse: ediFiles.filter(f => f.ente === 'GSE').length,
    terna: ediFiles.filter(f => f.ente === 'Terna').length
  };

  const ediFormats = [
    {
      formato: 'Idoc',
      descrizione: 'SAP Intermediate Document - Standard Dogane',
      icon: FileCode,
      color: 'purple'
    },
    {
      formato: 'EDIFACT',
      descrizione: 'Electronic Data Interchange for Administration',
      icon: Code,
      color: 'green'
    },
    {
      formato: 'XML',
      descrizione: 'Extensible Markup Language - GSE/Terna',
      icon: FileText,
      color: 'blue'
    },
    {
      formato: 'X12',
      descrizione: 'ANSI ASC X12 - Standard Americano',
      icon: Package,
      color: 'yellow'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              EDI File Generator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Genera e gestisci file EDI per comunicazioni con enti
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            Genera File EDI
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Totali</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {stats.totali}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accettati</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.accettati}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inviati</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.inviati}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Errori</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.errori}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <button
            onClick={() => setFilter('Dogane')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'Dogane' 
                ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Dogane</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.dogane}
            </p>
          </button>

          <button
            onClick={() => setFilter('GSE')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'GSE' 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">GSE</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.gse}
            </p>
          </button>

          <button
            onClick={() => setFilter('Terna')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'Terna' 
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Terna</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.terna}
            </p>
          </button>
        </div>

        {/* Clear Filter */}
        {filter !== 'all' && (
          <div className="mb-4">
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mostra tutti i file →
            </button>
          </div>
        )}

        {/* Files Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">name File</th>
                <th className="px-4 py-3 text-left">type</th>
                <th className="px-4 py-3 text-left">Formato</th>
                <th className="px-4 py-3 text-left">Ente</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {file.dimensione}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {file.type}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getFormatoColor(file.formato)
                    )}>
                      {file.formato}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getEnteColor(file.ente)
                    )}>
                      {file.ente}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(file.dataCreazione).toLocaleString('it-IT')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(file.status)
                    )}>
                      {file.status}
                    </span>
                    {file.protocollo && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {file.protocollo}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <FileCode className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Download className="h-4 w-4 text-gray-500" />
                      </button>
                      {(file.status === 'Generato' || file.status === 'Validato') && (
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Send className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDI Formats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Formati EDI Supportati
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ediFormats.map((format) => {
            const Icon = format.icon;
            return (
              <div key={format.formato} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className={clsx(
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
                  format.color === 'purple' && 'bg-purple-100 dark:bg-purple-900',
                  format.color === 'green' && 'bg-green-100 dark:bg-green-900',
                  format.color === 'blue' && 'bg-blue-100 dark:bg-blue-900',
                  format.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900'
                )}>
                  <Icon className={clsx(
                    'h-6 w-6',
                    format.color === 'purple' && 'text-purple-600 dark:text-purple-400',
                    format.color === 'green' && 'text-green-600 dark:text-green-400',
                    format.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                    format.color === 'yellow' && 'text-yellow-600 dark:text-yellow-400'
                  )} />
                </div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-1">
                  {format.formato}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format.descrizione}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Detail Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Dettagli File EDI
                </h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <AlertCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* File Info */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                    Informazioni File
                  </h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">name File</dt>
                      <dd className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedFile.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Formato</dt>
                      <dd>
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          getFormatoColor(selectedFile.formato)
                        )}>
                          {selectedFile.formato}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Dimensione</dt>
                      <dd className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedFile.dimensione}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
                      <dd>
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          getStatusColor(selectedFile.status)
                        )}>
                          {selectedFile.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Content Info */}
                {selectedFile.contenuto && (
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Contenuto Dichiarazione
                    </h4>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">plant</dt>
                        <dd className="font-medium text-gray-800 dark:text-gray-100">
                          {selectedFile.contenuto.plant}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Periodo</dt>
                        <dd className="font-medium text-gray-800 dark:text-gray-100">
                          {selectedFile.contenuto.periodo}
                        </dd>
                      </div>
                      {selectedFile.contenuto.produzione && (
                        <>
                          <div>
                            <dt className="text-sm text-gray-600 dark:text-gray-400">Produzione</dt>
                            <dd className="font-medium text-gray-800 dark:text-gray-100">
                              {selectedFile.contenuto.produzione.toFixed(1)} MWh
                            </dd>
                          </div>
                          {selectedFile.contenuto.autoconsumo && (
                            <div>
                              <dt className="text-sm text-gray-600 dark:text-gray-400">Autoconsumo</dt>
                              <dd className="font-medium text-gray-800 dark:text-gray-100">
                                {selectedFile.contenuto.autoconsumo.toFixed(1)} MWh
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                    </dl>
                  </div>
                )}

                {/* EDI Preview */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                    Anteprima EDI
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 max-h-64 overflow-y-auto">
                    {selectedFile.formato === 'Idoc' && (
                      <pre>{`EDI_DC40  1000000000000123456789DOC_DICH_ANNUALE
E1DCAHDR  100000000000012345678900001
  BEGDAT         20230101
  ENDDAT         20231231
  BUKRS          IT00
  WERKS          BR01
E1DCAPOS  100000000000012345678900002
  MATNR          ENERGIA_ELETTRICA
  MENGE          001756.300
  MEINS          MWH
E1DCATAX  100000000000012345678900003
  TAXKD          ACC
  TAXAMT         000003.730
  WAERS          EUR`}</pre>
                    )}
                    {selectedFile.formato === 'XML' && (
                      <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<DichiarazioneAnnuale>
  <Header>
    <typeDocumento>DICH_ANNUALE</typeDocumento>
    <Anno>2023</Anno>
    <DataCreazione>2024-03-25T10:30:00</DataCreazione>
  </Header>
  <plant>
    <Codice>IT00BR01</Codice>
    <name>Solare Verdi 1</name>
    <type>FOTOVOLTAICO</type>
  </plant>
  <Produzione>
    <Totale unità="MWh">1756.3</Totale>
    <Autoconsumo unità="MWh">298.7</Autoconsumo>
    <Immissione unità="MWh">1457.6</Immissione>
  </Produzione>
</DichiarazioneAnnuale>`}</pre>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Scarica File
                  </button>
                  {(selectedFile.status === 'Generato' || selectedFile.status === 'Validato') && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Invia File
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Modifica Parametri
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Genera Nuovo File EDI
              </h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    type Documento
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                    <option value="">Seleziona type documento</option>
                    <option value="dichiarazione_annuale">Dichiarazione Annuale</option>
                    <option value="registro_mensile">Registro Mensile</option>
                    <option value="comunicazione_variazione">Comunicazione Variazione</option>
                    <option value="richiesta_licenza">Richiesta Licenza</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ente Destinatario
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                      <option value="">Seleziona ente</option>
                      <option value="dogane">Agenzia Dogane</option>
                      <option value="gse">GSE</option>
                      <option value="terna">Terna</option>
                      <option value="dso">E-Distribuzione</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Formato File
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                      <option value="">Seleziona formato</option>
                      <option value="idoc">Idoc (SAP)</option>
                      <option value="xml">XML</option>
                      <option value="edifact">EDIFACT</option>
                      <option value="x12">X12</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    plant
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                    <option value="">Seleziona plant</option>
                    <option value="solare_verdi_1">Solare Verdi 1</option>
                    <option value="solare_verdi_2">Solare Verdi 2</option>
                    <option value="eolico_puglia">Eolico Puglia</option>
                    <option value="biomasse_toscana">Biomasse Toscana</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Periodo Dal
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Periodo Al
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                    Opzioni Generazione
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Includi dati contatori fiscali
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Calcola automaticamente le imposte
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Validazione pre-invio
                      </span>
                    </label>
                  </div>
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Genera File EDI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Performance EDI - Ultimi 30 Giorni
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Grafico performance EDI
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">92%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Tempo Medio</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">45s</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">File Processati</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">127</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EDIGenerator;