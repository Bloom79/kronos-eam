import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  GitBranch,
  FileText,
  AlertCircle,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Link2,
  Shield,
  Cpu,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Scadenza } from '../types';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import { 
  dashboardService, 
  calendarService,
  DashboardMetrics as ApiDashboardMetrics,
  IntegrationStatus,
  PerformanceTrend,
  AlertItem,
  CalendarEvent
} from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Loading states
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(true);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  
  // Error states
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [integrationsError, setIntegrationsError] = useState<string | null>(null);
  const [deadlinesError, setDeadlinesError] = useState<string | null>(null);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  
  // Data states
  const [metrics, setMetrics] = useState<ApiDashboardMetrics | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [scadenze, setScadenze] = useState<CalendarEvent[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<Array<{
    timestamp: string;
    type: string;
    descrizione: string;
    plant?: string;
    utente?: string;
  }>>([]);

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        setMetricsError(null);
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        setMetricsError(error instanceof Error ? error.message : 'Errore nel caricamento delle metriche');
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch dashboard summary (integrations and activities)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoadingIntegrations(true);
        setIntegrationsError(null);
        const summary = await dashboardService.getSummary();
        setIntegrations(summary.integrations);
        setRecentActivities(summary.recent_activities || []);
      } catch (error) {
        setIntegrationsError(error instanceof Error ? error.message : 'Errore nel caricamento delle integrazioni');
        console.error('Error fetching summary:', error);
      } finally {
        setIsLoadingIntegrations(false);
      }
    };

    fetchSummary();
  }, []);

  // Fetch upcoming deadlines
  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        setIsLoadingDeadlines(true);
        setDeadlinesError(null);
        const deadlines = await calendarService.getUpcomingDeadlines();
        // If the response is already an array, use it directly
        if (Array.isArray(deadlines)) {
          setScadenze(deadlines.slice(0, 5)); // Show top 5 most urgent
        } else {
          // Otherwise, handle the grouped format
          const urgentDeadlines = [
            ...(deadlines.overdue || []),
            ...(deadlines.this_week || []),
            ...(deadlines.this_month || [])
          ].slice(0, 5); // Show top 5 most urgent
          setScadenze(urgentDeadlines);
        }
      } catch (error) {
        setDeadlinesError(error instanceof Error ? error.message : 'Errore nel caricamento delle scadenze');
        console.error('Error fetching deadlines:', error);
      } finally {
        setIsLoadingDeadlines(false);
      }
    };

    fetchDeadlines();
  }, []);

  // Fetch performance trend
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setIsLoadingPerformance(true);
        setPerformanceError(null);
        const trend = await dashboardService.getPerformanceTrend('month');
        setPerformanceTrend(trend);
      } catch (error) {
        setPerformanceError(error instanceof Error ? error.message : 'Errore nel caricamento del trend');
        console.error('Error fetching performance:', error);
      } finally {
        setIsLoadingPerformance(false);
      }
    };

    fetchPerformance();
  }, []);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoadingAlerts(true);
        setAlertsError(null);
        const alertData = await dashboardService.getAlerts(true); // Get unread alerts
        setAlerts(alertData);
      } catch (error) {
        setAlertsError(error instanceof Error ? error.message : 'Errore nel caricamento degli avvisi');
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, []);

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT');
  };

  // Calculate workflow data from alerts
  const workflowData = alerts.reduce((acc, alert) => {
    if (alert.type === 'error') acc.inRitardo++;
    else if (alert.type === 'warning') acc.inCorso++;
    else acc.completati++;
    return acc;
  }, { completati: 65, inCorso: 25, inRitardo: 10 }); // Default values

  const workflowChartData = {
    labels: ['Completati', 'In Corso', 'In Ritardo'],
    datasets: [{
      data: [workflowData.completati, workflowData.inCorso, workflowData.inRitardo],
      backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
      borderWidth: 0
    }]
  };

  const performanceChartData = performanceTrend ? {
    labels: performanceTrend.labels || [],
    datasets: [
      {
        label: 'Produzione (MWh)',
        data: performanceTrend.production || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Performance Ratio (%)',
        data: performanceTrend.performance_ratio || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y-percentage'
      },
      {
        label: 'Disponibilità (%)',
        data: performanceTrend.availability || [],
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4,
        yAxisID: 'y-percentage'
      }
    ]
  } : {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
    datasets: []
  };

  const complianceChartData = {
    labels: ['DSO', 'Terna', 'GSE', 'Dogane'],
    datasets: [{
      label: 'Conformità %',
      data: [98, 95, 92, 89],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const getIntegrationIcon = (status: string) => {
    switch (status) {
      case 'Connesso':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Errore':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'In Manutenzione':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScadenzaColor = (data: string) => {
    const days = Math.floor((new Date(data).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'text-red-800'; // Overdue
    if (days < 7) return 'text-red-600';
    if (days < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const mapCalendarEventToScadenza = (event: CalendarEvent): Scadenza => ({
    id: event.id,
    titolo: event.title,
    plant: event.plant_name || 'N/A',
    data: event.due_date || event.date,
    type: event.type === 'payment' ? 'Payment' : 
          event.type === 'inspection' ? 'Verification' : 
          event.type === 'declaration' ? 'Declaration' : 'Renewal',
    priorita: event.priority === 'high' ? 'High' : 
              event.priority === 'medium' ? 'Medium' : 'Low',
    status: event.status === 'pending' ? 'Open' : 
           event.status === 'completed' ? 'Completed' : 'Delayed',
    ente: undefined
  });

  // Refresh all data
  const refreshData = useCallback(() => {
    // Re-trigger all useEffect hooks by updating a key
    window.location.reload();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page header with refresh */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Aggiorna
        </button>
      </div>

      {/* Welcome section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">
          Bentornato, {user?.name}!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              I tuoi task
            </h3>
            {isLoadingAlerts ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : alertsError ? (
              <div className="text-sm text-red-600 dark:text-red-400">
                {alertsError}
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 2).map((alert, index) => (
                  <Link
                    key={alert.id}
                    to={`/workflows/${alert.id}`}
                    className="block bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {alert.titolo}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.plant_name || alert.descrizione}
                    </p>
                  </Link>
                ))}
                {alerts.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nessun task assegnato
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Scadenze imminenti
            </h3>
            {isLoadingDeadlines ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : deadlinesError ? (
              <div className="text-sm text-red-600 dark:text-red-400">
                {deadlinesError}
              </div>
            ) : (
              <div className="space-y-2">
                {scadenze.slice(0, 2).map(event => {
                  const scadenza = mapCalendarEventToScadenza(event);
                  const daysRemaining = Math.floor((new Date(scadenza.data).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={scadenza.id} className="flex items-center text-sm">
                      <span className={clsx(
                        'h-2 w-2 rounded-full mr-3',
                        scadenza.priorita === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                      )} />
                      <p className="flex-1">
                        {scadenza.titolo} ({scadenza.plant})
                      </p>
                      <span className={clsx('font-semibold', getScadenzaColor(scadenza.data))}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} giorni fa` : `${daysRemaining} giorni`}
                      </span>
                    </div>
                  );
                })}
                {scadenze.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nessuna scadenza imminente
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Potenza Totale
              </h3>
              {isLoadingMetrics ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : metricsError ? (
                <p className="mt-2 text-sm text-red-600">Errore</p>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics?.potenza_totale_mw || 0} MW
                </p>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Plants Attivi
              </h3>
              {isLoadingMetrics ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : metricsError ? (
                <p className="mt-2 text-sm text-red-600">Errore</p>
              ) : (
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-bold text-green-600">
                    {metrics?.plants_attivi || 0}
                  </p>
                  <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    / {metrics?.plants_totali || 0} totali
                  </p>
                </div>
              )}
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                Allarmi Attivi
              </h3>
              {isLoadingMetrics ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : metricsError ? (
                <p className="mt-2 text-sm text-red-600">Errore</p>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics?.allarmi_attivi || 0}
                </p>
              )}
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Score Conformità
              </h3>
              {isLoadingMetrics ? (
                <div className="mt-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : metricsError ? (
                <p className="mt-2 text-sm text-red-600">Errore</p>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(metrics?.conformita_media_percent || 0)}%
                </p>
              )}
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Integration status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Status Integrazioni
        </h3>
        {isLoadingIntegrations ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : integrationsError ? (
          <div className="text-red-600 dark:text-red-400 text-center py-8">
            {integrationsError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrations.map((integration, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {integration.name}
                    </h4>
                    {getIntegrationIcon(integration.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    type: {integration.type_connessione}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Ultima sync: {integration.ultima_sincronizzazione ? formatRelativeTime(integration.ultima_sincronizzazione) : 'Mai'}
                  </p>
                  {integration.messaggi_in_coda !== undefined && integration.messaggi_in_coda > 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      {integration.messaggi_in_coda} messaggi in coda
                    </p>
                  )}
                  {integration.errori !== undefined && integration.errori > 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {integration.errori} errori
                    </p>
                  )}
                </div>
              ))}
              {integrations.length === 0 && (
                <div className="col-span-4 text-center text-gray-500 dark:text-gray-400">
                  Nessuna integrazione configurata
                </div>
              )}
            </div>
            <Link
              to="/integrations"
              className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Gestisci integrazioni →
            </Link>
          </>
        )}
      </div>

      {/* Charts and analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Produzione Energetica
          </h3>
          {isLoadingPerformance ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : performanceError ? (
            <div className="h-80 flex items-center justify-center text-red-600 dark:text-red-400">
              {performanceError}
            </div>
          ) : performanceChartData.datasets.length > 0 ? (
            <div className="h-80">
              <Line
                data={performanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Nessun dato disponibile
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Status Workflow
            </h3>
            <div className="h-48">
              <Doughnut
                data={workflowChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Attività Recenti
            </h3>
            {isLoadingIntegrations ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                {recentActivities.slice(0, 3).map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 dark:text-gray-500 mr-3 min-w-[50px]">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {activity.utente && <span className="font-semibold">{activity.utente}</span>}
                      {activity.utente && ' '}
                      {activity.descrizione}
                      {activity.plant && (
                        <span className="font-semibold"> - {activity.plant}</span>
                      )}
                    </p>
                  </li>
                ))}
                {recentActivities.length === 0 && (
                  <li className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Nessuna attività recente
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Compliance by entity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Conformità per Ente
        </h3>
        <div className="h-64">
          <Bar
            data={complianceChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                y: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Summary */}
      {(metricsError || integrationsError || deadlinesError || performanceError || alertsError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Alcuni dati potrebbero non essere aggiornati
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Si sono verificati errori durante il caricamento di alcuni dati. Riprova tra qualche istante.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;