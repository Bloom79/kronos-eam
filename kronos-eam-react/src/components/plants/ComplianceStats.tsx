import React from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { Plant } from '../../services/api';

interface ComplianceStatsProps {
  plants: Plant[];
}

const ComplianceStats: React.FC<ComplianceStatsProps> = ({ plants }) => {
  // Calculate overall compliance statistics
  const calculateStats = () => {
    if (plants.length === 0) return {
      avgCompliance: 0,
      fullyCompliant: 0,
      warnings: 0,
      critical: 0,
      trend: 0
    };

    // Calculate average compliance score
    const totalScore = plants.reduce((sum, plant) => {
      const score = plant.checklist?.compliance_score || 0;
      return sum + score;
    }, 0);
    const avgCompliance = Math.round(totalScore / plants.length);

    // Count plants by compliance status
    const fullyCompliant = plants.filter(plant => {
      const score = plant.checklist?.compliance_score || 0;
      return score >= 90;
    }).length;

    const warnings = plants.filter(plant => {
      const score = plant.checklist?.compliance_score || 0;
      return score >= 60 && score < 90;
    }).length;

    const critical = plants.filter(plant => {
      const score = plant.checklist?.compliance_score || 0;
      return score < 60;
    }).length;

    // Mock trend (in real app would compare with previous period)
    const trend = 2.3;

    return {
      avgCompliance,
      fullyCompliant,
      warnings,
      critical,
      trend
    };
  };

  const stats = calculateStats();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/50';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/50';
    return 'bg-red-100 dark:bg-red-900/50';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Conformità Normativa Portfolio
        </h3>
        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Average Compliance Score */}
        <div className={clsx('rounded-lg p-4', getScoreBgColor(stats.avgCompliance))}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Punteggio Medio</p>
              <p className={clsx('text-2xl font-bold mt-1', getScoreColor(stats.avgCompliance))}>
                {stats.avgCompliance}%
              </p>
            </div>
            <div className={clsx('p-2 rounded-full', getScoreBgColor(stats.avgCompliance))}>
              <Shield className="h-5 w-5" />
            </div>
          </div>
          {stats.trend !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={clsx(
                'h-4 w-4',
                stats.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )} />
              <span className={clsx(
                'text-xs font-medium',
                stats.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {stats.trend > 0 ? '+' : ''}{stats.trend}%
              </span>
            </div>
          )}
        </div>

        {/* Fully Compliant */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pienamente Conformi</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.fullyCompliant}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {plants.length > 0 ? `${Math.round(stats.fullyCompliant / plants.length * 100)}%` : '0%'} del totale
          </p>
        </div>

        {/* Warnings */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attenzione</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.warnings}
              </p>
            </div>
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Richiedono intervento
          </p>
        </div>

        {/* Critical */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critici</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.critical}
              </p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Azione immediata
          </p>
        </div>

        {/* Next Deadline */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Prossima Scadenza</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                16 Dic
              </p>
            </div>
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Diritto annuale Dogane
          </p>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Scadenze Imminenti (30 giorni)
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Pagamento diritto annuale Dogane</span>
            <span className="font-medium text-red-600 dark:text-red-400">16 Dic 2024</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Dichiarazione consumi annuale</span>
            <span className="font-medium text-yellow-600 dark:text-yellow-400">31 Mar 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStats;