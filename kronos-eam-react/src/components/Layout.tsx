import React, { useState, ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Building2,
  GitBranch,
  Calendar,
  BookOpen,
  Zap,
  Link2,
  FileText,
  Shield,
  Settings,
  Bell,
  FileBarChart,
  Users,
  User,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import LanguageSelector from './common/LanguageSelector';
import clsx from 'clsx';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation(['common', 'workflows', 'plants']);

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: Home },
    { name: t('nav.plants'), href: '/plants', icon: Building2 },
    { name: t('nav.workflows'), href: '/workflows', icon: GitBranch },
    { name: t('workflows.templates'), href: '/workflow-templates', icon: FileText },
    { name: t('nav.agenda'), href: '/agenda', icon: Calendar },
    { name: t('nav.documents'), href: '/documents', icon: FileText },
    { name: t('nav.integrations'), href: '/integrations', icon: Link2 },
    { name: t('nav.compliance'), href: '/compliance', icon: Shield },
    { name: t('nav.reports'), href: '/reports', icon: FileBarChart },
    { name: t('nav.team'), href: '/team', icon: Users },
    { name: t('nav.aiAssistant'), href: '/ai-assistant', icon: Zap },
    { name: 'Process Guide', href: '/process-guide', icon: BookOpen },
  ];

  const adminNavigation = [
    { name: t('nav.administration'), href: '/administration', icon: Settings },
    { name: 'Gestione Utenti', href: '/admin/users', icon: Users },
  ];

  const isActive = (href: string) => location.pathname === href;

  const getPageTitle = () => {
    const current = navigation.find(item => isActive(item.href));
    if (current) return current.name;
    
    const admin = adminNavigation.find(item => isActive(item.href));
    if (admin) return admin.name;
    
    if (location.pathname === '/profile') return t('app.profile');
    if (location.pathname === '/notifications') return t('app.notifications');
    if (location.pathname === '/admin/users') return 'Gestione Utenti';
    if (location.pathname.startsWith('/plants/')) return t('plants.plantDetails');
    if (location.pathname.startsWith('/workflows/')) return t('workflows.workflowDetails');
    
    return 'Kronos EAM';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Kronos EAM</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'sidebar-link text-gray-300 hover:text-white',
                    isActive(item.href) && 'active'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-6 h-6 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {user?.ruolo === 'Admin' && (
              <>
                <div className="pt-6 mt-6 border-t border-gray-700">
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Amministrazione
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        'sidebar-link text-gray-300 hover:text-white',
                        isActive(item.href) && 'active'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-6 h-6 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <Link
              to="/profile"
              className={clsx(
                'sidebar-link text-gray-300 hover:text-white',
                isActive('/profile') && 'active'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <User className="w-6 h-6 mr-3" />
              Profilo & Fatturazione
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-100 md:ml-0">
                {getPageTitle()}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('app.search')}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Language selector */}
              <LanguageSelector />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 text-sm"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {user?.name || 'Utente'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.ruolo || 'Ruolo'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      {t('app.profile')}
                    </Link>
                    <Link
                      to="/notifications"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      {t('app.notifications')}
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        // Handle logout
                      }}
                    >
                      Esci
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;