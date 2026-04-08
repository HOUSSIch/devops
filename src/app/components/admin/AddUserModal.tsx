import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: any) => Promise<void>; // ← Changé pour accepter une Promise
  loading?: boolean;
}

export function AddUserModal({ isOpen, onClose, onAdd, loading }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    username: "", // ← Changé de "name" à "username"
    email: "",
    password: "", // ← Ajout du champ password
    firstName: "",
    lastName: "",
    role: "free", // ← Changé pour correspondre au backend
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await onAdd({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
      });
      
      // Réinitialiser le formulaire seulement si succès
      setFormData({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "free",
      });
      setErrors({});
      onClose();
    } catch (error) {
      // L'erreur est gérée par le parent
      console.error("Erreur dans le modal:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-purple-100 dark:border-purple-800/30">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 id="modal-title" className="text-2xl font-bold text-gray-800 dark:text-white">
                  Ajouter un utilisateur
                </h2>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Nom d'utilisateur *
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white ${
                      errors.username ? 'border-red-500' : 'border-purple-200 dark:border-purple-700'
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-purple-200 dark:border-purple-700'
                    }`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white ${
                      errors.password ? 'border-red-500' : 'border-purple-200 dark:border-purple-700'
                    }`}
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    disabled={loading}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    disabled={loading}
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Rôle
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    disabled={loading}
                  >
                    <option value="free">Utilisateur gratuit</option>
                    <option value="premium">Utilisateur Premium</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-purple-200 dark:border-purple-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Création...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}