/**
 * PHASE 18: GalaxyLegend Component
 * Floating legend explaining visual encoding
 */

import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

export function GalaxyLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-6 z-10"
    >
      <Card className="border border-neon bg-white dark:bg-slate-800/90 backdrop-blur-sm shadow-float p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-black text-primary uppercase text-sm">Galaxy Guide</h3>
        </div>

        <div className="space-y-3 text-xs">
          {/* Node Types */}
          <div>
            <p className="font-bold text-text/80 mb-2 uppercase">Node Types</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-black" />
                <span className="text-text/60">Cluster Center (Subject)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent border-2 border-black" />
                <span className="text-text/60">Planet (Topic)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue border-2 border-black" />
                <span className="text-text/60">Moon (Sub-topic)</span>
              </div>
            </div>
          </div>

          {/* Visual Encoding */}
          <div className="border-t-2 border-text/20 pt-3">
            <p className="font-bold text-text/80 mb-2 uppercase">Visual Encoding</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-primary">✦</span>
                <span className="text-text/60">Brightness = Progress Level</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent">●</span>
                <span className="text-text/60">Size = Difficulty</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue">↻</span>
                <span className="text-text/60">Speed = Familiarity</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">⟳</span>
                <span className="text-text/60">Distance = Complexity</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-t-2 border-text/20 pt-3">
            <p className="font-bold text-text/80 mb-2 uppercase">Controls</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-primary">🖱️</span>
                <span className="text-text/60">Drag to rotate galaxy</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent">🔍</span>
                <span className="text-text/60">Scroll to zoom in/out</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue">👆</span>
                <span className="text-text/60">Click node for details</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
