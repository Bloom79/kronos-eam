import React, { useState } from 'react';
import { Bot, Play, Pause, RefreshCw, AlertCircle, CheckCircle, Clock, Activity, Calendar, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

interface RPATask {
  id: string;
  name: string;
  integrazione: string;
  type: 'Login' | 'Download' | 'Upload' | 'Scraping' | 'Form Fill';
  status: 'In Esecuzione' | 'Completato' | 'Errore' | 'In Coda' | 'Pianificato';
  iniziato: string;
  durata?: string;
  prossimaPianificazione?: string;
  frequenza?: 'Oraria' | 'Giornaliera' | 'Settimanale' | 'Mensile';
  errore?: string;
  log?: string[];
}

const RPAMonitor: React.FC = () => {
  const [tasks] = useState<RPATask[]>([
    {
      id: '1',
      name: 'Download Pagamenti GSE',
      integrazione: 'GSE',
      type: 'Download',
      status: 'In Esecuzione',
      iniziato: '2024-03-15 14:30:00',
      durata: '2m 15s',
      frequenza: 'Mensile',
      prossimaPianificazione: '2024-04-15 14:30:00',
      log: [
        '[14:30:00] Avvio task automatico',
        '[14:30:05] Login SPID avviato',
        '[14:30:15] Autenticazione MFA in corso...',
        '[14:30:45] Login completato',
        '[14:31:00] Navigazione a sezione pagamenti',
        '[14:31:30] Download file pagamenti_marzo_2024.pdf in corso...'
      ]
    },
    {
      id: '2',
      name: 'Aggiornamento registry GAUDÌ',
      integrazione: 'Terna',
      type: 'Form Fill',
      status: 'Completato',
      iniziato: '2024-03-15 12:00:00',
      durata: '5m 32s',
      frequenza: 'Settimanale',
      prossimaPianificazione: '2024-03-22 12:00:00'
    },
    {
      id: '3',
      name: 'Invio Dichiarazione Dogane',
      integrazione: 'Dogane',
      type: 'Upload',
      status: 'Errore',
      iniziato: '2024-03-15 10:15:00',
      durata: '1m 45s',
      errore: 'Timeout durante caricamento file EDI. Il portale non risponde.',
      frequenza: 'Mensile',
      prossimaPianificazione: '2024-03-16 10:15:00'
    },
    {
      id: '4',
      name: 'Check Status Pratiche DSO',
      integrazione: 'E-Distribuzione',
      type: 'Scraping',
      status: 'Pianificato',
      iniziato: '-',
      frequenza: 'Giornaliera',
      prossimaPianificazione: '2024-03-16 09:00:00'
    },
    {
      id: '5',
      name: 'Download Fatture GSE',
      integrazione: 'GSE',
      type: 'Download',
      status: 'In Coda',
      iniziato: '-',
      frequenza: 'Mensile'
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<RPATask | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Esecuzione':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'Completato':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'Errore':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'In Coda':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'Pianificato':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Esecuzione':
        return <Activity className="h-4 w-4 animate-pulse" />;
      case 'Completato':
        return <CheckCircle className="h-4 w-4" />;
      case 'Errore':
        return <AlertCircle className="h-4 w-4" />;
      case 'In Coda':
        return <Clock className="h-4 w-4" />;
      case 'Pianificato':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const gettypeColor = (type: string) => {
    switch (type) {
      case 'Login':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'Download':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Upload':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Scraping':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Form Fill':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const stats = {
    inEsecuzione: tasks.filter(t => t.status === 'In Esecuzione').length,
    completati: tasks.filter(t => t.status === 'Completato').length,
    errori: tasks.filter(t => t.status === 'Errore').length,
    inCoda: tasks.filter(t => t.status === 'In Coda').length,
    pianificati: tasks.filter(t => t.status === 'Pianificato').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Monitor RPA (Robotic Process Automation)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitora l'esecuzione dei task automatizzati sui portali esterni
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Aggiorna
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Play className="h-5 w-5" />
              Esegui Tutti
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilter('In Esecuzione')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'In Esecuzione' 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Esecuzione</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.inEsecuzione}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-400 animate-pulse" />
            </div>
          </button>

          <button
            onClick={() => setFilter('Completato')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'Completato' 
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completati</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completati}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </button>

          <button
            onClick={() => setFilter('Errore')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'Errore' 
                ? 'border-red-600 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">Errori</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.errori}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </button>

          <button
            onClick={() => setFilter('In Coda')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'In Coda' 
                ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Coda</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.inCoda}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </button>

          <button
            onClick={() => setFilter('Pianificato')}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all',
              filter === 'Pianificato' 
                ? 'border-gray-600 bg-gray-50 dark:bg-gray-700' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pianificati</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.pianificati}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Clear Filter */}
        {filter !== 'all' && (
          <div className="mb-4">
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mostra tutti i task →
            </button>
          </div>
        )}

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Integrazione</th>
                <th className="px-4 py-3 text-left">type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Iniziato</th>
                <th className="px-4 py-3 text-left">Durata</th>
                <th className="px-4 py-3 text-left">Frequenza</th>
                <th className="px-4 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {task.name}
                        </p>
                        {task.errore && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {task.errore}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {task.integrazione}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium',
                      gettypeColor(task.type)
                    )}>
                      {task.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(task.status)
                      )}>
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {task.iniziato !== '-' ? new Date(task.iniziato).toLocaleString('it-IT') : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {task.durata || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {task.frequenza && (
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">{task.frequenza}</p>
                        {task.prossimaPianificazione && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Prossima: {new Date(task.prossimaPianificazione).toLocaleString('it-IT')}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {task.status === 'In Esecuzione' ? (
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Pause className="h-4 w-4 text-gray-500" />
                        </button>
                      ) : (
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Play className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Activity className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Performance RPA - Ultimi 7 Giorni
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Grafico performance RPA
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Success Rate: 87% | Tempo Medio: 3m 24s
            </p>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Dettagli Task RPA
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <AlertCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Task Info */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                    Informazioni Task
                  </h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">name</dt>
                      <dd className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedTask.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Integrazione</dt>
                      <dd className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedTask.integrazione}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">type</dt>
                      <dd>
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          gettypeColor(selectedTask.type)
                        )}>
                          {selectedTask.type}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
                      <dd>
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          getStatusColor(selectedTask.status)
                        )}>
                          {selectedTask.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Execution Log */}
                {selectedTask.log && (
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Log Esecuzione
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 max-h-64 overflow-y-auto">
                      {selectedTask.log.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Riprova Esecuzione
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Modifica Pianificazione
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPAMonitor;