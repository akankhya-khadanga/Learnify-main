import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReflectionJournal() {
  const [reflection, setReflection] = useState('');

  const prompts = [
    'What made me proud today?',
    'What did I learn from a challenge?',
    'How did I grow this week?',
    'What am I grateful for?'
  ];

  const handleSave = () => {
    // Mock save
    setReflection('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-[#C9B458]" />
        <h3 className="text-lg font-black text-white">Progress Reflection</h3>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Take a moment to reflect on your journey. Small wins matter.
      </p>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => setReflection(prompt + ' ')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Text Area */}
      <textarea
        value={reflection}
        onChange={e => setReflection(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#C9B458]/50 mb-4"
        rows={6}
      />

      <Button
        onClick={handleSave}
        disabled={!reflection.trim()}
        className="w-full bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90 text-black font-bold disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Reflection
      </Button>
    </motion.div>
  );
}
