import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Shield,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { User, UserRole, UserCreate, UserUpdate, plantsService, Plant } from '../../services/api';
import clsx from 'clsx';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserCreate | UserUpdate) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit';
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  mode
}) => {
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    email: '',
    role: 'Viewer',
    phone: '',
    department: '',
    position: '',
    plants: [],
    sendInvite: true
  });
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPlantSelector, setShowPlantSelector] = useState(false);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        plants: user.plants || [],
        sendInvite: false
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Viewer',
        phone: '',
        department: '',
        position: '',
        plants: [],
        sendInvite: true
      });
    }
    setErrors({});
  }, [user, mode]);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const response = await plantsService.getPlants();
      setPlants(response.items);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome richiesto';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email richiesta';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrors({ submit: error.response.data.detail });
      } else {
        setErrors({ submit: 'Errore durante il salvataggio' });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePlant = (plantId: number) => {
    setFormData(prev => ({
      ...prev,
      plants: prev.plants?.includes(plantId)
        ? prev.plants.filter(id => id !== plantId)
        : [...(prev.plants || []), plantId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {mode === 'create' ? 'Nuovo Utente' : 'Modifica Utente'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Informazioni Base
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100',
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    )}
                    placeholder="Mario Rossi"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={mode === 'edit'}
                      className={clsx(
                        'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100',
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
                        mode === 'edit' && 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed'
                      )}
                      placeholder="mario.rossi@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={clsx(
                        'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100',
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      )}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ruolo *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Asset Manager">Asset Manager</option>
                      <option value="Operative">Operative</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dipartimento
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Operations"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Posizione
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Manager"
                  />
                </div>
              </div>
            </div>

            {/* Plant Access */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Accesso Impianti
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPlantSelector(!showPlantSelector)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showPlantSelector ? 'Nascondi' : 'Seleziona'} impianti
                </button>
              </div>

              {formData.plants && formData.plants.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.plants.length} {formData.plants.length === 1 ? 'impianto selezionato' : 'impianti selezionati'}
                </div>
              )}

              {showPlantSelector && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                  {plants.map(plant => (
                    <label key={plant.id} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.plants?.includes(plant.id) || false}
                        onChange={() => togglePlant(plant.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">
                          {plant.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {plant.location} • {plant.power}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Send Invite Option */}
            {mode === 'create' && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendInvite"
                  checked={formData.sendInvite}
                  onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="sendInvite" className="text-sm text-gray-700 dark:text-gray-300">
                  Invia email di invito con credenziali di accesso
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvataggio...' : mode === 'create' ? 'Crea Utente' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;