/**
 * Workspace Layout - Main Environment
 * 
 * Full-screen learning workspace with helper sidebar.
 * Redesigned to match dashboard aesthetic.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUnifiedOSStore } from '@/store/unifiedOSStore';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  X,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import type { HelperType, Helper } from '@/types/unifiedOS';

// Helper components (placeholders for now)
import ChatGPTHelper from '@/components/workspace/ChatGPTHelper';
import YouTubeHelper from '@/components/workspace/YouTubeHelper';
import NotebookLLMHelper from '@/components/workspace/NotebookLLMHelper';
import ClassroomHelper from '@/components/workspace/ClassroomHelper';
import InstructorHelper from '@/components/workspace/InstructorHelper';
import NotesHelper from '@/components/workspace/NotesHelper';

const HELPER_ICONS: Record<HelperType, string> = {
  chatgpt: '💬',
  youtube: '📹',
  notebookllm: '📊',
  classroom: '📚',
  instructor: '👨‍🏫',
  notes: '📝',
};

const HELPER_NAMES: Record<HelperType, string> = {
  chatgpt: 'ChatGPT',
  youtube: 'YouTube',
  notebookllm: 'NotebookLLM',
  classroom: 'Classroom',
  instructor: 'Instructor',
  notes: 'Notes',
};

const HELPER_DESCRIPTIONS: Record<HelperType, string> = {
  chatgpt: 'AI assistant for problem-solving and explanations',
  youtube: 'Curated educational videos for your subject',
  notebookllm: 'Generate slides and presentations from notes',
  classroom: 'Structured lessons with examples and assignments',
  instructor: 'Personal AI mentor for strategic guidance',
  notes: 'Organize files, PDFs, and study materials',
};

export default function WorkspaceLayout() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [addHelperOpen, setAddHelperOpen] = useState(false);
  const { toast } = useToast();

  const spaces = useUnifiedOSStore((state) => state.spaces);
  const activeSpace = useUnifiedOSStore((state) => state.active_space);
  const activeHelpers = useUnifiedOSStore((state) => state.active_helpers);
  const activeHelperId = useUnifiedOSStore((state) => state.active_helper_id);
  const sidebarCollapsed = useUnifiedOSStore((state) => state.sidebar_collapsed);
  const focusMode = useUnifiedOSStore((state) => state.focus_mode);
  const setActiveSpace = useUnifiedOSStore((state) => state.setActiveSpace);
  const setActiveHelper = useUnifiedOSStore((state) => state.setActiveHelper);
  const addHelper = useUnifiedOSStore((state) => state.addHelper);
  const removeHelper = useUnifiedOSStore((state) => state.removeHelper);
  const toggleSidebar = useUnifiedOSStore((state) => state.toggleSidebar);
  const setFocusMode = useUnifiedOSStore((state) => state.setFocusMode);

  // Load space on mount
  useEffect(() => {
    if (spaceId) {
      const currentSpaces = useUnifiedOSStore.getState().spaces;
      const space = currentSpaces.find((s) => s.id === spaceId);
      if (space) {
        setActiveSpace(space);
      } else {
        toast({
          title: 'Workspace not found',
          description: 'Redirecting to workspaces list...',
          variant: 'destructive',
        });
        navigate('/unified-os');
      }
    }
  }, [spaceId, setActiveSpace, toast, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + \ = Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }

      // Cmd/Ctrl + Shift + F = Toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [toggleSidebar, setFocusMode, focusMode]);

  if (!activeSpace) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neon border-r-transparent mb-4" />
          <p className="text-white/70 font-bold">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const activeHelper = activeHelpers.find((h) => h.id === activeHelperId);

  const renderHelper = () => {
    if (!activeHelper) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#1A1D23] via-[#252A33] to-[#1A1D23]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-neon/30 mb-6">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white mb-3">
              No Helper Selected
            </h3>
            <p className="text-white/60 font-medium text-base mb-6">
              Choose a helper from the sidebar or add a new one to get started.
            </p>
            <Button
              onClick={() => setAddHelperOpen(true)}
              className="bg-primary text-black hover:bg-primary/90 font-black uppercase"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Helper
            </Button>
          </div>
        </div>
      );
    }

    const HelperComponent = {
      chatgpt: ChatGPTHelper,
      youtube: YouTubeHelper,
      notebookllm: NotebookLLMHelper,
      classroom: ClassroomHelper,
      instructor: InstructorHelper,
      notes: NotesHelper,
    }[activeHelper.type];

    if (!HelperComponent) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#1A1D23] via-[#252A33] to-[#1A1D23]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-black uppercase text-white mb-3">
              Helper Not Found
            </h3>
            <p className="text-white/60 font-medium text-base">
              The helper type "{activeHelper.type}" is not recognized.
            </p>
          </div>
        </div>
      );
    }

    return <HelperComponent helper={activeHelper} space={activeSpace} />;
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ y: -70 }}
            animate={{ y: 0 }}
            exit={{ y: -70 }}
            className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur-xl flex-shrink-0"
          >
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/unified-os')}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="font-black uppercase text-lg text-white">
                      {activeSpace.name}
                    </h2>
                    <p className="text-sm text-white/60 font-medium">
                      {activeSpace.subject} · {activeSpace.progress_percentage}%
                      complete
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                  title="Toggle sidebar (Cmd+\)"
                >
                  {sidebarCollapsed ? (
                    <PanelRightOpen className="h-5 w-5" />
                  ) : (
                    <PanelRightClose className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFocusMode(!focusMode)}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10"
                  title="Focus mode (Cmd+Shift+F)"
                >
                  {focusMode ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Work Area */}
        <div className="flex-1 overflow-hidden">
          {renderHelper()}
        </div>

        {/* Helper Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && !focusMode && (
            <motion.div
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur-xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="border-b border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black uppercase text-lg text-white">Helpers</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddHelperOpen(true)}
                    className="text-primary hover:text-primary hover:bg-primary/10 h-9 w-9"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-sm text-white/60 font-medium">
                  AI-powered tools for {activeSpace.subject}
                </p>
              </div>

              {/* Helper List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {activeHelpers.length === 0 ? (
                    <div className="text-center py-12 text-white/50 text-base font-medium">
                      No helpers yet.
                      <br />
                      Click <span className="text-primary">+</span> to add one.
                    </div>
                  ) : (
                    activeHelpers.map((helper) => (
                      <button
                        key={helper.id}
                        onClick={() => setActiveHelper(helper.id)}
                        className={`group w-full p-4 rounded-xl text-left transition-all border ${activeHelperId === helper.id
                            ? 'bg-primary/10 border-neon shadow-primary-glow'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-white/30 hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {HELPER_ICONS[helper.type]}
                            </span>
                            <span className="font-bold text-base text-white">
                              {helper.name || HELPER_NAMES[helper.type]}
                            </span>
                          </div>

                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHelper(helper.id);
                              if (activeHelperId === helper.id) {
                                setActiveHelper(null);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
                          >
                            <X className="h-4 w-4" />
                          </div>
                        </div>

                        <p className="text-sm text-white/60 font-medium">
                          {HELPER_NAMES[helper.type]}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm text-white/60 font-medium">
                  <kbd className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono">
                    ⌘/Ctrl + \
                  </kbd>{' '}
                  to toggle
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Helper Dialog */}
      <Dialog open={addHelperOpen} onOpenChange={setAddHelperOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-800/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white">Add Helper</DialogTitle>
            <DialogDescription className="text-white/60 font-medium">
              Choose an AI-powered tool to add to your workspace
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {(Object.keys(HELPER_ICONS) as HelperType[]).map((helperType) => {
              const isAdded = activeHelpers.some((h) => h.type === helperType);

              return (
                <button
                  key={helperType}
                  onClick={() => {
                    if (!isAdded) {
                      const newHelper: Helper = {
                        id: `helper-${Date.now()}`,
                        type: helperType,
                        name: HELPER_NAMES[helperType],
                        settings: {},
                      };
                      addHelper(newHelper);
                      setAddHelperOpen(false);
                      toast({
                        title: 'Helper Added',
                        description: `${HELPER_NAMES[helperType]} is now available in your workspace.`,
                      });
                      // Auto-select the newly added helper
                      setTimeout(() => {
                        setActiveHelper(newHelper.id);
                      }, 100);
                    }
                  }}
                  disabled={isAdded}
                  className={`p-5 rounded-xl border text-left transition-all ${isAdded
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-neon/50 hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{HELPER_ICONS[helperType]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black uppercase text-base text-white mb-1.5 flex items-center gap-2">
                        {HELPER_NAMES[helperType]}
                        {isAdded && (
                          <span className="text-xs text-primary">✓ Added</span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 font-medium line-clamp-2">
                        {HELPER_DESCRIPTIONS[helperType]}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Focus Mode Overlay Hint */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm text-white/70 font-medium shadow-accent"
          >
            Press{' '}
            <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-primary">
              ⌘/Ctrl + Shift + F
            </kbd>{' '}
            to exit focus mode
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
