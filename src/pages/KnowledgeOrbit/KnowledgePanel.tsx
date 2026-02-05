/**
 * PHASE 18: KnowledgePanel Component
 * Right-side slide-in panel with topic details
 */

import { motion, AnimatePresence } from 'framer-motion';
import { OrbitNode, getDifficultyLabel } from '@/mocks/knowledgeOrbit';
import { X, BookOpen, Clock, CheckCircle2, Circle, Award, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface KnowledgePanelProps {
  node: OrbitNode | null;
  onClose: () => void;
}

export function KnowledgePanel({ node, onClose }: KnowledgePanelProps) {
  if (!node) return null;

  const progressPercent = Math.round(node.progress * 100);
  const difficultyLabel = getDifficultyLabel(node.difficulty);

  // Get color based on progress
  const getProgressColor = () => {
    if (node.progress < 0.3) return 'text-blue';
    if (node.progress < 0.7) return 'text-primary';
    return 'text-accent';
  };

  // Resource type icons
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'exercise':
        return '✏️';
      case 'quiz':
        return '🎯';
      default:
        return '📚';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-slate-800 border-l border-neon/30 shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-neon/30 p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            <Badge
              className="mb-2 border border-slate-200 dark:border-slate-700 font-black uppercase"
              style={{ backgroundColor: node.color }}
            >
              {node.cluster}
            </Badge>
            <h2 className="text-3xl font-black text-primary uppercase tracking-tight">
              {node.label}
            </h2>
            <p className="text-sm text-text/60 mt-1 uppercase font-bold">
              {node.type === 'topic' ? 'Planet' : 'Moon'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary hover:bg-primary/20 border border-neon/30"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-text/80 leading-relaxed">{node.description}</p>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-accent" />
                <span className="text-xs font-bold text-text/60 uppercase">Difficulty</span>
              </div>
              <p className="text-xl font-black text-accent">{difficultyLabel}</p>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded ${
                      i < node.difficulty ? 'bg-accent' : 'bg-surface-light'
                    }`}
                  />
                ))}
              </div>
            </Card>

            {/* Orbit Speed */}
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue" />
                <span className="text-xs font-bold text-text/60 uppercase">Orbit Speed</span>
              </div>
              <p className="text-xl font-black text-blue">{node.orbitSpeed.toFixed(1)}x</p>
              <p className="text-xs text-text/50 mt-1">Revolution rate</p>
            </Card>
          </div>

          {/* Progress */}
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-bold text-text/80 uppercase">Progress</span>
              </div>
              <span className={`text-2xl font-black ${getProgressColor()}`}>
                {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-3 border border-slate-200 dark:border-slate-700" />
            <p className="text-xs text-text/50 mt-2">
              {progressPercent < 30 && 'Just getting started'}
              {progressPercent >= 30 && progressPercent < 70 && 'Making good progress'}
              {progressPercent >= 70 && 'Almost mastered!'}
            </p>
          </Card>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-black text-primary uppercase mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Resources
            </h3>
            <div className="space-y-3">
              {node.resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded cursor-pointer hover:border-neon transition-colors"
                >
                  <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                  <div className="flex-1">
                    <p className="font-bold text-text">{resource.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border border-slate-200 dark:border-slate-700">
                        {resource.type}
                      </Badge>
                      {resource.duration && (
                        <span className="text-xs text-text/50">{resource.duration}</span>
                      )}
                    </div>
                  </div>
                  {resource.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-text/30" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {node.dependencies.length > 0 && (
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <h4 className="font-bold text-text/80 uppercase mb-2 text-sm">Prerequisites</h4>
              <div className="flex flex-wrap gap-2">
                {node.dependencies.map((depId) => (
                  <Badge
                    key={depId}
                    variant="outline"
                    className="border-2 border-blue text-blue"
                  >
                    {depId.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Children (Sub-topics) */}
          {node.children && node.children.length > 0 && (
            <div>
              <h3 className="text-xl font-black text-accent uppercase mb-4">Orbiting Moons</h3>
              <div className="space-y-3">
                {node.children.map((child) => (
                  <Card key={child.id} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-text">{child.label}</h4>
                      <Badge variant="outline" className="border border-slate-200 dark:border-slate-700">
                        {Math.round(child.progress * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-text/60">{child.description}</p>
                    <Progress value={child.progress * 100} className="h-2 mt-3 border border-slate-200 dark:border-slate-700" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-black border border-slate-200 dark:border-slate-700 shadow-float hover:shadow-float"
          >
            STRENGTHEN THIS TOPIC
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
