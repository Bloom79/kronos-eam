import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Notifica } from '../types';

interface NotificationContextType {
  notifications: Notifica[];
  unreadCount: number;
  addNotification: (notification: Omit<Notifica, 'id' | 'timestamp' | 'letta'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notifica[]>([
    {
      id: '1',
      type: 'scadenza',
      titolo: 'Pagamento Diritto Licenza in scadenza',
      messaggio: 'Il pagamento del diritto di licenza per plant Verdi S.p.A. scade tra 7 giorni',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      letta: false,
      priorita: 'alta',
      link: '/agenda'
    },
    {
      id: '2',
      type: 'task',
      titolo: 'Nuovo task assegnato',
      messaggio: 'Ti è status assegnato il task "Censisci su GAUDÌ" per FV Tetto Sicuro',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      letta: false,
      priorita: 'media',
      link: '/workflows/1'
    },
    {
      id: '3',
      type: 'integrazione',
      titolo: 'Connessione GSE ripristinata',
      messaggio: 'La connessione con il portale GSE è stata ripristinata con successo',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      letta: true,
      priorita: 'bassa',
      link: '/integrations'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.letta).length;

  const addNotification = (notification: Omit<Notifica, 'id' | 'timestamp' | 'letta'>) => {
    const newNotification: Notifica = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      letta: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, letta: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, letta: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      if (random < 0.1) { // 10% chance every 30 seconds
        const sampleNotifications = [
          {
            type: 'scadenza' as const,
            titolo: 'Verifica SPI in scadenza',
            messaggio: 'La verifica quinquennale SPI per plant Blu S.A.S. scade tra 30 giorni',
            priorita: 'media' as const,
            link: '/agenda'
          },
          {
            type: 'sistema' as const,
            titolo: 'Backup completato',
            messaggio: 'Il backup automatico del sistema è status completato con successo',
            priorita: 'bassa' as const
          },
          {
            type: 'task' as const,
            titolo: 'Task completato',
            messaggio: 'Laura Neri ha completato il task "Verifica Verbale SPI"',
            priorita: 'bassa' as const,
            link: '/workflows'
          }
        ];
        
        const randomNotif = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        addNotification(randomNotif);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};