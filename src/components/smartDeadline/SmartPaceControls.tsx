import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PacingMode, PACING_MODES } from '@/mocks/deadlineRadar';
import { Settings, Sparkles, RefreshCw, Zap, Moon } from 'lucide-react';

interface SmartPaceControlsProps {
  onGeneratePlan?: () => void;
}

export const SmartPaceControls: React.FC<SmartPaceControlsProps> = ({ onGeneratePlan }) => {
  const [selectedMode, setSelectedMode] = useState<PacingMode['id']>('balanced');
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onGeneratePlan?.();
    }, 2000);
  };

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'aggressive':
        return <Zap className="w-5 h-5" />;
      case 'relaxed':
        return <Moon className="w-5 h-5" />;
      default:
        return <RefreshCw className="w-5 h-5" />;
    }
  };

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#C27BA0]" />
          Smart Pace Controls
        </h2>
        <p className="text-white/60 text-sm mt-1">Configure your study pacing preferences</p>
      </div>

      {/* Pacing Mode Selector */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-white mb-3">Pacing Mode</label>
        <div className="grid grid-cols-3 gap-3">
          {PACING_MODES.map((mode) => (
            <motion.button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 border-4 border-black transition-all ${
                selectedMode === mode.id
                  ? 'bg-[#C9B458] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-black/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div 
                  className={`text-3xl mb-2 ${
                    selectedMode === mode.id ? 'scale-110' : ''
                  } transition-transform`}
                >
                  {mode.icon}
                </div>
                <h3 
                  className={`font-black text-sm mb-1 ${
                    selectedMode === mode.id ? 'text-black' : 'text-white'
                  }`}
                >
                  {mode.label}
                </h3>
                <p 
                  className={`text-xs ${
                    selectedMode === mode.id ? 'text-black/70' : 'text-white/60'
                  }`}
                >
                  {mode.dailyHoursRange}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Mode description */}
        <motion.div
          key={selectedMode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 border-4 border-black bg-black/30"
        >
          <p className="text-sm text-white/90 font-bold">
            {PACING_MODES.find((m) => m.id === selectedMode)?.description}
          </p>
        </motion.div>
      </div>

      {/* Auto-Adjust Toggle */}
      <div className="mb-6 p-4 border-4 border-black bg-black/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#C9B458]" />
              <h3 className="font-bold text-white">Auto-Adjust with Deadlines</h3>
            </div>
            <p className="text-xs text-white/60">
              Automatically rebalance your schedule when deadlines change
            </p>
          </div>
          <Switch
            checked={autoAdjust}
            onCheckedChange={setAutoAdjust}
            className="ml-4 data-[state=checked]:bg-[#C9B458]"
          />
        </div>
      </div>

      {/* Generate Plan Button */}
      <Button
        onClick={handleGeneratePlan}
        disabled={isGenerating}
        className="w-full border-4 border-black bg-[#C27BA0] hover:bg-[#B16A8F] text-white font-black text-lg py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
            Generating Plan...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Suggested Plan
          </span>
        )}
      </Button>

      {/* Info footer */}
      <div className="mt-4 p-3 border-l-4 border-[#6DAEDB] bg-[#6DAEDB]/10">
        <p className="text-xs text-white/80 leading-relaxed">
          <strong className="text-white">Smart Tip:</strong> Your pacing plan adapts to your study patterns, 
          deadline urgency, and task difficulty. Enable auto-adjust for real-time optimization.
        </p>
      </div>

      {/* Current settings summary */}
      <div className="mt-4 pt-4 border-t-2 border-white/10">
        <h4 className="text-xs font-bold text-white/60 mb-2">CURRENT SETTINGS</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C9B458] rounded-full"></div>
            <span className="text-white/70">
              Mode: <strong className="text-white">{PACING_MODES.find((m) => m.id === selectedMode)?.label}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoAdjust ? 'bg-[#C9B458]' : 'bg-white/30'}`}></div>
            <span className="text-white/70">
              Auto-Adjust: <strong className="text-white">{autoAdjust ? 'On' : 'Off'}</strong>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
