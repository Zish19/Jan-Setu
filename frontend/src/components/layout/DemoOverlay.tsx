'use client';

import { useEffect, useState } from 'react';
import { useMachine } from '@xstate/react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoMachine } from '@/store/demo.machine';
import script from '@/config/demo-script.json';
import { useRouter, usePathname } from 'next/navigation';

export default function DemoOverlay() {
  const [state, send] = useMachine(demoMachine);
  const router = useRouter();
  const pathname = usePathname();
  
  // Expose global demo control for testing/presentation
  useEffect(() => {
    (window as any).startDemo = () => send({ type: 'START' });
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.value === 'idle') return;
      if (e.code === 'Space') {
        if (state.value === 'playing') send({ type: 'PAUSE' });
        else if (state.value === 'paused') send({ type: 'RESUME' });
      }
      if (e.code === 'ArrowRight') send({ type: 'NEXT' });
      if (e.code === 'ArrowLeft') send({ type: 'PREV' });
      if (e.code === 'Escape') send({ type: 'STOP' });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [send, state.value]);

  // Orchestration logic based on scene changes
  useEffect(() => {
    if (state.value === 'idle' || state.value === 'finished') return;
    
    const currentScene = script[state.context.currentSceneIndex];
    
    // Example Routing Coordinator
    if (currentScene.scene === 'dashboard' || currentScene.scene === 'optimizer' || currentScene.scene === 'assistant') {
      if (pathname !== '/dashboard') router.push('/dashboard');
    } else if (currentScene.scene === 'trust') {
      if (pathname !== '/trust') router.push('/trust');
    } else {
      if (pathname !== '/') router.push('/');
    }

    // Broadcast the action to the rest of the application
    window.dispatchEvent(new CustomEvent('demoAction', { detail: currentScene.action }));

  }, [state.context.currentSceneIndex, state.value, pathname, router]);

  if (state.value === 'idle') return null;

  const currentScene = script[state.context.currentSceneIndex];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 pointer-events-none"
      >
        {/* Status Overlay */}
        <div className="neo-box bg-neo-accent text-white p-3 font-bold flex flex-col items-center pointer-events-auto shadow-2xl">
          <div className="text-[10px] tracking-widest uppercase mb-1 opacity-80 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.value === 'playing' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            DEMO MODE {state.value === 'paused' ? '(PAUSED)' : ''}
          </div>
          <div className="text-xl font-black uppercase">{currentScene.scene}</div>
          <div className="flex gap-4 mt-1 text-sm">
            <span>Scene {state.context.currentSceneIndex + 1} / {state.context.totalScenes}</span>
            <span className="font-mono">{state.context.remainingTime}s</span>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="neo-box bg-neo-surface text-neo-text p-3 font-mono text-[10px] pointer-events-auto flex flex-col gap-1 w-48 shadow-2xl">
          <div className="font-black uppercase border-b-2 border-neo-border pb-1 mb-1">Metrics</div>
          <div className="flex justify-between"><span>Pipeline Time:</span> <span>1.2s</span></div>
          <div className="flex justify-between"><span>Gemini Calls:</span> <span>4</span></div>
          <div className="flex justify-between"><span>Opt Time:</span> <span>80ms</span></div>
          <div className="flex justify-between"><span>Cache Hit:</span> <span className="text-neo-success font-bold">92%</span></div>
          <div className="flex justify-between"><span>API Latency:</span> <span>45ms</span></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
