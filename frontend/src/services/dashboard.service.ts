import apiClient from '@/lib/api/client';

export interface DashboardMetrics {
  active_reports: number;
  open_clusters: number;
  budget_utilized_cr: number;
  trust_score: number;
}

export interface Cluster {
  id: string;
  category: string;
  severity: number;
  description: string;
  location: { lat: number; lng: number };
  status: string;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get<{ data: DashboardMetrics }>('/dashboard/metrics');
    return data.data;
  },

  getClusters: async (): Promise<Cluster[]> => {
    const { data } = await apiClient.get<{ data: Cluster[] }>('/clusters');
    return data.data;
  }
};
