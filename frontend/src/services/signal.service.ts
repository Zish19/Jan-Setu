import { apiClient } from '../lib/api/client';
import { ApiResponse, PaginatedResponse } from '../lib/api/types';

export interface CreateSignalPayload {
  text: string;
  lat: number;
  lng: number;
  image_base64?: string;
  audio_base64?: string;
}

export interface Signal {
  id: string;
  text: string;
  category: string;
  status: string;
  cluster_id?: string;
  createdAt: string;
}

export const SignalService = {
  createSignal: async (payload: CreateSignalPayload): Promise<ApiResponse<any>> => {
    return apiClient.post('/signals', payload);
  },
  
  getSignal: async (id: string): Promise<ApiResponse<Signal>> => {
    return apiClient.get(`/signals/${id}`);
  },
  
  listSignals: async (params?: Record<string, any>): Promise<PaginatedResponse<Signal>> => {
    return apiClient.get('/signals', { params });
  }
};
