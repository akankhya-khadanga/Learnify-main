/**
 * PHASE 18: Knowledge Orbit System — Main Page
 * Galaxy Graph UI with interactive 3D visualization
 */

import { useState } from 'react';
import { GalaxyCanvas } from './GalaxyCanvas';
import { KnowledgePanel } from './KnowledgePanel';
import { GalaxyLegend } from './GalaxyLegend';
import { OrbitNode } from '@/mocks/knowledgeOrbit';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function KnowledgeOrbit() {
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);
  const navigate = useNavigate();

  const handleNodeClick = (node: OrbitNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 bg-white dark:bg-slate-800/80 backdrop-blur-sm border-b border-neon/30 shadow-float"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="border border-neon text-primary hover:bg-primary hover:text-black"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="h-7 w-7" />
                Knowledge Orbit
              </h1>
              <p className="text-sm text-text/60 uppercase font-bold">
                Explore Your Learning Universe
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">3</p>
              <p className="text-xs text-text/60 uppercase font-bold">Galaxies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-accent">11</p>
              <p className="text-xs text-text/60 uppercase font-bold">Planets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-blue">7</p>
              <p className="text-xs text-text/60 uppercase font-bold">Moons</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="flex h-screen pt-20">
        {/* Galaxy Canvas */}
        <div className={`flex-1 transition-all duration-300 ${selectedNode ? 'md:mr-[500px]' : ''}`}>
          <GalaxyCanvas onNodeClick={handleNodeClick} selectedNode={selectedNode} />
          <GalaxyLegend />
        </div>

        {/* Knowledge Panel */}
        {selectedNode && <KnowledgePanel node={selectedNode} onClose={handleClosePanel} />}
      </div>

      {/* Mobile Fallback Message */}
      <div className="md:hidden absolute inset-0 bg-white dark:bg-slate-800/95 backdrop-blur-sm flex items-center justify-center z-30 p-6">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary uppercase mb-2">
            Desktop View Required
          </h2>
          <p className="text-text/60 mb-6">
            The Galaxy Graph visualization requires a larger screen for the best experience.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-black border-4 border-black font-black"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
