'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

// Mock data for the MVP Optimizer
const MOCK_CATEGORIES = [
  { name: 'Roads', allocated: 80, color: 'bg-neo-danger' },
  { name: 'Healthcare', allocated: 45, color: 'bg-neo-accent' },
  { name: 'Education', allocated: 60, color: 'bg-blue-500' },
  { name: 'Water', allocated: 30, color: 'bg-blue-300' },
];

const MOCK_RECOMMENDED = [
  { id: '1', name: 'Ward 4 Road Repair', cost: '₹45L', priority: 95, explanation: 'High volume of severe road hazard reports in a concentrated 2km radius.' },
  { id: '2', name: 'Sector 12 Clinic Supply', cost: '₹12L', priority: 88, explanation: 'Critical medicine shortage reported by 50+ residents.' },
];

const MOCK_REJECTED = [
  { id: '3', name: 'Park Renovation', cost: '₹25L', priority: 40, reason: 'Category cap exceeded for non-essential infrastructure.' },
];

export default function BudgetOptimizerPanel({
  onSelectProject
}: {
  onSelectProject: (id: string) => void;
}) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const runOptimization = () => {
    setIsOptimizing(true);
    setHasResults(false);
    setTimeout(() => {
      setIsOptimizing(false);
      setHasResults(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b-4 border-neo-border bg-neo-surface">
        <h3 className="font-black uppercase mb-4 text-xl">Budget Optimization</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase opacity-70">Total Budget (MPLADS)</label>
            <input type="text" defaultValue="₹5,00,00,000" className="w-full neo-box p-2 mt-1 font-mono font-bold" />
          </div>
          
          <Button 
            className="w-full text-lg" 
            variant="primary" 
            onClick={runOptimization}
            disabled={isOptimizing}
          >
            {isOptimizing ? 'Running CP-SAT Solver...' : 'Run Optimization'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-neo-bg space-y-8">
        
        <AnimatePresence>
          {isOptimizing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="neo-box p-4 bg-neo-surface flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 font-bold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-neo-accent" />
                Applying Budget Constraints...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasResults && !isOptimizing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Allocation Bars */}
            <div className="space-y-4">
              <h4 className="font-black uppercase text-sm border-b-2 border-neo-border pb-1">Allocation</h4>
              {MOCK_CATEGORIES.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{cat.name}</span>
                    <span>{cat.allocated}%</span>
                  </div>
                  <div className="h-4 w-full bg-white border-2 border-neo-border">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.allocated}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${cat.color} border-r-2 border-neo-border`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Projects */}
            <div className="space-y-4">
              <h4 className="font-black uppercase text-sm border-b-2 border-neo-border pb-1 text-neo-success">Recommended Projects</h4>
              {MOCK_RECOMMENDED.map(proj => (
                <div 
                  key={proj.id} 
                  className="neo-box p-4 bg-neo-surface cursor-pointer hover:bg-white transition-colors"
                  onClick={() => onSelectProject(proj.id)}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-lg leading-none">{proj.name}</span>
                    <span className="font-mono font-bold text-neo-accent">{proj.cost}</span>
                  </div>
                  <div className="mt-2 text-sm italic opacity-80">{proj.explanation}</div>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs font-bold bg-neo-bg px-2 py-1 neo-box">Score: {proj.priority}/100</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rejected Projects */}
            <div className="space-y-4">
              <h4 className="font-black uppercase text-sm border-b-2 border-neo-border pb-1 text-neo-danger">Rejected / Deferred</h4>
              {MOCK_REJECTED.map(proj => (
                <div key={proj.id} className="neo-box p-4 bg-gray-200 opacity-80">
                  <div className="flex justify-between items-start">
                    <span className="font-bold line-through">{proj.name}</span>
                    <span className="font-mono font-bold text-neo-danger">{proj.cost}</span>
                  </div>
                  <div className="mt-2 text-sm text-neo-danger font-bold">Reason: {proj.reason}</div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
