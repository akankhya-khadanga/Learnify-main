import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { useWhiteboardSession } from '@/hooks/useWhiteboardSession';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Image as ImageIcon,
  Download,
  Trash2,
  Upload,
  X,
  Box,
  Camera,
  Undo,
  AlertCircle,
} from 'lucide-react';
import {
  MOCK_VR_COLLABORATORS,
  simulateCollaboratorAction,
  generateCursorPosition,
  type WhiteboardStroke,
  type VRCollaborator,
} from '@/mocks/vrCollaborators';

interface WhiteboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onModelUpload: (fileName: string, fileType: 'glb' | 'obj') => void;
  roomId: string;
  roomName: string;
}

type Tool = 'draw' | 'erase' | 'rectangle' | 'circle';

interface CollaboratorCursor {
  userId: string;
  name: string;
  color: string;
  position: { x: number; y: number };
}

export function WhiteboardPanel({
  isOpen,
  onClose,
  onModelUpload,
  roomId,
  roomName,
}: WhiteboardPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [collaboratorCursors, setCollaboratorCursors] = useState<
    CollaboratorCursor[]
  >([]);
  const { toast } = useToast();

  // Use session hook for persistence
  const {
    strokes,
    isLoaded,
    addStroke,
    clearStrokes,
    undoLastStroke,
  } = useWhiteboardSession(roomId);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // Drawing state
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentPoints, setCurrentPoints] = useState<
    { x: number; y: number }[]
  >([]);

  // Simulate collaborator activity
  useEffect(() => {
    if (!isOpen || !isLoaded) return;

    const interval = setInterval(() => {
      const newStroke = simulateCollaboratorAction();
      addStroke(newStroke);

      // Update collaborator cursors
      const activeCollaborators = MOCK_VR_COLLABORATORS.filter(
        (c) => c.isOnline
      );
      setCollaboratorCursors(
        activeCollaborators.map((c) => ({
          userId: c.id,
          name: c.name,
          color: c.color,
          position: generateCursorPosition(),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, isLoaded, addStroke]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.tool === 'erase' ? 20 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'draw' || stroke.tool === 'erase') {
        ctx.beginPath();
        stroke.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (stroke.tool === 'rectangle' && stroke.points.length === 2) {
        const [start, end] = stroke.points;
        ctx.strokeRect(
          start.x,
          start.y,
          end.x - start.x,
          end.y - start.y
        );
      } else if (stroke.tool === 'circle' && stroke.points.length === 2) {
        const [start, end] = stroke.points;
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw current stroke preview
    if (currentPoints.length > 0) {
      ctx.strokeStyle = '#C27BA0';
      ctx.lineWidth = currentTool === 'erase' ? 20 : 3;

      if (currentTool === 'draw' || currentTool === 'erase') {
        ctx.beginPath();
        currentPoints.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (
        (currentTool === 'rectangle' || currentTool === 'circle') &&
        startPos &&
        currentPoints.length > 0
      ) {
        const currentPos = currentPoints[currentPoints.length - 1];
        if (currentTool === 'rectangle') {
          ctx.strokeRect(
            startPos.x,
            startPos.y,
            currentPos.x - startPos.x,
            currentPos.y - startPos.y
          );
        } else {
          const radius = Math.sqrt(
            Math.pow(currentPos.x - startPos.x, 2) +
              Math.pow(currentPos.y - startPos.y, 2)
          );
          ctx.beginPath();
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  }, [strokes, currentPoints, currentTool, startPos]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'draw' || currentTool === 'erase') {
      setCurrentPoints((prev) => [...prev, { x, y }]);
    } else {
      setCurrentPoints([{ x, y }]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentPoints.length > 0 && startPos) {
      const newStroke: WhiteboardStroke = {
        id: `stroke-${Date.now()}`,
        userId: 'current-user',
        userName: 'You',
        tool: currentTool,
        color: '#C27BA0',
        points:
          currentTool === 'draw' || currentTool === 'erase'
            ? currentPoints
            : [startPos, currentPoints[currentPoints.length - 1]],
        timestamp: Date.now(),
      };

      addStroke(newStroke);
    }

    setCurrentPoints([]);
    setStartPos(null);
  };

  const handleClear = () => {
    clearStrokes();
    toast({
      title: 'Whiteboard cleared',
      description: 'All drawings have been removed.',
    });
  };

  const handleUndo = () => {
    undoLastStroke();
    toast({
      title: 'Stroke removed',
      description: 'Last drawing action has been undone.',
    });
  };

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.href = dataUrl;
      link.download = `INTELLI-LEARN-whiteboard-${roomName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
      link.click();

      toast({
        title: 'Snapshot exported!',
        description: 'Your whiteboard has been saved as a PNG file.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export whiteboard snapshot.',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleModelUpload = () => {
    modelInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({
      title: 'Image uploaded!',
      description: `${file.name} has been added to the whiteboard.`,
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.endsWith('.glb')
      ? 'glb'
      : file.name.endsWith('.obj')
      ? 'obj'
      : null;

    if (!fileType) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a .glb or .obj file.',
        variant: 'destructive',
      });
      return;
    }

    onModelUpload(file.name, fileType);
    toast({
      title: '3D model uploaded!',
      description: `${file.name} is now visible in the VR space.`,
    });
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'draw', icon: <Pen className="h-4 w-4" />, label: 'Draw' },
    { id: 'erase', icon: <Eraser className="h-4 w-4" />, label: 'Erase' },
    {
      id: 'rectangle',
      icon: <Square className="h-4 w-4" />,
      label: 'Rectangle',
    },
    { id: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="w-[800px] max-h-[600px] border-4 border-black shadow-pink-brutal bg-obsidian overflow-hidden">
          <CardHeader className="pb-3 border-b-4 border-black bg-gradient-to-br from-pink/20 to-transparent flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black uppercase text-pink flex items-center gap-2">
              <Pen className="h-5 w-5" />
              <TranslatedText text="Collaborative Whiteboard" />
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-pink/20"
              aria-label="Close whiteboard"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </CardHeader>

          <CardContent className="p-4">
            {/* Canvas */}
            <div className="relative mb-4 border-4 border-black rounded-lg overflow-hidden bg-white">
              {!isLoaded ? (
                <div className="w-[750px] h-[400px] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink border-t-transparent mx-auto mb-3" />
                    <p className="text-sm font-bold">Loading whiteboard...</p>
                  </div>
                </div>
              ) : strokes.length === 0 && currentPoints.length === 0 ? (
                <div className="absolute inset-0 w-[750px] h-[400px] flex items-center justify-center pointer-events-none z-10">
                  <div className="text-center p-6">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-600 mb-2">
                      <TranslatedText text="Empty Canvas" />
                    </p>
                    <p className="text-sm text-gray-500">
                      <TranslatedText text="Click a tool to begin creating your first whiteboard!" />
                    </p>
                  </div>
                </div>
              ) : null}
              
              <canvas
                ref={canvasRef}
                width={750}
                height={400}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="cursor-crosshair"
                aria-label="Drawing canvas"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'z' && e.ctrlKey) {
                    e.preventDefault();
                    handleUndo();
                  }
                }}
              />

              {/* Collaborator Cursors */}
              {collaboratorCursors.map((cursor) => (
                <motion.div
                  key={cursor.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: cursor.position.x, y: cursor.position.y }}
                  transition={{ duration: 0.3 }}
                  className="absolute pointer-events-none"
                  style={{ left: 0, top: 0 }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: cursor.color }}
                  />
                  <div className="mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded font-bold whitespace-nowrap">
                    {cursor.name}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Drawing Tools */}
              <div className="flex items-center gap-1 p-1 bg-darknavy border-4 border-black rounded-lg">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={currentTool === tool.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentTool(tool.id)}
                    className={`${
                      currentTool === tool.id
                        ? 'bg-pink hover:bg-pink/90 text-white'
                        : 'hover:bg-pink/20 text-gray-300'
                    }`}
                    aria-label={tool.label}
                    title={tool.label}
                  >
                    {tool.icon}
                  </Button>
                ))}
              </div>

              {/* Upload Tools */}
              <div className="flex items-center gap-1 p-1 bg-darknavy border-4 border-black rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImageUpload}
                  className="hover:bg-pink/20 text-gray-300"
                  aria-label="Upload image"
                  title="Upload Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleModelUpload}
                  className="hover:bg-pink/20 text-gray-300"
                  aria-label="Upload 3D model"
                  title="Upload 3D Model (.glb, .obj)"
                >
                  <Box className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Tools */}
              <div className="flex items-center gap-1 p-1 bg-darknavy border-4 border-black rounded-lg ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="hover:bg-gold/20 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Undo last stroke (Ctrl+Z)"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSnapshot}
                  disabled={strokes.length === 0}
                  className="hover:bg-blue/20 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Export snapshot as PNG"
                  title="Save as Image"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={strokes.length === 0}
                  className="hover:bg-red-500/20 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Clear whiteboard"
                  title="Clear All"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Hidden file inputs */}
              <Input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Input
                ref={modelInputRef}
                type="file"
                accept=".glb,.obj"
                onChange={handleModelChange}
                className="hidden"
              />
            </div>

            {/* Active Collaborators */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <span className="font-bold uppercase">
                <TranslatedText text="Active" />:
              </span>
              {MOCK_VR_COLLABORATORS.filter((c) => c.isOnline).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 px-2 py-1 bg-darknavy border-2 border-black rounded"
                >
                  <span>{user.avatar}</span>
                  <span className="text-white font-bold">{user.name}</span>
                </div>
              ))}
            </div>

            {/* Session Info */}
            {isLoaded && strokes.length > 0 && (
              <div className="mt-2 p-2 bg-blue/10 border-2 border-blue/30 rounded text-xs text-gray-300">
                <span className="font-bold text-blue">
                  {strokes.length} stroke{strokes.length !== 1 ? 's' : ''}
                </span>{' '}
                saved • Auto-saved to session • Press{' '}
                <kbd className="px-1 py-0.5 bg-black/50 border border-gray-600 rounded text-white font-mono">
                  Ctrl+Z
                </kbd>{' '}
                to undo
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
