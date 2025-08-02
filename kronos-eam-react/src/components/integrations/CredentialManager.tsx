import React, { useState } from 'react';
import { Key, Eye, EyeOff, Plus, Edit2, Trash2, Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface Credential {
  id: string;
  name: string;
  integrazione: 'GSE' | 'Terna' | 'Dogane' | 'E-Distribuzione';
  type: 'SPID' | 'CNS' | 'User/Password' | 'API Key' | 'Certificato';
  username?: string;
  ultimoUtilizzo: string;
  status: 'Attiva' | 'Scaduta' | 'Bloccata';
  scadenza?: string;
  note?: string;
}

const CredentialManager: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: '1',
      name: 'SPID Aziendale GSE',
      integrazione: 'GSE',
      type: 'SPID',
      username: 'admin@solareverdi.it',
      ultimoUtilizzo: '2024-03-15 14:30:00',
      status: 'Attiva',
      note: 'SPID professionale per accesso area clienti GSE'
    },
    {
      id: '2',
      name: 'API Key Terna Market',
      integrazione: 'Terna',
      type: 'API Key',
      username: 'terna-api-prod',
      ultimoUtilizzo: '2024-03-15 13:45:00',
      status: 'Attiva',
      scadenza: '2024-12-31',
      note: 'Chiave per accesso dati mercato elettrico'
    },
    {
      id: '3',
      name: 'CNS Responsabile Fiscale',
      integrazione: 'Dogane',
      type: 'CNS',
      username: 'VRDMRC80A01H501Z',
      ultimoUtilizzo: '2024-03-10 10:15:00',
      status: 'Scaduta',
      scadenza: '2024-03-01',
      note: 'Carta Nazionale Servizi - Da rinnovare'
    },
    {
      id: '4',
      name: 'Portale Produttori E-Dist',
      integrazione: 'E-Distribuzione',
      type: 'User/Password',
      username: 'prod_solareverdi',
      ultimoUtilizzo: '2024-03-14 18:00:00',
      status: 'Attiva',
      note: 'Accesso portale produttori'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Attiva':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'Scaduta':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'Bloccata':
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
      case 'E-Distribuzione':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const gettypeIcon = (type: string) => {
    switch (type) {
      case 'SPID':
      case 'CNS':
        return <Shield className="h-4 w-4" />;
      case 'API Key':
      case 'Certificato':
        return <Key className="h-4 w-4" />;
      case 'User/Password':
        return <Lock className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa credenziale?')) {
      setCredentials(credentials.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Gestione Credenziali
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestisci in modo sicuro le credenziali per l'accesso ai sistemi esterni
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Aggiungi Credenziale
          </button>
        </div>

        {/* Security Alert */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Sicurezza delle Credenziali
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Tutte le credenziali sono crittografate con AES-256 e archiviate in conformità con il GDPR.
                L'accesso è registrato e monitorato per garantire la massima sicurezza.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">name</th>
                <th className="px-4 py-3 text-left">Integrazione</th>
                <th className="px-4 py-3 text-left">type</th>
                <th className="px-4 py-3 text-left">Username/ID</th>
                <th className="px-4 py-3 text-left">Ultimo Utilizzo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Scadenza</th>
                <th className="px-4 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((credential) => (
                <tr key={credential.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {credential.name}
                    </div>
                    {credential.note && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {credential.note}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getIntegrazioneColor(credential.integrazione)
                    )}>
                      {credential.integrazione}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {gettypeIcon(credential.type)}
                      <span className="text-gray-700 dark:text-gray-300">{credential.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {showPassword[credential.id] ? credential.username : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPassword({
                          ...showPassword,
                          [credential.id]: !showPassword[credential.id]
                        })}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        {showPassword[credential.id] ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(credential.ultimoUtilizzo).toLocaleString('it-IT')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusColor(credential.status)
                    )}>
                      {credential.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {credential.scadenza ? (
                      <span className={clsx(
                        'text-sm',
                        new Date(credential.scadenza) < new Date() ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                      )}>
                        {new Date(credential.scadenza).toLocaleDateString('it-IT')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedCredential(credential)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(credential.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Totale Credenziali</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {credentials.length}
              </p>
            </div>
            <Key className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attive</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {credentials.filter(c => c.status === 'Attiva').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Scadenza</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {credentials.filter(c => c.scadenza && new Date(c.scadenza) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scadute</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {credentials.filter(c => c.status === 'Scaduta').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || selectedCredential) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {selectedCredential ? 'Modifica Credenziale' : 'Nuova Credenziale'}
              </h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    name Credenziale
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    defaultValue={selectedCredential?.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Integrazione
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      defaultValue={selectedCredential?.integrazione}
                    >
                      <option value="GSE">GSE</option>
                      <option value="Terna">Terna</option>
                      <option value="Dogane">Dogane</option>
                      <option value="E-Distribuzione">E-Distribuzione</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      defaultValue={selectedCredential?.type}
                    >
                      <option value="SPID">SPID</option>
                      <option value="CNS">CNS</option>
                      <option value="User/Password">User/Password</option>
                      <option value="API Key">API Key</option>
                      <option value="Certificato">Certificato</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username/ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    defaultValue={selectedCredential?.username}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password/Secret
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Scadenza (opzionale)
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    defaultValue={selectedCredential?.scadenza}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Note
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    defaultValue={selectedCredential?.note}
                  />
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCredential(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    // Save credential
                    setShowAddModal(false);
                    setSelectedCredential(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedCredential ? 'Salva Modifiche' : 'Aggiungi Credenziale'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialManager;