'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';

import BudgetOptimizerPanel from '@/features/dashboard/BudgetOptimizerPanel';
import AskJanSetuPanel from '@/features/dashboard/AskJanSetuPanel';

// Must disable SSR for Leaflet maps since it requires `window`
const ConstituencyMap = dynamic(() => import('@/features/dashboard/ConstituencyMap'), { ssr: false });

function KpiCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="neo-box p-6 bg-neo-surface flex flex-col justify-between"
    >
      <div className="text-sm font-bold text-neo-text/70 uppercase">{title}</div>
      <div className="text-4xl font-black mt-2 text-neo-accent">{value}</div>
      <div className="text-sm font-bold mt-4">{subtitle}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<'feed' | 'optimizer'>('feed');

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <KpiCard title="Active Reports" value="1,248" subtitle="+12% this week" />
        <KpiCard title="Open Clusters" value="84" subtitle="Needs MP Review" />
        <KpiCard title="Budget Utilized" value="2.4 Cr" subtitle="52% of MPLADS fund" />
        <KpiCard title="Trust Score" value="92%" subtitle="Community Confidence" />
      </div>

      {/* 3 Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Dynamic Panel */}
        <div className="lg:col-span-3 flex flex-col overflow-hidden gap-2">
          {/* Toggle Tabs */}
          <div className="flex gap-2 shrink-0">
            <button 
              className={`flex-1 p-2 font-bold uppercase text-sm border-2 border-neo-border ${leftPanelMode === 'feed' ? 'bg-neo-text text-white' : 'bg-neo-surface hover:bg-gray-200'}`}
              onClick={() => setLeftPanelMode('feed')}
            >
              Issue Feed
            </button>
            <button 
              className={`flex-1 p-2 font-bold uppercase text-sm border-2 border-neo-border ${leftPanelMode === 'optimizer' ? 'bg-neo-text text-white' : 'bg-neo-surface hover:bg-gray-200'}`}
              onClick={() => setLeftPanelMode('optimizer')}
            >
              Optimizer
            </button>
          </div>

          <div className="flex-1 neo-box bg-neo-surface overflow-hidden">
            {leftPanelMode === 'feed' ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b-4 border-neo-border bg-neo-bg font-black uppercase flex justify-between items-center shrink-0">
                  <span>Live Issue Feed</span>
                  {selectedCluster && (
                    <span className="text-xs bg-neo-accent text-white px-2 py-1 neo-box cursor-pointer" onClick={() => setSelectedCluster(null)}>
                      Clear Selection
                    </span>
                  )}
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`neo-box p-4 cursor-pointer transition-colors ${selectedCluster === String(i) ? 'bg-neo-accent text-white' : 'bg-neo-bg hover:bg-neo-surface'}`}
                      onClick={() => setSelectedCluster(String(i))}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-bold ${selectedCluster === String(i) ? 'text-white' : 'text-neo-danger'}`}>High Priority</span>
                        <span className="text-xs font-bold opacity-50">10m ago</span>
                      </div>
                      <div className="font-black mt-2">Severe Road Damage</div>
                      <div className="text-sm mt-1 opacity-80">Ward 4  12 Reports</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <BudgetOptimizerPanel onSelectProject={setSelectedCluster} />
            )}
          </div>
        </div>

        {/* Center: Leaflet Map / Workspace */}
        <div className="lg:col-span-6 neo-box bg-neo-bg relative overflow-hidden flex flex-col">
          <div className="p-4 border-b-4 border-neo-border bg-neo-surface font-black uppercase z-10 flex justify-between items-center">
            <span>Constituency Map</span>
            <span className="text-xs bg-neo-accent text-white px-2 py-1 neo-box animate-pulse">LIVE</span>
          </div>
          <div className="flex-1 bg-gray-200 relative z-0">
            <ConstituencyMap onClusterSelect={setSelectedCluster} />
          </div>
        </div>

        {/* Right: AI Panel / Ask Jan-Setu */}
        <div className="lg:col-span-3 flex flex-col overflow-hidden">
          <AskJanSetuPanel onSelectCitation={(id, type) => {
            if (type === 'cluster' || type === 'optimization') {
              setSelectedCluster(id);
            }
          }} />
        </div>

      </div>
    </div>
  );
}
