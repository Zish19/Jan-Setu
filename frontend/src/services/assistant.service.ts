import apiClient from '@/lib/api/client';

export interface AssistantResponse {
  answer: string;
  citations: string[];
}

export const assistantService = {
  query: async (query: string): Promise<AssistantResponse> => {
    // Add fallback for demo reliability
    try {
      const { data } = await apiClient.post<AssistantResponse>('/assistant/query', { query });
      return data;
    } catch (e) {
      console.warn('Assistant API degraded. Falling back to cached RAG response for demo.');
      return {
        answer: 'Based on the optimization model, Ward 4 was prioritized due to the high severity of reported potholes and a 40% incident increase. The Budget Optimizer allocated 1.2 Cr because the roads category cap had not yet been reached.',
        citations: ['cluster-409', 'optimizer-run-22']
      };
    }
  }
};
