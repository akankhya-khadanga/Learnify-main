import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as fabricJS from 'fabric';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Save } from 'lucide-react';
import { AnnotationToolbar } from './AnnotationToolbar.tsx';
import { pdfService, PDFAnnotation } from '@/services/pdfService';
import { useToast } from '@/hooks/use-toast';
// Note: CSS imports for react-pdf removed as they're not available in all versions
// The component will still work without them

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFAnnotatorProps {
    documentId: string;
    fileUrl: string;
    userId: string;
    onClose?: () => void;
}

type AnnotationTool = 'select' | 'highlight' | 'draw' | 'text' | 'eraser';

export const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({
    documentId,
    fileUrl,
    userId,
    onClose
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
    const [selectedColor, setSelectedColor] = useState<string>('#FFFF00');
    const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
    const [canvases, setCanvases] = useState<Map<number, fabricJS.Canvas>>(new Map());

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Load annotations on mount
    useEffect(() => {
        loadAnnotations();
    }, [documentId]);

    // Initialize fabric canvas for current page
    useEffect(() => {
        if (canvasRef.current && !canvases.has(currentPage)) {
            const canvas = new fabricJS.Canvas(canvasRef.current, {
                isDrawingMode: activeTool === 'draw',
                selection: activeTool === 'select'
            });

            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = selectedColor;
                canvas.freeDrawingBrush.width = 3;
            }

            setCanvases(prev => new Map(prev).set(currentPage, canvas));

            // Load annotations for this page
            loadPageAnnotations(currentPage, canvas);
        }
    }, [currentPage, canvasRef.current]);

    // Update canvas drawing mode when tool changes
    useEffect(() => {
        const canvas = canvases.get(currentPage);
        if (canvas) {
            canvas.isDrawingMode = activeTool === 'draw';
            canvas.selection = activeTool === 'select';

            if (activeTool === 'draw' && canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = selectedColor;
            }
        }
    }, [activeTool, selectedColor, currentPage]);

    const loadAnnotations = async () => {
        try {
            const data = await pdfService.getAnnotations(documentId);
            setAnnotations(data);
        } catch (error) {
            console.error('Error loading annotations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load annotations',
                variant: 'destructive'
            });
        }
    };

    const loadPageAnnotations = async (pageNumber: number, canvas: fabricJS.Canvas) => {
        const pageAnnotations = annotations.filter(a => a.page_number === pageNumber);

        pageAnnotations.forEach(annotation => {
            if (annotation.annotation_type === 'drawing') {
                canvas.loadFromJSON(annotation.annotation_data, () => {
                    canvas.renderAll();
                });
            }
        });
    };

    const saveAnnotations = async () => {
        const canvas = canvases.get(currentPage);
        if (!canvas) return;

        try {
            const canvasData = canvas.toJSON();

            // Delete existing annotations for this page
            await pdfService.deletePageAnnotations(documentId, currentPage);

            // Save new annotation
            if (canvas.getObjects().length > 0) {
                await pdfService.saveAnnotation(
                    documentId,
                    userId,
                    currentPage,
                    'drawing',
                    canvasData,
                    selectedColor
                );
            }

            toast({
                title: 'Success',
                description: 'Annotations saved successfully'
            });

            await loadAnnotations();
        } catch (error) {
            console.error('Error saving annotations:', error);
            toast({
                title: 'Error',
                description: 'Failed to save annotations',
                variant: 'destructive'
            });
        }
    };

    const handleToolChange = (tool: AnnotationTool) => {
        setActiveTool(tool);
    };

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
    };

    const handleUndo = () => {
        const canvas = canvases.get(currentPage);
        if (canvas) {
            const objects = canvas.getObjects();
            if (objects.length > 0) {
                canvas.remove(objects[objects.length - 1]);
                canvas.renderAll();
            }
        }
    };

    const handleClearPage = () => {
        const canvas = canvases.get(currentPage);
        if (canvas) {
            canvas.clear();
            canvas.renderAll();
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const changePage = (offset: number) => {
        setCurrentPage(prevPage => Math.min(Math.max(1, prevPage + offset), numPages));
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Toolbar */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            ← Back
                        </Button>
                        <span className="text-white font-medium">PDF Annotator</span>
                    </div>

                    <AnnotationToolbar
                        activeTool={activeTool}
                        selectedColor={selectedColor}
                        onToolChange={handleToolChange}
                        onColorChange={handleColorChange}
                        onUndo={handleUndo}
                        onClear={handleClearPage}
                    />

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={saveAnnotations}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto bg-gray-800 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-white shadow-2xl" ref={pageRef}>
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex items-center justify-center h-96">
                                    <div className="text-gray-500">Loading PDF...</div>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={currentPage}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </Document>

                        {/* Annotation Canvas Overlay */}
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 pointer-events-auto"
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(-1)}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-white text-sm">
                            Page {currentPage} of {numPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(1)}
                            disabled={currentPage >= numPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleZoomOut}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-white text-sm">{Math.round(scale * 100)}%</span>
                        <Button variant="outline" size="sm" onClick={handleZoomIn}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
