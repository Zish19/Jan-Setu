'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function AuditInterface() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl min-h-screen flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b-4 border-neo-border pb-4">
        <h1 className="text-4xl font-black uppercase text-neo-danger">Officer Impact Audit</h1>
        <p className="font-bold opacity-80">Verify completed projects and update the public trust score.</p>
      </div>

      <div className="neo-box bg-neo-surface p-6">
        <h2 className="text-2xl font-black mb-4">Pending Verification: Ward 4 Road Resurfacing</h2>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-mono">
          <div className="p-3 bg-neo-bg border-2 border-neo-border"><strong>Project ID:</strong> PRJ-409</div>
          <div className="p-3 bg-neo-bg border-2 border-neo-border"><strong>Allocated Budget:</strong> ₹45,00,000</div>
          <div className="p-3 bg-neo-bg border-2 border-neo-border"><strong>Contractor:</strong> AB Buildco</div>
          <div className="p-3 bg-neo-bg border-2 border-neo-border text-neo-danger font-bold"><strong>Expected Completion:</strong> Overdue by 4 days</div>
        </div>

        {!isVerified ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label className="font-bold uppercase text-xs mb-1 block">Evidence Link (Photo/Video)</label>
              <input type="url" required placeholder="https://..." className="w-full neo-box p-3 focus:outline-none" />
            </div>
            <div>
              <label className="font-bold uppercase text-xs mb-1 block">Officer Notes</label>
              <textarea required rows={4} placeholder="Verified road quality visually..." className="w-full neo-box p-3 focus:outline-none" />
            </div>
            <Button type="submit" variant="primary" disabled={isVerifying} className="mt-4 text-xl py-4">
              {isVerifying ? 'Running AI Image Corroboration...' : 'Verify & Submit'}
            </Button>
          </form>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-neo-success text-white neo-box flex flex-col items-center justify-center text-center gap-2"
          >
            <div className="text-4xl">✅</div>
            <h3 className="text-2xl font-black uppercase">Verification Successful</h3>
            <p className="font-bold">Project marked as COMPLETED. Public trust score adjusted (+2%).</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
