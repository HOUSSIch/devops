// src/pages/admin/UsersManagement.tsx
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Search, Filter, UserPlus, Mail, Calendar, Shield, 
  Edit, Trash2, RefreshCw, Ban, CheckCircle, AlertCircle,
  ChevronLeft, ChevronRight, Key
} from "lucide-react";
import { AddUserModal } from "../../components/admin/AddUserModal";
import { EditUserModal } from "../../components/admin/EditUserModal";
import { toast } from "sonner";
import { http } from "../../api/http";

// Interface basée sur les données Keycloak
interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
  attributes?: Record<string, any>;
}

// Interface pour l'affichage
interface UserDisplay {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  emailVerified: boolean;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
}

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserDisplay | null>(null);
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/users`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          role: filterRole !== 'all' ? filterRole : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      
      // Transformer les données
      const formattedUsers = response.data.map((user: KeycloakUser) => ({
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
        username: user.username,
        email: user.email || 'Email non renseigné',
        role: user.attributes?.role?.[0] || determineUserRole(user),
        status: user.enabled ? 'active' : 'inactive',
        joinDate: new Date(user.createdTimestamp).toISOString().split('T')[0],
        emailVerified: user.emailVerified,
        enabled: user.enabled,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));

      setUsers(formattedUsers);
      setTotalUsers(parseInt(response.headers['x-total-count']) || formattedUsers.length);
    } catch (error: any) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      toast.error(error.response?.data?.message || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Déterminer le rôle
  const determineUserRole = (user: KeycloakUser): string => {
    if (user.attributes?.premium === 'true') return 'Premium User';
    if (user.attributes?.role === 'admin') return 'Administrateur';
    return 'Utilisateur gratuit';
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterRole, filterStatus]);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddUser = async (userData: any) => {
    try {
      setActionLoading('add');
      await http.post('/admin/users', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        enabled: true,
        attributes: {
          role: userData.role || 'free'
        }
      });
      
      toast.success('✅ Utilisateur ajouté avec succès!');
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setActionLoading(null);
    }
  };

  // ✏️ Fonction pour ouvrir le modal d'édition
  const handleEditUser = (user: UserDisplay) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  // ✏️ Fonction pour mettre à jour l'utilisateur
  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      setActionLoading(userId);
      await http.put(`/admin/users/${userId}`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        attributes: {
          role: userData.role === 'premium' ? 'premium' : 'free'
        }
      });
      
      toast.success("✅ Utilisateur mis à jour");
      setIsEditModalOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur?")) return;
    
    try {
      setActionLoading(id);
      await http.delete(`/admin/users/${id}`);
      toast.success("✅ Utilisateur supprimé");
      fetchUsers();
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (user: UserDisplay) => {
    try {
      setActionLoading(user.id);
      const action = user.enabled ? 'block' : 'unblock';
      await http.patch(`/admin/users/${user.id}/${action}`);
      
      toast.success(`✅ Utilisateur ${user.enabled ? 'bloqué' : 'débloqué'}`);
      fetchUsers();
    } catch (error: any) {
      console.error('❌ Erreur changement statut:', error);
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔑 Fonction pour réinitialiser le mot de passe (inchangée)
  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt("🔑 Entrez le nouveau mot de passe:");
    if (!newPassword) return;
    
    try {
      setActionLoading(userId);
      await http.patch(`/admin/users/${userId}/password`, { password: newPassword });
      toast.success("✅ Mot de passe réinitialisé");
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8b63d3] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
            >
              <option value="all">Tous les rôles</option>
              <option value="premium">Premium</option>
              <option value="free">Gratuit</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/30 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 dark:bg-purple-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Utilisateur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Rôle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Inscription</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=8b63d3&color=fff&size=40`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Shield className={`w-4 h-4 ${
                            user.role === 'Premium User' ? 'text-yellow-500' : 
                            user.role === 'Administrateur' ? 'text-purple-500' : 'text-gray-400'
                          }`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {user.role}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {user.emailVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* ✏️ Bouton Modifier (profil) */}
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={actionLoading === user.id}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Modifier le profil"
                          >
                            <Edit className="w-4 h-4 text-[#8b63d3]" />
                          </button>

                          {/* 🔑 Bouton Réinitialiser mot de passe */}
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Changer le mot de passe"
                          >
                            <Key className="w-4 h-4 text-orange-500" />
                          </button>

                          {/* 🚫 Bouton Bloquer/Débloquer */}
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={actionLoading === user.id}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title={user.enabled ? 'Bloquer' : 'Débloquer'}
                          >
                            {user.enabled ? (
                              <Ban className="w-4 h-4 text-orange-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </button>

                          {/* 🗑️ Bouton Supprimer */}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {users.length} sur {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''}
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={users.length < itemsPerPage}
                  className="p-2 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddUser}
        loading={actionLoading === 'add'}
      />

      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }} 
        onUpdate={handleUpdateUser}
        user={userToEdit}
        loading={actionLoading === userToEdit?.id}
      />
    </div>
  );
}