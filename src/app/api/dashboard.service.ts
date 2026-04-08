// src/app/api/dashboard.service.ts
import { http } from './http';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalAnalyses: number;
  recentUsers: any[];
  recentAnalyses: any[];
  userGrowth: { date: string; count: number }[];
  productCategories: { name: string; value: number }[];
}

export const dashboardService = {
  // Récupérer les statistiques du dashboard
  async getStats(): Promise<DashboardStats> {
    // Vous pouvez créer des endpoints spécifiques dans votre backend
    // ou agréger plusieurs appels
    const [users, products, analyses] = await Promise.all([
      http.get('/admin/users?brief=true'),
      http.get('/admin/products?stats=true'),
      http.get('/admin/analyses?recent=true'),
    ]);

    return {
      totalUsers: users.data.total || users.data.length,
      activeUsers: users.data.active || 0,
      totalProducts: products.data.total || products.data.length,
      totalAnalyses: analyses.data.total || analyses.data.length,
      recentUsers: users.data.recent || users.data.slice(0, 5),
      recentAnalyses: analyses.data.recent || analyses.data.slice(0, 5),
      userGrowth: users.data.growth || generateMockGrowthData(),
      productCategories: products.data.categories || generateMockCategories(),
    };
  },

  // Récupérer les utilisateurs récents
  async getRecentUsers(limit: number = 5) {
    const response = await http.get(`/admin/users?limit=${limit}&sort=createdAt:desc`);
    return response.data;
  },

  // Récupérer les analyses récentes
  async getRecentAnalyses(limit: number = 5) {
    const response = await http.get(`/admin/analyses?limit=${limit}&sort=createdAt:desc`);
    return response.data;
  },

  // Récupérer les statistiques de croissance
  async getUserGrowth(period: 'week' | 'month' | 'year' = 'month') {
    const response = await http.get(`/admin/stats/user-growth?period=${period}`);
    return response.data;
  },
};

// Données mockées en attendant que votre backend les fournisse
const generateMockGrowthData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 20,
    });
  }
  return data;
};

const generateMockCategories = () => {
  return [
    { name: 'Hydratants', value: 35 },
    { name: 'Sérums', value: 25 },
    { name: 'Nettoyants', value: 20 },
    { name: 'Protections', value: 15 },
    { name: 'Traitements', value: 5 },
  ];
};