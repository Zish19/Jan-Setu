'use client';

import { motion } from 'framer-motion';

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
  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <KpiCard title="Active Reports" value="1,248" subtitle="+12% this week" />
        <KpiCard title="Open Clusters" value="84" subtitle="Needs MP Review" />
        <KpiCard title="Budget Utilized" value="₹2.4 Cr" subtitle="52% of MPLADS fund" />
        <KpiCard title="Trust Score" value="92%" subtitle="Community Confidence" />
      </div>

      {/* 3 Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Live Feed & Filters */}
        <div className="lg:col-span-3 neo-box bg-neo-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b-4 border-neo-border bg-neo-bg font-black uppercase">
            Live Issue Feed
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="neo-box p-4 bg-neo-bg hover:bg-neo-surface cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-neo-danger">High Priority</span>
                  <span className="text-xs font-bold text-neo-text/50">10m ago</span>
                </div>
                <div className="font-black mt-2">Severe Road Damage</div>
                <div className="text-sm mt-1 text-neo-text/80">Ward 4 • 12 Reports</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Leaflet Map / Workspace */}
        <div className="lg:col-span-6 neo-box bg-neo-bg relative overflow-hidden flex flex-col">
          <div className="p-4 border-b-4 border-neo-border bg-neo-surface font-black uppercase z-10 flex justify-between items-center">
            <span>Constituency Map</span>
            <span className="text-xs bg-neo-accent text-white px-2 py-1 neo-box">LIVE</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-200">
            {/* Map Placeholder */}
            <span className="font-bold text-xl text-neo-text/40">(Leaflet Map Injection Point)</span>
          </div>
        </div>

        {/* Right: AI Panel / Ask Jan-Setu */}
        <div className="lg:col-span-3 neo-box bg-neo-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b-4 border-neo-border bg-neo-accent text-white font-black uppercase">
            Ask Jan-Setu AI
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Chat Placeholder */}
            <div className="space-y-4">
              <div className="neo-box p-3 bg-neo-bg text-sm">
                How can I help optimize your constituency today?
              </div>
            </div>
          </div>
          <div className="p-4 border-t-4 border-neo-border">
            <input 
              type="text" 
              placeholder="Type / to use commands..." 
              className="w-full neo-box p-3 bg-neo-bg font-mono text-sm focus:outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
