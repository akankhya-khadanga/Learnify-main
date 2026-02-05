import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAccessibilityStore, SignLanguage } from '@/store/accessibilityStore';
import { Hand, Loader2, AlertCircle, Play } from 'lucide-react';

interface SignAvatarProps {
  embedded?: boolean;
  onClose?: () => void;
}

export const SignAvatar: React.FC<SignAvatarProps> = ({ embedded = false, onClose }) => {
  const { signLanguage, setSignLanguage } = useAccessibilityStore();
  const [text, setText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    
    // Mock translation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsTranslating(false);
    setIsPlaying(true);
    
    // Auto-stop after 3 seconds (mock animation duration)
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <Card className={`relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${embedded ? '' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hand className="w-6 h-6 text-[#C9B458]" />
          <h3 className="text-xl font-black">Sign Language Avatar</h3>
        </div>
        {!embedded && onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="border-2 border-black">
            Close
          </Button>
        )}
      </div>

      {/* Language Selector */}
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Sign Language</label>
        <Select value={signLanguage} onValueChange={(value) => setSignLanguage(value as SignLanguage)}>
          <SelectTrigger className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-2 border-black">
            <SelectItem value="ASL">ASL (American Sign Language)</SelectItem>
            <SelectItem value="ISL">ISL (Indian Sign Language)</SelectItem>
            <SelectItem value="BSL">BSL (British Sign Language)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Avatar Container */}
      <div className="relative mb-4">
        <motion.div 
          className="w-full h-[400px] bg-gradient-to-br from-[#C9B458]/20 via-[#C27BA0]/20 to-[#6DAEDB]/20 border-4 border-black rounded-lg overflow-hidden flex items-center justify-center"
          animate={{
            background: isPlaying 
              ? ['linear-gradient(135deg, rgba(201,180,88,0.2), rgba(194,123,160,0.2), rgba(109,174,219,0.2))',
                 'linear-gradient(225deg, rgba(194,123,160,0.2), rgba(109,174,219,0.2), rgba(201,180,88,0.2))',
                 'linear-gradient(315deg, rgba(109,174,219,0.2), rgba(201,180,88,0.2), rgba(194,123,160,0.2))']
              : 'linear-gradient(135deg, rgba(201,180,88,0.2), rgba(194,123,160,0.2), rgba(109,174,219,0.2))'
          }}
          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
        >
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center p-6"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            ) : isTranslating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <Loader2 className="w-16 h-16 animate-spin text-[#C9B458] mx-auto mb-4" />
                <p className="text-sm font-bold">Translating to {signLanguage}...</p>
              </motion.div>
            ) : isPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {/* Mock Avatar Animation */}
                <motion.div
                  className="w-48 h-48 mx-auto mb-4 relative"
                  animate={{
                    rotate: [0, -10, 10, -5, 5, 0],
                    scale: [1, 1.05, 0.95, 1.02, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                    <motion.div
                      animate={{
                        y: [0, -10, 0, -5, 0],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Hand className="w-24 h-24 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#C9B458] rounded-full animate-pulse" />
                  <p className="text-sm font-bold">Signing in {signLanguage}...</p>
                  <div className="w-2 h-2 bg-[#C9B458] rounded-full animate-pulse" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-8"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9B458]/30 to-[#C27BA0]/30 border-4 border-black flex items-center justify-center">
                  <Hand className="w-16 h-16 text-black/40" />
                </div>
                <p className="text-sm font-bold text-black/60">Enter text below to see sign language translation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Text to Translate</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[100px] resize-none"
          disabled={isTranslating || isPlaying}
        />
      </div>

      {/* Action Button */}
      <Button
        onClick={handleTranslate}
        disabled={!text.trim() || isTranslating || isPlaying}
        className="w-full bg-[#C9B458] hover:bg-[#B8A347] text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        {isTranslating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Translating...
          </>
        ) : isPlaying ? (
          <>
            <Play className="w-4 h-4 mr-2" />
            Playing...
          </>
        ) : (
          <>
            <Hand className="w-4 h-4 mr-2" />
            Translate to {signLanguage}
          </>
        )}
      </Button>

      {/* Info */}
      <p className="text-xs text-black/60 mt-4 text-center">
        Avatar demonstrates sign language gestures for better accessibility
      </p>
    </Card>
  );
};
