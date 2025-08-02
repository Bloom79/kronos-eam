import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Settings,
  Shield,
  Database,
  Key,
  Globe,
  Activity,
  HardDrive,
  Mail,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

interface AdminCard {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
  available: boolean;
}

const Administration: React.FC = () => {
  const { user } = useAuth();

  const adminCards: AdminCard[] = [
    {
      title: 'Gestione Utenti',
      description: 'Gestisci utenti, ruoli e permessi della piattaforma',
      icon: Users,
      link: '/admin/users',
      color: 'blue',
      available: true
    },
    {
      title: 'Configurazione Sistema',
      description: 'Impostazioni generali e parametri di sistema',
      icon: Settings,
      link: '/admin/settings',
      color: 'purple',
      available: false
    },
    {
      title: 'Sicurezza',
      description: 'Politiche di sicurezza e audit log',
      icon: Shield,
      link: '/admin/security',
      color: 'green',
      available: false
    },
    {
      title: 'Database',
      description: 'Backup, manutenzione e ottimizzazione',
      icon: Database,
      link: '/admin/database',
      color: 'orange',
      available: false
    },
    {
      title: 'API Keys',
      description: 'Gestione chiavi API e integrazioni esterne',
      icon: Key,
      link: '/admin/api-keys',
      color: 'red',
      available: false
    },
    {
      title: 'Multi-Tenant',
      description: 'Gestione tenant e configurazioni dedicate',
      icon: Globe,
      link: '/admin/tenants',
      color: 'indigo',
      available: false
    },
    {
      title: 'Monitoraggio',
      description: 'Performance sistema e metriche utilizzo',
      icon: Activity,
      link: '/admin/monitoring',
      color: 'yellow',
      available: false
    },
    {
      title: 'Storage',
      description: 'Gestione spazio e documenti archiviati',
      icon: HardDrive,
      link: '/admin/storage',
      color: 'gray',
      available: false
    },
    {
      title: 'Email',
      description: 'Configurazione notifiche e template email',
      icon: Mail,
      link: '/admin/email',
      color: 'pink',
      available: false
    },
    {
      title: 'Log Sistema',
      description: 'Visualizza e gestisci i log di sistema',
      icon: FileText,
      link: '/admin/logs',
      color: 'cyan',
      available: false
    }
  ];

  const getColorClasses = (color: string, available: boolean) => {
    if (!available) {
      return 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500';
    }

    const colors = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
      green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
      red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400',
      yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
      cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400'
    };

    return colors[color as keyof typeof colors] || colors.gray;
  };

  if (user?.ruolo !== 'Admin') {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Accesso Negato
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                Solo gli amministratori possono accedere a questa sezione.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Amministrazione Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestione completa della piattaforma e delle configurazioni di sistema
        </p>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {adminCards.map((card) => {
          const Icon = card.icon;
          
          const cardContent = (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                  'p-3 rounded-lg',
                  getColorClasses(card.color, card.available)
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                {card.available && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mt-3" />
                )}
              </div>
              
              <h3 className={clsx(
                'font-semibold text-lg mb-2',
                card.available
                  ? 'text-gray-800 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {card.title}
              </h3>
              
              <p className={clsx(
                'text-sm',
                card.available
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              )}>
                {card.description}
              </p>
              
              {!card.available && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Disponibile prossimamente
                </p>
              )}
            </>
          );
          
          if (card.available) {
            return (
              <Link
                key={card.title}
                to={card.link}
                className={clsx(
                  'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all',
                  'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                )}
              >
                {cardContent}
              </Link>
            );
          }
          
          return (
            <div
              key={card.title}
              className={clsx(
                'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all',
                'opacity-60 cursor-not-allowed'
              )}
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Informazioni Sistema
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Versione Piattaforma</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">2.5.0</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ultimo Aggiornamento</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {new Date().toLocaleDateString('it-IT')}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ambiente</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Produzione</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Administration;