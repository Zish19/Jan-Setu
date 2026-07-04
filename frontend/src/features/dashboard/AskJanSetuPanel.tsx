'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

// Normally this would come from the API client we set up earlier
const MOCK_API_CALL = async (query: string) => {
  return new Promise<{text: string, citations: any[]}>((resolve) => {
    setTimeout(() => {
      resolve({
        text: `Based on the latest optimization run, Ward 4 is the highest priority for intervention due to a severe concentration of reported road damage. \n\nIf the budget increased by ₹50L, we could also fund the pending healthcare requests in Sector 12.`,
        citations: [
          { id: '1', type: 'cluster', title: 'Ward 4 Road Damage' },
          { id: 'OPT-04', type: 'optimization', title: 'Budget Run #04' }
        ]
      });
    }, 1500);
  });
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
}

export default function AskJanSetuPanel({
  onSelectCitation
}: {
  onSelectCitation: (id: string, type: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'How can I help optimize your constituency today? I can analyze clusters, budget constraints, or historical reports.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const { assistantService } = await import('@/services/assistant.service');
      const res = await assistantService.query(userMsg.content);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        citations: res.citations.map((c, i) => ({ id: `cit-${i}`, type: 'citation', title: c }))
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Error analyzing data.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neo-surface">
      <div className="p-4 border-b-4 border-neo-border bg-neo-accent text-white font-black uppercase flex justify-between items-center shrink-0">
        <span>Ask Jan-Setu AI</span>
        {messages.length > 1 && (
          <span 
            className="text-xs border-2 border-white px-2 py-1 cursor-pointer hover:bg-white hover:text-neo-accent"
            onClick={() => setMessages([messages[0]])}
          >
            Clear
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`p-3 max-w-[90%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-neo-text text-white border-none' : 'bg-neo-bg neo-box'}`}>
                {msg.content}
              </div>
              
              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.citations.map(cit => (
                    <button 
                      key={cit.id}
                      onClick={() => onSelectCitation(cit.id, cit.type)}
                      className="text-[10px] font-bold uppercase bg-neo-surface border-2 border-neo-border px-2 py-1 hover:bg-neo-accent hover:text-white transition-colors"
                    >
                      {cit.type}: {cit.title}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-start"
            >
              <div className="p-3 bg-neo-bg neo-box text-neo-text/50 font-bold italic animate-pulse">
                Analyzing constituency data...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t-4 border-neo-border bg-neo-surface shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["Which ward needs funding?", "Why was Park Renovation rejected?"].map(prompt => (
            <button 
              key={prompt}
              onClick={() => setQuery(prompt)}
              className="text-xs whitespace-nowrap px-2 py-1 border-2 border-neo-border hover:bg-neo-bg"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type / to use commands..." 
            className="flex-1 neo-box p-3 bg-neo-bg font-mono text-sm focus:outline-none"
          />
          <Button type="submit" variant="primary" disabled={isTyping || !query.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
