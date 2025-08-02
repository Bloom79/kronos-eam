import React, { useState } from 'react';
import { Mail, Send, Inbox, Paperclip, CheckCircle, AlertCircle, Clock, Download, Eye, Reply, Forward } from 'lucide-react';
import clsx from 'clsx';

interface PECMessage {
  id: string;
  oggetto: string;
  mittente: string;
  destinatario: string;
  data: string;
  type: 'Ricevuta' | 'Inviata';
  status: 'Consegnata' | 'In Invio' | 'Errore' | 'Letta' | 'Non Letta';
  integrazione: 'DSO' | 'GSE' | 'Terna' | 'Dogane';
  allegati?: string[];
  certificata: boolean;
  ricevutaConsegna?: string;
  ricevutaLettura?: string;
  contenuto?: string;
}

const PECManager: React.FC = () => {
  const [messages] = useState<PECMessage[]>([
    {
      id: '1',
      oggetto: 'Comunicazione Fine Lavori - plant FV Solare Verdi',
      mittente: 'admin@pec.solareverdi.it',
      destinatario: 'produttori@pec.e-distribuzione.it',
      data: '2024-03-14 18:00:00',
      type: 'Inviata',
      status: 'Consegnata',
      integrazione: 'DSO',
      allegati: ['Comunicazione_Fine_Lavori.pdf', 'Dichiarazione_Conformita.pdf', 'Schema_Unifilare.pdf'],
      certificata: true,
      ricevutaConsegna: '2024-03-14 18:05:32',
      ricevutaLettura: '2024-03-15 09:15:00'
    },
    {
      id: '2',
      oggetto: 'RE: Richiesta Documentazione Integrativa - Pratica ANT/2024/00123',
      mittente: 'protocollo@pec.gse.it',
      destinatario: 'admin@pec.solareverdi.it',
      data: '2024-03-15 11:30:00',
      type: 'Ricevuta',
      status: 'Non Letta',
      integrazione: 'GSE',
      allegati: ['Richiesta_Integrazioni.pdf'],
      certificata: true
    },
    {
      id: '3',
      oggetto: 'Invio Dichiarazione Antimafia Annuale',
      mittente: 'admin@pec.solareverdi.it',
      destinatario: 'antimafia@pec.gse.it',
      data: '2024-03-15 14:20:00',
      type: 'Inviata',
      status: 'In Invio',
      integrazione: 'GSE',
      allegati: ['Dichiarazione_Antimafia_2024.pdf', 'Visura_Camerale.pdf'],
      certificata: true
    },
    {
      id: '4',
      oggetto: 'Errore Invio: Verifica Contatori Fiscali',
      mittente: 'admin@pec.solareverdi.it',
      destinatario: 'utf.brindisi@pec.adm.gov.it',
      data: '2024-03-13 16:45:00',
      type: 'Inviata',
      status: 'Errore',
      integrazione: 'Dogane',
      allegati: ['Certificato_Taratura.pdf'],
      certificata: true
    },
    {
      id: '5',
      oggetto: 'Conferma Registrazione GAUDÌ - plant IM_A123B456',
      mittente: 'gaudi@pec.terna.it',
      destinatario: 'admin@pec.solareverdi.it',
      data: '2024-03-10 10:22:00',
      type: 'Ricevuta',
      status: 'Letta',
      integrazione: 'Terna',
      allegati: ['Conferma_Registrazione_GAUDI.pdf'],
      certificata: true,
      ricevutaLettura: '2024-03-10 11:00:00'
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<PECMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'ricevute' | 'inviate'>('all');
  const [showCompose, setShowCompose] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Consegnata':
      case 'Letta':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Invio':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'Errore':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'Non Letta':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getIntegrazioneColor = (integrazione: string) => {
    switch (integrazione) {
      case 'GSE':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Terna':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Dogane':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'DSO':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'ricevute') return message.type === 'Ricevuta';
    if (filter === 'inviate') return message.type === 'Inviata';
    return true;
  });

  const stats = {
    totali: messages.length,
    ricevute: messages.filter(m => m.type === 'Ricevuta').length,
    inviate: messages.filter(m => m.type === 'Inviata').length,
    nonLette: messages.filter(m => m.status === 'Non Letta').length,
    errori: messages.filter(m => m.status === 'Errore').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Gestione PEC (Posta Elettronica Certificata)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestisci le comunicazioni certificate con gli enti
            </p>
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            Nuova PEC
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Totali</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {stats.totali}
                </p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ricevute</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.ricevute}
                </p>
              </div>
              <Inbox className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inviate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.inviate}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Non Lette</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.nonLette}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
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
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-4 py-2 rounded-lg transition-colors',
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Tutte
          </button>
          <button
            onClick={() => setFilter('ricevute')}
            className={clsx(
              'px-4 py-2 rounded-lg transition-colors',
              filter === 'ricevute'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Ricevute
          </button>
          <button
            onClick={() => setFilter('inviate')}
            className={clsx(
              'px-4 py-2 rounded-lg transition-colors',
              filter === 'inviate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Inviate
          </button>
        </div>

        {/* Messages Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Oggetto</th>
                <th className="px-4 py-3 text-left">Mittente/Destinatario</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Sistema</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Allegati</th>
                <th className="px-4 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr 
                  key={message.id} 
                  className={clsx(
                    'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer',
                    message.status === 'Non Letta' && 'font-semibold'
                  )}
                  onClick={() => setSelectedMessage(message)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {message.type === 'Ricevuta' ? (
                        <Inbox className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Send className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="text-gray-800 dark:text-gray-100">
                          {message.oggetto}
                        </p>
                        {message.certificata && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ Certificata
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 dark:text-gray-300">
                      {message.type === 'Ricevuta' ? message.mittente : message.destinatario}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(message.data).toLocaleString('it-IT')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getIntegrazioneColor(message.integrazione)
                    )}>
                      {message.integrazione}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(message.status)
                    )}>
                      {message.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {message.allegati && message.allegati.length > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {message.allegati.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(message);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      {message.type === 'Ricevuta' && (
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Reply className="h-4 w-4 text-gray-500" />
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Dettagli PEC
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <AlertCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Message Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-4">
                    {selectedMessage.oggetto}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Da:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-100">
                        {selectedMessage.mittente}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">A:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-100">
                        {selectedMessage.destinatario}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Data:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-100">
                        {new Date(selectedMessage.data).toLocaleString('it-IT')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={clsx(
                        'ml-2 px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(selectedMessage.status)
                      )}>
                        {selectedMessage.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ricevute */}
                {(selectedMessage.ricevutaConsegna || selectedMessage.ricevutaLettura) && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      Ricevute PEC
                    </h5>
                    <div className="space-y-1 text-sm">
                      {selectedMessage.ricevutaConsegna && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300">
                            Consegnata: {new Date(selectedMessage.ricevutaConsegna).toLocaleString('it-IT')}
                          </span>
                        </div>
                      )}
                      {selectedMessage.ricevutaLettura && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300">
                            Letta: {new Date(selectedMessage.ricevutaLettura).toLocaleString('it-IT')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Allegati */}
                {selectedMessage.allegati && selectedMessage.allegati.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Allegati ({selectedMessage.allegati.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedMessage.allegati.map((allegato, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-800 dark:text-gray-100">
                              {allegato}
                            </span>
                          </div>
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                            <Download className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                    Contenuto
                  </h5>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedMessage.contenuto || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedMessage.type === 'Ricevuta' && (
                    <>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Reply className="h-5 w-5" />
                        Rispondi
                      </button>
                      <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <Forward className="h-5 w-5" />
                        Inoltra
                      </button>
                    </>
                  )}
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Scarica PEC
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Nuova PEC
              </h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destinatario
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                    <option value="">Seleziona destinatario</option>
                    <option value="produttori@pec.e-distribuzione.it">E-Distribuzione - Produttori</option>
                    <option value="protocollo@pec.gse.it">GSE - Protocollo</option>
                    <option value="antimafia@pec.gse.it">GSE - Antimafia</option>
                    <option value="gaudi@pec.terna.it">Terna - GAUDÌ</option>
                    <option value="utf.brindisi@pec.adm.gov.it">Dogane - UTF Brindisi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Oggetto
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Messaggio
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Allegati
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Trascina i file qui o clicca per selezionarli
                    </p>
                  </div>
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Invia PEC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PECManager;