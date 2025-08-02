import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
  Wind,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error: authError } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Clear errors when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (remembered === 'true' && rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email è richiesta');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Inserisci un email valida');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password è richiesta');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('La password deve essere di almeno 6 caratteri');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }

      await login(formData.email, formData.password);
      
      // Navigation will be handled by the redirect logic above
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Credenziali non valide. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));

    // Clear errors on change
    if (name === 'email' && emailError) {
      setEmailError('');
    }
    if (name === 'password' && passwordError) {
      setPasswordError('');
    }
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md px-6 py-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95 overflow-hidden">
          <div className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Wind className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Kronos EAM
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sistema di gestione per plants di energia rinnovabile
              </p>
            </div>

            {/* Demo Credentials Info */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Credenziali Demo</p>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                    <p>Admin 1: demo@kronos-eam.local • Password: Demo123!</p>
                    <p>Admin 2: mario.rossi@energysolutions.it • Password: Demo123!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={clsx(
                      'h-5 w-5',
                      emailError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                    )} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={clsx(
                      'block w-full pl-10 pr-3 py-2.5 border rounded-lg',
                      'bg-white dark:bg-gray-700',
                      'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                      'focus:outline-none focus:ring-2 transition-colors',
                      emailError
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    )}
                    placeholder="name@azienda.com"
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={clsx(
                      'h-5 w-5',
                      passwordError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                    )} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={clsx(
                      'block w-full pl-10 pr-10 py-2.5 border rounded-lg',
                      'bg-white dark:bg-gray-700',
                      'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                      'focus:outline-none focus:ring-2 transition-colors',
                      passwordError
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Ricordami
                  </label>
                </div>
                <Link
                  to="#"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Password dimenticata?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm',
                  'text-sm font-medium text-white',
                  'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200 transform hover:scale-[1.02]'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">o</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Non hai un account?{' '}
              <Link
                to="#"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Contatta l'amministratore
              </Link>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-sm text-white/80">
          © {new Date().getFullYear()} Kronos EAM. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
};

export default Login;