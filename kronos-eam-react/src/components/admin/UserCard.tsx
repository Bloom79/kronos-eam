import React, { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Clock,
  Building2,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { User, UserRole } from '../../services/api';
import clsx from 'clsx';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onSelect?: (user: User, selected: boolean) => void;
  selected?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  onSelect,
  selected = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Asset Manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Operative':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Invited':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatLastAccess = (date?: string) => {
    if (!date) return 'Mai effettuato accesso';
    
    const lastAccess = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Attivo ora';
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}g fa`;
    
    return lastAccess.toLocaleDateString('it-IT');
  };

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all',
      selected 
        ? 'border-blue-500 ring-2 ring-blue-500/20' 
        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(user, e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                  {user.name}
                </h4>
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  getRoleBadgeColor(user.role)
                )}>
                  {user.role}
                </span>
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  getStatusBadgeColor(user.status)
                )}>
                  {user.status === 'Active' ? 'Attivo' : 
                   user.status === 'Suspended' ? 'Sospeso' : 'Invitato'}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    <span>{user.department}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    Ultimo accesso: {formatLastAccess(user.lastAccess)}
                  </span>
                </div>
              </div>

              {user.plants && user.plants.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Shield className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Accesso a {user.plants.length} {user.plants.length === 1 ? 'impianto' : 'impianti'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                  <button
                    onClick={() => {
                      onEdit(user);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Modifica
                  </button>

                  <button
                    onClick={() => {
                      onToggleStatus(user);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    {user.status === 'Active' ? (
                      <>
                        <UserX className="h-4 w-4" />
                        Sospendi
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Attiva
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onResetPassword(user);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Reset Password
                  </button>

                  <hr className="my-1 border-gray-200 dark:border-gray-600" />

                  <button
                    onClick={() => {
                      onDelete(user);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;