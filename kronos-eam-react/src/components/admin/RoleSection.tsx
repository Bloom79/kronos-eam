import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  UserPlus,
  CheckSquare
} from 'lucide-react';
import { User, UserRole } from '../../services/api';
import UserCard from './UserCard';
import clsx from 'clsx';

interface RoleSectionProps {
  role: UserRole;
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onSelectUser?: (user: User, selected: boolean) => void;
  selectedUsers?: Set<string>;
  onSelectAll?: (role: UserRole, users: User[]) => void;
  expanded?: boolean;
}

const roleDescriptions: Record<UserRole, { description: string; permissions: string[] }> = {
  'Admin': {
    description: 'Accesso completo a tutte le funzionalità della piattaforma',
    permissions: [
      'Gestione utenti e ruoli',
      'Configurazione sistema',
      'Accesso a tutti gli impianti',
      'Gestione workflow e template',
      'Report e analytics avanzati'
    ]
  },
  'Asset Manager': {
    description: 'Gestione completa degli impianti assegnati',
    permissions: [
      'Gestione impianti assegnati',
      'Creazione e gestione workflow',
      'Upload e gestione documenti',
      'Visualizzazione report',
      'Gestione scadenze'
    ]
  },
  'Plant Owner': {
    description: 'Proprietario dell\'impianto con accesso completo ai propri asset',
    permissions: [
      'Accesso completo ai propri impianti',
      'Visualizzazione documenti e certificazioni',
      'Monitoraggio conformità normativa',
      'Autorizzazione attività critiche',
      'Accesso report finanziari e GSE'
    ]
  },
  'Operative': {
    description: 'Esecuzione operativa sui workflow assegnati',
    permissions: [
      'Completamento task assegnati',
      'Upload documenti',
      'Aggiornamento stato workflow',
      'Visualizzazione impianti assegnati'
    ]
  },
  'Viewer': {
    description: 'Accesso in sola lettura',
    permissions: [
      'Visualizzazione impianti',
      'Visualizzazione workflow',
      'Download documenti',
      'Visualizzazione report base'
    ]
  }
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'Admin':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
    case 'Asset Manager':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
    case 'Operative':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
    case 'Viewer':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  }
};

const RoleSection: React.FC<RoleSectionProps> = ({
  role,
  users,
  onEditUser,
  onDeleteUser,
  onResetPassword,
  onToggleStatus,
  onSelectUser,
  selectedUsers,
  onSelectAll,
  expanded: initialExpanded = true
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [showPermissions, setShowPermissions] = useState(false);

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const suspendedUsers = users.filter(u => u.status === 'Suspended').length;
  const invitedUsers = users.filter(u => u.status === 'Invited').length;

  const checkboxRef = useRef<HTMLInputElement>(null);
  
  const isAllSelected = onSelectUser && selectedUsers && 
    users.length > 0 && 
    users.every(user => selectedUsers.has(user.id));

  const isSomeSelected = onSelectUser && selectedUsers &&
    users.some(user => selectedUsers.has(user.id)) && !isAllSelected;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isSomeSelected || false;
    }
  }, [isSomeSelected]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-1">
              {expanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <div className={clsx(
              'p-2 rounded-lg',
              getRoleIcon(role)
            )}>
              <Shield className="h-5 w-5" />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {role}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {roleDescriptions[role].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Users className="inline h-3 w-3 mr-1" />
                {users.length} totali
              </span>
              {activeUsers > 0 && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                  {activeUsers} attivi
                </span>
              )}
              {suspendedUsers > 0 && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full">
                  {suspendedUsers} sospesi
                </span>
              )}
              {invitedUsers > 0 && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                  {invitedUsers} invitati
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <>
          {/* Permissions */}
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPermissions(!showPermissions);
              }}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showPermissions ? 'Nascondi' : 'Mostra'} permessi del ruolo
            </button>
            
            {showPermissions && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Permessi:
                </h4>
                <ul className="space-y-1">
                  {roleDescriptions[role].permissions.map((permission, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckSquare className="h-3 w-3 mt-0.5 text-green-600 dark:text-green-400" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {onSelectAll && users.length > 0 && (
            <div className="px-4 pb-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => onSelectAll(role, users)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Seleziona tutti
                </span>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="p-4 pt-0 space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nessun utente con ruolo {role}</p>
              </div>
            ) : (
              users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={onEditUser}
                  onDelete={onDeleteUser}
                  onResetPassword={onResetPassword}
                  onToggleStatus={onToggleStatus}
                  onSelect={onSelectUser}
                  selected={selectedUsers?.has(user.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSection;