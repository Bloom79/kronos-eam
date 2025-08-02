import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, MoreVertical, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { plantsService, PlantCreate } from '../services/api';
import type { Plant, PlantListResponse, PlantFilters } from '../services/api';

const Plants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Form state for new plant
  const [newPlant, setNewPlant] = useState<PlantCreate>({
    name: '',
    code: '',
    power: '',
    power_kw: 0,
    status: 'In Autorizzazione',
    type: 'Fotovoltaico',
    location: '',
    municipality: '',
    province: '',
    region: ''
  });

  // Fetch plants with filters
  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: PlantFilters = {};
      if (debouncedSearchTerm) {
        filters.search = debouncedSearchTerm;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const response = await plantsService.getPlants(
        currentPage,
        pageSize,
        filters,
        'name',
        'asc'
      );

      setPlants(response.items);
      setTotalCount(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli plants');
      console.error('Error fetching plants:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, filterStatus]);

  // Debounce search term
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo plant?')) {
      return;
    }

    try {
      setDeleting(id);
      await plantsService.deletePlant(id);
      await fetchPlants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
    } finally {
      setDeleting(null);
    }
  };

  // Handle create new plant
  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await plantsService.createPlant(newPlant);
      
      // Reset form and close modal
      setNewPlant({
        name: '',
        code: '',
        power: '',
        power_kw: 0,
        status: 'In Autorizzazione',
        type: 'Fotovoltaico',
        location: '',
        municipality: '',
        province: '',
        region: ''
      });
      setShowAddModal(false);
      
      // Refresh list
      await fetchPlants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la creazione');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle export
  const handleExport = async () => {
    try {
      // Get all plants without pagination for export
      const filters: PlantFilters = {};
      if (debouncedSearchTerm) {
        filters.search = debouncedSearchTerm;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const response = await plantsService.getPlants(
        1,
        1000, // Get all records for export
        filters,
        'name',
        'asc'
      );

      // Convert to CSV
      const headers = ['name', 'Codice', 'Potenza', 'Status', 'type', 'Località', 'Comune', 'Provincia', 'Regione'];
      const rows = response.items.map(imp => [
        imp.name,
        imp.code,
        imp.power,
        imp.status,
        imp.type,
        imp.location,
        imp.municipality || '',
        imp.province || '',
        imp.region || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `plants_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'esportazione');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'In Esercizio': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'In Autorizzazione': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'In Costruzione': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Dismesso': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return styles[status] || styles['Dismesso'];
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca plant per name o località..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="In Esercizio">In Esercizio</option>
                <option value="In Autorizzazione">In Autorizzazione</option>
                <option value="In Costruzione">In Costruzione</option>
                <option value="Dismesso">Dismesso</option>
              </select>
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Esporta in CSV"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Aggiungi plant</span>
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Caricamento plants...</p>
                </div>
              </div>
            ) : plants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Nessun plant trovato con i filtri selezionati.' 
                    : 'Nessun plant presente.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">name plant</th>
                    <th scope="col" className="px-6 py-3">Potenza</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Località</th>
                    <th scope="col" className="px-6 py-3">Prossima Scadenza</th>
                    <th scope="col" className="px-6 py-3">Conformità</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Azioni</span></th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((plant) => {
                  const conformitaItems = plant.checklist ? Object.values(plant.checklist) : [];
                  const conformitaCompletata = conformitaItems.filter(item => item).length;
                  const conformitaPercentuale = conformitaItems.length > 0 
                    ? Math.round((conformitaCompletata / conformitaItems.length) * 100)
                    : 0;
                  
                  return (
                    <tr key={plant.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {plant.name}
                      </th>
                      <td className="px-6 py-4">{plant.power}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          getStatusBadge(plant.status)
                        )}>
                          {plant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{plant.location}</td>
                      <td className={clsx('px-6 py-4 font-semibold', plant.deadline_color || 'text-gray-600')}>
                        {plant.next_deadline ? new Date(plant.next_deadline).toLocaleDateString('it-IT') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={clsx(
                                'h-2 rounded-full',
                                conformitaPercentuale === 100 ? 'bg-green-500' :
                                conformitaPercentuale >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${conformitaPercentuale}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            {conformitaPercentuale}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/plants/${plant.id}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Dettagli
                          </Link>
                          <div className="relative group">
                            <button 
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              disabled={deleting === plant.id}
                            >
                              {deleting === plant.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <button
                                onClick={() => handleDelete(plant.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={deleting === plant.id}
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-semibold">{plants.length}</span> di{' '}
                <span className="font-semibold">{totalCount}</span> plants
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Precedente
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={clsx(
                        'px-3 py-1 rounded',
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Successivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Aggiungi Nuovo plant
            </h2>
            <form onSubmit={handleCreatePlant}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      name plant *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlant.name}
                      onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Codice plant *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlant.code}
                      onChange={(e) => setNewPlant({ ...newPlant, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Potenza (kW) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={newPlant.power_kw || ''}
                      onChange={(e) => {
                        const kw = parseFloat(e.target.value) || 0;
                        setNewPlant({ 
                          ...newPlant, 
                          power_kw: kw,
                          power: kw >= 1000 ? `${(kw/1000).toFixed(1)} MW` : `${kw} kW`
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      type plant *
                    </label>
                    <select 
                      required
                      value={newPlant.type}
                      onChange={(e) => setNewPlant({ ...newPlant, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="Fotovoltaico">Fotovoltaico</option>
                      <option value="Eolico">Eolico</option>
                      <option value="Idroelettrico">Idroelettrico</option>
                      <option value="Biomasse">Biomasse</option>
                      <option value="Geotermico">Geotermico</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Località *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlant.location}
                    onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="es. Brindisi (BR)"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comune
                    </label>
                    <input
                      type="text"
                      value={newPlant.municipality || ''}
                      onChange={(e) => setNewPlant({ ...newPlant, municipality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Provincia
                    </label>
                    <input
                      type="text"
                      value={newPlant.province || ''}
                      onChange={(e) => setNewPlant({ ...newPlant, province: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      placeholder="es. BR"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Regione
                    </label>
                    <input
                      type="text"
                      value={newPlant.region || ''}
                      onChange={(e) => setNewPlant({ ...newPlant, region: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select 
                    required
                    value={newPlant.status}
                    onChange={(e) => setNewPlant({ ...newPlant, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="In Autorizzazione">In Autorizzazione</option>
                    <option value="In Costruzione">In Costruzione</option>
                    <option value="In Esercizio">In Esercizio</option>
                    <option value="Dismesso">Dismesso</option>
                  </select>
                </div>
              </div>
              
              {/* Error message in modal */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={saving}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Salvataggio...' : 'Salva plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plants;