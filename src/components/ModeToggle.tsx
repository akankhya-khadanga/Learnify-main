import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Globe, AlertTriangle } from 'lucide-react';

interface ModeToggleProps {
  mode: 'verified' | 'general';
  onModeChange: (mode: 'verified' | 'general') => void;
  disabled?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange, disabled }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<'verified' | 'general'>('general');

  const handleModeClick = (newMode: 'verified' | 'general') => {
    if (newMode === mode || disabled) return;
    
    // Show warning when switching from verified to general
    if (mode === 'verified' && newMode === 'general') {
      setPendingMode(newMode);
      setShowWarning(true);
    } else {
      onModeChange(newMode);
    }
  };

  const confirmModeChange = () => {
    onModeChange(pendingMode);
    setShowWarning(false);
  };

  return (
    <>
      <div className="inline-flex border-4 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        <motion.button
          onClick={() => handleModeClick('verified')}
          disabled={disabled}
          className={`px-6 py-3 font-black text-sm transition-all flex items-center gap-2 relative ${
            mode === 'verified'
              ? 'bg-green-500 text-white'
              : 'bg-white text-black hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          <Shield className="w-4 h-4" />
          Verified Mode
          {mode === 'verified' && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 bg-green-500 -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>

        <div className="w-1 bg-black" />

        <motion.button
          onClick={() => handleModeClick('general')}
          disabled={disabled}
          className={`px-6 py-3 font-black text-sm transition-all flex items-center gap-2 relative ${
            mode === 'general'
              ? 'bg-[#6DAEDB] text-white'
              : 'bg-white text-black hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          <Globe className="w-4 h-4" />
          General Mode
          {mode === 'general' && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 bg-[#6DAEDB] -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      </div>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Switch to General Mode?
            </DialogTitle>
            <DialogDescription className="text-base">
              <div className="space-y-3 mt-4">
                <p className="font-bold text-black">
                  You're about to switch from Verified Mode to General Mode.
                </p>
                <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3">
                  <p className="text-sm text-black">
                    <strong>Warning:</strong> General Mode uses broader knowledge sources and may include information not verified by your instructor. Responses might not align with your course materials.
                  </p>
                </div>
                <ul className="text-sm space-y-2 text-black/80">
                  <li>• Verified Mode: Only instructor-approved sources</li>
                  <li>• General Mode: All available knowledge</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWarning(false)}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmModeChange}
              className="bg-[#6DAEDB] hover:bg-[#5A9DCB] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Switch to General
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
