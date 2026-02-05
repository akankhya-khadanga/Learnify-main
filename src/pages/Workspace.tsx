import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  LayoutGrid,
  LayoutPanelLeft,
  Layout,
  Plus,
  Save,
  FolderOpen,
  Maximize2,
  Minimize2,
  X,
  GripVertical,
  BookOpen,
  Code,
  FileText,
  MessageSquare,
  Video,
  Brain,
  Timer,
  Settings,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/lib/toast-utils';
import { TranslatedText } from '@/components/TranslatedText';
import IDE from '@/components/IDE';
import { MentorChat } from '@/components/MentorChat';

// Panel content types
type PanelType = 'course' | 'notes' | 'ai-chat' | 'code' | 'video' | 'resources' | 'empty';

interface Panel {
  id: string;
  type: PanelType;
  title: string;
  content?: unknown;
  width?: number; // percentage for split layouts
  isMaximized?: boolean;
}

interface WorkspaceConfig {
  id: string;
  name: string;
  layout: 'single' | 'split' | 'grid' | 'triple';
  panels: Panel[];
}

// Preset workspace configurations
const WORKSPACE_PRESETS: WorkspaceConfig[] = [
  {
    id: 'coding-mode',
    name: 'Coding Mode',
    layout: 'triple',
    panels: [
      { id: 'panel-1', type: 'code', title: 'Code Editor', width: 50 },
      { id: 'panel-2', type: 'resources', title: 'Documentation', width: 30 },
      { id: 'panel-3', type: 'ai-chat', title: 'AI Assistant', width: 20 },
    ],
  },
  {
    id: 'study-mode',
    name: 'Study Mode',
    layout: 'split',
    panels: [
      { id: 'panel-1', type: 'course', title: 'Course Content', width: 60 },
      { id: 'panel-2', type: 'notes', title: 'My Notes', width: 40 },
    ],
  },
  {
    id: 'focus-mode',
    name: 'Focus Mode',
    layout: 'single',
    panels: [
      { id: 'panel-1', type: 'course', title: 'Learning Content', width: 100 },
    ],
  },
  {
    id: 'review-mode',
    name: 'Review Mode',
    layout: 'grid',
    panels: [
      { id: 'panel-1', type: 'notes', title: 'My Notes', width: 50 },
      { id: 'panel-2', type: 'resources', title: 'Resources', width: 50 },
      { id: 'panel-3', type: 'ai-chat', title: 'Q&A Helper', width: 50 },
      { id: 'panel-4', type: 'video', title: 'Video Review', width: 50 },
    ],
  },
];

