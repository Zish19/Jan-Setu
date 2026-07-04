import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SignalService, CreateSignalPayload } from '../services/signal.service';

export const useSignals = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['signals', params],
    queryFn: () => SignalService.listSignals(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateSignal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateSignalPayload) => SignalService.createSignal(payload),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
