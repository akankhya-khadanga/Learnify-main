import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';
import { Box, X, Download, RotateCw, AlertTriangle, Upload } from 'lucide-react';
import { type VRModel } from '@/mocks/vrCollaborators';

interface ModelViewerProps {
  model: VRModel;
  onClose: () => void;
  onReupload?: () => void;
}

export function ModelViewer({ model, onClose, onReupload }: ModelViewerProps) {
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  const handleRenderError = () => {
    setHasError(true);
    toast({
      title: 'Unsupported model file',
      description: 'This model format could not be rendered. Please try another file.',
      variant: 'destructive',
    });
  };

  const handleRetry = () => {
    setHasError(false);
    if (onReupload) {
      onReupload();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-6 top-24 z-50 w-[350px]"
    >
      <Card className="border border-neon shadow-float bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-primary/20 to-transparent flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-black uppercase text-primary">
              <TranslatedText text="3D Model" />
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/10"
            aria-label="Close model viewer"
          >
            <X className="h-5 w-5 text-white" />
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          {/* Mock 3D Preview */}
          <div className="relative mb-4 aspect-square border border-slate-200 dark:border-slate-700 rounded-lg bg-gradient-to-br from-darknavy to-deepblack overflow-hidden">
            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <p className="text-white font-bold mb-2">
                  <TranslatedText text="Model Render Error" />
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  <TranslatedText text="This model file could not be loaded" />
                </p>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="border border-neon/30 text-primary hover:bg-primary hover:text-black font-bold"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <TranslatedText text="Upload Different File" />
                </Button>
              </div>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                  onError={handleRenderError}
                >
                  <div className="text-9xl" aria-label="3D model preview">
                    {model.preview}
                  </div>
                </motion.div>

                {/* Grid overlay for 3D effect */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#6DAEDB33_1px,transparent_1px),linear-gradient(to_bottom,#6DAEDB33_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

                {/* Rotating icon indicator */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute top-3 right-3 text-blue/50"
                >
                  <RotateCw className="h-5 w-5" />
                </motion.div>
              </>
            )}
          </div>

          {/* Model Info */}
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                <TranslatedText text="File Name" />
              </div>
              <div className="text-sm font-black text-white">{model.name}</div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                  <TranslatedText text="Format" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue/20 border-blue text-blue font-bold uppercase"
                >
                  .{model.fileType}
                </Badge>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                  <TranslatedText text="Uploaded By" />
                </div>
                <div className="text-sm font-bold text-white">
                  {model.uploadedBy}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-2 border-black bg-blue hover:bg-blue/90 text-white font-bold"
                aria-label="Download model"
              >
                <Download className="h-4 w-4 mr-2" />
                <TranslatedText text="Download" />
              </Button>
            </div>

            {/* Info notice */}
            <div className="p-3 bg-blue/10 border-2 border-blue/30 rounded-lg">
              <p className="text-xs text-gray-300">
                <TranslatedText text="This 3D model is visible to all users in the current VR room. Other students can interact with and examine it." />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
