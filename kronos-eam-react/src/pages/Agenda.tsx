import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Euro,
  Shield,
  Activity,
  Link2,
  Plus,
  Eye,
  Bell,
  Download,
  Tag
} from 'lucide-react';
import clsx from 'clsx';

interface Scadenza {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'Declaration' | 'Payment' | 'Communication' | 'Verification' | 'Deadline' | 'Meeting';
  entity: 'Customs' | 'GSE' | 'Terna' | 'DSO' | 'Internal';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Delayed';
  plant?: string;
  assignee?: string;
  documents?: string[];
  recurring?: 'Monthly' | 'Quarterly' | 'Annual';
}

const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [filters, setFilters] = useState({
    entity: 'all',
    type: 'all',
    priority: 'all',
    plant: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScadenza, setSelectedScadenza] = useState<Scadenza | null>(null);

  // Mock data for deadlines
  const scadenze: Scadenza[] = [
    {
      id: '1',
      title: 'Dichiarazione Annuale Dogane',
      description: 'Invio dichiarazione annuale consumo energia elettrica',
      date: '2024-03-31',
      type: 'Declaration',
      entity: 'Customs',
      priority: 'High',
      status: 'In Progress',
      plant: 'Solare Verdi 1',
      assignee: 'Marco Rossi',
      documents: ['Registro_Produzione_2023.xlsx', 'Dichiarazione_2023.xml']
    },
    {
      id: '2',
      title: 'Pagamento Diritto Annuale',
      description: 'Versamento diritto annuale licenza officina elettrica',
      date: '2024-12-16',
      type: 'Payment',
      entity: 'Customs',
      priority: 'High',
      status: 'Planned',
      plant: 'Tutti',
      assignee: 'Laura Bianchi'
    },
    {
      id: '3',
      title: 'Comunicazione Fine Lavori',
      description: 'Invio comunicazione fine lavori a E-Distribuzione',
      date: '2024-03-20',
      type: 'Communication',
      entity: 'DSO',
      priority: 'Medium',
      status: 'Completed',
      plant: 'Solare Verdi 2',
      assignee: 'Giuseppe Verdi',
      documents: ['CFL_SolareVerdi2.pdf', 'Dichiarazione_Conformita.pdf']
    },
    {
      id: '4',
      title: 'Verifica Antimafia GSE',
      description: 'Scadenza verifica periodica antimafia',
      date: '2024-04-15',
      type: 'Verification',
      entity: 'GSE',
      priority: 'High',
      status: 'Planned',
      plant: 'Biomasse Toscana',
      assignee: 'Anna Neri',
      recurring: 'Annual'
    },
    {
      id: '5',
      title: 'Taratura Contatori Fiscali',
      description: 'Verifica triennale contatori fiscali UTF',
      date: '2025-05-15',
      type: 'Verification',
      entity: 'Customs',
      priority: 'Medium',
      status: 'Planned',
      plant: 'Eolico Puglia',
      assignee: 'Francesco Blu'
    },
    {
      id: '6',
      title: 'Invio Dati Mensili GAUDÌ',
      description: 'Caricamento dati produzione mensili su portale GAUDÌ',
      date: '2024-04-05',
      type: 'Communication',
      entity: 'Terna',
      priority: 'Medium',
      status: 'Planned',
      plant: 'Tutti',
      assignee: 'Marco Rossi',
      recurring: 'Monthly'
    },
    {
      id: '7',
      title: 'Riunione Team Compliance',
      description: 'Review mensile status compliance plants',
      date: '2024-03-25',
      time: '10:00',
      type: 'Meeting',
      entity: 'Internal',
      priority: 'Medium',
      status: 'Planned',
      assignee: 'Team Compliance'
    },
    {
      id: '8',
      title: 'Pagamento Acconto GSE',
      description: 'Versamento acconto incentivi RID',
      date: '2024-03-28',
      type: 'Payment',
      entity: 'GSE',
      priority: 'High',
      status: 'In Progress',
      plant: 'Solare Verdi 1',
      assignee: 'Laura Bianchi'
    }
  ];

  // Get color based on entity
  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'Customs':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'GSE':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      case 'Terna':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'DSO':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700';
      case 'Internal':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  // Get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Declaration':
        return FileText;
      case 'Payment':
        return Euro;
      case 'Communication':
        return Link2;
      case 'Verification':
        return Shield;
      case 'Deadline':
        return Clock;
      case 'Meeting':
        return Activity;
      default:
        return Calendar;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'Planned':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      case 'Delayed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Filter deadlines
  const filteredScadenze = scadenze.filter(deadline => {
    if (filters.entity !== 'all' && deadline.entity !== filters.entity) return false;
    if (filters.type !== 'all' && deadline.type !== filters.type) return false;
    if (filters.priority !== 'all' && deadline.priority !== filters.priority) return false;
    if (filters.plant !== 'all' && deadline.plant !== filters.plant) return false;
    return true;
  });

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get deadlines for a specific date
  const getScadenzeForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredScadenze.filter(s => s.date === dateStr);
  };

  // Navigate calendar
  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  // Count deadlines by status
  const stats = {
    totali: filteredScadenze.length,
    completati: filteredScadenze.filter(s => s.status === 'Completed').length,
    inCorso: filteredScadenze.filter(s => s.status === 'In Progress').length,
    pianificati: filteredScadenze.filter(s => s.status === 'Planned').length,
    inRitardo: filteredScadenze.filter(s => s.status === 'Delayed').length
  };

  // Get unique values for filters
  const uniquePlants = [...new Set(scadenze.map(s => s.plant).filter(Boolean))];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Agenda e Scadenze
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestisci tutte le scadenze normative e amministrative
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <Filter className="h-5 w-5" />
              Filtri
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuova Scadenza
            </button>
          </div>
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
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completati}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Corso</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.inCorso}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pianificate</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.pianificati}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Ritardo</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.inRitardo}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ente
                </label>
                <select
                  value={filters.entity}
                  onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="all">Tutti</option>
                  <option value="Customs">Dogane</option>
                  <option value="GSE">GSE</option>
                  <option value="Terna">Terna</option>
                  <option value="DSO">DSO</option>
                  <option value="Internal">Interno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="all">Tutti</option>
                  <option value="Declaration">Dichiarazione</option>
                  <option value="Payment">Pagamento</option>
                  <option value="Communication">Comunicazione</option>
                  <option value="Verification">Verifica</option>
                  <option value="Deadline">Scadenza</option>
                  <option value="Meeting">Riunione</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorità
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="all">Tutte</option>
                  <option value="High">Alta</option>
                  <option value="Medium">Media</option>
                  <option value="Low">Bassa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  plant
                </label>
                <select
                  value={filters.plant}
                  onChange={(e) => setFilters({ ...filters, plant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="all">Tutti</option>
                  {uniquePlants.map(plant => (
                    <option key={plant} value={plant}>{plant}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setView('month')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Mese
          </button>
          <button
            onClick={() => setView('week')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Settimana
          </button>
          <button
            onClick={() => setView('day')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              view === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Giorno
          </button>
          <button
            onClick={() => setView('list')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Oggi
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div
                key={day}
                className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth(currentDate).map((day, idx) => {
              const dayScadenze = getScadenzeForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  className={clsx(
                    'bg-white dark:bg-gray-800 min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    !day.isCurrentMonth && 'opacity-40',
                    isToday && 'ring-2 ring-inset ring-blue-600',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className={clsx(
                    'text-sm font-medium mb-1',
                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Deadlines for this day */}
                  <div className="space-y-1">
                    {dayScadenze.slice(0, 3).map((deadline) => {
                      const Icon = getTypeIcon(deadline.type);
                      return (
                        <div
                          key={deadline.id}
                          className={clsx(
                            'text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80',
                            getEntityColor(deadline.entity)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScadenza(deadline);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{deadline.title}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayScadenze.length > 3 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        +{dayScadenze.length - 3} altre
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Scadenza</th>
                  <th className="px-6 py-3 text-left">Data</th>
                  <th className="px-6 py-3 text-left">Ente</th>
                  <th className="px-6 py-3 text-left">type</th>
                  <th className="px-6 py-3 text-left">plant</th>
                  <th className="px-6 py-3 text-left">Responsabile</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredScadenze.map((deadline) => {
                  const Icon = getTypeIcon(deadline.type);
                  return (
                    <tr key={deadline.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={clsx('h-4 w-4', getPriorityColor(deadline.priority))} />
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {deadline.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {deadline.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          {new Date(deadline.date).toLocaleDateString('it-IT')}
                        </p>
                        {deadline.time && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {deadline.time}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          getEntityColor(deadline.entity).split(' ').slice(0, 4).join(' ')
                        )}>
                          {deadline.entity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {deadline.type}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {deadline.plant || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {deadline.assignee || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          getStatusColor(deadline.status)
                        )}>
                          {deadline.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedScadenza(deadline)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                            <Bell className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Legenda Colori
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className={clsx('w-4 h-4 rounded', getEntityColor('Customs').split(' ')[0])} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Agenzia Dogane</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx('w-4 h-4 rounded', getEntityColor('GSE').split(' ')[0])} />
            <span className="text-sm text-gray-700 dark:text-gray-300">GSE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx('w-4 h-4 rounded', getEntityColor('Terna').split(' ')[0])} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Terna</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx('w-4 h-4 rounded', getEntityColor('DSO').split(' ')[0])} />
            <span className="text-sm text-gray-700 dark:text-gray-300">DSO/E-Distribuzione</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx('w-4 h-4 rounded', getEntityColor('Internal').split(' ')[0])} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Interno</span>
          </div>
        </div>
      </div>

      {/* Deadline Detail Modal */}
      {selectedScadenza && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Dettagli Scadenza
                </h3>
                <button
                  onClick={() => setSelectedScadenza(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <AlertCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Main Info */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                    {selectedScadenza.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedScadenza.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {new Date(selectedScadenza.date).toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={clsx(
                      'inline-block px-2 py-1 rounded text-sm font-medium',
                      getStatusColor(selectedScadenza.status)
                    )}>
                      {selectedScadenza.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ente</p>
                    <span className={clsx(
                      'inline-block px-2 py-1 rounded text-sm font-medium',
                      getEntityColor(selectedScadenza.entity).split(' ').slice(0, 4).join(' ')
                    )}>
                      {selectedScadenza.entity}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">type</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {selectedScadenza.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Priorità</p>
                    <p className={clsx('font-medium', getPriorityColor(selectedScadenza.priority))}>
                      {selectedScadenza.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">plant</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {selectedScadenza.plant || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Responsabile</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {selectedScadenza.assignee || 'N/A'}
                    </p>
                  </div>
                  {selectedScadenza.recurring && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ricorrenza</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedScadenza.recurring}
                      </p>
                    </div>
                  )}
                </div>

                {/* Documents */}
                {selectedScadenza.documents && selectedScadenza.documents.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                      Documenti Correlati
                    </h5>
                    <div className="space-y-2">
                      {selectedScadenza.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                          </div>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                            <Download className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Marca come Completata
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Imposta Promemoria
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Modifica
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

export default Agenda;