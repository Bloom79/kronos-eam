import React from 'react';
import { Filter, MapPin, Zap, Calendar, Building2 } from 'lucide-react';
import { PlantTypeEnum, WorkflowCategoryEnum } from '../../types';
import clsx from 'clsx';

interface WorkflowFilterProps {
  filters: {
    region: string;
    province: string;
    city: string;
    plantType: string;
    powerRange: string;
    workflowCategory: string;
    dateRange: string;
  };
  onFilterChange: (filters: any) => void;
  regions: string[];
  provinces: string[];
  cities: string[];
}

const WorkflowFilter: React.FC<WorkflowFilterProps> = ({
  filters,
  onFilterChange,
  regions,
  provinces,
  cities
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Filtri</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
              {activeFiltersCount} attivi
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? 'Nascondi' : 'Mostra tutti'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Location Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Regione
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
          >
            <option value="all">Tutte le regioni</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {filters.region !== 'all' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin className="inline h-4 w-4 mr-1" />
              Provincia
            </label>
            <select
              value={filters.province}
              onChange={(e) => handleFilterChange('province', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
            >
              <option value="all">Tutte le province</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        )}

        {filters.province !== 'all' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin className="inline h-4 w-4 mr-1" />
              Comune
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
            >
              <option value="all">Tutti i comuni</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}

        {/* Plant Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Building2 className="inline h-4 w-4 mr-1" />
            Tipo Impianto
          </label>
          <select
            value={filters.plantType}
            onChange={(e) => handleFilterChange('plantType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
          >
            <option value="all">Tutti i tipi</option>
            <option value="Photovoltaic">Fotovoltaico</option>
            <option value="Wind">Eolico</option>
            <option value="Hydroelectric">Idroelettrico</option>
            <option value="Biomass">Biomasse</option>
            <option value="Geothermal">Geotermico</option>
          </select>
        </div>

        {isExpanded && (
          <>
            {/* Power Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Zap className="inline h-4 w-4 mr-1" />
                Potenza
              </label>
              <select
                value={filters.powerRange}
                onChange={(e) => handleFilterChange('powerRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
              >
                <option value="all">Tutte le potenze</option>
                <option value="0-20">0-20 kW</option>
                <option value="20-100">20-100 kW</option>
                <option value="100-500">100-500 kW</option>
                <option value="500-1000">500 kW - 1 MW</option>
                <option value="1000+">Oltre 1 MW</option>
              </select>
            </div>

            {/* Workflow Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Filter className="inline h-4 w-4 mr-1" />
                Categoria Workflow
              </label>
              <select
                value={filters.workflowCategory}
                onChange={(e) => handleFilterChange('workflowCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
              >
                <option value="all">Tutte le categorie</option>
                <option value="Activation">Attivazione</option>
                <option value="Fiscal">Fiscale</option>
                <option value="Incentives">Incentivi</option>
                <option value="Changes">Modifiche</option>
                <option value="Maintenance">Manutenzione</option>
                <option value="Compliance">Conformità</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Periodo
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
              >
                <option value="all">Tutti i periodi</option>
                <option value="today">Oggi</option>
                <option value="week">Questa settimana</option>
                <option value="month">Questo mese</option>
                <option value="quarter">Questo trimestre</option>
                <option value="year">Quest'anno</option>
              </select>
            </div>
          </>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro attivo' : 'filtri attivi'}
          </p>
          <button
            onClick={() => onFilterChange({
              region: 'all',
              province: 'all',
              city: 'all',
              plantType: 'all',
              powerRange: 'all',
              workflowCategory: 'all',
              dateRange: 'all'
            })}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Rimuovi tutti i filtri
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowFilter;