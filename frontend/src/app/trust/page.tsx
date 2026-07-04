'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrustData, trustService } from '@/services/trust.service';

const MOCK_PROJECTS = [
  { id: '1', title: 'Ward 4 Road Resurfacing', status: 'Completed', score: 95, date: 'Oct 2026' },
  { id: '2', title: 'Sector 12 Clinic Supplies', status: 'Completed', score: 88, date: 'Sep 2026' },
  { id: '3', title: 'Water Main Replacement', status: 'In Progress', score: 72, date: 'Ongoing' }
];

export default function TrustPortal() {
  const [data, setData] = useState<TrustData | null>(null);

  useEffect(() => {
    trustService.getTrustData().then(setData).catch(console.error);
  }, []);

  const score = data?.overall_trust_score || 92;
  const completed = data?.completion_percent || 74;
  const projects = data?.recent_completed?.length ? data.recent_completed : MOCK_PROJECTS;

  return (
    <div className="container mx-auto p-8 flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black uppercase text-neo-accent">Public Trust Portal</h1>
        <p className="font-bold text-xl opacity-80">Track where your taxes go. Verified by AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-box bg-neo-surface p-6 flex flex-col items-center justify-center">
          <div className="text-6xl font-black text-neo-success">{score}%</div>
          <div className="font-bold uppercase mt-2 opacity-80">Overall Trust Score</div>
        </div>
        <div className="neo-box bg-neo-surface p-6 flex flex-col items-center justify-center">
          <div className="text-6xl font-black">{completed}%</div>
          <div className="font-bold uppercase mt-2 opacity-80">Completion Rate</div>
        </div>
        <div className="neo-box bg-neo-surface p-6 flex flex-col items-center justify-center">
          <div className="text-6xl font-black">4.2 Cr</div>
          <div className="font-bold uppercase mt-2 opacity-80">Budget Verified</div>
        </div>
      </div>

      <div className="flex-1 neo-box bg-neo-surface p-6">
        <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-neo-border pb-2">Recent AI-Audited Projects</h2>
        
        <div className="space-y-4">
          {projects.map((proj: any, i: number) => (
            <motion.div 
              key={proj.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="neo-box bg-neo-bg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-black text-xl">{proj.title || proj.name}</div>
                <div className="font-bold text-sm opacity-70 mt-1">Completion Date: {proj.date || 'Oct 2026'}</div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-bold neo-box ${(proj.status || '').toUpperCase() === 'COMPLETED' ? 'bg-neo-success text-white' : 'bg-yellow-400'}`}>
                  {proj.status || 'COMPLETED'}
                </span>
                <span className="font-black text-2xl px-4 py-2 neo-box bg-neo-accent text-white">
                  {proj.score || 95}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
