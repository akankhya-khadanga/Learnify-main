import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilityStore, TextScale, ColorblindMode } from '@/store/accessibilityStore';
import { Accessibility, Type, Subtitles, Eye, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export const AccessibilityFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    dyslexiaFont,
    setDyslexiaFont,
    captionsEnabled,
    setCaptionsEnabled,
    colorblindMode,
    setColorblindMode,
    textScale,
    setTextScale,
    highContrast,
    setHighContrast,
  } = useAccessibilityStore();

  const textScales: TextScale[] = [100, 125, 150];

  return (
    <>
      {/* FAB Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#C9B458] hover:bg-[#B8A347] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Accessibility className="w-6 h-6 text-black" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Quick Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-24 right-6 z-40"
            >
              <Card className="w-80 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#1a1a1a] p-4">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                  <Accessibility className="w-5 h-5 text-[#C9B458]" />
                  Quick Accessibility
                </h3>

                <div className="space-y-4">
                  {/* Dyslexia Font */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#C27BA0]" />
                      <span className="text-sm font-bold text-white">Dyslexia Font</span>
                    </div>
                    <Switch
                      checked={dyslexiaFont}
                      onCheckedChange={setDyslexiaFont}
                      className="data-[state=checked]:bg-[#C9B458]"
                    />
                  </div>

                  {/* Captions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Subtitles className="w-4 h-4 text-[#6DAEDB]" />
                      <span className="text-sm font-bold text-white">Live Captions</span>
                    </div>
                    <Switch
                      checked={captionsEnabled}
                      onCheckedChange={setCaptionsEnabled}
                      className="data-[state=checked]:bg-[#C9B458]"
                    />
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-white" />
                      <span className="text-sm font-bold text-white">High Contrast</span>
                    </div>
                    <Switch
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                      className="data-[state=checked]:bg-[#C9B458]"
                    />
                  </div>

                  {/* Text Scale */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="w-4 h-4 text-[#C27BA0]" />
                      <span className="text-sm font-bold text-white">Text Size</span>
                    </div>
                    <div className="flex gap-2">
                      {textScales.map((scale) => (
                        <Button
                          key={scale}
                          variant={textScale === scale ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTextScale(scale)}
                          className={`flex-1 border-2 border-black font-bold ${
                            textScale === scale
                              ? 'bg-[#C9B458] text-black hover:bg-[#B8A347] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {scale}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Colorblind Mode */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-[#6DAEDB]" />
                      <span className="text-sm font-bold text-white">Colorblind</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { mode: 'none', label: 'None' },
                        { mode: 'protanopia', label: 'Protanopia' },
                        { mode: 'deuteranopia', label: 'Deuteranopia' },
                        { mode: 'tritanopia', label: 'Tritanopia' },
                      ].map(({ mode, label }) => (
                        <Button
                          key={mode}
                          variant={colorblindMode === mode ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setColorblindMode(mode as ColorblindMode)}
                          className={`border-2 border-black text-xs font-bold ${
                            colorblindMode === mode
                              ? 'bg-[#C9B458] text-black hover:bg-[#B8A347] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t-2 border-white/20">
                  <p className="text-xs text-white/60 text-center">
                    Open Settings for more options
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
