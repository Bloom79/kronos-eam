import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Shield,
  Activity,
  Clock
} from 'lucide-react';
import {
  User,
  UserRole,
  UserStatus,
  UserFilters,
  usersService,
  BulkOperation
} from '../services/api';
import UserCard from '../components/admin/UserCard';
import RoleSection from '../components/admin/RoleSection';
import UserModal from '../components/admin/UserModal';
import clsx from 'clsx';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    status: undefined,
    role: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers({
        ...filters,
        search: searchTerm || undefined
      });
      setUsers(response.items);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await usersService.createUser(data);
      loadUsers();
      setShowUserModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;
    try {
      await usersService.updateUser(editingUser.id, data);
      loadUsers();
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'utente ${user.name}?`)) return;
    
    try {
      await usersService.deleteUser(user.id);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Inviare una nuova password a ${user.email}?`)) return;
    
    try {
      await usersService.resetPassword(user.id);
      alert('Password reset inviata via email');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await usersService.updateUser(user.id, {
        status: user.status === 'Active' ? 'Suspended' : 'Active'
      });
      loadUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleSelectUser = (user: User, selected: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (selected) {
      newSelection.add(user.id);
    } else {
      newSelection.delete(user.id);
    }
    setSelectedUsers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleSelectAll = (role: UserRole, roleUsers: User[]) => {
    const newSelection = new Set(selectedUsers);
    const allSelected = roleUsers.every(u => newSelection.has(u.id));
    
    if (allSelected) {
      roleUsers.forEach(u => newSelection.delete(u.id));
    } else {
      roleUsers.forEach(u => newSelection.add(u.id));
    }
    
    setSelectedUsers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleBulkOperation = async (operation: BulkOperation['operation'], params?: any) => {
    if (!window.confirm(`Eseguire l'operazione su ${selectedUsers.size} utenti?`)) return;
    
    try {
      await usersService.bulkOperation({
        userIds: Array.from(selectedUsers),
        operation,
        params
      });
      loadUsers();
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error in bulk operation:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await usersService.exportUsers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const groupUsersByRole = () => {
    const groups: Record<UserRole, User[]> = {
      'Admin': [],
      'Asset Manager': [],
      'Plant Owner': [],
      'Operative': [],
      'Viewer': []
    };

    users.forEach(user => {
      groups[user.role].push(user);
    });

    return groups;
  };

  const userGroups = groupUsersByRole();

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Gestione Utenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestisci gli utenti e i loro ruoli nella piattaforma
            </p>
          </div>
          
          <button
            onClick={() => {
              setEditingUser(null);
              setShowUserModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Nuovo Utente
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Utenti Totali</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Utenti Attivi</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.byStatus?.Active || 0}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400 opacity-20" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sospesi</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.byStatus?.Suspended || 0}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600 dark:text-red-400 opacity-20" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attivi Oggi</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.activeToday || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questa Settimana</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.activeThisWeek || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-20" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome o email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value as UserStatus })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">Tutti gli stati</option>
              <option value="Active">Attivi</option>
              <option value="Suspended">Sospesi</option>
              <option value="Invited">Invitati</option>
            </select>

            <select
              value={filters.role || 'all'}
              onChange={(e) => setFilters({ ...filters, role: e.target.value === 'all' ? undefined : e.target.value as UserRole })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">Tutti i ruoli</option>
              <option value="Admin">Admin</option>
              <option value="Asset Manager">Asset Manager</option>
              <option value="Operative">Operative</option>
              <option value="Viewer">Viewer</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Esporta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200">
                {selectedUsers.size} utenti selezionati
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkOperation('activate')}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Attiva
              </button>
              <button
                onClick={() => handleBulkOperation('suspend')}
                className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Sospendi
              </button>
              <button
                onClick={() => handleBulkOperation('delete')}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Elimina
              </button>
              <button
                onClick={() => {
                  setSelectedUsers(new Set());
                  setShowBulkActions(false);
                }}
                className="px-3 py-1.5 text-sm bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users by Role */}
      <div className="space-y-6">
        {Object.entries(userGroups).map(([role, roleUsers]) => (
          <RoleSection
            key={role}
            role={role as UserRole}
            users={roleUsers}
            onEditUser={(user) => {
              setEditingUser(user);
              setShowUserModal(true);
            }}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleToggleStatus}
            onSelectUser={handleSelectUser}
            selectedUsers={selectedUsers}
            onSelectAll={handleSelectAll}
          />
        ))}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSave={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
        mode={editingUser ? 'edit' : 'create'}
      />
    </div>
  );
};

export default UserManagement;