import { create } from 'zustand';

export type PipelineStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface PipelineEvent {
  id: string;
  name: string;
  status: PipelineStatus;
  timestamp?: number;
  duration?: number;
  progress?: number;
}

export const INITIAL_PIPELINE_EVENTS: PipelineEvent[] = [
  { id: 'received', name: 'Received', status: 'pending' },
  { id: 'translation', name: 'Translation', status: 'pending' },
  { id: 'vision', name: 'Vision', status: 'pending' },
  { id: 'categorization', name: 'Categorization', status: 'pending' },
  { id: 'embedding', name: 'Embedding', status: 'pending' },
  { id: 'clustering', name: 'Clustering', status: 'pending' },
  { id: 'verification', name: 'Verification', status: 'pending' },
  { id: 'priority', name: 'Priority Scoring', status: 'pending' },
  { id: 'explanation', name: 'Explanation', status: 'pending' },
  { id: 'completed', name: 'Completed', status: 'pending' },
];

interface PipelineState {
  isActive: boolean;
  events: PipelineEvent[];
  startPipeline: () => void;
  updateEvent: (id: string, updates: Partial<PipelineEvent>) => void;
  reset: () => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  isActive: false,
  events: INITIAL_PIPELINE_EVENTS,
  
  startPipeline: () => set({ 
    isActive: true, 
    events: INITIAL_PIPELINE_EVENTS.map((e, i) => i === 0 ? { ...e, status: 'completed', timestamp: Date.now() } : e)
  }),
  
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((event) => 
      event.id === id ? { ...event, ...updates } : event
    )
  })),
  
  reset: () => set({ isActive: false, events: INITIAL_PIPELINE_EVENTS }),
}));
