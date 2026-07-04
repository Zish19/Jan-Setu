import { create } from 'zustand';

interface DemoState {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  simulateIncomingReport: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemoMode: false,
  
  toggleDemoMode: () => set((state) => ({ 
    isDemoMode: !state.isDemoMode 
  })),
  
  simulateIncomingReport: () => {
    // In a real implementation, this would dispatch events 
    // to the pipeline store to simulate a live incoming issue.
    console.log("Simulating incoming report...");
  }
}));
