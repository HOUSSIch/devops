// src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardStats } from '../app/api/dashboard.service';
import { toast } from 'sonner';

interface UseDashboardDataReturn {
  data: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useDashboardData = (
  timeframe: 'week' | 'month' | 'year' = 'month',
  autoRefresh: boolean = true
): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Fonction pour charger les données
  const loadData = useCallback(async (isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      const stats = await dashboardService.getStats();
      
      // Si c'est un load more, on concatène les données
      if (isLoadMore && data) {
        setData({
          ...stats,
          recentUsers: [...data.recentUsers, ...stats.recentUsers],
          recentAnalyses: [...data.recentAnalyses, ...stats.recentAnalyses],
          userGrowth: [...data.userGrowth, ...stats.userGrowth],
        });
        
        // Vérifier s'il y a plus de données à charger
        setHasMore(stats.recentUsers.length > 0);
      } else {
        setData(stats);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(new Error(errorMessage));
      toast.error('Erreur lors du chargement des données');
      console.error('Erreur useDashboardData:', err);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [data]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(async () => {
    setPage(1);
    await loadData(false);
    toast.success('Données actualisées avec succès');
  }, [loadData]);

  // Fonction pour charger plus de données
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setPage(prev => prev + 1);
    await loadData(true);
  }, [isLoadingMore, hasMore, loadData]);

  // Chargement initial et rafraîchissement périodique
  useEffect(() => {
    loadData(false);

    // Auto-refresh toutes les 5 minutes si activé
    let intervalId: ReturnType<typeof setInterval> | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        loadData(false);
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeframe, autoRefresh, loadData]);

  // Fonction pour mettre à jour une partie des données
  const updatePartialData = useCallback((updater: (prevData: DashboardStats) => DashboardStats) => {
    if (data) {
      setData(updater(data));
    }
  }, [data]);

  return {
    data,
    loading,
    error,
    refresh,
    isLoadingMore,
    hasMore,
    loadMore,
  };
};

// Hook pour gérer un type spécifique de données
export const useRecentUsers = (limit: number = 5) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRecentUsers(limit);
        setUsers(response);
      } catch (error) {
        console.error('Erreur chargement utilisateurs récents:', error);
        toast.error('Impossible de charger les utilisateurs récents');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [limit]);

  return { users, loading };
};

// Hook pour gérer les analyses récentes
export const useRecentAnalyses = (limit: number = 5) => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRecentAnalyses(limit);
        setAnalyses(response);
      } catch (error) {
        console.error('Erreur chargement analyses récentes:', error);
        toast.error('Impossible de charger les analyses récentes');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyses();
  }, [limit]);

  return { analyses, loading };
};

// Hook pour gérer la croissance des utilisateurs
export const useUserGrowth = (period: 'week' | 'month' | 'year' = 'month') => {
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrowthData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getUserGrowth(period);
        setGrowthData(data);
      } catch (error) {
        console.error('Erreur chargement données de croissance:', error);
        toast.error('Impossible de charger les données de croissance');
      } finally {
        setLoading(false);
      }
    };

    loadGrowthData();
  }, [period]);

  return { growthData, loading };
};

export default useDashboardData;