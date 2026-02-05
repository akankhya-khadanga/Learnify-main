import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { Settings, X, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MOCK_CAPTIONS = [
  "Welcome to INTELLI-LEARN, your personalized learning platform.",
  "Navigate through courses using the sidebar menu.",
  "Click on any course card to view detailed content.",
  "Use the AI chatbot for instant help with your studies.",
  "Track your progress on the Analytics dashboard.",
  "Join study groups to collaborate with peers.",
];

export const CaptionBar: React.FC = () => {
  const { captionsEnabled, setCaptionsEnabled } = useAccessibilityStore();
  const [currentCaption, setCurrentCaption] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!captionsEnabled) {
      setDisplayText('');
      return;
    }

    let charIndex = 0;
    const caption = MOCK_CAPTIONS[currentCaption];
    
    const typingInterval = setInterval(() => {
      if (charIndex < caption.length) {
        setDisplayText(caption.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Move to next caption after 3 seconds
        setTimeout(() => {
          setCurrentCaption((prev) => (prev + 1) % MOCK_CAPTIONS.length);
        }, 3000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentCaption, captionsEnabled]);

  const handleOpenSettings = () => {
    navigate('/profile');
    // Scroll to accessibility section after navigation
    setTimeout(() => {
      const element = document.getElementById('accessibility-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <AnimatePresence>
      {captionsEnabled && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto mb-4 px-4 pointer-events-auto">
            <div className="bg-black/90 backdrop-blur-lg border-4 border-white rounded-lg shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Type className="w-5 h-5 text-[#C9B458]" />
                </div>
                
                <div className="flex-1 min-h-[60px]">
                  <p className="text-white font-bold text-lg leading-relaxed">
                    {displayText}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-5 bg-[#C9B458] ml-1"
                    />
                  </p>
                </div>

                <div className="flex-shrink-0 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleOpenSettings}
                    className="text-white hover:bg-white/20 border-2 border-white/30"
                    title="Caption Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCaptionsEnabled(false)}
                    className="text-white hover:bg-white/20 border-2 border-white/30"
                    title="Close Captions"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