export default function Workspace() {
  const [activeConfig, setActiveConfig] = useState<WorkspaceConfig>(WORKSPACE_PRESETS[1]); // Default to Study Mode
  const [panels, setPanels] = useState<Panel[]>(WORKSPACE_PRESETS[1].panels);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<WorkspaceConfig[]>([]);
  const [resizing, setResizing] = useState<string | null>(null);

  // Load saved workspace configs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workspace_configs');
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load workspace configs:', e);
      }
    }

    // Load last active workspace
    const lastActive = localStorage.getItem('workspace_active');
    if (lastActive) {
      try {
        const config = JSON.parse(lastActive);
        setActiveConfig(config);
        setPanels(config.panels);
      } catch (e) {
        console.error('Failed to load active workspace:', e);
      }
    }
  }, []);

  // Auto-save current workspace every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentConfig = { ...activeConfig, panels };
      localStorage.setItem('workspace_active', JSON.stringify(currentConfig));
    }, 30000);

    return () => clearInterval(interval);
  }, [activeConfig, panels]);

  const handleLoadPreset = (preset: WorkspaceConfig) => {
    setActiveConfig(preset);
    setPanels(preset.panels);
    setShowPresets(false);
    toast.success('Workspace Loaded', `Loaded ${preset.name} configuration`);
  };

  const handleSaveConfig = () => {
    const configName = prompt('Enter a name for this workspace configuration:');
    if (!configName) return;

    const newConfig: WorkspaceConfig = {
      id: `custom-${Date.now()}`,
      name: configName,
      layout: activeConfig.layout,
      panels: panels,
    };

    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    localStorage.setItem('workspace_configs', JSON.stringify(updated));
    toast.success('Workspace Saved', `Saved as "${configName}"`);
  };

  const handleAddPanel = (type: PanelType) => {
    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      type,
      title: getPanelTitle(type),
      width: 100 / (panels.length + 1),
    };

    // Redistribute widths
    const updatedPanels = panels.map(p => ({
      ...p,
      width: 100 / (panels.length + 1),
    }));

    setPanels([...updatedPanels, newPanel]);
  };

  const handleRemovePanel = (panelId: string) => {
    if (panels.length === 1) {
      toast.warning('Cannot Remove', 'Workspace must have at least one panel');
      return;
    }

    const updatedPanels = panels.filter(p => p.id !== panelId);
    // Redistribute widths
    const redistributed = updatedPanels.map(p => ({
      ...p,
      width: 100 / updatedPanels.length,
    }));

    setPanels(redistributed);
  };

  const handleMaximizePanel = (panelId: string) => {
    setPanels(panels.map(p => ({
      ...p,
      isMaximized: p.id === panelId ? !p.isMaximized : false,
    })));
  };

  const getPanelTitle = (type: PanelType): string => {
    const titles: Record<PanelType, string> = {
      course: 'Course Content',
      notes: 'My Notes',
      'ai-chat': 'AI Assistant',
      code: 'Code Editor',
      video: 'Video Player',
      resources: 'Resources',
      empty: 'Empty Panel',
    };
    return titles[type];
  };

  const getPanelIcon = (type: PanelType) => {
    const icons: Record<PanelType, JSX.Element> = {
      course: <BookOpen className="h-4 w-4" />,
      notes: <FileText className="h-4 w-4" />,
      'ai-chat': <Brain className="h-4 w-4" />,
      code: <Code className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      resources: <BookOpen className="h-4 w-4" />,
      empty: <Eye className="h-4 w-4" />,
    };
    return icons[type];
  };

  const renderPanelContent = (panel: Panel) => {
    switch (panel.type) {
      case 'code':
        return (
          <div className="h-full">
            <IDE courseId="react-course" moduleNumber={1} />
          </div>
        );
      
      case 'ai-chat':
        return (
          <div className="h-full overflow-hidden">
            <MentorChat mentor={{ 
              id: 'ai-tutor', 
              name: 'AI Tutor', 
              bio: 'Your personal learning assistant', 
              rating: 5, 
              is_connected: true,
              user_id: 'ai-tutor-001',
              specialization: ['General Learning', 'AI Assistance'],
              students_count: 1000
            }} />
          </div>
        );
      
      case 'notes':
        return (
          <div className="h-full p-4 overflow-auto">
            <textarea
              className="h-full w-full resize-none rounded-lg border-2 border-black bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Take notes here... (Auto-saved every 30 seconds)"
              defaultValue={localStorage.getItem('workspace_notes') || ''}
              onChange={(e) => localStorage.setItem('workspace_notes', e.target.value)}
            />
          </div>
        );
      
      case 'course':
        return (
          <div className="h-full overflow-auto p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Introduction to React Hooks</h3>
                <Badge variant="outline">Module 3 - Lesson 5</Badge>
              </div>
              <Separator />
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-xl font-semibold mb-3">What are React Hooks?</h4>
                <p className="text-muted-foreground mb-4">
                  React Hooks are functions that let you "hook into" React state and lifecycle features from function components.
                  They were introduced in React 16.8 to allow you to use state and other React features without writing a class.
                </p>
                <h4 className="text-xl font-semibold mb-3">Common Hooks</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><code className="text-primary">useState</code> - Manages state in functional components</li>
                  <li><code className="text-primary">useEffect</code> - Performs side effects in components</li>
                  <li><code className="text-primary">useContext</code> - Accesses React context values</li>
                  <li><code className="text-primary">useRef</code> - Creates mutable refs to DOM elements</li>
                </ul>
                <div className="mt-6 p-4 border-4 border-black bg-primary/5 rounded-lg">
                  <h5 className="font-bold mb-2">💡 Pro Tip</h5>
                  <p className="text-sm text-muted-foreground">
                    Always call hooks at the top level of your component, never inside loops, conditions, or nested functions!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="h-full flex items-center justify-center bg-black/5">
            <div className="text-center">
              <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Video player coming soon</p>
              <p className="text-xs text-muted-foreground mt-2">Connect to YouTube, Vimeo, or upload videos</p>
            </div>
          </div>
        );
      
      case 'resources':
        return (
          <div className="h-full overflow-auto p-6">
            <h3 className="text-xl font-bold mb-4">Learning Resources</h3>
            <div className="space-y-3">
              {[
                { title: 'React Official Docs', type: 'Documentation', url: 'react.dev' },
                { title: 'Hooks API Reference', type: 'Guide', url: 'react.dev/reference' },
                { title: 'Common Hook Patterns', type: 'Article', url: 'blog.react.dev' },
                { title: 'React Hooks Cheatsheet', type: 'PDF', url: 'download' },
              ].map((resource, i) => (
                <Card key={i} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground">{resource.url}</p>
                      </div>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select content type to begin</p>
            </div>
          </div>
        );
    }
  };

  const maximizedPanel = panels.find(p => p.isMaximized);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-neon/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(190, 255, 0, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(190, 255, 0, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Toolbar */}
      <div className="relative z-10 border-b-4 border-black bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-black">
                  <TranslatedText text="Workspace" />
                </h1>
              </div>
              <Badge variant="outline" className="font-bold">
                {activeConfig.name}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Layout Presets */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                <TranslatedText text="Presets" />
              </Button>

              {/* Save Config */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveConfig}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Save className="mr-2 h-4 w-4" />
                <TranslatedText text="Save" />
              </Button>

              {/* Add Panel Menu */}
              <div className="relative group">
                <Button
                  variant="default"
                  size="sm"
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <TranslatedText text="Add Panel" />
                </Button>
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-card border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-2 w-48 z-50">
                  {(['course', 'notes', 'ai-chat', 'code', 'video', 'resources'] as PanelType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAddPanel(type)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/10 rounded transition-colors text-left"
                    >
                      {getPanelIcon(type)}
                      <span className="font-semibold text-sm">{getPanelTitle(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Preset Selector */}
          <AnimatePresence>
            {showPresets && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {WORKSPACE_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLoadPreset(preset)}
                      className={`p-4 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left ${
                        activeConfig.id === preset.id ? 'bg-primary/20' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-bold">{preset.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {preset.panels.length} panel{preset.panels.length > 1 ? 's' : ''} • {preset.layout} layout
                      </p>
                    </motion.button>
                  ))}

                  {/* Saved Custom Configs */}
                  {savedConfigs.map((config) => (
                    <motion.button
                      key={config.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLoadPreset(config)}
                      className="p-4 border-4 border-black rounded-lg bg-accent/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-5 w-5 text-accent" />
                        <h3 className="font-bold">{config.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Custom workspace</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Workspace Panels */}
      <div className={`relative z-10 ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-120px)]'}`}>
        <div className="container mx-auto px-4 py-4 h-full">
          {maximizedPanel ? (
            // Maximized single panel view
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-full"
            >
              <Card className="h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between border-b-4 border-black bg-primary/5 px-4 py-2">
                  <div className="flex items-center gap-2">
                    {getPanelIcon(maximizedPanel.type)}
                    <h3 className="font-bold">{maximizedPanel.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMaximizePanel(maximizedPanel.id)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-[calc(100%-56px)]">
                  {renderPanelContent(maximizedPanel)}
                </div>
              </Card>
            </motion.div>
          ) : (
            // Multi-panel layout
            <div className={`h-full flex gap-4 ${activeConfig.layout === 'grid' ? 'flex-wrap' : ''}`}>
              {panels.map((panel, index) => (
                <motion.div
                  key={panel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    ${activeConfig.layout === 'grid' ? 'w-[calc(50%-8px)] h-[calc(50%-8px)]' : 'h-full'}
                  `}
                  style={activeConfig.layout !== 'grid' ? { width: `${panel.width}%` } : {}}
                >
                  <Card className="h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between border-b-4 border-black bg-primary/5 px-4 py-2">
                      <div className="flex items-center gap-2">
                        {getPanelIcon(panel.type)}
                        <h3 className="font-bold text-sm">{panel.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMaximizePanel(panel.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePanel(panel.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-hidden">
                      {renderPanelContent(panel)}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
